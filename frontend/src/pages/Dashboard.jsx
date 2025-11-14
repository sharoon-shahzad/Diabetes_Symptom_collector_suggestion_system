import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Avatar, CssBaseline, Paper, Card, CardContent, CircularProgress, Alert, Grid, Divider, Chip, Modal, IconButton, Tooltip, Skeleton, TextField
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HealingIcon from '@mui/icons-material/Healing';
import InsightsIcon from '@mui/icons-material/Insights';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth';
import { fetchMyDiseaseData } from '../utils/api';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import EditDiseaseData from '../components/Dashboard/EditDiseaseData';
import ProgressDonut from '../components/DashboardNew/ProgressDonut';
import StatWidget from '../components/DashboardNew/StatWidget';
import ActivityTimeline from '../components/DashboardNew/ActivityTimeline';
import RiskCard from '../components/DashboardNew/RiskCard';
import QuickActions from '../components/DashboardNew/QuickActions';
import AccountProfileCard from '../components/DashboardNew/AccountProfileCard';
import PreferencesCard from '../components/DashboardNew/PreferencesCard';
import PasswordOptionCard from '../components/DashboardNew/PasswordOptionCard';
import { updateUserProfile } from '../utils/api';
import ThemeToggle from '../components/Common/ThemeToggle';

const drawerWidth = 220;

