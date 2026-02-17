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
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  Skeleton,
  Fade,
  Slide,
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
  Menu as MenuIcon,
  Close as CloseIcon,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import ThemeToggle from '../components/Common/ThemeToggle';
import BlogSection from '../components/Common/BlogSection';
import ArticleModal from '../components/Common/ArticleModal';
import TestimonialsSection from '../components/Common/TestimonialsSection';
import { useSettings } from '../context/SettingsContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [ref, inView] = useInView({ threshold: 0.1 });
  const controls = useAnimation();
  const [scrolled, setScrolled] = useState(false);
  const [articleModal, setArticleModal] = useState({ open: false, article: null });
  const { siteTitle, contactEmail, siteDescription } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [footerExpanded, setFooterExpanded] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

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
    { number: '80%', label: 'Accuracy Rate', icon: <TrendingUp /> },
    { number: '10K+', label: 'Users Helped', icon: <HealthAndSafety /> },
    { number: '50+', label: 'Symptoms Tracked', icon: <Assessment /> },
    { number: '24/7', label: 'Available Support', icon: <Support /> },
  ];

  const handleArticleClick = (article) => {
    setArticleModal({ open: true, article });
  };

  const handleCloseArticleModal = () => {
    setArticleModal({ open: false, article: null });
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleFooterToggle = (section) => {
    setFooterExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const navLinks = [
    { label: 'Home', href: '#home', isRoute: false },
    { label: 'About', href: '#about', isRoute: false },
    { label: 'Blogs & Articles', href: '#blogs-articles', isRoute: false },
    { label: 'Forum', href: '/feedback', isRoute: true },
    { label: 'Contact', href: '#contact', isRoute: false },
  ];

  const handleNavClick = (link) => {
    if (link.isRoute) {
      navigate(link.href);
    } else {
      const element = document.querySelector(link.href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
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
      {/* Responsive Floating Navbar */}
      <Box
        sx={{
          position: 'fixed',
          top: { xs: 10, md: 20 },
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          width: { xs: 'calc(100% - 20px)', sm: 'calc(100% - 40px)', md: 'auto' },
          maxWidth: { xs: '100%', md: '90vw', lg: '1200px' },
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
              borderRadius: { xs: '20px', md: '30px' },
              border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
              boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.12)}`,
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 1, md: 1.5 },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: { xs: 1, md: 3 },
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
                    width: { xs: 36, md: 45 },
                    height: { xs: 36, md: 45 },
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <HealthAndSafety sx={{ fontSize: { xs: 18, md: 22 }, color: 'white' }} />
                </Box>
              </motion.div>

              {/* Desktop Navigation Links */}
              <Box sx={{ display: { xs: 'none', lg: 'flex' }, alignItems: 'center', gap: 1, flex: 1, justifyContent: 'center' }}>
                {navLinks.map((link) => (
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
                      onClick={() => handleNavClick(link)}
                    >
                      {link.label}
                    </Button>
                  </motion.div>
                ))}
              </Box>

              {/* Right Side Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1, md: 2 } }}>
                {/* Desktop Divider */}
                <Divider orientation="vertical" flexItem sx={{ mx: 1, height: '30px', display: { xs: 'none', lg: 'block' } }} />

                {/* Theme Toggle */}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <ThemeToggle />
                </motion.div>

                {/* Desktop Auth Buttons */}
                <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => navigate('/signin')}
                      sx={{
                        borderRadius: '20px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: { xs: 1.5, md: 2.5 },
                        py: 0,
                        fontSize: { xs: '0.8rem', md: '0.9rem' },
                        height: { xs: '32px', md: '36px' },
                        minHeight: { xs: '32px', md: '36px' },
                        minWidth: { xs: '60px', md: '80px' },
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
                      onClick={() => navigate('/onboarding')}
                      startIcon={<ArrowForward sx={{ fontSize: { xs: 14, md: 16 } }} />}
                      sx={{
                        borderRadius: '20px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: { xs: 1.5, md: 2.5 },
                        py: 0,
                        fontSize: { xs: '0.8rem', md: '0.9rem' },
                        height: { xs: '32px', md: '36px' },
                        minHeight: { xs: '32px', md: '36px' },
                        minWidth: { xs: '90px', md: '120px' },
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

                {/* Mobile Menu Button */}
                <IconButton
                  onClick={toggleMobileMenu}
                  sx={{
                    display: { xs: 'flex', lg: 'none' },
                    color: theme.palette.primary.main,
                    ml: { xs: 0.5, sm: 1 },
                  }}
                >
                  {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Box>

      {/* Mobile Drawer Menu */}
      <Drawer
        anchor="top"
        open={mobileMenuOpen}
        onClose={toggleMobileMenu}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            mt: { xs: 7, md: 10 },
            borderRadius: '0 0 20px 20px',
            background: alpha(theme.palette.background.paper, 0.98),
            backdropFilter: 'blur(25px)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.label} disablePadding>
                <ListItemButton
                  onClick={() => handleNavClick(link)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  <ListItemText
                    primary={link.label}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Mobile Auth Buttons */}
          <Stack spacing={2} sx={{ display: { xs: 'flex', sm: 'none' } }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => {
                navigate('/signin');
                setMobileMenuOpen(false);
              }}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
              }}
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                navigate('/onboarding');
                setMobileMenuOpen(false);
              }}
              startIcon={<ArrowForward />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                py: 1.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* Enhanced Responsive Hero Section */}
      <Box id="home" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 4, md: 8 }, position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            {/* Hero Content with Responsive Split Layout */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column-reverse', md: 'row' },
              height: { xs: 'auto', md: '75vh' }, 
              overflow: 'hidden',
              minHeight: { xs: 'auto', md: '75vh' },
              borderRadius: { xs: 3, sm: 4 },
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}>
              {/* Left Side - Text Content */}
              <Box
                sx={{
                  flex: 1,
                  height: { xs: 'auto', md: '100%' },
                  minHeight: { xs: 'auto', md: '100%' },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: theme.palette.background.paper,
                  p: { xs: 3, sm: 4, md: 6, lg: 8 },
                }}
              >
                <motion.div variants={itemVariants} style={{ width: '100%' }}>
                  <Box sx={{ 
                    textAlign: { xs: 'center', md: 'left' },
                    maxWidth: { xs: '100%', md: '90%' },
                    mx: { xs: 'auto', md: 0 },
                  }}>
                    {isLoading ? (
                      <>
                        <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 2 }} />
                        <Skeleton variant="rectangular" width="80%" height={40} sx={{ mb: 3, borderRadius: 2, mx: { xs: 'auto', md: 0 } }} />
                        <Skeleton variant="rectangular" width="100%" height={80} sx={{ mb: 4, borderRadius: 2 }} />
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                          <Skeleton variant="rectangular" width={180} height={56} sx={{ borderRadius: 3 }} />
                          <Skeleton variant="rectangular" width={180} height={56} sx={{ borderRadius: 3 }} />
                        </Box>
                      </>
                    ) : (
                      <>
                        <Typography
                          variant="h1"
                          fontWeight={800}
                          color="text.primary"
                          gutterBottom
                          sx={{
                            fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.8rem', lg: '3.2rem' },
                            lineHeight: 1.15,
                            mb: { xs: 2, md: 3 },
                            letterSpacing: '-0.02em',
                          }}
                        >
                          Smart Diabetes
                          <br />
                          <Box 
                            component="span" 
                            sx={{
                              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            Risk Assessment
                          </Box>
                        </Typography>
                        <Typography
                          variant="h6"
                          color="text.secondary"
                          paragraph
                          sx={{ 
                            mb: { xs: 3, md: 4 }, 
                            fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' }, 
                            lineHeight: 1.6,
                            maxWidth: { xs: '100%', sm: 480, md: 520 },
                            mx: { xs: 'auto', md: 0 },
                            fontWeight: 400,
                          }}
                        >
                          Harness the power of AI to assess your diabetes risk through comprehensive symptom analysis and get personalized health recommendations.
                        </Typography>
                        <Stack 
                          direction={{ xs: 'column', sm: 'row' }} 
                          spacing={{ xs: 2, sm: 2, md: 3 }}
                          justifyContent={{ xs: 'center', md: 'flex-start' }}
                          sx={{ width: { xs: '100%', sm: 'auto' } }}
                        >
                          <motion.div 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                            style={{ width: isSmallScreen ? '100%' : 'auto' }}
                          >
                            <Button
                              variant="contained"
                              size="large"
                              onClick={() => navigate('/onboarding')}
                              startIcon={<ArrowForward />}
                              fullWidth={isSmallScreen}
                              sx={{
                                py: { xs: 1.5, md: 1.75 },
                                px: { xs: 3, md: 4 },
                                fontSize: { xs: '0.95rem', md: '1.05rem' },
                                borderRadius: 3,
                                fontWeight: 600,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
                                '&:hover': {
                                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                                  boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.4)}`,
                                  transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease',
                              }}
                            >
                              Start Assessment
                            </Button>
                          </motion.div>
                          <motion.div 
                            whileHover={{ scale: 1.05 }} 
                            whileTap={{ scale: 0.95 }}
                            style={{ width: isSmallScreen ? '100%' : 'auto' }}
                          >
                            <Button
                              variant="outlined"
                              size="large"
                              startIcon={<PlayArrow />}
                              fullWidth={isSmallScreen}
                              sx={{
                                py: { xs: 1.5, md: 1.75 },
                                px: { xs: 3, md: 4 },
                                fontSize: { xs: '0.95rem', md: '1.05rem' },
                                borderRadius: 3,
                                fontWeight: 600,
                                borderWidth: 2,
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  borderWidth: 2,
                                  background: alpha(theme.palette.primary.main, 0.1),
                                  transform: 'translateY(-2px)',
                                },
                                transition: 'all 0.3s ease',
                              }}
                            >
                              Watch Demo
                            </Button>
                          </motion.div>
                        </Stack>
                      </>
                    )}
                  </Box>
                </motion.div>
              </Box>
              
              {/* Right Side - Hero Image */}
              <Box
                sx={{
                  flex: 1,
                  height: { xs: '350px', sm: '450px', md: '100%' },
                  minHeight: { xs: '300px', sm: '400px', md: '100%' },
                  position: 'relative',
                  width: '100%',
                  overflow: 'hidden',
                  backgroundImage: `url('/images/Doc.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: { xs: 'center top', md: 'center' },
                  backgroundRepeat: 'no-repeat',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(${isMobile ? '180deg' : '135deg'}, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    zIndex: 1,
                  },
                  '&::after': {
                    content: '"🏥"',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: { xs: '3rem', md: '4rem' },
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

      {/* Enhanced Responsive Stats Section */}
      <Box sx={{ py: { xs: 4, sm: 5, md: 6 }, background: alpha(theme.palette.primary.main, 0.05) }}>
        <Container maxWidth="lg">
          <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={containerVariants}
          >
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
              {stats.map((stat, index) => (
                <Grid size={{ xs: 6, sm: 6, md: 3 }} key={index} sx={{ display: 'flex' }}>
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
                        height: { xs: '200px', sm: '240px', md: '280px' },
                        minHeight: { xs: '200px', sm: '240px', md: '280px' },
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        background: `linear-gradient(135deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        borderRadius: { xs: 3, md: 4 },
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
                          p: { xs: 2, sm: 3, md: 4 },
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
                              mb: { xs: 2, md: 3 },
                              p: { xs: 1.5, md: 2 },
                              borderRadius: '50%',
                              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
                              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              width: { xs: 48, sm: 56, md: 60 },
                              height: { xs: 48, sm: 56, md: 60 },
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {React.cloneElement(stat.icon, { sx: { fontSize: { xs: 24, sm: 28, md: 32 } } })}
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
                              mb: { xs: 1, md: 2 },
                              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
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
                          sx={{ 
                            fontWeight: 600,
                            fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1.1rem' },
                            lineHeight: 1.3,
                          }}
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

      {/* Enhanced Responsive Assessment Process Section */}
      <Box id="about" sx={{ py: { xs: 6, md: 8, lg: 10 }, background: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6, lg: 8 } }}>
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h3" 
                  fontWeight={700} 
                  color="text.primary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' } }}
                >
                  How {siteTitle || 'DiaVise'} Works
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  sx={{ 
                    maxWidth: 600, 
                    mx: 'auto',
                    fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                    px: { xs: 2, sm: 0 },
                  }}
                >
                  Our comprehensive 4-step process ensures accurate diabetes risk assessment through advanced AI technology
                </Typography>
              </motion.div>
            </Box>

            {/* Responsive Process Flow with Horizontal Scroll on Mobile */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'stretch',
                justifyContent: { xs: 'flex-start', lg: 'center' },
                gap: { xs: 3, md: 4 },
                maxWidth: 1400,
                mx: 'auto',
                mb: { xs: 6, md: 8, lg: 10 },
                overflowX: { xs: 'auto', lg: 'visible' },
                overflowY: 'visible',
                px: { xs: 2, sm: 3, lg: 0 },
                pb: { xs: 2, lg: 0 },
                '&::-webkit-scrollbar': {
                  height: 8,
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: 4,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.5),
                  },
                },
                scrollbarWidth: 'thin',
                scrollbarColor: `${alpha(theme.palette.primary.main, 0.3)} ${alpha(theme.palette.primary.main, 0.05)}`,
              }}
            >
              {[
                { 
                  step: '1', 
                  title: 'Input Symptoms', 
                  description: 'Enter your health data and symptoms through our comprehensive questionnaire',
                  icon: <Assessment sx={{ fontSize: { xs: 36, md: 48 } }} />,
                  color: theme.palette.primary.main,
                  bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.primary.main, 0.05)})`
                },
                { 
                  step: '2', 
                  title: 'AI Analysis', 
                  description: 'Advanced machine learning algorithms process and analyze your data',
                  icon: <Analytics sx={{ fontSize: { xs: 36, md: 48 } }} />,
                  color: theme.palette.success.main,
                  bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.success.main, 0.05)})`
                },
                { 
                  step: '3', 
                  title: 'Risk Assessment', 
                  description: 'Comprehensive diabetes risk evaluation with confidence scoring',
                  icon: <Psychology sx={{ fontSize: { xs: 36, md: 48 } }} />,
                  color: theme.palette.warning.main,
                  bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.warning.main, 0.05)})`
                },
                { 
                  step: '4', 
                  title: 'Get Results', 
                  description: 'Personalized recommendations and actionable health insights',
                  icon: <TrendingUp sx={{ fontSize: { xs: 36, md: 48 } }} />,
                  color: theme.palette.info.main,
                  bgGradient: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.main, 0.05)})`
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, rotateY: 3 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  style={{ 
                    perspective: '1000px',
                    minWidth: isTablet ? (isSmallScreen ? '260px' : '300px') : 'auto',
                    flex: isTablet ? '0 0 auto' : '1',
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 3, md: 4 },
                      textAlign: 'center',
                      borderRadius: { xs: 4, md: 6 },
                      background: item.bgGradient,
                      border: `3px solid ${alpha(item.color, 0.2)}`,
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      width: '100%',
                      minHeight: { xs: 340, sm: 360, md: 400 },
                      maxHeight: { xs: 340, sm: 360, md: 400 },
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
                            width: { xs: 64, md: 80 },
                            height: { xs: 64, md: 80 },
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${item.color}, ${alpha(item.color, 0.8)})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: { xs: '1.5rem', md: '1.8rem' },
                            mb: { xs: 2, md: 3 },
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
                        <Box sx={{ color: item.color, mb: { xs: 2, md: 3 } }}>
                          {item.icon}
                        </Box>
                      </motion.div>
                      
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography 
                          variant="h5" 
                          fontWeight={700} 
                          color="text.primary" 
                          gutterBottom
                          sx={{ fontSize: { xs: '1.1rem', md: '1.35rem' } }}
                        >
                          {item.title}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            lineHeight: 1.6, 
                            fontSize: { xs: '0.85rem', sm: '0.95rem', md: '1rem' } 
                          }}
                        >
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </Box>

            {/* Responsive Technology Stack */}
            <Box sx={{ textAlign: 'center' }}>
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h4" 
                  fontWeight={700} 
                  color="text.primary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.125rem' } }}
                >
                  Powered by Advanced Technology
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  sx={{ 
                    mb: { xs: 3, md: 4 }, 
                    maxWidth: 600, 
                    mx: 'auto',
                    fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                    px: { xs: 2, sm: 0 },
                  }}
                >
                  Our platform leverages cutting-edge AI and medical technology to deliver accurate assessments
                </Typography>
              </motion.div>
              
              <Grid container spacing={{ xs: 3, sm: 4, md: 6 }} justifyContent="center" sx={{ maxWidth: 1000, mx: 'auto' }}>
                {[
                  {
                    icon: <Psychology sx={{ fontSize: { xs: 32, md: 40 }, color: theme.palette.primary.main }} />,
                    title: 'Machine Learning',
                    description: 'XGBoost algorithms trained on medical datasets',
                    color: theme.palette.primary.main,
                  },
                  {
                    icon: <Analytics sx={{ fontSize: { xs: 32, md: 40 }, color: theme.palette.success.main }} />,
                    title: 'Data Analytics',
                    description: 'Real-time processing and analysis',
                    color: theme.palette.success.main,
                  },
                  {
                    icon: <Security sx={{ fontSize: { xs: 32, md: 40 }, color: theme.palette.warning.main }} />,
                    title: 'Security',
                    description: 'End-to-end encryption and HIPAA compliance',
                    color: theme.palette.warning.main,
                  },
                  {
                    icon: <Timeline sx={{ fontSize: { xs: 32, md: 40 }, color: theme.palette.info.main }} />,
                    title: 'Monitoring',
                    description: 'Continuous health tracking and updates',
                    color: theme.palette.info.main,
                  },
                ].map((tech, index) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={index}>
                    <motion.div 
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, rotateY: 3 }}
                      transition={{ duration: 0.3 }}
                      style={{ perspective: '1000px' }}
                    >
                      <Paper
                        elevation={0}
                        sx={{
                          p: { xs: 3, md: 4 },
                          textAlign: 'center',
                          borderRadius: { xs: 3, md: 4 },
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
                                mb: { xs: 2, md: 3 },
                                p: { xs: 1.5, md: 2 },
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${alpha(tech.color, 0.1)}, ${alpha(tech.color, 0.05)})`,
                                border: `2px solid ${alpha(tech.color, 0.2)}`,
                                width: { xs: 64, md: 80 },
                                height: { xs: 64, md: 80 },
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                              }}
                            >
                              {tech.icon}
                            </Box>
                          </motion.div>
                          <Typography 
                            variant="h5" 
                            fontWeight={700} 
                            gutterBottom
                            sx={{ fontSize: { xs: '1.1rem', md: '1.35rem' } }}
                          >
                            {tech.title}
                          </Typography>
                          <Typography 
                            variant="body1" 
                            color="text.secondary" 
                            sx={{ 
                              lineHeight: 1.6,
                              fontSize: { xs: '0.9rem', md: '1rem' },
                            }}
                          >
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

      {/* Responsive Features Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, background: alpha(theme.palette.primary.main, 0.05) }}>
        <Container maxWidth="lg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <Box textAlign="center" mb={{ xs: 4, md: 6 }}>
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h3" 
                  fontWeight={700} 
                  color="text.primary" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' } }}
                >
                  Comprehensive Features
                </Typography>
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  maxWidth="md" 
                  mx="auto"
                  sx={{ 
                    fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                    px: { xs: 2, sm: 0 },
                  }}
                >
                  Everything you need for accurate diabetes risk assessment and health management
                </Typography>
              </motion.div>
            </Box>
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
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
                        borderRadius: { xs: 2, md: 3 },
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
                          p: { xs: 3, md: 4 },
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          flexGrow: 1,
                        }}
                      >
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.15 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Box
                            sx={{
                              mb: { xs: 2, md: 3 },
                              p: { xs: 1.5, md: 2 },
                              borderRadius: '50%',
                              background: alpha(feature.icon.props.sx.color, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: { xs: 64, md: 72 },
                              height: { xs: 64, md: 72 },
                            }}
                          >
                            {React.cloneElement(feature.icon, { 
                              sx: { 
                                fontSize: { xs: 32, md: 40 }, 
                                color: feature.icon.props.sx.color 
                              } 
                            })}
                          </Box>
                        </motion.div>
                        <Typography 
                          variant="h6" 
                          fontWeight={600} 
                          gutterBottom 
                          sx={{ 
                            mb: 2,
                            fontSize: { xs: '1.05rem', md: '1.25rem' },
                          }}
                        >
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
                            fontSize: { xs: '0.875rem', md: '0.95rem' },
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
      <TestimonialsSection />

      {/* Blogs & Articles Section */}
      <BlogSection
        title="Health & Wellness Articles"
        subtitle="Discover expert insights, tips, and latest research on diabetes management and healthy living"
        showFilters={true}
        limit={3}
        featuredFirst={true}
        onArticleClick={handleArticleClick}
      />

      {/* Responsive CTA Section */}
      <Box sx={{ py: { xs: 6, md: 8 }, background: alpha(theme.palette.primary.main, 0.05) }}>
        <Container maxWidth="md">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <Paper
              sx={{
                p: { xs: 4, sm: 5, md: 6 },
                textAlign: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'white',
                borderRadius: { xs: 2, md: 3 },
              }}
            >
              <motion.div variants={itemVariants}>
                <Typography 
                  variant="h3" 
                  fontWeight={700} 
                  gutterBottom
                  sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' } }}
                >
                  Ready to Take Control of Your Health?
                </Typography>
                <Typography 
                  variant="h6" 
                  paragraph 
                  sx={{ 
                    opacity: 0.9,
                    fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.15rem' },
                    mb: { xs: 3, md: 4 },
                    px: { xs: 0, sm: 2, md: 0 },
                  }}
                >
                  Join thousands of users who have already discovered their diabetes risk and received personalized recommendations.
                </Typography>
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  justifyContent="center"
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/onboarding')}
                    fullWidth={isSmallScreen}
                    sx={{
                      background: 'white',
                      color: theme.palette.primary.main,
                      py: { xs: 1.5, md: 1.75 },
                      px: { xs: 3, md: 4 },
                      fontSize: { xs: '0.95rem', md: '1.1rem' },
                      fontWeight: 600,
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
                    fullWidth={isSmallScreen}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      py: { xs: 1.5, md: 1.75 },
                      px: { xs: 3, md: 4 },
                      fontSize: { xs: '0.95rem', md: '1.1rem' },
                      fontWeight: 600,
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

      {/* Responsive Collapsible Footer */}
      <Box
        id="contact"
        sx={{
          py: { xs: 4, md: 6 },
          background: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Logo and Description - Always Visible */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <HealthAndSafety sx={{ fontSize: { xs: 28, md: 32 }, color: theme.palette.primary.main }} />
                <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                  {siteTitle || 'DiaVise'}
                </Typography>
              </Box>
              <Typography 
                variant="body2" 
                color="text.secondary" 
                paragraph
                sx={{ fontSize: { xs: '0.85rem', md: '0.875rem' } }}
              >
                {siteDescription || 'Advanced AI-powered diabetes risk assessment platform helping individuals take control of their health through comprehensive symptom analysis.'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" color="inherit" sx={{ '&:hover': { color: theme.palette.primary.main } }}>
                  <GitHub />
                </IconButton>
                <IconButton size="small" color="inherit" sx={{ '&:hover': { color: theme.palette.primary.main } }}>
                  <LinkedIn />
                </IconButton>
                <IconButton size="small" color="inherit" sx={{ '&:hover': { color: theme.palette.primary.main } }}>
                  <Twitter />
                </IconButton>
              </Box>
            </Grid>

            {/* Product Links - Collapsible on Mobile */}
            <Grid size={{ xs: 12, md: 2 }}>
              {isMobile ? (
                <Box>
                  <Button
                    fullWidth
                    onClick={() => handleFooterToggle('product')}
                    endIcon={footerExpanded.product ? <ExpandLess /> : <ExpandMore />}
                    sx={{
                      justifyContent: 'space-between',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      color: theme.palette.text.primary,
                    }}
                  >
                    Product
                  </Button>
                  <Collapse in={footerExpanded.product}>
                    <Stack spacing={1} sx={{ pl: 2, py: 1 }}>
                      <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                        Features
                      </Link>
                      <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                        Assessment
                      </Link>
                      <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                        Analytics
                      </Link>
                      <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                        API
                      </Link>
                    </Stack>
                  </Collapse>
                </Box>
              ) : (
                <>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ fontSize: '1.1rem' }}>
                    Product
                  </Typography>
                  <Stack spacing={1}>
                    <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                      Features
                    </Link>
                    <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                      Assessment
                    </Link>
                    <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                      Analytics
                    </Link>
                    <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                      API
                    </Link>
                  </Stack>
                </>
              )}
            </Grid>

            {/* Support Links - Collapsible on Mobile */}
            <Grid size={{ xs: 12, md: 2 }}>
              {isMobile ? (
                <Box>
                  <Button
                    fullWidth
                    onClick={() => handleFooterToggle('support')}
                    endIcon={footerExpanded.support ? <ExpandLess /> : <ExpandMore />}
                    sx={{
                      justifyContent: 'space-between',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      color: theme.palette.text.primary,
                    }}
                  >
                    Support
                  </Button>
                  <Collapse in={footerExpanded.support}>
                    <Stack spacing={1} sx={{ pl: 2, py: 1 }}>
                      <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                        Help Center
                      </Link>
                      <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                        Documentation
                      </Link>
                      <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                        Contact Us
                      </Link>
                      <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                        Privacy Policy
                      </Link>
                    </Stack>
                  </Collapse>
                </Box>
              ) : (
                <>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ fontSize: '1.1rem' }}>
                    Support
                  </Typography>
                  <Stack spacing={1}>
                    <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                      Help Center
                    </Link>
                    <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                      Documentation
                    </Link>
                    <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                      Contact Us
                    </Link>
                    <Link href="#" color="text.secondary" underline="hover" sx={{ fontSize: '0.875rem' }}>
                      Privacy Policy
                    </Link>
                  </Stack>
                </>
              )}
            </Grid>

            {/* Contact Info - Collapsible on Mobile */}
            <Grid size={{ xs: 12, md: 4 }}>
              {isMobile ? (
                <Box>
                  <Button
                    fullWidth
                    onClick={() => handleFooterToggle('contact')}
                    endIcon={footerExpanded.contact ? <ExpandLess /> : <ExpandMore />}
                    sx={{
                      justifyContent: 'space-between',
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.5,
                      color: theme.palette.text.primary,
                    }}
                  >
                    Contact Info
                  </Button>
                  <Collapse in={footerExpanded.contact}>
                    <Stack spacing={1} sx={{ pl: 2, py: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {contactEmail || 'support@diavise.com'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          +92 300 1234567
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          Islamabad, Pakistan
                        </Typography>
                      </Box>
                    </Stack>
                  </Collapse>
>>>>>>> bd06c5be (WIP: local changes snapshot before integrating remote)
                </Box>
              ) : (
                <>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ fontSize: '1.1rem' }}>
                    Contact Info
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        {contactEmail || 'support@diavise.com'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        +92 300 1234567
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        Islamabad, Pakistan
                      </Typography>
                    </Box>
                  </Stack>
                </>
              )}
            </Grid>
          </Grid>
          <Divider sx={{ my: { xs: 3, md: 4 } }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
              © {new Date().getFullYear()} {siteTitle || 'DiaVise'}. All rights reserved. | Built for better health outcomes.
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
