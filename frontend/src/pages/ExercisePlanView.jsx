import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, Chip, Grid, Stack, Divider, Paper, 
  LinearProgress, Avatar, IconButton, Collapse, Badge, Tooltip
} from '@mui/material';
import { useDateFormat } from '../hooks/useDateFormat';
import {
  FitnessCenter as FitnessCenterIcon,
  Timer as TimerIcon,
  LocalFireDepartment as CaloriesIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  WbSunny as MorningIcon,
  NightsStay as EveningIcon,
  WbTwilight as AfternoonIcon,
  Public as PublicIcon,
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Favorite as HeartIcon
} from '@mui/icons-material';

// Helper function to get intensity color
const getIntensityColor = (intensity) => {
  const intensityLower = (intensity || '').toLowerCase();
  if (intensityLower.includes('high') || intensityLower.includes('vigorous')) return '#f44336';
  if (intensityLower.includes('moderate')) return '#ff9800';
  return '#4caf50';
};

// Helper function to get time icon
const getTimeIcon = (time) => {
  const timeLower = (time || '').toLowerCase();
  if (timeLower.includes('morning')) return <MorningIcon sx={{ color: '#ffa726' }} />;
  if (timeLower.includes('afternoon')) return <AfternoonIcon sx={{ color: '#42a5f5' }} />;
  if (timeLower.includes('evening')) return <EveningIcon sx={{ color: '#7e57c2' }} />;
  return <TimerIcon />;
};

// Helper to get exercise emoji by category
const getExerciseEmoji = (category) => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('cardio') || cat.includes('aerobic')) return '🏃';
  if (cat.includes('strength') || cat.includes('resistance')) return '💪';
  if (cat.includes('flexibility') || cat.includes('stretch')) return '🧘';
  if (cat.includes('balance')) return '⚖️';
  if (cat.includes('yoga')) return '🧘‍♀️';
  if (cat.includes('walk')) return '🚶';
  if (cat.includes('swim')) return '🏊';
  if (cat.includes('cycle') || cat.includes('bike')) return '🚴';
  return '🏋️';
};

