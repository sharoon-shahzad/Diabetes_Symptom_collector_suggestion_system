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
      background: (t) => t.palette.background.gradient 
    }}>
  <CssBaseline />
      {/* Sidebar */}
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
            background: (t) => t.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
            borderRight: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
          },
        }}
      >
        <Box>
          {/* User Profile Header - Clean & Minimal */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              px: 1.5,
              py: 2,
              mb: 3,
            }}
          >
            <Avatar 
              sx={{ 
                width: 40,
                height: 40,
                background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                fontWeight: 700,
                fontSize: '1.1rem',
              }}
            >
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="body2" 
                fontWeight={700}
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mb: 0.25,
                }}
              >
                {user?.fullName || 'User'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                Dashboard
              </Typography>
            </Box>
          </Box>
          
          {/* Navigation Menu - Clean List */}
          <List sx={{ px: 0 }}>
            {sections.map((sec, index) => (
              <ListItem 
                button 
                key={sec.label} 
                selected={selectedIndex === index} 
                onClick={() => setSelectedIndex(index)} 
                sx={{ 
                  borderRadius: 1.5,
                  mb: 0.5,
                  px: 1.5,
                  py: 1.25,
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '3px',
                    height: '60%',
                    borderRadius: '0 4px 4px 0',
                    background: (t) => `linear-gradient(180deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  },
                  '&.Mui-selected': {
                    bgcolor: (t) => t.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.08)' 
                      : 'rgba(0,0,0,0.04)',
                    '&::before': {
                      opacity: 1,
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'text.primary',
                      fontWeight: 700,
                    },
                  },
                  '&:hover': {
                    bgcolor: (t) => t.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.05)' 
                      : 'rgba(0,0,0,0.03)',
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 36,
                    color: 'text.secondary',
                    transition: 'color 0.2s ease',
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
          
          {/* Logout Button - Subtle */}
          <Button
            fullWidth
            variant="text"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ 
              borderRadius: 1.5, 
              fontWeight: 600,
              py: 1.25,
              px: 1.5,
              justifyContent: 'flex-start',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: (t) => alpha(t.palette.error.main, 0.08),
                color: 'error.main',
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
      {/* Main Content */}
  <Box component="main" sx={{ flexGrow: 1, ml: 0, mt: 0, minHeight: '100vh', background: 'transparent' }}>
        {/* Hero header */}
        <Box sx={{
          px: { xs: 2, md: 6 },
          pt: { xs: 2, md: 4 },
          pb: 3,
          background: (t) => t.palette.background.gradient,
        }}>
          <Paper elevation={8} sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            background: (t) => alpha(t.palette.background.paper, 0.9),
            backdropFilter: 'blur(8px)',
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.12)}`,
            maxWidth: 1200,
            mx: 'auto',
          }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
              <Box>
                <Typography variant="h5" fontWeight={900}>
                  Welcome back{user ? `, ${user.fullName.split(' ')[0]}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your personal health dashboard — track progress, update details, and assess your risk.
                </Typography>
              </Box>
              <QuickActions />
            </Box>
          </Paper>
        </Box>

        {/* Content container */}
        <Box sx={{ px: { xs: 2, md: 6 }, pb: 6, display: 'flex', justifyContent: 'center' }}>
          <Box sx={{ width: '100%', maxWidth: selectedIndex === 2 ? 2400 : 1200 }}>
            {selectedIndex === 0 && (
              <Box>
                {/* Stats Row */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} lg={3}>
                    <StatWidget
                      title="Condition"
                      value={diseaseData?.disease || 'Not Set'}
                      caption={diseaseData?.lastUpdated ? `Updated ${new Date(diseaseData.lastUpdated).toLocaleDateString()}` : 'Start onboarding'}
                      color="primary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <StatWidget
                      title="Questions"
                      value={`${diseaseData?.answeredQuestions ?? 0}/${diseaseData?.totalQuestions ?? 0}`}
                      caption="Answers saved"
                      color="info"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <StatWidget
                      title="Progress"
                      value={`${completionPct}%`}
                      caption={completionPct === 100 ? 'All done!' : 'Keep going'}
                      color="success"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} lg={3}>
                    <Paper
                      elevation={0}
                      onClick={() => completionPct === 100 ? navigate('/assessment') : navigate('/onboarding')}
                      sx={{
                        p: 3.5,
                        borderRadius: 4,
                        height: '100%',
                        cursor: 'pointer',
                        background: (t) => t.palette.mode === 'dark'
                          ? `linear-gradient(135deg, ${alpha(t.palette.secondary.main, 0.18)} 0%, ${alpha(t.palette.secondary.dark, 0.12)} 100%)`
                          : `linear-gradient(135deg, ${alpha(t.palette.secondary.main, 0.12)} 0%, ${alpha(t.palette.secondary.dark, 0.08)} 100%)`,
                        border: (t) => `2px solid ${alpha(t.palette.secondary.main, 0.35)}`,
                        transition: 'all .25s ease',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: (t) => `0 12px 32px ${alpha(t.palette.secondary.main, 0.25)}`,
                        }
                      }}
                    >
                      <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 900, letterSpacing: 2 }}>
                        Next Action
                      </Typography>
                      <Typography variant="h5" fontWeight={900} sx={{ mt: 0.5 }}>
                        Assessment
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {completionPct === 100 ? 'Ready to assess' : 'Finish onboarding'}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Main Content: 2-column responsive grid */}
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
                        p: 5,
                        borderRadius: 5,
                        height: '100%',
                        background: (t) => `linear-gradient(135deg, ${t.palette.background.paper}, ${alpha(t.palette.primary.main, 0.05)})`,
                        border: (t) => `2px solid ${alpha(t.palette.primary.main, 0.15)}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        minHeight: 420,
                        transition: 'all 0.35s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          background: (t) => `radial-gradient(circle at 30% 0%, ${alpha(t.palette.primary.main, 0.08)}, transparent 40%)`,
                          opacity: 0.6,
                          pointerEvents: 'none'
                        },
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: (t) => `0 20px 40px ${alpha(t.palette.primary.main, 0.15)}`,
                          borderColor: (t) => t.palette.primary.main,
                        }
                      }}
                    >
                      <Typography 
                        variant="overline" 
                        sx={{ 
                          color: 'primary.main', 
                          fontWeight: 900, 
                          letterSpacing: 2,
                          fontSize: '0.8rem',
                          mb: 3,
                        }}
                      >
                        ONBOARDING PROGRESS
                      </Typography>
                      <Box sx={{ mb: 4 }}>
                        <ProgressDonut value={completionPct} label="Complete" size={120} />
                      </Box>
                      <Typography 
                        variant="h3" 
                        fontWeight={900} 
                        sx={{ 
                          mb: 1.5,
                          background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        {completionPct}% Complete
                      </Typography>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 500 }}>
                        {diseaseData?.answeredQuestions || 0} of {diseaseData?.totalQuestions || 0} questions answered
                      </Typography>
                      {completionPct < 100 ? (
                        <Button 
                          variant="contained" 
                          size="large"
                          onClick={() => navigate('/onboarding')}
                          sx={{ 
                            borderRadius: 3,
                            fontWeight: 900,
                            px: 5,
                            py: 1.8,
                            fontSize: '1rem',
                            textTransform: 'none',
                            background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                            boxShadow: (t) => `0 12px 28px ${alpha(t.palette.primary.main, 0.3)}`,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.secondary.dark})`,
                              boxShadow: (t) => `0 16px 36px ${alpha(t.palette.primary.main, 0.4)}`,
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Continue Onboarding
                        </Button>
                      ) : (
                        <Chip 
                          icon={<CheckCircleIcon />}
                          label="Onboarding Complete" 
                          color="success" 
                          sx={{ 
                            fontWeight: 900,
                            px: 3,
                            py: 3,
                            fontSize: '1rem',
                            '& .MuiChip-icon': { fontSize: '1.3rem' }
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
                        borderRadius: 5,
                        height: '100%',
                        background: (t) => `linear-gradient(135deg, ${t.palette.background.paper}, ${alpha(t.palette.info.main, 0.04)})`,
                        border: (t) => `2px solid ${alpha(t.palette.info.main, 0.15)}`,
                        minHeight: 420,
                        transition: 'all 0.35s ease',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          inset: 0,
                          background: (t) => `radial-gradient(circle at 70% 0%, ${alpha(t.palette.info.main, 0.08)}, transparent 40%)`,
                          opacity: 0.6,
                          pointerEvents: 'none'
                        },
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          boxShadow: (t) => `0 20px 40px ${alpha(t.palette.info.main, 0.15)}`,
                          borderColor: (t) => t.palette.info.main,
                        }
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 4 }}>
                        <Box 
                          sx={{ 
                            width: 48,
                            height: 48,
                            borderRadius: 2.5,
                            background: (t) => t.palette.mode === 'dark'
                              ? alpha(t.palette.info.main, 0.2)
                              : alpha(t.palette.info.main, 0.12),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <InsightsIcon sx={{ fontSize: 28, color: 'info.main' }} />
                        </Box>
                        <Typography variant="h5" fontWeight={900}>
                          Recent Activity
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 3 }} />
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
                  p: { xs: 3, md: 5 }, 
                  borderRadius: 5,
                  background: (t) => t.palette.mode === 'dark' 
                    ? `linear-gradient(135deg, ${alpha(t.palette.background.paper, 0.7)} 0%, ${alpha(t.palette.background.paper, 0.5)} 100%)`
                    : `linear-gradient(135deg, ${alpha(t.palette.background.paper, 0.95)} 0%, ${alpha(t.palette.background.paper, 0.85)} 100%)`,
                  backdropFilter: 'blur(24px)',
                  border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.1)}`,
                  boxShadow: (t) => `0 20px 60px ${alpha(t.palette.common.black, t.palette.mode === 'dark' ? 0.4 : 0.08)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: (t) => `linear-gradient(90deg, ${t.palette.primary.main}, ${t.palette.secondary.main}, ${t.palette.info.main})`,
                  },
                  animation: 'fadeInUp 0.6s ease-out',
                  '@keyframes fadeInUp': {
                    from: { opacity: 0, transform: 'translateY(20px)' },
                    to: { opacity: 1, transform: 'translateY(0)' }
                  }
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
                    <Box sx={{ position: 'relative' }}>
                      <Avatar 
                        sx={{ 
                          width: 80, 
                          height: 80,
                          background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                          fontSize: '2rem',
                          fontWeight: 900,
                          boxShadow: (t) => `0 8px 24px ${alpha(t.palette.primary.main, 0.4)}`,
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'scale(1.08) rotate(5deg)',
                            boxShadow: (t) => `0 12px 32px ${alpha(t.palette.primary.main, 0.5)}`,
                          }
                        }}
                      >
                        {user?.fullName?.[0]?.toUpperCase() || 'U'}
                      </Avatar>
                      <Box sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        border: (t) => `3px solid ${t.palette.background.paper}`,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.6 }
                        }
                      }} />
                    </Box>
                    <Box flex={1}>
                      <Typography 
                        variant="h4" 
                        fontWeight={900} 
                        sx={{ 
                          background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                          WebkitTextFillColor: 'transparent',
                          mb: 0.5,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        {user?.fullName || 'User'}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5, fontWeight: 500 }}>
                        {user?.email}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(user?.roles || []).map((r, idx) => (
                          <Chip 
                            key={r} 
                            label={r} 
                            size="small" 
                            sx={{ 
                              fontWeight: 700,
                              background: (t) => alpha(t.palette.primary.main, 0.12),
                              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.3)}`,
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              animation: `chipFadeIn 0.5s ease-out ${idx * 0.1}s backwards`,
                              '@keyframes chipFadeIn': {
                                from: { opacity: 0, transform: 'scale(0.8)' },
                                to: { opacity: 1, transform: 'scale(1)' }
                              },
                              '&:hover': {
                                background: (t) => alpha(t.palette.primary.main, 0.2),
                                transform: 'translateY(-2px)',
                                boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.3)}`,
                              }
                            }} 
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Divider 
                  sx={{ 
                    mb: 5, 
                    borderColor: (t) => alpha(t.palette.divider, 0.08),
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      height: '100%',
                      width: '60px',
                      background: (t) => `linear-gradient(90deg, ${t.palette.primary.main}, transparent)`,
                      opacity: 0.3,
                    }
                  }} 
                />

                {/* Profile Info Section */}
                <Box sx={{ 
                  mb: 5,
                  animation: 'fadeInUp 0.8s ease-out 0.2s backwards',
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
                        background: (t) => `linear-gradient(180deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                      }
                    }}
                  >
                    <Box 
                      className="accent-bar"
                      sx={{ 
                        width: 4, 
                        height: 28, 
                        borderRadius: 2,
                        background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      }} 
                    />
                    Personal Information
                  </Typography>
                  
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
                                borderRadius: 2.5,
                                fontWeight: 600,
                                fontSize: '1.05rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                background: (t) => alpha(t.palette.background.paper, 0.6),
                                '&:hover': {
                                  background: (t) => alpha(t.palette.background.paper, 0.9),
                                  '& fieldset': {
                                    borderColor: 'primary.main',
                                    borderWidth: '2px',
                                  }
                                },
                                '&.Mui-focused': {
                                  background: (t) => alpha(t.palette.background.paper, 1),
                                  transform: 'scale(1.01)',
                                  boxShadow: (t) => `0 8px 24px ${alpha(t.palette.primary.main, 0.15)}`,
                                  '& fieldset': {
                                    borderColor: 'primary.main',
                                    borderWidth: '2px',
                                  }
                                }
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
                        sx={{
                          borderRadius: 3,
                          textTransform: 'none',
                          fontWeight: 800,
                          px: 5,
                          py: 1.8,
                          fontSize: '1.05rem',
                          background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                          boxShadow: (t) => `0 8px 24px ${alpha(t.palette.primary.main, 0.35)}`,
                          position: 'relative',
                          overflow: 'hidden',
                          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            transition: 'left 0.5s ease',
                          },
                          '&:hover': {
                            transform: 'translateY(-3px) scale(1.02)',
                            background: (t) => `linear-gradient(135deg, ${t.palette.primary.dark}, ${t.palette.secondary.dark})`,
                            boxShadow: (t) => `0 16px 40px ${alpha(t.palette.primary.main, 0.45)}`,
                            '&::before': {
                              left: '100%',
                            }
                          },
                          '&:active': {
                            transform: 'translateY(-1px) scale(0.98)',
                          },
                          '&:disabled': {
                            background: (t) => t.palette.action.disabledBackground,
                            transform: 'none',
                          }
                        }}
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

                <Divider 
                  sx={{ 
                    mb: 5, 
                    borderColor: (t) => alpha(t.palette.divider, 0.08),
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      width: '60px',
                      background: (t) => `linear-gradient(90deg, transparent, ${t.palette.secondary.main})`,
                      opacity: 0.3,
                    }
                  }} 
                />

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
                        p: 4, 
                        borderRadius: 4,
                        border: (t) => `1px solid ${alpha(t.palette.warning.main, 0.2)}`,
                        background: (t) => `linear-gradient(135deg, ${alpha(t.palette.warning.main, 0.04)} 0%, ${alpha(t.palette.warning.main, 0.02)} 100%)`,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '-50%',
                          right: '-50%',
                          width: '200%',
                          height: '200%',
                          background: (t) => `radial-gradient(circle, ${alpha(t.palette.warning.main, 0.1)} 0%, transparent 70%)`,
                          opacity: 0,
                          transition: 'opacity 0.4s ease',
                        },
                        '&:hover': {
                          borderColor: (t) => alpha(t.palette.warning.main, 0.4),
                          background: (t) => `linear-gradient(135deg, ${alpha(t.palette.warning.main, 0.08)} 0%, ${alpha(t.palette.warning.main, 0.04)} 100%)`,
                          transform: 'translateY(-4px)',
                          boxShadow: (t) => `0 12px 32px ${alpha(t.palette.warning.main, 0.2)}`,
                          '&::before': {
                            opacity: 1,
                          }
                        }
                      }}>
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                          <Box sx={{ 
                            width: 52, 
                            height: 52, 
                            borderRadius: 3, 
                            bgcolor: (t) => alpha(t.palette.warning.main, 0.15), 
                            display:'flex', 
                            alignItems:'center', 
                            justifyContent:'center',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'rotate(15deg) scale(1.1)',
                              bgcolor: (t) => alpha(t.palette.warning.main, 0.25),
                            }
                          }}>
                            <LockIcon sx={{ color: 'warning.main', fontSize: 28 }} />
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight={900}>Password</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                              Secure your account
                            </Typography>
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
                          onClick={() => window.dispatchEvent(new Event('openChangePassword'))}
                          sx={{
                            borderRadius: 2.5,
                            textTransform: 'none',
                            fontWeight: 800,
                            py: 1.5,
                            fontSize: '1rem',
                            background: (t) => `linear-gradient(135deg, ${t.palette.warning.main}, ${t.palette.warning.dark})`,
                            boxShadow: (t) => `0 6px 20px ${alpha(t.palette.warning.main, 0.3)}`,
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              background: (t) => `linear-gradient(135deg, ${t.palette.warning.dark}, ${t.palette.warning.main})`,
                              transform: 'translateY(-2px)',
                              boxShadow: (t) => `0 10px 28px ${alpha(t.palette.warning.main, 0.4)}`,
                            },
                            '&:active': {
                              transform: 'translateY(0)',
                            }
                          }}
                        >
                          Change Password
                        </Button>
                      </Box>

                    {/* Preferences */}
                    <Box sx={{ 
                        p: 4, 
                        borderRadius: 4,
                        border: (t) => `1px solid ${alpha(t.palette.info.main, 0.2)}`,
                        background: (t) => `linear-gradient(135deg, ${alpha(t.palette.info.main, 0.04)} 0%, ${alpha(t.palette.info.main, 0.02)} 100%)`,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        position: 'relative',
                        overflow: 'hidden',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: '-50%',
                          left: '-50%',
                          width: '200%',
                          height: '200%',
                          background: (t) => `radial-gradient(circle, ${alpha(t.palette.info.main, 0.1)} 0%, transparent 70%)`,
                          opacity: 0,
                          transition: 'opacity 0.4s ease',
                        },
                        '&:hover': {
                          borderColor: (t) => alpha(t.palette.info.main, 0.4),
                          background: (t) => `linear-gradient(135deg, ${alpha(t.palette.info.main, 0.08)} 0%, ${alpha(t.palette.info.main, 0.04)} 100%)`,
                          transform: 'translateY(-4px)',
                          boxShadow: (t) => `0 12px 32px ${alpha(t.palette.info.main, 0.2)}`,
                          '&::before': {
                            opacity: 1,
                          }
                        }
                      }}>
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                          <Box sx={{ 
                            width: 52, 
                            height: 52, 
                            borderRadius: 3, 
                            bgcolor: (t) => alpha(t.palette.info.main, 0.15), 
                            display:'flex', 
                            alignItems:'center', 
                            justifyContent:'center',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                              transform: 'rotate(15deg) scale(1.1)',
                              bgcolor: (t) => alpha(t.palette.info.main, 0.25),
                            }
                          }}>
                            <Box 
                              component="span" 
                              sx={{ 
                                fontSize: 28,
                                transition: 'transform 0.4s ease',
                                display: 'inline-block',
                              }}
                            >
                              🎨
                            </Box>
                          </Box>
                          <Box>
                            <Typography variant="h6" fontWeight={900}>Preferences</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                              Customize your experience
                            </Typography>
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
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                              Choose your display mode
                            </Typography>
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
                      p: 6, 
                      borderRadius: 5,
                      textAlign: 'center',
                      background: (t) => `linear-gradient(135deg, ${alpha(t.palette.primary.main, 0.08)} 0%, ${alpha(t.palette.secondary.main, 0.08)} 100%)`,
                      border: (t) => `2px dashed ${alpha(t.palette.primary.main, 0.3)}`,
                    }}
                  >
                    <Box sx={{ mb: 3 }}>
                      <Box 
                        sx={{ 
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
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
                      <Typography variant="h4" fontWeight={900} sx={{ mb: 2 }}>
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
                          borderRadius: 3, 
                          fontWeight: 800,
                          px: 5,
                          py: 1.8,
                          background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                          fontSize: '1.1rem',
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
                        borderRadius: 5,
                        background: (t) => t.palette.mode === 'dark' 
                          ? alpha(t.palette.background.paper, 0.6)
                          : alpha(t.palette.background.paper, 0.9),
                        border: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}`,
                        mb: 3,
                      }}
                    >
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                        <Typography variant="h5" fontWeight={900}>
                          Health Profile
                        </Typography>
                        {diseaseData?.disease && (
                          <Button 
                            variant="contained" 
                            startIcon={<EditIcon />} 
                            onClick={handleEditDiseaseData} 
                            sx={{ 
                              borderRadius: 2.5, 
                              fontWeight: 800,
                              background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
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
                            background: (t) => alpha(t.palette.primary.main, 0.05),
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
                                    background: (t) => `linear-gradient(90deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
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
                                background: (t) => alpha(t.palette.secondary.main, 0.04),
                                border: (t) => `1px solid ${alpha(t.palette.secondary.main, 0.15)}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  background: (t) => alpha(t.palette.secondary.main, 0.08),
                                  borderColor: (t) => alpha(t.palette.secondary.main, 0.3),
                                }
                              }}
                            >
                              {/* Symptom Header */}
                              <Box display="flex" alignItems="center" gap={2} mb={2.5}>
                                <Box 
                                  sx={{ 
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    background: (t) => `linear-gradient(135deg, ${t.palette.secondary.main}, ${t.palette.secondary.dark})`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontWeight: 900,
                                    fontSize: '1.1rem',
                                  }}
                                >
                                  {idx + 1}
                                </Box>
                                <Typography variant="h6" fontWeight={900} color="secondary.main">
                                  {symptom.name}
                                </Typography>
                                <Chip 
                                  label={`${symptom.questions?.length || 0} Questions`}
                                  size="small"
                                  sx={{ 
                                    ml: 'auto',
                                    fontWeight: 700,
                                    background: (t) => alpha(t.palette.secondary.main, 0.15),
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
                                          background: (t) => alpha(t.palette.secondary.main, 0.1),
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontSize: '0.75rem',
                                          fontWeight: 700,
                                          color: 'secondary.main',
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
                                      <Chip 
                                        label={q.answer} 
                                        color="secondary" 
                                        size="small"
                                        sx={{ 
                                          fontWeight: 700,
                                          minWidth: 80,
                                        }}
                                      />
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