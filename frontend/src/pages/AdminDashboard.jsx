import React, { useState, useEffect } from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, AppBar, Toolbar, Typography, CssBaseline } from '@mui/material';
import HealingIcon from '@mui/icons-material/Healing';
import BugReportIcon from '@mui/icons-material/BugReport';
import QuizIcon from '@mui/icons-material/Quiz';
import ManageDiseases from '../admin/ManageDiseases';
import ManageSymptoms from '../admin/ManageSymptoms';
import ManageQuestions from '../admin/ManageQuestions';
import Header from '../components/Common/Header';
import { getCurrentUser, logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const sections = [
  { label: 'Manage Diseases', icon: <HealingIcon />, component: <ManageDiseases /> },
  { label: 'Manage Symptoms', icon: <BugReportIcon />, component: <ManageSymptoms /> },
  { label: 'Manage Questions', icon: <QuizIcon />, component: <ManageQuestions /> },
];

export default function AdminDashboard() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
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
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f6fb', position: 'relative' }}>
      <CssBaseline />
      {/* Profile Icon at Top Right */}
      {user && <Header user={user} onLogout={handleLogout} />}
      <AppBar position="fixed" sx={{ zIndex: 1201, bgcolor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', bgcolor: '#1e2a3a', color: '#fff' },
        }}
      >
        <Toolbar />
        <List>
          {sections.map((section, idx) => (
            <ListItem component="button" key={section.label} selected={selectedIndex === idx} onClick={() => setSelectedIndex(idx)}>
              <ListItemIcon sx={{ color: '#fff' }}>{section.icon}</ListItemIcon>
              <ListItemText primary={section.label} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: `${drawerWidth}px` }}>
        <Toolbar />
        {sections[selectedIndex].component}
      </Box>
    </Box>
  );
} 