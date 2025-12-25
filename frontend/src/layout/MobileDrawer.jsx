import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Box,
  Button,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import ThemeToggle from '../components/Common/ThemeToggle';

const drawerWidth = 220;

export default function MobileDrawer({
  open,
  onClose,
  sections,
  selectedIndex,
  onSectionChange,
  onLogout,
  user,
}) {
  const handleSectionClick = (index) => {
    onSectionChange(index);
    onClose();
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          py: 3,
          px: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          overflowX: 'hidden',
          overflowY: 'auto',
          scrollbarWidth: 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      }}
    >
      <Box>
        {/* User Profile Header */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5, 
            px: 2,
            py: 2.5,
            mb: 3,
            borderRadius: 2,
            background: (t) => alpha(t.palette.primary.main, 0.04),
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.12)}`,
          }}
        >
          <Avatar 
            sx={{ 
              width: 44,
              height: 44,
              background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
              fontWeight: 700,
              fontSize: '1.2rem',
            }}
          >
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} sx={{ color: 'text.primary', mb: 0.25 }}>
              {user?.fullName || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              Dashboard
            </Typography>
          </Box>
        </Box>
        
        {/* Navigation Menu */}
        <List sx={{ px: 0 }}>
          {sections.map((sec, index) => (
            <ListItem 
              button 
              key={sec.label} 
              selected={selectedIndex === index} 
              onClick={() => handleSectionClick(index)} 
              sx={{ 
                borderRadius: 2,
                mb: 1,
                px: 2,
                py: 1.5,
                '&.Mui-selected': {
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                  '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 700 },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{sec.icon}</ListItemIcon>
              <ListItemText primary={sec.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
            </ListItem>
          ))}
        </List>
      </Box>
      <Box sx={{ px: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, mb: 1 }}>
          <ThemeToggle size="medium" />
        </Box>
        <Button 
          fullWidth 
          variant="outlined" 
          color="error" 
          startIcon={<LogoutIcon />} 
          onClick={onLogout} 
          sx={{ borderRadius: 2, fontWeight: 700, py: 1.5 }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
}
