import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Chip, alpha } from '@mui/material';
// Icons removed in favor of a minimal colored dot for a cleaner look

const ActivityTimeline = ({ items = [] }) => {
  if (!items.length) {
    return (
      <Box 
        sx={{ 
          p: 4,
          textAlign: 'center',
          background: (t) => t.palette.background.paper,
          borderRadius: 3,
          border: (t) => `1px solid ${t.palette.divider}`,
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
            py: 2.5,
            mb: idx < items.length - 1 ? 1.5 : 0,
            borderRadius: 2.5,
            background: (t) => t.palette.background.paper,
            border: (t) => `1px solid ${t.palette.divider}`,
            transition: 'background 0.2s ease, transform 0.2s ease',
            '&:hover': {
              background: (t) => alpha(t.palette.text.primary, 0.02),
              transform: 'translateX(2px)',
            }
          }}
        >
          <Box sx={{ mr: 2.5, mt: 0.75 }}>
            <Box 
              sx={{ 
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: (t) => t.palette[it.color] ? t.palette[it.color].main : t.palette.primary.main,
              }}
            />
          </Box>
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" gap={1.5} sx={{ mb: 1 }}>
                <Typography variant="h6" fontWeight={900} sx={{ color: 'text.primary' }}>
                  {it.title}
                </Typography>
                <Chip 
                  label={it.type || 'Update'} 
                  variant="outlined"
                  size="small" 
                  sx={{ 
                    height: 22,
                    fontSize: '0.72rem',
                    fontWeight: 700,
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
