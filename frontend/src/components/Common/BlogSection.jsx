import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  useTheme,
  alpha
} from '@mui/material';
import {
  Search as SearchIcon,
  Article as ArticleIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { fetchContent, fetchCategories } from '../../utils/api';
import BlogCard from './BlogCard';

const BlogSection = ({ 
  title = "Latest Health Articles",
  subtitle = "Stay informed with expert insights on diabetes management and healthy living",
  showFilters = true,
  limit = 6,
  featuredFirst = true,
  onArticleClick
}) => {
  const theme = useTheme();
  const [content, setContent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: limit,
    total: 0,
    pages: 0
  });
  const [displayLimit, setDisplayLimit] = useState(3); // Show 3 articles initially (1 row of 3)
  const [hasMore, setHasMore] = useState(true);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: 1, // Always load from page 1 for load more functionality
        limit: 50, // Load more articles to support load more
        status: 'published',
        search: searchTerm,
        category: selectedCategory,
        sort: '-publishedAt'
      };
      
      // Remove empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });
      
      const data = await fetchContent(params);
      setContent(data.data || []);
      setPagination(prev => ({
        ...prev,
        total: data.total || 0,
        pages: data.pages || 0
      }));
      
      // Reset display limit when filters change
      setDisplayLimit(3);
      setHasMore((data.data || []).length > 3);
    } catch (error) {
      console.error('Error loading content:', error);
      setError('Failed to load articles. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchCategories('active');
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadContent();
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const handleLoadMore = () => {
    const newLimit = displayLimit + 3; // Load 3 more articles (1 more row)
    setDisplayLimit(newLimit);
    setHasMore(newLimit < content.length);
  };

  const handleArticleClick = (article) => {
    if (onArticleClick) {
      onArticleClick(article);
    } else {
      // Default behavior: open in new tab
      window.open(`/content/${article.slug}`, '_blank');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
      },
    },
  };

  // Separate featured and regular articles
  const featuredArticles = content.filter(article => article.isFeatured);
  const regularArticles = content.filter(article => !article.isFeatured);
  const allArticles = featuredFirst ? [...featuredArticles, ...regularArticles] : content;
  const displayArticles = allArticles.slice(0, displayLimit);

  if (loading && content.length === 0) {
    return (
      <Box 
        sx={{ 
          py: 8, 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 400 
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box 
      id="blogs-articles"
      sx={{ 
        py: 8, 
        background: theme.palette.background.paper,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
        >
          {/* Section Header */}
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <motion.div variants={itemVariants}>
              <Typography 
                variant="h3" 
                fontWeight={700} 
                color="text.primary"
                gutterBottom
              >
                {title}
              </Typography>
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
              >
                {subtitle}
              </Typography>
            </motion.div>
          </Box>

          {/* Search and Filter */}
          {showFilters && (
            <motion.div variants={itemVariants}>
              <Box
                sx={{
                  p: 3,
                  mb: 4,
                  background: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Search articles"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        )
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        label="Category"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">All Categories</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category._id} value={category._id}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon color="action" />
                      <Typography variant="body2" color="textSecondary">
                        {pagination.total} articles found
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <motion.div variants={itemVariants}>
              <Alert severity="error" sx={{ mb: 4 }}>
                {error}
              </Alert>
            </motion.div>
          )}

          {/* Articles Grid */}
          {content.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Alert severity="info">
                No articles found. Try adjusting your search criteria.
              </Alert>
            </motion.div>
          ) : (
            <>
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(3, 1fr)'
                },
                gap: 3,
                width: '100%'
              }}>
                {displayArticles.map((article, index) => (
                  <Box
                    key={article._id}
                    sx={{ 
                      display: 'flex',
                      width: '100%'
                    }}
                  >
                    <BlogCard
                      article={article}
                      onReadMore={handleArticleClick}
                      index={index}
                      variant={article.isFeatured && featuredFirst ? 'featured' : 'default'}
                    />
                  </Box>
                ))}
              </Box>
              
              {/* Load More Button */}
              {hasMore && (
                <motion.div variants={itemVariants}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={handleLoadMore}
                      sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 4,
                        py: 1.5,
                        fontSize: '1rem',
                        borderWidth: 2,
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                        '&:hover': {
                          borderWidth: 2,
                          background: alpha(theme.palette.primary.main, 0.1),
                          transform: 'translateY(-2px)',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                        },
                      }}
                    >
                      Load More Articles
                    </Button>
                  </Box>
                </motion.div>
              )}
            </>
          )}
        </motion.div>
      </Container>
    </Box>
  );
};

export default BlogSection;
