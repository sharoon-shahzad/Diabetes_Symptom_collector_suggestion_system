import exercisePlanService from '../services/exercisePlanService.js';
import regionDiscoveryService from '../services/regionDiscoveryService.js';
import { generateExercisePlanPDF } from '../services/pdfGenerationService.js';
import { sendExercisePlanEmail } from '../services/emailService.js';
import { User } from '../models/User.js';

const generateExercisePlan = async (req, res) => {
  try {
    const { target_date } = req.body;
    const userId = req.user._id;
    if (!target_date) return res.status(400).json({ success:false, error:'Target date is required (format: YYYY-MM-DD)' });

    // Robust date parsing to avoid timezone issues
    const [yStr, mStr, dStr] = String(target_date).split('-');
    const y = parseInt(yStr, 10), m = parseInt(mStr, 10), d = parseInt(dStr, 10);
    const target = new Date(y, (m || 1) - 1, d || 1); // local midnight
    const today = new Date();
    today.setHours(0,0,0,0);
    target.setHours(0,0,0,0);
    if (isNaN(target.getTime())) return res.status(400).json({ success:false, error:'Invalid date format. Use YYYY-MM-DD' });
    const diff = Math.floor((target.getTime() - today.getTime()) / (1000*60*60*24));
    if (diff < 0) return res.status(400).json({ success:false, error:'Cannot generate plans for past dates' });
    if (diff > 5) return res.status(400).json({ success:false, error:'Can only generate plans up to 5 days ahead' });

    const result = await exercisePlanService.generateExercisePlan(userId, target_date, req.body.goal);
    
    // Generate PDF and send email in background
    setImmediate(async () => {
      try {
        const user = await User.findById(userId);
        if (user && user.email) {
          const userInfo = {
            fullName: user.fullName,
            email: user.email
          };
          
          const pdfPath = await generateExercisePlanPDF(result.plan, userInfo);
          await sendExercisePlanEmail(user.email, user.fullName, pdfPath, result.plan);
          console.log('✅ Exercise plan email sent successfully to:', user.email);
        }
      } catch (emailError) {
        console.error('❌ Error sending exercise plan email:', emailError.message);
        // Don't fail the request if email fails
      }
    });
    
    return res.status(201).json({ success:true, message:'Exercise plan generated successfully', emailSent: true, ...result });
  } catch (error) {
    console.error('Error in generateExercisePlan controller:', error);
    if (error.message.includes('already exists')) return res.status(409).json({ success:false, error:error.message });
    // Map common generation preconditions to client-understandable statuses
    if (error.message.includes('Personal information not found')) {
      return res.status(400).json({ success:false, error:'Please complete your profile (Personal Info) before generating an exercise plan.' });
    }
    if (error.message.includes('not found') || error.message.includes('No exercise documents') || error.message.includes('Unable to retrieve')) {
      return res.status(404).json({ success:false, error:error.message });
    }
    if (error.message.includes('LM Studio')) {
      return res.status(503).json({ success:false, error:error.message });
    }
    return res.status(500).json({ success:false, error:'Failed to generate exercise plan. Please try again.', details: process.env.NODE_ENV==='development'? error.message: undefined });
  }
};

const getExercisePlanByDate = async (req, res) => {
  try {
    const { date } = req.params; const userId = req.user._id;
    if (!date) return res.status(400).json({ success:false, error:'Date parameter is required' });
    const plan = await exercisePlanService.getExercisePlanByDate?.(userId, date) || null;
    if (!plan) return res.status(404).json({ success:false, error:'No exercise plan found for this date' });
    return res.status(200).json({ success:true, plan });
  } catch (error) {
    console.error('Error in getExercisePlanByDate controller:', error);
    return res.status(500).json({ success:false, error:'Failed to get exercise plan' });
  }
};

const getCurrentExercisePlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date(); const date = today.toISOString().split('T')[0];
    const plan = await exercisePlanService.getExercisePlanByDate?.(userId, date) || null;
    if (!plan) return res.status(404).json({ success:false, error:'No exercise plan found for today' });
    return res.status(200).json({ success:true, plan });
  } catch (error) {
    console.error('Error in getCurrentExercisePlan controller:', error);
    return res.status(500).json({ success:false, error:'Failed to get current exercise plan' });
  }
};

const getExercisePlanHistory = async (req, res) => {
  try {
    const userId = req.user._id; const limit = Math.min(parseInt(req.query.limit||'10'), 50);
    const plans = await exercisePlanService.getExercisePlanHistory?.(userId, limit) || [];
    return res.status(200).json({ success:true, data: plans });
  } catch (error) {
    console.error('Error in getExercisePlanHistory controller:', error);
    return res.status(500).json({ success:false, error:'Failed to get exercise plan history' });
  }
};

const getExercisePlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const plan = await exercisePlanService.getExercisePlanById(userId, id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Exercise plan not found' });
    }
    return res.status(200).json({ success: true, data: plan });
  } catch (error) {
    console.error('Error in getExercisePlanById controller:', error);
    return res.status(500).json({ success: false, error: 'Failed to retrieve exercise plan' });
  }
};

const downloadExercisePlanPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const plan = await exercisePlanService.getExercisePlanById(userId, id);
    if (!plan) {
      return res.status(404).json({ success: false, error: 'Exercise plan not found' });
    }
    const user = await User.findById(userId);
    const userInfo = { fullName: user.fullName, email: user.email };
    const pdfPath = await generateExercisePlanPDF(plan, userInfo);
    res.download(pdfPath, `Exercise-Plan-${plan.start_date}.pdf`);
  } catch (error) {
    console.error('Error in downloadExercisePlanPDF controller:', error);
    return res.status(500).json({ success: false, error: 'Failed to download PDF' });
  }
};

const deleteExercisePlan = async (req, res) => {
  try {
    const userId = req.user._id; const { planId } = req.params;
    await exercisePlanService.deleteExercisePlan?.(userId, planId);
    return res.status(200).json({ success:true, message:'Exercise plan deleted' });
  } catch (error) {
    console.error('Error in deleteExercisePlan controller:', error);
    return res.status(500).json({ success:false, error:'Failed to delete exercise plan' });
  }
};

const checkUserRegionCoverage = async (req, res) => {
  try {
    const userId = req.user._id; const { User } = await import('../models/User.js');
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success:false, error:'User not found' });
    const userCountry = user.country || user.address?.country || 'Unknown';
    const coverage = await regionDiscoveryService.checkRegionCoverage(userCountry, 'exercise_recommendation');
    return res.status(200).json({ success:true, coverage });
  } catch (error) {
    console.error('Error in checkUserRegionCoverage controller:', error);
    return res.status(500).json({ success:false, error:'Failed to check region coverage' });
  }
};

const getAvailableRegions = async (req, res) => {
  try {
    const regions = await regionDiscoveryService.getAllRegionStats?.('exercise_recommendation');
    return res.status(200).json({ success:true, regions });
  } catch (error) {
    console.error('Error in getAvailableRegions controller:', error);
    return res.status(500).json({ success:false, error:'Failed to get regions' });
  }
};

const autoGenerateExercisePlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    const target_date = today.toISOString().split('T')[0];
    
    console.log(`🤖 Auto-generating exercise plan for user ${userId} on ${target_date}`);
    
    // Check if plan already exists for today
    const [yStr, mStr, dStr] = String(target_date).split('-');
    const y = parseInt(yStr, 10), m = parseInt(mStr, 10), d = parseInt(dStr, 10);
    const target = new Date(y, (m || 1) - 1, d || 1);
    target.setHours(0,0,0,0);
    
    const existingPlan = await exercisePlanService.getExercisePlanByDate?.(userId, target_date);
    
    if (existingPlan) {
      console.log('✅ Exercise plan already exists for today');
      return res.status(200).json({ 
        success: true, 
        message: 'Exercise plan already exists for today',
        plan: existingPlan,
        alreadyExists: true 
      });
    }
    
    // Generate new plan with duplicate key error handling
    let result;
    try {
      result = await exercisePlanService.generateExercisePlan(userId, target_date);
    } catch (genError) {
      // Handle race condition - if plan was created by another request
      if (genError.code === 11000 || genError.message?.includes('duplicate key')) {
        console.log('⚠️ Race condition detected - plan already created by another request');
        const existingPlan = await exercisePlanService.getExercisePlanByDate?.(userId, target_date);
        if (existingPlan) {
          return res.status(200).json({ 
            success: true, 
            message: 'Exercise plan already exists for today',
            plan: existingPlan,
            alreadyExists: true 
          });
        }
      }
      throw genError; // Re-throw if not a duplicate key error
    }
    
    // Generate PDF and send email in background
    setImmediate(async () => {
      try {
        const user = await User.findById(userId);
        if (user && user.email) {
          const userInfo = {
            fullName: user.fullName,
            email: user.email
          };
          
          const pdfPath = await generateExercisePlanPDF(result.plan, userInfo);
          await sendExercisePlanEmail(user.email, user.fullName, pdfPath, result.plan);
          console.log('✅ Exercise plan email sent successfully to:', user.email);
        }
      } catch (emailError) {
        console.error('❌ Error sending exercise plan email:', emailError.message);
      }
    });
    
    return res.status(201).json({ 
      success: true, 
      message: 'Exercise plan auto-generated successfully', 
      emailSent: true, 
      alreadyExists: false,
      ...result 
    });
  } catch (error) {
    console.error('Error in autoGenerateExercisePlan controller:', error);
    
    // Map common generation preconditions to client-understandable statuses
    if (error.message.includes('Personal information not found')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Please complete your profile (Personal Info) before generating an exercise plan.' 
      });
    }
    if (error.message.includes('not found') || error.message.includes('No exercise documents') || error.message.includes('Unable to retrieve')) {
      return res.status(404).json({ success: false, error: error.message });
    }
    if (error.message.includes('LM Studio')) {
      return res.status(503).json({ success: false, error: error.message });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to auto-generate exercise plan. Please try again.', 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

export { generateExercisePlan, getExercisePlanByDate, getCurrentExercisePlan, getExercisePlanHistory, getExercisePlanById, downloadExercisePlanPDF, deleteExercisePlan, checkUserRegionCoverage, getAvailableRegions, autoGenerateExercisePlan };
