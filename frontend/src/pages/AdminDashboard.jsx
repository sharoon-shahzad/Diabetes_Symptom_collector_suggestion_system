import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography, CssBaseline, Paper, Avatar, Divider, Button, GlobalStyles
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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DocumentUpload from '../admin/DocumentUpload';
import ForumIcon from '@mui/icons-material/Forum';
import AdminFeedback from '../admin/AdminFeedback';
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
        { label: 'Content Management', icon: <ArticleIcon />, component: <CMSManagement /> },
        { label: 'Feedback (Admin)', icon: <ForumIcon />, component: <AdminFeedback /> }
      );
    }

    // Add super admin sections if user has super admin role
    if (userRoles.includes('super_admin')) {
      baseSections.push(
        { label: 'Document Upload', icon: <CloudUploadIcon />, component: <DocumentUpload /> },
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
      
      {/* Sidebar - Clean & Minimal */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            py: 3,
            px: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: (t) => t.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
            borderRight: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
          },
        }}
      >
        <Box>
          {/* User Profile Header - Clean & Minimal */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              px: 1.5,
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
              {user?.fullName?.[0]?.toUpperCase() || 'A'}
            </Avatar>
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
                {user?.fullName || 'Admin'}
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                {userRoles.includes('super_admin') ? 'Super Admin' : 
                 userRoles.includes('admin') ? 'Admin' : 'User'}
              </Typography>
            </Box>
          </Box>
          
          {/* Navigation Menu - Clean List */}
          <List sx={{ px: 0 }}>
            {sections.map((sec, index) => (
              <ListItem disablePadding key={sec.label}>
                <ListItemButton
                  selected={selectedIndex === index}
                  onClick={() => setSelectedIndex(index)}
                  sx={{
                    borderRadius: 1.5,
                    mb: 0.5,
                    px: 1.5,
                    py: 1.25,
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
                      minWidth: 36,
                      color: 'text.secondary',
                      transition: 'color 0.2s ease',
                    }}
                  >
                    {sec.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={sec.label}
                    primaryTypographyProps={{
                      component: 'span',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'text.secondary',
                    }}
                  />
                </ListItemButton>
              </ListItem>
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
          <Button
            fullWidth
            variant="text"
            color="error"
            onClick={handleLogout}
            sx={{ 
              borderRadius: 1.5, 
              fontWeight: 600,
              py: 1.25,
              px: 1.5,
              justifyContent: 'flex-start',
              color: 'text.secondary',
              '&:hover': {
                bgcolor: (t) => `rgba(${t.palette.mode === 'dark' ? '244, 67, 54' : '211, 47, 47'}, 0.08)`,
                color: 'error.main',
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
      
      {/* Main Content - No Card Wrapper */}
      <Box component="main" sx={{
        flexGrow: 1,
        p: { xs: 3, md: 4 },
        ml: 0,
        mt: 0,
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {sections[selectedIndex]?.component}
        </Box>
      </Box>
    </Box>
  );
} 