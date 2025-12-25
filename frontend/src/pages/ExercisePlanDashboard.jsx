import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import {
  FitnessCenter as FitnessCenterIcon,
  Public as PublicIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';
import ExercisePlanView from './ExercisePlanView';

const StatTile = ({ label, value, accent }) => (
  <Paper
    variant="outlined"
    sx={{
      px: 2,
      py: 1.5,
      borderRadius: 2,
      borderColor: '#e2e8f0',
      bgcolor: '#ffffff',
      transition: 'all 0.2s ease',
      '&:hover': {
        borderColor: accent,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }
    }}
  >
    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, display: 'block', mb: 0.5 }}>{label}</Typography>
    <Typography variant="h6" fontWeight={700} sx={{ color: accent }}>{value}</Typography>
  </Paper>
);

const ExercisePlanDashboard = ({ inModal = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [regionCoverage, setRegionCoverage] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => { fetchInitial(); }, []);

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const coverageRes = await axiosInstance.get('/exercise-plan/region-coverage');
      setRegionCoverage(coverageRes.data.coverage);
      const historyRes = await axiosInstance.get('/exercise-plan/history?limit=10');
      const plans = historyRes.data.plans || [];
      setHistory(plans);
      if (plans.length > 0) setSelectedPlan(plans[0]);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load exercise plan data');
    } finally { setLoading(false); }
  };

  const generateDateOptions = () => {
    const dates = []; const start = new Date(); start.setHours(0,0,0,0);
    for (let i=0;i<=5;i++){ const d=new Date(start); d.setDate(start.getDate()+i); dates.push(d.toISOString().split('T')[0]); }
    return dates;
  };

  const handleGenerate = async () => {
    if (!selectedDate) { setError('Please select a date'); return; }
    setGenerating(true); setError(null); setSuccess(null);
    try {
      const res = await axiosInstance.post('/exercise-plan/generate', { target_date: selectedDate });
      if (res.data.success) {
        setSuccess('Exercise plan generated successfully!');
        setSelectedPlan(res.data.plan);
        setShowGenerator(false);
        const historyRes = await axiosInstance.get('/exercise-plan/history?limit=10');
        setHistory(historyRes.data.plans || []);
      }
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.error || err.message || 'Failed to generate exercise plan';
      if (status === 409) {
        setError('An exercise plan for this date already exists. Open it from History or pick another date.');
      } else if (status === 400) {
        setError(msg.includes('profile') ? 'Please complete Personal Info in onboarding before generating an exercise plan.' : msg);
      } else if (status === 404) {
        setError('Regional guidance not available right now. Using global WHO context may help; please try again.');
      } else if (status === 401) {
        setError('You are signed out. Please sign in again to generate a plan.');
      } else if (status === 503) {
        setError('AI generator is unavailable or timed out. Please ensure LM Studio is running, then try again.');
      } else {
        setError(msg);
      }
    } finally { setGenerating(false); }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: inModal ? 0 : 6, color: '#0f172a' }}>

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : (
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'absolute', top: -20, right: -20, width: 150, height: 150, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" gap={2} sx={{ position: 'relative' }}>
              <Box>
                <Typography variant="h5" fontWeight="700" sx={{ color: '#ffffff', mb: 0.5 }}>Exercise Plans</Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                  Personalized exercise plans tailored to your health profile
                </Typography>
                <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" gap={1}>
                  {regionCoverage ? (
                    <Chip
                      label={`${regionCoverage.region} • ${regionCoverage.coverage}`}
                      size="small"
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 600 }}
                    />
                  ) : null}
                  <Chip 
                    label={`${history.length || 0} Plans`} 
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', fontWeight: 600 }} 
                  />
                </Stack>
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Button
                  variant="contained"
                  size="medium"
                  onClick={() => {
                    setShowGenerator(true);
                    setSelectedDate(generateDateOptions()[0]);
                  }}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    bgcolor: '#ffffff',
                    color: '#667eea',
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#f8f9ff' }
                  }}
                >
                  Create Plan
                </Button>
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={fetchInitial}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    color: '#ffffff',
                    borderColor: 'rgba(255,255,255,0.3)',
                    borderRadius: 2,
                    '&:hover': { borderColor: 'rgba(255,255,255,0.5)', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Refresh
                </Button>
              </Stack>
            </Box>
          </Paper>

          {error && <Alert severity="error" sx={{ mb: 1, borderRadius: 2 }} onClose={() => setError(null)}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 1, borderRadius: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}

          {/* Recent Plans - Column View */}
          {history.length > 0 && (
            <Box>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#1e293b', mb: 2 }}>Recent Plans</Typography>
              <Grid container spacing={2}>
                {history.slice(0, 3).map((p, idx) => (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Card
                      onClick={() => setSelectedPlan(p)}
                      sx={{
                        borderRadius: 3,
                        border: '1px solid #e2e8f0',
                        cursor: 'pointer',
                        bgcolor: '#ffffff',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 24px rgba(102,126,234,0.15)',
                          borderColor: '#667eea'
                        }
                      }}
                    >
                      <CardContent>
                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto',
                              mb: 1
                            }}
                          >
                            <Typography variant="h6" fontWeight="700" sx={{ color: '#ffffff' }}>
                              {new Date(p.target_date).getDate()}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b' }}>
                            {new Date(p.target_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', year: 'numeric' })}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>Region</Typography>
                            <Chip label={p.region} size="small" sx={{ bgcolor: '#f0f4ff', color: '#667eea', fontWeight: 600, height: 20 }} />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>Duration</Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b' }}>
                              {p.totals?.duration_total_min || 0} min
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>Sessions</Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b' }}>
                              {p.totals?.sessions_count || 0}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {selectedPlan ? (
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#ffffff' }}>
              <CardContent>
                <ExercisePlanView plan={selectedPlan} />
              </CardContent>
            </Card>
          ) : (
            <Paper
              variant="outlined"
              sx={{ p: 4, borderRadius: 3, textAlign: 'center', borderColor: '#e2e8f0', bgcolor: '#ffffff' }}
            >
              <Typography variant="h6" fontWeight={600} sx={{ color: '#1e293b' }}>No plan selected</Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mt: 1 }}>
                Generate a plan or select one from your history to view details
              </Typography>
            </Paper>
          )}

        </Stack>
      )}

      <Dialog open={showGenerator} onClose={()=>setShowGenerator(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: '#1e293b', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)', borderBottom: '1px solid #e2e8f0' }}>Create Exercise Plan</DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography variant="body2" sx={{ color: '#64748b', mb: 2 }}>Select a date for your exercise plan:</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {generateDateOptions().map(d => (
              <Chip 
                key={d} 
                label={new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                onClick={()=>setSelectedDate(d)}
                clickable
                sx={{ 
                  fontWeight: 600,
                  bgcolor: selectedDate===d ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8fafc',
                  background: selectedDate===d ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8fafc',
                  color: selectedDate===d ? '#fff' : '#64748b',
                  border: '1px solid',
                  borderColor: selectedDate===d ? '#667eea' : '#e2e8f0',
                  '&:hover': {
                    background: selectedDate===d ? 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)' : '#f1f5f9',
                    borderColor: selectedDate===d ? '#5568d3' : '#cbd5e1'
                  }
                }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, background: '#f8fafc' }}>
          <Button 
            onClick={()=>setShowGenerator(false)} 
            sx={{ textTransform: 'none', color: '#64748b', fontWeight: 500 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleGenerate} 
            disabled={generating || !selectedDate}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 600, 
              px: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a3f91 100%)' },
              '&:disabled': { background: '#e2e8f0', color: '#94a3b8' }
            }}
          >
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExercisePlanDashboard;
