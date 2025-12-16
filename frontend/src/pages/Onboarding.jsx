import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import DiseaseSymptomExplorer from '../components/Onboarding/DiseaseSymptomExplorer';

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

  // Use refs to access latest values without causing re-renders
  const activeStepRef = useRef(activeStep);
  const selectedSymptomsRef = useRef(selectedSymptoms);
  const hasRestoredFromUrl = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  useEffect(() => {
    selectedSymptomsRef.current = selectedSymptoms;
  }, [selectedSymptoms]);

  useEffect(() => {
    // Validate user token by fetching current user (refresh if needed)
    let cancelled = false;
    const validate = async () => {
      const user = await getCurrentUser();
      if (cancelled) return;
      const logged = !!user;
      setIsLoggedIn(logged);

      // If not logged in and user is on a guarded step, redirect to signin immediately
      if (!logged && activeStepRef.current > 0) {
        // remember where the user tried to go
        setLoginRedirectStep(activeStepRef.current);
        // perform immediate redirect to signin so component never shows guarded content
        const lastSymptomId = selectedSymptomsRef.current.length ? selectedSymptomsRef.current[selectedSymptomsRef.current.length - 1] : null;
        navigate(`/signin?returnTo=onboarding&returnToStep=${activeStepRef.current}${lastSymptomId ? `&symptomId=${lastSymptomId}` : ''}`);
        return;
      }

      // If returning from login (query params present) and we are logged in, restore the intended step
      const params = new URLSearchParams(location.search);
      const returnToStep = params.get('returnToStep');
      const returnSymptomId = params.get('symptomId');
      if (returnToStep && logged && !hasRestoredFromUrl.current) {
        hasRestoredFromUrl.current = true;
        setActiveStep(parseInt(returnToStep, 10));
        if (returnSymptomId) {
          setSelectedSymptoms((prev) => prev.includes(returnSymptomId) ? prev : [...prev, returnSymptomId]);
        }
        // Clear the URL params after restoring to prevent re-processing
        navigate('/onboarding', { replace: true });
      }
    };

    validate();
    return () => { cancelled = true; };
  }, [location.search, navigate]); // Only depend on location.search and navigate to avoid infinite loops

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

  const handleNext = useCallback(async () => {
      console.log('handleNext called');
    // Validate current user immediately when user clicks next.
    // This avoids relying on possibly-stale `isLoggedIn` state.
    
      setActiveStep((currentStep) => {
        const nextStep = Math.min(currentStep + 1, steps.length - 1);
        console.log('Current step:', currentStep, 'Next step will be:', nextStep);
      
        // Don't exceed max steps
        if (currentStep >= steps.length - 1) {
          console.log('Already at last step, not moving forward');
          return currentStep;
        }
      
        // Mark current step as completed
        setCompletedSteps((prev) => new Set([...prev, currentStep]));
      
        console.log('Moving to next step:', nextStep);
        return nextStep;
      });
    }, [steps.length]);

  const handleBack = useCallback(() => {
      setActiveStep((currentStep) => {
        if (currentStep > 0) {
          return currentStep - 1;
        }
        return currentStep;
      });
    }, []);

  const handleAnswersSubmit = useCallback((answersData) => {
      console.log('handleAnswersSubmit called with data:', answersData);
      console.log('Current isLoggedIn:', isLoggedIn);
    // Check if user is logged in before submitting answers
    if (!isLoggedIn) {
        console.log('User not logged in, showing login dialog');
        setLoginRedirectStep(activeStepRef.current);
      setShowLoginDialog(true);
      // Save answers temporarily
      setAnswers(answersData);
      return;
    }
    
      console.log('Saving answers and moving to next step');
    setAnswers(answersData);
    handleNext();
    }, [isLoggedIn, handleNext]);

  const handleComplete = useCallback(() => {
    // Navigate to dashboard or results page
    navigate('/dashboard');
  }, [navigate]);
  
  const handleLoginRedirect = useCallback(() => {
    // Save intended step and redirect to sign-in; return back to onboarding
      const targetStep = loginRedirectStep ?? activeStepRef.current;
      const lastSymptomId = selectedSymptomsRef.current.length ? selectedSymptomsRef.current[selectedSymptomsRef.current.length - 1] : null;
    navigate(`/signin?returnTo=onboarding&returnToStep=${targetStep}${lastSymptomId ? `&symptomId=${lastSymptomId}` : ''}`);
    setShowLoginDialog(false);
    }, [loginRedirectStep, navigate]);
  
  const handleCloseLoginDialog = useCallback(() => {
    setShowLoginDialog(false);
  }, []);

  const CurrentStepComponent = steps[activeStep].component;

  return (
    <Box 
      minHeight="100vh" 
      sx={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 40%, #e0f2fe 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'radial-gradient(circle at 30% 20%, rgba(99,102,241,0.08), transparent 50%), radial-gradient(circle at 70% 40%, rgba(14,165,233,0.08), transparent 50%)',
          zIndex: 0
        }
      }}
    >
        <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              boxShadow: '0 20px 60px rgba(99, 102, 241, 0.12)'
            }}
          >
            <Box textAlign="center" mb={5} position="relative">
              {/* Decorative elements */}
              <Box sx={{ position: 'absolute', top: -10, left: '15%', fontSize: '2rem', opacity: 0.15, animation: 'pulse 2s ease-in-out infinite' }}>🩺</Box>
              <Box sx={{ position: 'absolute', top: -5, right: '10%', fontSize: '2.5rem', opacity: 0.15, animation: 'pulse 2.5s ease-in-out infinite', animationDelay: '0.5s' }}>👩‍⚕️</Box>
              <Box sx={{ position: 'absolute', bottom: -20, left: '20%', fontSize: '1.8rem', opacity: 0.12, animation: 'pulse 3s ease-in-out infinite', animationDelay: '1s' }}>📊</Box>
              <style>{`
                @keyframes pulse {
                  0%, 100% { transform: scale(1); opacity: 0.15; }
                  50% { transform: scale(1.1); opacity: 0.25; }
                }
              `}</style>
              
              <Box sx={{ display: 'inline-block', mb: 2 }}>
                <Box component="span" sx={{ fontSize: '3.5rem', animation: 'bounce 2s ease-in-out infinite' }}>🌟</Box>
              </Box>
              <style>{`
                @keyframes bounce {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-10px); }
                }
              `}</style>
              <Typography 
                variant="h3" 
                fontWeight={800} 
                gutterBottom
                sx={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #0ea5e9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px',
                  mb: 2
                }}
              >
                🩺 Symptom Assessment
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                👉 Select a symptom below to begin your personalized health assessment journey
              </Typography>
            </Box>
            <Box>
              <DiseaseSymptomExplorer />
            </Box>
          </Paper>
        </Container>
      </Box>
  );
};

export default Onboarding; 