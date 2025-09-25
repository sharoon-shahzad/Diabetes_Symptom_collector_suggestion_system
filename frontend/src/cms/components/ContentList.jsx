import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { fetchContent, deleteContent, fetchCategories } from '../../utils/api';
import ContentForm from './ContentForm';

const ContentList = () => {
  const [content, setContent] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, content: null });
  
  // Filters and pagination
  const [filters, setFilters] = useState({
    status: 'published',
    category: '',
    search: '',
    featured: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });

  const loadContent = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === 'all') {
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
    } catch (error) {
      console.error('Error loading content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  useEffect(() => {
    loadContent();
  }, [pagination.page, filters]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleEdit = (content) => {
    setSelectedContent(content);
    setFormOpen(true);
  };

  const handleDelete = (content) => {
    setDeleteDialog({ open: true, content });
  };

  const confirmDelete = async () => {
    try {
      await deleteContent(deleteDialog.content._id);
      toast.success('Content deleted successfully');
      loadContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    } finally {
      setDeleteDialog({ open: false, content: null });
    }
  };

  const handleFormSuccess = () => {
    loadContent();
    toast.success(selectedContent ? 'Content updated successfully' : 'Content created successfully');
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setSelectedContent(null);
  };

  const handleFilterChange = (field) => (event) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSearchChange = (event) => {
    setFilters(prev => ({
      ...prev,
      search: event.target.value
    }));
  };

  const handlePageChange = (event, page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && content.length === 0) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Content Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
        >
          Add Content
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search"
                value={filters.search}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={handleFilterChange('status')}
                  label="Status"
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="published">Published</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category}
                  onChange={handleFilterChange('category')}
                  label="Category"
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
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>Featured</InputLabel>
                <Select
                  value={filters.featured}
                  onChange={handleFilterChange('featured')}
                  label="Featured"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="true">Featured</MenuItem>
                  <MenuItem value="false">Not Featured</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {content.length === 0 ? (
        <Alert severity="info">
          No content found. Create your first content piece to get started.
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {content.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {item.featuredImage?.url && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={item.featuredImage.url}
                      alt={item.featuredImage.alt || item.title}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                      <Chip
                        label={item.status}
                        color={item.status === 'published' ? 'success' : 'default'}
                        size="small"
                      />
                      {item.isFeatured && (
                        <Chip label="Featured" color="primary" size="small" />
                      )}
                    </Box>
                    
                    <Typography variant="h6" component="h2" gutterBottom>
                      {item.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {item.excerpt}
                    </Typography>
                    
                    {item.category && (
                      <Chip
                        label={item.category.name}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    )}
                    
                    <Typography variant="caption" color="text.secondary" display="block">
                      {formatDate(item.publishedAt || item.createdAt)}
                    </Typography>
                    
                    <Box display="flex" gap={1} mt={2}>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(item)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(item)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Content Form Dialog */}
      <ContentForm
        open={formOpen}
        onClose={handleFormClose}
        content={selectedContent}
        onSuccess={handleFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, content: null })}
      >
        <DialogTitle>Delete Content</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.content?.title}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, content: null })}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentList;
