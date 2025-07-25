import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, CircularProgress, Alert, Grid, Divider, Chip } from '@mui/material';
import { fetchMyDiseaseData } from '../utils/api';

export default function Dashboard() {
  const [diseaseData, setDiseaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchMyDiseaseData();
        setDiseaseData(data);
      } catch (err) {
        setError('Failed to load disease data.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!diseaseData || !diseaseData.disease) {
    return (
      <Box p={3}>
        <Alert severity="info">No disease data found. Please complete your onboarding or answer the questions to see your data here.</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        My Disease Data
      </Typography>
      <Card elevation={4} sx={{ mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #f4f8fb 60%, #e3f0ff 100%)' }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" color="primary.main">
            {diseaseData.disease}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Last updated: {diseaseData.lastUpdated ? new Date(diseaseData.lastUpdated).toLocaleString() : 'N/A'}
          </Typography>
        </CardContent>
      </Card>
      <Grid container spacing={3}>
        {diseaseData.symptoms && diseaseData.symptoms.length > 0 ? (
          diseaseData.symptoms.map((symptom, idx) => (
            <Grid item xs={12} md={6} key={symptom.name || idx}>
              <Card elevation={2} sx={{ borderRadius: 3, mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" color="secondary.main" gutterBottom>
                    {symptom.name}
                  </Typography>
                  {symptom.questions && symptom.questions.length > 0 ? (
                    <Box>
                      {symptom.questions.map((q, qIdx) => (
                        <Box key={q.question + qIdx} mb={2}>
                          <Typography variant="subtitle1" fontWeight={500}>
                            Q: {q.question}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Chip label={q.answer} color="primary" variant="outlined" />
                            <Typography variant="caption" color="text.secondary">
                              {q.date ? new Date(q.date).toLocaleDateString() : ''}
                            </Typography>
                          </Box>
                          {qIdx < symptom.questions.length - 1 && <Divider sx={{ my: 1 }} />}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography color="text.secondary">No questions answered for this symptom.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Alert severity="info">No symptoms or answers found for this disease.</Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
} 