const sections = [
  { label: 'Insights', icon: <InsightsIcon /> },
  { label: 'My Account', icon: <AccountCircleIcon /> },
  { label: 'My Disease Data', icon: <HealingIcon /> },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [diseaseData, setDiseaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  const completionPct = useMemo(() => {
    if (!diseaseData || !diseaseData.totalQuestions) return 0;
    const pct = (diseaseData.answeredQuestions / diseaseData.totalQuestions) * 100;
    return Math.round(pct);
  }, [diseaseData]);

  const activityItems = useMemo(() => {
    const items = [];
    if (diseaseData?.lastUpdated) {
      items.push({
        type: 'Details',
        color: 'primary',
        title: 'Details updated',
        description: `${diseaseData.answeredQuestions || 0} answers saved`,
        time: diseaseData.lastUpdated,
      });
    }
    if (diseaseData?.disease) {
      items.push({
        type: 'Disease',
        color: 'secondary',
        title: 'Tracking condition',
        description: diseaseData.disease,
        time: new Date().toISOString(),
      });
    }
    return items;
  }, [diseaseData]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        navigate('/signin');
      }
    }
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    // Fetch disease data on Insights (0) and My Disease Data (2)
    if (selectedIndex === 0 || selectedIndex === 2) {
      setLoading(true);
      setError(null);
      fetchMyDiseaseData()
        .then((data) => setDiseaseData(data))
        .catch(() => setError('Failed to load disease data.'))
        .finally(() => setLoading(false));
    }
  }, [selectedIndex]);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const handleEditDiseaseData = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleDataUpdated = () => {
    if (selectedIndex === 1) {
      setLoading(true);
      fetchMyDiseaseData()
        .then((data) => setDiseaseData(data))
        .catch(() => setError('Failed to load disease data.'))
        .finally(() => setLoading(false));
    }
  };

  // Account: state for update
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!user?._id) return;
    setSavingProfile(true);
    setProfileError(null);
    try {
      const payload = { fullName: user.fullName };
      await updateUserProfile(user._id, payload);
    } catch (err) {
      const msg = err?.response?.data?.message || 'You may not have permission to update your profile.';
      setProfileError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // Password: we only provide a navigation option to the existing flow

  // No-op: assessments navigated inline via onClick handlers

  return (
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh', 
      // Use a clean, flat surface to avoid heavy radial/oval backgrounds
      background: (t) => t.palette.background.default
    }}>
  <CssBaseline />
      {/* Sidebar - Enhanced Professional Design */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            py: 3,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: (t) => t.palette.mode === 'dark' 
              ? 'linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)' 
              : 'linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)',
            borderRight: (t) => `1px solid ${t.palette.divider}`,
            boxShadow: (t) => t.palette.mode === 'dark'
              ? '2px 0 12px rgba(0,0,0,0.5)'
              : '2px 0 12px rgba(0,0,0,0.04)',
            // Hide scrollbar in sidebar but keep it scrollable
            overflowY: 'auto',
            scrollbarWidth: 'none', // Firefox
            '-ms-overflow-style': 'none', // IE/Edge legacy
            '&::-webkit-scrollbar': { display: 'none' }, // WebKit
          },
        }}
      >
        <Box>
          {/* User Profile Header - Premium Design */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              px: 2,
              py: 2.5,
              mb: 3,
              borderRadius: 2,
              background: (t) => t.palette.mode === 'dark'
                ? alpha(t.palette.primary.main, 0.08)
                : alpha(t.palette.primary.main, 0.04),
              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.12)}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                background: (t) => alpha(t.palette.primary.main, 0.12),
                borderColor: (t) => alpha(t.palette.primary.main, 0.25),
              }
            }}
          >
            <Avatar 
              sx={{ 
                width: 44,
                height: 44,
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                fontWeight: 700,
                fontSize: '1.2rem',
                boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.3)}`,
              }}
            >
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="body2" 
                fontWeight={700}
                sx={{ 
                    color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mb: 0.25,
                  fontSize: '0.9rem',
                }}
              >
                {user?.fullName || 'User'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Dashboard
              </Typography>
            </Box>
          </Box>
          
          {/* Navigation Menu - Premium Design */}
          <List sx={{ px: 0 }}>
            {sections.map((sec, index) => (
              <ListItem 
                button 
                key={sec.label} 
                selected={selectedIndex === index} 
                onClick={() => setSelectedIndex(index)} 
                sx={{ 
                  borderRadius: 2,
                  mb: 1,
                  px: 2,
                  py: 1.5,
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: (t) => `linear-gradient(180deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  },
                  '&.Mui-selected': {
                    bgcolor: (t) => t.palette.mode === 'dark' 
                      ? alpha(t.palette.primary.main, 0.12)
                      : alpha(t.palette.primary.main, 0.08),
                    border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                    '&::before': {
                      opacity: 1,
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                      transform: 'scale(1.1)',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'primary.main',
                      fontWeight: 700,
                    },
                  },
                  '&:hover': {
                    bgcolor: (t) => t.palette.mode === 'dark' 
                      ? alpha(t.palette.primary.main, 0.08)
                      : alpha(t.palette.primary.main, 0.04),
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: 'text.secondary',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {sec.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={sec.label}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    color: 'text.secondary',
                    transition: 'all 0.2s ease',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
        
        {/* Bottom Section - Minimal */}
        <Box sx={{ px: 0.5 }}>
          {/* Theme Toggle - Integrated */}
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              py: 2,
              mb: 1,
            }}
          >
            <ThemeToggle size="medium" />
          </Box>
          
          {/* Logout Button - Premium */}
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ 
              borderRadius: 2, 
              fontWeight: 700,
              py: 1.5,
              px: 2,
              justifyContent: 'flex-start',
              textTransform: 'none',
              borderColor: (t) => alpha(t.palette.error.main, 0.3),
              color: 'error.main',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: (t) => alpha(t.palette.error.main, 0.1),
                borderColor: 'error.main',
                transform: 'translateY(-2px)',
                boxShadow: (t) => `0 4px 12px ${alpha(t.palette.error.main, 0.25)}`,
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
      {/* Main Content */}
  <Box component="main" sx={{ flexGrow: 1, ml: 0, mt: 0, minHeight: '100vh', background: 'transparent' }}>
        {/* Hero header - Clean professional design */}
        <Box sx={{
          px: { xs: 2, md: 6 },
          pt: { xs: 3, md: 5 },
          pb: 4,
          background: 'transparent',
        }}>
          <Paper
            elevation={0}
            sx={{ 
              maxWidth: 'clamp(1200px, 90vw, 1440px)', 
              mx: 'auto',
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              background: (t) => t.palette.background.paper,
              border: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
              <Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>
                  Your Health Dashboard
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Track progress, update details, and assess your risk.
                </Typography>
              </Box>
              <QuickActions />
            </Box>
          </Paper>
        </Box>

        {/* Content container */}
        <Box sx={{ px: { xs: 2, md: 6 }, pb: 6, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ 
            width: '100%', 
            maxWidth: selectedIndex === 2 
              ? 'clamp(1400px, 95vw, 1920px)' 
              : 'clamp(1200px, 90vw, 1440px)'
          }}>
            {selectedIndex === 0 && (
              <Box>
                {/* Stats Row - Matches width of 2-column grid below */}
                <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatWidget
                      title="Condition"
                      value={diseaseData?.disease || 'Not Set'}
                      caption={diseaseData?.lastUpdated ? `Updated ${new Date(diseaseData.lastUpdated).toLocaleDateString()}` : 'Start onboarding'}
                      color="primary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatWidget
                      title="Questions"
                      value={`${diseaseData?.answeredQuestions ?? 0}/${diseaseData?.totalQuestions ?? 0}`}
                      caption="Answers saved"
                      color="info"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatWidget
                      title="Progress"
                      value={`${completionPct}%`}
                      caption={completionPct === 100 ? 'All done!' : 'Keep going'}
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper
                      elevation={0}
                      onClick={() => completionPct === 100 ? navigate('/assessment') : navigate('/onboarding')}
                      sx={{ 
                        height: '100%', 
                        cursor: 'pointer',
                        p: 2.5,
                        borderRadius: 3,
                        background: (t) => t.palette.background.paper,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.12)}`,
                        }
                      }}
                    >
                      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 1.2, fontSize: '0.7rem' }}>
                        Next Action
                      </Typography>
                      <Typography variant="h6" fontWeight={700} sx={{ mt: 0.75 }}>
                        Assessment
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                        {completionPct === 100 ? 'Ready to assess' : 'Finish onboarding'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Main Content: 2-column responsive grid - spacing matches stats row */}
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: { xs: 2, sm: 3, md: 4 },
                  alignItems: 'stretch'
                }}>
                  {/* Onboarding Progress Card */}
                  <Box sx={{ minWidth: 0 }}>
                    <Paper
                      elevation={0}
                      sx={{ 
                        p: 4,
                        borderRadius: 3,
                        height: '100%',
                        background: (t) => t.palette.background.paper,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        minHeight: 380,
                      }}
                    >
                      <Typography 
                        variant="overline" 
                        sx={{ 
                          color: 'text.secondary', 
                          fontWeight: 800, 
                          letterSpacing: 1.2,
                          fontSize: '0.75rem',
                          mb: 2,
                        }}
                      >
                        ONBOARDING PROGRESS
                      </Typography>
                      <Box sx={{ mb: 4 }}>
                        <ProgressDonut value={completionPct} label="Complete" size={120} />
                      </Box>
                      <Typography 
                        variant="h5" 
                        fontWeight={800}
                        sx={{ mb: 1 }}
                      >
                        {completionPct}% Complete
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {diseaseData?.answeredQuestions || 0} of {diseaseData?.totalQuestions || 0} questions answered
                      </Typography>
                      {completionPct < 100 ? (
                        <Button 
                          variant="contained" 
                          size="large"
                          onClick={() => navigate('/onboarding')}
                          sx={{ borderRadius: 2, fontWeight: 800, px: 4, py: 1.5, textTransform: 'none' }}
                        >
                          Continue Onboarding
                        </Button>
                      ) : (
                        <Chip 
                          icon={<CheckCircleIcon />}
                          label="Onboarding Complete" 
                          color="success" 
                          sx={{ 
                            fontWeight: 800,
                            px: 2,
                            py: 2,
                            fontSize: '0.95rem',
                            '& .MuiChip-icon': { fontSize: '1.2rem' }
                          }} 
                        />
                      )}
                    </Paper>
                  </Box>

                  {/* Recent Activity */}
                  <Box sx={{ minWidth: 0 }}>
                    <Paper
                      elevation={0}
                      sx={{ 
                        p: 4,
                        borderRadius: 3,
                        height: '100%',
                        background: (t) => t.palette.background.paper,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        minHeight: 360,
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={800}>
                          Recent Activity
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <ActivityTimeline items={activityItems} />
                    </Paper>
                  </Box>

                  {/* Risk Assessment CTA - Full Width (kept below as requested) */}
                  <Box sx={{ gridColumn: '1 / -1' }}>
                    <RiskCard onAssess={() => navigate('/assessment')} lastAssessedAt={null} />
                  </Box>
                </Box>
              </Box>
            )}

            {selectedIndex === 1 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 3, md: 4 }, 
                  borderRadius: 3,
                  background: (t) => t.palette.background.paper,
                  border: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                {/* Header */}
                <Box sx={{ 
                  mb: 5,
                  animation: 'slideIn 0.7s ease-out',
                  '@keyframes slideIn': {
                    from: { opacity: 0, transform: 'translateX(-20px)' },
                    to: { opacity: 1, transform: 'translateX(0)' }
                  }
                }}>
                  <Box display="flex" alignItems="center" gap={3} mb={2}>
                    <Avatar 
                      sx={{ 
                        width: 72, 
                        height: 72,
                        bgcolor: 'primary.main',
                        fontSize: '1.75rem',
                        fontWeight: 800,
                        color: 'primary.contrastText',
                      }}
                    >
                      {user?.fullName?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                    <Box flex={1}>
                      <Typography 
                        variant="h5" 
                        fontWeight={800}
                        sx={{ mb: 0.5 }}
                      >
                        {user?.fullName || 'User'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {user?.email}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(user?.roles || []).map((r) => (
                          <Chip 
                            key={r} 
                            label={r} 
                            size="small" 
                            sx={{ 
                              fontWeight: 600,
                              background: (t) => alpha(t.palette.primary.main, 0.08),
                              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                            }} 
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Profile Info Section */}
                <Box sx={{ 
                  mb: 5,
                  animation: 'fadeInUp 0.8s ease-out 0.2s backwards',
                }}>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 3.5 }}>Personal Information</Typography>
                  
                  {profileError && (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 3,
                        animation: 'shake 0.5s ease',
                        '@keyframes shake': {
                          '0%, 100%': { transform: 'translateX(0)' },
                          '25%': { transform: 'translateX(-8px)' },
                          '75%': { transform: 'translateX(8px)' }
                        }
                      }}
                    >
                      {profileError}
                    </Alert>
                  )}

                  <Box component="form" onSubmit={handleSaveProfile}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                          }
                        }}>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={700} 
                            sx={{ 
                              mb: 1, 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              textTransform: 'uppercase', 
                              letterSpacing: 1.2,
                            }}
                          >
                            <EditIcon sx={{ fontSize: 14 }} />
                            Full Name
                          </Typography>
                          <TextField 
                            fullWidth 
                            name="fullName"
                            defaultValue={user?.fullName || ''}
                            onChange={(e) => {
                              setUser((u) => ({ ...u, fullName: e.target.value }));
                            }}
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={700} 
                            sx={{ 
                              mb: 1, 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              textTransform: 'uppercase', 
                              letterSpacing: 1.2,
                            }}
                          >
                            🔒 Email Address
                          </Typography>
                          <Box sx={{ 
                            p: 1.8, 
                            borderRadius: 2.5,
                            bgcolor: (t) => alpha(t.palette.action.disabled, 0.04),
                            border: (t) => `1px dashed ${alpha(t.palette.divider, 0.15)}`,
                            filter: 'blur(0.4px)',
                            opacity: 0.65,
                            transition: 'all 0.3s ease',
                            fontSize: '1.05rem',
                            '&:hover': {
                              opacity: 0.8,
                              filter: 'blur(0.3px)',
                            }
                          }}>
                            <Typography variant="body1" fontWeight={500}>{user?.email}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={700} 
                            sx={{ 
                              mb: 1, 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              textTransform: 'uppercase', 
                              letterSpacing: 1.2,
                            }}
                          >
                            🔒 Gender
                          </Typography>
                          <Box sx={{ 
                            p: 1.8, 
                            borderRadius: 2.5,
                            bgcolor: (t) => alpha(t.palette.action.disabled, 0.04),
                            border: (t) => `1px dashed ${alpha(t.palette.divider, 0.15)}`,
                            filter: 'blur(0.4px)',
                            opacity: 0.65,
                            transition: 'all 0.3s ease',
                            fontSize: '1.05rem',
                            '&:hover': {
                              opacity: 0.8,
                              filter: 'blur(0.3px)',
                            }
                          }}>
                            <Typography variant="body1" fontWeight={500}>{user?.gender || 'Not set'}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box>
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            fontWeight={700} 
                            sx={{ 
                              mb: 1, 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              textTransform: 'uppercase', 
                              letterSpacing: 1.2,
                            }}
                          >
                            🔒 Date of Birth
                          </Typography>
                          <Box sx={{ 
                            p: 1.8, 
                            borderRadius: 2.5,
                            bgcolor: (t) => alpha(t.palette.action.disabled, 0.04),
                            border: (t) => `1px dashed ${alpha(t.palette.divider, 0.15)}`,
                            filter: 'blur(0.4px)',
                            opacity: 0.65,
                            transition: 'all 0.3s ease',
                            fontSize: '1.05rem',
                            '&:hover': {
                              opacity: 0.8,
                              filter: 'blur(0.3px)',
                            }
                          }}>
                            <Typography variant="body1" fontWeight={500}>
                              {user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not set'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={savingProfile}
                        size="large"
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, px: 4, py: 1.5 }}
                      >
                        {savingProfile ? (
                          <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={20} color="inherit" />
                            Saving...
                          </Box>
                        ) : 'Save Changes'}
                      </Button>
                    </Box>
                    <Box sx={{ 
                      mt: 2.5, 
                      p: 2, 
                      borderRadius: 2.5,
                      background: (t) => alpha(t.palette.info.main, 0.05),
                      border: (t) => `1px solid ${alpha(t.palette.info.main, 0.15)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: (t) => alpha(t.palette.info.main, 0.08),
                      }
                    }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span" sx={{ fontSize: '1.2rem' }}>ℹ️</Box>
                        Only your name can be updated. Other details are protected—contact support to request changes.
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Security & Preferences Section */}
                <Box sx={{
                  animation: 'fadeInUp 0.8s ease-out 0.4s backwards',
                }}>
                  <Typography 
                    variant="h6" 
                    fontWeight={900} 
                    sx={{ 
                      mb: 3.5, 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5,
                      transition: 'all 0.3s ease',
                      '&:hover .accent-bar': {
                        width: '6px',
                        background: (t) => `linear-gradient(180deg, ${t.palette.secondary.main}, ${t.palette.info.main})`,
                      }
                    }}
                  >
                    <Box 
                      className="accent-bar"
                      sx={{ 
                        width: 4, 
                        height: 28, 
                        borderRadius: 2,
                        background: (t) => `linear-gradient(135deg, ${t.palette.secondary.main}, ${t.palette.info.main})`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      }} 
                    />
                    Security & Preferences
                  </Typography>
                  
                  <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 3,
                  }}>
                    {/* Password */}
                    <Box sx={{ 
                        p: 3.5, 
                        borderRadius: 3,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        background: (t) => t.palette.background.paper,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Box sx={{ 
                            width: 44, 
                            height: 44, 
                            borderRadius: '50%', 
                            bgcolor: (t) => alpha(t.palette.warning.main, 0.12), 
                            display:'flex', 
                            alignItems:'center', 
                            justifyContent:'center',
                          }}>
                            <LockIcon sx={{ color: 'warning.main', fontSize: 24 }} />
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={800}>Password</Typography>
                            <Typography variant="caption" color="text.secondary">Secure your account</Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                            Keep your account secure by updating your password regularly.
                          </Typography>
                        </Box>
                        
                        <Button
                          variant="contained"
                          fullWidth
                          color="warning"
                          onClick={() => window.dispatchEvent(new Event('openChangePassword'))}
                          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 800, py: 1.2 }}
                        >
                          Change Password
                        </Button>
                      </Box>

                    {/* Preferences */}
                    <Box sx={{ 
                        p: 3.5, 
                        borderRadius: 3,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        background: (t) => t.palette.background.paper,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      }}>
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Box sx={{ 
                            width: 44, 
                            height: 44, 
                            borderRadius: '50%', 
                            bgcolor: (t) => alpha(t.palette.info.main, 0.12), 
                            display:'flex', 
                            alignItems:'center', 
                            justifyContent:'center',
                          }}>
                            <Box component="span" sx={{ fontSize: 22 }}>🎨</Box>
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={800}>Preferences</Typography>
                            <Typography variant="caption" color="text.secondary">Customize your experience</Typography>
                          </Box>
                        </Box>
                        
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                            Personalize your dashboard with your preferred display theme.
                          </Typography>
                        </Box>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          transition: 'all 0.3s ease',
                          p: 2,
                          borderRadius: 2.5,
                          background: (t) => alpha(t.palette.background.paper, 0.4),
                          border: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}`,
                          '&:hover': {
                            background: (t) => alpha(t.palette.background.paper, 0.6),
                            borderColor: (t) => alpha(t.palette.info.main, 0.3),
                          }
                        }}>
                          <Box>
                            <Typography variant="body1" fontWeight={700}>Theme</Typography>
                            <Typography variant="caption" color="text.secondary">Choose your display mode</Typography>
                          </Box>
                          <Box sx={{ 
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.05)',
                            }
                          }}>
                            <ThemeToggle size="medium" />
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
              </Paper>
            )}

            {selectedIndex === 2 && (
              <Box>
                {loading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                    <CircularProgress size={48} />
                  </Box>
                ) : error ? (
                  <Alert severity="error" sx={{ borderRadius: 4 }}>{error}</Alert>
                ) : (!diseaseData || !diseaseData.disease) ? (
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 5, 
                      borderRadius: 3,
                      textAlign: 'center',
                      background: (t) => t.palette.background.paper,
                      border: (t) => `1px dashed ${t.palette.divider}`,
                    }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <Box 
                        sx={{ 
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: (t) => alpha(t.palette.primary.main, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 3,
                          fontSize: '4rem',
                        }}
                      >
                        📋
                      </Box>
                      <Typography variant="h5" fontWeight={800} sx={{ mb: 1.5 }}>
                        No Disease Data Yet
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                        You haven't filled your health details yet. Start your onboarding journey to get personalized insights and track your health.
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="large"
                        onClick={() => navigate('/onboarding')} 
                        sx={{ 
                          borderRadius: 2, 
                          fontWeight: 800,
                          px: 4,
                          py: 1.4,
                        }}
                      >
                        Start Onboarding
                      </Button>
                    </Box>
                  </Paper>
                ) : (
                  <Box>
                    {/* Main Content */}
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 4, 
                        borderRadius: 3,
                        background: (t) => t.palette.background.paper,
                        border: (t) => `1px solid ${t.palette.divider}`,
                        mb: 3,
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                        <Typography variant="h6" fontWeight={800}>
                          Health Profile
                        </Typography>
                        {diseaseData?.disease && (
                          <Button 
                            variant="contained" 
                            startIcon={<EditIcon />} 
                            onClick={handleEditDiseaseData} 
                            sx={{ 
                              borderRadius: 2, 
                              fontWeight: 800,
                            }}
                          >
                            Edit Data
                          </Button>
                        )}
                      </Box>
                      
                      {/* Progress Bar */}
                      {typeof diseaseData.totalQuestions === 'number' && diseaseData.totalQuestions > 0 && (
                        <Box 
                          sx={{ 
                            mb: 4, 
                            p: 3, 
                            borderRadius: 3,
                            background: (t) => alpha(t.palette.primary.main, 0.04),
                          }}
                        >
                          <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                            <Typography variant="subtitle1" fontWeight={700}>
                              Onboarding Progress
                            </Typography>
                            <Chip 
                              label={completionPct === 100 ? 'Complete' : 'In Progress'} 
                              color={completionPct === 100 ? 'success' : 'primary'}
                              size="small"
                              sx={{ fontWeight: 800 }}
                            />
                          </Box>
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box sx={{ flexGrow: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={completionPct}
                                sx={{ 
                                  height: 12, 
                                  borderRadius: 6,
                                  background: (t) => alpha(t.palette.primary.main, 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 6,
                                    background: (t) => t.palette.primary.main,
                                  }
                                }}
                              />
                            </Box>
                            <Typography variant="h6" fontWeight={900} color="primary.main">
                              {completionPct}%
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      <Divider sx={{ mb: 3 }} />

                      {/* Symptoms Section - Clean List Layout */}
                      {diseaseData.symptoms?.length ? (
                        <Box>
                          <Typography variant="h6" fontWeight={900} sx={{ mb: 3 }}>
                            Symptom Details
                          </Typography>
                          {diseaseData.symptoms.map((symptom, idx) => (
                            <Box 
                              key={symptom.name || idx}
                              sx={{ 
                                mb: 3,
                                p: 3,
                                borderRadius: 3,
                                background: (t) => t.palette.background.paper,
                                border: (t) => `1px solid ${t.palette.divider}`,
                              }}
                            >
                              {/* Symptom Header */}
                              <Box display="flex" alignItems="center" gap={2} mb={2.5}>
                                <Box 
                                  sx={{ 
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    background: (t) => alpha(t.palette.text.primary, 0.08),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'text.primary',
                                    fontWeight: 700,
                                    fontSize: '0.85rem',
                                  }}
                                >
                                  {idx + 1}
                                </Box>
                                <Typography variant="subtitle1" fontWeight={800}>
                                  {symptom.name}
                                </Typography>
                                <Chip 
                                  label={`${symptom.questions?.length || 0} Questions`}
                                  size="small"
                                  sx={{ 
                                    ml: 'auto',
                                    fontWeight: 600,
                                    background: (t) => alpha(t.palette.text.primary, 0.06),
                                  }}
                                />
                              </Box>
                              
                              {/* Questions List */}
                              {symptom.questions?.length ? (
                                <Box sx={{ 
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: 1.5,
                                }}>
                                  {symptom.questions.map((q, qIdx) => (
                                    <Box 
                                      key={q.question + qIdx}
                                      sx={{ 
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        p: 2,
                                        borderRadius: 2,
                                        background: (t) => t.palette.background.paper,
                                        border: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}`,
                                      }}
                                    >
                                      <Box 
                                        sx={{ 
                                          minWidth: 28,
                                          height: 28,
                                          borderRadius: '50%',
                                          background: (t) => alpha(t.palette.text.primary, 0.06),
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '0.75rem',
                                          fontWeight: 700,
                                          color: 'text.secondary',
                                        }}
                                      >
                                        Q{qIdx + 1}
                                      </Box>
                                      <Typography 
                                        variant="body2" 
                                        sx={{ 
                                          flex: 1,
                                          fontWeight: 500,
                                        }}
                                      >
                                        {q.question}
                                      </Typography>
                                      <Chip label={q.answer} variant="outlined" size="small" sx={{ fontWeight: 600, minWidth: 80 }} />
                                      <Typography 
                                        variant="caption" 
                                        color="text.secondary"
                                        sx={{ minWidth: 90, textAlign: 'right' }}
                                      >
                                        {q.date ? new Date(q.date).toLocaleDateString() : ''}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', pl: 2 }}>
                                  No questions answered for this symptom.
                                </Typography>
                              )}
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Alert severity="info" sx={{ borderRadius: 3 }}>
                          No symptoms or answers found for this disease.
                        </Alert>
                      )}
                    </Paper>

                    {/* Assessment CTA */}
                    <RiskCard onAssess={() => navigate('/assessment')} lastAssessedAt={null} />
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Edit Disease Data Modal */}
      <Modal
        open={showEditModal}
        onClose={handleCloseEditModal}
        aria-labelledby="edit-disease-data-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1000,
            maxHeight: '90vh',
            bgcolor: '#fff',
            borderRadius: 3,
            boxShadow: 24,
            overflow: 'auto',
            p: 3,
            position: 'relative',
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography id="edit-disease-data-modal" variant="h6" fontWeight={700} color="#23272f">
              Edit Disease Data
            </Typography>
            <IconButton onClick={handleCloseEditModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <EditDiseaseData
            onClose={handleCloseEditModal}
            onDataUpdated={handleDataUpdated}
          />
        </Box>
      </Modal>
    </Box>
  );
}