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
              ? 'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))'
              : 'radial-gradient(at 50% 50%, hsla(210, 100%, 90%, 0.5), hsl(220, 30%, 95%))',
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
