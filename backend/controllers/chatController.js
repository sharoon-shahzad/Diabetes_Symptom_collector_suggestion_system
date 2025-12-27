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
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }
    if (message.length > MAX_INPUT_CHARS) {
      return res.status(400).json({ success: false, message: `Message too long. Limit ${MAX_INPUT_CHARS} characters.` });
    }

    // Fetch profile data
    console.log('[CHAT] Fetching profile data for user:', userId);
    const [personal, medical] = await Promise.all([
      UserPersonalInfo.findOne({ user_id: userId }).lean(),
      UserMedicalInfo.findOne({ user_id: userId }).lean(),
    ]);
    console.log('[CHAT] Profile fetched - personal:', !!personal, 'medical:', !!medical);

    const profileSnippet = buildProfileSnippet(personal, medical);
    const recentHistory = clipHistory(history);

    // **RAG Enhancement**
    let ragEnhancement = { systemPrompt: null, sources: [], contextUsed: false, intent: 'none' };
    
    console.log('[CHAT] RAG_ENABLED:', process.env.RAG_ENABLED);
    if (process.env.RAG_ENABLED === 'true') {
      try {
        console.log('[CHAT] RAG enabled, enhancing query...');
        ragEnhancement = await enhanceChatWithRAG(message, personal, medical, recentHistory);
        console.log('[CHAT] RAG enhancement complete - contextUsed:', ragEnhancement.contextUsed);
        console.log(`[CHAT] RAG Enhancement - Intent: ${ragEnhancement.intent}, Context used: ${ragEnhancement.contextUsed}`);
      } catch (ragError) {
        console.error('[CHAT] RAG failed, continuing without RAG:', ragError);
      }
    } else {
      console.log('[CHAT] RAG disabled');
    }

    // Build messages array
    const messages = [];
    
    if (ragEnhancement.systemPrompt) {
      // Use RAG-enhanced prompt
      console.log('[CHAT] Using RAG-enhanced system prompt');
      messages.push({
        role: 'system',
        content: ragEnhancement.systemPrompt
      });
    } else {
      // Fallback to basic prompt
      console.log('[CHAT] Using basic system prompt (no RAG context)');
      messages.push(
        {
          role: 'system',
          content: 'You are a concise, safe diabetes assistant. Use the provided user profile. Be region-aware and avoid unsafe or hallucinated advice.',
        },
        { role: 'system', content: `User profile: ${profileSnippet}` }
      );
    }
    
    messages.push(...recentHistory);
    messages.push({ role: 'user', content: message.trim() });

    const maxTokens = parseInt(process.env.LM_STUDIO_MAX_TOKENS) || 512;
    
    console.log('[CHAT] Sending to LM Studio with max_tokens:', maxTokens);
    console.log('[CHAT] Total messages:', messages.length);
    console.log('[CHAT] LM Studio URL:', `${LM_STUDIO_BASE_URL}/v1/chat/completions`);
    
    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
      console.error('[CHAT] LM Studio request timed out after 50s');
    }, 50000); // 50 second timeout
    
    try {
      const response = await fetch(`${LM_STUDIO_BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: LM_STUDIO_MODEL,
          messages,
          temperature: 0.7,
          max_tokens: maxTokens,
          top_p: 0.95,
          stream: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
    
      console.log('[CHAT] LM Studio response status:', response.status);

      if (!response.ok) {
        const text = await response.text();
        console.error('LM Studio error response:', text);
        return res.status(502).json({ success: false, message: 'LM Studio error', detail: text });
      }

      const data = await response.json();
      console.log('LM Studio response tokens:', data?.usage || 'No usage data');
      console.log('Finish reason:', data?.choices?.[0]?.finish_reason);
      
      const reply = data?.choices?.[0]?.message?.content;
      if (!reply) {
        return res.status(502).json({ success: false, message: 'No reply from model.' });
      }
      
      console.log('[CHAT] Success! Reply length:', reply.length);
      
      // **Return with sources and context info**
      return res.status(200).json({ 
        success: true, 
        reply,
        sources: ragEnhancement.sources || [],
        context_used: ragEnhancement.contextUsed || false,
        intent: ragEnhancement.intent || 'none'
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      if (fetchErr.name === 'AbortError') {
        console.error('[CHAT] LM Studio request aborted (timeout)');
        return res.status(504).json({ 
          success: false, 
          message: 'AI model response timeout. Please try again with a shorter message.' 
        });
      }
      throw fetchErr; // Re-throw to outer catch
    }
  } catch (err) {
    console.error('Chat completion error:', err);
    console.error('Error stack:', err.stack);
    console.error('Error message:', err.message);
    
    // More detailed error response
    const errorMessage = err.response?.data?.error?.message 
        || err.message 
        || 'Chat completion failed.';
    
    return res.status(500).json({ 
      success: false, 
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
