import express from 'express';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';
import { getCurrentUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/user/profile', verifyAccessTokenMiddleware, getCurrentUser);

export default router;
