import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Stack,
  Divider,
  Tabs,
  Tab,
  alpha,
} from '@mui/material';
import {
  CheckCircle,
  ArrowForward,
  ArrowBack,
  Assessment as AssessmentIcon,
  Login,
  Visibility,
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';
import { getCurrentUser } from '../utils/auth';
import QuestionList from '../components/Onboarding/QuestionList';
import AuthBackground from '../components/Common/AuthBackground';
import { useTheme } from '../contexts/useThemeContext';

const SymptomAssessment = () => {
  const navigate = useNavigate();
  const { theme, isDarkMode } = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const [activeTab, setActiveTab] = useState('general');
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptomIndex, setCurrentSymptomIndex] = useState(0);
  const [, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [completedSymptoms, setCompletedSymptoms] = useState(new Set());
  const [, setSymptomCompletionStatus] = useState({});
  const [userAge, setUserAge] = useState(null);
  const [userGender, setUserGender] = useState(null);
  const [canProceed, setCanProceed] = useState(false);
  const questionListRef = useRef();

  useEffect(() => {
    console.log('🔍 ========== SYMPTOM ASSESSMENT MOUNTED ==========');
    console.log('📦 Checking sessionStorage...');
    console.log('  returnToSymptomAssessment:', sessionStorage.getItem('returnToSymptomAssessment'));
    console.log('  answersSavedAfterLogin:', sessionStorage.getItem('answersSavedAfterLogin'));
    console.log('  pendingOnboardingAnswers:', sessionStorage.getItem('pendingOnboardingAnswers'));
    console.log('  onboardingState:', sessionStorage.getItem('onboardingState'));
    console.log('  accessToken:', localStorage.getItem('accessToken') ? 'EXISTS' : 'NOT FOUND');
    
    checkLoginAndFetchData();
    
    // Check if user just logged in and should see the dialog
    const shouldShowDialog = sessionStorage.getItem('returnToSymptomAssessment');
    const answersSaved = sessionStorage.getItem('answersSavedAfterLogin');
    
    console.log('\n🔍 Checking if should show login dialog...');
    console.log('  shouldShowDialog:', shouldShowDialog);
    console.log('  answersSaved:', answersSaved);
    
    if (shouldShowDialog === 'true') {
      console.log('✅ Found returnToSymptomAssessment flag');
      sessionStorage.removeItem('returnToSymptomAssessment');
      // Check if user is logged in
      const token = localStorage.getItem('accessToken');
      if (token) {
        console.log('✅ User has token, checking if answers were saved...');
        // User just logged in
        if (answersSaved === 'true') {
          // Answers were just saved, wait a bit then refetch data
          sessionStorage.removeItem('answersSavedAfterLogin');
          console.log('🔄 Answers just saved, waiting before refetch...');
          setTimeout(async () => {
            console.log('🔄 Refetching symptom data after login...');
            await fetchAllSymptoms();
            await fetchUserAnsweredQuestions();
            console.log('✅ Data refetched, showing login dialog');
            setShowLoginDialog(true);
          }, 1000); // Wait 1 second for database writes to complete
        } else {
          console.log('ℹ️  No answers saved flag, showing dialog immediately');
          // No answers saved, just show dialog
          setShowLoginDialog(true);
        }
      } else {
        console.log('⚠️  No token found despite returnToSymptomAssessment flag');
      }
    } else {
      console.log('ℹ️  No returnToSymptomAssessment flag found');
    }
    console.log('🔍 ========== END MOUNT CHECK ==========\n');
  }, []);

  const checkLoginAndFetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // Allow unauthenticated users to continue with assessment
        setIsLoggedIn(false);
        // Don't show login dialog yet - only after completing questions
        await fetchAllSymptoms();
        setLoading(false);
        return;
      }
      
      // Only call getCurrentUser if token exists
      try {
        const user = await getCurrentUser();
        setIsLoggedIn(true);
        
        console.log('User data fetched:', user);
        console.log('Date of birth:', user?.date_of_birth);
        console.log('Gender:', user?.gender);
        
        // Calculate age from user's date of birth if available
        if (user?.date_of_birth) {
          const dob = new Date(user.date_of_birth);
          const today = new Date();
          let age = today.getFullYear() - dob.getFullYear();
          const monthDiff = today.getMonth() - dob.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
          }
          
          // Calculate months
          const dobMonth = dob.getMonth();
          const dobDay = dob.getDate();
          const todayMonth = today.getMonth();
          const todayDay = today.getDate();
          
          let months = todayMonth - dobMonth;
          if (todayDay < dobDay) {
            months--;
          }
          if (months < 0) {
            months += 12;
          }
          
          // Format as "X years and Y months"
          const ageStr = months > 0 ? `${age} years and ${months} months` : `${age} years`;
          console.log('Calculated age:', ageStr);
          setUserAge(ageStr);
        }
        
        // Set user's gender if available
        if (user?.gender) {
          console.log('Setting gender:', user.gender);
          setUserGender(user.gender);
        }
        
        await fetchAllSymptoms();
        await fetchUserAnsweredQuestions();
      } catch (err) {
        // If getCurrentUser fails, treat as unauthenticated
        console.error('User authentication failed:', err);
        setIsLoggedIn(false);
        await fetchAllSymptoms();
        setLoading(false);
      }
    } catch (err) {
      console.error('Login check failed:', err);
      setIsLoggedIn(false);
      // Allow unauthenticated users to continue
      await fetchAllSymptoms();
      setLoading(false);
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

  const handleNext = async () => {
    if (!symptoms.length) return;

    // Auto-save answers before proceeding (only for logged in users)
    if (questionListRef.current && activeStep === 0 && isLoggedIn && activeTab !== 'general') {
      try {
        await questionListRef.current.saveAll();
      } catch (error) {
        console.error('Error saving answers:', error);
        return; // Don't proceed if save fails
      }
    }

    if (activeTab === 'general') {
      setActiveTab(0);
      setCurrentSymptomIndex(0);
      setCanProceed(false);
      return;
    }

    if (activeStep === 0 && currentSymptomIndex < symptoms.length - 1) {
      setCurrentSymptomIndex((prev) => prev + 1);
      setActiveTab(currentSymptomIndex + 1);
      setCanProceed(false); // Reset for next symptom
    } else if (activeStep === 0 && currentSymptomIndex === symptoms.length - 1) {
      // Completed all questions
      if (!isLoggedIn) {
        // Store redirect info in sessionStorage before showing login dialog
        sessionStorage.setItem('returnToSymptomAssessment', 'true');
        // Show login dialog for unauthenticated users
        setShowLoginDialog(true);
      } else {
        setActiveStep(1);
      }
    }
  };

  const handleAnswersChange = useCallback((answers, questions) => {
    // Check if all questions have been answered
    // Questions are considered answered if they have a value in answers object
    const allAnswered = questions.every((q) => {
      const answer = answers[q._id];
      return answer !== undefined && answer !== null && answer.toString().trim() !== '';
    });
    console.log('All answered:', allAnswered, 'Total questions:', questions.length, 'Answers:', Object.keys(answers).length);
    
    // ✅ FIX: Defer state update to avoid "Cannot update component during render" error
    setTimeout(() => {
      setCanProceed(allAnswered);
    }, 0);
    
    // 🔥 CRITICAL FIX: ACCUMULATE answers across all symptoms for unauthenticated users
    if (!isLoggedIn && Object.keys(answers).length > 0) {
      try {
        // Get existing answers from sessionStorage
        const existingAnswersJson = sessionStorage.getItem('pendingOnboardingAnswers');
        const existingAnswers = existingAnswersJson ? JSON.parse(existingAnswersJson) : [];
        
        // Convert new answers to array format
        const newAnswersArray = Object.entries(answers).map(([questionId, answerText]) => ({
          questionId,
          answerText: typeof answerText === 'object' ? JSON.stringify(answerText) : answerText.toString()
        }));
        
        // Merge: Remove duplicates (same questionId), keep latest answer
        const answerMap = new Map();
        
        // Add existing answers first
        existingAnswers.forEach(ans => {
          answerMap.set(ans.questionId, ans);
        });
        
        // Add/update with new answers
        newAnswersArray.forEach(ans => {
          answerMap.set(ans.questionId, ans);
        });
        
        // Convert back to array
        const mergedAnswers = Array.from(answerMap.values());
        
        sessionStorage.setItem('pendingOnboardingAnswers', JSON.stringify(mergedAnswers));
        console.log('💾 Accumulated answers in sessionStorage:', mergedAnswers.length, 'total answers');
      } catch (error) {
        console.error('❌ Failed to save answers to sessionStorage:', error);
      }
    }
  }, [isLoggedIn]);

  const handleBack = () => {
    if (activeStep === 0 && activeTab === 'general') {
      return;
    }

    if (activeStep === 0 && currentSymptomIndex === 0) {
      setActiveTab('general');
      setCanProceed(false);
      return;
    }

    if (activeStep === 0 && currentSymptomIndex > 0) {
      setCurrentSymptomIndex((prev) => prev - 1);
      setActiveTab(currentSymptomIndex - 1);
    }
  };

  const handleViewAssessment = () => {
    // Clear all temporary onboarding storage when moving to assessment
    sessionStorage.removeItem('pendingOnboardingAnswers');
    sessionStorage.removeItem('onboardingState');
    sessionStorage.removeItem('returnToSymptomAssessment');
    sessionStorage.removeItem('answersSavedAfterLogin');
    localStorage.removeItem('onboardingState');
    localStorage.removeItem('redirectAfterLogin');
    console.log('🧹 Cleared all temporary storage before navigating to assessment');

    navigate('/assessment');
  };
    
  const handleLoginRedirect = () => {
    sessionStorage.setItem('postAuthRedirect', '/assessment');
    navigate('/signin?returnTo=symptom-assessment');
  };

  const isSymptomCompleted = (symptomId) => {
    return completedSymptoms.has(symptomId);
  };

  const handleTabChange = (_, nextTab) => {
    setActiveTab(nextTab);

    if (typeof nextTab === 'number') {
      setCurrentSymptomIndex(nextTab);
      setCanProceed(false);
    }
  };

  const steps = ['Topics', 'Wrap up'];

  const currentSymptom = activeTab === 'general' ? null : symptoms[currentSymptomIndex];

  const getProgressPercentage = () => {
    if (!symptoms.length) return 0;
    if (activeStep === 1) return 100;
    if (activeTab === 'general') return 0;
    return ((currentSymptomIndex + 1) / symptoms.length) * 100;
  };

  const pageBg = isDarkMode
    ? 'linear-gradient(160deg, #0b1220 0%, #12182a 42%, #0a0f18 100%)'
    : 'linear-gradient(165deg, #ffffff 0%, #f8fafc 38%, #f0f9ff 100%)';

  return (
    <Box
      component="main"
      minHeight="100vh"
      sx={{
        background: pageBg,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AuthBackground />
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Fade in timeout={500}>
          <Box textAlign="center" mb={{ xs: 3, md: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 72, md: 80 },
                height: { xs: 72, md: 80 },
                borderRadius: 3,
                mb: 2,
                color: '#22D3EE',
                border: '1px solid rgba(34,211,238,0.35)',
                background: 'linear-gradient(145deg, rgba(34,211,238,0.12), rgba(163,230,53,0.1))',
              }}
            >
              <AssessmentIcon sx={{ fontSize: { xs: 40, md: 44 } }} />
            </Box>
            <Typography
              variant="h3"
              fontWeight={800}
              sx={{
                mb: 1.5,
                fontSize: { xs: '1.65rem', md: '2rem' },
                letterSpacing: '-0.03em',
                color: 'text.primary',
              }}
            >
              Calm symptom check-in
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                maxWidth: 720,
                mx: 'auto',
                lineHeight: 1.75,
                fontSize: { xs: '0.95rem', md: '1.02rem' },
                fontWeight: 400,
              }}
            >
              Start with general details, then move through the topic tabs on the left. The progress bar stays tied to the full check-in so the flow always feels continuous.
            </Typography>
          </Box>
        </Fade>

        {/* Main Assessment Card */}
        <Fade in timeout={600}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, md: 4 },
              borderRadius: 2.25,
              background: (theme) => alpha(theme.palette.background.paper, isDarkMode ? 0.55 : 0.82),
              backdropFilter: 'blur(20px) saturate(160%)',
              border: `1px solid ${alpha('#22D3EE', isDarkMode ? 0.14 : 0.12)}`,
              boxShadow: isDarkMode ? `0 24px 48px ${alpha('#000', 0.35)}` : `0 20px 40px ${alpha('#0f172a', 0.06)}`,
              minHeight: { xs: 'auto', md: 560 },
            }}
          >
            {/* Progress */}
            <Box sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.25} flexWrap="wrap" gap={1}>
                <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ letterSpacing: '0.02em' }}>
                  {activeStep === 0
                    ? `Topic ${currentSymptomIndex + 1} of ${symptoms.length}`
                    : 'Finished'}
                </Typography>
                <Chip
                  label={`${Math.round(getProgressPercentage())}%`}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2,
                    bgcolor: alpha('#22D3EE', isDarkMode ? 0.14 : 0.1),
                    color: isDarkMode ? '#67E8F9' : '#0e7490',
                    border: `1px solid ${alpha('#22D3EE', 0.25)}`,
                  }}
                />
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgressPercentage()}
                sx={{
                  height: 6,
                  borderRadius: 99,
                  bgcolor: alpha('#22D3EE', isDarkMode ? 0.12 : 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 99,
                    background: 'linear-gradient(90deg, #0EA5E9 0%, #22D3EE 40%, #84CC16 100%)',
                  },
                }}
              />
            </Box>

            {/* Lightweight journey hint (less clinical than a heavy stepper) */}
            <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mb: 3 }} flexWrap="wrap">
              {steps.map((label, index) => (
                <React.Fragment key={label}>
                  {index > 0 && (
                    <Typography variant="caption" color="text.disabled" sx={{ px: 0.5 }}>
                      →
                    </Typography>
                  )}
                  <Chip
                    label={label}
                    size="small"
                    variant={index === activeStep ? 'filled' : 'outlined'}
                    sx={{
                      fontWeight: index === activeStep ? 700 : 500,
                      borderRadius: 2,
                      textTransform: 'none',
                      ...(index === activeStep && {
                        background: 'linear-gradient(135deg, #0EA5E9 0%, #22D3EE 50%, #65A30D 100%)',
                        color: '#fff',
                        border: 'none',
                      }),
                    }}
                  />
                </React.Fragment>
              ))}
            </Stack>

            <Alert
              severity="info"
              icon={false}
              sx={{
                mb: 3,
                borderRadius: 2,
                py: 1.25,
                bgcolor: alpha('#22D3EE', isDarkMode ? 0.08 : 0.06),
                color: 'text.secondary',
                border: `1px solid ${alpha('#22D3EE', 0.15)}`,
                '& .MuiAlert-message': { width: '100%' },
              }}
            >
              <Typography variant="body2" sx={{ lineHeight: 1.65 }}>
                <strong style={{ color: 'inherit', fontWeight: 700 }}>Use the rail.</strong> The selected tab stays open while you answer, so the flow remains predictable and easy to return to.
              </Typography>
            </Alert>

            {/* Step Content */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '300px minmax(0, 1fr)' },
                gap: 3,
                minHeight: 520,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 3,
                  background: alpha(theme.palette.background.paper, isDarkMode ? 0.46 : 0.82),
                  border: `1px solid ${alpha('#22D3EE', 0.14)}`,
                  backdropFilter: 'blur(18px) saturate(150%)',
                  position: { lg: 'sticky' },
                  top: { lg: 24 },
                  alignSelf: 'start',
                }}
              >
                <Box sx={{ px: 1, pt: 0.5, pb: 1.5 }}>
                  <Typography variant="overline" sx={{ letterSpacing: '0.14em', fontWeight: 800, color: 'text.secondary' }}>
                    Check-in map
                  </Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.02em', mt: 0.25 }}>
                    Topic rail
                  </Typography>
                </Box>
                <Tabs
                  orientation="vertical"
                  variant="scrollable"
                  value={activeTab}
                  onChange={handleTabChange}
                  allowScrollButtonsMobile
                  sx={{
                    minHeight: 360,
                    '& .MuiTabs-indicator': {
                      left: 0,
                      width: 4,
                      borderRadius: 99,
                      background: 'linear-gradient(180deg, #0EA5E9 0%, #22D3EE 50%, #84CC16 100%)',
                    },
                    '& .MuiTab-root': {
                      alignItems: 'flex-start',
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderRadius: 2,
                      minHeight: 'auto',
                      py: 1.5,
                      px: 1.5,
                      mx: 0.5,
                      my: 0.4,
                      border: `1px solid ${alpha('#22D3EE', 0.08)}`,
                      background: alpha(theme.palette.background.default, isDarkMode ? 0.2 : 0.45),
                      color: 'text.primary',
                      transition: 'all 0.2s ease',
                      '&.Mui-selected': {
                        borderColor: alpha('#22D3EE', 0.35),
                        background: `linear-gradient(135deg, ${alpha('#22D3EE', 0.14)} 0%, ${alpha('#fff', isDarkMode ? 0.04 : 0.75)} 100%)`,
                        boxShadow: `0 10px 22px ${alpha('#0f172a', isDarkMode ? 0.18 : 0.05)}`,
                      },
                    },
                  }}
                >
                  <Tab
                    key="general"
                    value="general"
                    label={
                      <Box sx={{ width: '100%' }}>
                        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                          <Typography variant="subtitle2" fontWeight={800}>General data</Typography>
                          <Chip label="Start here" size="small" sx={{ fontWeight: 700 }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.5 }}>
                          Age and profile details already loaded for this session.
                        </Typography>
                      </Box>
                    }
                  />

                  {symptoms.map((symptom, index) => {
                    const completed = isSymptomCompleted(symptom._id);
                    const isCurrent = currentSymptomIndex === index;

                    return (
                      <Tab
                        key={symptom._id}
                        value={index}
                        label={
                          <Box sx={{ width: '100%' }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
                              <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                                {symptom.name}
                              </Typography>
                              <Chip
                                label={completed ? 'Done' : `0${index + 1}`}
                                size="small"
                                color={completed ? 'success' : isCurrent ? 'primary' : 'default'}
                                sx={{ fontWeight: 700, height: 22 }}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, lineHeight: 1.5 }}>
                              Tap to open related questions.
                            </Typography>
                          </Box>
                        }
                      />
                    );
                  })}
                </Tabs>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: 3,
                  background: alpha(theme.palette.background.paper, isDarkMode ? 0.52 : 0.84),
                  border: `1px solid ${alpha('#22D3EE', 0.14)}`,
                  backdropFilter: 'blur(18px) saturate(150%)',
                  minHeight: 520,
                }}
              >
                {activeTab === 'general' ? (
                  <Fade in timeout={350}>
                    <Box>
                      <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap" mb={2}>
                        <Box>
                          <Chip label="General data entry" size="small" sx={{ mb: 1, fontWeight: 700 }} />
                          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                            Confirm your profile details
                          </Typography>
                        </Box>
                        <Chip label={isLoggedIn ? 'Synced from profile' : 'Guest session'} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: 720, mb: 3 }}>
                        This is the first stop in the flow. We use these details to personalize the assessment and keep later topic tabs short.
                      </Typography>
                      <Divider sx={{ mb: 3, opacity: 0.6 }} />
                      <Stack spacing={2}>
                        <Card variant="outlined" sx={{ borderRadius: 3, borderColor: alpha('#22D3EE', 0.14) }}>
                          <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="overline" sx={{ letterSpacing: '0.12em', color: 'text.secondary', fontWeight: 800 }}>
                              Age
                            </Typography>
                            <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
                              {userAge || 'Not available yet'}
                            </Typography>
                          </CardContent>
                        </Card>
                        <Card variant="outlined" sx={{ borderRadius: 3, borderColor: alpha('#22D3EE', 0.14) }}>
                          <CardContent sx={{ p: 2.5 }}>
                            <Typography variant="overline" sx={{ letterSpacing: '0.12em', color: 'text.secondary', fontWeight: 800 }}>
                              Gender
                            </Typography>
                            <Typography variant="h6" fontWeight={800} sx={{ mt: 0.5 }}>
                              {userGender || 'Not available yet'}
                            </Typography>
                          </CardContent>
                        </Card>
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          Select a topic in the sidebar to continue. Your progress remains visible at the top as you move between tabs.
                        </Alert>
                      </Stack>
                    </Box>
                  </Fade>
                ) : currentSymptom ? (
                  <Fade in timeout={350} key={currentSymptom._id}>
                    <Box>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2} flexWrap="wrap" mb={1.5}>
                        <Box>
                          <Chip
                            label={`Topic ${currentSymptomIndex + 1}`}
                            size="small"
                            sx={{
                              mb: 1,
                              fontWeight: 700,
                              bgcolor: alpha('#22D3EE', isDarkMode ? 0.12 : 0.1),
                              color: isDarkMode ? '#67E8F9' : '#0e7490',
                            }}
                          />
                          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em' }}>
                            {currentSymptom.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.7, maxWidth: 760 }}>
                            {currentSymptom._diseaseName || 'Diabetes care'}
                          </Typography>
                        </Box>
                        <Chip
                          label={isSymptomCompleted(currentSymptom._id) ? 'Completed' : 'In progress'}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 700 }}
                        />
                      </Box>
                      <Divider sx={{ my: 3, opacity: 0.6 }} />
                      <QuestionList
                        ref={questionListRef}
                        symptomId={currentSymptom._id}
                        symptomName={currentSymptom.name}
                        symptomDescription=""
                        isLoggedIn={isLoggedIn}
                        onDataUpdated={fetchUserAnsweredQuestions}
                        onAnswersChange={handleAnswersChange}
                        userAge={userAge}
                        userGender={userGender}
                      />
                    </Box>
                  </Fade>
                ) : null}
              </Paper>
              </Box>

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
                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                        border: (theme) => `3px solid ${alpha(theme.palette.success.main, 0.3)}`,
                        mb: 4,
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 80, color: 'success.main' }} />
                    </Box>
                    <Typography variant="h5" fontWeight={800} gutterBottom sx={{ mb: 2, letterSpacing: '-0.02em' }}>
                      You&apos;re all set for this step
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 520, mx: 'auto', lineHeight: 1.8 }}>
                      Thanks for taking the time. When you&apos;re ready, open your summary to see how we&apos;ve organized what you shared—not a diagnosis, just a clearer picture you can discuss with your care team.
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      endIcon={<Visibility />}
                      onClick={handleViewAssessment}
                      sx={{
                        px: 5,
                        py: 1.75,
                        fontSize: '1rem',
                        fontWeight: 700,
                        borderRadius: 2.25,
                        textTransform: 'none',
                        background: 'linear-gradient(135deg, #0EA5E9 0%, #22D3EE 42%, #65A30D 108%)',
                        color: '#fff',
                        boxShadow: `0 10px 28px ${alpha('#22D3EE', 0.35)}`,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #0284C7 0%, #06B6D4 45%, #84CC16 100%)',
                          boxShadow: `0 14px 36px ${alpha('#22D3EE', 0.42)}`,
                        },
                      }}
                    >
                      View summary
                    </Button>
                  </Box>
                </Fade>
              )}

            {/* Navigation Buttons */}
            {activeStep === 0 && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                gap={2}
                mt={4}
                pt={3}
                sx={{ borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.5)}` }}
              >
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                  disabled={currentSymptomIndex === 0}
                  sx={{
                    px: 3,
                    py: 1.25,
                    fontWeight: 600,
                    borderRadius: 2.25,
                    textTransform: 'none',
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={handleNext}
                  disabled={!symptoms.length || !canProceed}
                  sx={{
                    px: 3,
                    py: 1.25,
                    fontWeight: 700,
                    borderRadius: 2.25,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #0EA5E9 0%, #22D3EE 42%, #65A30D 108%)',
                    color: '#fff',
                    boxShadow: `0 8px 22px ${alpha('#22D3EE', 0.32)}`,
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0284C7 0%, #06B6D4 45%, #84CC16 100%)',
                      boxShadow: `0 12px 30px ${alpha('#22D3EE', 0.4)}`,
                    },
                    '&.Mui-disabled': {
                      background: alpha('#94a3b8', 0.35),
                      color: alpha('#fff', 0.8),
                    },
                  }}
                >
                  {currentSymptomIndex === symptoms.length - 1 ? 'Finish check-in' : 'Next topic'}
                </Button>
              </Box>
            )}
          </Paper>
        </Fade>
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
          <Box
            sx={{
              display: 'inline-flex',
              p: 3,
              borderRadius: 3,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              mb: 2,
            }}
          >
            <Login sx={{ fontSize: 56, color: 'primary.main' }} />
          </Box>
          <Typography variant="h5" component="p" fontWeight={700}>
            Great! One More Step
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>
            {isLoggedIn 
              ? "Welcome back! You've completed all questions. Click continue to view your personalized risk assessment."
              : "You've completed all onboarding questions! Sign in or create an account to view your personalized risk assessment and save your progress."
            }
          </Alert>
          {!isLoggedIn && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Your answers will be saved automatically after you log in.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, justifyContent: 'center', gap: 2 }}>
          {isLoggedIn ? (
            // If user is logged in (just came back from login), show "Continue" button
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                setShowLoginDialog(false);
                setActiveStep(1);
              }}
              sx={{
                px: 6,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 3,
              }}
            >
              Continue to Results
            </Button>
          ) : (
            // If user is not logged in, show signup/signin buttons
            <>
              <Button
                variant="outlined"
                size="large"
                onClick={() => {
                  sessionStorage.setItem('postAuthRedirect', '/assessment');
                  sessionStorage.setItem('returnToSymptomAssessment', 'true');
                  navigate('/signup', { state: { fromOnboarding: true } });
                }}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 3,
                }}
              >
                Sign Up
              </Button>
              <Button
                variant="contained"
                size="large"
                onClick={handleLoginRedirect}
                sx={{
                  px: 6,
                  py: 1.5,
                  fontWeight: 700,
                  borderRadius: 3,
                }}
              >
                Sign In
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SymptomAssessment;
