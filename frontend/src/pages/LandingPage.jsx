import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Chip,
  Paper,
  IconButton,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
  Link,
  alpha,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  HealthAndSafety,
  Assessment,
  TrendingUp,
  Security,
  Speed,
  Support,
  ArrowForward,
  CheckCircle,
  Star,
  PlayArrow,
  GitHub,
  LinkedIn,
  Twitter,
  Email,
  Phone,
  LocationOn,
  Analytics,
  Psychology,
  LocalHospital,
  Timeline,
  Article as ArticleIcon,
} from '@mui/icons-material';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ThemeToggle from '../components/Common/ThemeToggle';
import BlogSection from '../components/Common/BlogSection';
import ArticleModal from '../components/Common/ArticleModal';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [ref, inView] = useInView({ threshold: 0.1 });
  const controls = useAnimation();
  const [scrolled, setScrolled] = useState(false);
  const [articleModal, setArticleModal] = useState({ open: false, article: null });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 100;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  const features = [
    {
      icon: <Analytics sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: 'AI-Powered Assessment',
      description: 'Advanced machine learning algorithms analyze your symptoms and provide accurate diabetes risk assessment with confidence scoring.',
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: theme.palette.secondary.main }} />,
      title: 'Personalized Recommendations',
      description: 'Get tailored health recommendations based on your specific symptoms and risk factors.',
    },
    {
      icon: <LocalHospital sx={{ fontSize: 40, color: theme.palette.success.main }} />,
      title: 'Comprehensive Symptom Tracking',
      description: 'Track and monitor diabetes-related symptoms with detailed questionnaires and progress tracking.',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: theme.palette.warning.main }} />,
      title: 'Secure & Private',
      description: 'Your health data is encrypted and stored securely with full privacy protection.',
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: theme.palette.info.main }} />,
      title: 'Instant Results',
      description: 'Get your assessment results immediately with detailed explanations and next steps.',
    },
    {
      icon: <Support sx={{ fontSize: 40, color: theme.palette.error.main }} />,
      title: '24/7 Support',
      description: 'Access comprehensive health resources and support whenever you need it.',
    },
  ];

  const stats = [
    { number: '95%', label: 'Accuracy Rate', icon: <TrendingUp /> },
    { number: '10K+', label: 'Users Helped', icon: <HealthAndSafety /> },
    { number: '50+', label: 'Symptoms Tracked', icon: <Assessment /> },
    { number: '24/7', label: 'Available Support', icon: <Support /> },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Diabetes Patient',
      content: 'This system helped me understand my symptoms better and provided actionable recommendations. The AI assessment was incredibly accurate!',
      avatar: 'SJ',
      rating: 5,
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Endocrinologist',
      content: 'As a healthcare professional, I recommend this tool to my patients. It provides valuable insights and helps with early detection.',
      avatar: 'MC',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'Health Coach',
      content: 'The personalized recommendations are spot-on. My clients love how easy it is to track their symptoms and get instant feedback.',
      avatar: 'ER',
      rating: 5,
    },
  ];

  const handleArticleClick = (article) => {
    setArticleModal({ open: true, article });
  };

  const handleCloseArticleModal = () => {
    setArticleModal({ open: false, article: null });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: theme.palette.background.gradient || theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Floating Circular Navbar */}
      <Box
        sx={{
          position: 'fixed',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
        }}
      >
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
                <Paper
                  elevation={12}
                  sx={{
                    background: alpha(theme.palette.background.paper, 0.98),
                    backdropFilter: 'blur(25px)',
                    borderRadius: '30px',
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                    boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
                    px: 4,
                    py: 1.5,
                  }}
                >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                height: '100%',
              }}
            >
              {/* Logo */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    width: 45,
                    height: 45,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                    cursor: 'pointer',
                  }}
                >
                  <HealthAndSafety sx={{ fontSize: 22, color: 'white' }} />
                </Box>
              </motion.div>

              {/* Navigation Links */}
              {[
                { label: 'Home', href: '#home' },
                { label: 'About', href: '#about' },
                { label: 'Blogs & Articles', href: '#blogs-articles' },
                { label: 'Contact', href: '#contact' },
              ].map((link, index) => (
                <motion.div
                  key={link.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                        <Button
                          variant="text"
                          sx={{
                            color: theme.palette.text.primary,
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: '20px',
                            px: 2.5,
                            py: 0,
                            minWidth: '60px',
                            fontSize: '0.95rem',
                            height: '36px',
                            minHeight: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1,
                            whiteSpace: 'nowrap',
                            '&:hover': {
                              background: alpha(theme.palette.primary.main, 0.08),
                              color: theme.palette.primary.main,
                            },
                          }}
                    onClick={() => {
                      const element = document.querySelector(link.href);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    {link.label}
                  </Button>
                </motion.div>
              ))}

                    {/* Divider */}
                    <Divider orientation="vertical" flexItem sx={{ mx: 1, height: '30px' }} />

              {/* Theme Toggle */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <ThemeToggle />
              </motion.div>

              {/* Auth Buttons */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate('/signin')}
                          sx={{
                            borderRadius: '20px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2.5,
                            py: 0,
                            fontSize: '0.9rem',
                            height: '36px',
                            minHeight: '36px',
                            minWidth: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            lineHeight: 1,
                            whiteSpace: 'nowrap',
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              background: alpha(theme.palette.primary.main, 0.05),
                            },
                          }}
                        >
                          Sign In
                        </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/signup')}
                  startIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: '20px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2.5,
                    py: 0,
                    fontSize: '0.9rem',
                    height: '36px',
                    minHeight: '36px',
                    minWidth: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                  }}
                >
                  Get Started
                </Button>
              </motion.div>
            </Box>
          </Paper>
        </motion.div>
      </Box>

      {/* Hero Section with Healthcare Image */}
      <Box id="home" sx={{ pt: 12, pb: 8, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Hero Content with Split Layout */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              height: { xs: 'auto', md: '75vh' }, 
              overflow: 'hidden',
              minHeight: { xs: '100vh', md: '75vh' },
              borderRadius: 4,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}>
              {/* Left Side - Text Content */}
              <Box
                sx={{
                  flex: 1,
                  height: { xs: 'auto', md: '100%' },
                  minHeight: { xs: '60vh', md: '100%' },
                  display: 'flex',
                  alignItems: 'center',
                  background: theme.palette.background.paper,
                  p: { xs: 4, md: 8 },
                  pl: { xs: 4, md: 8 },
                }}
              >
                    <motion.div variants={itemVariants}>
                      <Box sx={{ 
                        textAlign: { xs: 'center', md: 'left' },
                        maxWidth: { xs: '100%', md: '90%' },
                        ml: { xs: 0, md: 2 }
                      }}>
                        <Typography
                          variant="h2"
                          fontWeight={700}
                          color="text.primary"
                          gutterBottom
                          sx={{
                            fontSize: { xs: '2rem', md: '2.8rem' },
                            lineHeight: 1.2,
                            mb: 2,
                          }}
                        >
                          Smart Diabetes
                          <br />
                          <Box component="span" color="primary.main">
                            Risk Assessment
                          </Box>
                        </Typography>
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          paragraph
                          sx={{ 
                            mb: 3, 
                            fontSize: { xs: '1rem', md: '1.1rem' }, 
                            lineHeight: 1.5,
                            maxWidth: 500,
                            mx: { xs: 'auto', md: 0 },
                          }}
                        >
                          Harness the power of AI to assess your diabetes risk through comprehensive symptom analysis and get personalized health recommendations.
                        </Typography>
                        <Stack 
                          direction={{ xs: 'column', sm: 'row' }} 
                          spacing={3}
                          justifyContent={{ xs: 'center', md: 'flex-start' }}
                        >
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="contained"
                              size="large"
                              onClick={() => navigate('/signup')}
                              startIcon={<ArrowForward />}
                            sx={{
                              py: 1.5,
                              px: 4,
                              fontSize: '1rem',
                              borderRadius: 3,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                              '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                                boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                              },
                            }}
                            >
                              Start Assessment
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outlined"
                              size="large"
                              startIcon={<PlayArrow />}
                            sx={{
                              py: 1.5,
                              px: 4,
                              fontSize: '1rem',
                              borderRadius: 3,
                              borderWidth: 2,
                              borderColor: theme.palette.primary.main,
                              color: theme.palette.primary.main,
                              '&:hover': {
                                borderWidth: 2,
                                background: alpha(theme.palette.primary.main, 0.1),
                              },
                            }}
                            >
                              Watch Demo
                            </Button>
                          </motion.div>
                        </Stack>
                      </Box>
                    </motion.div>
                </Box>
                
                {/* Right Side - Doctor Image */}
                <Box
                  sx={{
                    flex: 1,
                    height: { xs: '40vh', md: '100%' },
                    minHeight: { xs: '300px', md: '100%' },
                    position: 'relative',
                    width: '100%',
                    overflow: 'hidden',
                    backgroundImage: `url('/images/Doc.jpg')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      zIndex: 1,
                    },
                    '&::after': {
                      content: '"🏥"',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '4rem',
                      opacity: 0,
                      zIndex: 2,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover::after': {
                      opacity: 0.3,
                    },
                  }}
                />
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 6, background: alpha(theme.palette.primary.main, 0.05) }}>
        <Container maxWidth="lg">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={containerVariants}
          >
            <Grid container spacing={4} justifyContent="center">
              {stats.map((stat, index) => (
                <Grid size={{ xs: 6, md: 3 }} key={index} sx={{ display: 'flex', height: '280px' }}>
                  <motion.div 
                    variants={itemVariants} 
                    style={{ width: '100%' }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        width: '100%',
                        height: '280px',
                        minHeight: '280px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderRadius: 4,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                          border: `2px solid ${theme.palette.primary.main}`,
                          '&::before': {
                            opacity: 1,
                          },
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.secondary.main, 0.05)})`,
                          opacity: 0,
                          transition: 'opacity 0.4s ease',
                          zIndex: 0,
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexGrow: 1,
                          height: '100%',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        <motion.div
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Box 
                            sx={{ 
                              color: theme.palette.primary.main, 
                              mb: 3,
                              p: 2,
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              width: 60,
                              height: 60,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {stat.icon}
                          </Box>
                        </motion.div>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <Typography 
                            variant="h2" 
                            fontWeight={800} 
                            sx={{ 
                              mb: 2,
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {stat.number}
                          </Typography>
                        </motion.div>
                        <Typography 
                          variant="h6" 
                          color="text.secondary"
                          sx={{ fontWeight: 600 }}
                        >
                          {stat.label}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Enhanced Assessment Process Section */}
      <Box id="about" sx={{ py: 10, background: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <motion.div variants={itemVariants}>
                <Typography variant="h3" fontWeight={700} color="text.primary" gutterBottom>
                  How DiaVise Works
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                  Our comprehensive 4-step process ensures accurate diabetes risk assessment through advanced AI technology
                </Typography>
              </motion.div>
            </Box>

            {/* Enhanced Process Flow */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: 'center',
                gap: 4,
                maxWidth: 1400,
                mx: 'auto',
                mb: 10,
                flexWrap: { xs: 'wrap', lg: 'nowrap' },
              }}
            >
              {[
                { 
                  step: '1', 
                  title: 'Input Symptoms', 
                  description: 'Enter your health data and symptoms through our comprehensive questionnaire',
                  icon: <Assessment sx={{ fontSize: 48 }} />,
                  color: theme.palette.primary.main,
                  bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`
                },
                { 
                  step: '2', 
                  title: 'AI Analysis', 
                  description: 'Advanced machine learning algorithms process and analyze your data',
                  icon: <Analytics sx={{ fontSize: 48 }} />,
                  color: theme.palette.success.main,
                  bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`
                },
                { 
                  step: '3', 
                  title: 'Risk Assessment', 
                  description: 'Comprehensive diabetes risk evaluation with confidence scoring',
                  icon: <Psychology sx={{ fontSize: 48 }} />,
                  color: theme.palette.warning.main,
                  bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`
                },
                { 
                  step: '4', 
                  title: 'Get Results', 
                  description: 'Personalized recommendations and actionable health insights',
                  icon: <TrendingUp sx={{ fontSize: 48 }} />,
                  color: theme.palette.info.main,
                  bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.08, rotateY: 5 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{ perspective: '1000px' }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      borderRadius: 6,
                      background: item.bgGradient,
                      border: `3px solid ${alpha(item.color, 0.2)}`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      width: '100%',
                      minHeight: 400,
                      maxHeight: 400,
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: `0 25px 50px ${alpha(item.color, 0.2)}`,
                        border: `3px solid ${item.color}`,
                        transform: 'translateY(-12px)',
                        '&::before': {
                          opacity: 1,
                        },
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `radial-gradient(circle at center, ${alpha(item.color, 0.1)}, transparent)`,
                        opacity: 0,
                        transition: 'opacity 0.4s ease',
                        zIndex: 0,
                      },
                    }}
                  >
                    <Box sx={{ 
                      position: 'relative', 
                      zIndex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      height: '100%',
                      flex: 1,
                    }}>
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <Box
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${item.color}, ${alpha(item.color, 0.8)})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '1.8rem',
                            mb: 3,
                            mx: 'auto',
                            boxShadow: `0 8px 24px ${alpha(item.color, 0.4)}`,
                            border: `3px solid ${alpha(item.color, 0.2)}`,
                          }}
                        >
                          {item.step}
                        </Box>
                      </motion.div>
                      
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Box sx={{ color: item.color, mb: 3 }}>
                          {item.icon}
                        </Box>
                      </motion.div>
                      
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="h5" fontWeight={700} color="text.primary" gutterBottom>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '1rem' }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </Box>

            {/* Technology Stack */}
            <Box sx={{ textAlign: 'center' }}>
              <motion.div variants={itemVariants}>
                <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
                  Powered by Advanced Technology
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                  Our platform leverages cutting-edge AI and medical technology to deliver accurate assessments
                </Typography>
              </motion.div>
              
              <Grid container spacing={6} justifyContent="center" sx={{ maxWidth: 1000, mx: 'auto' }}>
                {[
                  {
                    icon: <Psychology sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
                    title: 'Machine Learning',
                    description: 'XGBoost algorithms trained on medical datasets',
                    color: theme.palette.primary.main,
                  },
                  {
                    icon: <Analytics sx={{ fontSize: 40, color: theme.palette.success.main }} />,
                    title: 'Data Analytics',
                    description: 'Real-time processing and analysis',
                    color: theme.palette.success.main,
                  },
                  {
                    icon: <Security sx={{ fontSize: 40, color: theme.palette.warning.main }} />,
                    title: 'Security',
                    description: 'End-to-end encryption and HIPAA compliance',
                    color: theme.palette.warning.main,
                  },
                  {
                    icon: <Timeline sx={{ fontSize: 40, color: theme.palette.info.main }} />,
                    title: 'Monitoring',
                    description: 'Continuous health tracking and updates',
                    color: theme.palette.info.main,
                  },
                ].map((tech, index) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={index}>
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, rotateY: 5 }}
                      transition={{ duration: 0.3 }}
                      style={{ perspective: '1000px' }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: 4,
                          textAlign: 'center',
                          borderRadius: 4,
                          background: `linear-gradient(135deg, ${alpha(tech.color, 0.05)}, ${alpha(tech.color, 0.02)})`,
                          border: `2px solid ${alpha(tech.color, 0.1)}`,
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            boxShadow: `0 15px 35px ${alpha(tech.color, 0.15)}`,
                            border: `2px solid ${tech.color}`,
                            transform: 'translateY(-6px)',
                            '&::before': {
                              opacity: 1,
                            },
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: `radial-gradient(circle at center, ${alpha(tech.color, 0.08)}, transparent)`,
                            opacity: 0,
                            transition: 'opacity 0.4s ease',
                            zIndex: 0,
                          },
                        }}
                      >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                          <motion.div
                            whileHover={{ rotate: 360, scale: 1.2 }}
                            transition={{ duration: 0.6 }}
                          >
                            <Box 
                              sx={{ 
                                mb: 3,
                                p: 2,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${alpha(tech.color, 0.1)}, ${alpha(tech.color, 0.05)})`,
                                border: `2px solid ${alpha(tech.color, 0.2)}`,
                                width: 80,
                                height: 80,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                              }}
                            >
                              {tech.icon}
                            </Box>
                          </motion.div>
                          <Typography variant="h5" fontWeight={700} gutterBottom>
                            {tech.title}
                          </Typography>
                          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {tech.description}
                          </Typography>
                        </Box>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, background: alpha(theme.palette.primary.main, 0.05) }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <Box textAlign="center" mb={6}>
              <motion.div variants={itemVariants}>
                <Typography variant="h3" fontWeight={700} color="text.primary" gutterBottom>
                  Comprehensive Features
                </Typography>
                <Typography variant="h6" color="text.secondary" maxWidth="md" mx="auto">
                  Everything you need for accurate diabetes risk assessment and health management
                </Typography>
              </motion.div>
            </Box>
            <Grid container spacing={4} justifyContent="center">
              {features.map((feature, index) => (
                <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={index} sx={{ display: 'flex' }}>
                  <motion.div variants={itemVariants} style={{ width: '100%' }}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: theme.shadows[12],
                          border: `1px solid ${theme.palette.primary.main}40`,
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          flexGrow: 1,
                        }}
                      >
                        <Box
                          sx={{
                            mb: 3,
                            p: 2,
                            borderRadius: '50%',
                            background: alpha(feature.icon.props.sx.color, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            lineHeight: 1.6,
                            flexGrow: 1,
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 8, background: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <Box textAlign="center" mb={6}>
              <motion.div variants={itemVariants}>
                <Typography variant="h3" fontWeight={700} color="text.primary" gutterBottom>
                  What Our Users Say
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Trusted by patients and healthcare professionals worldwide
                </Typography>
              </motion.div>
            </Box>
            <Grid container spacing={4} justifyContent="center">
              {testimonials.map((testimonial, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={index} sx={{ display: 'flex' }}>
                  <motion.div variants={itemVariants} style={{ width: '100%' }}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        background: theme.palette.background.paper,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                          border: `1px solid ${theme.palette.primary.main}`,
                        },
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 4,
                          display: 'flex',
                          flexDirection: 'column',
                          flexGrow: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', mb: 3 }}>
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} sx={{ color: '#ffc107', fontSize: 20 }} />
                          ))}
                        </Box>
                        <Typography 
                          variant="body1" 
                          color="text.secondary" 
                          paragraph
                          sx={{ 
                            flexGrow: 1,
                            fontStyle: 'italic',
                            lineHeight: 1.6,
                          }}
                        >
                          "{testimonial.content}"
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 'auto' }}>
                          <Avatar 
                            sx={{ 
                              bgcolor: theme.palette.primary.main,
                              width: 48,
                              height: 48,
                              fontSize: '1.1rem',
                              fontWeight: 600,
                            }}
                          >
                            {testimonial.avatar}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {testimonial.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {testimonial.role}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* Blogs & Articles Section */}
      <BlogSection
        title="Health & Wellness Articles"
        subtitle="Discover expert insights, tips, and latest research on diabetes management and healthy living"
        showFilters={true}
        limit={3}
        featuredFirst={true}
        onArticleClick={handleArticleClick}
      />

      {/* CTA Section */}
      <Box sx={{ py: 8, background: alpha(theme.palette.primary.main, 0.05) }}>
        <Container maxWidth="md">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <Paper
              sx={{
                p: 6,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'white',
                borderRadius: 3,
              }}
            >
              <motion.div variants={itemVariants}>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  Ready to Take Control of Your Health?
                </Typography>
                <Typography variant="h6" paragraph sx={{ opacity: 0.9 }}>
                  Join thousands of users who have already discovered their diabetes risk and received personalized recommendations.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/signup')}
                    sx={{
                      background: 'white',
                      color: theme.palette.primary.main,
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      '&:hover': {
                        background: alpha('#ffffff', 0.9),
                      },
                    }}
                  >
                    Start Your Assessment
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      py: 1.5,
                      px: 4,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: 'white',
                        background: alpha('#ffffff', 0.1),
                      },
                    }}
                  >
                    Learn More
                  </Button>
                </Stack>
              </motion.div>
            </Paper>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        id="contact"
        sx={{
          py: 6,
          background: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <HealthAndSafety sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                <Typography variant="h5" fontWeight={700}>
                  DiaVise
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Advanced AI-powered diabetes risk assessment platform helping individuals take control of their health through comprehensive symptom analysis.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" color="inherit">
                  <GitHub />
                </IconButton>
                <IconButton size="small" color="inherit">
                  <LinkedIn />
                </IconButton>
                <IconButton size="small" color="inherit">
                  <Twitter />
                </IconButton>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Product
              </Typography>
              <Stack spacing={1}>
                <Link href="#" color="text.secondary" underline="hover">
                  Features
                </Link>
                <Link href="#" color="text.secondary" underline="hover">
                  Assessment
                </Link>
                <Link href="#" color="text.secondary" underline="hover">
                  Analytics
                </Link>
                <Link href="#" color="text.secondary" underline="hover">
                  API
                </Link>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Support
              </Typography>
              <Stack spacing={1}>
                <Link href="#" color="text.secondary" underline="hover">
                  Help Center
                </Link>
                <Link href="#" color="text.secondary" underline="hover">
                  Documentation
                </Link>
                <Link href="#" color="text.secondary" underline="hover">
                  Contact Us
                </Link>
                <Link href="#" color="text.secondary" underline="hover">
                  Privacy Policy
                </Link>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Contact Info
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="text.secondary">
                    support@diavise.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="text.secondary">
                    +1 (555) 123-4567
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                  <Typography variant="body2" color="text.secondary">
                    San Francisco, CA
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              © 2024 DiaVise. All rights reserved. | Built with ❤️ for better health outcomes.
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Article Modal */}
      <ArticleModal
        open={articleModal.open}
        onClose={handleCloseArticleModal}
        article={articleModal.article}
        onArticleClick={handleArticleClick}
      />
    </Box>
  );
};

export default LandingPage;
