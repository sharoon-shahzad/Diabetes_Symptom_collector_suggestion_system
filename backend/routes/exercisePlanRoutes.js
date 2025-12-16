import express from 'express';
import * as exercisePlanController from '../controllers/exercisePlanController.js';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyAccessTokenMiddleware);

// Order: specific before generic where necessary
router.get('/region-coverage', exercisePlanController.checkUserRegionCoverage);
router.get('/regions', exercisePlanController.getAvailableRegions);

router.post('/generate', exercisePlanController.generateExercisePlan);
router.get('/current', exercisePlanController.getCurrentExercisePlan);
router.get('/date/:date', exercisePlanController.getExercisePlanByDate);
router.get('/history', exercisePlanController.getExercisePlanHistory);
router.delete('/:planId', exercisePlanController.deleteExercisePlan);

export default router;
