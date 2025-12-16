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
import axiosInstance from '../utils/axiosInstance';
import ExercisePlanView from './ExercisePlanView';

const StatTile = ({ label, value, accent, icon }) => (
  <Paper
    variant="outlined"
    sx={{
      px: 2,
      py: 1.5,
      borderRadius: 2,
      borderColor: '#e2e8f0',
      background: 'linear-gradient(145deg, #fff 0%, #f8fafc 100%)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: `0 8px 20px ${accent}30`,
        borderColor: accent
      }
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
      {icon && <Box component="span" sx={{ fontSize: '1rem' }}>{icon}</Box>}
      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>{label}</Typography>
    </Box>
    <Typography variant="h6" fontWeight={800} sx={{ color: accent }}>{value}</Typography>
  </Paper>
);

const ExercisePlanDashboard = () => {
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
    <Container maxWidth="lg" sx={{ py: 4, mt: 6, position: 'relative', color: '#0f172a' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 6,
          background: 'radial-gradient(circle at 20% 20%, rgba(79,70,229,0.06), transparent 30%), radial-gradient(circle at 80% 0%, rgba(14,165,233,0.08), transparent 28%), linear-gradient(135deg, #f8fafc 0%, #eef2ff 50%, #e0f2fe 100%)',
          zIndex: -1
        }}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
      ) : (
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              p: { xs: 3, md: 4 },
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 85% 20%, rgba(255,255,255,0.18), transparent 35%)' }} />
            {/* Floating emojis */}
            <Box sx={{ position: 'absolute', top: 20, right: '10%', fontSize: '2rem', opacity: 0.2, animation: 'float 3s ease-in-out infinite' }}>🏋️</Box>
            <Box sx={{ position: 'absolute', bottom: 20, left: '5%', fontSize: '2.5rem', opacity: 0.2, animation: 'float 4s ease-in-out infinite', animationDelay: '1s' }}>🧘</Box>
            <Box sx={{ position: 'absolute', top: '50%', right: '5%', fontSize: '2rem', opacity: 0.15, animation: 'float 3.5s ease-in-out infinite', animationDelay: '0.5s' }}>🎽</Box>
            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-15px); }
              }
            `}</style>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" gap={2} sx={{ position: 'relative' }}>
              <Box>
                <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>💪 Exercise Coach</Typography>
                <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                  Personalized, day-by-day exercise plans tuned to your profile. Generate for the next 5 days and keep track effortlessly.
                </Typography>
                <Stack direction="row" spacing={1} mt={2}>
                  {regionCoverage ? (
                    <Chip
                      label={`Region: ${regionCoverage.region} • ${regionCoverage.coverage}`}
                      sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
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
                    '&:hover': { bgcolor: '#0b1220' }
                  }}
                >
                  Create Exercise Plan
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
                    '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Refresh
                </Button>
              </Stack>
            </Box>
          </Paper>

          {error && <Alert severity="error" sx={{ mb:1, borderRadius: 2 }} onClose={()=>setError(null)}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb:1, borderRadius: 2 }} onClose={()=>setSuccess(null)}>{success}</Alert>}

          {selectedPlan ? (
            <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(15,23,42,0.08)' }}>
              <CardContent>
                <ExercisePlanView plan={selectedPlan} />
              </CardContent>
            </Card>
          ) : (
            <Paper
              variant="outlined"
              sx={{ p: 4, borderRadius: 3, textAlign: 'center', borderColor: '#e2e8f0' }}
            >
              <Typography variant="h6" fontWeight={700}>No plan selected</Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                Generate a plan or pick one from your recent history to preview it here.
              </Typography>
            </Paper>
          )}

          {/* Quick Stats and Recent Plans at the bottom in one line */}
          <Grid container spacing={2} mt={2}>
            <Grid item xs={12} md={6}>
              <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography variant="overline" sx={{ color: '#475569', letterSpacing: 1, fontWeight: 700 }}>📊 Quick Stats</Typography>
                  <Stack direction="row" spacing={2} mt={1}>
                    <StatTile label="Plans" value={history.length || 0} accent="#0ea5e9" icon="📅" />
                    <StatTile label="Region Docs" value={regionCoverage?.documentCount || 0} accent="#6366f1" icon="📚" />
                    <StatTile label="Coverage" value={regionCoverage?.coverage || '—'} accent="#f97316" icon="🌍" />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              {history.length > 0 && (
                <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
                  <CardContent sx={{ py: 2 }}>
                    <Typography variant="overline" sx={{ color: '#475569', letterSpacing: 1, fontWeight: 700, mb: 1, display: 'block' }}>Recent Plans</Typography>
                    <Stack spacing={1}>
                      {history.slice(0,2).map((p, idx) => (
                        <Paper
                          key={idx}
                          variant="outlined"
                          onClick={()=>setSelectedPlan(p)}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            cursor: 'pointer',
                            borderColor: '#e2e8f0',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#6366f1', boxShadow: '0 10px 30px rgba(99,102,241,0.15)' }
                          }}
                        >
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography fontWeight={700} sx={{ fontSize: '0.9rem' }}>
                                {new Date(p.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">Region: {p.region}</Typography>
                            </Box>
                            <Chip label={`${p.totals?.duration_total_min||0} min`} size="small" color="primary" variant="outlined" />
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              )}
            </Grid>
          </Grid>
        </Stack>
      )}

      <Dialog open={showGenerator} onClose={()=>setShowGenerator(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>Create Exercise Plan</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body1" mb={2}>Select a date for your exercise plan:</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {generateDateOptions().map(d => (
              <Chip 
                key={d} 
                label={new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 
                color={selectedDate===d?'primary':'default'} 
                onClick={()=>setSelectedDate(d)}
                clickable
                sx={{ fontWeight: selectedDate===d?'bold':'normal', fontSize: '0.9rem' }}
              />
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={()=>setShowGenerator(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleGenerate} 
            disabled={generating || !selectedDate}
            sx={{ textTransform: 'none', fontWeight: 'bold', px: 3 }}
          >
            {generating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ExercisePlanDashboard;
