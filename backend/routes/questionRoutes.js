import express from 'express';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';
import { 
  getQuestionsByDisease, 
  getSymptomsByDisease,
  getQuestionsBySymptom,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  saveUserAnswer
} from '../controllers/questionController.js';

const router = express.Router();

// Get all questions for a disease
router.get('/questions/:diseaseId', getQuestionsByDisease);
// Get all symptoms for a disease
router.get('/symptoms/:diseaseId', getSymptomsByDisease);
// Get all questions for a symptom
router.get('/questions/symptom/:symptomId', getQuestionsBySymptom);
// Add a question to a symptom
router.post('/questions/symptom/:symptomId', addQuestion);
// Update a question
router.put('/questions/:id', updateQuestion);
// Delete a question
router.delete('/questions/:id', deleteQuestion);
// Save user's answer for onboarding
router.post('/answer', verifyAccessTokenMiddleware, saveUserAnswer);

export default router; 