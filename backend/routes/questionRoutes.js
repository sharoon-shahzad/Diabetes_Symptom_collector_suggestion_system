import express from 'express';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermission, requireAnyPermission } from '../middlewares/permissionMiddleware.js';
import { 
  getQuestionsByDisease, 
  getQuestionsBySymptom,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  saveUserAnswer
} from '../controllers/questionController.js';

const router = express.Router();

// Public endpoint for onboarding - no authentication required
router.get('/public/symptom/:symptomId', getQuestionsBySymptom);

// Get all questions for a disease - requires either admin read or onboarding access
router.get('/questions/:diseaseId', verifyAccessTokenMiddleware, requireAnyPermission(['question:view:all', 'onboarding:access:own']), getQuestionsByDisease);

// Get all questions for a symptom - requires either admin read or onboarding access
router.get('/questions/symptom/:symptomId', verifyAccessTokenMiddleware, requireAnyPermission(['question:view:all', 'onboarding:access:own']), getQuestionsBySymptom);

// Add a question to a symptom - requires question creation permission
router.post('/questions/symptom/:symptomId', verifyAccessTokenMiddleware, requirePermission('question:create:all'), addQuestion);

// Update a question - requires question update permission
router.put('/questions/:id', verifyAccessTokenMiddleware, requirePermission('question:update:all'), updateQuestion);

// Delete a question - requires question deletion permission
router.delete('/questions/:id', verifyAccessTokenMiddleware, requirePermission('question:delete:all'), deleteQuestion);

// Save user's answer for onboarding - requires authentication and submit permission
router.post('/answer', verifyAccessTokenMiddleware, requirePermission('answer:submit:own'), saveUserAnswer);

export default router; 