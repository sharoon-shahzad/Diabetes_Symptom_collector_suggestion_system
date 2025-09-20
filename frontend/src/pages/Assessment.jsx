import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Tooltip,
  Paper,
  Container,
  Stack,
  Avatar,
  Badge
} from '@mui/material';
import {
  ArrowBack,
  TrendingUp,
  TrendingDown,
  Assessment as AssessmentIcon,
  HealthAndSafety,
  Warning,
  CheckCircle,
  Info,
  Refresh,
  Download,
  Share,
  MoreVert
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import Chart from 'react-apexcharts';
import { assessDiabetesRisk } from '../utils/api';

const Assessment = () => {
  const navigate = useNavigate();
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssessmentData();
  }, []);

  const fetchAssessmentData = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching assessment data...');
      const response = await assessDiabetesRisk();
      console.log('API Response:', response);
      
      // The API returns { success: true, data: { features, result } }
      const result = response?.result || {};
      const features = response?.features || {};
      
      console.log('Result from ML model:', result);
      console.log('Features from ML model:', features);
      
      const symptoms_present = Object.entries(features)
        .filter(([k, v]) => !['Age', 'Gender', 'Obesity'].includes(k) && Number(v) === 1)
        .map(([k]) => k);
      
      const feature_importance = {};
      if (result.feature_importance && typeof result.feature_importance === 'object') {
        Object.entries(result.feature_importance).forEach(([k, v]) => {
          if (v && typeof v === 'object' && typeof v.importance === 'number') {
            feature_importance[k] = v.importance;
          }
        });
      }
      
      const normalized = {
        risk_level: (result.risk_level || 'low').charAt(0).toUpperCase() + (result.risk_level || 'low').slice(1),
        probability: Number(result.diabetes_probability || 0),
        confidence: Number(result.confidence || 0),
        recommendations: result?.recommendations?.general_recommendations || [],
        next_steps: result?.recommendations?.next_steps || [],
        feature_importance,
        symptoms_present,
      };
      
      console.log('Normalized assessment data:', normalized);
      setAssessmentData(normalized);
    } catch (err) {
      console.error('Assessment error:', err);
      setError('Failed to fetch assessment data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk) => {
    if (risk === 'Low') return '#4CAF50';
    if (risk === 'Medium') return '#FF9800';
    return '#F44336';
  };

  const getRiskIcon = (risk) => {
    if (risk === 'Low') return <CheckCircle sx={{ color: '#4CAF50' }} />;
    if (risk === 'Medium') return <Warning sx={{ color: '#FF9800' }} />;
    return <HealthAndSafety sx={{ color: '#F44336' }} />;
  };

  const getRiskGradient = (risk) => {
    if (risk === 'Low') return 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)';
    if (risk === 'Medium') return 'linear-gradient(135deg, #FF9800 0%, #FFB74D 100%)';
    return 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)';
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <AssessmentIcon sx={{ fontSize: 60, color: '#FF6B35' }} />
            </motion.div>
            <Typography variant="h6" sx={{ color: 'white', mt: 2 }}>
              Analyzing your health data...
            </Typography>
          </Box>
        </motion.div>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ maxWidth: 400, background: '#1E1E2E', border: '1px solid #333' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Warning sx={{ fontSize: 60, color: '#F44336', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                Assessment Error
              </Typography>
              <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 3 }}>
                {error}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={fetchAssessmentData}
                sx={{
                  background: '#FF6B35',
                  '&:hover': { background: '#E55A2B' }
                }}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    );
  }

  if (!assessmentData) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ maxWidth: 400, background: '#1E1E2E', border: '1px solid #333' }}>
            <CardContent sx={{ textAlign: 'center', p: 4 }}>
              <Info sx={{ fontSize: 60, color: '#2196F3', mb: 2 }} />
              <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
                No Assessment Data
              </Typography>
              <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 3 }}>
                Please complete the onboarding process first.
              </Typography>
              <Button
                variant="contained"
                startIcon={<ArrowBack />}
                onClick={() => navigate('/onboarding')}
                sx={{
                  background: '#FF6B35',
                  '&:hover': { background: '#E55A2B' }
                }}
              >
                Go to Onboarding
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    );
  }

  const { risk_level, probability, confidence, recommendations, feature_importance, symptoms_present } = assessmentData;

  // Chart configurations
  const gaugeOptions = {
    chart: {
      type: 'radialBar',
      height: 280,
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        track: {
          background: 'rgba(255,255,255,0.1)',
          strokeWidth: '90%',
          margin: 10,
        },
        dataLabels: {
          name: {
            show: false
          },
          value: {
            color: 'white',
            fontSize: '32px',
            fontWeight: 'bold',
            offsetY: -5,
            formatter: function (val) {
              return val + '%'
            }
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'radial',
        shadeIntensity: 0.5,
        gradientToColors: [getRiskColor(risk_level)],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round',
      width: 8
    },
    labels: ['Risk Probability'],
    colors: [getRiskColor(risk_level)]
  };

  const donutOptions = {
    chart: {
      type: 'donut',
      height: 280,
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total Symptoms',
              color: 'white',
              fontSize: '18px',
              fontWeight: 'bold',
              formatter: function (w) {
                return '14'
              }
            },
            value: {
              show: true,
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
              }
            }
          }
        }
      }
    },
    labels: ['Present', 'Absent'],
    colors: ['#FF6B35', 'rgba(255,255,255,0.1)'],
    legend: {
      show: false
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: ['white']
      },
      formatter: function (val, opts) {
        return val.toFixed(0) + '%'
      }
    },
    stroke: {
      width: 0
    }
  };

  const barOptions = {
    chart: {
      type: 'bar',
      height: 280,
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 6,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: true,
      textAnchor: 'start',
      style: {
        colors: ['white'],
        fontSize: '14px',
        fontWeight: 'bold'
      },
      formatter: function (val, opt) {
        return val.toFixed(2)
      },
      offsetX: 10
    },
    xaxis: {
      categories: Object.keys(feature_importance),
      labels: {
        style: {
          colors: 'rgba(255,255,255,0.7)',
          fontSize: '12px'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: 'rgba(255,255,255,0.7)',
          fontSize: '12px'
        }
      }
    },
    grid: {
      borderColor: 'rgba(255,255,255,0.1)',
      xaxis: {
        lines: {
          show: false
        }
      },
      yaxis: {
        lines: {
          show: false
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#FF6B35'],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 100]
      }
    },
    colors: ['#FF6B35']
  };

  const gaugeSeries = [Math.round(probability * 100)];
  const donutSeries = [symptoms_present.length, 14 - symptoms_present.length];
  const barSeries = [{
    name: 'Importance',
    data: Object.values(feature_importance)
  }];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0F0F23 0%, #1A1A2E 50%, #16213E 100%)',
        color: 'white'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: 'rgba(30, 30, 46, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #333',
          p: 2,
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <IconButton
                onClick={() => navigate('/dashboard')}
                sx={{ color: 'white' }}
              >
                <ArrowBack />
              </IconButton>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Dashboard / Assessment
              </Typography>
            </Box>
            <Box />
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Banner under main header */}
        <Card
          elevation={6}
          sx={{
            mb: 3,
            borderRadius: 3,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0d47a1 0%, #152f52 40%, #0b1e36 100%)',
            border: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#ffffff' }}>
                  Diabetes Risk Assessment
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5 }}>
                  Professional, transparent, and trustworthy insights based on your responses
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                  Generated on {new Date().toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Button
                  variant="contained"
                  startIcon={<Download />}
                  sx={{
                    background: '#FF6B35',
                    fontWeight: 700,
                    borderRadius: 2,
                    '&:hover': { background: '#E55A2B' }
                  }}
                >
                  Export Report
                </Button>
                <Tooltip title="Share">
                  <IconButton sx={{ color: '#ffffff' }}>
                    <Share />
                  </IconButton>
                </Tooltip>
                <Tooltip title="More actions">
                  <IconButton sx={{ color: '#ffffff' }}>
                    <MoreVert />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Main Risk Card */}
          <Card
            sx={{
              background: getRiskGradient(risk_level),
              mb: 4,
              border: 'none',
              boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
              borderRadius: 3
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box>
                  <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'white', mb: 1 }}>
                    {Math.round(probability * 100)}%
                  </Typography>
                  <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                    Diabetes Risk Probability
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getRiskIcon(risk_level)}
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                      {risk_level} Risk
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', mb: 1 }}>
                    Confidence Level
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                    {Math.round(confidence * 100)}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={confidence * 100}
                    sx={{
                      mt: 1,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: 'white',
                        borderRadius: 4
                      }
                    }}
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 3,
                    height: '100%',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                        {symptoms_present.length}
                      </Typography>
                      <TrendingUp sx={{ color: '#FF6B35', fontSize: 32 }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 2 }}>
                      Symptoms Present
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(symptoms_present.length / 14) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#2D2D2D',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#FF6B35',
                          borderRadius: 3
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#B0B0B0', mt: 1, display: 'block' }}>
                      Out of 14 total symptoms
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 3,
                    height: '100%',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                        {Math.round(confidence * 100)}%
                      </Typography>
                      <AssessmentIcon sx={{ color: '#4CAF50', fontSize: 32 }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 2 }}>
                      Model Confidence
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={confidence * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#2D2D2D',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#4CAF50',
                          borderRadius: 3
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#B0B0B0', mt: 1, display: 'block' }}>
                      High confidence assessment
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 3,
                    height: '100%',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
                        {recommendations.length}
                      </Typography>
                      <HealthAndSafety sx={{ color: '#2196F3', fontSize: 32 }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#B0B0B0', mb: 2 }}>
                      Recommendations
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: '#2D2D2D',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#2196F3',
                          borderRadius: 3
                        }
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#B0B0B0', mt: 1, display: 'block' }}>
                      Personalized health tips
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card
                  sx={{
                    background: 'linear-gradient(135deg, #FF6B35 0%, #E55A2B 100%)',
                    borderRadius: 3,
                    height: '100%',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 28px rgba(0,0,0,0.28)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                      Pro Health Plan
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2 }}>
                      Get personalized health insights
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        background: 'white',
                        color: '#FF6B35',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.9)'
                        }
                      }}
                    >
                      Upgrade Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Risk Gauge */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 4,
                    height: '100%',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                      Risk Probability
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Chart
                        options={gaugeOptions}
                        series={gaugeSeries}
                        type="radialBar"
                        height={280}
                        width="100%"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Symptoms Donut */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 4,
                    height: '100%',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                      Symptoms Distribution
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <Chart
                        options={donutOptions}
                        series={donutSeries}
                        type="donut"
                        height={280}
                        width="100%"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Feature Importance */}
            <Grid item xs={12} md={4}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
              >
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 4,
                    height: '100%',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 'bold', textAlign: 'center' }}>
                      Feature Importance
                    </Typography>
                    <Box sx={{ height: 280, overflow: 'hidden' }}>
                      <Chart
                        options={barOptions}
                        series={barSeries}
                        type="bar"
                        height={280}
                        width="100%"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Symptoms and Recommendations */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {/* Present Symptoms */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 4,
                    height: '100%',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                        Present Symptoms
                      </Typography>
                      <Chip 
                        label={`${symptoms_present.length} of 14 detected`}
                        sx={{ 
                          background: 'rgba(76, 175, 80, 0.2)', 
                          color: '#4CAF50',
                          border: '1px solid rgba(76, 175, 80, 0.3)',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    {symptoms_present.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {symptoms_present.slice(0, 6).map((symptom, index) => (
                          <motion.div
                            key={symptom}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              p: 2,
                              borderRadius: 2,
                              background: 'rgba(76, 175, 80, 0.08)',
                              border: '1px solid rgba(76, 175, 80, 0.15)',
                              '&:hover': {
                                background: 'rgba(76, 175, 80, 0.12)',
                                transform: 'translateY(-1px)',
                                transition: 'all 0.2s ease'
                              }
                            }}>
                              <CheckCircle sx={{ color: '#4CAF50', fontSize: 18, mr: 2 }} />
                              <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                                {symptom}
                              </Typography>
                            </Box>
                          </motion.div>
                        ))}
                        {symptoms_present.length > 6 && (
                          <Typography variant="caption" sx={{ 
                            color: 'rgba(255,255,255,0.6)', 
                            textAlign: 'center', 
                            mt: 1,
                            fontStyle: 'italic'
                          }}>
                            +{symptoms_present.length - 6} more symptoms
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        textAlign: 'center',
                        py: 6
                      }}>
                        <CheckCircle sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 40, mb: 2 }} />
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                          No symptoms detected
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          Great news! No diabetes symptoms were identified.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Recommendations */}
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <Card
                  sx={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 4,
                    height: '100%',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                      <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
                        Recommendations
                      </Typography>
                      <Chip 
                        label={`${recommendations.length} personalized tips`}
                        sx={{ 
                          background: 'rgba(33, 150, 243, 0.2)', 
                          color: '#2196F3',
                          border: '1px solid rgba(33, 150, 243, 0.3)',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                    {recommendations.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                        {recommendations.slice(0, 5).map((rec, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'flex-start', 
                              p: 2.5,
                              borderRadius: 2,
                              background: 'rgba(33, 150, 243, 0.08)',
                              border: '1px solid rgba(33, 150, 243, 0.15)',
                              '&:hover': {
                                background: 'rgba(33, 150, 243, 0.12)',
                                transform: 'translateY(-1px)',
                                transition: 'all 0.2s ease'
                              }
                            }}>
                              <Box sx={{ 
                                width: 24, 
                                height: 24, 
                                borderRadius: '50%', 
                                background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                                mt: 0.5,
                                flexShrink: 0
                              }}>
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.75rem' }}>
                                  {index + 1}
                                </Typography>
                              </Box>
                              <Typography variant="body2" sx={{ 
                                color: 'white', 
                                fontWeight: 500,
                                lineHeight: 1.5
                              }}>
                                {rec}
                              </Typography>
                            </Box>
                          </motion.div>
                        ))}
                        {recommendations.length > 5 && (
                          <Typography variant="caption" sx={{ 
                            color: 'rgba(255,255,255,0.6)', 
                            textAlign: 'center', 
                            mt: 1,
                            fontStyle: 'italic'
                          }}>
                            +{recommendations.length - 5} more recommendations
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        textAlign: 'center',
                        py: 6
                      }}>
                        <Info sx={{ color: 'rgba(255,255,255,0.3)', fontSize: 40, mb: 2 }} />
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                          No specific recommendations
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          Continue maintaining a healthy lifestyle and regular check-ups.
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Assessment;