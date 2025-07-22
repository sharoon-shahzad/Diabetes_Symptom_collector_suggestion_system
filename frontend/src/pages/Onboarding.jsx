import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, CircularProgress, Paper, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import QuestionnaireForm from '../components/Onboarding/QuestionnaireForm';
import SymptomChecklist from '../components/Onboarding/SymptomChecklist';
import { fetchQuestions, fetchSymptoms } from '../utils/api';

const DISEASE_ID = '687d1030486b76564bd52a70'; // Diabetes disease ObjectId

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
  const [questions, setQuestions] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [questionsData, symptomsData] = await Promise.all([
          fetchQuestions(DISEASE_ID),
          fetchSymptoms(DISEASE_ID),
        ]);
        setQuestions(questionsData);
        setSymptoms(symptomsData);
      } catch (err) {
        setError('Failed to load onboarding data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="background.default">
          <Typography color="error">{error}</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Box minHeight="100vh" bgcolor="background.default" display="flex" alignItems="center" justifyContent="center">
        <Container maxWidth="md" sx={{ py: 6 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper' }}>
            <Typography variant="h4" align="center" gutterBottom fontWeight={700} color="text.primary">
              Welcome! Let's Get to Know You
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
              Please answer the following questions and select any symptoms you are experiencing.
            </Typography>
            <Box mt={4}>
              <QuestionnaireForm questions={questions} />
            </Box>
            <Box mt={6}>
              <SymptomChecklist symptoms={symptoms} />
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Onboarding; 