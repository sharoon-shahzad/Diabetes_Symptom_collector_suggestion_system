import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import axiosInstance from '../utils/axiosInstance.js';

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

const StatTile = ({ label, value, accent, icon }) => (
  <Box
    sx={{
      flex: 1,
      textAlign: 'center',
      py: 2,
      px: 1.5,
      bgcolor: '#f8fafc',
      borderRadius: 2,
      border: `2px solid ${accent}20`,
      transition: 'all 0.3s ease',
      '&:hover': {
        borderColor: accent,
        boxShadow: `0 8px 20px ${accent}20`,
        transform: 'translateY(-4px)',
      },
    }}
  >
    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600, mb: 0.5 }}>
      {icon} {label}
    </Typography>
    <Typography variant="h5" fontWeight="bold" sx={{ color: accent }}>
      {value}
    </Typography>
  </Box>
);

const LifestyleTipsDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [regionCoverage, setRegionCoverage] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedTips, setSelectedTips] = useState(null);
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
      setSuccess('Lifestyle tips generated successfully!');
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
        background: 'linear-gradient(135deg, #f8fafc 0%, #f3e8ff 50%, #fae8ff 100%)',
        py: 5,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '400px',
          background: 'radial-gradient(circle at 20% 10%, rgba(139,92,246,0.08), transparent 40%), radial-gradient(circle at 80% 20%, rgba(6,182,212,0.08), transparent 40%)',
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 50%, #c084fc 100%)',
            borderRadius: 4,
            p: 4,
            mb: 4,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              right: 0,
              width: '300px',
              height: '300px',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1), transparent)',
              borderRadius: '50%',
              transform: 'translate(100px, -100px)',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" gap={2}>
              <Box>
                <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
                  🌟 Lifestyle Wellness Coach
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Daily habits and personalized tips for better diabetes management. Get daily recommendations tailored to your lifestyle.
                </Typography>
                <Stack direction="row" spacing={1} mt={2}>
                  {regionCoverage ? (
                    <Chip
                      label={`Region: ${regionCoverage.region} • ${regionCoverage.coverage}`}
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.16)',
                        color: '#fff',
                        borderColor: 'rgba(255,255,255,0.3)',
                      }}
                      variant="outlined"
                    />
                  ) : null}
                  <Chip label={`History: ${history.length || 0}`} sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff' }} />
                </Stack>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    setShowGenerator(true);
                    setSelectedDate(generateDateOptions()[0]);
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    px: 3.5,
                    py: 1.2,
                    bgcolor: '#0f172a',
                    '&:hover': { bgcolor: '#0b1220' },
                  }}
                >
                  Generate Daily Tips
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={fetchInitial}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 'bold',
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.5)',
                    '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Refresh
                </Button>
              </Stack>
            </Box>
          </Box>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Quick Stats */}
        <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
          <CardContent>
            <Typography variant="overline" sx={{ color: '#475569', letterSpacing: 1, fontWeight: 700, mb: 2, display: 'block' }}>
              📊 Quick Stats
            </Typography>
            <Stack direction="row" spacing={2}>
              <StatTile label="Total Tips" value={stats.totalTips || 0} accent="#8b5cf6" icon="📋" />
              <StatTile label="Completion" value={`${stats.completionRate || 0}%`} accent="#10b981" icon="✓" />
              <StatTile label="Streak" value={`${stats.streakDays || 0}d`} accent="#f59e0b" icon="🔥" />
            </Stack>
          </CardContent>
        </Card>

        {selectedTips ? (
          // Show Tips Details
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={700}>
                  📅 Today's Tips
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => navigate(`/personalized-suggestions/lifestyle-tips-view/${selectedTips._id}`)}
                >
                  View Details
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {selectedTips.categories?.slice(0, 4).map((category, idx) => (
                  <Grid item xs={12} sm={6} md={3} key={idx}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        borderColor: `${categoryConfig[category.name]?.color || '#e2e8f0'}30`,
                        bgcolor: `${categoryConfig[category.name]?.color || '#e2e8f0'}08`,
                      }}
                    >
                      <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
                        {categoryConfig[category.name]?.icon} {categoryConfig[category.name]?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {category.tips?.length || 0} tips
                      </Typography>
                      <Box sx={{ mt: 1, height: 4, borderRadius: 2, bgcolor: '#e2e8f0', overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: '100%',
                            bgcolor: categoryConfig[category.name]?.color || '#8b5cf6',
                            width: `${((category.tips?.filter(t => t.completed).length || 0) / (category.tips?.length || 1)) * 100}%`,
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        ) : (
          <Paper
            variant="outlined"
            sx={{ p: 4, borderRadius: 3, textAlign: 'center', borderColor: '#e2e8f0', mb: 3 }}
          >
            <Typography variant="h6" fontWeight={700}>
              No tips generated for today
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              Click "Generate Daily Tips" to create personalized tips for today.
            </Typography>
          </Paper>
        )}

        {/* Recent History */}
        {history.length > 0 && (
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                📜 Recent Tips History
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                {history.slice(0, 5).map((tips, idx) => {
                  const completed = tips.categories?.reduce(
                    (sum, cat) => sum + (cat.tips?.filter(t => t.completed).length || 0),
                    0
                  ) || 0;
                  const total = tips.categories?.reduce((sum, cat) => sum + (cat.tips?.length || 0), 0) || 0;

                  return (
                    <Paper
                      key={idx}
                      variant="outlined"
                      onClick={() => navigate(`/personalized-suggestions/lifestyle-tips-view/${tips._id}`)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: 'pointer',
                        borderColor: '#e2e8f0',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#8b5cf6', boxShadow: '0 10px 30px rgba(139,92,246,0.15)' },
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography fontWeight={700}>
                            {new Date(tips.target_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Region: {tips.region}
                          </Typography>
                        </Box>
                        <Chip label={`${completed}/${total} completed`} color="primary" variant="outlined" />
                      </Stack>
                    </Paper>
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
                  label={new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
    </Box>
  );
};

export default LifestyleTipsDashboard;
