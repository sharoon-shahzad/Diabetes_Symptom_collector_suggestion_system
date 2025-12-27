import LifestyleTip from '../models/LifestyleTip.js';
import { User } from '../models/User.js';
import { UserPersonalInfo } from '../models/UserPersonalInfo.js';
import { UserMedicalInfo } from '../models/UserMedicalInfo.js';
import { processQuery } from './queryService.js';
import axios from 'axios';

// Configurable LM Studio host with sensible default
const LM_STUDIO_HOST = process.env.LM_STUDIO_HOST || 'http://127.0.0.1:1234';
const LM_STUDIO_API = `${LM_STUDIO_HOST}/v1/chat/completions`;

async function isLmStudioHealthy() {
  try {
    const res = await axios.get(`${LM_STUDIO_HOST}/v1/models`, { timeout: 5000 });
    return !!res.data;
  } catch (_) {
    return false;
  }
}

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

      // Call LM Studio (with graceful fallback)
      let parsedTips;
      let source = 'lm-studio';
      try {
        console.log(`🤖 Calling LM Studio...`);
        const aiResponse = await this.callLMStudio(prompt);
        console.log(`✅ LM Studio response received, length: ${aiResponse.length}`);
        parsedTips = this.parseLifestyleTips(aiResponse);
        console.log(`✅ Tips parsed successfully:`, JSON.stringify(parsedTips, null, 2));
      } catch (e) {
        console.warn('⚠️ LM Studio unavailable, using fallback tips');
        console.error('LM Studio error:', e.message);
        // Build a minimal parsedTips using fallback
        parsedTips = {
          categories: [
            { name: 'sleep_hygiene', icon: '💤', tips: [
              { title: 'Maintain consistent bedtime', description: 'Aim for 7-8 hours of sleep at the same time daily to help regulate blood sugar.', priority: 'high' },
              { title: 'Create a calming routine', description: 'Reduce screens 1 hour before bed and avoid caffeine after 2 PM.', priority: 'medium' },
              { title: 'Optimize sleep environment', description: 'Keep your bedroom dark, quiet, and cool (60-67°F).', priority: 'medium' },
            ]},
            { name: 'stress_management', icon: '🧘', tips: [
              { title: 'Practice deep breathing', description: 'Do 5-10 minutes of diaphragmatic breathing when stressed to lower cortisol.', priority: 'high' },
              { title: 'Take mindful breaks', description: 'Step away from tasks every 90 minutes for a 2-minute mental reset.', priority: 'medium' },
              { title: 'Light physical activity', description: 'A 10-minute walk helps reduce stress and improve insulin sensitivity.', priority: 'medium' },
            ]},
            { name: 'nutrition', icon: '🥗', tips: [
              { title: 'Balanced meals', description: 'Include protein, fiber, and healthy fats in each meal to stabilize blood sugar.', priority: 'high' },
              { title: 'Portion awareness', description: 'Use smaller plates and measure portions to avoid overeating.', priority: 'medium' },
            ]},
            { name: 'activity', icon: '🚶', tips: [
              { title: 'Daily movement', description: 'Aim for 30 minutes of moderate activity most days of the week.', priority: 'high' },
              { title: 'Break up sitting', description: 'Stand or walk for 2-3 minutes every 30 minutes during sedentary periods.', priority: 'medium' },
            ]},
            { name: 'monitoring', icon: '📊', tips: [
              { title: 'Regular glucose checks', description: 'Monitor blood sugar as prescribed and log patterns.', priority: 'high' },
              { title: 'Track symptoms', description: 'Note any unusual symptoms or patterns to discuss with your healthcare team.', priority: 'medium' },
            ]},
          ],
          personalized_insights: [
            'Consistent daily routines help maintain stable blood sugar levels.',
            'Managing stress through mindfulness can reduce unexpected glucose spikes.',
            'Small, frequent healthy habits are more effective than occasional major changes.',
          ],
        };
        source = 'fallback';
      }

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
      const results = await processQuery(
        `lifestyle tips guidelines and daily habits for diabetes management in ${region}`,
        {
          topK: 10,
          filter: { country: region },
        }
      );

      return {
        chunks: results.chunks || [],
        sources: results.metadata
          ? results.metadata.map((meta, idx) => ({
              title: meta.title || 'Lifestyle Guideline',
              country: region,
              doc_type: 'lifestyle_guideline',
            }))
          : [],
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

  async callLMStudio(prompt) {
    try {
      const healthy = await isLmStudioHealthy();
      if (!healthy) throw new Error('LM Studio not reachable');
      const response = await axios.post(
        LM_STUDIO_API,
        {
          model: process.env.LM_STUDIO_MODEL || 'waltonfuture-diabetica-7b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        },
        { timeout: 60000 }
      );

      return response.data.choices?.[0]?.message?.content || '';
    } catch (error) {
      throw new Error(`LM Studio API call failed: ${error.message}`);
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
    const tips = await LifestyleTip.findOne({
      user_id: userId,
      target_date: new Date(date).toDateString(),
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
