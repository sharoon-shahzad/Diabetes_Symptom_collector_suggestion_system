import LifestyleTip from '../models/LifestyleTip.js';
import { User } from '../models/User.js';
import { UserPersonalInfo } from '../models/UserPersonalInfo.js';
import { UserMedicalInfo } from '../models/UserMedicalInfo.js';
import { processQuery } from './queryService.js';
import axios from 'axios';

// HF Gradio API configuration
const HF_SPACE_URL = process.env.HF_SPACE_URL || 'https://zeeshanasghar02-diabetica-api.hf.space';
const HF_SUBMIT_TIMEOUT_MS = 30000;
const HF_SSE_TIMEOUT_MS = 120000;
const MAX_TOKENS = 2048;
const SYSTEM_PROMPT = `You are a diabetes wellness coach. Generate personalized daily lifestyle tips. Always respond with valid JSON only.`;

class LifestyleTipsService {
  async generateLifestyleTips(userId, targetDate) {
    try {
      console.log(`📋 Generating lifestyle tips for userId: ${userId}, targetDate: ${targetDate}`);
      
      // Get user profile
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');
      console.log(`✅ User found: ${user.email}`);

      // Fetch personal and medical info from separate collections
      const personalInfoDoc = await UserPersonalInfo.findOne({ user_id: userId });
      const medicalInfoDoc = await UserMedicalInfo.findOne({ user_id: userId });
      console.log(`📊 PersonalInfo found: ${!!personalInfoDoc}, MedicalInfo found: ${!!medicalInfoDoc}`);

      const personalInfo = personalInfoDoc ? personalInfoDoc.toObject() : {};
      const medicalInfo = medicalInfoDoc ? medicalInfoDoc.toObject() : {};

      // Check if tips already exist for this date
      // Normalize to UTC midnight to avoid timezone issues
      const targetDateObj = new Date(targetDate);
      targetDateObj.setUTCHours(0, 0, 0, 0);
      
      const existingTips = await LifestyleTip.findOne({
        user_id: userId,
        target_date: targetDateObj,
      });
      if (existingTips) throw new Error('Tips already exist for this date');

      // Get region from user profile or personal info
      const region = user.country || 'Global';

      // Get regional lifestyle guidelines
      console.log(`🌍 Getting regional guidelines for: ${region}`);
      const guidelinesContext = await this.queryRegionalLifestyleGuidelines(region);
      console.log(`✅ Guidelines retrieved: ${guidelinesContext.chunks?.length || 0} chunks`);

      // Build personalized prompt
      const prompt = this.buildLifestylePrompt(personalInfo, medicalInfo, guidelinesContext, targetDate);
      console.log(`📝 Prompt built, length: ${prompt.length}`);

      // Call HF Diabetica API
      console.log(`🤖 Calling HF Diabetica API...`);
      const aiResponse = await this.callDiabetica(prompt);
      console.log(`✅ HF Diabetica response received, length: ${aiResponse.length}`);
      const parsedTips = this.parseLifestyleTips(aiResponse);
      console.log(`✅ Tips parsed successfully:`, JSON.stringify(parsedTips, null, 2));
      const source = 'hf-diabetica';

      // Validate parsed tips
      if (!parsedTips || !parsedTips.categories || parsedTips.categories.length === 0) {
        console.error('❌ No valid tips generated');
        throw new Error('Failed to generate lifestyle tips: No valid categories created');
      }
      console.log(`✅ ${parsedTips.categories.length} categories generated`);

      // Create and save tips
      const tips = new LifestyleTip({
        user_id: userId,
        target_date: targetDateObj,
        region,
        categories: parsedTips.categories,
        personalized_insights: parsedTips.personalized_insights,
        sources: guidelinesContext.sources,
        status: 'active',
        source,
      });

      console.log('💾 Saving lifestyle tips to database...');
      await tips.save();
      console.log('✅ Lifestyle tips saved successfully');

      return {
        success: true,
        message: 'Lifestyle tips generated successfully',
        tips: tips.toObject(),
        region_coverage: {
          region,
          canGenerateTips: true,
          documentCount: guidelinesContext.sources.length,
          coverage: guidelinesContext.sources.length > 0 ? 'Available' : 'Limited',
        },
      };
    } catch (error) {
      console.error('❌ Error in generateLifestyleTips:', error);
      console.error('❌ Error stack:', error.stack);
      throw new Error(`Failed to generate lifestyle tips: ${error.message}`);
    }
  }

