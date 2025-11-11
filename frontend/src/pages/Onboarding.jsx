<<<<<<< Updated upstream
import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import DiseaseSymptomExplorer from '../components/Onboarding/DiseaseSymptomExplorer';


const Onboarding = () => {
=======
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

>>>>>>> Stashed changes
  return (
    <Box minHeight="100vh" bgcolor="background.default" display="flex" alignItems="center" justifyContent="center">
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight={700} color="text.primary">
            Symptom Checker
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
            Select a symptom to see related questions.
          </Typography>
          <Box mt={4}>
            <DiseaseSymptomExplorer />
          </Box>
        </Container>
      </Box>
  );
};

export default Onboarding; 