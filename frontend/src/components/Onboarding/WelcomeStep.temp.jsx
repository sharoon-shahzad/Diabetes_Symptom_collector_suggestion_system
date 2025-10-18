import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  useTheme,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  HealthAndSafety,
  ArrowForward,
  Login,
} from '@mui/icons-material';
import { motion as _motion } from 'framer-motion';

const WelcomeStep = ({ onNext }) => {
  const theme = useTheme();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const navigate = useNavigate();

  const handleStartAssessment = () => {
    // Check if user is logged in
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setShowLoginDialog(true);
      return;
    }
    onNext();
  };

  const handleLoginRedirect = () => {
    navigate('/signin?returnTo=onboarding&returnToStep=1');
    setShowLoginDialog(false);
  };

  return (
    <Box sx={{ p: 6, textAlign: 'center' }}>
      <_motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Main Icon */}
        <_motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box
            sx={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
          >
            <HealthAndSafety sx={{ fontSize: 50, color: 'white' }} />
          </Box>
        </_motion.div>

        {/* Title */}
        <_motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Typography
            variant="h3"
            fontWeight={700}
            color="text.primary"
            gutterBottom
            sx={{ mb: 2 }}
          >
            Welcome to DiaVise
          </Typography>
        </_motion.div>

        {/* Description */}
        <_motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 500, mx: 'auto', mb: 6, lineHeight: 1.6 }}
          >
            Get your personalized diabetes risk assessment in just a few minutes. 
            Our AI-powered system will help you understand your health better.
          </Typography>
        </_motion.div>

        {/* Start Button */}
        <_motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button
            variant="contained"
            size="large"
            onClick={handleStartAssessment}
            endIcon={<ArrowForward />}
            sx={{
              py: 2,
              px: 6,
              fontSize: '1.1rem',
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Start Assessment
          </Button>
        </_motion.div>

        {/* Simple Info */}
        <_motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 4, opacity: 0.8 }}
          >
            Takes about 5-10 minutes • Completely free • Secure & private
          </Typography>
        </_motion.div>
      </_motion.div>

      {/* Login Dialog */}
      <Dialog 
        open={showLoginDialog} 
        onClose={() => setShowLoginDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Login color="primary" />
            <Typography variant="h6">Login Required</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You need to be logged in to start the assessment.
          </Alert>
          <Typography variant="body1" paragraph>
            Please log in to begin your diabetes risk assessment. Your progress will be saved, and you can access your results anytime.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={() => setShowLoginDialog(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleLoginRedirect}
            startIcon={<Login />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
            }}
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WelcomeStep;