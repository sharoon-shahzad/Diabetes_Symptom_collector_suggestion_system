import React from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Assignment, HealthAndSafety, Article } from '@mui/icons-material';

const QuickActions = () => {
  const navigate = useNavigate();
  return (
    <Box display="flex" flexWrap="wrap" gap={1.5}>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Assignment />}
        onClick={() => navigate('/onboarding')}
        sx={{ borderRadius: 2, fontWeight: 800 }}
      >
        Complete Details
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        startIcon={<HealthAndSafety />}
        onClick={() => navigate('/assessment')}
        sx={{ borderRadius: 2, fontWeight: 800 }}
      >
        View Assessment
      </Button>
      <Button
        variant="text"
        color="primary"
        startIcon={<Article />}
        onClick={() => navigate('/content')}
        sx={{ borderRadius: 2, fontWeight: 800 }}
      >
        Learn & Articles
      </Button>
    </Box>
  );
};

export default QuickActions;
