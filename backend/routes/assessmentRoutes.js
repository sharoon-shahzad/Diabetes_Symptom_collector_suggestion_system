import express from 'express';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';
import { requirePermission } from '../middlewares/permissionMiddleware.js';
import { assessDiabetes } from '../controllers/assessmentController.js';

const router = express.Router();

router.post('/diabetes', verifyAccessTokenMiddleware, requirePermission('disease:view:own'), assessDiabetes);

export default router;




