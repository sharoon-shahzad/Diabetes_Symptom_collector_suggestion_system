import React, { useState, useEffect } from 'react';
import { useDateFormat } from '../hooks/useDateFormat';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Card,
  CardContent,
  Button,
  Stack,
  Typography,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance.js';
import LifestyleTipsView from './LifestyleTipsView.jsx';

const categoryConfig = {
  sleep_hygiene: { icon: '💤', color: '#6366f1', name: 'Sleep Hygiene' },
  stress_management: { icon: '🧘', color: '#8b5cf6', name: 'Stress Management' },
  hydration: { icon: '💧', color: '#06b6d4', name: 'Hydration' },
  blood_sugar_monitoring: { icon: '📊', color: '#f59e0b', name: 'Blood Sugar Monitoring' },
  medication_adherence: { icon: '💊', color: '#10b981', name: 'Medication Adherence' },
  foot_care: { icon: '🦶', color: '#ec4899', name: 'Foot Care' },
  dental_health: { icon: '🪥', color: '#14b8a6', name: 'Dental Health' },
  social_support: { icon: '💝', color: '#f43f5e', name: 'Social Support' },
};

const LifestyleTipsDashboard = ({ inModal = false }) => {
  const { formatDate } = useDateFormat();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [regionCoverage, setRegionCoverage] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedTips, setSelectedTips] = useState(null);
  const [viewingHistoryTips, setViewingHistoryTips] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState({ totalTips: 0, completionRate: 0, streakDays: 0 });

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    try {
      setLoading(true);
      const [coverageRes, historyRes, statsRes] = await Promise.all([
        axiosInstance.get('/lifestyle-tips/region-coverage'),
        axiosInstance.get('/lifestyle-tips/history?limit=10'),
        axiosInstance.get('/lifestyle-tips/stats'),
      ]);

      setRegionCoverage(coverageRes.data.coverage || {});
      setHistory(historyRes.data.history || []);
      setStats(statsRes.data.stats || {});

      // Try to load today's tips
      try {
        const currentRes = await axiosInstance.get('/lifestyle-tips/current');
        setSelectedTips(currentRes.data.tips);
      } catch (e) {
        // No tips for today is OK
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tips');
    } finally {
      setLoading(false);
    }
  };

  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      options.push(date.toISOString().split('T')[0]);
    }
    return options;
  };

  const handleGenerateTips = async () => {
    if (!selectedDate) return;

    try {
      setGenerating(true);
      setError(null);
      setSuccess(null);

      const response = await axiosInstance.post('/lifestyle-tips/generate', {
        target_date: selectedDate,
      });

      setSelectedTips(response.data.tips);
      const emailMessage = response.data.emailSent ? ' A copy has been sent to your email.' : '';
      setSuccess('Lifestyle tips generated successfully!' + emailMessage);
      setShowGenerator(false);

      // Refresh history
      const historyRes = await axiosInstance.get('/lifestyle-tips/history?limit=10');
      setHistory(historyRes.data.history || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate tips');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafb',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            p: 4,
            mb: 3,
            color: '#ffffff',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" gap={3}>
            <Box flex={1}>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                Lifestyle Wellness Coach
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.95, mb: 2 }}>
                Daily habits and personalized tips for better diabetes management
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {regionCoverage && (
                  <Chip
                    label={`${regionCoverage.region} • ${regionCoverage.coverage}`}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      fontWeight: 600,
                      backdropFilter: 'blur(10px)'
                    }}
                  />
                )}
                <Chip 
                  label={`${history.length || 0} Tips Generated`} 
                  sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    color: '#ffffff', 
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)'
                  }} 
                />
              </Stack>
            </Box>
            <Stack direction={{ xs: 'row', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  setShowGenerator(true);
                  setSelectedDate(generateDateOptions()[0]);
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.2,
                  bgcolor: '#ffffff',
                  color: '#667eea',
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  '&:hover': { 
                    bgcolor: '#f8f9fa',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)'
                  },
                }}
              >
                Generate Tips
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={fetchInitial}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#ffffff',
                  borderColor: 'rgba(255,255,255,0.5)',
                  borderRadius: 2,
                  '&:hover': { 
                    borderColor: '#ffffff', 
                    bgcolor: 'rgba(255,255,255,0.15)'
                  },
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {selectedTips ? (
          // Show Tips Details
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3, bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b' }}>
                  Today's Wellness Tips
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setViewingHistoryTips(selectedTips)}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.25)'
                  }}
                >
                  View Details
                </Button>
              </Box>

              <Grid container spacing={2}>
                {selectedTips.categories?.slice(0, 4).map((category, idx) => (
                  <Grid item xs={12} sm={6} md={3} key={idx}>
                    <Box
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        bgcolor: `${categoryConfig[category.name]?.color || '#667eea'}15`,
                        border: '1px solid',
                        borderColor: `${categoryConfig[category.name]?.color || '#667eea'}30`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: categoryConfig[category.name]?.color || '#667eea',
                          boxShadow: `0 4px 12px ${categoryConfig[category.name]?.color || '#667eea'}25`,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 1, color: '#1e293b' }}>
                        {categoryConfig[category.name]?.icon} {categoryConfig[category.name]?.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
                        {category.tips?.length || 0} tips available
                      </Typography>
                      <Box sx={{ mt: 1.5, height: 6, borderRadius: 3, bgcolor: '#e2e8f0', overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: '100%',
                            bgcolor: categoryConfig[category.name]?.color || '#8b5cf6',
                            width: `${((category.tips?.filter(t => t.completed).length || 0) / (category.tips?.length || 1)) * 100}%`,
                            transition: 'width 0.3s ease',
                            borderRadius: 3
                          }}
                        />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        ) : (
          <Paper
            elevation={0}
            sx={{ 
              p: 5, 
              borderRadius: 3, 
              textAlign: 'center', 
              border: '2px dashed #cbd5e1', 
              mb: 3,
              bgcolor: '#f8fafb'
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b', mb: 1 }}>
              No Tips Generated Yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748b' }}>
              Click "Generate Tips" to create personalized wellness recommendations
            </Typography>
          </Paper>
        )}

        {/* Recent History */}
        {history.length > 0 && (
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={3} sx={{ color: '#1e293b' }}>
                Recent Tips History
              </Typography>
              <Stack spacing={2}>
                {history.slice(0, 5).map((tips, idx) => {
                  const total = tips.categories?.reduce((sum, cat) => sum + (cat.tips?.length || 0), 0) || 0;

                  return (
                    <Box
                      key={idx}
                      onClick={() => setViewingHistoryTips(tips)}
                      sx={{
                        p: 2.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        bgcolor: '#f8fafb',
                        border: '1px solid #e2e8f0',
                        transition: 'all 0.2s ease',
                        '&:hover': { 
                          borderColor: '#667eea', 
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                          transform: 'translateY(-2px)'
                        },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography fontWeight={700} sx={{ color: '#1e293b', mb: 0.5 }}>
                            {formatDate(tips.target_date)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                            {tips.region}
                          </Typography>
                        </Box>
                        <Chip 
                          label={`${total} tips`} 
                          sx={{
                            bgcolor: '#667eea',
                            color: '#ffffff',
                            fontWeight: 600
                          }}
                        />
                      </Stack>
                    </Box>
                  );
                })}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Generate Modal */}
      {showGenerator && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1300,
          }}
          onClick={() => setShowGenerator(false)}
        >
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              maxWidth: 400,
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Typography variant="h6" fontWeight={700} mb={2}>
              Generate Lifestyle Tips
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Select a date for your lifestyle tips:
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={3}>
              {generateDateOptions().map((d) => (
                <Chip
                  key={d}
                  label={formatDate(d, 'DD MMMM')}
                  color={selectedDate === d ? 'primary' : 'default'}
                  onClick={() => setSelectedDate(d)}
                  clickable
                  sx={{ fontWeight: selectedDate === d ? 'bold' : 'normal' }}
                />
              ))}
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerateTips}
                disabled={generating}
                sx={{ textTransform: 'none', fontWeight: 'bold' }}
              >
                {generating ? 'Generating...' : 'Generate'}
              </Button>
              <Button fullWidth variant="outlined" onClick={() => setShowGenerator(false)}>
                Cancel
              </Button>
            </Stack>
          </Paper>
        </Box>
      )}

      {/* History Tips View Dialog */}
      <Dialog
        open={Boolean(viewingHistoryTips)}
        onClose={() => setViewingHistoryTips(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        {viewingHistoryTips && (
          <LifestyleTipsView
            tips={viewingHistoryTips}
            onBack={() => setViewingHistoryTips(null)}
            onDelete={async (id) => {
              try {
                await axiosInstance.delete(`/lifestyle-tips/${id}`);
                setViewingHistoryTips(null);
                fetchInitial();
              } catch (err) {
                console.error('Error deleting tips:', err);
              }
            }}
          />
        )}
      </Dialog>
    </Box>
  );
};

export default LifestyleTipsDashboard;
