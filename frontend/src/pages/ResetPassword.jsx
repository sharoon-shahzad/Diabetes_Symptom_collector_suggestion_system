import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CssBaseline, Stack, ThemeProvider, createTheme, Typography } from '@mui/material';
import ResetPasswordForm from '../components/SignIn/ResetPasswordForm';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#0B1120',
      paper: '#1e2a3a',
    },
    text: {
      primary: '#ffffff',
    },
  },
});

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
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
              backgroundImage:
                'radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))',
            },
          },
        ]}
      >
        <Stack
          direction="column"
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            p: 4,
            mx: 'auto',
            width: '100%',
            maxWidth: 400,
          }}
        >
          <ResetPasswordForm token={token} setSuccess={setSuccess} setError={setError} navigate={navigate} />
        </Stack>
        {success && <Typography color="success.main" textAlign="center">{success}</Typography>}
        {error && <Typography color="error.main" textAlign="center">{error}</Typography>}
      </Stack>
    </ThemeProvider>
  );
}
