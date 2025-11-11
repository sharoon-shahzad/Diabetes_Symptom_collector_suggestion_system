import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip, alpha } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import UpdateIcon from '@mui/icons-material/Update';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

const iconMap = {
  Details: <UpdateIcon />,
  Disease: <LocalHospitalIcon />,
  default: <CheckCircleIcon />,
};

const ActivityTimeline = ({ items = [] }) => {
  if (!items.length) {
    return (
      <Box 
        sx={{ 
          p: 6,
          textAlign: 'center',
          background: (t) => t.palette.mode === 'dark'
            ? alpha(t.palette.info.main, 0.08)
            : alpha(t.palette.info.main, 0.05),
          borderRadius: 4,
        }}
      >
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
          No recent activity to display.
        </Typography>
      </Box>
    );
  }
  return (
    <List dense={false} sx={{ px: 0, py: 0 }}>
      {items.map((it, idx) => (
        <ListItem 
          key={idx} 
          sx={{ 
            alignItems: 'flex-start',
            px: 3,
            py: 3,
            mb: idx < items.length - 1 ? 2 : 0,
            borderRadius: 3,
            background: (t) => t.palette.mode === 'dark'
              ? alpha(t.palette[it.color] ? t.palette[it.color].main : t.palette.primary.main, 0.12)
              : alpha(t.palette[it.color] ? t.palette[it.color].main : t.palette.primary.main, 0.06),
            border: (t) => `2px solid ${alpha(t.palette[it.color] ? t.palette[it.color].main : t.palette.primary.main, 0.25)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              background: (t) => t.palette.mode === 'dark'
                ? alpha(t.palette[it.color] ? t.palette[it.color].main : t.palette.primary.main, 0.2)
                : alpha(t.palette[it.color] ? t.palette[it.color].main : t.palette.primary.main, 0.12),
              transform: 'translateX(4px)',
              borderColor: (t) => alpha(t.palette[it.color] ? t.palette[it.color].main : t.palette.primary.main, 0.5),
            }
          }}
        >
          <Box 
            sx={{ 
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: (t) => t.palette.mode === 'dark'
                ? alpha(t.palette[it.color] ? t.palette[it.color].main : t.palette.primary.main, 0.25)
                : alpha(t.palette[it.color] ? t.palette[it.color].main : t.palette.primary.main, 0.18),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2.5,
              mt: 0.5,
              color: (t) => t.palette[it.color] ? t.palette[it.color].main : t.palette.primary.main,
              fontSize: '1.5rem',
            }}
          >
            {iconMap[it.type] || iconMap.default}
          </Box>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight={900} sx={{ color: 'text.primary' }}>
                  {it.title}
                </Typography>
                <Chip 
                  label={it.type || 'Update'} 
                  color={it.color || 'info'} 
                  size="small" 
                  sx={{ 
                    height: 24,
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }} 
                />
              </Box>
            }
            secondary={
              <Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                  {it.description}
                </Typography>
                {it.time && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 700, letterSpacing: 0.5 }}>
                    {new Date(it.time).toLocaleString()}
                  </Typography>
                )}
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};

export default ActivityTimeline;
