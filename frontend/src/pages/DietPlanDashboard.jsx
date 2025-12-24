// Diet Plan Dashboard - AI-powered meal planning
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';
import DietPlanView from './DietPlanView';

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

const DietPlanDashboard = ({ inModal = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [nutritionProfile, setNutritionProfile] = useState(null);
  const [regionCoverage, setRegionCoverage] = useState(null);
  const [dietHistory, setDietHistory] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Generate date options (today + 5 days)
  const generateDateOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i <= 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      options.push({
        value: date.toISOString().split('T')[0],
        label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        }),
        dateObj: date
      });
    }
    
    return options;
  };

  const dateOptions = generateDateOptions();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Fetch region coverage
      const coverageRes = await axiosInstance.get('/diet-plan/region-coverage');
      setRegionCoverage(coverageRes.data.coverage);

      // Fetch diet plan history
      const historyRes = await axiosInstance.get('/diet-plan/history?limit=10');
      setDietHistory(historyRes.data.plans || []);

      // Try to fetch today's plan
      const today = new Date().toISOString().split('T')[0];
      try {
        const todayRes = await axiosInstance.get(`/diet-plan/date/${today}`);
        if (todayRes.data.plan) {
          setSelectedPlan(todayRes.data.plan);
        }
      } catch (err) {
        // No plan for today - that's okay
      }

    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError(err.response?.data?.error || 'Failed to load diet plan data');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosInstance.post('/diet-plan/generate', {
        target_date: selectedDate
      });

      if (response.data.success) {
        setSuccess('Diet plan generated successfully!');
        setSelectedPlan(response.data.plan);
        setShowGenerator(false);
        
        // Refresh history
        const historyRes = await axiosInstance.get('/diet-plan/history?limit=10');
        setDietHistory(historyRes.data.plans || []);
      }
    } catch (err) {
      console.error('Error generating diet plan:', err);
      setError(err.response?.data?.error || 'Failed to generate diet plan');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewPlan = async (plan) => {
    setSelectedPlan(plan);
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this diet plan?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/diet-plan/${planId}`);
      setSuccess('Diet plan deleted successfully');
      
      // Refresh history
      const historyRes = await axiosInstance.get('/diet-plan/history?limit=10');
      setDietHistory(historyRes.data.plans || []);
      
      // If deleted plan was selected, clear it
      if (selectedPlan?._id === planId) {
        setSelectedPlan(null);
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      setError('Failed to delete diet plan');
    }
  };

  // If a plan is selected, show the detailed view
  if (selectedPlan) {
    return (
      <DietPlanView 
        plan={selectedPlan} 
        onBack={() => setSelectedPlan(null)}
        onDelete={handleDeletePlan}
      />
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: inModal ? 2 : 4, mt: inModal ? 0 : 6, position: 'relative', color: '#0f172a' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 6,
          background: 'radial-gradient(circle at 20% 20%, rgba(16,185,129,0.06), transparent 30%), radial-gradient(circle at 80% 0%, rgba(245,158,11,0.08), transparent 28%), linear-gradient(135deg, #f8fafc 0%, #ecfdf5 50%, #fef3c7 100%)',
          zIndex: -1
        }}
      />

      <Stack spacing={3}>
        {/* Hero Header */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 3, md: 4 },
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            color: '#1f2937',
            position: 'relative',
            overflow: 'hidden',
            border: '1px solid #e5e7eb'
          }}
        >
          <Box sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 85% 20%, rgba(34,197,94,0.08), transparent 35%)' }} />
          {/* Floating food emojis */}
          <Box sx={{ position: 'absolute', top: 20, right: '8%', fontSize: '2.5rem', opacity: 0.15, animation: 'float 3s ease-in-out infinite' }}>🥗</Box>
          <Box sx={{ position: 'absolute', bottom: 30, left: '6%', fontSize: '2rem', opacity: 0.15, animation: 'float 4s ease-in-out infinite', animationDelay: '1s' }}>🍎</Box>
          <Box sx={{ position: 'absolute', top: '40%', right: '3%', fontSize: '2.2rem', opacity: 0.12, animation: 'float 3.5s ease-in-out infinite', animationDelay: '0.5s' }}>🥦</Box>
          <Box sx={{ position: 'absolute', bottom: 20, right: '15%', fontSize: '1.8rem', opacity: 0.15, animation: 'float 4.5s ease-in-out infinite', animationDelay: '1.5s' }}>🥑</Box>
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-15px) rotate(5deg); }
            }
          `}</style>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" gap={2} sx={{ position: 'relative' }}>
            <Box>
              <Typography variant="h4" fontWeight="800" sx={{ letterSpacing: '-0.5px' }}>
                <RestaurantIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1 }} />
                🍽️ Nutrition Coach
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                Personalized meal plans powered by evidence-based dietary guidelines tailored to your region and needs
              </Typography>
              <Stack direction="row" spacing={1} mt={2}>
                {regionCoverage ? (
                  <Chip
                    label={`Region: ${regionCoverage.region} • ${regionCoverage.coverage || 'N/A'}`}
                    sx={{ bgcolor: '#ffffff', color: '#10b981', borderColor: '#d1fae5', fontWeight: 600 }}
                    variant="outlined"
                  />
                ) : null}
                <Chip label={`History: ${dietHistory.length || 0}`} sx={{ bgcolor: '#ffffff', color: '#10b981', fontWeight: 600 }} />
              </Stack>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Button
                variant="contained"
                size="large"
                onClick={() => {
                  setShowGenerator(true);
                  setSelectedDate(dateOptions[0].value);
                }}
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 3.5,
                  py: 1.2,
                  bgcolor: '#10b981',
                  color: '#fff',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Create Diet Plan
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={fetchInitialData}
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  color: '#10b981',
                  borderColor: '#10b981',
                  '&:hover': { borderColor: '#059669', bgcolor: '#f0fdf4' }
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Alerts */}
        {error && (
          <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ borderRadius: 2 }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

      <Grid container spacing={3}>
        {/* Generate New Plan Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ mr: 1 }} />
                Generate New Diet Plan
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Create a personalized meal plan for any day within the next 5 days
              </Typography>

              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => setShowGenerator(true)}
                disabled={!regionCoverage?.canGeneratePlan}
                startIcon={<RestaurantIcon />}
                sx={{
                  bgcolor: '#10b981',
                  color: '#fff',
                  '&:hover': { bgcolor: '#059669' },
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Create Diet Plan
              </Button>

              {!regionCoverage?.canGeneratePlan && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Diet plans are not available for your region yet. Contact support to add regional guidelines.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Diet History Section */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon sx={{ mr: 1 }} />
                Your Diet History
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {dietHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" py={3}>
                  No diet plans yet. Generate your first plan to get started!
                </Typography>
              ) : (
                <Box>
                  {dietHistory.slice(0, 5).map((plan) => (
                    <Paper
                      key={plan._id}
                      elevation={0}
                      sx={{
                        p: 2,
                        mb: 1,
                        border: '1px solid #e0e0e0',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f5f5f5' }
                      }}
                      onClick={() => handleViewPlan(plan)}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {new Date(plan.target_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {plan.total_calories} kcal • {plan.region}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={plan.status}
                          color={plan.status === 'completed' ? 'success' : 'default'}
                          icon={plan.status === 'completed' ? <CheckCircleIcon /> : undefined}
                        />
                      </Stack>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Important Notes */}
      <Card sx={{ mt: 3, bgcolor: '#fff3e0' }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
            Important Notes
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1}>
            <Typography variant="body2">
              • Diet plans are personalized based on your profile and regional dietary guidelines
            </Typography>
            <Typography variant="body2">
              • Plans will adjust based on your glucose levels (when glucose monitoring is enabled)
            </Typography>
            <Typography variant="body2">
              • Only one diet plan can be generated per day
            </Typography>
            <Typography variant="body2">
              • Consult your doctor before making major dietary changes
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Date Selection Dialog */}
      <Dialog open={showGenerator} onClose={() => setShowGenerator(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Generate Diet Plan
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Select a date to generate your personalized meal plan:
          </Typography>
          
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              {dateOptions.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body1">{option.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.dateObj.toLocaleDateString('en-US', { 
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  }
                  sx={{ my: 1, p: 1.5, border: '1px solid #e0e0e0', borderRadius: 1 }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowGenerator(false)} disabled={generating}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleGeneratePlan}
            disabled={!selectedDate || generating}
            startIcon={generating ? <CircularProgress size={20} /> : <RestaurantIcon />}
            sx={{
              bgcolor: '#10b981',
              color: '#fff',
              '&:hover': { bgcolor: '#059669' },
              textTransform: 'none',
              fontWeight: 600
            }}
          >
            {generating ? 'Generating...' : 'Generate Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                <RestaurantIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Your Plans
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {dietHistory.length === 0 ? (
                <Typography variant="body2" color="text.secondary" align="center" py={3}>
                  No diet plans yet. Generate your first plan!
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {dietHistory.slice(0, 4).map((plan) => (
                    <Paper
                      key={plan._id}
                      variant="outlined"
                      onClick={() => handleViewPlan(plan)}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        borderColor: '#e2e8f0',
                        transition: 'all 0.2s',
                        '&:hover': { borderColor: '#10b981', boxShadow: '0 10px 30px rgba(16,185,129,0.15)' }
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography fontWeight={700}>
                            {new Date(plan.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">{plan.total_calories} kcal</Typography>
                        </Box>
                        <Chip label={plan.status} color={plan.status === 'completed' ? 'success' : 'default'} variant="outlined" />
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Stack>
    </Container>
  );
};

export default DietPlanDashboard;
