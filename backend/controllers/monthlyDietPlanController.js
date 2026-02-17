import monthlyDietPlanService from '../services/monthlyDietPlanService.js';

/**
 * Generate a new monthly diet plan
 * POST /api/monthly-diet-plan/generate
 */
export const generateMonthlyDietPlan = async (req, res) => {
  try {
    console.log('📥 generateMonthlyDietPlan called');
    console.log('User:', req.user?.email);
    
    const { month, year } = req.body;
    const userId = req.user._id;
    
    // Validate inputs
    if (!month || !year) {
      return res.status(400).json({
        success: false,
        error: 'Month and year are required'
      });
    }
    
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        error: 'Invalid month. Must be between 1 and 12'
      });
    }
    
    if (isNaN(yearNum) || yearNum < 2020 || yearNum > 2100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid year'
      });
    }
    
    // Generate the plan
    console.log(`🚀 Generating monthly diet plan for ${monthNum}/${yearNum}...`);
    const result = await monthlyDietPlanService.generateMonthlyDietPlan(userId, monthNum, yearNum);
    
    return res.status(201).json({
      success: true,
      message: 'Monthly diet plan generated successfully',
      ...result
    });
    
  } catch (error) {
    console.error('❌ Error in generateMonthlyDietPlan controller:', error);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }
    
    if (error.message.includes('not found') || error.message.includes('No dietary documents')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to generate monthly diet plan. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get active monthly diet plan
 * GET /api/monthly-diet-plan/current
 */
export const getCurrentMonthlyDietPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const plan = await monthlyDietPlanService.getActiveMonthlyPlan(userId);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'No active monthly diet plan found. Generate one to get started!'
      });
    }
    
    return res.status(200).json({
      success: true,
      plan
    });
    
  } catch (error) {
    console.error('❌ Error in getCurrentMonthlyDietPlan controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve current monthly diet plan'
    });
  }
};

/**
 * Get monthly diet plan by ID
 * GET /api/monthly-diet-plan/:planId
 */
export const getMonthlyDietPlanById = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user._id;
    
    const MonthlyDietPlan = (await import('../models/MonthlyDietPlan.js')).default;
    
    const plan = await MonthlyDietPlan.findOne({
      _id: planId,
      user_id: userId
    });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Monthly diet plan not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      plan
    });
    
  } catch (error) {
    console.error('❌ Error in getMonthlyDietPlanById controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve monthly diet plan'
    });
  }
};

/**
 * Get monthly diet plan history
 * GET /api/monthly-diet-plan/history?limit=12
 */
export const getMonthlyDietPlanHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 12;
    
    if (limit < 1 || limit > 24) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 24'
      });
    }
    
    const plans = await monthlyDietPlanService.getMonthlyPlanHistory(userId, limit);
    
    return res.status(200).json({
      success: true,
      count: plans.length,
      plans
    });
    
  } catch (error) {
    console.error('❌ Error in getMonthlyDietPlanHistory controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve monthly diet plan history'
    });
  }
};

/**
 * Delete a monthly diet plan
 * DELETE /api/monthly-diet-plan/:planId
 */
export const deleteMonthlyDietPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user._id;
    
    if (!planId) {
      return res.status(400).json({
        success: false,
        error: 'Plan ID is required'
      });
    }
    
    const deleted = await monthlyDietPlanService.deleteMonthlyPlan(userId, planId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Monthly diet plan not found or already deleted'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Monthly diet plan deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error in deleteMonthlyDietPlan controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete monthly diet plan'
    });
  }
};

/**
 * Save daily meal selections
 * POST /api/monthly-diet-plan/:planId/select
 */
export const saveDailySelection = async (req, res) => {
  try {
    const { planId } = req.params;
    const { date, selections } = req.body;
    const userId = req.user._id;
    
    if (!date || !selections) {
      return res.status(400).json({
        success: false,
        error: 'Date and selections are required'
      });
    }
    
    // Validate selections structure
    const requiredFields = ['breakfast', 'mid_morning_snack', 'lunch', 'evening_snack', 'dinner'];
    const missingFields = requiredFields.filter(field => !selections[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Missing selections for: ${missingFields.join(', ')}`
      });
    }
    
    const updatedPlan = await monthlyDietPlanService.saveDailySelection(
      userId,
      planId,
      date,
      selections
    );
    
    return res.status(200).json({
      success: true,
      message: 'Daily selection saved successfully',
      plan: updatedPlan
    });
    
  } catch (error) {
    console.error('❌ Error in saveDailySelection controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save daily selection'
    });
  }
};

/**
 * Get meal option details
 * GET /api/monthly-diet-plan/:planId/option/:mealType/:optionName
 */
export const getMealOptionDetails = async (req, res) => {
  try {
    const { planId, mealType, optionName } = req.params;
    const userId = req.user._id;
    
    const MonthlyDietPlan = (await import('../models/MonthlyDietPlan.js')).default;
    
    const plan = await MonthlyDietPlan.findOne({
      _id: planId,
      user_id: userId
    });
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Monthly diet plan not found'
      });
    }
    
    const option = plan.getMealOption(mealType, decodeURIComponent(optionName));
    
    if (!option) {
      return res.status(404).json({
        success: false,
        error: 'Meal option not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      option
    });
    
  } catch (error) {
    console.error('❌ Error in getMealOptionDetails controller:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve meal option details'
    });
  }
};
