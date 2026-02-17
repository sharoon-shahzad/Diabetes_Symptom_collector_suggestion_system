import MonthlyDietPlan from '../models/MonthlyDietPlan.js';
import { User } from '../models/User.js';
import { UserPersonalInfo } from '../models/UserPersonalInfo.js';
import { UserMedicalInfo } from '../models/UserMedicalInfo.js';
import calorieCalculatorService from './calorieCalculatorService.js';
import regionDiscoveryService from './regionDiscoveryService.js';
import { processQuery } from './queryService.js';
import axios from 'axios';

class MonthlyDietPlanService {
  
  /**
   * Generate a complete monthly diet plan with multiple options per meal
   * @param {string} userId - User ID
   * @param {number} month - Month (1-12)
   * @param {number} year - Year
   * @returns {Promise<Object>} - Generated monthly diet plan
   */
  async generateMonthlyDietPlan(userId, month, year) {
    const startTime = Date.now();
    
    try {
      console.log(`🗓️ Starting monthly diet plan generation for user ${userId}, ${month}/${year}`);
      
      // 1. Validate and check for existing plan
      if (month < 1 || month > 12) {
        throw new Error('Invalid month. Must be between 1 and 12.');
      }
      
      const existingPlan = await MonthlyDietPlan.findOne({
        user_id: userId,
        month: month,
        year: year
      });
      
      if (existingPlan) {
        throw new Error(`A diet plan already exists for ${month}/${year}. Please delete the existing plan first or view it.`);
      }
      
      // 2. Get user profile
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const personalInfo = await UserPersonalInfo.findOne({ user_id: userId });
      const medicalInfo = await UserMedicalInfo.findOne({ user_id: userId });
      
      if (!personalInfo) {
        throw new Error('Personal information not found. Please complete your profile first.');
      }
      
      // Calculate age
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
        country: user.country || 'Global',
        dietary_preference: personalInfo.dietary_preference || 'Non-Vegetarian'
      };
      
      const medical = {
        diabetes_type: medicalInfo?.diabetes_type || 'Type 2',
        medications: medicalInfo?.current_medications?.map(m => m.medication_name) || []
      };
      
      // 3. Check region coverage
      let userRegion = personal.country;
      const regionCoverage = await regionDiscoveryService.checkRegionCoverage(userRegion, 'diet_chart');
      
      if (!regionCoverage.canGeneratePlan) {
        const fallbackRegion = await regionDiscoveryService.getFallbackRegion(userRegion, 'diet');
        if (!fallbackRegion) {
          throw new Error(`No dietary documents available for your region (${userRegion}). Please contact support.`);
        }
        userRegion = fallbackRegion;
        console.log(`Using fallback region: ${fallbackRegion}`);
      }
      
      // 4. Calculate calorie needs and distribution
      const calorieData = calorieCalculatorService.calculateDailyCalories(personal, medical);
      const dailyCalories = calorieData.target_calories;
      const mealDistribution = calorieCalculatorService.distributeMealCalories(dailyCalories);
      
      console.log(`📊 Calorie distribution:`, mealDistribution);
      
      // 5. Query RAG for diverse food data (more extensive for monthly plan)
      const foodContext = await this.queryRegionalFoodsForMonth(userRegion, dailyCalories, personal);
      
      if (!foodContext.chunks || foodContext.chunks.length === 0) {
        throw new Error(`Unable to retrieve dietary information for ${userRegion}. Please try again.`);
      }
      
      console.log(`📚 Retrieved ${foodContext.chunks.length} food data chunks from RAG`);
      
      // 6. Generate meal options for each meal type using AI
      const mealCategories = await this.generateMealOptions(
        personal,
        medical,
        dailyCalories,
        mealDistribution,
        foodContext,
        userRegion
      );
      
      console.log(`✅ Generated ${mealCategories.length} meal categories with options`);
      
      // 7. Create and save monthly plan
      const monthlyPlan = new MonthlyDietPlan({
        user_id: userId,
        month: month,
        year: year,
        region: userRegion,
        total_daily_calories: dailyCalories,
        meal_categories: mealCategories,
        nutritional_guidelines: {
          daily_carbs_range: {
            min: Math.round(dailyCalories * 0.45 / 4),
            max: Math.round(dailyCalories * 0.55 / 4)
          },
          daily_protein_range: {
            min: Math.round(dailyCalories * 0.15 / 4),
            max: Math.round(dailyCalories * 0.20 / 4)
          },
          daily_fat_range: {
            min: Math.round(dailyCalories * 0.25 / 9),
            max: Math.round(dailyCalories * 0.35 / 9)
          },
          daily_fiber_target: 35
        },
        sources: foodContext.sources,
        tips: await this.generateMonthlyTips(personal, medical, userRegion),
        generation_context: {
          user_profile_snapshot: personal,
          llm_model: 'diabetica-7b',
          generated_at: new Date(),
          generation_duration_ms: Date.now() - startTime
        },
        status: 'active'
      });
      
      await monthlyPlan.save();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Monthly diet plan generated successfully in ${(duration / 1000).toFixed(2)}s`);
      
      return {
        success: true,
        plan: monthlyPlan,
        calorie_data: calorieData,
        region_coverage: regionCoverage,
        generation_duration_ms: duration
      };
      
    } catch (error) {
      console.error('❌ Error generating monthly diet plan:', error);
      throw error;
    }
  }
  
  /**
   * Query RAG for extensive food data for monthly planning
   * @param {string} region - Region/country
   * @param {number} calorieTarget - Daily calorie target
   * @param {Object} personal - Personal info
   * @returns {Promise<Object>} - Food context
   */
  async queryRegionalFoodsForMonth(region, calorieTarget, personal) {
    try {
      // Extensive queries for maximum variety
      const queries = [
        `${region} breakfast foods traditional morning meals diabetes nutrition`,
        `${region} lunch recipes main meals diabetes carbohydrates protein`,
        `${region} dinner recipes evening meals diabetes portion control`,
        `${region} snacks appetizers diabetic friendly low glycemic`,
        `${region} vegetarian options plant-based diabetes diet`,
        `${region} protein sources meat fish chicken eggs diabetes`,
        `${region} whole grains rice wheat bread diabetes nutrition`,
        `${region} vegetables fruits fiber vitamins diabetes`,
        `${region} dairy products milk yogurt cheese diabetes`,
        `${region} healthy fats oils nuts seeds diabetes`,
        `diabetic food exchange list ${region} meal planning`,
        `${region} glycemic index food values diabetes management`,
        `${region} portion sizes serving sizes diabetes guidelines`,
        `${region} cooking methods food preparation diabetes`,
        `traditional ${region} cuisine healthy modifications diabetes`
      ];
      
      const allResults = [];
      const seenTexts = new Set();
      
      const filter = {
        $and: [
          { country: region },
          {
            $or: [
              { doc_type: 'diet_chart' },
              { doc_type: 'guideline' }
            ]
          }
        ]
      };
      
      // Execute queries in parallel for speed
      const queryPromises = queries.map(query => 
        processQuery(query, {
          topK: 10,
          filter: filter,
          minScore: 0.0
        }).catch(err => {
          console.warn(`Query failed: ${query.substring(0, 50)}...`, err.message);
          return { results: [] };
        })
      );
      
      const results = await Promise.all(queryPromises);
      
      // Deduplicate and collect results
      results.forEach(queryResponse => {
        const queryResults = queryResponse.results || [];
        queryResults.forEach(result => {
          const textKey = result.text.substring(0, 100);
          if (!seenTexts.has(textKey)) {
            seenTexts.add(textKey);
            allResults.push(result);
          }
        });
      });
      
      if (allResults.length === 0) {
        throw new Error(`No dietary documents found for region: ${region}`);
      }
      
      console.log(`📥 Total unique food data chunks: ${allResults.length}`);
      
      return {
        chunks: allResults.map(r => r.text),
        sources: this.extractSources(allResults)
      };
      
    } catch (error) {
      console.error('❌ Error querying regional foods for month:', error);
      throw new Error(`RAG query failed for region ${region}: ${error.message}`);
    }
  }
  
  /**
   * Extract unique sources from RAG results
   */
  extractSources(results) {
    const sourcesMap = new Map();
    
    results.forEach(result => {
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
   * Generate meal options for all meal types
   */
  async generateMealOptions(personal, medical, dailyCalories, mealDistribution, foodContext, region) {
    const mealTypes = [
      { name: 'Breakfast', timing: '7:00 AM - 9:00 AM', key: 'breakfast' },
      { name: 'Mid-Morning Snack', timing: '10:30 AM - 11:30 AM', key: 'mid_morning_snack' },
      { name: 'Lunch', timing: '1:00 PM - 2:30 PM', key: 'lunch' },
      { name: 'Evening Snack', timing: '5:00 PM - 6:00 PM', key: 'evening_snack' },
      { name: 'Dinner', timing: '7:30 PM - 9:00 PM', key: 'dinner' }
    ];
    
    const mealCategories = [];
    
    // Generate options for each meal type sequentially
    for (const mealType of mealTypes) {
      console.log(`🍽️ Generating options for ${mealType.name}...`);
      
      const options = await this.generateOptionsForMealType(
        mealType,
        mealDistribution[mealType.key],
        personal,
        medical,
        foodContext,
        region
      );
      
      mealCategories.push({
        meal_type: mealType.name,
        timing: mealType.timing,
        target_calories: mealDistribution[mealType.key],
        options: options
      });
      
      console.log(`✅ Generated ${options.length} options for ${mealType.name}`);
    }
    
    return mealCategories;
  }
  
  /**
   * Generate 5-7 options for a specific meal type using AI
   */
  async generateOptionsForMealType(mealType, targetCalories, personal, medical, foodContext, region) {
    const numOptions = 5; // Generate 5 options (reduced for reliability)
    const maxRetries = 3;
    
    const prompt = this.buildMealOptionPrompt(
      mealType.name,
      targetCalories,
      personal,
      medical,
      foodContext,
      region,
      numOptions
    );
    
    // Try with retries for timeout errors
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`   Attempt ${attempt}/${maxRetries} for ${mealType.name}...`);
        const aiResponse = await this.callDiabetica(prompt);
        const parsedOptions = this.parseMealOptions(aiResponse, targetCalories, numOptions);
        
        return parsedOptions;
        
      } catch (error) {
        const isTimeout = error.message.includes('timeout') || error.message.includes('took too long');
        const isParseError = error.message.includes('parse') || error.message.includes('JSON');
        const isLastAttempt = attempt === maxRetries;
        
        if ((isTimeout || isParseError) && !isLastAttempt) {
          console.warn(`⚠️ ${isTimeout ? 'Timeout' : 'Parse error'} on attempt ${attempt}/${maxRetries} for ${mealType.name}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
          continue;
        } else {
          console.error(`❌ Error generating options for ${mealType.name} (attempt ${attempt}):`, error);
          throw new Error(`Failed to generate meal options for ${mealType.name}: ${error.message}`);
        }
      }
    }
  }
  
  /**
   * Build AI prompt for generating meal options
   */
  buildMealOptionPrompt(mealName, targetCalories, personal, medical, foodContext, region, numOptions) {
    return `You are an expert diabetes dietitian creating ${numOptions} diverse meal options for ${mealName}.

PATIENT PROFILE:
- Age: ${personal.age}, Gender: ${personal.gender}
- Weight: ${personal.weight}kg, Height: ${personal.height}cm
- Region: ${region}
- Diabetes Type: ${medical.diabetes_type}
- Dietary Preference: ${personal.dietary_preference}
- Activity Level: ${personal.activity_level}

MEAL TYPE: ${mealName}
TARGET CALORIES: ${targetCalories} kcal

REGIONAL FOOD DATABASE (${region}):
${foodContext.chunks.slice(0, 10).map((chunk, i) => `[Source ${i + 1}] ${chunk.substring(0, 200)}...`).join('\n\n')}

INSTRUCTIONS:
1. Generate EXACTLY ${numOptions} unique and diverse meal options
2. Each option must be completely different from the others
3. Use ONLY foods from the regional database above
4. Target ${targetCalories} kcal per option (±30 kcal acceptable)
5. Include 2-4 food items per option
6. Provide exact portions (e.g., "1 cup", "150g", "2 medium")
7. Include full nutritional breakdown per food item
8. Add brief description and preparation time for each option
9. Ensure variety in ingredients, cooking methods, and flavors
10. Follow diabetic principles: low GI, high fiber, balanced macros
11. Consider ${personal.dietary_preference} preference

RESPONSE FORMAT (STRICT JSON ONLY - NO MARKDOWN):
{
  "options": [
    {
      "option_name": "Option 1",
      "description": "Brief description of the meal",
      "preparation_time": "15 minutes",
      "difficulty": "Easy",
      "items": [
        {
          "food": "Food item name",
          "portion": "Exact portion",
          "calories": 120,
          "carbs": 20,
          "protein": 5,
          "fat": 3,
          "fiber": 2
        }
      ]
    }
  ]
}

Generate ${numOptions} completely unique options now. Return ONLY valid JSON:`;
  }
  
  /**
   * Call Diabetica-7B model
   */
  async callDiabetica(prompt) {
    try {
      const lmStudioUrl = process.env.LM_STUDIO_BASE_URL || 'http://127.0.0.1:1234';
      const model = process.env.LM_STUDIO_MODEL || 'diabetica-7b';
      
      const requestBody = {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a diabetes nutrition expert AI. Respond with ONLY valid JSON, no markdown, no explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.9, // Higher for more variety
        max_tokens: 4000 // Increased to prevent JSON truncation
      };
      
      const response = await axios.post(`${lmStudioUrl}/v1/chat/completions`, requestBody, {
        timeout: 300000 // 5 minutes for monthly plan generation
      });
      
      return response.data.choices[0].message.content;
      
    } catch (error) {
      console.error('❌ Error calling LM Studio:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('LM Studio is not running. Please start it.');
      } else if (error.message.includes('timeout')) {
        throw new Error('LM Studio took too long to respond.');
      } else {
        throw new Error(`LM Studio error: ${error.message}`);
      }
    }
  }
  
  /**
   * Parse AI response into meal options
   */
  parseMealOptions(aiResponse, targetCalories, expectedOptions) {
    try {
      let cleanResponse = aiResponse.trim();
      
      // Remove markdown code blocks
      const jsonMatch = cleanResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[1].trim();
      }
      
      // Try to repair truncated JSON by adding closing braces
      if (!cleanResponse.endsWith('}')) {
        console.warn('⚠️ JSON appears truncated, attempting repair...');
        const openBraces = (cleanResponse.match(/{/g) || []).length;
        const closeBraces = (cleanResponse.match(/}/g) || []).length;
        const missing = openBraces - closeBraces;
        if (missing > 0) {
          cleanResponse += '}'.repeat(missing);
        }
      }
      
      // Try direct JSON parse
      let parsed = JSON.parse(cleanResponse);
      
      // Handle if result is string
      if (typeof parsed === 'string') {
        parsed = JSON.parse(parsed);
      }
      
      if (!parsed.options || !Array.isArray(parsed.options)) {
        throw new Error('Invalid response structure - missing options array');
      }
      
      // Validate and sanitize each option
      const validDifficulties = ['Easy', 'Medium', 'Moderate', 'Hard'];
      const validOptions = parsed.options
        .filter(option => {
          if (!option.option_name || !option.items || !Array.isArray(option.items)) {
            console.warn('Invalid option structure, skipping');
            return false;
          }
          
          // Sanitize difficulty field
          if (option.difficulty && !validDifficulties.includes(option.difficulty)) {
            option.difficulty = 'Easy'; // Default to Easy if invalid
          }
          
          // Validate items
          option.items = option.items.filter(item => {
            if (!item.food || !item.portion) {
              return false;
            }
            
            // Ensure numeric fields
            item.calories = parseFloat(item.calories) || 0;
            item.carbs = parseFloat(item.carbs) || 0;
            item.protein = parseFloat(item.protein) || 0;
            item.fat = parseFloat(item.fat) || 0;
            item.fiber = parseFloat(item.fiber) || 0;
            
            return true;
          });
          
          if (option.items.length === 0) {
            return false;
          }
          
          // Calculate total calories
          option.total_calories = Math.round(
            option.items.reduce((sum, item) => sum + item.calories, 0)
          );
          
          return true;
        })
        .slice(0, expectedOptions); // Take only expected number
      
      if (validOptions.length === 0) {
        throw new Error('No valid options found in AI response');
      }
      
      console.log(`✅ Parsed ${validOptions.length} valid options`);
      
      return validOptions;
      
    } catch (error) {
      console.error('❌ Error parsing meal options:', error.message);
      console.error('Raw response:', aiResponse.substring(0, 500));
      throw new Error('Failed to parse meal options from AI response');
    }
  }
  
  /**
   * Generate monthly tips
   */
  async generateMonthlyTips(personal, medical, region) {
    return [
      `Monitor your blood glucose levels daily, especially before and after meals`,
      `Stay hydrated by drinking 8-10 glasses of water throughout the day`,
      `Plan your meals in advance using the options provided to ensure variety`,
      `Walk for 30 minutes after lunch or dinner to help regulate blood sugar`,
      `Keep track of your favorite meal options for future reference`,
      `Consult your healthcare provider before making major dietary changes`,
      `Mix and match meal options daily to prevent monotony and ensure nutritional balance`
    ];
  }
  
  /**
   * Get active monthly plan for user
   */
  async getActiveMonthlyPlan(userId) {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const plan = await MonthlyDietPlan.findOne({
        user_id: userId,
        month: currentMonth,
        year: currentYear,
        status: 'active'
      });
      
      return plan;
    } catch (error) {
      console.error('Error getting active monthly plan:', error);
      throw error;
    }
  }
  
  /**
   * Get monthly plan history
   */
  async getMonthlyPlanHistory(userId, limit = 12) {
    try {
      const plans = await MonthlyDietPlan.find({ user_id: userId })
        .sort({ year: -1, month: -1 })
        .limit(limit);
      
      return plans;
    } catch (error) {
      console.error('Error getting monthly plan history:', error);
      throw error;
    }
  }
  
  /**
   * Delete monthly plan
   */
  async deleteMonthlyPlan(userId, planId) {
    try {
      const result = await MonthlyDietPlan.findOneAndDelete({
        _id: planId,
        user_id: userId
      });
      
      return result !== null;
    } catch (error) {
      console.error('Error deleting monthly plan:', error);
      throw error;
    }
  }
  
  /**
   * Save user's daily selections
   */
  async saveDailySelection(userId, planId, date, selections) {
    try {
      const plan = await MonthlyDietPlan.findOne({
        _id: planId,
        user_id: userId
      });
      
      if (!plan) {
        throw new Error('Monthly plan not found');
      }
      
      // Check if selection for this date already exists
      const existingIndex = plan.user_selections.findIndex(
        sel => new Date(sel.date).toDateString() === new Date(date).toDateString()
      );
      
      if (existingIndex >= 0) {
        // Update existing selection
        plan.user_selections[existingIndex].selections = selections;
      } else {
        // Add new selection
        plan.user_selections.push({
          date: new Date(date),
          selections: selections
        });
      }
      
      await plan.save();
      
      return plan;
    } catch (error) {
      console.error('Error saving daily selection:', error);
      throw error;
    }
  }
}

export default new MonthlyDietPlanService();
