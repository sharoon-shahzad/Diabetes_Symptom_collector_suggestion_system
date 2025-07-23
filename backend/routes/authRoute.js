import express from 'express';
import { 
  register, 
  activateAccount, 
  login, 
  forgotPassword, 
  resetPassword, 
  logout, 
  getCurrentUser, 
  refreshAccessToken, 
  resendActivationLink, 
  changePassword 
} from '../controllers/authController.js';
import { verifyAccessTokenMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Registration route
router.post('/register', register);
// Account activation route
router.get('/activate/:token', activateAccount);
// Login route
router.post('/login', login);
// Resend activation link route
router.post('/resend-activation', resendActivationLink);
// Change password route (protected)
router.post('/change-password', verifyAccessTokenMiddleware, changePassword);
// Logout route
router.get('/logout', logout);
// Get current user route (protected)
router.get('/profile', verifyAccessTokenMiddleware, getCurrentUser);
// Refresh access token route
router.post('/refresh-token', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router; 