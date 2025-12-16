import React, { useState } from 'react';
import { Stack, Typography, Button, Box } from '@mui/material';
import SignInForm from '../components/SignIn/SignInForm';
import DiabetesQuotes from '../components/Common/DiabetesQuotes';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/useThemeContext';

export default function SignInSide() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  return (
    <Stack
      direction="column"
      component="main"
      sx={[
        {
          justifyContent: 'center',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
        },
        {
          '&::before': {
            content: '""',
            position: 'absolute',
            zIndex: -1,
            inset: 0,
            backgroundImage: isDarkMode 
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
              : 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 40%, #e0f2fe 100%)',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            zIndex: -1,
            inset: 0,
            backgroundImage: isDarkMode
              ? 'radial-gradient(circle at 20% 30%, rgba(99,102,241,0.15), transparent 50%), radial-gradient(circle at 80% 70%, rgba(14,165,233,0.15), transparent 50%)'
              : 'radial-gradient(circle at 20% 30%, rgba(99,102,241,0.08), transparent 50%), radial-gradient(circle at 80% 70%, rgba(14,165,233,0.08), transparent 50%)',
          },
        },
      ]}
    >
        <Stack
          direction={{ xs: 'column-reverse', md: 'row' }}
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: { xs: 4, md: 12 },
            p: 4,
            mx: 'auto',
            width: '100%',
            maxWidth: 1200,
          }}
        >
          <SignInForm setSuccess={setSuccess} setError={setError} navigate={navigate} />
          <Box display="flex" flexDirection="column" alignItems="center">
            <DiabetesQuotes />
            <Button
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 4, borderRadius: 3, fontWeight: 600, px: 5, py: 1.5, fontSize: '1.1rem', boxShadow: 2 }}
              onClick={() => navigate('/onboarding')}
            >
              Let's Get Started
            </Button>
          </Box>
        </Stack>
        {success && <Typography color="success.main">{success}</Typography>}
        {error && <Typography color="error.main">{error}</Typography>}
      </Stack>
  );
}
