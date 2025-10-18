import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  Chip,
  IconButton,
  alpha,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  HealthAndSafety,
  Assessment,
  Psychology,
  TrendingUp,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  Close,
  MedicalServices,
  Login,
} from '@mui/icons-material';
import { motion as _motion } from 'framer-motion';
import ThemeToggle from '../components/Common/ThemeToggle';
import { getCurrentUser } from '../utils/auth';
import WelcomeStep from '../components/Onboarding/WelcomeStep';
import QuestionFlowStep from '../components/Onboarding/QuestionFlowStep';
import AssessmentSummaryStep from '../components/Onboarding/AssessmentSummaryStep';

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [loginRedirectStep, setLoginRedirectStep] = useState(null);

  useEffect(() => {
    // Validate user token by fetching current user (refresh if needed)
    let cancelled = false;
    const validate = async () => {
      const user = await getCurrentUser();
      if (cancelled) return;
      const logged = !!user;
      setIsLoggedIn(logged);

      // If not logged in and user is on a guarded step, redirect to signin immediately
      if (!logged && activeStep > 0) {
        // remember where the user tried to go
        setLoginRedirectStep(activeStep);
        // perform immediate redirect to signin so component never shows guarded content
        const lastSymptomId = selectedSymptoms.length ? selectedSymptoms[selectedSymptoms.length - 1] : null;
        navigate(`/signin?returnTo=onboarding&returnToStep=${activeStep}${lastSymptomId ? `&symptomId=${lastSymptomId}` : ''}`);
        return;
      }

      // If returning from login (query params present) and we are logged in, restore the intended step
      const params = new URLSearchParams(location.search);
      const returnToStep = params.get('returnToStep');
      const returnSymptomId = params.get('symptomId');
      if (returnToStep && logged) {
        setActiveStep(parseInt(returnToStep, 10));
        if (returnSymptomId) {
          setSelectedSymptoms((prev) => prev.includes(returnSymptomId) ? prev : [...prev, returnSymptomId]);
        }
      }
    };

    validate();
    return () => { cancelled = true; };
  }, [location, activeStep, navigate, selectedSymptoms]);

  const steps = [
    {
      label: 'Welcome',
      description: 'Get started with your health assessment',
      icon: <HealthAndSafety />,
      component: WelcomeStep,
    },
    {
      label: 'Answer Questions',
      description: 'Provide detailed information about your symptoms',
      icon: <Assessment />,
      component: QuestionFlowStep,
    },
    {
      label: 'Review & Complete',
      description: 'Review your assessment and get results',
      icon: <TrendingUp />,
      component: AssessmentSummaryStep,
    },
  ];

  const handleNext = async () => {
    // Validate current user immediately when user clicks next.
    // This avoids relying on possibly-stale `isLoggedIn` state.
    const nextStep = Math.min(activeStep + 1, steps.length - 1);
    // Only guard step index 1 (Answer Questions)
    if (nextStep === 1) {
      const user = await getCurrentUser();
      setIsLoggedIn(!!user);
      if (!user) {
        const targetStep = nextStep;
        const lastSymptomId = selectedSymptoms.length ? selectedSymptoms[selectedSymptoms.length - 1] : null;
        navigate(`/signin?returnTo=onboarding&returnToStep=${targetStep}${lastSymptomId ? `&symptomId=${lastSymptomId}` : ''}`);
        return;
      }
    }

    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
      setCompletedSteps((prev) => new Set([...prev, activeStep]));
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleAnswersSubmit = (answersData) => {
    // Check if user is logged in before submitting answers
    if (!isLoggedIn) {
      setLoginRedirectStep(activeStep);
      setShowLoginDialog(true);
      // Save answers temporarily
      setAnswers(answersData);
      return;
    }
    
    setAnswers(answersData);
    handleNext();
  };

  const handleComplete = () => {
    // Navigate to dashboard or results page
    navigate('/dashboard');
  };
  
  const handleLoginRedirect = () => {
    // Save intended step and redirect to sign-in; return back to onboarding
    const targetStep = loginRedirectStep ?? activeStep;
    const lastSymptomId = selectedSymptoms.length ? selectedSymptoms[selectedSymptoms.length - 1] : null;
    navigate(`/signin?returnTo=onboarding&returnToStep=${targetStep}${lastSymptomId ? `&symptomId=${lastSymptomId}` : ''}`);
    setShowLoginDialog(false);
  };
  
  const handleCloseLoginDialog = () => {
    setShowLoginDialog(false);
  };

  const CurrentStepComponent = steps[activeStep].component;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.background.default,
        position: 'relative',
      }}
    >
      {/* Simple Header */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            px: 3,
            py: 1.5,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              <HealthAndSafety sx={{ fontSize: 20, color: 'white' }} />
            </Box>

            {/* Progress Steps */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {steps.map((step, index) => {
                const isCompleted = completedSteps.has(index);
                const isActive = index === activeStep;
                
                return (
                  <Chip
                    key={index}
                    icon={isMobile ? null : (isCompleted ? <CheckCircle /> : step.icon)}
                    label={isMobile ? step.label.split(' ')[0] : step.label}
                    variant={isActive ? 'filled' : 'outlined'}
                    color={isCompleted ? 'success' : isActive ? 'primary' : 'default'}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    }}
                  />
                );
              })}
            </Box>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Close Button */}
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.error.main,
                  background: alpha(theme.palette.error.main, 0.1),
                },
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </Paper>
      </Box>

      {/* Main Content */}
      <Box sx={{ pt: 12, pb: 8 }}>
        <Container maxWidth="lg">
          {/* Step Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h4"
              fontWeight={700}
              color="text.primary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              {steps[activeStep].label}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}
            >
              {steps[activeStep].description}
            </Typography>
            
            {/* Progress Bar */}
            <Box sx={{ maxWidth: 300, mx: 'auto', mb: 2 }}>
              <LinearProgress
                variant="determinate"
                value={((activeStep + 1) / steps.length) * 100}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  background: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    background: theme.palette.primary.main,
                    borderRadius: 3,
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Step {activeStep + 1} of {steps.length}
              </Typography>
            </Box>
          </Box>

          {/* Step Content */}
          <_motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Paper
              elevation={4}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <CurrentStepComponent
                onNext={handleNext}
                onBack={handleBack}
                onComplete={handleComplete}
                selectedSymptoms={selectedSymptoms}
                answers={answers}
                isLoggedIn={isLoggedIn}
                        onAnswersSubmit={handleAnswersSubmit}
                        initialSymptomId={selectedSymptoms.length ? selectedSymptoms[selectedSymptoms.length - 1] : null}
              />
            </Paper>
          </_motion.div>

          {/* Simple Navigation */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
              }}
            >
              Previous
            </Button>

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={handleNext}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  },
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                endIcon={<CheckCircle />}
                onClick={handleComplete}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                  fontWeight: 600,
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                  },
                }}
              >
                Complete
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Login Dialog */}
      <Dialog 
        open={showLoginDialog} 
        onClose={handleCloseLoginDialog}
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
            You need to be logged in to continue with the onboarding process.
          </Alert>
          <Typography variant="body1" paragraph>
            Please log in to save your progress and continue with the assessment. After logging in, you'll be redirected back to where you left off.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={handleCloseLoginDialog}
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

export default Onboarding;