import React, { useState } from 'react';
import axios from 'axios';
import { Paper, Typography, TextField, Button, Alert } from '@mui/material';

export default function ForgotPasswordForm({ setSuccess, setError }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const validate = () => {
    if (!email) {
      setLocalError('Email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Invalid email format.');
      return false;
    }
    setLocalError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/auth/forgot-password', { email });
      setSuccess(res.data.message || 'If this email is registered, a password reset link has been sent.');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        width: 360,
        backgroundColor: '#060c1a',
        borderRadius: 3,
        color: 'white',
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Forgot Password
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={2}>
        Enter your registered email address. We'll send you a link to reset your password.
      </Typography>
      {localError && <Alert severity="error" sx={{ mb: 2 }}>{localError}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={e => setEmail(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          InputProps={{ style: { color: '#fff' } }}
          InputLabelProps={{ style: { color: '#aaa' } }}
        />
        <Button
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            backgroundColor: '#ffffff',
            color: '#1e2a3a',
            fontWeight: 'bold',
            borderRadius: 2,
            '&:hover': {
              backgroundColor: '#f0f0f0',
            },
          }}
          type="submit"
          disabled={loading || !email || !!localError}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
    </Paper>
  );
}
