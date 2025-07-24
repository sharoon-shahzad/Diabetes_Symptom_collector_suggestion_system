import express from 'express';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';
import { getCurrentUser, getAllUsers } from '../controllers/userController.js';
import { roleCheckMiddleware } from '../middlewares/roleCheckMiddleware.js';

const router = express.Router();

router.get('/profile', verifyAccessTokenMiddleware, getCurrentUser);


//! protected routes for admin
router.get('/allUsers', verifyAccessTokenMiddleware, roleCheckMiddleware, getAllUsers);

router.put('/updateUser/:id', verifyAccessTokenMiddleware, roleCheckMiddleware, updateUser);

router.delete('/deleteUser/:id', verifyAccessTokenMiddleware, roleCheckMiddleware, deleteUser);


export default router;
