import React, { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth';
import Header from '../components/Common/Header';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        // If not authenticated, redirect to login
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
    <Box minHeight="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" bgcolor="#0B1120" position="relative">
      {/* Global Header */}
      {user && <Header user={user} onLogout={handleLogout} />}

      {/* Main Dashboard Content */}
      <Typography variant="h3" color="white" align="center">
        Dashboard
      </Typography>
    </Box>
  );
} 