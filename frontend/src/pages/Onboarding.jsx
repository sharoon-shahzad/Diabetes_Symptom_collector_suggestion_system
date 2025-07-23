import React from 'react';
import { Box, Container, Typography, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import DiseaseSymptomExplorer from '../components/Onboarding/DiseaseSymptomExplorer';

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


const Onboarding = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Box minHeight="100vh" bgcolor="background.default" display="flex" alignItems="center" justifyContent="center">
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Typography variant="h4" align="center" gutterBottom fontWeight={700} color="text.primary">
            Symptom Checker
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
            Select a symptom to see related questions.
          </Typography>
          <Box mt={4}>
            <DiseaseSymptomExplorer />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Onboarding; 