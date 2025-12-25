import React, { useState } from 'react';
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
  Grid,
  Card,
  CardContent,
  alpha,
  Fade,
  Zoom,
  Stack,
  useTheme,
  useMediaQuery,
  LinearProgress,
} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  CheckCircle,
  Assessment,
  Timeline,
  HealthAndSafety,
  Psychology,
  TrendingUp,
  LocalHospital,
  FitnessCenter,
  Restaurant,
  EmojiEvents,
  Security,
  Speed,
} from '@mui/icons-material';

const Onboarding = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      label: 'Welcome',
      title: 'Welcome to Your Health Journey',
      subtitle: 'Your AI-Powered Diabetes Management Companion',
      description: 'Take control of your health with intelligent symptom assessment, personalized recommendations, and comprehensive diabetes management tools.',
      icon: <HealthAndSafety sx={{ fontSize: 80 }} />,
      color: theme.palette.primary.main,
      features: [
        { icon: <Assessment sx={{ fontSize: 40 }} />, text: 'Advanced AI Assessment', desc: 'ML-powered symptom analysis' },
        { icon: <Timeline sx={{ fontSize: 40 }} />, text: 'Progress Tracking', desc: 'Monitor your health journey' },
        { icon: <Psychology sx={{ fontSize: 40 }} />, text: 'Smart Insights', desc: 'Personalized recommendations' },
      ],
    },
    {
      label: 'Features',
      title: 'Comprehensive Health Management',
      subtitle: 'Everything You Need in One Place',
      description: 'Access a complete suite of tools designed to help you manage diabetes effectively and improve your quality of life.',
      icon: <LocalHospital sx={{ fontSize: 80 }} />,
      color: theme.palette.secondary.main,
      features: [
        { icon: <Restaurant sx={{ fontSize: 40 }} />, text: 'Diet Plans', desc: 'Personalized meal recommendations' },
        { icon: <FitnessCenter sx={{ fontSize: 40 }} />, text: 'Exercise Programs', desc: 'Tailored workout routines' },
        { icon: <TrendingUp sx={{ fontSize: 40 }} />, text: 'Lifestyle Tips', desc: 'Daily health guidance' },
      ],
    },
    {
      label: 'Benefits',
      title: 'Why Choose Our Platform?',
      subtitle: 'Built with Your Health in Mind',
      description: 'Experience the difference with our advanced features, secure platform, and dedicated support for your diabetes management journey.',
      icon: <EmojiEvents sx={{ fontSize: 80 }} />,
      color: theme.palette.success.main,
      features: [
        { icon: <Security sx={{ fontSize: 40 }} />, text: 'Secure & Private', desc: 'Your data is encrypted and protected' },
        { icon: <Speed sx={{ fontSize: 40 }} />, text: 'Instant Results', desc: 'Get immediate health insights' },
        { icon: <CheckCircle sx={{ fontSize: 40 }} />, text: 'Evidence-Based', desc: 'Backed by medical research' },
      ],
    },
  ];

  const currentStep = steps[activeStep];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      navigate('/symptom-assessment');
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSkip = () => {
    navigate('/symptom-assessment');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        py: { xs: 3, md: 6 },
        position: 'relative',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, md: 4 } }}>
        {/* Header with Skip */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="text"
            onClick={handleSkip}
            sx={{
              textTransform: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.secondary',
              px: 2,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                color: 'text.primary',
                bgcolor: alpha(theme.palette.text.primary, 0.04),
              },
              transition: 'color 0.2s ease',
            }}
          >
            Skip Tour
          </Button>
        </Box>

        {/* Progress Stepper */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: { xs: 3, md: 4 },
            background: theme.palette.background.paper,
            borderRadius: 2.5,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor:
                          index === activeStep
                            ? theme.palette.primary.main
                            : index < activeStep
                            ? theme.palette.success.main
                            : alpha(theme.palette.text.primary, 0.06),
                        color: index <= activeStep ? '#fff' : theme.palette.text.disabled,
                        transition: 'all 0.25s ease-out',
                      }}
                    >
                      {index < activeStep ? (
                        <CheckCircle sx={{ fontSize: 20 }} />
                      ) : (
                        <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8125rem' }}>
                          {index + 1}
                        </Typography>
                      )}
                    </Box>
                  )}
                >
                  <Typography 
                    variant="caption" 
                    fontWeight={index === activeStep ? 600 : 500}
                    sx={{ 
                      mt: 1,
                      fontSize: '0.75rem',
                      color: index === activeStep ? 'text.primary' : 'text.secondary',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Progress Bar */}
          <Box sx={{ mt: 2.5 }}>
            <LinearProgress
              variant="determinate"
              value={((activeStep + 1) / steps.length) * 100}
              sx={{
                height: 4,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  bgcolor: theme.palette.primary.main,
                  transition: 'transform 0.3s ease-out',
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6875rem' }}>
                Step {activeStep + 1} of {steps.length}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Main Content */}
        <Fade in={true} timeout={500} key={activeStep}>
          <Box>
            {/* Hero Section */}
            <Card
              elevation={0}
              sx={{
                mb: { xs: 3, md: 4 },
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                borderRadius: 2.5,
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                <Stack spacing={2.5} alignItems="center" textAlign="center">
                  {/* Icon */}
                  <Fade in={true} timeout={400}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: alpha(currentStep.color, 0.08),
                        color: currentStep.color,
                        display: 'inline-flex',
                      }}
                    >
                      {currentStep.icon}
                    </Box>
                  </Fade>

                  {/* Title */}
                  <Box sx={{ maxWidth: 640, mx: 'auto' }}>
                    <Typography
                      variant="h4"
                      fontWeight={700}
                      sx={{
                        fontSize: { xs: '1.5rem', md: '2rem' },
                        color: 'text.primary',
                        letterSpacing: '-0.01em',
                        mb: 1.5,
                      }}
                    >
                      {currentStep.title}
                    </Typography>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ 
                        fontSize: { xs: '1rem', md: '1.125rem' },
                        fontWeight: 500,
                        mb: 1,
                      }}
                    >
                      {currentStep.subtitle}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontSize: { xs: '0.9375rem', md: '1rem' },
                        lineHeight: 1.6,
                        maxWidth: 560,
                        mx: 'auto',
                      }}
                    >
                      {currentStep.description}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Features Grid */}
            <Box sx={{ mx: { xs: 0, md: -0.5 } }}>
              <Grid container spacing={{ xs: 2.5, md: 3 }} sx={{ justifyContent: 'center' }}>
                {currentStep.features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: 'flex' }}>
                  <Card
                    elevation={0}
                    sx={{
                        width: '100%',
                        background: theme.palette.background.paper,
                        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        borderRadius: 2.5,
                        transition: 'all 0.25s ease-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
                        },
                      }}
                    >
                      <CardContent sx={{ p: { xs: 3, md: 4 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Stack spacing={2}>
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: 2.5,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: alpha(currentStep.color, 0.08),
                              color: currentStep.color,
                            }}
                          >
                            {feature.icon}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="h6" 
                              fontWeight={600} 
                              sx={{ 
                                fontSize: { xs: '1rem', md: '1.0625rem' },
                                mb: 1,
                                color: 'text.primary',
                              }}
                            >
                              {feature.text}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary" 
                              sx={{ 
                                lineHeight: 1.6,
                                fontSize: '0.9375rem',
                              }}
                            >
                              {feature.desc}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Navigation Buttons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: { xs: 4, md: 5 },
                gap: 2,
              }}
            >
              <Button
                size="medium"
                onClick={handleBack}
                disabled={activeStep === 0}
                startIcon={<ArrowBack />}
                sx={{
                  minWidth: 100,
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '0.9375rem',
                  fontWeight: 500,
                  visibility: activeStep === 0 ? 'hidden' : 'visible',
                  color: 'text.secondary',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.text.primary, 0.04),
                    color: 'text.primary',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                Back
              </Button>

              <Button
                variant="contained"
                size="medium"
                onClick={handleNext}
                endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <ArrowForward />}
                sx={{
                  minWidth: 160,
                  py: 1.25,
                  px: 4,
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  bgcolor: theme.palette.primary.main,
                  color: '#fff',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                  },
                  transition: 'all 0.2s ease-out',
                }}
              >
                {activeStep === steps.length - 1 ? 'Get Started' : 'Continue'}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default Onboarding;