  async queryRegionalLifestyleGuidelines(region) {
    try {
      const response = await processQuery(
        `lifestyle tips guidelines and daily habits for diabetes management in ${region}`,
        {
          topK: 10,
          filter: { country: region },
        }
      );

      const results = response.results || [];

      return {
        chunks: results.map(r => r.text || ''),
        sources: results.map(r => ({
          title: r.chunk_metadata?.title || 'Lifestyle Guideline',
          country: r.chunk_metadata?.country || region,
          doc_type: r.chunk_metadata?.doc_type || 'lifestyle_guideline',
        })),
      };
    } catch (error) {
      console.warn('Failed to query regional guidelines, using fallback:', error.message);
      return this.getFallbackLifestyleContext(region);
    }
  }

  buildLifestylePrompt(personalInfo, medicalInfo, guidelinesContext, targetDate) {
    const sleepHours = personalInfo.sleep_hours || 7;
    const activityLevel = personalInfo.activity_level || 'Moderate';
    const smokingStatus = personalInfo.smoking_status || 'Never';
    const alcoholUse = personalInfo.alcohol_use || 'Never';
    const diabetesType = medicalInfo.diabetes_type || 'Type 2';
    const medications = medicalInfo.medications || [];

    const guidelinesText = guidelinesContext.chunks?.slice(0, 5).join('\n') || '';

    const prompt = `You are a diabetes wellness coach. Generate personalized daily lifestyle tips for a patient with these characteristics:

**Patient Profile:**
- Sleep hours per night: ${sleepHours} hours
- Activity level: ${activityLevel}
- Smoking status: ${smokingStatus}
- Alcohol use: ${alcoholUse}
- Diabetes type: ${diabetesType}
- Current medications: ${medications.length > 0 ? medications.map((m) => m.name || m).join(', ') : 'Not specified'}

**Target Date:** ${new Date(targetDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}

**Guidelines Reference:**
${guidelinesText}

Generate personalized lifestyle tips organized into 5-6 categories relevant to diabetes management:
1. Sleep Hygiene (💤) - 3 tips
2. Stress Management (🧘) - 3 tips
3. Nutrition & Hydration (🥗) - 3 tips
4. Physical Activity (🚶) - 3 tips
5. Blood Sugar Monitoring (📊) - 2-3 tips
6. Additional lifestyle factors if relevant (e.g., foot care, medication adherence)

For each tip, provide:
- A clear, actionable title
- A detailed description (2-3 sentences) explaining WHY it matters and HOW to do it
- Priority level (high/medium/low)

Also provide 3-5 personalized insights based on their profile that explain how these tips specifically benefit them.

IMPORTANT: Respond ONLY with valid JSON, no markdown, no code blocks. Use this exact structure:

{
  "categories": [
    {
      "name": "sleep_hygiene",
      "icon": "💤",
      "tips": [
        {"title": "...", "description": "...", "priority": "high"}
      ]
    }
  ],
  "personalized_insights": ["...", "..."]
}`;

    return prompt;
  }

  async callDiabetica(prompt) {
    try {
      console.log(`📡 Submitting to HF Gradio API...`);
      const submitRes = await axios.post(
        `${HF_SPACE_URL}/gradio_api/call/predict`,
        { data: [SYSTEM_PROMPT, prompt, MAX_TOKENS, 0.9] },
        { timeout: HF_SUBMIT_TIMEOUT_MS, headers: { 'Content-Type': 'application/json' } }
      );
      const eventId = submitRes.data?.event_id;
      if (!eventId) throw new Error('No event_id returned from HF Space');
      console.log(`📝 Got event_id: ${eventId}, waiting for SSE response...`);

      const sseRes = await axios.get(
        `${HF_SPACE_URL}/gradio_api/call/predict/${eventId}`,
        { timeout: HF_SSE_TIMEOUT_MS, responseType: 'text' }
      );

      const rawText = sseRes.data || '';
      const lines = rawText.split('\n');
      let responseData = null;

      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('data:')) {
          try {
            responseData = JSON.parse(line.slice(5).trim());
            break;
          } catch { /* continue scanning */ }
        }
      }

      if (!responseData || !Array.isArray(responseData) || !responseData[0]) {
        throw new Error('No valid response data in SSE stream');
      }

