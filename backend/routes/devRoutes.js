import express from 'express';
import ExercisePlan from '../models/ExercisePlan.js';
import LifestyleTip from '../models/LifestyleTip.js';

const router = express.Router();

// Delete all exercise plans for today (for testing purposes)
router.delete('/clear-today', async (req, res) => {
  try {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Delete plans for today
    const result = await ExercisePlan.deleteMany({
      target_date: {
        $gte: new Date(`${todayStr}T00:00:00.000Z`),
        $lt: new Date(`${todayStr}T23:59:59.999Z`)
      }
    });

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} exercise plan(s) for today`,
      deletedCount: result.deletedCount,
      date: todayStr
    });
  } catch (error) {
    console.error('Error deleting today\'s plans:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete plans'
    });
  }
});

// Delete all lifestyle tips for today (for testing purposes)
router.delete('/clear-today-tips', async (req, res) => {
  try {
    // Use same date logic as the generation endpoint
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Delete tips for today using UTC midnight comparison
    const targetDateObj = new Date(todayStr);
    targetDateObj.setUTCHours(0, 0, 0, 0);
    
    const result = await LifestyleTip.deleteMany({
      target_date: targetDateObj
    });

    console.log(`🗑️ Deleted ${result.deletedCount} lifestyle tips for ${todayStr} (${targetDateObj.toISOString()})`);

    return res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} lifestyle tip(s) for today`,
      deletedCount: result.deletedCount,
      date: todayStr
    });
  } catch (error) {
    console.error('Error deleting today\'s tips:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete tips'
    });
  }
});

export default router;
