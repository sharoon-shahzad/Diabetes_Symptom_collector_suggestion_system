import express from 'express';
import { getAllDiseases, addDisease, updateDisease, deleteDisease } from '../controllers/diseaseController.js';

const router = express.Router();

// Get all diseases
router.get('/', getAllDiseases);
// Add a new disease
router.post('/', addDisease);
// Update a disease
router.put('/:id', updateDisease);
// Delete a disease
router.delete('/:id', deleteDisease);

export default router; 