import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Checkbox,
  Collapse,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Grid,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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

const PriorityChip = ({ priority }) => {
  const colors = {
    high: { bg: '#fee2e2', text: '#dc2626' },
    medium: { bg: '#fef3c7', text: '#d97706' },
    low: { bg: '#dbeafe', text: '#2563eb' },
  };

  return (
    <Chip
      label={priority.toUpperCase()}
      size="small"
      sx={{
        bgcolor: colors[priority]?.bg || colors.medium.bg,
        color: colors[priority]?.text || colors.medium.text,
        fontWeight: 600,
      }}
    />
  );
};

const LifestyleTipsView = ({ tips: propsTips, onBack: propsOnBack, onDelete: propsOnDelete }) => {
  const { tipsId } = useParams();
  const navigate = useNavigate();
  const [tips, setTips] = useState(propsTips || null);
  const [loading, setLoading] = useState(!propsTips);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    // If tips are provided via props, use them
    if (propsTips) {
      setTips(propsTips);
      setLoading(false);
      // Initialize expanded categories
      const expanded = {};
      propsTips.categories?.forEach((cat, idx) => {
        expanded[idx] = true;
      });
      setExpandedCategories(expanded);
    } else if (tipsId) {
      // Otherwise fetch from API
      fetchTips();
    }
  }, [tipsId, propsTips]);

  const fetchTips = async () => {
    try {
      setLoading(true);
      // For now, we'll fetch from history - ideally we'd have a GET /:tipsId endpoint
      const response = await axiosInstance.get(`/lifestyle-tips/history?limit=100`);
      const found = response.data.history?.find((h) => h._id === tipsId);
      if (found) {
        setTips(found);
        // Initialize expanded categories
        const expanded = {};
        found.categories?.forEach((cat, idx) => {
          expanded[idx] = true;
        });
        setExpandedCategories(expanded);
      } else {
        setError('Tips not found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tips');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (index) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleChecklistToggle = async (index, completed) => {
    try {
      setUpdating(true);
      const id = propsTips?._id || tipsId;
      await axiosInstance.put(`/lifestyle-tips/${id}/checklist`, {
        taskIndex: index,
        completed: !completed,
      });

      // Update local state
      setTips((prev) => {
        const updated = { ...prev };
        updated.daily_checklist[index].completed = !completed;
        return updated;
      });
      setSuccess('Checklist item updated!');
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update checklist');
    } finally {
      setUpdating(false);
    }
  };

  const handleTipToggle = async (catIndex, tipIndex, completed) => {
    try {
      setUpdating(true);
      const id = propsTips?._id || tipsId;
      await axiosInstance.put(`/lifestyle-tips/${id}/category/${catIndex}/tip/${tipIndex}`, {
        completed: !completed,
      });

      // Update local state
      setTips((prev) => {
        const updated = { ...prev };
        updated.categories[catIndex].tips[tipIndex].completed = !completed;
        return updated;
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update tip');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete these tips?')) return;

    try {
      const id = propsTips?._id || tipsId;
      
      if (propsOnDelete) {
        // Use callback provided via props
        await propsOnDelete(id);
      } else {
        // Default behavior - delete and navigate
        await axiosInstance.delete(`/lifestyle-tips/${id}`);
        setSuccess('Tips deleted successfully!');
        setTimeout(() => navigate('/personalized-suggestions/lifestyle-tips'), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete tips');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!tips) {
    return (
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Alert severity="error">{error || 'Tips not found'}</Alert>
        <Button onClick={() => propsOnBack ? propsOnBack() : navigate(-1)} sx={{ mt: 2 }}>
          Go Back
        </Button>
      </Container>
    );
  }

  const totalTips = tips.categories?.reduce((sum, cat) => sum + (cat.tips?.length || 0), 0) || 0;
  const completedTips = tips.categories?.reduce(
    (sum, cat) => sum + (cat.tips?.filter((t) => t.completed).length || 0),
    0
  ) || 0;
  const checklistCompleted = tips.daily_checklist?.filter((task) => task.completed).length || 0;

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
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconButton onClick={() => propsOnBack ? propsOnBack() : navigate(-1)} size="large">
            <ArrowBackIcon />
          </IconButton>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={700}>
              🌟 Lifestyle Tips
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {new Date(tips.target_date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
              • Region: {tips.region}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            size="small"
          >
            Delete
          </Button>
        </Box>

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

        {/* Personalized Insights */}
        {tips.personalized_insights?.length > 0 && (
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3, bgcolor: '#f8f5ff' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2} sx={{ color: '#8b5cf6' }}>
                💡 Personalized Insights
              </Typography>
              <Stack spacing={1.5}>
                {tips.personalized_insights.map((insight, idx) => (
                  <Typography key={idx} variant="body2">
                    • {insight}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Progress Overview */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                Tips Completion
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#8b5cf6', mb: 1 }}>
                {completedTips}/{totalTips}
              </Typography>
              <Box sx={{ height: 6, borderRadius: 3, bgcolor: '#e0e0e0', overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    bgcolor: '#8b5cf6',
                    width: `${totalTips > 0 ? (completedTips / totalTips) * 100 : 0}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                Daily Checklist
              </Typography>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#10b981', mb: 1 }}>
                {checklistCompleted}/{tips.daily_checklist?.length || 0}
              </Typography>
              <Box sx={{ height: 6, borderRadius: 3, bgcolor: '#e0e0e0', overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    bgcolor: '#10b981',
                    width: `${tips.daily_checklist?.length > 0 ? (checklistCompleted / tips.daily_checklist.length) * 100 : 0}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Daily Checklist */}
        {tips.daily_checklist?.length > 0 && (
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                ✅ Daily Checklist
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1.5}>
                {tips.daily_checklist.map((task, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: task.completed ? '#e8f5e9' : '#f5f5f5',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Checkbox
                      checked={task.completed}
                      onChange={() => handleChecklistToggle(idx, task.completed)}
                      disabled={updating}
                      sx={{
                        color: '#8b5cf6',
                        '&.Mui-checked': { color: '#10b981' },
                      }}
                    />
                    <Box flex={1}>
                      <Typography
                        sx={{
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? '#999' : 'inherit',
                        }}
                      >
                        {task.task}
                      </Typography>
                      {task.time_of_day && (
                        <Typography variant="caption" color="text.secondary">
                          🕒 {task.time_of_day}
                        </Typography>
                      )}
                    </Box>
                    {task.completed && <Typography sx={{ color: '#10b981', fontWeight: 600 }}>✓</Typography>}
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Categories */}
        {tips.categories?.map((category, catIdx) => (
          <Card key={catIdx} sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 2 }}>
            <CardContent>
              <Box
                onClick={() => toggleCategory(catIdx)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  pb: 2,
                  borderBottom: expandedCategories[catIdx] ? '1px solid #e2e8f0' : 'none',
                }}
              >
                <Box display="flex" alignItems="center" gap={2}>
                  <Typography variant="h6" fontWeight={700}>
                    {categoryConfig[category.name]?.icon} {categoryConfig[category.name]?.name}
                  </Typography>
                  <Chip
                    label={`${category.tips?.filter((t) => t.completed).length || 0}/${category.tips?.length || 0}`}
                    size="small"
                    sx={{
                      bgcolor: `${categoryConfig[category.name]?.color || '#8b5cf6'}20`,
                      color: categoryConfig[category.name]?.color || '#8b5cf6',
                      fontWeight: 600,
                    }}
                  />
                </Box>
                <ExpandMoreIcon
                  sx={{
                    transform: expandedCategories[catIdx] ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                  }}
                />
              </Box>

              <Collapse in={expandedCategories[catIdx]}>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  {category.tips?.map((tip, tipIdx) => (
                    <Paper
                      key={tipIdx}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderColor: tip.completed ? '#10b981' : '#e2e8f0',
                        bgcolor: tip.completed ? '#f1f5f4' : '#fafafa',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Box display="flex" gap={2}>
                        <Checkbox
                          checked={tip.completed}
                          onChange={() => handleTipToggle(catIdx, tipIdx, tip.completed)}
                          disabled={updating}
                          sx={{
                            mt: 0.5,
                            color: '#8b5cf6',
                            '&.Mui-checked': { color: '#10b981' },
                          }}
                        />
                        <Box flex={1}>
                          <Typography
                            variant="body1"
                            fontWeight={600}
                            sx={{
                              textDecoration: tip.completed ? 'line-through' : 'none',
                              color: tip.completed ? '#999' : 'inherit',
                            }}
                          >
                            {tip.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                            {tip.description}
                          </Typography>
                          <Box display="flex" gap={1} alignItems="center">
                            <PriorityChip priority={tip.priority} />
                            {tip.actionable && (
                              <Chip label="Actionable" size="small" variant="outlined" sx={{ fontSize: '0.75rem' }} />
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Collapse>
            </CardContent>
          </Card>
        ))}

        {/* Sources */}
        {tips.sources?.length > 0 && (
          <Card sx={{ borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={700} mb={2}>
                📚 Sources Used
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                {tips.sources.map((source, idx) => (
                  <Typography key={idx} variant="body2">
                    • {source.title} {source.country && `(${source.country})`}
                  </Typography>
                ))}
              </Stack>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

export default LifestyleTipsView;
