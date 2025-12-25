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
          background: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          boxShadow: 'none',
          transition: 'width 0.3s ease, padding 0.3s ease',
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
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            gap: 1.5, 
            px: sidebarOpen ? 2 : 0,
            py: 2.5,
            mb: 3,
            borderRadius: 2,
            background: (t) => t.palette.mode === 'dark'
              ? alpha(t.palette.primary.main, 0.08)
              : alpha(t.palette.primary.main, 0.04),
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.12)}`,
            transition: 'all 0.2s ease',
            '&:hover': {
              background: (t) => alpha(t.palette.primary.main, 0.12),
              borderColor: (t) => alpha(t.palette.primary.main, 0.25),
            }
          }}
        >
          <Avatar 
            sx={{ 
              width: 44,
              height: 44,
              background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
              fontWeight: 700,
              fontSize: '1.2rem',
              boxShadow: (t) => `0 4px 12px ${alpha(t.palette.primary.main, 0.3)}`,
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
                  color: 'text.primary',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  mb: 0.25,
                  fontSize: '0.9rem',
                }}
              >
                {user?.fullName || 'User'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Dashboard
              </Typography>
            </Box>
          )}
        </Box>
        
        {/* Navigation Menu */}
        <List sx={{ px: 0 }}>
          {sections.map((sec, index) => (
            <Tooltip title={!sidebarOpen ? sec.label : ''} placement="right" key={sec.label}>
              <ListItem 
                button 
                selected={selectedIndex === index} 
                onClick={() => onSectionChange(index)} 
                sx={{ 
                  borderRadius: 2,
                  mb: 1,
                  px: sidebarOpen ? 2 : 1,
                  py: 1.5,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '4px',
                    background: (t) => `linear-gradient(180deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  },
                  '&.Mui-selected': {
                    bgcolor: (t) => t.palette.mode === 'dark' 
                      ? alpha(t.palette.primary.main, 0.12)
                      : alpha(t.palette.primary.main, 0.08),
                    border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                    '&::before': {
                      opacity: 1,
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.main',
                      transform: 'scale(1.1)',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'primary.main',
                      fontWeight: 700,
                    },
                  },
                  '&:hover': {
                    bgcolor: (t) => t.palette.mode === 'dark' 
                      ? alpha(t.palette.primary.main, 0.08)
                      : alpha(t.palette.primary.main, 0.04),
                    transform: sidebarOpen ? 'translateX(4px)' : 'none',
                  }
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: sidebarOpen ? 40 : 'auto',
                    color: 'text.secondary',
                    transition: 'all 0.2s ease',
                    justifyContent: 'center',
                  }}
                >
                  {sec.icon}
                </ListItemIcon>
                {sidebarOpen && (
                  <ListItemText 
                    primary={sec.label}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'text.secondary',
                      transition: 'all 0.2s ease',
                    }}
                  />
                )}
              </ListItem>
            </Tooltip>
          ))}
        </List>
      </Box>
      
      {/* Bottom Section */}
      <Box sx={{ px: 0.5 }}>
        {/* Theme Toggle */}
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
        
        {/* Logout Button */}
        <Tooltip title={!sidebarOpen ? 'Logout' : ''} placement="right">
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={sidebarOpen ? <LogoutIcon /> : null}
            onClick={onLogout}
            sx={{ 
              borderRadius: 2, 
              fontWeight: 700,
              py: 1.5,
              px: sidebarOpen ? 2 : 1,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              textTransform: 'none',
              borderColor: (t) => alpha(t.palette.error.main, 0.3),
              color: 'error.main',
              transition: 'all 0.2s ease',
              minWidth: sidebarOpen ? 'auto' : '48px',
              '&:hover': {
                bgcolor: (t) => alpha(t.palette.error.main, 0.1),
                borderColor: 'error.main',
                transform: 'translateY(-2px)',
                boxShadow: (t) => `0 4px 12px ${alpha(t.palette.error.main, 0.25)}`,
              }
            }}
          >
            {sidebarOpen ? 'Logout' : <LogoutIcon />}
          </Button>
        </Tooltip>
        
        {/* Collapse Button */}
        <Tooltip title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'} placement="right">
          <Button
            fullWidth
            variant="text"
            onClick={onSidebarToggle}
            sx={{ 
              borderRadius: 2, 
              fontWeight: 600,
              py: 1.5,
              px: sidebarOpen ? 2 : 1,
              mt: 1,
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              textTransform: 'none',
              color: 'text.secondary',
              minWidth: sidebarOpen ? 'auto' : '48px',
              '&:hover': {
                bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                color: 'primary.main',
              }
            }}
          >
            {sidebarOpen ? (
              <>
                <ChevronLeftIcon sx={{ mr: 1 }} />
                Collapse
              </>
            ) : (
              <ChevronRightIcon />
            )}
          </Button>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
