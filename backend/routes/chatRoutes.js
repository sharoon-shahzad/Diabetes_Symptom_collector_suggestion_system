import express from 'express';
import { completeChat } from '../controllers/chatController.js';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/complete', verifyAccessTokenMiddleware, completeChat);

export default router;
