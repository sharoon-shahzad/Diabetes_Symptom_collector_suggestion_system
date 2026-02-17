import lifestyleTipsService from '../services/lifestyleTipsService.js';
import LifestyleTip from '../models/LifestyleTip.js';
import { User } from '../models/User.js';
import { generateLifestyleTipsPDF } from '../services/pdfGenerationService.js';
import { sendLifestyleTipsEmail } from '../services/emailService.js';

export const autoGenerateLifestyleTips = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target_date = today.toISOString().split('T')[0];

    try {
      const result = await lifestyleTipsService.generateLifestyleTips(userId, target_date);

      // Generate PDF and send email in background
      setImmediate(async () => {
        try {
          const user = await User.findById(userId);
          if (user && user.email) {
            const userInfo = {
              fullName: user.fullName,
              email: user.email
            };
            
            const pdfPath = await generateLifestyleTipsPDF(result.tips, userInfo);
            await sendLifestyleTipsEmail(user.email, user.fullName, pdfPath, result.tips);
            console.log('✅ Lifestyle tips email sent successfully to:', user.email);
          }
        } catch (emailError) {
          console.error('❌ Error sending lifestyle tips email:', emailError.message);
        }
      });

      return res.status(201).json({
        ...result,
        emailSent: true
      });
    } catch (error) {
      // If duplicate key error, fetch and return existing plan
      if (error.code === 11000 || error.message.includes('already exist')) {
        const existingTips = await LifestyleTip.findOne({
          user_id: userId,
          target_date: target_date
        });
        
        if (existingTips) {
          return res.status(200).json({
            success: true,
            message: 'Lifestyle tips already exist for today',
            tips: existingTips,
            isExisting: true
          });
        }
      }
      throw error;
    }
  } catch (error) {
    console.error('Auto-generate tips error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'AI generator is unavailable or timed out. Please ensure LM Studio is running.',
    });
  }
};

export const generateLifestyleTips = async (req, res) => {
  try {
    const { target_date } = req.body;
    const userId = req.user._id;

    if (!target_date) {
      return res.status(400).json({
        success: false,
        message: 'target_date is required',
      });
    }

    // Validate date
    const date = new Date(target_date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format',
      });
    }

    // Check if date is today or in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return res.status(400).json({
        success: false,
        message: 'Cannot generate tips for past dates',
      });
    }

    // Check if date is within 5 days
    const maxDate = new Date(today);
    maxDate.setDate(maxDate.getDate() + 5);
    if (date > maxDate) {
      return res.status(400).json({
        success: false,
        message: 'Can only generate tips for the next 5 days',
      });
    }

    const result = await lifestyleTipsService.generateLifestyleTips(userId, target_date);

    // Generate PDF and send email in background
    setImmediate(async () => {
      try {
        const user = await User.findById(userId);
        if (user && user.email) {
          const userInfo = {
            fullName: user.fullName,
            email: user.email
          };
          
          const pdfPath = await generateLifestyleTipsPDF(result.tips, userInfo);
          await sendLifestyleTipsEmail(user.email, user.fullName, pdfPath, result.tips);
          console.log('✅ Lifestyle tips email sent successfully to:', user.email);
        }
      } catch (emailError) {
        console.error('❌ Error sending lifestyle tips email:', emailError.message);
        // Don't fail the request if email fails
      }
    });

    return res.status(201).json({
      ...result,
      emailSent: true
    });
  } catch (error) {
    console.error('Generate tips error:', error);

    if (error.message.includes('already exist')) {
      return res.status(409).json({
        success: false,
        message: 'Tips already exist for this date',
      });
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate lifestyle tips',
    });
  }
};

export const getCurrentTips = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const tips = await LifestyleTip.findOne({
      user_id: userId,
      target_date: today,
    });

    if (!tips) {
      return res.status(404).json({
        success: false,
        message: 'No tips found for today',
      });
    }

    return res.status(200).json({
      success: true,
      tips: tips.toObject(),
    });
  } catch (error) {
    console.error('Get current tips error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch current tips',
    });
  }
};

export const getTipsByDate = async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user._id;

    const tips = await lifestyleTipsService.getLifestyleTipsByDate(userId, date);

    if (!tips) {
      return res.status(404).json({
        success: false,
        message: 'No tips found for this date',
      });
    }

    return res.status(200).json({
      success: true,
      tips: tips.toObject(),
    });
  } catch (error) {
    console.error('Get tips by date error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tips',
    });
  }
};

export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);

    const history = await lifestyleTipsService.getLifestyleTipsHistory(userId, limit);

    return res.status(200).json({
      success: true,
      history,
      count: history.length,
    });
  } catch (error) {
    console.error('Get history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch history',
    });
  }
};

export const updateChecklistItem = async (req, res) => {
  try {
    const { tipsId } = req.params;
    const { taskIndex, completed } = req.body;
    const userId = req.user._id;

    if (taskIndex === undefined || completed === undefined) {
      return res.status(400).json({
        success: false,
        message: 'taskIndex and completed are required',
      });
    }

    const tips = await lifestyleTipsService.updateChecklistItem(userId, tipsId, taskIndex, completed);

    return res.status(200).json({
      success: true,
      message: 'Checklist item updated',
      tips: tips.toObject(),
    });
  } catch (error) {
    console.error('Update checklist error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Tips not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update checklist',
    });
  }
};

export const updateTipCompletion = async (req, res) => {
  try {
    const { tipsId, categoryIndex, tipIndex } = req.params;
    const { completed } = req.body;
    const userId = req.user._id;

    if (completed === undefined) {
      return res.status(400).json({
        success: false,
        message: 'completed is required',
      });
    }

    const tips = await lifestyleTipsService.updateTipCompletion(
      userId,
      tipsId,
      parseInt(categoryIndex),
      parseInt(tipIndex),
      completed
    );

    return res.status(200).json({
      success: true,
      message: 'Tip completion updated',
      tips: tips.toObject(),
    });
  } catch (error) {
    console.error('Update tip completion error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Tips not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update tip',
    });
  }
};

export const getTipsById = async (req, res) => {
  try {
    const { tipsId } = req.params;
    const userId = req.user._id;

    const tips = await LifestyleTip.findOne({ _id: tipsId, user_id: userId });

    if (!tips) {
      return res.status(404).json({
        success: false,
        message: 'Tips not found',
      });
    }

    return res.status(200).json({
      success: true,
      tips: tips.toObject(),
    });
  } catch (error) {
    console.error('Get tips by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tips',
    });
  }
};

export const deleteLifestyleTips = async (req, res) => {
  try {
    const { tipsId } = req.params;
    const userId = req.user._id;

    await lifestyleTipsService.deleteLifestyleTips(userId, tipsId);

    return res.status(200).json({
      success: true,
      message: 'Lifestyle tips deleted successfully',
    });
  } catch (error) {
    console.error('Delete tips error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Tips not found',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to delete tips',
    });
  }
};

export const getRegionCoverage = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const region = user.region || user.medicalInfo?.region || 'Global';

    const guidelinesContext = await lifestyleTipsService.queryRegionalLifestyleGuidelines(region);

    return res.status(200).json({
      success: true,
      coverage: {
        region,
        canGenerateTips: true,
        documentCount: guidelinesContext.sources.length,
        coverage: guidelinesContext.sources.length > 0 ? 'Available' : 'Limited',
      },
    });
  } catch (error) {
    console.error('Get region coverage error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch region coverage',
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await lifestyleTipsService.getUserStats(userId);

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
    });
  }
};
