import React, { useState } from 'react';
import axios from 'axios';
import { Paper, Typography, TextField, Button, Alert } from '@mui/material';

export default function ResetPasswordForm({ token, setSuccess, setError, navigate }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const validate = () => {
    if (!password || !confirmPassword) {
      setLocalError('All fields are required.');
      return false;
    }
    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters.');
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError('Passwords do not match.');
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
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      setSuccess(res.data.message || 'Your password has been reset. You can now log in.');
      setTimeout(() => navigate('/signin'), 2000);
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
        Reset Password
      </Typography>
      {localError && <Alert severity="error" sx={{ mb: 2 }}>{localError}</Alert>}
      <form onSubmit={handleSubmit}>
        <TextField
          label="New Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={e => setPassword(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          InputProps={{ style: { color: '#fff' } }}
          InputLabelProps={{ style: { color: '#aaa' } }}
        />
        <TextField
          label="Confirm Password"
          type="password"
          fullWidth
          margin="normal"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
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
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </Paper>
  );
} 