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

// Test email endpoint (remove in production)
router.post('/test-email', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }
        
        console.log('🧪 Testing completion email for:', email);
        
        const { sendOnboardingCompletionEmail } = await import('../services/emailService.js');
        await sendOnboardingCompletionEmail(email, 'Test User', 'Test Disease', {
            'Test Symptom': [
                { question: 'Test Question 1', answer: 'Test Answer 1' },
                { question: 'Test Question 2', answer: 'Test Answer 2' }
            ]
        });
        
        res.status(200).json({ message: 'Test completion email sent successfully!' });
    } catch (error) {
        console.error('Test email error:', error);
        res.status(500).json({ message: 'Test email failed', error: error.message });
    }
});

// Test completion email endpoint (remove in production)
router.post('/test-completion-email', async (req, res) => {
    try {
        const { email, userName, diseaseName } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }
        
        console.log('🧪 Testing completion email with custom data:', { email, userName, diseaseName });
        
        const { sendOnboardingCompletionEmail } = await import('../services/emailService.js');
        await sendOnboardingCompletionEmail(
            email, 
            userName || 'Test User', 
            diseaseName || 'Test Disease', 
            {
                'Blood Sugar': [
                    { question: 'What is your fasting blood sugar level?', answer: '120 mg/dL' },
                    { question: 'How often do you check your blood sugar?', answer: 'Twice daily' }
                ],
                'Weight Management': [
                    { question: 'Have you experienced weight changes?', answer: 'Yes, lost 5 kg' },
                    { question: 'What is your current BMI?', answer: '25.5' }
                ]
            }
        );
        
        res.status(200).json({ message: 'Custom completion email sent successfully!' });
    } catch (error) {
        console.error('Custom test email error:', error);
        res.status(500).json({ message: 'Custom test email failed', error: error.message });
    }
});

export default router; 