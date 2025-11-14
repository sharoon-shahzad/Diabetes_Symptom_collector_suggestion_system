import React, { useState } from 'react';
import { Stack, Typography } from '@mui/material';
import SignUpForm from '../components/SignUp/SignUpForm';
import DiabetesQuotes from '../components/Common/DiabetesQuotes';
import { useTheme } from '../contexts/useThemeContext';

export default function SignUpSide() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
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
          <SignUpForm setSuccess={setSuccess} setError={setError} />
          <DiabetesQuotes />
        </Stack>
        {success && <Typography color="success.main">{success}</Typography>}
        {error && <Typography color="error.main">{error}</Typography>}
      </Stack>
  );
}
