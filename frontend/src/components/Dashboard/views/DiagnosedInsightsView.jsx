import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Paper,
  Button,
  Chip,
  LinearProgress,
  CircularProgress,
  Divider,
  alpha
} from '@mui/material';
import {
  Person as PersonIcon,
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  Science as ScienceIcon,
  Add as AddIcon,
  Close as CloseIcon
} from '@mui/icons-material';

// Import extracted components
import NutritionAnalytics from '../analytics/NutritionAnalytics';
import ExerciseAnalytics from '../analytics/ExerciseAnalytics';

function DiagnosedInsightsView({
  planUsageAnalytics,
  macronutrientBalance,
  mealWiseDistribution,
  bmiAnalytics,
  personalInfo,
  personalInfoCompletion,
  medicalInfo,
  user
}) {
  const navigate = useNavigate();
  const labsRef = useRef(null);

  console.log('DiagnosedInsightsView Props:', {
    planUsageAnalytics,
    macronutrientBalance,
    mealWiseDistribution,
    bmiAnalytics,
    personalInfo,
    medicalInfo,
    user
  });

  return (
    <Box>
      {/* Main grid - Comprehensive Health Analytics Dashboard */}
      <Grid container spacing={3}>
        {/* Page Header with Key Metrics */}
        <Grid item xs={12}>
          <Box sx={{ 
            mb: 5, 
            pb: 3, 
            borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}`
          }}>
            <Typography 
              variant="h3" 
              fontWeight={900} 
              sx={{ 
                mb: 1.5, 
                color: 'text.primary', 
                letterSpacing: -1,
                fontSize: { xs: '1.875rem', md: '2.5rem' },
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Health Analytics Dashboard
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary', 
                fontSize: { xs: '0.938rem', md: '1.063rem' }, 
                lineHeight: 1.7,
                maxWidth: '800px',
                fontWeight: 400
              }}
            >
              Comprehensive insights from your personalized diet, exercise, and lifestyle data
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* === SECTION 1: NUTRITION ANALYTICS === */}
      <NutritionAnalytics 
        planUsageAnalytics={planUsageAnalytics}
        macronutrientBalance={macronutrientBalance}
        mealWiseDistribution={mealWiseDistribution}
      />

      {/* === SECTION 2: EXERCISE & ACTIVITY ANALYTICS === */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <ExerciseAnalytics planUsageAnalytics={planUsageAnalytics} />
          </Grid>

          {/* Right Column: Personal & Medical Profile */}
          <Grid item xs={12} lg={6} sx={{ position: 'relative' }}>
            {/* Vertical Divider - visible only on large screens */}
            <Box sx={{ 
              display: { xs: 'none', lg: 'block' },
              position: 'absolute',
              left: -12,
              top: 0,
              bottom: 0,
              width: '2px',
              background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
              borderRadius: 1
            }} />
            
            {/* Section Header */}
            <Box sx={{ 
              mb: 4, 
              pb: 2, 
              borderBottom: (t) => `3px solid ${alpha('#10b981', 0.15)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: 56, 
                height: 56, 
                borderRadius: 3, 
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)'
              }}>
                <PersonIcon sx={{ color: '#fff', fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} sx={{ 
                  color: 'text.primary', 
                  letterSpacing: -0.5, 
                  fontSize: { xs: '1.5rem', md: '1.875rem' },
                  mb: 0.5
                }}>
                  Personal & Medical Profile
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                  Your health metrics and medical information
                </Typography>
              </Box>
            </Box>

            {/* BMI & Weight Analytics */}
            <Paper elevation={0} sx={{ 
              p: { xs: 3, md: 3.5 }, 
              borderRadius: 4, 
              border: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}`,
              background: (t) => t.palette.background.paper,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              mb: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              '&:hover': { 
                transform: 'translateY(-6px)', 
                boxShadow: '0 12px 28px rgba(16, 185, 129, 0.15)',
                borderColor: (t) => alpha('#10b981', 0.3)
              } 
            }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5, fontSize: { xs: '0.9rem', md: '1rem' } }}>Body Mass Index</Typography>
              {bmiAnalytics ? (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                    <Typography variant="h3" fontWeight={700}>{bmiAnalytics.value}</Typography>
                    <Chip 
                      label={bmiAnalytics.label} 
                      size="small" 
                      color={bmiAnalytics.severity === 'success' ? 'success' : bmiAnalytics.severity === 'warning' ? 'warning' : 'error'}
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">BMI Progress</Typography>
                      <Typography variant="caption" fontWeight={600}>{bmiAnalytics.pct}%</Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={bmiAnalytics.pct} 
                      sx={{ 
                        height: 10, 
                        borderRadius: 1, 
                        bgcolor: alpha(bmiAnalytics.severity === 'success' ? '#10b981' : bmiAnalytics.severity === 'warning' ? '#eab308' : '#ef4444', 0.1),
                        '& .MuiLinearProgress-bar': { 
                          bgcolor: bmiAnalytics.severity === 'success' ? '#10b981' : bmiAnalytics.severity === 'warning' ? '#eab308' : '#ef4444',
                          borderRadius: 1 
                        } 
                      }} 
                    />
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Height</Typography>
                      <Typography variant="body2" fontWeight={600}>{personalInfo?.height || 'N/A'} cm</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary">Weight</Typography>
                      <Typography variant="body2" fontWeight={600}>{personalInfo?.weight || 'N/A'} kg</Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">No BMI data available</Typography>
              )}
            </Paper>

            {/* Profile Completion Gauge */}
            <Paper elevation={0} sx={{ 
              p: { xs: 3, md: 3.5 }, 
              borderRadius: 4, 
              border: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}`,
              background: (t) => t.palette.background.paper,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              mb: 3,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              '&:hover': { 
                transform: 'translateY(-6px)', 
                boxShadow: '0 12px 28px rgba(102, 126, 234, 0.15)',
                borderColor: (t) => alpha('#667eea', 0.3)
              } 
            }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2.5, fontSize: { xs: '0.9rem', md: '1rem' } }}>Profile Completion</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={personalInfoCompletion}
                    size={100}
                    thickness={6}
                    sx={{
                      color: personalInfoCompletion === 100 ? '#10b981' : '#3b82f6',
                      '& .MuiCircularProgress-circle': {
                        strokeLinecap: 'round',
                      },
                    }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      {personalInfoCompletion}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" align="center">
                  {personalInfoCompletion === 100 ? 'Profile Complete' : `${100 - personalInfoCompletion}% remaining`}
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} />
                  <Typography variant="caption">Personal Info</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircleIcon fontSize="small" sx={{ color: '#10b981' }} />
                  <Typography variant="caption">Medical History</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* === SECTION 6: MEDICAL OVERVIEW === */}
      <Box sx={{ mt: 6, mb: 4 }}>
        <Box sx={{ 
          mb: 4, 
          pb: 2, 
          borderBottom: (t) => `3px solid ${alpha('#ef4444', 0.15)}`,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: 56, 
            height: 56, 
            borderRadius: 3, 
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            boxShadow: '0 8px 16px rgba(239, 68, 68, 0.25)'
          }}>
            <AssessmentIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ 
              color: 'text.primary', 
              letterSpacing: -0.5, 
              fontSize: { xs: '1.5rem', md: '1.875rem' },
              mb: 0.5
            }}>
              Medical Overview
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
              Your diagnosis and health monitoring data
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Diagnosis Snapshot */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ 
            p: { xs: 3, md: 4 }, 
            borderRadius: 4, 
            border: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}`,
            background: (t) => t.palette.background.paper,
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            height: '100%', 
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
            '&:hover': { 
              transform: 'translateY(-6px)', 
              boxShadow: '0 12px 28px rgba(102, 126, 234, 0.15)',
              borderColor: (t) => alpha('#667eea', 0.3)
            } 
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontSize: '0.75rem',
                  }}
                >
                  Diagnosis Snapshot
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
                  {medicalInfo?.diabetes_type || 'Add your diabetes type'}
                </Typography>
              </Box>
              <Chip
                label={user?.diabetes_diagnosed === 'yes' ? 'Confirmed' : 'Not confirmed'}
                color="success"
                size="small"
                sx={{
                  fontWeight: 600,
                  borderRadius: 1.5,
                  height: 24,
                  fontSize: '0.7rem'
                }}
              />
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontSize: '0.7rem'
                  }}
                >
                  Diagnosis Date
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {medicalInfo?.diagnosis_date
                    ? new Date(medicalInfo.diagnosis_date).toLocaleDateString()
                    : 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                  Time Since Diagnosis
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {medicalInfo?.diagnosis_date
                    ? (() => {
                        const d = new Date(medicalInfo.diagnosis_date);
                        const diffYears = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                        if (diffYears < 1) {
                          const months = Math.max(1, Math.round(diffYears * 12));
                          return `${months} month${months === 1 ? '' : 's'}`;
                        }
                        return `${diffYears.toFixed(1)} years`;
                      })()
                    : 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                  Last Medical Check-up
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {medicalInfo?.last_medical_checkup
                    ? new Date(medicalInfo.last_medical_checkup).toLocaleDateString()
                    : 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.7rem' }}>
                  Profile Completeness
                </Typography>
                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                  {personalInfoCompletion}% complete
                </Typography>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 3, pt: 2.5, borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}` }}>
              <Button
                variant="contained"
                onClick={() => navigate('/personalized-suggestions/personal-medical')}
                sx={{
                  borderRadius: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2.5,
                  py: 1,
                  fontSize: '0.875rem',
                  boxShadow: 1,
                  '&:hover': {
                    boxShadow: 2
                  }
                }}
              >
                Update Medical Info
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/personalized-suggestions/diet-plan')}
                sx={{ 
                  borderRadius: 1, 
                  textTransform: 'none', 
                  fontWeight: 600, 
                  px: 2.5, 
                  py: 1,
                  fontSize: '0.875rem'
                }}
                disabled={personalInfoCompletion < 100}
              >
                View Plans
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* IoT Real-Time Health Monitoring */}
        <Grid item xs={12} md={5}>
          <Paper
            ref={labsRef}
            elevation={0}
            sx={{
              p: { xs: 3, md: 3.5 },
              borderRadius: 4,
              background: (t) => t.palette.background.paper,
              border: (t) => `1px solid ${alpha(t.palette.divider, 0.1)}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              height: '100%',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: '0 12px 28px rgba(239, 68, 68, 0.15)',
                borderColor: (t) => alpha('#ef4444', 0.3)
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                      animation: 'pulse 2s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.3 }
                      }
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{ 
                      color: 'error.main',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: 1
                    }}
                  >
                    Device Offline
                  </Typography>
                </Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    color: 'text.primary'
                  }}
                >
                  IoT Health Tracker
                </Typography>
              </Box>
              <Chip
                label="Not Connected"
                size="small"
                icon={<CloseIcon sx={{ fontSize: '1rem' }} />}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  height: 24,
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2.5, fontSize: '0.75rem' }}>
              Connect your glucose monitor or health tracker to view real-time data
            </Typography>

            {medicalInfo ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (t) => alpha(t.palette.success.main, 0.08),
                    border: (t) => `1px solid ${alpha(t.palette.success.main, 0.2)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: (t) => alpha(t.palette.success.main, 0.12),
                      borderColor: (t) => alpha(t.palette.success.main, 0.3)
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'text.secondary',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}
                    >
                      Glucose Level
                    </Typography>
                    <Chip label="Latest" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'success.dark' }}>
                    {medicalInfo?.recent_lab_results?.fasting_glucose?.value != null
                      ? `${medicalInfo.recent_lab_results.fasting_glucose.value} ${medicalInfo.recent_lab_results.fasting_glucose.unit || 'mg/dL'}`
                      : 'No data'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Fasting blood glucose
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (t) => alpha(t.palette.info.main, 0.08),
                    border: (t) => `1px solid ${alpha(t.palette.info.main, 0.2)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: (t) => alpha(t.palette.info.main, 0.12),
                      borderColor: (t) => alpha(t.palette.info.main, 0.3)
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                      HbA1c Level
                    </Typography>
                    <Chip label="3 months" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }} />
                  </Box>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'info.dark' }}>
                    {medicalInfo?.recent_lab_results?.hba1c?.value != null
                      ? `${medicalInfo.recent_lab_results.hba1c.value}${medicalInfo.recent_lab_results.hba1c.unit || '%'}`
                      : 'No data'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    Average blood sugar indicator
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: (t) => alpha(t.palette.warning.main, 0.08),
                    border: (t) => `1px solid ${alpha(t.palette.warning.main, 0.2)}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: (t) => alpha(t.palette.warning.main, 0.12),
                      borderColor: (t) => alpha(t.palette.warning.main, 0.3)
                    }
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Blood Pressure
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'warning.dark' }}>
                    {medicalInfo?.blood_pressure?.systolic && medicalInfo?.blood_pressure?.diastolic
                      ? `${medicalInfo.blood_pressure.systolic}/${medicalInfo.blood_pressure.diastolic}`
                      : 'No data'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    mmHg (Systolic/Diastolic)
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box 
                sx={{ 
                  mt: 2,
                  p: 3,
                  borderRadius: 2,
                  border: (t) => `2px dashed ${alpha(t.palette.divider, 0.3)}`,
                  textAlign: 'center',
                  bgcolor: (t) => alpha(t.palette.action.hover, 0.02)
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <ScienceIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                </Box>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                  Connect Health Device
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 300, mx: 'auto' }}>
                  Link your glucose monitor or health tracker to receive real-time health metrics
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    boxShadow: 1
                  }}
                >
                  Connect Device
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DiagnosedInsightsView;
