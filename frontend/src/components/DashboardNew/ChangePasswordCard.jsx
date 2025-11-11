import React, { useState } from 'react';
import { Paper, Box, Typography, TextField, Button, Alert } from '@mui/material';
import { alpha } from '@mui/material/styles';

const ChangePasswordCard = ({ onSubmit, loading, error, success }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const canSubmit = () => {
    return form.currentPassword && form.newPassword && form.newPassword.length >= 8 && form.newPassword === form.confirm;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit()) return;
    onSubmit?.(form.currentPassword, form.newPassword);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 4,
        background: (t) => `linear-gradient(135deg, ${t.palette.background.paper}, ${alpha(t.palette.secondary.main, 0.04)})`,
        border: (t) => `2px solid ${alpha(t.palette.secondary.main, 0.15)}`,
      }}
    >
      <Typography variant="h6" fontWeight={900} sx={{ mb: 2 }}>Security</Typography>
      {success && <Alert severity="success" sx={{ mb: 2 }}>Password changed successfully.</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField fullWidth label="Current Password" name="currentPassword" type="password" sx={{ mb: 2 }} value={form.currentPassword} onChange={handleChange} />
        <TextField fullWidth label="New Password" name="newPassword" type="password" sx={{ mb: 2 }} value={form.newPassword} onChange={handleChange} helperText="At least 8 characters" />
        <TextField fullWidth label="Confirm New Password" name="confirm" type="password" sx={{ mb: 2 }} value={form.confirm} onChange={handleChange} />
        <Button type="submit" variant="contained" disabled={!canSubmit() || loading}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 800,
            background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.secondary.main})`,
          }}
        >
          {loading ? 'Updating…' : 'Change Password'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ChangePasswordCard;
