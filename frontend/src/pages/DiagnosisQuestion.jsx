import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  alpha,
  Fade,
  Zoom,
  Stack,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  CheckCircle,
  Close,
  HealthAndSafety,
  AssignmentTurnedIn,
  PersonalVideo,
  Home,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useOnboarding } from '../contexts/OnboardingContext';

const DiagnosisQuestion = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { updateDiagnosisStatus, onboardingState, setCurrentStep } = useOnboarding();

  useEffect(() => {
    // Set current step to diagnosis only once on mount
    setCurrentStep('diagnosis');
    
    // Simulate loading for smooth transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // If already answered, pre-select
  useEffect(() => {
    if (onboardingState.isDiagnosed) {
      setSelectedAnswer(onboardingState.isDiagnosed);
    }
  }, [onboardingState.isDiagnosed]);

  const handleBack = () => {
    navigate('/onboarding');
  };

  const handleSkip = () => {
    // Navigate to symptom assessment for unauthenticated users
    navigate('/symptom-assessment');
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleContinue = () => {
    if (!selectedAnswer) return;

    // Update diagnosis status in context
    updateDiagnosisStatus(selectedAnswer);

    if (selectedAnswer === 'yes') {
      // If diagnosed, show login/signup prompt to access diagnosed dashboard
      navigate('/signin', { 
        state: { 
          isDiagnosed: true,
          message: 'Please sign in to access your personalized diabetes management dashboard'
        } 
      });
    } else {
      // If not diagnosed, continue to symptom assessment
      navigate('/symptom-assessment');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.background.gradient || theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="md">
        {/* Header Actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: { xs: 3, md: 4 },
            gap: 2,
            flexWrap: isSmallScreen ? 'wrap' : 'nowrap',
          }}
        >
          <Tooltip title="Back to Tour" arrow disableInteractive>
            <Button
              variant="outlined"
              onClick={handleBack}
              startIcon={<Home sx={{ fontSize: { xs: 16, sm: 18 } }} />}
              sx={{
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                fontWeight: 600,
                color: theme.palette.text.primary,
                borderColor: alpha(theme.palette.divider, 0.2),
                px: { xs: 2, sm: 3 },
                py: { xs: 0.75, sm: 1 },
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                background: alpha(theme.palette.background.paper, 0.8),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  transform: 'translateX(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Back</Box>
            </Button>
          </Tooltip>

          <Tooltip title="Skip to Assessment" arrow disableInteractive>
            <Button
              variant="outlined"
              onClick={handleSkip}
              endIcon={<Close sx={{ fontSize: { xs: 16, sm: 18 } }} />}
              sx={{
                textTransform: 'none',
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                fontWeight: 600,
                color: theme.palette.primary.main,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                px: { xs: 2, sm: 3 },
                py: { xs: 0.75, sm: 1 },
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                background: alpha(theme.palette.background.paper, 0.8),
                '&:hover': {
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  borderColor: theme.palette.primary.main,
                  transform: 'scale(1.02)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Skip
            </Button>
          </Tooltip>
        </Box>

        {/* Main Content */}
        <Fade in={!isLoading} timeout={600}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4, md: 6 },
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              borderRadius: { xs: 3, md: 4 },
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
            }}
          >
            {/* Icon */}
            <Zoom in={!isLoading} timeout={800}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    width: { xs: 80, md: 100 },
                    height: { xs: 80, md: 100 },
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <HealthAndSafety sx={{ fontSize: { xs: 40, md: 50 }, color: 'white' }} />
                </Box>
              </Box>
            </Zoom>

            {/* Title */}
            <Fade in={!isLoading} timeout={1000}>
              <Typography
                variant="h3"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                  fontWeight: 800,
                  textAlign: 'center',
                  mb: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Diabetes Diagnosis Status
              </Typography>
            </Fade>

            {/* Subtitle */}
            <Fade in={!isLoading} timeout={1200}>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  textAlign: 'center',
                  fontSize: { xs: '0.95rem', sm: '1rem', md: '1.1rem' },
                  maxWidth: 600,
                  mx: 'auto',
                  mb: 5,
                  lineHeight: 1.7,
                }}
              >
                This helps us personalize your experience and provide you with the most relevant
                recommendations and management tools.
              </Typography>
            </Fade>

            {/* Answer Options */}
            <Stack spacing={3} sx={{ mb: 4 }}>
              <Zoom in={!isLoading} timeout={1400}>
                <Card
                  elevation={0}
                  onClick={() => handleAnswer('yes')}
                  sx={{
                    cursor: 'pointer',
                    border: `2px solid ${
                      selectedAnswer === 'yes'
                        ? theme.palette.primary.main
                        : alpha(theme.palette.divider, 0.2)
                    }`,
                    background:
                      selectedAnswer === 'yes'
                        ? alpha(theme.palette.primary.main, 0.08)
                        : alpha(theme.palette.background.paper, 0.6),
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      background: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: { xs: 48, md: 56 },
                          height: { xs: 48, md: 56 },
                          borderRadius: '50%',
                          background:
                            selectedAnswer === 'yes'
                              ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                              : alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {selectedAnswer === 'yes' ? (
                          <CheckCircle sx={{ fontSize: { xs: 24, md: 28 }, color: 'white' }} />
                        ) : (
                          <AssignmentTurnedIn
                            sx={{
                              fontSize: { xs: 24, md: 28 },
                              color: theme.palette.primary.main,
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: { xs: '1rem', md: '1.2rem' },
                            fontWeight: 700,
                            mb: 0.5,
                            color:
                              selectedAnswer === 'yes'
                                ? theme.palette.primary.main
                                : theme.palette.text.primary,
                          }}
                        >
                          Yes, I have been diagnosed with diabetes
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}
                        >
                          Access personalized diabetes management tools and insights
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>

              <Zoom in={!isLoading} timeout={1600}>
                <Card
                  elevation={0}
                  onClick={() => handleAnswer('no')}
                  sx={{
                    cursor: 'pointer',
                    border: `2px solid ${
                      selectedAnswer === 'no'
                        ? theme.palette.primary.main
                        : alpha(theme.palette.divider, 0.2)
                    }`,
                    background:
                      selectedAnswer === 'no'
                        ? alpha(theme.palette.primary.main, 0.08)
                        : alpha(theme.palette.background.paper, 0.6),
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      background: alpha(theme.palette.primary.main, 0.08),
                      transform: 'translateY(-4px)',
                      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                    },
                  }}
                >
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box
                        sx={{
                          width: { xs: 48, md: 56 },
                          height: { xs: 48, md: 56 },
                          borderRadius: '50%',
                          background:
                            selectedAnswer === 'no'
                              ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                              : alpha(theme.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {selectedAnswer === 'no' ? (
                          <CheckCircle sx={{ fontSize: { xs: 24, md: 28 }, color: 'white' }} />
                        ) : (
                          <PersonalVideo
                            sx={{
                              fontSize: { xs: 24, md: 28 },
                              color: theme.palette.primary.main,
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontSize: { xs: '1rem', md: '1.2rem' },
                            fontWeight: 700,
                            mb: 0.5,
                            color:
                              selectedAnswer === 'no'
                                ? theme.palette.primary.main
                                : theme.palette.text.primary,
                          }}
                        >
                          No, I am not diagnosed with diabetes
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.85rem', md: '0.9rem' } }}
                        >
                          Take our symptom assessment to evaluate your risk level
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Zoom>
            </Stack>

            {/* Continue Button */}
            <Fade in={!isLoading} timeout={1800}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleContinue}
                  disabled={!selectedAnswer}
                  endIcon={<ArrowForward />}
                  sx={{
                    minWidth: { xs: '100%', sm: 200 },
                    py: { xs: 1.75, sm: 1.5 },
                    px: { xs: 4, sm: 5 },
                    fontSize: { xs: '1rem', sm: '1.05rem' },
                    fontWeight: 700,
                    borderRadius: 2.5,
                    textTransform: 'none',
                    background: selectedAnswer
                      ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                      : alpha(theme.palette.action.disabled, 0.12),
                    color: selectedAnswer ? '#fff' : theme.palette.action.disabled,
                    boxShadow: selectedAnswer
                      ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
                      : 'none',
                    '&:hover': {
                      background: selectedAnswer
                        ? `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
                        : alpha(theme.palette.action.disabled, 0.12),
                      boxShadow: selectedAnswer
                        ? `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`
                        : 'none',
                      transform: selectedAnswer ? 'translateY(-2px) scale(1.02)' : 'none',
                    },
                    '&:disabled': {
                      opacity: 0.6,
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Continue
                </Button>
              </Box>
            </Fade>
          </Paper>
        </Fade>
      </Container>

      {/* Decorative Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Gradient Orbs */}
        <Box
          sx={{
            position: 'absolute',
            top: '-10%',
            right: '-5%',
            width: { xs: '300px', md: '500px' },
            height: { xs: '300px', md: '500px' },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(
              theme.palette.primary.main,
              0.15
            )}, transparent)`,
            filter: 'blur(60px)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '-10%',
            left: '-5%',
            width: { xs: '300px', md: '500px' },
            height: { xs: '300px', md: '500px' },
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha(
              theme.palette.secondary.main,
              0.15
            )}, transparent)`,
            filter: 'blur(60px)',
          }}
        />
      </Box>
    </Box>
  );
};

export default DiagnosisQuestion;