      return responseData[0];
    } catch (error) {
      const isTimeout = error.code === 'ECONNABORTED' || String(error.message || '').toLowerCase().includes('timeout');
      if (isTimeout) {
        throw new Error(
          `HF Diabetica API call failed: timeout after ${Math.round(HF_SSE_TIMEOUT_MS / 1000)}s. ` +
            `The model may be loading or under heavy load.`
        );
      }
      throw new Error(`HF Diabetica API call failed: ${error.message}`);
    }
  }

  parseLifestyleTips(aiResponse) {
    console.log(`📝 Parsing lifestyle tips, response length: ${aiResponse?.length || 0}`);
    try {
      // Try to extract JSON from response
      let jsonStr = aiResponse;

      // If response is wrapped in markdown code blocks, extract it
      if (aiResponse.includes('```json')) {
        const match = aiResponse.match(/```json\n?([\s\S]*?)\n?```/);
        if (match) {
          jsonStr = match[1];
          console.log('✅ Extracted JSON from markdown code block');
        }
      } else if (aiResponse.includes('```')) {
        const match = aiResponse.match(/```\n?([\s\S]*?)\n?```/);
        if (match) {
          jsonStr = match[1];
          console.log('✅ Extracted JSON from generic code block');
        }
      }

      const parsed = JSON.parse(jsonStr);
      console.log('✅ JSON parsed successfully');

      // Validate and structure
      const categories = parsed.categories || [];
      const personalized_insights = parsed.personalized_insights || [];
      console.log(`📊 Found ${categories.length} categories, ${personalized_insights.length} insights`);

      return {
        categories: categories.map((cat) => ({
          name: cat.name,
          icon: cat.icon,
          tips: (cat.tips || []).map((tip) => ({
            title: tip.title,
            description: tip.description,
            priority: tip.priority || 'medium',
          })),
        })),
        personalized_insights,
      };
    } catch (error) {
      console.error('❌ Failed to parse lifestyle tips:', error.message);
      console.error('Response preview:', aiResponse?.substring(0, 500));
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  async getLifestyleTipsByDate(userId, date) {
    const targetDateObj = new Date(date);
    targetDateObj.setUTCHours(0, 0, 0, 0);
    
    const tips = await LifestyleTip.findOne({
      user_id: userId,
      target_date: targetDateObj,
    });
    return tips;
  }

  async getLifestyleTipsHistory(userId, limit = 10) {
    const tips = await LifestyleTip.find({ user_id: userId })
      .sort({ target_date: -1 })
      .limit(limit)
      .lean();
    return tips;
  }

  async deleteLifestyleTips(userId, tipsId) {
    const result = await LifestyleTip.deleteOne({ _id: tipsId, user_id: userId });
    if (result.deletedCount === 0) throw new Error('Tips not found');
    return true;
  }

  async getUserStats(userId) {
    const allTips = await LifestyleTip.find({ user_id: userId }).lean();

    if (allTips.length === 0) {
      return {
        totalTips: 0,
        totalCategories: 0,
        streakDays: 0,
      };
    }

    // Calculate total tips and categories
    let totalTips = 0;
    let categoriesSet = new Set();

    allTips.forEach((tip) => {
      tip.categories.forEach((cat) => {
        categoriesSet.add(cat.name);
        totalTips += cat.tips.length;
      });
    });

    // Calculate streak
    let streakDays = 0;
    const sortedDates = allTips.map((t) => new Date(t.target_date)).sort((a, b) => b - a);

    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i]);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);

      if (
        currentDate.toDateString() === expectedDate.toDateString() ||
        (i === 0 && currentDate.toDateString() === new Date().toDateString())
      ) {
        streakDays++;
      } else {
        break;
      }
    }

    return {
      totalTips,
      totalCategories: categoriesSet.size,
      streakDays,
    };
  }

  getFallbackLifestyleContext(region) {
    // Fallback tips if ChromaDB is unavailable
    return {
      chunks: [
        'Daily lifestyle habits are crucial for diabetes management. Maintain consistent sleep schedule, manage stress through mindfulness, stay hydrated, monitor blood sugar regularly, take medications as prescribed, inspect feet daily, maintain dental health, and build social support networks.',
      ],
      sources: [
        {
          title: 'Diabetes Management Guidelines',
          country: region,
          doc_type: 'lifestyle_guideline',
        },
      ],
    };
  }
}

export default new LifestyleTipsService();
