import express from 'express';
import { getSymptomsByDisease, addSymptom, updateSymptom, deleteSymptom } from '../controllers/symptomController.js';

const router = express.Router();

// Get all symptoms for a disease
router.get('/:diseaseId', getSymptomsByDisease);
// Add a symptom to a disease
router.post('/:diseaseId', addSymptom);
// Update a symptom
router.put('/:id', updateSymptom);
// Delete a symptom
router.delete('/:id', deleteSymptom);

export default router; 