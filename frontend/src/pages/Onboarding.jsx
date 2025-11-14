import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Container, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from '@mui/material';
import { Close, Login } from '@mui/icons-material';
import { getCurrentUser } from '../utils/auth';
import WelcomeStep from '../components/Onboarding/WelcomeStep';
import QuestionFlowStep from '../components/Onboarding/QuestionFlowStep';
import AssessmentSummaryStep from '../components/Onboarding/AssessmentSummaryStep';

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
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
    { label: 'Welcome', component: WelcomeStep },
    { label: 'Answer Questions', component: QuestionFlowStep },
    { label: 'Review & Complete', component: AssessmentSummaryStep },
  ];

  const handleNext = useCallback(() => {
    setActiveStep((currentStep) => Math.min(currentStep + 1, steps.length - 1));
  }, [steps.length]);

  const handleBack = useCallback(() => {
    setActiveStep((currentStep) => (currentStep > 0 ? currentStep - 1 : currentStep));
  }, []);

  const handleAnswersSubmit = useCallback((answersData) => {
    if (!isLoggedIn) {
      setLoginRedirectStep(activeStepRef.current);
      setShowLoginDialog(true);
      setAnswers(answersData);
      return;
    }
    setAnswers(answersData);
    handleNext();
  }, [isLoggedIn, handleNext]);

  const handleComplete = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleLoginRedirect = useCallback(() => {
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
    <Box minHeight="100vh" bgcolor="background.default" display="flex" alignItems="center" justifyContent="center">
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h4" align="center" gutterBottom fontWeight={700} color="text.primary">
          Symptom Checker
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
          Follow the steps to complete your assessment.
        </Typography>
        <Box mt={4}>
          <CurrentStepComponent
            onNext={handleNext}
            onBack={handleBack}
            onAnswersSubmit={handleAnswersSubmit}
            onComplete={handleComplete}
            answers={answers}
            isLoggedIn={isLoggedIn}
          />
        </Box>
      </Container>

      <Dialog open={showLoginDialog} onClose={handleCloseLoginDialog}>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">Sign In Required</Typography>
            <IconButton onClick={handleCloseLoginDialog} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Please sign in to continue with the assessment and save your progress.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLoginDialog}>Cancel</Button>
          <Button variant="contained" startIcon={<Login />} onClick={handleLoginRedirect}>
            Sign In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Onboarding; 