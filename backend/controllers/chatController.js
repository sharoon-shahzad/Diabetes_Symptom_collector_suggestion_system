import { UserPersonalInfo } from '../models/UserPersonalInfo.js';
import { UserMedicalInfo } from '../models/UserMedicalInfo.js';
import { enhanceChatWithRAG } from '../services/ragService.js';

const LM_STUDIO_BASE_URL = process.env.LM_STUDIO_BASE_URL || 'http://127.0.0.1:1234';
const LM_STUDIO_MODEL = process.env.LM_STUDIO_MODEL || 'diabetica-7b';
const MAX_INPUT_CHARS = 1500;
const HISTORY_WINDOW = 5;

const safeText = (val) => (typeof val === 'string' ? val.trim() : '');

const buildProfileSnippet = (personal, medical) => {
  const pieces = [];
  
  // Handle null/undefined personal and medical objects
  if (!personal && !medical) {
    return 'No profile data available';
  }
  
  if (personal?.gender) pieces.push(`Gender: ${personal.gender}`);
  if (personal?.date_of_birth) {
    try {
      const dob = new Date(personal.date_of_birth);
      if (!isNaN(dob.getTime())) {
        const age = Math.max(0, Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
        pieces.push(`Age: ${age}`);
      }
    } catch (e) {
      console.warn('[CHAT] Invalid date_of_birth:', e.message);
    }
  }
  if (personal?.height) pieces.push(`Height: ${personal.height} cm`);
  if (personal?.weight) pieces.push(`Weight: ${personal.weight} kg`);
  if (personal?.activity_level) pieces.push(`Activity: ${personal.activity_level}`);
  if (personal?.dietary_preference) pieces.push(`Diet preference: ${personal.dietary_preference}`);
  if (medical?.diabetes_type) pieces.push(`Diabetes type: ${medical.diabetes_type}`);
  if (medical?.diagnosis_date) {
    try {
      const diagDate = new Date(medical.diagnosis_date);
      if (!isNaN(diagDate.getTime())) {
        pieces.push(`Diagnosis date: ${diagDate.toISOString().slice(0, 10)}`);
      }
    } catch (e) {
      console.warn('[CHAT] Invalid diagnosis_date:', e.message);
    }
  }
  if (medical?.current_medications?.length) {
    const meds = medical.current_medications
      .filter(Boolean)
      .map((m) => [safeText(m.medication_name), safeText(m.dosage), safeText(m.frequency)].filter(Boolean).join(' '))
      .filter(Boolean)
      .join('; ');
    if (meds) pieces.push(`Medications: ${meds}`);
  }
  if (medical?.allergies?.length) {
    const allergies = medical.allergies
      .filter(Boolean)
      .map((a) => [safeText(a.allergen), safeText(a.reaction)].filter(Boolean).join(' - '))
      .filter(Boolean)
      .join('; ');
    if (allergies) pieces.push(`Allergies: ${allergies}`);
  }
  return pieces.join(' | ') || 'No profile data available';
};

const clipHistory = (history) => {
  if (!Array.isArray(history)) return [];
  const trimmed = history
    .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
    .slice(-HISTORY_WINDOW)
    .map((h) => ({ role: h.role, content: h.content.substring(0, MAX_INPUT_CHARS) }));
  return trimmed;
};

export const completeChat = async (req, res) => {
  try {
    console.log('[CHAT] Starting chat completion request');
    const { message, history = [] } = req.body || {};
    const userId = req.user?._id;
    console.log('[CHAT] UserId:', userId, 'Message:', message?.substring(0, 50));

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required.' });
    }
    if (message.length > MAX_INPUT_CHARS) {
      return res.status(400).json({ success: false, error: `Message too long. Limit ${MAX_INPUT_CHARS} characters.` });
    }

    // Fetch profile data (without .lean() to trigger decryption middleware)
    console.log('[CHAT] Fetching profile data for user:', userId);
    const [personal, medical] = await Promise.all([
      UserPersonalInfo.findOne({ user_id: userId }),
      UserMedicalInfo.findOne({ user_id: userId }),
    ]);
    console.log('[CHAT] Profile fetched - personal:', !!personal, 'medical:', !!medical);

    const profileSnippet = buildProfileSnippet(personal, medical);
    const recentHistory = clipHistory(history);

    // **RAG Enhancement**
    const { ragContext, sources } = await enhanceChatWithRAG(message, userId, personal, recentHistory);

    const systemPrompt = `You are Diabuddy, a helpful and empathetic AI assistant for diabetes management. Your goal is to provide safe, accurate, and supportive information.

User Profile Summary:
${profileSnippet}

${ragContext ? `Relevant Information from Health Documents:
${ragContext}` : ''}

CRITICAL SAFETY INSTRUCTIONS:
- ALWAYS prioritize user safety.
- NEVER give medical advice. Do not diagnose, treat, or prescribe.
- ALWAYS use disclaimers like "As an AI, I cannot give medical advice. Please consult your doctor for any health concerns."
- If the user seems distressed or mentions a medical emergency, strongly advise them to contact a healthcare professional or emergency services immediately.
- Be encouraging and supportive, but maintain professional boundaries.
- Keep responses concise and easy to understand.
- If you don't know the answer, say so. Do not make up information.
- If the retrieved information seems contradictory or unclear, state that and recommend consulting a doctor.`;

    const finalHistory = [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: message },
    ];

    console.log('[CHAT] Sending to LM Studio. History length:', finalHistory.length);

    const response = await fetch(`${LM_STUDIO_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: LM_STUDIO_MODEL,
        messages: finalHistory,
        temperature: 0.7,
        max_tokens: 500,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[CHAT] LM Studio API error:', response.status, errorBody);
      throw new Error(`AI service failed with status: ${response.status}`);
    }

    const completion = await response.json();
    const aiMessage = completion.choices[0]?.message?.content?.trim();

    if (!aiMessage) {
      throw new Error('AI service returned an empty response.');
    }

    console.log('[CHAT] Received AI response:', aiMessage.substring(0, 100));

    // Save user message and AI response to a Chat model (implementation needed)
    // For now, just return the response

    return res.status(200).json({
      success: true,
      data: {
        _id: completion.id,
        text: aiMessage,
        createdAt: new Date(),
        sender: 'ai',
        sources: sources, // Include sources from RAG
      },
    });

  } catch (error) {
    console.error('[CHAT] Error in completeChat controller:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while communicating with the AI assistant. Please try again later.',
      details: error.message,
    });
  }
};

export const getChatHistory = async (req, res) => {
  // Placeholder: Implement logic to retrieve chat history from the database
  // For now, returns an empty array
  return res.status(200).json({ success: true, data: [] });
};

export const clearChatHistory = async (req, res) => {
  // Placeholder: Implement logic to delete chat history from the database
  return res.status(200).json({ success: true, message: 'Chat history cleared.' });
};
