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
      
      // Use flat $in filter to avoid nested $and/$or complexity in qdrantService formatFilter
      const filter = {
        country: region,
        doc_type: { $in: ['diet_chart', 'guideline'] }
      };
      
      // Run queries SEQUENTIALLY to respect Jina free-tier concurrency limit (max 2)
      const collectResultsSequential = async (activeFilter) => {
        for (const query of queries) {
          try {
            const queryResponse = await processQuery(query, {
              topK: 10,
              filter: activeFilter,
              minScore: 0.0
            });
            const queryResults = queryResponse.results || [];
            queryResults.forEach(result => {
              const textKey = result.text.substring(0, 100);
              if (!seenTexts.has(textKey)) {
                seenTexts.add(textKey);
                allResults.push(result);
              }
            });
          } catch (err) {
            console.warn(`Query failed: ${query.substring(0, 50)}...`, err.message);
          }
        }
      };

      // Attempt 1: region + doc_type filter
      await collectResultsSequential(filter);

      // Attempt 2: doc_type only (in case country field mismatch in Qdrant)
      if (allResults.length === 0) {
        console.warn(`⚠️  No results for region "${region}" — retrying with doc_type filter only`);
        seenTexts.clear();
        await collectResultsSequential({ doc_type: { $in: ['diet_chart', 'guideline'] } });
      }

      // Attempt 3: no filter at all (last resort)
      if (allResults.length === 0) {
        console.warn(`⚠️  No results with doc_type filter — retrying with no filter`);
        seenTexts.clear();
        await collectResultsSequential(null);
      }

      if (allResults.length === 0) {
        throw new Error(`No dietary documents found for region: ${region}. Please upload relevant documents via the admin panel.`);
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
   * Generate meal options for all meal types — 2 LLM calls (main meals + snacks).
   * Split avoids the 2048-token output limit that truncates a full 5-meal response.
   * 2 calls × ~3 min each = ~6 min total, well within the 10-min frontend timeout.
   */
  async generateMealOptions(personal, medical, dailyCalories, mealDistribution, foodContext, region) {
    const mealTypes = [
      { name: 'Breakfast',         timing: '7:00 AM - 9:00 AM',   key: 'breakfast'        },
      { name: 'Mid-Morning Snack', timing: '10:30 AM - 11:30 AM', key: 'mid_morning_snack' },
      { name: 'Lunch',             timing: '1:00 PM - 2:30 PM',   key: 'lunch'            },
      { name: 'Evening Snack',     timing: '5:00 PM - 6:00 PM',   key: 'evening_snack'    },
      { name: 'Dinner',            timing: '7:30 PM - 9:00 PM',   key: 'dinner'           },
    ];

    // ── Call 1: Breakfast + Lunch + Dinner (main meals) ──────────────────────
    console.log('🍽️  LLM call 1/2 — main meals (breakfast, lunch, dinner)...');
    const mainKeys  = ['breakfast', 'lunch', 'dinner'];
    const mainDist  = { breakfast: mealDistribution.breakfast, lunch: mealDistribution.lunch, dinner: mealDistribution.dinner };
    const mainMeals = await this._callForMealGroup(mainKeys, mainDist, personal, medical, dailyCalories, foodContext, region);

    // ── Call 2: Snacks ────────────────────────────────────────────────────────
    console.log('🍽️  LLM call 2/2 — snacks (mid_morning_snack, evening_snack)...');
    const snackKeys  = ['mid_morning_snack', 'evening_snack'];
    const snackDist  = { mid_morning_snack: mealDistribution.mid_morning_snack, evening_snack: mealDistribution.evening_snack };
    const snackMeals = await this._callForMealGroup(snackKeys, snackDist, personal, medical, dailyCalories, foodContext, region);

    const allMeals = { ...mainMeals, ...snackMeals };

    const mealCategories = mealTypes.map(mt => {
      const options = allMeals[mt.key] || this.getFallbackOptions(mt.name, mealDistribution[mt.key]);
      console.log(`✅ ${mt.name}: ${options.length} options`);
      return {
        meal_type:       mt.name,
        timing:          mt.timing,
        target_calories: mealDistribution[mt.key],
        options,
      };
    });

    return mealCategories;
  }

  /**
   * Make one LLM call for a subset of meal keys and return a parsed map.
   * @private
   */
  async _callForMealGroup(mealKeys, mealDist, personal, medical, dailyCalories, foodContext, region) {
    const prompt = this.buildCombinedMealPrompt(mealKeys, mealDist, personal, medical, dailyCalories, foodContext, region);

    let response = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        response = await this.callDiabetica(prompt);
        break;
      } catch (err) {
        console.error(`❌ Attempt ${attempt}/3 failed: ${err.message}`);
        if (attempt === 3) {
          // All retries exhausted — return fallbacks for this group
          const fallback = {};
          mealKeys.forEach(k => { fallback[k] = this.getFallbackOptions(k, mealDist[k]); });
          return fallback;
        }
        await new Promise(r => setTimeout(r, 2000));
      }
    }
    return this.parseCombinedMealOptions(response, mealDist, mealKeys);
  }

  /**
   * Build a compact prompt for a subset of meal keys.
   */
  buildCombinedMealPrompt(mealKeys, mealDist, personal, medical, dailyCalories, foodContext, region) {
    const foodSnippets = foodContext.chunks
      .slice(0, 8)
      .map((c, i) => `[${i + 1}] ${c.substring(0, 80)}`)
      .join('\n');

    const mealNames = {
      breakfast: 'Breakfast', mid_morning_snack: 'Mid-Morning Snack',
      lunch: 'Lunch', evening_snack: 'Evening Snack', dinner: 'Dinner',
    };

    const calTargets = mealKeys.map(k => `${k}=${mealDist[k]} kcal`).join(', ');

    // 2 options per meal — keeps output well within the 2048-token budget
    const skeleton = '{' + mealKeys.map(k =>
      `\n  "${k}": [\n    ${[1,2].map(n =>
        `{"option_name":"Option ${n}","description":"Short description max 8 words","preparation_time":"10 min","difficulty":"Easy","items":[{"food":"name","portion":"amount","calories":100,"carbs":15,"protein":5,"fat":3,"fiber":2}]}`
      ).join(',\n    ')}\n  ]`
    ).join(',') + '\n}';

    return `You are a diabetes dietitian. Create 2 options for each meal: ${mealKeys.map(k => mealNames[k]).join(', ')}.

PATIENT: Age ${personal.age}, ${personal.gender}, Region: ${region}, ${medical.diabetes_type}, Diet: ${personal.dietary_preference}
CALORIE TARGETS: ${calTargets}

REGIONAL FOODS (${region}):
${foodSnippets}

RULES:
- description: max 8 words
- All nutritional values MUST be plain numbers (no units like g, mg)
- 2-3 items per option

Return ONLY valid JSON — no markdown, no extra text:
${skeleton}`;
  }

  /**
   * Parse LLM response for a specific set of meal keys.
   */
  parseCombinedMealOptions(aiResponse, mealDist, mealKeys) {
    try {
      let cleaned = aiResponse.trim().replace(/```json|```/g, '');
      // Fix model outputting unit suffixes on numbers: "carbs": 25g → "carbs": 25
      cleaned = cleaned.replace(/:\s*(\d+(?:\.\d+)?)[a-zA-Z]+(?=[,\s}\]])/g, ': $1');
      const start = cleaned.indexOf('{');
      const end   = cleaned.lastIndexOf('}');
      if (start === -1 || end === -1) throw new Error('No JSON object in response');

      const parsed  = JSON.parse(cleaned.substring(start, end + 1));
      const result  = {};

      for (const key of mealKeys) {
        if (Array.isArray(parsed[key]) && parsed[key].length > 0) {
          result[key] = parsed[key].map(opt => ({
            option_name:      opt.option_name      || 'Option',
            description:      opt.description      || '',
            preparation_time: opt.preparation_time || '15 minutes',
            difficulty:       opt.difficulty       || 'Easy',
            items: Array.isArray(opt.items) ? opt.items.map(item => ({
              food:    item.food    || '',
              portion: item.portion || '1 serving',
              calories: Number(item.calories) || 0,
              carbs:    Number(item.carbs)    || 0,
              protein:  Number(item.protein)  || 0,
              fat:      Number(item.fat)      || 0,
              fiber:    Number(item.fiber)    || 0,
            })) : [],
            total_calories: Array.isArray(opt.items)
              ? opt.items.reduce((s, i) => s + (Number(i.calories) || 0), 0)
              : (mealDist[key] || 300),
          }));
        } else {
          console.warn(`⚠️  No valid options for ${key} — using fallback`);
          result[key] = this.getFallbackOptions(key, mealDist[key]);
        }
      }
      return result;
    } catch (err) {
      console.error('❌ parseCombinedMealOptions failed:', err.message);
      const fallback = {};
      mealKeys.forEach(k => { fallback[k] = this.getFallbackOptions(k, mealDist[k]); });
      return fallback;
    }
  }

  /**
   * Single fallback option when LLM output is unparseable for a meal type.
   */
  getFallbackOptions(mealKey, targetCalories) {
    const name = { breakfast:'Breakfast', mid_morning_snack:'Mid-Morning Snack', lunch:'Lunch', evening_snack:'Evening Snack', dinner:'Dinner' }[mealKey] || mealKey;
    const kcal = targetCalories || 300;
    return [{
      option_name:      `${name} Option`,
      description:      `Balanced diabetic-friendly ${name.toLowerCase()}`,
      preparation_time: '15 minutes',
      difficulty:       'Easy',
      items: [{ food: 'Balanced meal', portion: '1 serving', calories: kcal, carbs: Math.round(kcal * 0.45 / 4), protein: Math.round(kcal * 0.25 / 4), fat: Math.round(kcal * 0.30 / 9), fiber: 5 }],
      total_calories: kcal,
    }];
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
   * Call Diabetica-7B via Hugging Face Gradio API
   */
  async callDiabetica(prompt) {
    const hfBase = process.env.HF_SPACE_URL || 'https://zeeshanasghar02-diabetica-api.hf.space';
    // Gradio slider constraint: max_tokens must be 256–2048
    const rawTokens = parseInt(process.env.LM_STUDIO_MAX_TOKENS || '2048');
    const maxTokens = Math.min(Math.max(rawTokens, 256), 2048);
    const systemPrompt = 'You are a diabetes nutrition expert AI. You create diverse, culturally appropriate meal plans. Respond with ONLY valid JSON — no markdown, no code blocks, no explanations outside JSON.';

    try {
      console.log(`🤖 Calling Diabetica-7B via HF Gradio at ${hfBase}`);

      // Step 1: Submit job
      const submitRes = await axios.post(
        `${hfBase}/gradio_api/call/predict`,
        { data: [systemPrompt, prompt, maxTokens, 0.9] },
        { timeout: 30000 }
      );
      const { event_id } = submitRes.data;
      if (!event_id) throw new Error('HF Gradio did not return an event_id');
      console.log(`   HF event_id: ${event_id} — waiting for result...`);

      // Step 2: Read SSE stream (Gradio streams the result)
      const sseRes = await axios.get(
        `${hfBase}/gradio_api/call/predict/${event_id}`,
        { timeout: 300000, responseType: 'text' }  // 5 min timeout
      );

      // Step 3: Parse SSE — find last data line with the output
      const lines = sseRes.data.split('\n');
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        if (line.startsWith('data:')) {
          try {
            const json = JSON.parse(line.slice(5).trim());
            // Gradio complete event: [['output text'], extra]
            if (Array.isArray(json) && typeof json[0] === 'string') return json[0];
            if (Array.isArray(json) && Array.isArray(json[0])) return json[0][0];
            // Alternate format
            if (json?.output?.data?.[0]) return json.output.data[0];
          } catch { /* keep scanning */ }
        }
      }
      throw new Error(`Could not parse Gradio SSE response. Raw (first 500): ${sseRes.data.substring(0, 500)}`);

    } catch (error) {
      console.error('❌ Error calling HF Diabetica:', error.message);
      if (error.code === 'ECONNREFUSED' || error.response?.status === 503) {
        throw new Error('Diabetica model is offline. Please check the HF Space.');
      } else if (error.message.includes('timeout') || error.code === 'ECONNABORTED') {
        throw new Error('Diabetica model took too long. Please try again.');
      }
      throw new Error(`Diabetica error: ${error.message}`);
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
