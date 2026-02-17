import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Box,
  Button,
  Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ThemeToggle from '../components/Common/ThemeToggle';

const drawerWidth = 220;
const miniDrawerWidth = 64;

export default function SidebarNavigation({
  sections,
  selectedIndex,
  onSectionChange,
  sidebarOpen,
  onSidebarToggle,
  onLogout,
  user,
}) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: sidebarOpen ? drawerWidth : miniDrawerWidth,
        flexShrink: 0,
        transition: 'width 0.3s ease',
        '& .MuiDrawer-paper': {
          width: sidebarOpen ? drawerWidth : miniDrawerWidth,
          boxSizing: 'border-box',
          py: 3,
          px: sidebarOpen ? 2 : 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: (t) => t.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
          borderRight: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
          transition: 'width 0.3s ease, padding 0.3s ease',
          overflowX: 'hidden',
        },
      }}
    >
      <Box>
        {/* User Profile Header - Clean & Minimal */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            gap: 1.5, 
            px: sidebarOpen ? 1.5 : 0,
            py: 2,
            mb: 3,
          }}
        >
          <Avatar 
            sx={{ 
              width: 40,
              height: 40,
              background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
              fontWeight: 700,
              fontSize: '1.1rem',
            }}
          >
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          {sidebarOpen && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="body2" 
                fontWeight={700}
                sx={{ 
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mb: 0.25,
                }}
              >
                {user?.fullName || 'User'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                Dashboard
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Navigation Menu - Clean List */}
        <List sx={{ px: 0 }}>
          {sections.map((sec, index) => (
            <Tooltip title={!sidebarOpen ? sec.label : ''} placement="right" key={sec.label}>
              <ListItem disablePadding>
                <ListItemButton
                  selected={selectedIndex === index}
                  onClick={() => onSectionChange(index)}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.5,
                    px: sidebarOpen ? 1.5 : 1,
                    py: 1.25,
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '3px',
                      height: '60%',
                      borderRadius: '0 4px 4px 0',
                      background: (t) => `linear-gradient(180deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                    },
                    '&.Mui-selected': {
                      bgcolor: (t) => t.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.08)' 
                        : 'rgba(0,0,0,0.04)',
                      '&::before': {
                        opacity: 1,
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.main',
                      },
                      '& .MuiListItemText-primary': {
                        color: 'text.primary',
                        fontWeight: 700,
                      },
                    },
                    '&:hover': {
                      bgcolor: (t) => t.palette.mode === 'dark' 
                        ? 'rgba(255,255,255,0.05)' 
                        : 'rgba(0,0,0,0.03)',
                    }
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: sidebarOpen ? 36 : 'auto',
                      color: 'text.secondary',
                      transition: 'color 0.2s ease',
                      justifyContent: 'center',
                    }}
                  >
                    {sec.icon}
                  </ListItemIcon>
                  {sidebarOpen && (
                    <ListItemText 
                      primary={sec.label}
                      primaryTypographyProps={{
                        component: 'span',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: 'text.secondary',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Box>
      
      {/* Bottom Section - Minimal */}
      <Box sx={{ px: 0.5 }}>
        {/* Theme Toggle - Integrated */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            py: 2,
            mb: 1,
          }}
        >
          <ThemeToggle size="medium" />
        </Box>
        
        {/* Logout Button - Subtle */}
        <Tooltip title={!sidebarOpen ? 'Logout' : ''} placement="right">
          <Button
            fullWidth
            variant="text"
            onClick={onLogout}
            sx={{ 
              borderRadius: 1.5, 
              fontWeight: 600,
              py: 1.25,
              px: sidebarOpen ? 1.5 : 1,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              color: 'text.secondary',
              minWidth: sidebarOpen ? 'auto' : '48px',
              '&:hover': {
                bgcolor: (t) => `rgba(${t.palette.mode === 'dark' ? '244, 67, 54' : '211, 47, 47'}, 0.08)`,
                color: 'error.main',
              }
            }}
          >
            {sidebarOpen ? 'Logout' : '⎋'}
          </Button>
        </Tooltip>
        
        {/* Collapse Button */}
        <Tooltip title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'} placement="right">
          <Button
            fullWidth
            variant="text"
            onClick={onSidebarToggle}
            sx={{ 
              borderRadius: 1.5, 
              fontWeight: 600,
              py: 1.25,
              px: sidebarOpen ? 1.5 : 1,
              mt: 1,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              textTransform: 'none',
              color: 'text.secondary',
              minWidth: sidebarOpen ? 'auto' : '48px',
              '&:hover': {
                bgcolor: (t) => t.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.03)',
                color: 'primary.main',
              }
            }}
          >
            {sidebarOpen ? (
              <>
                <ChevronLeftIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                <Typography variant="body2" fontWeight={600}>Collapse</Typography>
              </>
            ) : (
              <ChevronRightIcon fontSize="small" />
            )}
          </Button>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
