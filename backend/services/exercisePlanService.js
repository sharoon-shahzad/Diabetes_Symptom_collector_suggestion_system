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
  async generateExercisePlan(userId, targetDate) {
    console.log(`📋 Generating exercise plan for userId: ${userId}, targetDate: ${targetDate}`);
    
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
      goal: 'improve_fitness',
      country: user.country || 'Global'
    };
    const medical = {
      diabetes_type: medicalInfo?.diabetes_type || 'Type 2',
      medications: medicalInfo?.medications || []
    };

    const targetDateObj = new Date(targetDate);
    targetDateObj.setHours(0,0,0,0);
    const existing = await ExercisePlan.findOne({ user_id: userId, target_date: targetDateObj });
    if (existing) throw new Error('Exercise plan already exists for this date. View your existing plan or choose a different date.');

    const regionCoverage = await regionDiscoveryService.checkRegionCoverage(personal.country, 'exercise_recommendation');
    let userRegion = personal.country;
    if (!regionCoverage.canGeneratePlan) {
      const fallback = await regionDiscoveryService.getFallbackRegion(userRegion, 'exercise_recommendation');
      if (!fallback) throw new Error(`No exercise documents available for your region (${userRegion}).`);
      userRegion = fallback;
    }

    const context = await this.queryRegionalExercise(userRegion);
    if (!context.chunks || context.chunks.length === 0) throw new Error(`Unable to retrieve exercise guidance for ${userRegion}. Please try again.`);

    const prompt = this.buildExercisePrompt(personal, medical, context, targetDateObj);
    let structured;
    try {
      const aiResponse = await this.callLMStudio(prompt);
      structured = this.parseExercisePlan(aiResponse);
      console.log('✅ Exercise plan parsed successfully:', JSON.stringify(structured, null, 2));
    } catch (lmError) {
      console.warn('⚠️  LM Studio unavailable or timed out, using fallback exercise plan generator');
      console.error('LM Error details:', lmError.message);
      structured = this.generateFallbackExercisePlan(personal, medical);
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
      totals,
      sources: context.sources,
      tips: structured.tips || [],
      status: 'pending',
      generated_at: new Date()
    });
    
    console.log('💾 Saving exercise plan to database...');
    await plan.save();
    console.log('✅ Exercise plan saved successfully');

    return { success: true, plan, region_coverage: regionCoverage };
  } catch (error) {
    console.error('❌ Error in generateExercisePlan:', error.message);
    console.error('Stack trace:', error.stack);
    throw error;
  }

  async queryRegionalExercise(region) {
    // Allow skipping Chroma/RAG entirely if offline
    if (process.env.CHROMA_DISABLED === 'true') {
      console.log('ℹ️ CHROMA_DISABLED=true, using fallback exercise context');
      return this.getFallbackExerciseContext(region);
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
        const results = await processQuery(q, filter, 5);
        results.forEach(r => { const k = (r.text||'').substring(0,100); if (!seen.has(k)) { seen.add(k); all.push(r); } });
      } catch (e) { 
        console.log(`⚠️ Query failed for "${q}" with filter:`, e.message);
        if (e.message?.includes('Cannot reach ChromaDB')) {
          console.log('ℹ️ Chroma unreachable; using fallback exercise context');
          return this.getFallbackExerciseContext(region);
        }
      }
    }
    if (all.length === 0) {
      console.log('⚠️ No results with region filter, trying without filter...');
      for (const q of queries) {
        try {
          const results = await processQuery(q, { doc_type: 'exercise_recommendation' }, 5);
          results.forEach(r => { const k = (r.text||'').substring(0,100); if (!seen.has(k)) { seen.add(k); all.push(r); } });
        } catch (e) { 
          console.log(`⚠️ Fallback query failed for "${q}":`, e.message);
          if (e.message?.includes('Cannot reach ChromaDB')) {
            console.log('ℹ️ Chroma unreachable on fallback; using fallback exercise context');
            return this.getFallbackExerciseContext(region);
          }
        }
      }
    }
    if (all.length === 0) {
      console.log('⚠️ No RAG results available - using fallback exercise context');
      return this.getFallbackExerciseContext(region);
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

  getFallbackExerciseContext(region) {
    return {
      chunks: [
        'WHO Physical Activity: Adults should do at least 150–300 minutes of moderate-intensity, or 75–150 minutes of vigorous-intensity aerobic physical activity weekly, plus muscle-strengthening activities on 2+ days per week.',
        'Diabetes-specific precautions: Monitor glucose before/after exercise; carry fast-acting carbs; avoid exercising during peak insulin action if prone to hypoglycemia; inspect feet; adjust intensity if neuropathy/retinopathy present.',
        'Session structure: Warm-up 5–10 min; main set 30–45 min aerobic (walking, cycling) at moderate intensity; 2–3 sets resistance for major muscle groups; cool-down 5–10 min; flexibility 5–10 min.'
      ],
      sources: [ { title: 'WHO Global Recommendations on Physical Activity', country: 'Global', doc_type: 'exercise_recommendation' } ]
    };
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

            return {
              exercise: i.exercise.trim(),
              category: i.category || 'General',
              duration_min: duration,
              intensity,
              mets,
              estimated_calories: estCals,
              heart_rate_zone: i.heart_rate_zone,
              notes: i.notes,
              precautions: i.precautions||[]
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

  async getExercisePlanByDate(userId, targetDate) {
    const targetDateObj = new Date(targetDate);
    targetDateObj.setHours(0,0,0,0);
    const plan = await ExercisePlan.findOne({ user_id: userId, target_date: targetDateObj });
    return plan;
  }

  async getExercisePlanHistory(userId, limit = 10) {
    const plans = await ExercisePlan.find({ user_id: userId })
      .sort({ target_date: -1 })
      .limit(limit);
    return plans;
  }

  async deleteExercisePlan(userId, planId) {
    const plan = await ExercisePlan.findOne({ _id: planId, user_id: userId });
    if (!plan) throw new Error('Exercise plan not found or unauthorized');
    await ExercisePlan.deleteOne({ _id: planId });
    return { success: true };
  }

  /**
   * Generate fallback exercise plan when LM Studio is unavailable
   * @param {Object} personal - User personal info (age, gender, weight, height, activity_level)
   * @param {Object} medical - User medical info (diabetes_type, medications)
   * @returns {Object} - Basic structured exercise plan
   */
  generateFallbackExercisePlan(personal, medical) {
    const activityMultiplier = {
      'Sedentary': 1.2,
      'Lightly Active': 1.375,
      'Moderately Active': 1.55,
      'Very Active': 1.725,
      'Extremely Active': 1.9
    };

    const multiplier = activityMultiplier[personal.activity_level] || 1.375;
    const bmr = 10 * personal.weight + 6.25 * personal.height - 5 * personal.age + (personal.gender === 'Male' ? 5 : -161);
    const tdee = Math.round(bmr * multiplier);
    const exerciseCalories = Math.round(tdee * 0.25); // Aim for 25% of TDEE from exercise

    const sessions = [
      {
        name: 'Morning Cardio',
        time: '7:00 AM - 8:00 AM',
        type: 'cardio',
        items: [
          {
            exercise: 'Brisk Walking',
            category: 'cardio',
            duration_min: 30,
            intensity: 'Moderate',
            mets: 5,
            estimated_calories: 150,
            heart_rate_zone: '120-140 bpm',
            notes: 'Warm-up with 5 min slow walk, then maintain steady pace',
            precautions: ['Check blood sugar before exercise', 'Stay hydrated', 'Carry water and snacks']
          },
          {
            exercise: 'Light Stretching',
            category: 'flexibility',
            duration_min: 10,
            intensity: 'Low',
            mets: 1,
            estimated_calories: 20,
            heart_rate_zone: 'N/A',
            notes: 'Focus on major muscle groups',
            precautions: []
          }
        ],
        total_duration_min: 40,
        total_estimated_calories: 170
      },
      {
        name: 'Evening Strength Training',
        time: '5:30 PM - 6:30 PM',
        type: 'strength',
        items: [
          {
            exercise: 'Bodyweight Exercises',
            category: 'strength',
            duration_min: 30,
            intensity: 'Moderate',
            mets: 6,
            estimated_calories: 180,
            heart_rate_zone: '100-130 bpm',
            notes: '3 sets of 10 reps: squats, push-ups, lunges',
            precautions: ['Controlled movements', 'Proper form important', 'Monitor for dizziness']
          },
          {
            exercise: 'Cool-down & Relaxation',
            category: 'flexibility',
            duration_min: 15,
            intensity: 'Low',
            mets: 2,
            estimated_calories: 30,
            heart_rate_zone: 'N/A',
            notes: 'Deep breathing and gentle stretching',
            precautions: []
          }
        ],
        total_duration_min: 45,
        total_estimated_calories: 210
      },
      {
        name: 'Afternoon Yoga or Light Activity',
        time: '3:00 PM - 4:00 PM',
        type: 'flexibility',
        items: [
          {
            exercise: 'Gentle Yoga or Walking',
            category: 'flexibility',
            duration_min: 30,
            intensity: 'Low',
            mets: 3,
            estimated_calories: 90,
            heart_rate_zone: '80-110 bpm',
            notes: 'Focus on flexibility and balance to improve mobility',
            precautions: ['Avoid impact exercises', 'Stop if you feel fatigued', 'Keep sessions relaxed']
          }
        ],
        total_duration_min: 30,
        total_estimated_calories: 90
      }
    ];

    return {
      sessions,
      tips: [
        'This is a basic template plan. For personalized recommendations, ensure LM Studio is running.',
        'Always check your blood sugar before, during, and after exercise.',
        'Stay well hydrated throughout the day.',
        'Gradually increase intensity based on your fitness level.',
        'Consult your healthcare provider before starting any new exercise program.'
      ]
    };
  }
}

export default new ExercisePlanService();
