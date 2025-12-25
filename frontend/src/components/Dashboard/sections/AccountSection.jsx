import React from 'react';
import { Box, Paper, Typography, Avatar, Chip, Divider, Alert, TextField, Grid, Button, CircularProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';

export default function AccountSection({ user, setUser, profileError, savingProfile, handleSaveProfile }) {
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: { xs: 3, md: 4 }, 
        borderRadius: 3,
        background: (t) => t.palette.background.paper,
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      {/* Header */}
      <Box sx={{ 
        mb: 5,
        animation: 'slideIn 0.7s ease-out',
        '@keyframes slideIn': {
          from: { opacity: 0, transform: 'translateX(-20px)' },
          to: { opacity: 1, transform: 'translateX(0)' }
        }
      }}>
        <Box display="flex" alignItems="center" gap={3} mb={2}>
          <Avatar 
            sx={{ 
              width: 72, 
              height: 72,
              bgcolor: 'primary.main',
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'primary.contrastText',
            }}
          >
            {user?.fullName?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Box flex={1}>
            <Typography 
              variant="h5" 
              fontWeight={800}
              sx={{ mb: 0.5 }}
            >
              {user?.fullName || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {user?.email}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(user?.roles || []).map((r) => (
                <Chip 
                  key={r} 
                  label={r} 
                  size="small" 
                  sx={{ 
                    fontWeight: 600,
                    background: (t) => alpha(t.palette.primary.main, 0.08),
                    border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
                  }} 
                />
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      <Divider sx={{ mb: 4 }} />

      {/* Profile Info Section */}
      <Box sx={{ 
        mb: 5,
        animation: 'fadeInUp 0.8s ease-out 0.2s backwards',
      }}>
        <Typography variant="h6" fontWeight={800} sx={{ mb: 3.5 }}>Personal Information</Typography>
        
        {profileError && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: 3,
              animation: 'shake 0.5s ease',
              '@keyframes shake': {
                '0%, 100%': { transform: 'translateX(0)' },
                '25%': { transform: 'translateX(-8px)' },
                '75%': { transform: 'translateX(8px)' }
              }
            }}
          >
            {profileError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSaveProfile}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                }
              }}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={700} 
                  sx={{ 
                    mb: 1, 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    textTransform: 'uppercase', 
                    letterSpacing: 1.2,
                  }}
                >
                  <EditIcon sx={{ fontSize: 14 }} />
                  Full Name
                </Typography>
                <TextField 
                  fullWidth 
                  name="fullName"
                  defaultValue={user?.fullName || ''}
                  onChange={(e) => {
                    setUser((u) => ({ ...u, fullName: e.target.value }));
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={700} 
                  sx={{ 
                    mb: 1, 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    textTransform: 'uppercase', 
                    letterSpacing: 1.2,
                  }}
                >
                  <LockIcon sx={{ fontSize: 14 }} />
                  Email Address
                </Typography>
                <Box sx={{ 
                  p: 1.8, 
                  borderRadius: 2.5,
                  bgcolor: (t) => alpha(t.palette.action.disabled, 0.04),
                  border: (t) => `1px dashed ${alpha(t.palette.divider, 0.15)}`,
                  filter: 'blur(0.4px)',
                  opacity: 0.65,
                  transition: 'all 0.3s ease',
                  fontSize: '1.05rem',
                  '&:hover': {
                    opacity: 0.8,
                    filter: 'blur(0.3px)',
                  }
                }}>
                  <Typography variant="body1" fontWeight={500}>{user?.email}</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                disabled={savingProfile}
                startIcon={savingProfile ? <CircularProgress size={20} /> : <EditIcon />}
                sx={{ 
                  mt: 2,
                  px: 5,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  boxShadow: (t) => `0 4px 14px ${alpha(t.palette.primary.main, 0.3)}`,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: (t) => `0 6px 20px ${alpha(t.palette.primary.main, 0.4)}`,
                  }
                }}
              >
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
}
