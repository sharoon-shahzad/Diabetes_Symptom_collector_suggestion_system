import React, { useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, CssBaseline, Paper, Divider, Avatar, Tooltip, GlobalStyles } from '@mui/material';
import HealingIcon from '@mui/icons-material/Healing';
import BugReportIcon from '@mui/icons-material/BugReport';
import QuizIcon from '@mui/icons-material/Quiz';
import ManageDiseases from '../admin/ManageDiseases';
import ManageSymptoms from '../admin/ManageSymptoms';
import ManageQuestions from '../admin/ManageQuestions';
import UserManagement from '../admin/UserManagement';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { getCurrentUser, logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

// Import Inter font from Google Fonts
const fontUrl = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';

const drawerWidth = 270;

const fontFamily = `'Inter', 'Roboto', 'Open Sans', 'Helvetica Neue', Arial, sans-serif`;

const sections = [
  { label: 'Manage Diseases', icon: <HealingIcon />, component: <ManageDiseases /> },
  { label: 'Manage Symptoms', icon: <BugReportIcon />, component: <ManageSymptoms /> },
  { label: 'Manage Questions', icon: <QuizIcon />, component: <ManageQuestions /> },
  { label: 'User Management', icon: <AccountCircleIcon />, component: <UserManagement /> },
];

export default function AdminDashboard() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Dynamically inject Google Fonts link for Inter
    if (!document.getElementById('inter-font')) {
      const link = document.createElement('link');
      link.id = 'inter-font';
      link.rel = 'stylesheet';
      link.href = fontUrl;
      document.head.appendChild(link);
    }
    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        navigate('/signin');
      }
    }
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #e3f0ff 0%, #fafcff 100%)',
        position: 'relative',
        fontFamily,
      }}
    >
      <GlobalStyles styles={{
        body: { fontFamily },
        '*': { fontFamily },
      }} />
      <CssBaseline />
      
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            bgcolor: '#fff',
            borderRight: '1px solid #e0e0e0',
            boxShadow: '4px 0 24px 0 rgba(0,0,0,0.08)',
            fontFamily,
          },
        }}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid #e0e0e0' }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
              <QuizIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} color="#1976d2">
                Admin Panel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.fullName}
              </Typography>
            </Box>
          </Box>
        </Box>
        <List sx={{ pt: 2 }}>
          {sections.map((section, idx) => (
            <ListItem
              key={section.label}
              selected={selectedIndex === idx}
              onClick={() => setSelectedIndex(idx)}
              sx={{
                mx: 2,
                mb: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: '#e3f0ff',
                  color: '#1976d2',
                  '&:hover': {
                    bgcolor: '#e3f0ff',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ color: selectedIndex === idx ? '#1976d2' : '#666' }}>
                {section.icon}
              </ListItemIcon>
              <ListItemText 
                primary={section.label} 
                primaryTypographyProps={{ 
                  fontWeight: selectedIndex === idx ? 600 : 400 
                }}
              />
            </ListItem>
          ))}
        </List>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { md: `${drawerWidth}px` },
          pt: 10, // Add top padding for universal header
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            bgcolor: '#fff',
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)',
            minHeight: 'calc(100vh - 120px)',
          }}
        >
          {sections[selectedIndex]?.component}
        </Paper>
      </Box>
    </Box>
  );
} 