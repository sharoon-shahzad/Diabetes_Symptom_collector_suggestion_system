import express from 'express';
import {
    getPersonalInfo,
    upsertPersonalInfo,
    getMedicalInfo,
    upsertMedicalInfo,
    updateDiabetesDiagnosis,
} from '../controllers/personalizedSystemController.js';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(verifyAccessTokenMiddleware);

// Personal information routes
router.get('/personal-info', getPersonalInfo);
router.post('/personal-info', upsertPersonalInfo);
router.put('/personal-info', upsertPersonalInfo);

// Medical information routes
router.get('/medical-info', getMedicalInfo);
router.post('/medical-info', upsertMedicalInfo);
router.put('/medical-info', upsertMedicalInfo);

// Diabetes diagnosis status
router.post('/diabetes-diagnosis', updateDiabetesDiagnosis);

export default router;
