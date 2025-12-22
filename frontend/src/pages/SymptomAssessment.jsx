import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Fade,
  Grow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Divider,
  alpha,
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  ArrowForward,
  ArrowBack,
  Close,
  Assessment as AssessmentIcon,
  MedicalServices,
  Login,
  Visibility,
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';
import { getCurrentUser } from '../utils/auth';
import QuestionList from '../components/Onboarding/QuestionList';

const SymptomAssessment = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptomIndex, setCurrentSymptomIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [completedSymptoms, setCompletedSymptoms] = useState(new Set());
  const [symptomCompletionStatus, setSymptomCompletionStatus] = useState({});

  useEffect(() => {
    checkLoginAndFetchData();
  }, []);

  const checkLoginAndFetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoggedIn(false);
        setShowLoginDialog(true);
        return;
      }
      await getCurrentUser();
      setIsLoggedIn(true);
      await fetchAllSymptoms();
      await fetchUserAnsweredQuestions();
    } catch (err) {
      console.error('Login check failed:', err);
      setIsLoggedIn(false);
      setShowLoginDialog(true);
    }
  };

  const fetchAllSymptoms = async () => {
    try {
      setLoading(true);
      // Fetch all diseases first
      const diseaseRes = await axiosInstance.get('/diseases/public');
      let diseaseData = diseaseRes.data;
      if (!Array.isArray(diseaseData) && Array.isArray(diseaseData?.data)) {
        diseaseData = diseaseData.data;
      }

      const allSymptoms = [];

      // For each disease, fetch its symptoms and flatten into a single list
      if (Array.isArray(diseaseData)) {
        const symptomPromises = diseaseData.map(async (disease) => {
          try {
            const res = await axiosInstance.get(`/symptoms/public/${disease._id}`);
            const data = res.data?.data || [];
            data.forEach((symptom) => {
              allSymptoms.push({
                ...symptom,
                _diseaseName: disease.name,
              });
            });
          } catch (err) {
            console.error('Error fetching symptoms for disease', disease._id, err);
          }
        });

        await Promise.all(symptomPromises);
      }

      setSymptoms(allSymptoms);
    } catch (err) {
      console.error('Error fetching all symptoms:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAnsweredQuestions = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;
      const response = await axiosInstance.get('/users/my-disease-data');
      const data = response.data;
      if (data.success && data.data && data.data.symptoms) {
        const completionStatus = {};
        const completed = new Set();
        data.data.symptoms.forEach(symptom => {
          const symptomQuestions = symptom.questions || [];
          const answeredCount = symptomQuestions.length;
          const isCompleted = answeredCount > 0;
          const symptomKey = symptom.name?.toLowerCase().trim();
          completionStatus[symptomKey] = {
            answered: answeredCount,
            total: answeredCount,
            completed: isCompleted,
            symptomId: symptom._id
          };
          if (isCompleted) {
            completed.add(symptom._id);
          }
        });
        setSymptomCompletionStatus(completionStatus);
        setCompletedSymptoms(completed);
      }
    } catch (err) {
      console.error('Error fetching answered questions:', err);
    }
  };

  const handleNext = () => {
    if (!symptoms.length) return;

    if (activeStep === 0 && currentSymptomIndex < symptoms.length - 1) {
      setCurrentSymptomIndex((prev) => prev + 1);
    } else if (activeStep === 0 && currentSymptomIndex === symptoms.length - 1) {
      setActiveStep(1);
    }
  };

  const handleBack = () => {
    if (activeStep === 0 && currentSymptomIndex > 0) {
      setCurrentSymptomIndex((prev) => prev - 1);
    }
  };

  const handleViewAssessment = () => {
    navigate('/assessment');
  };

  const handleLoginRedirect = () => {
    navigate('/signin?returnTo=symptom-assessment');
  };

  const isSymptomCompleted = (symptomId) => {
    return completedSymptoms.has(symptomId);
  };

  const steps = ['Answer Questions', 'Complete'];

  const currentSymptom = symptoms[currentSymptomIndex];

  const getProgressPercentage = () => {
    if (!symptoms.length) return 0;
    if (activeStep === 1) return 100;
    return ((currentSymptomIndex) / symptoms.length) * 100;
  };

  return (
    <Box 
      minHeight="100vh" 
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.08) 0%, transparent 50%)',
          zIndex: 0
        }
      }}
    >
      <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={800}>
          <Box textAlign="center" mb={4}>
            <Box 
              sx={{ 
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                mb: 3,
              }}
            >
              <AssessmentIcon sx={{ fontSize: 50, color: '#fff' }} />
            </Box>
            <Typography 
              variant="h3" 
              fontWeight={900} 
              sx={{ 
                color: '#fff',
                mb: 2,
                textShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
            >
              Diabetes Symptom Assessment
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.95)',
                maxWidth: 700,
                mx: 'auto',
                lineHeight: 1.7,
                textShadow: '0 2px 10px rgba(0,0,0,0.1)',
              }}
            >
              Complete a professional health assessment to understand your diabetes risk
            </Typography>
          </Box>
        </Fade>

        {/* Main Assessment Card */}
        <Grow in timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 5 },
              borderRadius: 5,
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 30px 90px rgba(0, 0, 0, 0.3)',
              minHeight: 600,
            }}
          >
            {/* Progress Bar */}
            <Box sx={{ mb: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2" fontWeight={700} color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="body2" fontWeight={900} color="primary">
                  {Math.round(getProgressPercentage())}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={getProgressPercentage()} 
                sx={{ 
                  height: 10, 
                  borderRadius: 10,
                  bgcolor: alpha('#667eea', 0.1),
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 10,
                  }
                }} 
              />
            </Box>

            {/* Stepper */}
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 5 }}>
              {steps.map((label, index) => (
                <Step key={label} completed={index < activeStep}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        '&.Mui-completed': {
                          color: '#10b981',
                        },
                        '&.Mui-active': {
                          color: '#667eea',
                        },
                      },
                    }}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            {/* Step Content */}
            <Box sx={{ minHeight: 400 }}>
              {/* Step 0: Answer Questions (all symptoms, one by one) */}
              {activeStep === 0 && currentSymptom && (
                <Fade in timeout={500} key={currentSymptomIndex}>
                  <Box>
                    <Box textAlign="center" mb={4}>
                      <Chip 
                        label={`Symptom ${currentSymptomIndex + 1} of ${symptoms.length}`}
                        sx={{ 
                          mb: 2,
                          bgcolor: alpha('#6366f1', 0.09),
                          color: '#4f46e5',
                          fontWeight: 900,
                          fontSize: '0.9rem',
                          letterSpacing: 0.4,
                        }}
                      />
                      <Typography
                        variant="overline"
                        sx={{
                          textTransform: 'uppercase',
                          letterSpacing: 2.2,
                          color: 'text.secondary',
                          fontWeight: 700,
                        }}
                      >
                        {currentSymptom._diseaseName || 'Diabetes'}
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={900}
                        gutterBottom
                        sx={{
                          mt: 0.5,
                          mb: 1.5,
                          color: '#0f172a',
                          letterSpacing: 0.3,
                        }}
                      >
                        {currentSymptom.name}
                      </Typography>
                      {currentSymptom.description && (
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ maxWidth: 640, mx: 'auto', lineHeight: 1.7 }}
                        >
                          {currentSymptom.description}
                        </Typography>
                      )}
                    </Box>
                    <Divider sx={{ mb: 3 }} />
                    <QuestionList 
                      symptomId={currentSymptom._id} 
                      symptomName={currentSymptom.name}
                      isLoggedIn={isLoggedIn}
                      onDataUpdated={fetchUserAnsweredQuestions}
                    />
                  </Box>
                </Fade>
              )}

              {/* Step 1: Complete */}
              {activeStep === 1 && (
                <Fade in timeout={500}>
                  <Box textAlign="center" py={6}>
                    <Box 
                      sx={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        mb: 4,
                        boxShadow: '0 20px 60px rgba(16, 185, 129, 0.3)',
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 80, color: '#fff' }} />
                    </Box>
                    <Typography variant="h4" fontWeight={900} gutterBottom sx={{ mb: 2 }}>
                      Assessment Complete! 🎉
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.8 }}>
                      You've successfully completed your diabetes symptom assessment. View your detailed risk analysis and personalized recommendations.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<Visibility />}
                      onClick={handleViewAssessment}
                      sx={{
                        px: 6,
                        py: 2,
                        fontSize: '1.1rem',
                        fontWeight: 900,
                        borderRadius: 4,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5568d3 0%, #6a3e8f 100%)',
                          boxShadow: '0 16px 50px rgba(102, 126, 234, 0.5)',
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      View Your Assessment
                    </Button>
                  </Box>
                </Fade>
              )}
            </Box>

            {/* Navigation Buttons */}
            {activeStep === 0 && (
              <Box display="flex" justifyContent="space-between" mt={5} pt={4} borderTop="2px solid #f3f4f6">
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 800,
                    borderRadius: 3,
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                    },
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={handleNext}
                  disabled={!symptoms.length}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 900,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a3e8f 100%)',
                      boxShadow: '0 12px 32px rgba(102, 126, 234, 0.45)',
                    },
                  }}
                >
                  {currentSymptomIndex === symptoms.length - 1 ? 'Finish' : 'Next Symptom'}
                </Button>
              </Box>
            )}
          </Paper>
        </Grow>
      </Container>

      {/* Login Dialog */}
      <Dialog 
        open={showLoginDialog} 
        onClose={() => {}} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 2,
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <Login sx={{ fontSize: 80, color: '#667eea', mb: 2 }} />
          <Typography variant="h5" fontWeight={800}>
            Login Required
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Please sign in to complete your diabetes symptom assessment and track your health progress.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleLoginRedirect}
            sx={{
              px: 6,
              py: 1.5,
              fontWeight: 900,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Sign In
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SymptomAssessment;
