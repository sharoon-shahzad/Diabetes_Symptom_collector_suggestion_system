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

      // Fetch personal and medical info from separate collections
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
      
      // 8. Call Diabetica-7B for meal generation (with fallback)
      let structuredPlan;
      try {
        const aiResponse = await this.callDiabetica(aiPrompt);
        // 9. Parse and structure meal plan
        structuredPlan = this.parseMealPlan(aiResponse, dailyCalories, mealDistribution);
      } catch (lmError) {
        console.warn('⚠️  LM Studio unavailable or timed out, using fallback meal plan generator');
        // Generate basic fallback plan when LM Studio is down/slow
        structuredPlan = this.generateFallbackMealPlan(dailyCalories, mealDistribution, userRegion, medical.diabetes_type);
      }
      
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
      // Build queries that include region context (works for ANY region)
      const queries = [
        `${region} food composition nutritional values calories carbohydrates protein diabetic`,
        `${region} meal planning breakfast lunch dinner traditional foods diabetes`,
        `${region} glycemic index portion sizes exchange list diabetic diet`,
        `diabetic food portions calorie content ${region} cuisine nutrition facts`
      ];
      
      // Extract foods from previous plans to AVOID repetition
      const previousFoods = this.extractPreviousFoods(previousPlans);
      
      const allResults = [];
      const seenTexts = new Set();
      
      // Query with region-specific filter (DYNAMIC)
      const filter = {
        country: region,
        doc_type: 'diet_chart'
      };
      
      for (const query of queries) {
        try {
          const results = await processQuery(
            query,
            filter,
            5 // Get top 5 chunks per query
          );
          
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
      
      // If no results with region filter, try without filter (fallback)
      if (allResults.length === 0) {
        console.log(`No results with region filter, trying without filter...`);
        for (const query of queries) {
          try {
            const results = await processQuery(
              query,
              { doc_type: 'diet_chart' }, // Only filter by doc_type
              5
            );
            results.forEach(result => {
              const textKey = result.text.substring(0, 100);
              if (!seenTexts.has(textKey)) {
                seenTexts.add(textKey);
                allResults.push(result);
              }
            });
          } catch (error) {
            console.warn(`Fallback query failed for: ${query}`, error.message);
          }
        }
      }
      
      // If still no results, use fallback data (ChromaDB not available)
      if (allResults.length === 0) {
        console.log('⚠️ No RAG results available - using fallback food composition data');
        return this.getFallbackFoodContext(region);
      }
      
      // Format chunks and extract sources
      return {
        chunks: allResults.map(r => r.text),
        sources: this.extractSources(allResults),
        avoidFoods: previousFoods
      };
      
    } catch (error) {
      console.error('Error querying regional foods:', error);
      console.log('⚠️ Query failed - using fallback food composition data');
      return this.getFallbackFoodContext(region);
    }
  }
  
  /**
   * Fallback food composition data when ChromaDB is unavailable
   * Based on food composition tables and diabetes guidelines
   */
  getFallbackFoodContext(region) {
    const fallbackData = {
      'Pakistan': {
        chunks: [
          'Pakistani Staple Foods - Nutritional Content: Rice (cooked, 1 cup): 206 calories, 43g carbs, 4g protein. Roti/Wheat bread (1 piece): 82 calories, 15g carbs, 3g protein. Chicken (100g grilled): 165 calories, 0g carbs, 31g protein. Lentils (1 cup cooked): 230 calories, 40g carbs, 18g protein. Yogurt (1 cup): 100 calories, 7g carbs, 9g protein.',
          'Pakistani Vegetables - Safe for Diabetics: Spinach (1 cup raw): 7 calories, 1g carbs, 1g protein. Tomato (1 medium): 22 calories, 5g carbs. Onion (1 medium): 45 calories, 10g carbs. Cucumber (1 cup): 16 calories, 4g carbs. Okra (1 cup): 33 calories, 7g carbs.',
          'Pakistani Meal Planning - Diabetes Guidelines: Breakfast: 1 roti + 1 egg + vegetables (approximately 200-250 calories). Lunch: 1 cup rice + 100g chicken + vegetable curry (approximately 500 calories). Dinner: 1 roti + 100g lentil curry + salad (approximately 350 calories). Snacks: Yogurt or nuts (100-150 calories).',
          'Portion Sizes and Exchange Lists: Carbohydrate exchanges: 1 roti = 15g carbs, 1/2 cup rice = 15g carbs, 1 medium potato = 15g carbs. Protein exchanges: 1 egg = 7g protein, 30g chicken = 7g protein, 1/4 cup lentils = 7g protein.',
          'Traditional Pakistani Foods Suitable for Diabetes: Seekh kebab (grilled, no oil): 165 calories, 0g carbs, 28g protein. Fish curry (with minimal oil): 200 calories, 5g carbs, 28g protein. Vegetable biryani (measured portion): 280 calories, 35g carbs, 8g protein. Chapati with dal: 250 calories, 35g carbs, 10g protein.'
        ],
        sources: [
          { title: 'Pakistan Food Composition Table', country: 'Pakistan', doc_type: 'diet_chart' },
          { title: 'PES Clinical Practice Guidelines for Type 2 Diabetes', country: 'Pakistan', doc_type: 'guideline' },
          { title: 'Pakistan Dietary Guidelines for Better Nutrition', country: 'Pakistan', doc_type: 'guideline' }
        ]
      },
      'India': {
        chunks: [
          'Indian Staple Foods - Nutritional Content: Basmati rice (1 cup cooked): 195 calories, 43g carbs, 4g protein. Roti/Chapati (1 piece): 70 calories, 13g carbs, 2g protein. Ghee (1 teaspoon): 45 calories, 0g carbs. Lentils/Dal (1 cup cooked): 230 calories, 40g carbs, 18g protein. Paneer (100g): 265 calories, 4g carbs, 27g protein.',
          'Indian Vegetables - Safe for Diabetics: Bitter gourd (karela, 1 cup): 21 calories, 5g carbs, 1g protein. Bottle gourd (lauki, 1 cup): 19 calories, 4g carbs. Ridge gourd (tinda, 1 cup): 26 calories, 6g carbs. Cluster beans (1 cup): 25 calories, 5g carbs, 2g protein.',
          'Indian Meal Planning - Diabetes Guidelines: Breakfast: 2 roti + 1 egg curry + vegetable (approximately 250-300 calories). Lunch: 1 cup rice + dal curry + 100g chicken (approximately 500 calories). Dinner: 2 roti + vegetable curry + yogurt (approximately 350 calories). Snacks: Roasted chickpeas or nuts.',
          'Glycemic Index of Indian Foods: High GI (avoid): White rice, polished white bread. Medium GI (moderate): Whole wheat bread, basmati rice, oats. Low GI (prefer): Barley, legumes, chickpeas, kidney beans. Vegetables: Most vegetables have low glycemic index.',
          'Traditional Indian Foods Suitable for Diabetes: Tandoori chicken (grilled): 165 calories, 0g carbs, 31g protein. Fish curry (with coconut milk, measured): 220 calories, 8g carbs, 28g protein. Vegetable sambar with rice: 280 calories, 38g carbs, 8g protein. Mixed vegetable curry with roti: 200 calories, 25g carbs, 6g protein.'
        ],
        sources: [
          { title: 'RSSDI Clinical Practice Recommendations for Type 2 Diabetes', country: 'India/South Asia', doc_type: 'guideline' },
          { title: 'Indian Food Composition Tables', country: 'India', doc_type: 'diet_chart' }
        ]
      },
      'Global': {
        chunks: [
          'International Staple Foods - Nutritional Content: Whole wheat bread (1 slice): 80 calories, 14g carbs, 4g protein. Chicken breast (100g): 165 calories, 0g carbs, 31g protein. Salmon (100g): 208 calories, 0g carbs, 20g protein. Brown rice (1 cup cooked): 215 calories, 45g carbs, 5g protein. Oatmeal (1 cup cooked): 150 calories, 27g carbs, 5g protein.',
          'Vegetables Recommended for All Diets: Broccoli (1 cup): 55 calories, 11g carbs, 4g protein. Spinach (1 cup raw): 7 calories, 1g carbs, 1g protein. Bell peppers (1 medium): 37 calories, 9g carbs, 1g protein. Carrots (1 medium): 25 calories, 6g carbs. Cauliflower (1 cup): 25 calories, 5g carbs, 2g protein.',
          'Meal Planning Principles for Diabetes: Breakfast: 1-2 servings carbs + 1 protein source (200-250 calories). Lunch: 2-3 servings carbs + 1-2 protein sources + vegetables (500 calories). Dinner: 2 servings carbs + 1-2 protein sources + vegetables (400 calories). Snacks: 1 protein + vegetables (100-150 calories).',
          'Portion Sizes and Carbohydrate Exchanges: 1 bread/starch exchange = 15g carbs: 1 slice bread, 1/2 cup pasta, 1/3 cup rice. 1 protein exchange = 7g protein: 1 egg, 1 oz meat, 1/4 cup cottage cheese. 1 vegetable exchange = 5g carbs: 1 cup raw vegetables.',
          'Healthy Cooking Methods for Diabetes: Grilling: Reduces added fat while maintaining flavor. Steaming: Preserves nutrients and requires minimal oil. Roasting: Enhances natural flavors at high temperatures. Baking: Alternative to frying for crispy foods. Stir-frying: Use minimal oil and lots of vegetables.'
        ],
        sources: [
          { title: 'ADA - Standards of Care in Diabetes', country: 'Global', doc_type: 'guideline' },
          { title: 'IDF Global Clinical Practice Recommendations', country: 'Global', doc_type: 'guideline' },
          { title: 'WHO Diabetes Guidelines', country: 'Global', doc_type: 'guideline' }
        ]
      }
    };
    
    // Return data for the specific region or fallback to Global
    const regionData = fallbackData[region] || fallbackData['Global'];
    
    return {
      chunks: regionData.chunks,
      sources: regionData.sources,
      avoidFoods: []
    };
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
      if (result.metadata?.title) {
        const key = result.metadata.title;
        if (!sourcesMap.has(key)) {
          sourcesMap.set(key, {
            title: result.metadata.title,
            country: result.metadata.country || 'Unknown',
            doc_type: result.metadata.doc_type || 'diet'
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
${foodContext.chunks.slice(0, 10).map((chunk, i) => `[Source ${i + 1}]\n${chunk}`).join('\n\n---\n\n')}

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
7. Ensure variety - avoid repeating foods from previous days
8. Follow diabetic principles: low GI foods, high fiber (35g+ daily), balanced macros
9. Include traditional ${personal.country} foods when mentioned in guidelines
10. Add specific timing for each meal (e.g., "7:00 AM - 9:00 AM")
11. Generate 3-5 personalized tips based on the patient profile

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
      
      const response = await axios.post(`${lmStudioUrl}/v1/chat/completions`, {
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a specialized diabetes dietitian AI. You must respond with ONLY valid JSON format for diet plans. Do not include any markdown formatting or explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }, {
        timeout: 60000 // 60 second timeout
      });
      
      console.log('✅ LM Studio response received');
      return response.data.choices[0].message.content;
      
    } catch (error) {
      console.error('❌ Error calling LM Studio:', error.message);
      if (error.code === 'ECONNREFUSED') {
        throw new Error('LM Studio is not running. Start it with: lm-studio serve');
      } else if (error.message.includes('timeout')) {
        throw new Error('LM Studio took too long to respond (>60s). Using fallback plan generator.');
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
      
      // Ensure nutritional_totals exists
      if (!parsed.nutritional_totals) {
        parsed.nutritional_totals = this.calculateTotals(parsed.meals);
      }
      
      // Validate meals have required fields
      parsed.meals = parsed.meals.map(meal => {
        if (!meal.total_calories && meal.items) {
          meal.total_calories = meal.items.reduce((sum, item) => sum + (item.calories || 0), 0);
        }
        return meal;
      });
      
      return {
        meals: parsed.meals,
        nutritional_totals: parsed.nutritional_totals,
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
            return {
              meals: parsed.meals,
              nutritional_totals: parsed.nutritional_totals || this.calculateTotals(parsed.meals),
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
        totals.calories += item.calories || 0;
        totals.carbs += item.carbs || 0;
        totals.protein += item.protein || 0;
        totals.fat += item.fat || 0;
        totals.fiber += item.fiber || 0;
      });
    });
    
    return totals;
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
   * Generate fallback meal plan when LM Studio is unavailable
   * @param {number} dailyCalories - Target daily calories
   * @param {Object} mealDistribution - Meal calorie distribution
   * @param {string} region - User region
   * @param {string} diabetesType - Type of diabetes
   * @returns {Object} - Basic structured meal plan
   */
  generateFallbackMealPlan(dailyCalories, mealDistribution, region, diabetesType) {
    const meals = [
      {
        name: 'Breakfast',
        timing: '7:00 AM - 9:00 AM',
        items: [
          { food: 'Oatmeal with berries', portion: '1 cup', calories: 150, carbs: 27, protein: 5, fat: 3, fiber: 4 },
          { food: 'Boiled egg', portion: '1 large', calories: 70, carbs: 1, protein: 6, fat: 5, fiber: 0 },
          { food: 'Green tea', portion: '1 cup', calories: 2, carbs: 0, protein: 0, fat: 0, fiber: 0 }
        ],
        total_calories: 222
      },
      {
        name: 'Lunch',
        timing: '12:30 PM - 2:00 PM',
        items: [
          { food: 'Grilled chicken breast', portion: '100g', calories: 165, carbs: 0, protein: 31, fat: 3.6, fiber: 0 },
          { food: 'Brown rice', portion: '1/2 cup', calories: 110, carbs: 22, protein: 2, fat: 1, fiber: 1.8 },
          { food: 'Mixed vegetables', portion: '1 cup', calories: 50, carbs: 10, protein: 2, fat: 0, fiber: 2 }
        ],
        total_calories: 325
      },
      {
        name: 'Snack',
        timing: '4:00 PM - 5:00 PM',
        items: [
          { food: 'Apple', portion: '1 medium', calories: 95, carbs: 25, protein: 0, fat: 0, fiber: 4 },
          { food: 'Almonds', portion: '10 pieces', calories: 70, carbs: 2, protein: 3, fat: 6, fiber: 1 }
        ],
        total_calories: 165
      },
      {
        name: 'Dinner',
        timing: '7:30 PM - 9:00 PM',
        items: [
          { food: 'Baked fish', portion: '120g', calories: 140, carbs: 0, protein: 28, fat: 3, fiber: 0 },
          { food: 'Quinoa', portion: '1/2 cup', calories: 110, carbs: 20, protein: 4, fat: 2, fiber: 2.7 },
          { food: 'Steamed broccoli', portion: '1 cup', calories: 55, carbs: 11, protein: 4, fat: 0, fiber: 2.4 }
        ],
        total_calories: 305
      }
    ];

    const nutritional_totals = {
      calories: meals.reduce((sum, m) => sum + m.total_calories, 0),
      carbs: meals.reduce((sum, m) => sum + m.items.reduce((s, f) => s + f.carbs, 0), 0),
      protein: meals.reduce((sum, m) => sum + m.items.reduce((s, f) => s + f.protein, 0), 0),
      fat: meals.reduce((sum, m) => sum + m.items.reduce((s, f) => s + f.fat, 0), 0),
      fiber: meals.reduce((sum, m) => sum + m.items.reduce((s, f) => s + f.fiber, 0), 0)
    };

    return {
      meals,
      nutritional_totals,
      tips: [
        'This is a basic template plan. For personalized recommendations, ensure LM Studio is running.',
        'Monitor your blood sugar 2 hours after meals.',
        'Stay hydrated with 8-10 glasses of water daily.',
        'Adjust portions based on your activity level and glucose readings.'
      ]
    };
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
