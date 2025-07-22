import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CircularProgress, Alert, Grid, Collapse, CardActionArea, Box } from '@mui/material';
import axios from 'axios';
import QuestionList from './QuestionList';

const CARD_WIDTH = 340;
const CARD_MIN_HEIGHT = 180;

const SymptomCard = ({ diseaseId }) => {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const response = await axios.get(`/api/v1/onboarding/symptoms/${diseaseId}`);
        let data = response.data;
        if (Array.isArray(data)) setSymptoms(data);
        else if (Array.isArray(data.data)) setSymptoms(data.data);
        else setSymptoms([]);
        setLoading(false);
      } catch (err) {
        setError('Error fetching symptoms.');
        setLoading(false);
      }
    };
    fetchSymptoms();
  }, [diseaseId]);

  const handleExpand = (symptomId) => {
    setExpanded(expanded === symptomId ? null : symptomId);
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!symptoms.length) return <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>No symptoms found for this disease.</Typography>;

  return (
    <Grid container spacing={3}>
      {symptoms.map((symptom) => (
        <Grid item xs={12} sm={6} key={symptom._id}>
          <Box sx={{ width: '100%', maxWidth: CARD_WIDTH, mx: 'auto' }}>
            <Card
              elevation={expanded === symptom._id ? 8 : 2}
              sx={{
                borderRadius: 3,
                transition: 'box-shadow 0.3s',
                minHeight: CARD_MIN_HEIGHT,
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
            >
              <CardActionArea
                onClick={() => handleExpand(symptom._id)}
                sx={{ width: '100%' }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} color="primary.dark" gutterBottom>
                    {symptom.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {symptom.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <Collapse in={expanded === symptom._id} timeout="auto" unmountOnExit>
                <Box px={2} pb={2}>
                  <QuestionList symptomId={symptom._id} />
                </Box>
              </Collapse>
            </Card>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default SymptomCard; 