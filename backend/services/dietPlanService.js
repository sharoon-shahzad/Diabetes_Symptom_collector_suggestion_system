import DietPlan from '../models/DietPlan.js';
import { User } from '../models/User.js';
import { UserPersonalInfo } from '../models/UserPersonalInfo.js';
import { UserMedicalInfo } from '../models/UserMedicalInfo.js';
import calorieCalculatorService from './calorieCalculatorService.js';
import regionDiscoveryService from './regionDiscoveryService.js';
import { processQuery } from './queryService.js';
import axios from 'axios';

class DietPlanService {
  
  /**
   * Main generation function - works for ANY region dynamically
   * @param {string} userId - User ID
   * @param {string} targetDate - Target date for plan (YYYY-MM-DD)
   * @returns {Promise<Object>} - Generated diet plan
   */
  async generateDietPlan(userId, targetDate) {
    try {
      // 1. Get user profile and personal info
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      const personalInfo = await UserPersonalInfo.findOne({ user_id: userId });
      const medicalInfo = await UserMedicalInfo.findOne({ user_id: userId });

      if (!personalInfo) {
        throw new Error('Personal information not found. Please complete your profile first.');
      }

      // Calculate age from date of birth
      const dob = new Date(personalInfo.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      const personal = {
        age,
        gender: personalInfo.gender,
        weight: personalInfo.weight,
        height: personalInfo.height,
        activity_level: personalInfo.activity_level || 'Sedentary',
        goal: 'maintain',
        country: user.country || 'Global'
      };

      const medical = {
        diabetes_type: medicalInfo?.diabetes_type || 'Type 2',
        medications: medicalInfo?.medications || []
      };
      
      // 2. Check if plan already exists for this date
      const targetDateObj = new Date(targetDate);
      targetDateObj.setHours(0, 0, 0, 0);
      
      const existingPlan = await DietPlan.findOne({
        user_id: userId,
        target_date: targetDateObj
      });
      
      if (existingPlan) {
        throw new Error('Diet plan already exists for this date. View your existing plan or choose a different date.');
      }
      
      // 3. Discover region capability (DYNAMIC - no hardcoding)
      let userRegion = personal.country;
      const regionCoverage = await regionDiscoveryService.checkRegionCoverage(userRegion, 'diet_chart');
      
      if (!regionCoverage.canGeneratePlan) {
        // Try fallback to global documents
        const fallbackRegion = await regionDiscoveryService.getFallbackRegion(userRegion, 'diet');
        if (!fallbackRegion) {
          throw new Error(`No dietary documents available for your region (${userRegion}). Please contact support to add regional guidelines.`);
        }
        userRegion = fallbackRegion;
        console.log(`Using fallback region: ${fallbackRegion} for user from ${personal.country}`);
      }
      
      // 4. Calculate calorie needs
      const calorieData = calorieCalculatorService.calculateDailyCalories(personal, medical);
      const dailyCalories = calorieData.target_calories;
      const mealDistribution = calorieCalculatorService.distributeMealCalories(dailyCalories);
      
      // 5. Get previous 3 days of diet plans for variety
      const threeDaysAgo = new Date(targetDateObj);
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const previousPlans = await DietPlan.find({
        user_id: userId,
        target_date: { $gte: threeDaysAgo, $lt: targetDateObj }
      })
      .sort({ target_date: -1 })
      .limit(3);
      
      // 6. Query RAG for regional food data
      const foodContext = await this.queryRegionalFoods(userRegion, dailyCalories, previousPlans);
      
      if (!foodContext.chunks || foodContext.chunks.length === 0) {
        throw new Error(`Unable to retrieve dietary information for ${userRegion}. Please try again.`);
      }
      
      // 7. Build AI prompt for Diabetica-7B
      const aiPrompt = this.buildDietPrompt(
        personal,
        medical,
        dailyCalories,
        mealDistribution,
        foodContext,
        previousPlans,
        targetDateObj
      );
      
      // 8. Call Diabetica-7B for meal generation (NO FALLBACK - direct AI response required)
      console.log('🤖 Calling AI model - no fallback mode');
      const aiResponse = await this.callDiabetica(aiPrompt);
      
      // 9. Parse and structure meal plan
      const structuredPlan = this.parseMealPlan(aiResponse, dailyCalories, mealDistribution);
      
      // 10. Save to database
      const dietPlan = new DietPlan({
        user_id: userId,
        target_date: targetDateObj,
        region: userRegion,
        total_calories: dailyCalories,
        meals: structuredPlan.meals,
        nutritional_totals: structuredPlan.nutritional_totals,
        sources: foodContext.sources,
        tips: structuredPlan.tips || [],
        status: 'pending',
        generated_at: new Date()
      });
      
      await dietPlan.save();
      
      return {
        success: true,
        plan: dietPlan,
        calorie_data: calorieData,
        region_coverage: regionCoverage
      };
      
    } catch (error) {
      console.error('Error generating diet plan:', error);
      throw error;
    }
  }
  
  /**
   * Query ChromaDB for regional food composition data (DYNAMIC)
   * @param {string} region - Region/country name
   * @param {number} calorieTarget - Daily calorie target
   * @param {Array} previousPlans - Previous diet plans
   * @returns {Promise<Object>} - Food context with chunks and sources
   */
  async queryRegionalFoods(region, calorieTarget, previousPlans) {
    try {
      // Build MORE diverse queries for better variety in RAG retrieval
      const queries = [
        `${region} food composition nutritional values calories carbohydrates protein diabetic`,
        `${region} meal planning breakfast lunch dinner traditional foods diabetes`,
        `${region} glycemic index portion sizes exchange list diabetic diet`,
        `diabetic food portions calorie content ${region} cuisine nutrition facts`,
        `${region} healthy recipes diabetes management meal ideas`,
        `${region} snacks appetizers diabetic friendly low glycemic index`,
        `${region} protein sources vegetables fruits diabetes nutrition`,
        `${region} cooking methods food preparation diabetes guidelines`
      ];
      
      // Extract foods from previous plans to AVOID repetition
      const previousFoods = this.extractPreviousFoods(previousPlans);
      
      console.log(`🚫 Avoiding ${previousFoods.length} foods from previous plans`);
      
      const allResults = [];
      const seenTexts = new Set();
      
      // Query with region-specific filter (DYNAMIC)
      const filter = {
        country: region,
        doc_type: 'diet_chart'
      };
      
      for (const query of queries) {
        try {
          const queryResponse = await processQuery(
            query,
            filter,
            8 // Increased from 5 to 8 chunks per query for more variety
          );
          
          // processQuery returns an object with results array
          const results = queryResponse.results || [];
          
          // Deduplicate by text content
          results.forEach(result => {
            const textKey = result.text.substring(0, 100);
            if (!seenTexts.has(textKey)) {
              seenTexts.add(textKey);
              allResults.push(result);
            }
          });
        } catch (error) {
          console.warn(`Query failed for: ${query}`, error.message);
        }
      }
      
      // NO FALLBACK - Require region-specific data
      if (allResults.length === 0) {
        throw new Error(`No dietary documents found for region: ${region}. Region-specific data is required.`);
      }
      
      // NO FALLBACK - RAG must provide data
      if (allResults.length === 0) {
        throw new Error(`ChromaDB returned no results for region: ${region}. RAG system must be operational.`);
      }
      
      // Format chunks and extract sources
      return {
        chunks: allResults.map(r => r.text),
        sources: this.extractSources(allResults),
        avoidFoods: previousFoods
      };
      
    } catch (error) {
      console.error('❌ Error querying regional foods:', error);
      throw new Error(`RAG query failed for region ${region}: ${error.message}`);
    }
  }
  
  /**
   * Extract foods from previous plans to avoid repetition
   * @param {Array} previousPlans - Previous diet plans
   * @returns {Array} - List of food items to avoid
   */
  extractPreviousFoods(previousPlans) {
    const foods = new Set();
    
    previousPlans.forEach(plan => {
      plan.meals?.forEach(meal => {
        meal.items?.forEach(item => {
          if (item.food) {
            foods.add(item.food.toLowerCase());
          }
        });
      });
    });
    
    return Array.from(foods);
  }
  
  /**
   * Extract source documents from query results
   * @param {Array} results - Query results
   * @returns {Array} - Unique sources
   */
  extractSources(results) {
    const sourcesMap = new Map();
    
    results.forEach(result => {
      // Updated to match the new queryService result structure
      const metadata = result.chunk_metadata || result.metadata;
      
      if (metadata?.title) {
        const key = metadata.title;
        if (!sourcesMap.has(key)) {
          sourcesMap.set(key, {
            title: metadata.title,
            country: metadata.country || 'Unknown',
            doc_type: metadata.doc_type || 'diet'
          });
        }
      }
    });
    
    return Array.from(sourcesMap.values());
  }
  
  /**
   * Format previous meals for prompt context
   * @param {Array} previousPlans - Previous diet plans
   * @returns {string} - Formatted meal history
   */
  formatPreviousMeals(previousPlans) {
    if (!previousPlans || previousPlans.length === 0) {
      return 'No previous meal history available.';
    }
    
    let formatted = '';
    previousPlans.forEach((plan, index) => {
      const date = new Date(plan.target_date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
      formatted += `\n${date}:\n`;
      
      plan.meals?.forEach(meal => {
        formatted += `  ${meal.name}: ${meal.items?.map(i => i.food).join(', ')}\n`;
      });
    });
    
    return formatted;
  }
  
  /**
   * Build prompt for Diabetica-7B (DYNAMIC for all regions)
   * @param {Object} personal - Personal info
   * @param {Object} medical - Medical info
   * @param {number} calories - Daily calorie target
   * @param {Object} mealDistribution - Calorie distribution by meal
   * @param {Object} foodContext - RAG retrieved food context
   * @param {Array} previousPlans - Previous diet plans
   * @param {Date} targetDate - Target date
   * @returns {string} - Complete AI prompt
   */
  buildDietPrompt(personal, medical, calories, mealDistribution, foodContext, previousPlans, targetDate) {
    const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    
    return `You are an expert diabetes dietitian creating a personalized meal plan based on evidence-based dietary guidelines.

PATIENT PROFILE:
- Age: ${personal.age} years
- Gender: ${personal.gender}
- Weight: ${personal.weight}kg, Height: ${personal.height}cm
- Region: ${personal.country}
- Diabetes Type: ${medical.diabetes_type}
- Medications: ${medical.medications?.join(', ') || 'None specified'}
- Activity Level: ${personal.activity_level}
- Daily Calorie Target: ${calories} kcal

MEAL CALORIE DISTRIBUTION:
- Breakfast: ${mealDistribution.breakfast} kcal (25%)
- Mid-Morning Snack: ${mealDistribution.mid_morning_snack} kcal (10%)
- Lunch: ${mealDistribution.lunch} kcal (30%)
- Evening Snack: ${mealDistribution.evening_snack} kcal (10%)
- Dinner: ${mealDistribution.dinner} kcal (25%)

TARGET DATE: ${dayName}

REGIONAL DIETARY GUIDELINES AND FOOD DATABASE (${personal.country}):
${foodContext.chunks.slice(0, 8).map((chunk, i) => `[Source ${i + 1}]\n${chunk.substring(0, 400)}${chunk.length > 400 ? '...' : ''}`).join('\n\n---\n\n')}

${previousPlans.length > 0 ? `PREVIOUS MEAL HISTORY (for variety - DO NOT repeat these exact combinations):
${this.formatPreviousMeals(previousPlans)}` : 'This is the first diet plan for this user.'}

${foodContext.avoidFoods.length > 0 ? `\nIMPORTANT: Provide variety by avoiding recent foods: ${foodContext.avoidFoods.slice(0, 15).join(', ')}` : ''}

CRITICAL INSTRUCTIONS:
1. Create exactly 5 meals: Breakfast, Mid-Morning Snack, Lunch, Evening Snack, Dinner
2. Use ONLY foods mentioned in the Regional Dietary Guidelines above
3. Match the calorie targets: Breakfast ${mealDistribution.breakfast}kcal, Mid-Morning Snack ${mealDistribution.mid_morning_snack}kcal, Lunch ${mealDistribution.lunch}kcal, Evening Snack ${mealDistribution.evening_snack}kcal, Dinner ${mealDistribution.dinner}kcal
4. Total calories must equal ${calories} kcal (±50 kcal acceptable)
5. Include exact portions from the guidelines (e.g., "1 cup", "150g", "2 medium")
6. Provide nutritional breakdown per food item (calories, carbs, protein, fat, fiber)
7. **VARIETY IS MANDATORY** - Each meal plan MUST be different from previous days
8. **STRICT FOOD AVOIDANCE** - DO NOT use any foods listed in previous meal history
9. Follow diabetic principles: low GI foods, high fiber (35g+ daily), balanced macros
10. Include traditional ${personal.country} foods when mentioned in guidelines
11. Add specific timing for each meal (e.g., "7:00 AM - 9:00 AM")
12. Generate 3-5 personalized tips based on the patient profile
13. **CREATE UNIQUE COMBINATIONS** - Mix different food items creatively within guidelines
14. **NO REPETITION** - If this is Day 2+, ensure completely different meal structure

RESPONSE FORMAT (strict JSON):
{
  "meals": [
    {
      "name": "Breakfast",
      "timing": "7:00 AM - 9:00 AM",
      "items": [
        {
          "food": "Whole Wheat Paratha",
          "portion": "1 medium (6 inch)",
          "calories": 120,
          "carbs": 20,
          "protein": 3,
          "fat": 3,
          "fiber": 2
        }
      ],
      "total_calories": 450
    }
  ],
  "nutritional_totals": {
    "calories": ${calories},
    "carbs": 210,
    "protein": 90,
    "fat": 65,
    "fiber": 38
  },
  "tips": [
    "Check blood glucose before breakfast and 2 hours after meals",
    "Drink 8-10 glasses of water throughout the day",
    "Walk for 30 minutes after lunch to improve insulin sensitivity"
  ]
}

Generate the complete meal plan now in valid JSON format:`;
  }
  
  /**
   * Call Diabetica-7B model via LM Studio
   * @param {string} prompt - Complete prompt
   * @returns {Promise<string>} - AI response
   */
  async callDiabetica(prompt) {
    try {
      const lmStudioUrl = process.env.LM_STUDIO_BASE_URL || 'http://127.0.0.1:1234';
      const model = process.env.LM_STUDIO_MODEL || 'diabetica-7b';
      
      console.log(`🤖 Calling LM Studio at ${lmStudioUrl} with model: ${model}`);
      
      // Add randomness to system prompt to encourage variety
      const randomSeed = Math.floor(Math.random() * 1000000);
      
      const requestBody = {
        model: model,
        messages: [
          {
            role: 'system',
            content: `You are a specialized diabetes dietitian AI (Session: ${randomSeed}). You must respond with ONLY valid JSON format for diet plans. Create diverse and unique meal combinations for every request. Do not include any markdown formatting or explanations.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.85,
        max_tokens: 4000
      };
      
      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2).substring(0, 500) + '...');
      
      const response = await axios.post(`${lmStudioUrl}/v1/chat/completions`, requestBody, {
        timeout: 120000 // 120 second timeout for large prompts
      });
      
      console.log('✅ LM Studio response received');
      return response.data.choices[0].message.content;
      
    } catch (error) {
      console.error('❌ Error calling LM Studio:', error.message);
      
      // Log detailed error information
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('LM Studio is not running. Start it with: lm-studio serve');
      } else if (error.message.includes('timeout')) {
        throw new Error('LM Studio took too long to respond (>120s). Please ensure LM Studio is running properly and model is loaded.');
      } else if (error.response?.data?.error) {
        throw new Error(`LM Studio error: ${error.response.data.error.message || error.response.data.error}`);
      } else {
        throw new Error(`LM Studio error: ${error.message}`);
      }
    }
  }
  
  /**
   * Parse AI response and structure meal plan
   * @param {string} aiResponse - Raw AI response
   * @param {number} targetCalories - Target daily calories
   * @param {Object} mealDistribution - Expected calorie distribution
   * @returns {Object} - Structured meal plan
   */
  parseMealPlan(aiResponse, targetCalories, mealDistribution) {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(aiResponse);
      
      // Validate structure
      if (!parsed.meals || !Array.isArray(parsed.meals)) {
        throw new Error('Invalid meal structure in AI response');
      }
      
      // Validate and correct meal calories
      parsed.meals = parsed.meals.map(meal => {
        if (meal.items && Array.isArray(meal.items)) {
          // Recalculate total_calories from items to ensure accuracy
          const calculatedCalories = meal.items.reduce((sum, item) => {
            // Ensure item.calories is a number
            const itemCals = parseFloat(item.calories) || 0;
            return sum + itemCals;
          }, 0);
          
          // Round to nearest integer
          meal.total_calories = Math.round(calculatedCalories);
          
          console.log(`✅ ${meal.name}: ${meal.total_calories} kcal (${meal.items.length} items)`);
        } else {
          meal.total_calories = 0;
        }
        return meal;
      });
      
      // Recalculate nutritional totals from meals
      const recalculatedTotals = this.calculateTotals(parsed.meals);
      
      console.log(`📊 Total calories recalculated: ${recalculatedTotals.calories} kcal (target: ${targetCalories} kcal)`);
      
      // Ensure nutritional_totals matches recalculated values
      parsed.nutritional_totals = recalculatedTotals;
      
      return {
        meals: parsed.meals,
        nutritional_totals: recalculatedTotals,
        tips: parsed.tips || []
      };
      
    } catch (error) {
      console.error('Error parsing AI response:', error);
      
      // Fallback: Try to extract JSON from markdown code blocks
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1]);
          if (parsed.meals) {
            // Apply same validation
            parsed.meals = parsed.meals.map(meal => {
              if (meal.items && Array.isArray(meal.items)) {
                meal.total_calories = Math.round(
                  meal.items.reduce((sum, item) => sum + (parseFloat(item.calories) || 0), 0)
                );
              }
              return meal;
            });
            
            return {
              meals: parsed.meals,
              nutritional_totals: this.calculateTotals(parsed.meals),
              tips: parsed.tips || []
            };
          }
        } catch (e) {
          console.error('Failed to parse extracted JSON:', e);
        }
      }
      
      throw new Error('Unable to parse meal plan from AI response');
    }
  }
  
  /**
   * Calculate nutritional totals from meals
   * @param {Array} meals - Meal array
   * @returns {Object} - Nutritional totals
   */
  calculateTotals(meals) {
    const totals = {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      fiber: 0
    };
    
    meals.forEach(meal => {
      meal.items?.forEach(item => {
        // Ensure all values are parsed as numbers
        totals.calories += parseFloat(item.calories) || 0;
        totals.carbs += parseFloat(item.carbs) || 0;
        totals.protein += parseFloat(item.protein) || 0;
        totals.fat += parseFloat(item.fat) || 0;
        totals.fiber += parseFloat(item.fiber) || 0;
      });
    });
    
    // Round all totals to 1 decimal place for macros, integers for calories
    return {
      calories: Math.round(totals.calories),
      carbs: Math.round(totals.carbs * 10) / 10,
      protein: Math.round(totals.protein * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10
    };
  }
  
  /**
   * Get user's diet plan for a specific date
   * @param {string} userId - User ID
   * @param {string} targetDate - Target date
   * @returns {Promise<Object>} - Diet plan or null
   */
  async getDietPlanByDate(userId, targetDate) {
    try {
      const targetDateObj = new Date(targetDate);
      targetDateObj.setHours(0, 0, 0, 0);
      
      const plan = await DietPlan.findOne({
        user_id: userId,
        target_date: targetDateObj
      });
      
      return plan;
    } catch (error) {
      console.error('Error getting diet plan by date:', error);
      throw error;
    }
  }
  
  /**
   * Get user's diet plan history
   * @param {string} userId - User ID
   * @param {number} limit - Number of plans to retrieve
   * @returns {Promise<Array>} - Array of diet plans
   */
  async getDietPlanHistory(userId, limit = 10) {
    try {
      const plans = await DietPlan.find({ user_id: userId })
        .sort({ target_date: -1 })
        .limit(limit);
      
      return plans;
    } catch (error) {
      console.error('Error getting diet plan history:', error);
      throw error;
    }
  }

  
  /**
   * Delete a diet plan
   * @param {string} userId - User ID
   * @param {string} planId - Plan ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteDietPlan(userId, planId) {
    try {
      const result = await DietPlan.findOneAndDelete({
        _id: planId,
        user_id: userId
      });
      
      return result !== null;
    } catch (error) {
      console.error('Error deleting diet plan:', error);
      throw error;
    }
  }
}

export default new DietPlanService();
