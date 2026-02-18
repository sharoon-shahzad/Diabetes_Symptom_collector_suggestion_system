import ExercisePlan from '../models/ExercisePlan.js';
import { User } from '../models/User.js';
import mongoose from 'mongoose';
import regionDiscoveryService from './regionDiscoveryService.js';
import { processQuery } from './queryService.js';
import axios from 'axios';

const UserPersonalInfo = mongoose.model('UserPersonalInfo');
const UserMedicalInfo = mongoose.model('UserMedicalInfo');

class ExercisePlanService {
  // Extract a number from varied AI outputs (e.g., "180-270 kcal", "60 min", 45)
  parseNumber(value) {
    if (typeof value === 'number' && !Number.isNaN(value)) return value;
    if (!value) return null;
    const matches = String(value).match(/[-+]?[0-9]*\.?[0-9]+/g);
    if (!matches || matches.length === 0) return null;
    // If range present, take average of first two numbers; else first number
    if (matches.length >= 2) {
      const a = parseFloat(matches[0]);
      const b = parseFloat(matches[1]);
      if (!Number.isNaN(a) && !Number.isNaN(b)) return Math.round((a + b) / 2);
    }
    const n = parseFloat(matches[0]);
    return Number.isNaN(n) ? null : n;
  }
  async generateExercisePlan(userId, targetDate, goal = 'improve_fitness') {
    console.log(`📋 Generating exercise plan for userId: ${userId}, targetDate: ${targetDate}, goal: ${goal}`);
    
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');
    console.log(`✅ User found: ${user.email}`);

    const personalInfo = await UserPersonalInfo.findOne({ user_id: userId });
    const medicalInfo = await UserMedicalInfo.findOne({ user_id: userId });
    console.log(`📊 PersonalInfo found: ${!!personalInfo}, MedicalInfo found: ${!!medicalInfo}`);
    
    if (!personalInfo) throw new Error('Personal information not found. Please complete your profile first.');

    const dob = new Date(personalInfo.date_of_birth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const md = today.getMonth() - dob.getMonth();
    if (md < 0 || (md === 0 && today.getDate() < dob.getDate())) age--;

    const personal = {
      age,
      gender: personalInfo.gender,
      weight: personalInfo.weight,
      height: personalInfo.height,
      activity_level: personalInfo.activity_level || 'Sedentary',
      goal: goal,
      country: user.country || 'Global'
    };
    const medical = {
      diabetes_type: medicalInfo?.diabetes_type || 'Type 2',
      medications: medicalInfo?.medications || []
    };

    // Normalize to UTC midnight to avoid timezone issues
    const targetDateObj = new Date(targetDate);
    targetDateObj.setUTCHours(0, 0, 0, 0);
    const existing = await ExercisePlan.findOne({ user_id: userId, target_date: targetDateObj });
    if (existing) throw new Error('Exercise plan already exists for this date. View your existing plan or choose a different date.');

    const regionCoverage = await regionDiscoveryService.checkRegionCoverage(personal.country, 'exercise_recommendation');
    let userRegion = personal.country;
    if (!regionCoverage.canGeneratePlan) {
      const fallback = await regionDiscoveryService.getFallbackRegion(userRegion, 'exercise_recommendation');
      if (!fallback) {
        console.warn(`⚠️ No exercise documents for ${userRegion}, using AI's built-in knowledge`);
        userRegion = personal.country; // Keep original region
      } else {
        userRegion = fallback;
      }
    }

    const context = await this.queryRegionalExercise(userRegion);
    if (!context.chunks || context.chunks.length === 0) {
      console.warn(`⚠️ No RAG context for ${userRegion}. Using AI's built-in exercise knowledge.`);
    }

    const prompt = this.buildExercisePrompt(personal, medical, context, targetDateObj);
    let structured;
    try {
      const aiResponse = await this.callLMStudio(prompt);
      structured = this.parseExercisePlan(aiResponse);
      console.log('✅ Exercise plan parsed successfully:', JSON.stringify(structured, null, 2));
    } catch (lmError) {
      console.error('❌ LM Studio error:', lmError.message);
      throw new Error(`LM Studio is required for exercise plan generation. ${lmError.message}`);
    }

    if (!structured || !structured.sessions || structured.sessions.length === 0) {
      console.error('❌ No valid exercise sessions generated');
      throw new Error('Failed to generate exercise plan: No valid sessions created');
    }

    const totals = this.calculateTotals(structured.sessions, personal.weight);
    console.log('✅ Calculated totals:', totals);

    const plan = new ExercisePlan({
      user_id: userId,
      target_date: targetDateObj,
      region: userRegion,
      sessions: structured.sessions,
      totals: totals,
      sources: context.sources,
      tips: structured.tips || [],
      status: 'final',
      generated_at: new Date(),
    });

    await plan.save();
    console.log(`✅ Exercise plan saved with ID: ${plan._id}`);

    return {
      success: true,
      plan: plan,
      region_coverage: regionCoverage,
    };
  }

  async getExercisePlanByDate(userId, targetDate) {
    try {
      const targetDateObj = new Date(targetDate);
      targetDateObj.setUTCHours(0, 0, 0, 0);
      const plan = await ExercisePlan.findOne({
        user_id: userId,
        target_date: targetDateObj,
      });
      return plan;
    } catch (error) {
      console.error('Error fetching exercise plan by date:', error);
      throw error;
    }
  }

  async getExercisePlanById(userId, planId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(String(planId))) return null;
      const plan = await ExercisePlan.findOne({ _id: planId, user_id: userId });
      return plan;
    } catch (error) {
      console.error(`Error fetching exercise plan by ID ${planId}:`, error);
      throw error;
    }
  }

  async getExercisePlanHistory(userId, limit = 10) {
    try {
      const plans = await ExercisePlan.find({ user_id: userId })
        .sort({ target_date: -1 })
        .limit(limit);
      return plans;
    } catch (error) {
      console.error(`Error fetching exercise plan history for user ${userId}:`, error);
      throw error;
    }
  }

  async deleteExercisePlan(userId, planId) {
    try {
      const result = await ExercisePlan.findOneAndDelete({ _id: planId, user_id: userId });
      return result !== null;
    } catch (error) {
      console.error(`Error deleting exercise plan ${planId}:`, error);
      throw error;
    }
  }

  async queryRegionalExercise(region) {
    // Chroma is required - no fallback content
    if (process.env.CHROMA_DISABLED === 'true') {
      throw new Error('ChromaDB is required for exercise plan generation. Please enable ChromaDB.');
    }

    const queries = [
      `${region} physical activity recommendations adults diabetes`,
      `${region} exercise guidelines intensity duration frequency diabetes`,
      `${region} WHO physical activity moderate vigorous minutes per week`,
    ];

    const all = []; const seen = new Set();
    const filter = { country: region, doc_type: 'exercise_recommendation' };
    for (const q of queries) {
      try {
        const response = await processQuery(q, { filter, topK: 5 });
        const results = response.results || [];
        results.forEach(r => { const k = (r.text||'').substring(0,100); if (!seen.has(k)) { seen.add(k); all.push(r); } });
      } catch (e) { 
        console.log(`⚠️ Query failed for "${q}" with filter:`, e.message);
        if (e.message?.includes('Cannot reach ChromaDB')) {
          throw new Error('Cannot reach ChromaDB. Please ensure ChromaDB is running.');
        }
      }
    }
    if (all.length === 0) {
      console.log('⚠️ No results with region filter, trying without filter...');
      for (const q of queries) {
        try {
          const response = await processQuery(q, { filter: { doc_type: 'exercise_recommendation' }, topK: 5 });
          const results = response.results || [];
          results.forEach(r => { const k = (r.text||'').substring(0,100); if (!seen.has(k)) { seen.add(k); all.push(r); } });
        } catch (e) { 
          console.log(`⚠️ Fallback query failed for "${q}":`, e.message);
          if (e.message?.includes('Cannot reach ChromaDB')) {
            throw new Error('Cannot reach ChromaDB. Please ensure ChromaDB is running.');
          }
        }
      }
    }
    if (all.length === 0) {
      console.log('⚠️ No RAG results available');
      throw new Error(`No exercise documents found for region: ${region}. Please upload exercise guidelines or use a different region.`);
    }
    return { chunks: all.map(r => r.text), sources: this.extractSources(all) };
  }

  extractSources(results) {
    const map = new Map();
    results.forEach(r => {
      const t = r.metadata?.title; if (t && !map.has(t)) map.set(t, { title: t, country: r.metadata.country || 'Global', doc_type: r.metadata.doc_type || 'exercise_recommendation' });
    });
    return Array.from(map.values());
  }

  buildExercisePrompt(personal, medical, context, dateObj) {
    const dateStr = dateObj.toISOString().split('T')[0];
    const sys = `You are an exercise physiologist for diabetes. Output ONLY valid JSON with keys: sessions (array of {name,time,type,items:[{exercise,category,intensity,duration_min,mets,estimated_calories,notes,precautions}]}), tips (array). Ensure moderate total 45–90 min/day, include aerobic+resistance+flexibility. Use regional context.`;
    const ctx = context.chunks.slice(0,5).join('\n');
    return `${sys}\nDATE:${dateStr}\nPROFILE: age=${personal.age}, gender=${personal.gender}, weight=${personal.weight}kg, activity=${personal.activity_level}, country=${personal.country}, diabetes=${medical.diabetes_type}, meds=${(medical.medications||[]).join(',')}\nCONTEXT:\n${ctx}`;
  }

  async callLMStudio(prompt) {
    try {
      const lmStudioUrl = process.env.LM_STUDIO_BASE_URL || 'http://127.0.0.1:1234';
      const model = process.env.LM_STUDIO_MODEL || 'waltonfuture-diabetica-7b';
      console.log(`🤖 Calling LM Studio at ${lmStudioUrl} with model: ${model}`);
      const res = await axios.post(`${lmStudioUrl}/v1/chat/completions`, {
        model,
        messages: [
          { role: 'system', content: 'You are a specialized exercise physiologist AI for diabetes patients. Respond with ONLY valid JSON without any markdown or extra text.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      }, { timeout: 90000 });
      console.log('✅ LM Studio response received');
      return res.data.choices[0].message.content;
    } catch (error) {
      console.error('❌ LM Studio call failed:', error.message);
      if (error.code === 'ECONNREFUSED') {
        throw new Error('LM Studio is not running. Please start LM Studio at http://127.0.0.1:1234');
      }
      if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message||'')) {
        throw new Error('LM Studio timed out. Please ensure the model is loaded and responding at http://127.0.0.1:1234');
      }
      throw new Error(`Failed to generate exercise plan: ${error.response?.data?.error || error.message}`);
    }
  }

  parseExercisePlan(aiResponse) {
    console.log(`📝 Parsing AI response (length: ${aiResponse?.length || 0})`);

    const tryParse = (text, label) => {
      try {
        const parsed = JSON.parse(text);
        if (!parsed.sessions || !Array.isArray(parsed.sessions)) throw new Error('Invalid sessions structure');
        parsed.sessions = parsed.sessions.map(s => {
          const sessionType = (s.type || '').toLowerCase();
          const items = (s.items||[])
            .filter(i => i && i.exercise && i.exercise.trim().length > 0) // Filter out invalid items
            .map(i => {
            const duration = this.parseNumber(i.duration_min);
            const mets = this.parseNumber(i.mets);
            const estCals = this.parseNumber(i.estimated_calories);

            // Ensure duration_min has a valid value (required by Mongoose)
            const validDuration = duration != null && duration > 0 ? duration : 15; // Default to 15 min if invalid

            // Ensure intensity is always present for Mongoose validation
            let intensity = i.intensity;
            const category = (i.category || '').toLowerCase();
            if (!intensity) {
              if (category.includes('flex') || sessionType.includes('flex')) {
                intensity = 'Low';
              } else if (category.includes('strength') || category.includes('resistance')) {
                intensity = 'Moderate';
              } else if (category.includes('aerobic') || sessionType.includes('aerobic') || category.includes('cardio')) {
                intensity = 'Moderate';
              } else {
                intensity = 'Moderate';
              }
            }

            // Parse precautions - handle string, array, or complex objects
            let precautions = [];
            if (i.precautions) {
              if (typeof i.precautions === 'string') {
                try {
                  // Try to parse if it's a stringified JSON
                  const parsed = JSON.parse(i.precautions);
                  if (Array.isArray(parsed)) {
                    // Extract text from objects or use strings directly
                    precautions = parsed.map(p => typeof p === 'object' ? (p.text || p.description || JSON.stringify(p)) : String(p));
                  } else {
                    precautions = [String(parsed)];
                  }
                } catch (e) {
                  // Not JSON, treat as a single precaution string
                  precautions = [i.precautions];
                }
              } else if (Array.isArray(i.precautions)) {
                // Extract text from objects or use strings directly
                precautions = i.precautions.map(p => typeof p === 'object' ? (p.text || p.description || JSON.stringify(p)) : String(p));
              } else if (typeof i.precautions === 'object') {
                // Single object, extract text
                precautions = [i.precautions.text || i.precautions.description || JSON.stringify(i.precautions)];
              }
            }

            return {
              exercise: i.exercise.trim(),
              category: i.category || 'General',
              duration_min: validDuration,
              intensity,
              mets,
              estimated_calories: estCals,
              heart_rate_zone: i.heart_rate_zone,
              notes: i.notes,
              precautions: precautions
            };
          });
          const totalDuration = items.reduce((a,i)=>a+(i.duration_min||0),0);
          const totalCalories = items.reduce((a,i)=>a+(i.estimated_calories||0),0);
          return {
            name: s.name,
            time: s.time,
            type: s.type || 'any',
            items,
            total_duration_min: totalDuration,
            total_estimated_calories: totalCalories
          };
        });
        console.log(`✅ Parsed JSON via ${label}`);
        // Normalize tips: accept array of strings or array of {text,details}
        let tips = parsed.tips || [];
        if (Array.isArray(tips)) {
          tips = tips.map(t => {
            if (typeof t === 'string') return t;
            if (t && typeof t === 'object') {
              const text = t.text || '';
              const details = t.details || t.detail || '';
              return details ? `${text} ${details}`.trim() : text;
            }
            return String(t || '').trim();
          }).filter(Boolean);
        } else if (tips && typeof tips === 'object') {
          tips = Object.values(tips).map(v => String(v||'').trim()).filter(Boolean);
        } else {
          tips = [];
        }
        return { sessions: parsed.sessions, tips };
      } catch (err) {
        console.log(`⚠️ ${label} parse failed: ${err.message}`);
        return null;
      }
    };

    // 1) Direct parse
    const direct = tryParse(aiResponse, 'direct');
    if (direct) return direct;

    // 2) Markdown fenced JSON
    const fence = aiResponse && aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
    if (fence) {
      const fenced = tryParse(fence[1], 'markdown fenced');
      if (fenced) return fenced;
    }

    // 3) Best-effort extraction + sanitization (remove trailing commas)
    const extractRawJson = (text) => {
      if (!text) return null;
      const start = text.indexOf('{');
      const end = text.lastIndexOf('}');
      if (start === -1 || end === -1 || end <= start) return null;
      let candidate = text.slice(start, end + 1);
      // Remove trailing commas before closing braces/brackets
      candidate = candidate.replace(/,\s*([}\]])/g, '$1');
      return candidate;
    };

    const extracted = extractRawJson(aiResponse);
    if (extracted) {
      const sanitized = tryParse(extracted, 'sanitized extraction');
      if (sanitized) return sanitized;
    }

    // 4) Fallback: find JSON object with "sessions" key anywhere
    const jsonMatch = aiResponse && aiResponse.match(/\{[\s\S]*"sessions"[\s\S]*\}/);
    if (jsonMatch) {
      const cleaned = jsonMatch[0].replace(/,\s*([}\]])/g, '$1');
      const matched = tryParse(cleaned, 'regex match');
      if (matched) return matched;
    }

    console.error('❌ All parsing attempts failed. Response preview:', aiResponse?.substring(0, 200));
    console.error('Full response for debugging:', aiResponse);
    throw new Error('Unable to parse exercise plan from AI response. LM Studio may not be returning valid JSON. Check logs for full response.');
  }

  calculateTotals(sessions, weightKg) {
    const totals = { duration_total_min: 0, calories_total: 0, sessions_count: sessions?.length||0 };
    sessions?.forEach(s => {
      totals.duration_total_min += s.total_duration_min||0;
      if (s.items) {
        s.items.forEach(i => {
          // If estimated_calories missing, approximate via METs
          if (i.estimated_calories == null && i.mets && i.duration_min && weightKg) {
            // kcal ≈ METs * 3.5 * weight(kg) / 200 * minutes
            const kcalPerMin = (i.mets * 3.5 * weightKg) / 200;
            i.estimated_calories = Math.round(kcalPerMin * i.duration_min);
          }
          totals.calories_total += i.estimated_calories||0;
        });
      }
    });
    return totals;
  }
}

export default new ExercisePlanService();
