import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  IconButton,
  Tooltip,
  Slide,
  Skeleton,
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
  Close,
  Home,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

const Onboarding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState('left');

  // Check if user is authenticated by checking localStorage
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  // Determine the safe back navigation path
  const getBackNavigationPath = () => {
    // Check if user is authenticated
    if (isAuthenticated()) {
      return '/dashboard';
    }
    
    // Check the referrer from location state
    const referrer = location.state?.from;
    
    // Never go back to login or signup pages
    if (referrer && !referrer.includes('signin') && !referrer.includes('signup') && !referrer.includes('login')) {
      return referrer;
    }
    
    // Default to landing page for unauthenticated users
    return '/';
  };

  const handleBackNavigation = () => {
    const backPath = getBackNavigationPath();
    navigate(backPath);
  };

  useEffect(() => {
    // Simulate loading for smooth transitions
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    {
      label: 'Welcome',
      title: 'Welcome to Your Health Journey',
      subtitle: 'Your AI-Powered Diabetes Management Companion',
      description: 'Take control of your health with intelligent symptom assessment, personalized recommendations, and comprehensive diabetes management tools.',
      icon: <HealthAndSafety sx={{ fontSize: { xs: 60, sm: 70, md: 80 } }} />,
      color: theme.palette.primary.main,
      features: [
        { icon: <Assessment sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />, text: 'Advanced AI Assessment', desc: 'ML-powered symptom analysis' },
        { icon: <Timeline sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />, text: 'Progress Tracking', desc: 'Monitor your health journey' },
        { icon: <Psychology sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />, text: 'Smart Insights', desc: 'Personalized recommendations' },
      ],
    },
    {
      label: 'Features',
      title: 'Comprehensive Health Management',
      subtitle: 'Everything You Need in One Place',
      description: 'Access a complete suite of tools designed to help you manage diabetes effectively and improve your quality of life.',
      icon: <LocalHospital sx={{ fontSize: { xs: 60, sm: 70, md: 80 } }} />,
      color: theme.palette.secondary.main,
      features: [
        { icon: <Restaurant sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />, text: 'Diet Plans', desc: 'Personalized meal recommendations' },
        { icon: <FitnessCenter sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />, text: 'Exercise Programs', desc: 'Tailored workout routines' },
        { icon: <TrendingUp sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />, text: 'Lifestyle Tips', desc: 'Daily health guidance' },
      ],
    },
    {
      label: 'Benefits',
      title: 'Why Choose Our Platform?',
      subtitle: 'Built with Your Health in Mind',
      description: 'Experience the difference with our advanced features, secure platform, and dedicated support for your diabetes management journey.',
      icon: <EmojiEvents sx={{ fontSize: { xs: 60, sm: 70, md: 80 } }} />,
      color: theme.palette.success.main,
      features: [
        { icon: <Security sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />, text: 'Secure & Private', desc: 'Your data is encrypted and protected' },
        { icon: <Speed sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />, text: 'Instant Results', desc: 'Get immediate health insights' },
        { icon: <CheckCircle sx={{ fontSize: { xs: 32, sm: 36, md: 40 } }} />, text: 'Evidence-Based', desc: 'Backed by medical research' },
      ],
    },
  ];

  const currentStep = steps[activeStep];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Navigate to diagnosis question instead of symptom assessment
      navigate('/diagnosis-question');
    } else {
      setDirection('left');
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setDirection('right');
    setActiveStep((prev) => prev - 1);
  };

  const handleSkip = () => {
    // Navigate to diagnosis question instead of symptom assessment
    navigate('/diagnosis-question');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.background.gradient || theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        py: { xs: 2, sm: 3, md: 4, lg: 6 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container 
        maxWidth="lg" 
        sx={{ 
          px: { xs: 2, sm: 3, md: 4 }, 
          position: 'relative', 
          zIndex: 1,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Navigation Bar with Back and Skip */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: { xs: 1.5, sm: 0 },
            mb: { xs: 2, md: 3 },
            position: 'relative', 
            zIndex: 1000,
          }}
        >
          {/* Smart Back Button */}
          <Tooltip title={isAuthenticated() ? 'Back to Dashboard' : 'Back to Home'} arrow>
            <Button
              variant="outlined"
              onClick={handleBackNavigation}
              startIcon={isAuthenticated() ? <DashboardIcon /> : <Home />}
              fullWidth={isSmallScreen}
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
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                {isAuthenticated() ? 'Dashboard' : 'Home'}
              </Box>
            </Button>
          </Tooltip>

          {/* Skip Tour Button */}
          <Tooltip title="Skip to Assessment" arrow disableInteractive>
            <span style={{ display: isSmallScreen ? 'block' : 'inline-block' }}>
              <Button
                variant="outlined"
                onClick={handleSkip}
                endIcon={<Close sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                fullWidth={isSmallScreen}
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
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  '&:hover': {
                    bgcolor: theme.palette.primary.main,
                    color: 'white',
                    borderColor: theme.palette.primary.main,
                    transform: 'scale(1.02)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Skip Tour
              </Button>
            </span>
          </Tooltip>
        </Box>

        {/* Progress Stepper */}
        <Slide direction="down" in={!isLoading} timeout={400}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              mb: { xs: 2, sm: 3, md: 4 },
              background: alpha(theme.palette.background.paper, 0.95),
              backdropFilter: 'blur(20px)',
              borderRadius: { xs: 2, md: 2.5 },
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
            }}
          >
            {isLoading ? (
              <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            ) : (
              <>
                <Stepper 
                  activeStep={activeStep} 
                  alternativeLabel={!isSmallScreen}
                  orientation={isSmallScreen ? 'horizontal' : 'horizontal'}
                  sx={{
                    '& .MuiStepConnector-root': {
                      display: isSmallScreen ? 'none' : 'flex',
                    },
                  }}
                >
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel
                        StepIconComponent={() => (
                          <Zoom in={true} timeout={300 + index * 100}>
                            <Box
                              sx={{
                                width: { xs: 28, sm: 32, md: 36 },
                                height: { xs: 28, sm: 32, md: 36 },
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor:
                                  index === activeStep
                                    ? theme.palette.primary.main
                                    : index < activeStep
                                    ? theme.palette.success.main
                                    : alpha(theme.palette.text.primary, 0.08),
                                color: index <= activeStep ? '#fff' : theme.palette.text.disabled,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: index === activeStep 
                                  ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`
                                  : 'none',
                              }}
                            >
                              {index < activeStep ? (
                                <CheckCircle sx={{ fontSize: { xs: 16, sm: 18, md: 20 } }} />
                              ) : (
                                <Typography 
                                  variant="body2" 
                                  fontWeight={700} 
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem', md: '0.8125rem' } }}
                                >
                                  {index + 1}
                                </Typography>
                              )}
                            </Box>
                          </Zoom>
                        )}
                      >
                        {!isSmallScreen && (
                          <Typography 
                            variant="caption" 
                            fontWeight={index === activeStep ? 600 : 500}
                            sx={{ 
                              mt: 1,
                              fontSize: { xs: '0.7rem', md: '0.75rem' },
                              color: index === activeStep ? 'text.primary' : 'text.secondary',
                              transition: 'color 0.2s ease',
                              display: { xs: 'none', sm: 'block' },
                            }}
                          >
                            {step.label}
                          </Typography>
                        )}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Progress Bar */}
                <Box sx={{ mt: { xs: 2, md: 2.5 } }}>
                  <LinearProgress
                    variant="determinate"
                    value={((activeStep + 1) / steps.length) * 100}
                    sx={{
                      height: { xs: 3, md: 4 },
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 2,
                        bgcolor: theme.palette.primary.main,
                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      fontWeight={600}
                      sx={{ fontSize: { xs: '0.65rem', md: '0.6875rem' } }}
                    >
                      Step {activeStep + 1} of {steps.length} • {Math.round(((activeStep + 1) / steps.length) * 100)}% Complete
                    </Typography>
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Slide>

        {/* Main Content with Slide Animation */}
        <Slide 
          direction={direction === 'left' ? 'left' : 'right'} 
          in={true} 
          timeout={400} 
          key={activeStep}
          mountOnEnter
          unmountOnExit
        >
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Hero Section with Integrated Features */}
            <Card
              elevation={0}
              sx={{
                mb: { xs: 2, sm: 3, md: 4 },
                background: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                borderRadius: { xs: 2, md: 2.5 },
                overflow: 'hidden',
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.06)}`,
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4, md: 5, lg: 6 } }}>
                <Stack spacing={{ xs: 3, md: 4 }} alignItems="center">
                  {/* Header Section */}
                  <Box sx={{ textAlign: 'center', width: '100%' }}>
                    {/* Animated Icon */}
                    <Zoom in={true} timeout={600}>
                      <Box
                        sx={{
                          p: { xs: 2, md: 2.5 },
                          borderRadius: { xs: 2.5, md: 3 },
                          background: `linear-gradient(135deg, ${alpha(currentStep.color, 0.1)}, ${alpha(currentStep.color, 0.05)})`,
                          color: currentStep.color,
                          display: 'inline-flex',
                          border: `2px solid ${alpha(currentStep.color, 0.2)}`,
                          transition: 'all 0.3s ease',
                          mb: { xs: 2, md: 2.5 },
                          '&:hover': {
                            transform: 'scale(1.05) rotate(5deg)',
                            boxShadow: `0 8px 24px ${alpha(currentStep.color, 0.2)}`,
                          },
                        }}
                      >
                        {currentStep.icon}
                      </Box>
                    </Zoom>

                    {/* Title and Description */}
                    <Box sx={{ maxWidth: { xs: '100%', sm: 600, md: 680 }, mx: 'auto', px: { xs: 0, sm: 2 } }}>
                      <Fade in={true} timeout={800}>
                        <Typography
                          variant="h3"
                          fontWeight={800}
                          sx={{
                            fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.125rem', lg: '2.5rem' },
                            color: 'text.primary',
                            letterSpacing: '-0.02em',
                            mb: { xs: 1.5, md: 2 },
                            lineHeight: 1.2,
                          }}
                        >
                          {currentStep.title}
                        </Typography>
                      </Fade>
                      <Fade in={true} timeout={1000}>
                        <Typography
                          variant="h6"
                          sx={{ 
                            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                            fontWeight: 600,
                            mb: { xs: 1, md: 1.5 },
                            background: `linear-gradient(135deg, ${currentStep.color}, ${alpha(currentStep.color, 0.7)})`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          {currentStep.subtitle}
                        </Typography>
                      </Fade>
                      <Fade in={true} timeout={1200}>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{
                            fontSize: { xs: '0.9rem', sm: '0.95rem', md: '1rem' },
                            lineHeight: 1.7,
                            maxWidth: { xs: '100%', md: 560 },
                            mx: 'auto',
                          }}
                        >
                          {currentStep.description}
                        </Typography>
                      </Fade>
                    </Box>
                  </Box>

                  {/* Features Grid Layout - Integrated within Hero */}
                  <Box sx={{ width: '100%' }}>
                    <Grid 
                      container 
                      spacing={{ xs: 2, sm: 2.5, md: 3 }} 
                      sx={{ 
                        justifyContent: 'center',
                        alignItems: 'stretch',
                      }}
                    >
                      {currentStep.features.map((feature, index) => (
                        <Grid 
                          item 
                          xs={12} 
                          sm={6} 
                          md={4} 
                          key={index}
                          sx={{ display: 'flex' }}
                        >
                          <Zoom 
                            in={true} 
                            timeout={400 + index * 150} 
                            style={{ transitionDelay: `${index * 100}ms`, width: '100%', display: 'flex' }}
                          >
                            <Card
                              elevation={0}
                              sx={{
                                width: '100%',
                                height: 240,
                                minHeight: 240,
                                maxHeight: 240,
                                display: 'flex',
                                flexDirection: 'column',
                                background: alpha(theme.palette.background.paper, 0.6),
                                backdropFilter: 'blur(10px)',
                                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                borderRadius: { xs: 2, md: 2.5 },
                                overflow: 'hidden',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                '&:hover': {
                                  transform: 'translateY(-8px) scale(1.02)',
                                  borderColor: alpha(currentStep.color, 0.3),
                                  boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.1)}`,
                                  background: alpha(theme.palette.background.paper, 0.8),
                                  '& .feature-icon': {
                                    transform: 'scale(1.1) rotate(5deg)',
                                    bgcolor: alpha(currentStep.color, 0.15),
                                  },
                                },
                              }}
                            >
                              <CardContent
                                sx={{
                                  p: 3,
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'flex-start',
                                  '&:last-child': { pb: 3 },
                                  overflow: 'hidden',
                                }}
                              >
                                <Stack spacing={2} sx={{ height: '100%', overflow: 'hidden' }}>
                                  {/* Icon */}
                                  <Box
                                    className="feature-icon"
                                    sx={{
                                      width: 64,
                                      height: 64,
                                      borderRadius: 2.5,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: alpha(currentStep.color, 0.1),
                                      color: currentStep.color,
                                      transition: 'all 0.3s ease',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {feature.icon}
                                  </Box>
                                  
                                  {/* Text Content */}
                                  <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <Typography 
                                      variant="h6" 
                                      fontWeight={700} 
                                      sx={{ 
                                        fontSize: '1.0625rem',
                                        mb: 0.75,
                                        color: 'text.primary',
                                        lineHeight: 1.3,
                                        height: '2.6em',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                      }}
                                    >
                                      {feature.text}
                                    </Typography>
                                    <Typography 
                                      variant="body2" 
                                      color="text.secondary" 
                                      sx={{ 
                                        lineHeight: 1.6,
                                        fontSize: '0.875rem',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        flex: 1,
                                      }}
                                    >
                                      {feature.desc}
                                    </Typography>
                                  </Box>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Zoom>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Responsive Navigation Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: 'stretch',
                mt: { xs: 3, md: 4 },
                gap: { xs: 2, sm: 2 },
              }}
            >
              {/* Back Button */}
              <Fade in={activeStep > 0} timeout={300}>
                <Box sx={{ flex: { xs: 1, sm: 0 } }}>
                  <Button
                    size={isMobile ? 'large' : 'medium'}
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    startIcon={<ArrowBack />}
                    fullWidth={isMobile}
                    sx={{
                      minWidth: { xs: '100%', sm: 120 },
                      px: { xs: 3, sm: 3, md: 3.5 },
                      py: { xs: 1.5, sm: 1.25, md: 1.5 },
                      borderRadius: { xs: 2, md: 2.5 },
                      textTransform: 'none',
                      fontSize: { xs: '1rem', sm: '0.9375rem' },
                      fontWeight: 600,
                      visibility: activeStep === 0 ? 'hidden' : 'visible',
                      color: 'text.secondary',
                      border: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
                      backdropFilter: 'blur(10px)',
                      background: alpha(theme.palette.background.paper, 0.8),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.text.primary, 0.05),
                        color: 'text.primary',
                        borderColor: alpha(theme.palette.text.primary, 0.2),
                        transform: 'translateX(-4px)',
                      },
                      '&:disabled': {
                        opacity: 0,
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Back
                  </Button>
                </Box>
              </Fade>

              {/* Next/Get Started Button */}
              <Box sx={{ flex: { xs: 1, sm: 0 } }}>
                <Button
                  variant="contained"
                  size={isMobile ? 'large' : 'medium'}
                  onClick={handleNext}
                  endIcon={activeStep === steps.length - 1 ? <CheckCircle /> : <ArrowForward />}
                  fullWidth={isMobile}
                  sx={{
                    minWidth: { xs: '100%', sm: 180 },
                    py: { xs: 1.75, sm: 1.5, md: 1.75 },
                    px: { xs: 4, sm: 4, md: 5 },
                    fontSize: { xs: '1rem', sm: '0.9375rem', md: '1rem' },
                    fontWeight: 700,
                    borderRadius: { xs: 2, md: 2.5 },
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: '#fff',
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-2px) scale(1.02)',
                    },
                    '&:active': {
                      transform: 'translateY(0) scale(0.98)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  {activeStep === steps.length - 1 ? 'Get Started' : 'Continue'}
                </Button>
              </Box>
            </Box>

            {/* Mobile Quick Navigation Dots */}
            {isSmallScreen && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 1,
                  mt: 3,
                }}
              >
                {steps.map((_, index) => (
                  <Box
                    key={index}
                    onClick={() => {
                      setDirection(index > activeStep ? 'left' : 'right');
                      setActiveStep(index);
                    }}
                    sx={{
                      width: index === activeStep ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      bgcolor: index === activeStep 
                        ? theme.palette.primary.main 
                        : alpha(theme.palette.text.primary, 0.2),
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: index === activeStep 
                          ? theme.palette.primary.dark 
                          : alpha(theme.palette.text.primary, 0.4),
                      },
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Slide>
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
            background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)}, transparent)`,
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
            background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)}, transparent)`,
            filter: 'blur(60px)',
          }}
        />
      </Box>
    </Box>
  );
};

export default Onboarding;
