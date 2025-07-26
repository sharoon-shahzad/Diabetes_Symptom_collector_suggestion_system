// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import SignInSide from './pages/SignInSide';
import SignUpSide from './pages/SignUpSide';
import ActivateAccount from './pages/ActivateAccount';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import UniversalHeader from './components/Common/UniversalHeader';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Component to conditionally render header
const AppContent = () => {
  const location = useLocation();
  
  // Pages where we don't want the universal header
  const noHeaderPages = ['/signin', '/signup', '/forgotpassword', '/reset-password', '/'];
  const shouldShowHeader = !noHeaderPages.includes(location.pathname) && 
                          !location.pathname.startsWith('/activate/') &&
                          !location.pathname.startsWith('/reset-password/');

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #23272f 60%, #0B1120 100%)' }}>
      {shouldShowHeader && <UniversalHeader />}
      <Box sx={{ pt: shouldShowHeader ? 4 : 0 }}> {/* Only add top padding if header is shown */}
        <Routes>
          <Route path="/signin" element={<SignInSide />} />
          <Route path="/signup" element={<SignUpSide />} />
          <Route path="/activate/:token" element={<ActivateAccount />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/" element={<SignInSide />} />
        </Routes>
      </Box>
      <ToastContainer position="top-right" autoClose={3000} />
    </Box>
  );
};

const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
