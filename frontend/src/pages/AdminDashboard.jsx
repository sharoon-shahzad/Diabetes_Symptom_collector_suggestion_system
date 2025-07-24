import React, { useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline, Paper, Divider, Avatar, Tooltip, GlobalStyles } from '@mui/material';
import HealingIcon from '@mui/icons-material/Healing';
import BugReportIcon from '@mui/icons-material/BugReport';
import QuizIcon from '@mui/icons-material/Quiz';
import ManageDiseases from '../admin/ManageDiseases';
import ManageSymptoms from '../admin/ManageSymptoms';
import ManageQuestions from '../admin/ManageQuestions';
import UserManagement from '../admin/UserManagement';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Header from '../components/Common/Header';
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
      {/* Custom AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: 1300,
          bgcolor: 'rgba(25, 118, 210, 0.95)',
          boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.08)',
          backdropFilter: 'blur(8px)',
          fontFamily,
        }}
      >
        <Toolbar sx={{ minHeight: 72, px: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: '#fff', color: '#1976d2', width: 44, height: 44, fontWeight: 600, fontSize: 24, boxShadow: 2 }}>
              <QuizIcon fontSize="medium" />
            </Avatar>
            <Typography variant="h5" fontWeight={700} color="#fff" letterSpacing={0.5} sx={{ fontFamily, fontSize: { xs: 22, md: 28 } }}>
            Admin Dashboard
          </Typography>
          </Box>
          {user && <Header user={user} onLogout={handleLogout} />}
        </Toolbar>
      </AppBar>
      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#1e2a3a',
            color: '#fff',
            borderTopRightRadius: 32,
            borderBottomRightRadius: 32,
            boxShadow: '4px 0 24px 0 rgba(30,42,58,0.12)',
            border: 'none',
            pt: 2,
            fontFamily,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 2, mt: 2 }}>
          <Typography variant="subtitle2" color="#90caf9" fontWeight={600} mb={2} letterSpacing={0.2} sx={{ fontFamily, fontSize: 13 }}>
            ADMIN MENU
          </Typography>
          <Divider sx={{ bgcolor: '#1976d2', mb: 2 }} />
        <List>
          {sections.map((section, idx) => (
              <Tooltip key={section.label} title={section.label} placement="right" arrow>
                <ListItem
                  component="button"
                  selected={selectedIndex === idx}
                  onClick={() => setSelectedIndex(idx)}
                  sx={{
                    mb: 1.2,
                    borderRadius: 2,
                    bgcolor: selectedIndex === idx ? '#1976d2' : 'transparent',
                    color: selectedIndex === idx ? '#fff' : '#b0bec5',
                    boxShadow: selectedIndex === idx ? 2 : 0,
                    transition: 'all 0.2s',
                    fontFamily,
                    fontWeight: selectedIndex === idx ? 600 : 500,
                    fontSize: 15,
                    letterSpacing: 0.1,
                    minHeight: 48,
                    '&:hover': {
                      bgcolor: '#1565c0',
                      color: '#fff',
                      boxShadow: 3,
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 36 }}>{section.icon}</ListItemIcon>
                  <ListItemText primary={section.label} primaryTypographyProps={{ fontWeight: 500, fontSize: 15, fontFamily }} />
            </ListItem>
              </Tooltip>
          ))}
        </List>
        </Box>
      </Drawer>
      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, md: 4 },
          ml: { md: `${drawerWidth}px` },
          mt: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: 'transparent',
          fontFamily,
        }}
      >
        <Paper
          elevation={4}
          sx={{
            width: '100%',
            maxWidth: 900,
            minHeight: 420,
            borderRadius: 6,
            p: 4,
            mt: 2,
            boxShadow: '0 8px 32px 0 rgba(25, 118, 210, 0.10)',
            background: 'linear-gradient(135deg, #fff 60%, #e3f0ff 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            fontFamily,
          }}
        >
        {sections[selectedIndex].component}
        </Paper>
      </Box>
    </Box>
  );
} 