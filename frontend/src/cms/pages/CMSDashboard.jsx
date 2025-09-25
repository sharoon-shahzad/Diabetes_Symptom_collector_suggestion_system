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
      } catch (err) {
        console.error('Error loading CMS stats:', err);
        setError('Failed to load dashboard statistics');
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
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: 2,
              p: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        CMS Dashboard
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Overview of your content management system
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Category Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Categories"
            value={categoryStats?.length || 0}
            icon={<CategoryIcon color="primary" />}
            color="primary"
          />
        </Grid>

        {/* Content Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Content"
            value={contentStats?.overview?.totalContent || 0}
            icon={<ArticleIcon color="secondary" />}
            color="secondary"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Published"
            value={contentStats?.overview?.publishedContent || 0}
            icon={<TrendingUpIcon color="success" />}
            color="success"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Views"
            value={contentStats?.overview?.totalViews || 0}
            icon={<ViewIcon color="info" />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Category Breakdown */}
      {categoryStats && categoryStats.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
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
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Content
            </Typography>
            <Grid container spacing={2}>
              {contentStats.recentContent.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item._id}>
                  <Box
                    sx={{
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1
                    }}
                  >
                    <Typography variant="subtitle2" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {item.category?.name} • {new Date(item.publishedAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="primary">
                      {item.viewCount} views
                    </Typography>
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
