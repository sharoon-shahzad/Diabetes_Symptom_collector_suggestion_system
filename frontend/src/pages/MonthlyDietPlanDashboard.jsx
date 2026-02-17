// Monthly Diet Plan Dashboard - Premium Professional Design
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  alpha
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  CalendarToday as CalendarIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
  LocalDining as DiningIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import axiosInstance from '../utils/axiosInstance';
import MonthlyDietPlanView from './MonthlyDietPlanView';

// Premium Month Selector Dialog
const MonthSelectorDialog = ({ open, onClose, onGenerate, loading }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 3; i++) {
    years.push(currentYear + i);
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 24px 48px -12px rgba(0,0,0,0.18)',
          border: '1px solid',
          borderColor: 'divider'
        }
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Typography variant="h5" fontWeight={700} sx={{ color: '#1e293b' }}>
          Generate Monthly Plan
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
          Create a personalized diet plan with multiple meal options
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Month</InputLabel>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                label="Month"
                disabled={loading}
                sx={{ borderRadius: 1.5 }}
              >
                {months.map((month, index) => (
                  <MenuItem key={index + 1} value={index + 1}>{month}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                label="Year"
                disabled={loading}
                sx={{ borderRadius: 1.5 }}
              >
                {years.map((year) => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {loading ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                bgcolor: alpha('#10b981', 0.04),
                border: '1px solid',
                borderColor: alpha('#10b981', 0.2),
                borderRadius: 2
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <CircularProgress size={24} sx={{ color: '#10b981' }} />
                  <Box flex={1}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1e293b' }}>
                      Generating your personalized plan
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>
                      This may take 2-3 minutes. Please wait...
                    </Typography>
                  </Box>
                </Stack>
                <LinearProgress 
                  sx={{ 
                    borderRadius: 1, 
                    bgcolor: alpha('#10b981', 0.1),
                    '& .MuiLinearProgress-bar': { bgcolor: '#10b981' }
                  }} 
                />
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Analyzing dietary requirements
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Creating 25 personalized meal options
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    Calculating nutritional values
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                bgcolor: '#f8fafc',
                border: '1px solid',
                borderColor: '#e2e8f0',
                borderRadius: 2
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1e293b', mb: 1.5 }}>
                Plan includes:
              </Typography>
              <Stack spacing={1}>
                {[
                  '5 unique options for each meal type',
                  'Breakfast, lunch, dinner & snacks',
                  'Complete nutritional breakdown',
                  'Personalized to your health profile'
                ].map((item, i) => (
                  <Stack key={i} direction="row" spacing={1} alignItems="center">
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
                    <Typography variant="body2" sx={{ color: '#475569' }}>{item}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: '#64748b',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': { bgcolor: '#f1f5f9' }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={() => onGenerate(selectedMonth, selectedYear)}
          disabled={loading}
          variant="contained"
          sx={{
            bgcolor: '#10b981',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            borderRadius: 1.5,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#059669', boxShadow: 'none' },
            '&:disabled': { bgcolor: alpha('#10b981', 0.5) }
          }}
        >
          {loading ? 'Generating...' : 'Generate Plan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color = '#10b981' }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 2,
      border: '1px solid',
      borderColor: '#e2e8f0',
      bgcolor: '#fff',
      transition: 'all 0.2s',
      '&:hover': { borderColor: color, boxShadow: `0 4px 12px ${alpha(color, 0.1)}` }
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          bgcolor: alpha(color, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon sx={{ color, fontSize: 20 }} />
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="h6" fontWeight={700} sx={{ color: '#1e293b', lineHeight: 1.2 }}>
          {value}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const MonthlyDietPlanDashboard = ({ inModal = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [monthlyPlans, setMonthlyPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchMonthlyPlans();
  }, []);

  const fetchMonthlyPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/monthly-diet-plan/history?limit=12');
      setMonthlyPlans(response.data.plans || []);
    } catch (err) {
      console.error('Error fetching monthly plans:', err);
      setError(err.response?.data?.error || 'Failed to load monthly diet plans');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async (month, year) => {
    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await axiosInstance.post('/monthly-diet-plan/generate', {
        month,
        year
      }, {
        timeout: 300000
      });

      if (response.data.success) {
        setSuccess(`Monthly diet plan for ${getMonthName(month)} ${year} created successfully`);
        setShowGenerator(false);
        await fetchMonthlyPlans();
        if (response.data.plan) {
          setSelectedPlan(response.data.plan);
        }
      }
    } catch (err) {
      console.error('Error generating monthly plan:', err);
      setError(err.response?.data?.error || 'Failed to generate monthly diet plan. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePlan = async (planId, event) => {
    event?.stopPropagation();
    if (!window.confirm('Delete this monthly diet plan?')) return;

    try {
      await axiosInstance.delete(`/monthly-diet-plan/${planId}`);
      setSuccess('Plan deleted successfully');
      await fetchMonthlyPlans();
      if (selectedPlan?._id === planId) setSelectedPlan(null);
    } catch (err) {
      setError('Failed to delete plan');
    }
  };

  const getMonthName = (month) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month - 1];
  };

  const getTotalOptions = (plan) => {
    if (!plan.meal_categories) return 0;
    return plan.meal_categories.reduce((sum, cat) => sum + (cat.options?.length || 0), 0);
  };

  if (selectedPlan) {
    return (
      <MonthlyDietPlanView
        plan={selectedPlan}
        onBack={() => setSelectedPlan(null)}
        onDelete={handleDeletePlan}
      />
    );
  }

  if (loading && monthlyPlans.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress sx={{ color: '#10b981' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: inModal ? 2 : 4, mt: inModal ? 0 : 6 }}>
      <Stack spacing={3}>
        {/* Header Section */}
        <Box>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ color: '#1e293b', mb: 0.5 }}>
                Monthly Diet Plans
              </Typography>
              <Typography variant="body1" sx={{ color: '#64748b' }}>
                Personalized meal options for flexibility throughout the month
              </Typography>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                size="small"
                onClick={fetchMonthlyPlans}
                startIcon={<RefreshIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: '#64748b',
                  borderColor: '#e2e8f0',
                  borderRadius: 1.5,
                  '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' }
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => setShowGenerator(true)}
                startIcon={<AddIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#10b981',
                  borderRadius: 1.5,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#059669', boxShadow: 'none' }
                }}
              >
                New Plan
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Stats Row */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <StatCard 
            icon={CalendarIcon} 
            label="Total Plans" 
            value={monthlyPlans.length} 
            color="#10b981" 
          />
          <StatCard 
            icon={DiningIcon} 
            label="Meal Options" 
            value={monthlyPlans.reduce((sum, p) => sum + getTotalOptions(p), 0)} 
            color="#3b82f6" 
          />
          <StatCard 
            icon={TrendingUpIcon} 
            label="Active Plans" 
            value={monthlyPlans.filter(p => p.status === 'active').length} 
            color="#f59e0b" 
          />
        </Stack>

        {/* Alerts */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ borderRadius: 2 }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert 
            severity="success" 
            sx={{ borderRadius: 2 }} 
            onClose={() => setSuccess(null)}
          >
            {success}
          </Alert>
        )}

        {/* Plans Table */}
        <Card 
          elevation={0} 
          sx={{ 
            border: '1px solid', 
            borderColor: '#e2e8f0', 
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {monthlyPlans.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, px: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  bgcolor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <RestaurantIcon sx={{ fontSize: 32, color: '#94a3b8' }} />
              </Box>
              <Typography variant="h6" fontWeight={600} sx={{ color: '#1e293b', mb: 0.5 }}>
                No monthly plans yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', mb: 3, maxWidth: 400, mx: 'auto' }}>
                Generate your first monthly plan to get personalized meal options for the entire month
              </Typography>
              <Button
                variant="contained"
                onClick={() => setShowGenerator(true)}
                startIcon={<AddIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#10b981',
                  borderRadius: 1.5,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                Create Monthly Plan
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Period</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Region</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Daily Target</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Options</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: '#475569', py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monthlyPlans.map((plan) => (
                    <TableRow
                      key={plan._id}
                      sx={{
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                        '&:hover': { bgcolor: '#f8fafc' },
                        '&:last-child td': { borderBottom: 0 }
                      }}
                      onClick={() => setSelectedPlan(plan)}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: 1,
                              bgcolor: alpha('#10b981', 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <CalendarIcon sx={{ fontSize: 18, color: '#10b981' }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#1e293b' }}>
                              {getMonthName(plan.month)} {plan.year}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                              {new Date(plan.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={plan.region}
                          size="small"
                          sx={{
                            bgcolor: alpha('#3b82f6', 0.1),
                            color: '#3b82f6',
                            fontWeight: 600,
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} sx={{ color: '#1e293b' }}>
                          {plan.total_daily_calories} kcal
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#64748b' }}>
                          {getTotalOptions(plan)} options
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={plan.status === 'active' ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : undefined}
                          label={plan.status}
                          size="small"
                          sx={{
                            bgcolor: plan.status === 'active' ? alpha('#10b981', 0.1) : '#f1f5f9',
                            color: plan.status === 'active' ? '#10b981' : '#64748b',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            fontSize: '0.75rem'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); setSelectedPlan(plan); }}
                              sx={{ color: '#64748b', '&:hover': { color: '#10b981', bgcolor: alpha('#10b981', 0.1) } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={(e) => handleDeletePlan(plan._id, e)}
                              sx={{ color: '#64748b', '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.1) } }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Info Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: '#e2e8f0',
            bgcolor: '#fff'
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1e293b', mb: 2 }}>
            How Monthly Plans Work
          </Typography>
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={3}
            divider={<Divider orientation="vertical" flexItem />}
          >
            {[
              { step: '1', title: 'Generate', desc: 'Create a plan with 5 options per meal type' },
              { step: '2', title: 'Choose', desc: 'Select different options each day for variety' },
              { step: '3', title: 'Track', desc: 'Monitor your nutrition throughout the month' }
            ].map((item) => (
              <Stack key={item.step} direction="row" spacing={2} alignItems="flex-start" flex={1}>
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    bgcolor: '#10b981',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    flexShrink: 0
                  }}
                >
                  {item.step}
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1e293b' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    {item.desc}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Paper>
      </Stack>

      {/* Generation Dialog */}
      <MonthSelectorDialog
        open={showGenerator}
        onClose={() => setShowGenerator(false)}
        onGenerate={handleGeneratePlan}
        loading={generating}
      />
    </Container>
  );
};

export default MonthlyDietPlanDashboard;
