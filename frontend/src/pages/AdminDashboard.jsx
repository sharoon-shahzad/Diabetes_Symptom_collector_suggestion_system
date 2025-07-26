import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, CssBaseline, Paper, Avatar, Divider, Button, GlobalStyles
} from '@mui/material';
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

const drawerWidth = 220;
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
    if (!document.getElementById('inter-font')) {
      const link = document.createElement('link');
      link.id = 'inter-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B1120' }}>
      <CssBaseline />
      <GlobalStyles styles={{ body: { fontFamily }, '*': { fontFamily } }} />
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            bgcolor: '#1e2a3a',
            color: '#fff',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            boxShadow: '4px 0 24px 0 rgba(30,42,58,0.12)',
            border: 'none',
            pt: 0,
            px: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <Box>
          {/* User Info */}
          <Box display="flex" flexDirection="column" alignItems="center" py={2}>
            <Avatar sx={{ bgcolor: '#90caf9', width: 40, height: 40, mb: 1, fontSize: 20 }}>
              {user?.fullName?.[0] || 'A'}
            </Avatar>
            <Typography fontWeight={700} fontSize={16}>{user?.fullName}</Typography>
            {/* Optionally add email or role here if needed */}
          </Box>
          <Divider sx={{ my: 1, bgcolor: '#263445' }} />
          {/* Navigation */}
          <List>
            {sections.map((section, idx) => (
              <ListItem
                key={section.label}
                selected={selectedIndex === idx}
                onClick={() => setSelectedIndex(idx)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  '&.Mui-selected': {
                    bgcolor: '#263445',
                  },
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                }}
              >
                <ListItemIcon sx={{ color: '#90caf9', minWidth: 36 }}>{section.icon}</ListItemIcon>
                <ListItemText primary={<Typography fontWeight={600}>{section.label}</Typography>} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box pb={2} px={2}>
          <Divider sx={{ mb: 1, bgcolor: '#263445' }} />
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={handleLogout}
            sx={{ borderRadius: 2, fontWeight: 700, borderColor: '#ef5350', color: '#ef5350', '&:hover': { bgcolor: '#2d3846', borderColor: '#ef5350' } }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
      {/* Main Content */}
      <Box component="main" sx={{
        flexGrow: 1,
        p: { xs: 2, md: 6 },
        ml: 0,
        mt: 0,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#101624',
      }}>
        <Paper elevation={6} sx={{
          width: '100%',
          maxWidth: 1000,
          minHeight: 480,
          borderRadius: 6,
          p: { xs: 2, md: 5 },
          mt: 2,
          boxShadow: '0 8px 32px 0 rgba(25, 118, 210, 0.10)',
          background: '#263445',
          color: '#fff',
        }}>
          {sections[selectedIndex]?.component}
        </Paper>
      </Box>
    </Box>
  );
} 