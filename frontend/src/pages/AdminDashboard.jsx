import React, { useState, useEffect } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography, CssBaseline, Paper, Avatar, Divider, Button, GlobalStyles, IconButton, Tooltip
} from '@mui/material';
import HealingIcon from '@mui/icons-material/Healing';
import BugReportIcon from '@mui/icons-material/BugReport';
import QuizIcon from '@mui/icons-material/Quiz';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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
import HistoryIcon from '@mui/icons-material/History';
import AuditLogs from '../admin/AuditLogs';
import { getCurrentUser, logout } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../components/Common/ThemeToggle';
import CMSManagement from '../cms/pages/CMSManagement';

const drawerWidth = 220;
const miniDrawerWidth = 64;
const fontFamily = `'Inter', 'Roboto', 'Open Sans', 'Helvetica Neue', Arial, sans-serif`;

export default function AdminDashboard() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [user, setUser] = useState(null);
  const [userRoles, setUserRoles] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar collapse state
  const [mobileOpen, setMobileOpen] = useState(false); // Mobile drawer state
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
      let retryCount = 0;
      const maxRetries = 3;
      
      const attemptFetch = async () => {
        try {
          // Wait a bit for token to be set if this is right after login
          if (retryCount === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
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
        } catch (error) {
          // Retry if we haven't exceeded max retries
          if (retryCount < maxRetries && localStorage.getItem('accessToken')) {
            retryCount++;
            setTimeout(attemptFetch, 500);
          } else {
            // Only redirect if there's no token at all
            if (!localStorage.getItem('accessToken')) {
              navigate('/signin');
            }
          }
        }
      };
      
      attemptFetch();
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
        { label: 'Feedback (Admin)', icon: <ForumIcon />, component: <AdminFeedback /> },
        { label: 'Audit Logs', icon: <HistoryIcon />, component: <AuditLogs /> }
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
      
      {/* Sidebar - Clean & Minimal with Mini Variant - Responsive */}
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
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
            background: (t) => t.palette.mode === 'dark' ? '#1a1a1a' : '#ffffff',
            borderRight: (t) => `1px solid ${t.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'}`,
          },
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 2, mb: 3 }}>
            <Avatar sx={{ width: 40, height: 40, background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`, fontWeight: 700 }}>
              {user?.fullName?.[0]?.toUpperCase() || 'A'}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700}>{user?.fullName || 'Admin'}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {userRoles.includes('super_admin') ? 'Super Admin' : userRoles.includes('admin') ? 'Admin' : 'User'}
              </Typography>
            </Box>
          </Box>
          <List sx={{ px: 0 }}>
            {sections.map((sec, index) => (
              <ListItem disablePadding key={sec.label}>
                <ListItemButton
                  selected={selectedIndex === index}
                  onClick={() => { setSelectedIndex(index); setMobileOpen(false); }}
                  sx={{ borderRadius: 1.5, mb: 0.5, px: 1.5, py: 1.25, '&.Mui-selected': { bgcolor: (t) => t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', '& .MuiListItemIcon-root': { color: 'primary.main' } } }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>{sec.icon}</ListItemIcon>
                  <ListItemText primary={sec.label} primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box sx={{ px: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, mb: 1 }}>
            <ThemeToggle size="medium" />
          </Box>
          <Button fullWidth variant="text" color="error" onClick={handleLogout} sx={{ borderRadius: 1.5, fontWeight: 600, py: 1.25 }}>Logout</Button>
        </Box>
      </Drawer>
      
      {/* Desktop/Tablet Drawer */}
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
              {user?.fullName?.[0]?.toUpperCase() || 'A'}
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
            )}
          </Box>
          
          {/* Navigation Menu - Clean List */}
          <List sx={{ px: 0 }}>
            {sections.map((sec, index) => (
              <Tooltip title={!sidebarOpen ? sec.label : ''} placement="right" key={sec.label}>
                <ListItem disablePadding>
                  <ListItemButton
                    selected={selectedIndex === index}
                    onClick={() => setSelectedIndex(index)}
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
              color="error"
              onClick={handleLogout}
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
              onClick={() => setSidebarOpen(!sidebarOpen)}
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
      
      {/* Main Content - No Card Wrapper */}
      <Box component="main" sx={{
        flexGrow: 1,
        p: { xs: 3, md: 4 },
        ml: 0,
        mt: 0,
        minHeight: '100vh',
        bgcolor: 'background.default',
        transition: 'margin 0.3s ease',
        width: { xs: '100%', md: `calc(100% - ${sidebarOpen ? drawerWidth : miniDrawerWidth}px)` },
      }}>
        {/* Mobile Menu Button */}
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1200,
            bgcolor: 'background.paper',
            boxShadow: 3,
            '&:hover': {
              bgcolor: 'primary.main',
              color: 'white',
            }
          }}
        >
          <MenuIcon />
        </IconButton>
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
          {sections[selectedIndex]?.component}
        </Box>
      </Box>
    </Box>
  );
} 