import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export default function ActivateAccount() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function activate() {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/auth/activate/${token}`);
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Your account has been activated. You can now log in.');
          setTimeout(() => navigate('/signin'), 3000);
        } else {
          setStatus('error');
          setMessage(data.message || 'Activation failed.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Activation failed. Please try again later.');
      }
    }
    activate();
  }, [token, navigate]);

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#0B1120">
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, minWidth: 340, textAlign: 'center', background: '#fff' }}>
        {status === 'loading' && <CircularProgress sx={{ color: '#1976d2', mb: 2 }} />}
        {status === 'success' && <CheckCircleIcon sx={{ color: 'green', fontSize: 48, mb: 1 }} />}
        {status === 'error' && <ErrorIcon sx={{ color: 'red', fontSize: 48, mb: 1 }} />}
        <Typography variant="h6" color={status === 'error' ? 'error' : 'primary'} gutterBottom>
          {message}
        </Typography>
        {status === 'success' && (
          <Typography variant="body2" color="textSecondary">
            Redirecting to login page...
          </Typography>
        )}
        {status === 'error' && (
          <Button variant="contained" color="primary" onClick={() => navigate('/signin')} sx={{ mt: 2 }}>
            Go to Login
          </Button>
        )}
      </Paper>
    </Box>
  );
} 