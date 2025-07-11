import React from 'react';
import { CssBaseline, Stack, ThemeProvider, createTheme } from '@mui/material';
import SignInForm from '../components/SignIn/SignInForm';
import DiabetesQuotes from '../components/Common/DiabetesQuotes';

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

export default function SignInSide() {
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
          <SignInForm />
          <DiabetesQuotes />
        </Stack>
      </Stack>
    </ThemeProvider>
  );
}
