import React, { useState } from 'react';
import {
  CssBaseline,
  Stack,
  ThemeProvider,
  createTheme,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

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

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState(1); // 1 = Enter Email, 2 = Enter Code
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSendCode = () => {
    if (!email) {
      setError('Please enter your registered email.');
      return;
    }

    setError('');

    // Backend should implement: POST /auth/forgot-password with { email }
    // If success → proceed to step 2
    // If failure → show error
    setStep(2);
  };

  const handleVerifyCode = () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid 6-digit code.');
      return;
    }

    setError('');

    //  Backend should implement: POST /auth/verify-code with { email, code }
    // If success → redirect to sign-in
    // If failure → show error
    navigate('/signin');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Stack
        direction="column"
        sx={[
          {
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            position: 'relative',
            px: 2,
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
        <Paper
          elevation={4}
          sx={{
            p: 4,
            width: 360,
            backgroundColor: '#060c1a',
            borderRadius: 3,
            color: 'white',
            textAlign: 'center',
          }}
        >
          {step === 1 ? (
            <>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Forgot Password
              </Typography>
              <Typography variant="body2" mb={2}>
                Enter your registered email to receive a verification code.
              </Typography>
              <TextField
                fullWidth
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{ style: { color: '#fff' } }}
                InputLabelProps={{ style: { color: '#aaa' } }}
              />
              {error && (
                <Typography color="error" mt={1}>
                  {error}
                </Typography>
              )}
              <Button
                fullWidth
                variant="contained"
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
                onClick={handleSendCode}
              >
                Send Code
              </Button>
            </>
          ) : (
            <>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Verify Code
              </Typography>
              <Typography variant="body2" mb={2}>
                A 6-digit confirmation code was sent to <strong>{email}</strong>
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                InputProps={{ style: { color: '#fff' } }}
              />
              {error && (
                <Typography color="error" mt={1}>
                  {error}
                </Typography>
              )}
              <Button
                fullWidth
                variant="contained"
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
                onClick={handleVerifyCode}
              >
                Confirm
              </Button>
            </>
          )}
        </Paper>
      </Stack>
    </ThemeProvider>
  );
}