const ExercisePlanView = ({ plan }) => {
  const { formatDate } = useDateFormat();
  const [expandedSessions, setExpandedSessions] = useState({});

  if (!plan) return null;

  const { region, totals, sessions, sources, tips, target_date } = plan;

  const toggleSession = (idx) => {
    setExpandedSessions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <Box>
      {/* Clean Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          bgcolor: '#ffffff',
          border: '1px solid #e2e8f0'
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 1, color: '#1e293b' }}>
              Your Exercise Plan
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip 
                label={region} 
                size="small"
                sx={{ bgcolor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 500 }} 
              />
              <Chip 
                label={formatDate(target_date)} 
                size="small"
                sx={{ bgcolor: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 500 }} 
              />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        {/* Summary Section - Left Side */}
        <Grid item xs={12} md={7}>
          <Card 
            elevation={0}
            sx={{ 
              borderRadius: 3, 
              border: '1px solid #e2e8f0',
              bgcolor: '#ffffff'
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, mb: 4 }}>Summary</Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 3, borderRadius: 2, bgcolor: '#f0f4ff', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: 2, 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 2
                    }}>
                      <FitnessCenterIcon sx={{ fontSize: 32, color: '#ffffff' }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#1e293b', mb: 0.5 }}>
                      {totals?.sessions_count || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Sessions</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 3, borderRadius: 2, bgcolor: '#fef3f2', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: 2, 
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 2
                    }}>
                      <TimerIcon sx={{ fontSize: 32, color: '#ffffff' }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#1e293b', mb: 0.5 }}>
                      {totals?.duration_total_min || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Minutes</Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Box sx={{ textAlign: 'center', p: 3, borderRadius: 2, bgcolor: '#f0fdfa', minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Box sx={{ 
                      width: 64, 
                      height: 64, 
                      borderRadius: 2, 
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      margin: '0 auto',
                      mb: 2
                    }}>
                      <CaloriesIcon sx={{ fontSize: 28, color: '#ffffff' }} />
                    </Box>
                    <Typography variant="h4" fontWeight={700} sx={{ color: '#1e293b', mb: 0.5 }}>
                      {Math.round(totals?.calories_total || 0)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Calories</Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Progress visualization */}
              <Box sx={{ mt: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="caption" fontWeight={600} sx={{ color: '#64748b' }}>Progress</Typography>
                  <Typography variant="caption" fontWeight={600} sx={{ color: '#667eea' }}>0%</Typography>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={0} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: '#f1f5f9',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 3
                    }
                  }} 
                />
                <Typography variant="caption" sx={{ color: '#64748b', mt: 1, display: 'block' }}>
                  Complete sessions to track progress
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sources Section - Right Side */}
        <Grid item xs={12} md={5}>
          {sources?.length > 0 && (
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 3, 
                border: '1px solid #e2e8f0', 
                bgcolor: '#ffffff',
                position: 'sticky',
                top: 16,
                height: '100%'
              }}
            >
              <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600, mb: 4 }}>Sources</Typography>
                <Divider sx={{ mb: 3 }} />
                <Stack spacing={1.5}>
                  {sources.map((source, i) => (
                    <Box 
                      key={i}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        border: '1px solid #e2e8f0'
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} sx={{ color: '#1e293b', mb: 0.5 }}>
                        {source.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b' }}>
                        {source.country}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Exercise Sessions - Full Width */}
        <Grid item xs={12}>
          <Stack spacing={2}>
            {sessions?.map((session, idx) => {
              const sessionColors = [
                { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: '#667eea' },
                { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', border: '#f093fb' },
                { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', border: '#4facfe' }
              ];
              const colorScheme = sessionColors[idx % sessionColors.length];
              
              return (
              <Card 
                key={idx}
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: `2px solid ${colorScheme.border}30`,
                  overflow: 'hidden',
                  bgcolor: '#ffffff'
                }}
              >
                <Box 
                  sx={{ 
                    p: 2.5, 
                    background: colorScheme.bg,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onClick={() => toggleSession(idx)}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ color: '#ffffff', mb: 0.5 }}>
                        {session.name}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.5}>
                        <Chip 
                          label={session.type} 
                          size="small" 
                          sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 600, height: 24 }} 
                        />
                        {session.time && (
                          <Chip 
                            label={session.time} 
                            size="small" 
                            sx={{ bgcolor: 'rgba(255,255,255,0.25)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 600, height: 24 }} 
                          />
                        )}
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>
                          {session.items?.length || 0} exercises
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <IconButton 
                    size="small"
                    sx={{ 
                      transform: expandedSessions[idx] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      color: '#ffffff',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' }
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </Box>

                <Collapse in={expandedSessions[idx]} timeout="auto">
                  <CardContent sx={{ bgcolor: '#ffffff', p: 2 }}>
                    <Stack spacing={2}>
                      {session.items?.map((item, j) => (
                        <Paper
                          key={j}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: '1px solid #e2e8f0',
                            bgcolor: '#f8fafc'
                          }}
                        >
                          <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1e293b', mb: 1.5 }}>
                            {item.exercise}
                          </Typography>
                          
                          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                            <Chip 
                              label={item.category} 
                              size="small" 
                              sx={{ bgcolor: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 500 }} 
                            />
                            <Chip 
                              label={item.intensity} 
                              size="small"
                              sx={{ 
                                bgcolor: '#ffffff',
                                color: getIntensityColor(item.intensity),
                                border: `1px solid ${getIntensityColor(item.intensity)}`,
                                fontWeight: 500
                              }}
                            />
                            <Chip 
                              label={`${item.duration_min} min`} 
                              size="small" 
                              sx={{ bgcolor: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 500 }} 
                            />
                            {item.mets && (
                              <Chip 
                                label={`${item.mets} METs`} 
                                size="small" 
                                sx={{ bgcolor: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 500 }} 
                              />
                            )}
                            {item.estimated_calories && (
                              <Chip 
                                label={`${item.estimated_calories} kcal`} 
                                size="small" 
                                sx={{ bgcolor: '#ffffff', color: '#64748b', border: '1px solid #e2e8f0', fontWeight: 500 }} 
                              />
                            )}
                          </Stack>

                          {item.precautions?.length > 0 && (
                            <Box sx={{ p: 1.5, bgcolor: '#fffbeb', borderRadius: 2, border: '1px solid #fde68a' }}>
                              <Stack direction="row" spacing={1} alignItems="flex-start">
                                <WarningIcon sx={{ color: '#f59e0b', fontSize: 18, mt: 0.2 }} />
                                <Box>
                                  <Typography variant="caption" fontWeight={600} sx={{ color: '#92400e', display: 'block', mb: 0.5 }}>
                                    Precautions
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#78350f', fontSize: '0.8rem' }}>
                                    {item.precautions.join(', ')}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          )}
                        </Paper>
                      ))}
                    </Stack>
                  </CardContent>
                </Collapse>
              </Card>
              );
            })}

            {/* Tips Card */}
            {tips?.length > 0 && (
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: '#64748b', fontWeight: 600, mb: 2 }}>Tips</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    {tips.map((tip, i) => (
                      <Paper
                        key={i}
                        elevation={0}
                        sx={{
                          p: 1.5,
                          bgcolor: '#f8fafc',
                          borderLeft: '3px solid #1e293b',
                          borderRadius: 1
                        }}
                      >
                        <Typography variant="body2" sx={{ color: '#475569', fontWeight: 500 }}>
                          {tip}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExercisePlanView;
