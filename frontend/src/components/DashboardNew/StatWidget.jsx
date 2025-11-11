import React from 'react';
import { Paper, Box, Typography, alpha } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StatWidget = ({ title, value, caption, icon, color = 'primary', onClick }) => {
  const getMainColor = (t) => t.palette[color]?.main || t.palette.primary.main;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: 3.5,
        borderRadius: 4,
        cursor: onClick ? 'pointer' : 'default',
        background: (t) => `linear-gradient(135deg, ${t.palette.background.paper}, ${alpha(getMainColor(t), 0.04)})`,
        border: (t) => `2px solid ${alpha(getMainColor(t), 0.25)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 140,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        '&:hover': {
          transform: onClick ? 'translateY(-8px) scale(1.02)' : 'translateY(-4px)',
          boxShadow: (t) => `0 16px 40px ${alpha(getMainColor(t), 0.2)}`,
          borderColor: (t) => getMainColor(t),
          '&::before': {
            opacity: 1,
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -60,
          right: -60,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: (t) => alpha(getMainColor(t), 0.08),
          transition: 'all 0.4s ease',
          opacity: 0.6,
        },
        '&:hover::before': {
          transform: 'scale(1.3)',
          opacity: 0.9,
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: (t) => getMainColor(t),
              letterSpacing: 1.8,
              fontWeight: 900,
              fontSize: '0.7rem',
            }}
          >
            {title}
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: (t) => getMainColor(t),
              bgcolor: (t) => alpha(getMainColor(t), 0.2),
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'rotate(10deg) scale(1.1)',
              }
            }}
          >
            {icon || <TrendingUpIcon />}
          </Box>
        </Box>
        <Typography 
          variant="h4" 
          fontWeight={900}
          sx={{ 
            mb: 1,
            wordBreak: 'break-word',
            lineHeight: 1.2,
            background: (t) => `linear-gradient(135deg, ${getMainColor(t)}, ${t.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {value}
        </Typography>
        {caption && (
          <Typography 
            variant="body2"
            sx={{ 
              color: 'text.secondary',
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            {caption}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default StatWidget;
