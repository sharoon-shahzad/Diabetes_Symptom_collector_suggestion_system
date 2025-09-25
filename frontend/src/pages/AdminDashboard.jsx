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
import ManageAdmins from '../admin/ManageAdmins';
import ManageRolesPermissions from '../admin/ManageRolesPermissions';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import ArticleIcon from '@mui/icons-material/Article';
import { getCurrentUser, logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/Common/ThemeToggle';
import CMSManagement from '../cms/pages/CMSManagement';

const drawerWidth = 220;
const fontFamily = `'Inter', 'Roboto', 'Open Sans', 'Helvetica Neue', Arial, sans-serif`;

export default function AdminDashboard() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
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
        
        // Fetch user roles to determine available sections
        const token = localStorage.getItem('accessToken');
        const rolesResponse = await fetch('http://localhost:5000/api/v1/users/roles', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (rolesResponse.ok) {
          const rolesData = await rolesResponse.json();
          setUserRoles(rolesData.data || []);
        }
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

  // Define sections based on user role
  const getSections = () => {
    const baseSections = [
      { label: 'Manage Diseases', icon: <HealingIcon />, component: <ManageDiseases /> },
      { label: 'Manage Symptoms', icon: <BugReportIcon />, component: <ManageSymptoms /> },
      { label: 'Manage Questions', icon: <QuizIcon />, component: <ManageQuestions /> },
      { label: 'User Management', icon: <AccountCircleIcon />, component: <UserManagement /> },
    ];

    // Add CMS management for users with content permissions
    if (userRoles.includes('super_admin') || userRoles.includes('admin')) {
      baseSections.push(
        { label: 'Content Management', icon: <ArticleIcon />, component: <CMSManagement /> }
      );
    }

    // Add super admin sections if user has super admin role
    if (userRoles.includes('super_admin')) {
      baseSections.push(
        { label: 'Manage Admins', icon: <AdminPanelSettingsIcon />, component: <ManageAdmins /> },
        { label: 'Manage Roles & Permissions', icon: <SecurityIcon />, component: <ManageRolesPermissions /> }
      );
    }

    return baseSections;
  };

  const sections = getSections();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
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
            bgcolor: 'background.sidebar',
            color: 'text.primary',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            boxShadow: '4px 0 24px 0 rgba(0,0,0,0.12)',
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
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, mb: 1, fontSize: 20 }}>
              {user?.fullName?.[0] || 'A'}
            </Avatar>
            <Typography fontWeight={700} fontSize={16}>{user?.fullName}</Typography>
            <Typography fontSize={12} color="text.secondary" textAlign="center">
              {userRoles.includes('super_admin') ? 'Super Admin' : 
               userRoles.includes('admin') ? 'Admin' : 'User'}
            </Typography>
          </Box>
          <Divider sx={{ my: 1, bgcolor: 'divider' }} />
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
                    bgcolor: 'action.selected',
                  },
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main', minWidth: 36 }}>{section.icon}</ListItemIcon>
                <ListItemText primary={<Typography fontWeight={600}>{section.label}</Typography>} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box pb={2} px={2}>
          <Divider sx={{ mb: 1, bgcolor: 'divider' }} />
          <Box display="flex" justifyContent="center" mb={1}>
            <ThemeToggle size="small" />
          </Box>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={handleLogout}
            sx={{ borderRadius: 2, fontWeight: 700 }}
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
        background: 'background.default',
      }}>
        <Paper elevation={6} sx={{
          width: '100%',
          maxWidth: 1000,
          minHeight: 480,
          borderRadius: 6,
          p: { xs: 2, md: 5 },
          mt: 2,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.10)',
          background: 'background.paper',
          color: 'text.primary',
        }}>
          {sections[selectedIndex]?.component}
        </Paper>
      </Box>
    </Box>
  );
} 