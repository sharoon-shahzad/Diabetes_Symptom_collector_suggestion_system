import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Avatar, 
  Menu, 
  MenuItem, 
  Divider, 
  Modal, 
  TextField, 
  Alert, 
  IconButton, 
  Button,
  AppBar,
  Toolbar,
  Container
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginIcon from '@mui/icons-material/Login';
import { differenceInYears, parseISO } from 'date-fns';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../../utils/auth';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';

export default function UniversalHeader() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendError, setResendError] = useState('');
  const [changePwOpen, setChangePwOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const userData = await getCurrentUser();
        setUser(userData);
        setEmail(userData.email || '');
      }
    } catch (error) {
      console.log('User not authenticated');
    } finally {
      setLoading(false);
    }
  };

  // Calculate age
  let age = '';
  if (user?.date_of_birth) {
    const dob = typeof user.date_of_birth === 'string' ? parseISO(user.date_of_birth) : user.date_of_birth;
    age = differenceInYears(new Date(), dob);
  }

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLoginClick = () => {
    navigate('/signin');
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setAnchorEl(null);
      navigate('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleResendClick = () => {
    setResendSuccess('');
    setResendError('');
    setModalOpen(true);
    setAnchorEl(null);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleResendSubmit = async (e) => {
    e.preventDefault();
    setResendSuccess('');
    setResendError('');
    setResendLoading(true);
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        setResendError('Please enter a valid email address.');
        setResendLoading(false);
        return;
      }
      const token = localStorage.getItem('accessToken');
      const res = await axios.post('http://localhost:5000/api/v1/auth/resend-activation', { email }, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = res.data;
      if (res.status === 200) {
        setResendSuccess(data.message || 'If your account is inactive, a new activation link has been sent.');
        await checkAuthStatus(); // Refresh user data
      } else {
        setResendError(data.message || 'Failed to send activation link.');
      }
    } catch (err) {
      setResendError(err.response?.data?.message || 'Failed to send activation link.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleChangePwOpen = () => {
    setChangePwOpen(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPwSuccess('');
    setPwError('');
    setAnchorEl(null);
  };

  const handleChangePwClose = () => {
    setChangePwOpen(false);
  };

  const handleChangePwSubmit = async (e) => {
    e.preventDefault();
    setPwSuccess('');
    setPwError('');
    setPwLoading(true);
    // Frontend validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwError('All fields are required.');
      setPwLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      setPwLoading(false);
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setPwError('Password must be at least 8 characters and include at least 1 letter, 1 number, and 1 symbol.');
      setPwLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.post('http://localhost:5000/api/v1/auth/change-password', { currentPassword, newPassword }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = res.data;
      if (res.status === 200) {
        setPwSuccess(data.message || 'Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPwError(data.message || 'Failed to change password.');
      }
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return null; // Don't show header while checking auth status
  }

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: 'transparent',
          boxShadow: 'none',
          zIndex: 1200
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
            {/* Logo/Brand */}
            <Box display="flex" alignItems="center">
              <IconButton
                onClick={() => navigate('/')}
                sx={{
                  color: '#90caf9',
                  '&:hover': {
                    backgroundColor: 'rgba(144, 202, 249, 0.08)'
                  }
                }}
              >
                <MedicalServicesIcon sx={{ fontSize: 32 }} />
              </IconButton>
            </Box>

            {/* User Menu */}
            <Box display="flex" alignItems="center">
              {user ? (
                <>
                  <Typography variant="body2" color="#b0bec5" mr={2}>
                    Welcome, {user.fullName}
                  </Typography>
                  <IconButton onClick={handleAvatarClick} size="large">
                    <Avatar sx={{ bgcolor: '#90caf9', width: 40, height: 40 }}>
                      {user.fullName?.[0] || <AccountCircleIcon />}
                    </Avatar>
                  </IconButton>
                </>
              ) : (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<LoginIcon />}
                  onClick={handleLoginClick}
                  sx={{
                    color: '#90caf9',
                    borderColor: '#90caf9',
                    '&:hover': {
                      borderColor: '#1976d2',
                      backgroundColor: 'rgba(144, 202, 249, 0.08)'
                    }
                  }}
                >
                  Login
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* User Menu Dropdown */}
      {user && (
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ mt: 1 }}
        >
          <Box px={2} py={1}>
            <Typography variant="subtitle1" fontWeight="bold">{user?.fullName}</Typography>
            <Typography variant="body2" color="textSecondary">{user?.email}</Typography>
            <Typography variant="body2" mt={1}>
              Age: <b>{age}</b>
            </Typography>
            <Typography variant="body2" mt={1}>
              Account status: <b style={{ color: user?.isActivated ? 'green' : 'orange' }}>{user?.isActivated ? 'Active' : 'Inactive'}</b>
            </Typography>
          </Box>
          <Divider />
          <MenuItem onClick={handleChangePwOpen} sx={{ color: '#1976d2', fontWeight: 'bold' }}>
            Change Password
          </MenuItem>
          {!user?.isActivated && (
            <MenuItem onClick={handleResendClick} sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              Resend Activation Link
            </MenuItem>
          )}
          <MenuItem onClick={handleLogout} sx={{ color: 'red', fontWeight: 'bold' }}>
            Logout
          </MenuItem>
        </Menu>
      )}

      {/* Resend Activation Modal */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 360,
            bgcolor: '#1e2a3a',
            color: 'white',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Resend Activation Link
          </Typography>
          <form onSubmit={handleResendSubmit}>
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
              InputProps={{ style: { color: '#fff' } }}
              InputLabelProps={{ style: { color: '#aaa' } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
            {resendSuccess && <Alert severity="success" sx={{ mb: 2 }}>{resendSuccess}</Alert>}
            {resendError && <Alert severity="error" sx={{ mb: 2 }}>{resendError}</Alert>}
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: '#1976d2', color: '#fff', fontWeight: 'bold', borderRadius: 2 }}
              type="submit"
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending...' : 'Send Activation Link'}
            </Button>
          </form>
        </Box>
      </Modal>

      {/* Change Password Modal */}
      <Modal open={changePwOpen} onClose={handleChangePwClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 360,
            bgcolor: '#1e2a3a',
            color: 'white',
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
          }}
        >
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Change Password
          </Typography>
          <form onSubmit={handleChangePwSubmit}>
            <TextField
              label="Current Password"
              type={showCurrentPw ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowCurrentPw((show) => !show)} edge="end" sx={{ color: '#fff' }}>
                    {showCurrentPw ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
                style: { color: '#fff' }
              }}
              InputLabelProps={{ style: { color: '#aaa' } }}
            />
            <TextField
              label="New Password"
              type={showNewPw ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowNewPw((show) => !show)} edge="end" sx={{ color: '#fff' }}>
                    {showNewPw ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
                style: { color: '#fff' }
              }}
              InputLabelProps={{ style: { color: '#aaa' } }}
            />
            <TextField
              label="Confirm New Password"
              type={showConfirmPw ? 'text' : 'password'}
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setShowConfirmPw((show) => !show)} edge="end" sx={{ color: '#fff' }}>
                    {showConfirmPw ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
                style: { color: '#fff' }
              }}
              InputLabelProps={{ style: { color: '#aaa' } }}
            />
            {pwSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwSuccess}</Alert>}
            {pwError && <Alert severity="error" sx={{ mb: 2 }}>{pwError}</Alert>}
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2, backgroundColor: '#1976d2', color: '#fff', fontWeight: 'bold', borderRadius: 2 }}
              type="submit"
              disabled={pwLoading}
            >
              {pwLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </Box>
      </Modal>
    </>
  );
} 