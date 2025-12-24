import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Chip,
  Stack,
  IconButton,
  Collapse,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  ShoppingCart as ShoppingCartIcon,
  Public as PublicIcon,
  ExpandMore as ExpandMoreIcon,
  Today as TodayIcon,
  Event as EventIcon
} from '@mui/icons-material';

const DietPlanView = ({ plan, onBack, onDelete }) => {
  const [expandedMeals, setExpandedMeals] = useState({});

  if (!plan) return null;

  // Calculate actual totals from meals dynamically
  const calculateActualTotals = () => {
    if (!plan.meals || !Array.isArray(plan.meals)) {
      return {
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0,
        fiber: 0
      };
    }

    const totals = {
      calories: 0,
      carbs: 0,
      protein: 0,
      fat: 0,
      fiber: 0
    };

    plan.meals.forEach(meal => {
      // Use meal.total_calories if available, otherwise sum from items
      if (meal.total_calories) {
        totals.calories += Number(meal.total_calories) || 0;
      } else if (meal.items && Array.isArray(meal.items)) {
        meal.items.forEach(item => {
          totals.calories += Number(item.calories) || 0;
        });
      }

      // Sum macros from items
      if (meal.items && Array.isArray(meal.items)) {
        meal.items.forEach(item => {
          totals.carbs += Number(item.carbs) || 0;
          totals.protein += Number(item.protein) || 0;
          totals.fat += Number(item.fat) || 0;
          totals.fiber += Number(item.fiber) || 0;
        });
      }
    });

    return {
      calories: Math.round(totals.calories),
      carbs: Math.round(totals.carbs * 10) / 10,
      protein: Math.round(totals.protein * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10
    };
  };

  const actualTotals = calculateActualTotals();

  const toggleMeal = (idx) => {
    setExpandedMeals(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const getMealBorderColor = (index) => {
    const colors = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f'];
    return colors[index % colors.length];
  };

  const targetDate = new Date(plan.target_date);
  const isToday = targetDate.toDateString() === new Date().toDateString();
  const isFuture = targetDate > new Date();

  const handleDownloadPDF = () => {
    alert('PDF download feature coming soon!');
  };

  const handleShoppingList = () => {
    alert('Shopping list feature coming soon!');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper
          elevation={3}
          sx={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            borderRadius: 2,
            p: 4,
            mb: 3,
            color: '#1f2937',
            border: '1px solid #e5e7eb'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={onBack} 
              sx={{ 
                color: '#10b981',
                bgcolor: '#f0fdf4',
                '&:hover': { 
                  bgcolor: '#dcfce7'
                }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                Diet Plan
              </Typography>
              <Typography variant="body1" sx={{ mb: 1, opacity: 0.95 }}>
                {targetDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {isToday && (
                  <Chip 
                    icon={<TodayIcon sx={{ color: '#10b981 !important' }} />}
                    label="Today" 
                    size="small"
                    sx={{ bgcolor: '#dcfce7', color: '#10b981', fontWeight: 600 }}
                  />
                )}
                {isFuture && !isToday && (
                  <Chip 
                    icon={<EventIcon sx={{ color: 'white !important' }} />}
                    label="Upcoming" 
                    size="small"
                    color="default"
                  />
                )}
                <Chip 
                  icon={<PublicIcon />} 
                  label={plan.region} 
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Box>
            <IconButton 
              onClick={() => onDelete(plan._id)}
              sx={{ 
                color: 'error.main',
                '&:hover': { 
                  bgcolor: 'error.lighter'
                }
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Stack direction="row" spacing={2} mb={3}>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleDownloadPDF}
            sx={{ bgcolor: '#3b82f6', color: '#fff', '&:hover': { bgcolor: '#2563eb' }, textTransform: 'none', fontWeight: 600 }}
          >
            Download PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<ShoppingCartIcon />}
            onClick={handleShoppingList}
            sx={{ bgcolor: '#10b981', color: '#fff', '&:hover': { bgcolor: '#059669' }, textTransform: 'none', fontWeight: 600 }}
          >
            Shopping List
          </Button>
        </Stack>

        {/* Nutrition Summary */}
        <Paper elevation={2} sx={{ mb: 3, p: 4, bgcolor: 'white', borderRadius: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1f2937' }}>
            Daily Nutrition Summary
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: '#eff6ff',
                  border: '2px solid #dbeafe',
                  borderRadius: 2
                }}
              >
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#3b82f6' }}>
                  {actualTotals.calories}
                </Typography>
                <Typography variant="body2" sx={{ color: '#3b82f6', mt: 0.5, fontWeight: 600 }}>
                  Calories (kcal)
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: '#f0fdf4',
                  border: '2px solid #d1fae5',
                  borderRadius: 2
                }}
              >
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#10b981' }}>
                  {actualTotals.carbs}g
                </Typography>
                <Typography variant="body2" sx={{ color: '#10b981', mt: 0.5, fontWeight: 600 }}>
                  Carbohydrates
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: '#fdf4ff',
                  border: '2px solid #f3e8ff',
                  borderRadius: 2
                }}
              >
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#a855f7' }}>
                  {actualTotals.protein}g
                </Typography>
                <Typography variant="body2" sx={{ color: '#a855f7', mt: 0.5, fontWeight: 600 }}>
                  Protein
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  bgcolor: '#fff7ed',
                  border: '2px solid #fed7aa',
                  borderRadius: 2
                }}
              >
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#f97316' }}>
                  {actualTotals.fat}g
                </Typography>
                <Typography variant="body2" sx={{ color: '#f97316', mt: 0.5, fontWeight: 600 }}>
                  Fat
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {actualTotals.fiber > 0 && (
            <Box mt={3} textAlign="center">
              <Chip 
                label={`Fiber: ${actualTotals.fiber}g`} 
                sx={{ bgcolor: '#10b981', color: 'white', fontWeight: 600, px: 2, py: 2.5 }}
              />
            </Box>
          )}
        </Paper>


        {/* Meals */}
        {plan.meals && plan.meals.map((meal, index) => {
          const borderColor = getMealBorderColor(index);
          const isExpanded = expandedMeals[index];
          
          // Calculate meal total from items if not available
          const mealCalories = meal.total_calories || 
            (meal.items && Array.isArray(meal.items) 
              ? meal.items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0)
              : 0);
          
          return (
            <Paper 
              key={index} 
              elevation={1}
              sx={{ 
                mb: 2,
                borderRadius: 1,
                overflow: 'hidden',
                bgcolor: 'white'
              }}
            >
              {/* Meal Header */}
              <Box 
                sx={{
                  p: 3,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderLeft: `5px solid ${borderColor}`,
                  bgcolor: `${borderColor}08`,
                  '&:hover': {
                    bgcolor: `${borderColor}15`
                  }
                }}
                onClick={() => toggleMeal(index)}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5, color: borderColor }}>
                    {meal.name}
                  </Typography>
                  {meal.timing && (
                    <Typography variant="body2" color="text.secondary">
                      {meal.timing}
                    </Typography>
                  )}
                </Box>
                <Chip 
                  label={`${Math.round(mealCalories)} kcal`}
                  sx={{ bgcolor: borderColor, color: 'white', fontWeight: 600 }}
                />
                <IconButton
                  size="small"
                  sx={{
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s'
                  }}
                >
                  <ExpandMoreIcon />
                </IconButton>
              </Box>

              {/* Collapsible Meal Items */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Divider sx={{ mb: 2 }} />
                  {meal.items && meal.items.map((item, itemIndex) => (
                    <Paper 
                      key={itemIndex} 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        mb: 2, 
                        bgcolor: '#fafafa',
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        '&:hover': {
                          bgcolor: '#f5f5f5'
                        }
                      }}
                    >
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
                          {item.food}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Portion: {item.portion}
                        </Typography>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#e3f2fd', borderRadius: 1, border: '2px solid #1976d2' }}>
                            <Typography variant="caption" sx={{ color: '#1976d2', fontWeight: 600, mb: 0.5, display: 'block' }}>
                              Calories
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                              {item.calories}
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1, border: '2px solid #2e7d32' }}>
                            <Typography variant="caption" sx={{ color: '#2e7d32', fontWeight: 600, mb: 0.5, display: 'block' }}>
                              Carbs
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#2e7d32' }}>
                              {item.carbs}g
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#f3e5f5', borderRadius: 1, border: '2px solid #9c27b0' }}>
                            <Typography variant="caption" sx={{ color: '#9c27b0', fontWeight: 600, mb: 0.5, display: 'block' }}>
                              Protein
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#9c27b0' }}>
                              {item.protein}g
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box sx={{ textAlign: 'center', p: 1.5, bgcolor: '#fff3e0', borderRadius: 1, border: '2px solid #ed6c02' }}>
                            <Typography variant="caption" sx={{ color: '#ed6c02', fontWeight: 600, mb: 0.5, display: 'block' }}>
                              Fat
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#ed6c02' }}>
                              {item.fat}g
                            </Typography>
                          </Box>
                        </Grid>
                        {item.fiber > 0 && (
                          <Grid item xs={12}>
                            <Box sx={{ textAlign: 'center', p: 1.5 }}>
                              <Chip 
                                label={`Fiber: ${item.fiber}g`}
                                sx={{ bgcolor: '#4caf50', color: 'white', fontWeight: 600 }}
                              />
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>
                  ))}
                </Box>
              </Collapse>
            </Paper>
          );
        })}


        {/* Personalized Tips */}
        {plan.tips && plan.tips.length > 0 && (
          <Paper 
            elevation={2}
            sx={{ 
              mb: 3, 
              p: 4,
              bgcolor: 'white',
              borderRadius: 2,
              borderLeft: '5px solid #1976d2'
            }}
          >
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#1976d2' }}>
              Personalized Tips
            </Typography>
            <Stack spacing={2}>
              {plan.tips.map((tip, index) => (
                <Box 
                  key={index}
                  sx={{
                    p: 2,
                    bgcolor: '#e3f2fd',
                    borderRadius: 1,
                    borderLeft: '3px solid #1976d2'
                  }}
                >
                  <Typography variant="body1">
                    {tip}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        )}

        {/* Sources */}
        {plan.sources && plan.sources.length > 0 && (
          <Paper 
            elevation={2}
            sx={{ 
              mb: 3,
              p: 4,
              bgcolor: 'white',
              borderRadius: 2,
              borderLeft: '5px solid #2e7d32'
            }}
          >
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#2e7d32' }}>
              Evidence-Based Guidelines
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {plan.sources.map((source, index) => (
                <Chip
                  key={index}
                  label={`${source.title} (${source.country})`}
                  sx={{ 
                    mb: 1,
                    bgcolor: '#e8f5e9',
                    color: '#2e7d32',
                    fontWeight: 600,
                    border: '2px solid #2e7d32'
                  }}
                />
              ))}
            </Stack>
          </Paper>
        )}

        {/* Important Notes */}
        <Paper 
          elevation={2}
          sx={{ 
            p: 4,
            bgcolor: 'white',
            borderRadius: 2,
            mb: 3,
            borderLeft: '5px solid #ed6c02'
          }}
        >
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 3, color: '#ed6c02' }}>
            Important Reminders
          </Typography>
          <Stack spacing={2}>
            <Box 
              sx={{
                p: 2,
                bgcolor: '#fff3e0',
                borderRadius: 1,
                borderLeft: '3px solid #ed6c02'
              }}
            >
              <Typography variant="body1">
                This plan may adjust based on your glucose readings (when glucose monitoring is enabled)
              </Typography>
            </Box>
            <Box 
              sx={{
                p: 2,
                bgcolor: '#fff3e0',
                borderRadius: 1,
                borderLeft: '3px solid #ed6c02'
              }}
            >
              <Typography variant="body1">
                Drink 8-10 glasses of water throughout the day
              </Typography>
            </Box>
            <Box 
              sx={{
                p: 2,
                bgcolor: '#fff3e0',
                borderRadius: 1,
                borderLeft: '3px solid #ed6c02'
              }}
            >
              <Typography variant="body1">
                Check blood glucose before meals and 2 hours after meals as recommended
              </Typography>
            </Box>
            <Box 
              sx={{
                p: 2,
                bgcolor: '#fff3e0',
                borderRadius: 1,
                borderLeft: '3px solid #ed6c02'
              }}
            >
              <Typography variant="body1">
                Consult your doctor before making major dietary changes
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default DietPlanView;
