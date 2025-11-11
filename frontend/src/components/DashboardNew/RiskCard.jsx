import React from 'react';
import { Paper, Box, Typography, Button, Grid, alpha } from '@mui/material';
import { TrendingUp, Assessment } from '@mui/icons-material';

const RiskCard = ({ onAssess, lastAssessedAt }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        borderRadius: 5,
        background: (t) => `linear-gradient(120deg, ${t.palette.primary.main} 0%, ${t.palette.secondary.main} 100%)`,
        border: (t) => `2px solid ${alpha(t.palette.common.white, 0.15)}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: (t) => `0 20px 60px ${alpha(t.palette.primary.main, 0.5)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -120,
          right: -120,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: (t) => alpha(t.palette.common.white, 0.08),
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -80,
          left: -80,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: (t) => alpha(t.palette.common.white, 0.06),
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box display="flex" alignItems="center" gap={2} sx={{ mb: 3 }}>
              <Box 
                sx={{ 
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  background: (t) => alpha(t.palette.common.white, 0.2),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)',
                  boxShadow: `0 8px 32px ${alpha('#000', 0.1)}`,
                }}
              >
                <Assessment sx={{ fontSize: 36, color: 'white' }} />
              </Box>
              <Typography variant="h3" fontWeight={900} sx={{ color: 'white' }}>
                Risk Assessment
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: alpha('#fff', 0.95), mb: 2, lineHeight: 1.7, fontWeight: 500 }}>
              Get your personalized diabetes risk score with AI-powered insights and actionable health recommendations.
            </Typography>
            {lastAssessedAt && (
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.75), fontWeight: 600 }}>
                Last assessed: {new Date(lastAssessedAt).toLocaleString()}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={onAssess}
              endIcon={<TrendingUp sx={{ fontSize: '1.5rem' }} />}
              sx={{ 
                borderRadius: 3,
                py: 2.5,
                fontWeight: 900,
                fontSize: '1.1rem',
                textTransform: 'none',
                background: 'white',
                color: 'primary.main',
                boxShadow: `0 12px 32px ${alpha('#000', 0.2)}`,
                '&:hover': {
                  background: alpha('#fff', 0.95),
                  transform: 'scale(1.05)',
                  boxShadow: `0 16px 40px ${alpha('#000', 0.25)}`,
                },
                transition: 'all 0.3s ease',
              }}
            >
              Start Assessment
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default RiskCard;
