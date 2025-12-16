import React, { useState } from 'react';
import { 
  Box, Card, CardContent, Typography, Chip, Grid, Stack, Divider, Paper, 
  LinearProgress, Avatar, IconButton, Collapse, Badge, Tooltip
} from '@mui/material';
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
  const [expandedSessions, setExpandedSessions] = useState({});

  if (!plan) return null;

  const { region, totals, sessions, sources, tips, target_date } = plan;

  const toggleSession = (idx) => {
    setExpandedSessions(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <Box>
      {/* Animated Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(255,255,255,0.2), transparent)',
            borderRadius: '50%',
            animation: 'pulse 3s ease-in-out infinite'
          }
        }}
      >
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.2; }
            50% { transform: scale(1.1); opacity: 0.3; }
          }
        `}</style>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ fontSize: '2rem' }}>💪</Box>
              Your Exercise Plan
              <Box component="span" sx={{ fontSize: '1.5rem' }}>🎯</Box>
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip 
                icon={<PublicIcon />} 
                label={`Region: ${region}`} 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600, borderColor: 'rgba(255,255,255,0.3)' }} 
                variant="outlined" 
              />
              <Chip 
                icon={<Box component="span">📅</Box>} 
                label={new Date(target_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} 
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }} 
              />
            </Stack>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Tooltip title="Completed Sessions">
              <Avatar sx={{ width: 56, height: 56, bgcolor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)' }}>
                <TrophyIcon sx={{ fontSize: 32, color: '#ffd700' }} />
              </Avatar>
            </Tooltip>
          </Box>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        {/* Summary Cards */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            {/* Total Stats Card */}
            <Card 
              elevation={0}
              sx={{ 
                borderRadius: 3, 
                border: '2px solid #e2e8f0',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 24px rgba(102,126,234,0.15)'
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#667eea', width: 40, height: 40 }}>
                    <Box component="span" sx={{ fontSize: '1.5rem' }}>📊</Box>
                  </Avatar>
                  <Typography variant="h6" fontWeight={700}>Quick Summary</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />
                
                <Stack spacing={2}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: '#e3f2fd',
                    border: '1px solid #90caf9',
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: '#bbdefb', transform: 'scale(1.02)' }
                  }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" gap={1}>
                        <FitnessCenterIcon sx={{ color: '#1976d2' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Sessions</Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={800} color="#1976d2">
                        {totals?.sessions_count || 0}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: '#fff3e0',
                    border: '1px solid #ffb74d',
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: '#ffe0b2', transform: 'scale(1.02)' }
                  }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" gap={1}>
                        <TimerIcon sx={{ color: '#f57c00' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Duration</Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={800} color="#f57c00">
                        {totals?.duration_total_min || 0} min
                      </Typography>
                    </Stack>
                  </Box>

                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: '#ffebee',
                    border: '1px solid #ef5350',
                    transition: 'all 0.3s ease',
                    '&:hover': { bgcolor: '#ffcdd2', transform: 'scale(1.02)' }
                  }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" gap={1}>
                        <CaloriesIcon sx={{ color: '#d32f2f' }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>Est. Calories</Typography>
                      </Stack>
                      <Typography variant="h6" fontWeight={800} color="#d32f2f">
                        {Math.round(totals?.calories_total || 0)} kcal
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>

                {/* Progress visualization */}
                <Box sx={{ mt: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">Overall Progress</Typography>
                    <Typography variant="caption" fontWeight={800} color="primary">0%</Typography>
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={0} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 4
                      }
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    🎯 Track your progress as you complete sessions
                  </Typography>
                </Box>
              </CardContent>
            </Card>

            {/* Motivational Card */}
            <Card
              elevation={0}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                p: 2
              }}
            >
              <Stack alignItems="center" spacing={1}>
                <Box component="span" sx={{ fontSize: '3rem' }}>🔥</Box>
                <Typography variant="h6" fontWeight={700} textAlign="center">
                  Let's Get Moving!
                </Typography>
                <Typography variant="body2" textAlign="center" sx={{ opacity: 0.95 }}>
                  Every session brings you closer to your health goals
                </Typography>
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Exercise Sessions */}
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            {sessions?.map((session, idx) => (
              <Card 
                key={idx}
                elevation={0}
                sx={{ 
                  borderRadius: 3,
                  border: '2px solid #e2e8f0',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: '#667eea',
                    boxShadow: '0 8px 20px rgba(102,126,234,0.15)'
                  }
                }}
              >
                <Box 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                  onClick={() => toggleSession(idx)}
                >
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar sx={{ bgcolor: '#667eea', width: 48, height: 48 }}>
                      {getTimeIcon(session.time)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box component="span">{getExerciseEmoji(session.type)}</Box>
                        {session.name}
                        {session.time && <Chip label={session.time} size="small" sx={{ ml: 1, fontWeight: 600 }} />}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Type: {session.type} • {session.items?.length || 0} exercises
                      </Typography>
                    </Box>
                  </Stack>
                  <IconButton 
                    sx={{ 
                      transform: expandedSessions[idx] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </Box>

                <Collapse in={expandedSessions[idx]} timeout="auto">
                  <CardContent sx={{ bgcolor: '#fafbfc' }}>
                    <Stack spacing={2}>
                      {session.items?.map((item, j) => (
                        <Paper
                          key={j}
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: `2px solid ${getIntensityColor(item.intensity)}30`,
                            bgcolor: 'white',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateX(8px)',
                              boxShadow: `0 4px 12px ${getIntensityColor(item.intensity)}40`
                            }
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Box component="span" sx={{ fontSize: '1.5rem' }}>{getExerciseEmoji(item.category)}</Box>
                                {item.exercise}
                              </Typography>
                              
                              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={1}>
                                <Chip 
                                  label={item.category} 
                                  size="small" 
                                  sx={{ 
                                    bgcolor: '#e3f2fd', 
                                    color: '#1976d2',
                                    fontWeight: 600
                                  }} 
                                />
                                <Chip 
                                  label={item.intensity} 
                                  size="small"
                                  sx={{ 
                                    bgcolor: `${getIntensityColor(item.intensity)}20`,
                                    color: getIntensityColor(item.intensity),
                                    fontWeight: 600,
                                    border: `1px solid ${getIntensityColor(item.intensity)}`
                                  }}
                                />
                              </Stack>

                              <Grid container spacing={2} sx={{ mt: 1 }}>
                                <Grid item xs={4}>
                                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#f0f4ff', borderRadius: 2 }}>
                                    <TimerIcon sx={{ color: '#667eea', fontSize: 20 }} />
                                    <Typography variant="caption" display="block" fontWeight={600} color="text.secondary">
                                      Duration
                                    </Typography>
                                    <Typography variant="body2" fontWeight={800} color="#667eea">
                                      {item.duration_min} min
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={4}>
                                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#fff8e1', borderRadius: 2 }}>
                                    <TrendingUpIcon sx={{ color: '#f57c00', fontSize: 20 }} />
                                    <Typography variant="caption" display="block" fontWeight={600} color="text.secondary">
                                      METs
                                    </Typography>
                                    <Typography variant="body2" fontWeight={800} color="#f57c00">
                                      {item.mets ?? 'N/A'}
                                    </Typography>
                                  </Box>
                                </Grid>
                                <Grid item xs={4}>
                                  <Box sx={{ textAlign: 'center', p: 1, bgcolor: '#ffebee', borderRadius: 2 }}>
                                    <CaloriesIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                                    <Typography variant="caption" display="block" fontWeight={600} color="text.secondary">
                                      Calories
                                    </Typography>
                                    <Typography variant="body2" fontWeight={800} color="#d32f2f">
                                      {item.estimated_calories ?? 'N/A'}
                                    </Typography>
                                  </Box>
                                </Grid>
                              </Grid>

                              {item.precautions?.length > 0 && (
                                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff3e0', borderRadius: 2, border: '1px solid #ffb74d' }}>
                                  <Stack direction="row" spacing={1} alignItems="flex-start">
                                    <WarningIcon sx={{ color: '#f57c00', fontSize: 20, mt: 0.3 }} />
                                    <Box>
                                      <Typography variant="caption" fontWeight={700} color="#f57c00" display="block">
                                        ⚠️ Precautions:
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {item.precautions.join(', ')}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </Box>
                              )}
                            </Box>
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </CardContent>
                </Collapse>
              </Card>
            ))}

            {/* Sources Card */}
            {sources?.length > 0 && (
              <Card elevation={0} sx={{ borderRadius: 3, border: '2px solid #e2e8f0' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#4caf50', width: 40, height: 40 }}>
                      <Box component="span" sx={{ fontSize: '1.3rem' }}>📚</Box>
                    </Avatar>
                    <Typography variant="h6" fontWeight={700}>Evidence-Based Sources</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {sources.map((source, i) => (
                      <Chip
                        key={i}
                        icon={<PublicIcon />}
                        label={`${source.title} (${source.country})`}
                        variant="outlined"
                        sx={{
                          borderColor: '#4caf50',
                          color: '#2e7d32',
                          fontWeight: 600,
                          '&:hover': {
                            bgcolor: '#e8f5e9',
                            transform: 'scale(1.05)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}

            {/* Tips Card */}
            {tips?.length > 0 && (
              <Card 
                elevation={0} 
                sx={{ 
                  borderRadius: 3, 
                  border: '2px solid #e2e8f0',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%)'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar sx={{ bgcolor: '#2196f3', width: 40, height: 40 }}>
                      <Box component="span" sx={{ fontSize: '1.3rem' }}>💡</Box>
                    </Avatar>
                    <Typography variant="h6" fontWeight={700}>Pro Tips for Success</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    {tips.map((tip, i) => (
                      <Paper
                        key={i}
                        elevation={0}
                        sx={{
                          p: 2,
                          bgcolor: 'white',
                          borderLeft: '4px solid #2196f3',
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateX(8px)',
                            boxShadow: '0 4px 12px rgba(33,150,243,0.15)'
                          }
                        }}
                      >
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                          <Box component="span" sx={{ fontSize: '1.2rem', flexShrink: 0 }}>✨</Box>
                          <Box component="span" fontWeight={500}>{tip}</Box>
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
