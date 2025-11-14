import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Category as CategoryIcon,
  Article as ArticleIcon,
  TrendingUp as TrendingUpIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { fetchCategoryStats, fetchContentStats } from '../../utils/api';

const CMSDashboard = () => {
  const [categoryStats, setCategoryStats] = useState(null);
  const [contentStats, setContentStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const [categoryData, contentData] = await Promise.all([
          fetchCategoryStats(),
          fetchContentStats()
        ]);
        setCategoryStats(categoryData);
        setContentStats(contentData);
        setError(null);
      } catch (err) {
        console.error('Error loading CMS stats:', err);
        
        // Check if it's a permission error
        if (err.response?.status === 403) {
          setError({
            type: 'permission',
            message: 'You don\'t have permission to view CMS statistics. Contact your administrator to grant you CMS permissions (category:view:all, content:view:all).',
          });
        } else if (err.response?.status === 401) {
          setError({
            type: 'auth',
            message: 'Your session has expired. Please log in again.',
          });
        } else {
          setError({
            type: 'error',
            message: 'Failed to load dashboard statistics. Please try again later.',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity={error.type === 'permission' ? 'warning' : 'error'}
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            {error.type === 'permission' ? '🔒 Access Restricted' : '❌ Error Loading Dashboard'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {error.message}
          </Typography>
          {error.type === 'permission' && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: 1, borderColor: 'divider' }}>
              <Typography variant="caption" fontWeight={700} display="block" gutterBottom>
                Required Permissions:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <Typography component="li" variant="caption" sx={{ fontFamily: 'monospace' }}>
                  category:view:all
                </Typography>
                <Typography component="li" variant="caption" sx={{ fontFamily: 'monospace' }}>
                  content:view:all
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                💡 Admin Tip: Run the backend script to grant CMS permissions to your user.
              </Typography>
            </Box>
          )}
          {error.type === 'auth' && (
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => window.location.href = '/signin'}
            >
              Go to Login
            </Button>
          )}
        </Alert>
      </Box>
    );
  }

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card 
      elevation={0}
      sx={{
        height: '100%',
        borderRadius: 3,
        border: (t) => `1px solid ${t.palette.divider}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: `${color}.main`,
          boxShadow: (t) => `0 4px 12px ${t.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
        }
      }}
    >
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography 
              color="text.secondary" 
              gutterBottom 
              variant="overline"
              sx={{ 
                fontWeight: 700,
                letterSpacing: 1.2,
                fontSize: '0.7rem'
              }}
            >
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 700 }}>
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              backgroundColor: (t) => t.palette.mode === 'dark' 
                ? `${color}.dark`
                : `${color}.light`,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: `${color}.contrastText`
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          CMS Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          Overview of your content management system
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
        {/* Category Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Categories"
            value={categoryStats?.length || 0}
            icon={<CategoryIcon />}
            color="primary"
          />
        </Grid>

        {/* Content Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Content"
            value={contentStats?.overview?.totalContent || 0}
            icon={<ArticleIcon />}
            color="secondary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Published"
            value={contentStats?.overview?.publishedContent || 0}
            icon={<TrendingUpIcon />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Views"
            value={contentStats?.overview?.totalViews || 0}
            icon={<ViewIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Category Breakdown */}
      {categoryStats && categoryStats.length > 0 && (
        <Card 
          elevation={0}
          sx={{ 
            mt: 4,
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
              Content by Category
            </Typography>
            <Grid container spacing={2}>
              {categoryStats.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category._id}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: category.categoryColor,
                          mr: 1
                        }}
                      />
                      <Typography variant="body2">
                        {category.categoryName}
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="primary">
                      {category.count}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Recent Content */}
      {contentStats?.recentContent && contentStats.recentContent.length > 0 && (
        <Card 
          elevation={0}
          sx={{ 
            mt: 4,
            borderRadius: 3,
            border: (t) => `1px solid ${t.palette.divider}`,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
              Recent Content
            </Typography>
            <Grid container spacing={2}>
              {contentStats.recentContent.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item._id}>
                  <Box
                    sx={{
                      p: 2.5,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: (t) => t.palette.mode === 'dark' 
                          ? 'rgba(255,255,255,0.02)'
                          : 'rgba(0,0,0,0.01)',
                        transform: 'translateY(-2px)',
                        boxShadow: (t) => `0 4px 12px ${t.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.08)'}`,
                      }
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ mb: 1.5 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                      {item.category?.name} • {new Date(item.publishedAt).toLocaleDateString()}
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <ViewIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                      <Typography variant="caption" color="primary.main" fontWeight={700}>
                        {item.viewCount.toLocaleString()} views
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CMSDashboard;
