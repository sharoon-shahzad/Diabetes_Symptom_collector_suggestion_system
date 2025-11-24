// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/useThemeContext';
import LandingPage from './pages/LandingPage';
import SignInSide from './pages/SignInSide';
import SignUpSide from './pages/SignUpSide';
import ActivateAccount from './pages/ActivateAccount';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Onboarding from './pages/Onboarding';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UniversalHeader from './components/Common/UniversalHeader';
import CMSManagement from './cms/pages/CMSManagement';
import PublicCMS from './cms/pages/PublicCMS';
import DocumentUpload from './admin/DocumentUpload';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Component to conditionally render header
const AppContent = () => {
  const location = useLocation();
  const { isDarkMode } = useTheme();
  
  // Pages where we don't want the universal header
  const noHeaderPages = ['/signin', '/signup', '/forgotpassword', '/reset-password', '/'];
  const shouldShowHeader = !noHeaderPages.includes(location.pathname) && 
                          !location.pathname.startsWith('/activate/') &&
                          !location.pathname.startsWith('/reset-password/') &&
                          !location.pathname.startsWith('/content/');

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: (theme) => theme.palette.background.gradient || theme.palette.background.default,
      transition: 'background 0.3s ease'
    }}>
      {shouldShowHeader && <UniversalHeader />}
      <Box> {/* Removed top padding to eliminate space between header and content */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin" element={<SignInSide />} />
          <Route path="/signup" element={<SignUpSide />} />
          <Route path="/activate/:token" element={<ActivateAccount />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/upload" element={<DocumentUpload />} />
          <Route path="/cms" element={<CMSManagement />} />
          <Route path="/content" element={<PublicCMS />} />
          <Route path="/content/:slug" element={<PublicCMS />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </Box>
      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        theme={isDarkMode ? 'dark' : 'light'}
      />
    </Box>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;
