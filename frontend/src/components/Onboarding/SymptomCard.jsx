import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CircularProgress, Alert, Grid, Collapse, Box, Button } from '@mui/material';
import axios from 'axios';
import QuestionList from './QuestionList';
import { getCurrentUser } from '../../utils/auth';

const CARD_WIDTH = 320;
const CARD_MIN_HEIGHT = 180;

const SymptomCard = ({ diseaseId }) => {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchSymptoms = async () => {
      try {
        const response = await axios.get(`/api/v1/questions/symptoms/${diseaseId}`);
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

  useEffect(() => {
    // Check login state
    const checkLogin = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return setIsLoggedIn(false);
        await getCurrentUser();
        setIsLoggedIn(true);
      } catch {
        setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, []);

  const handleExpand = (symptomId) => {
    setExpanded(expanded === symptomId ? null : symptomId);
  };

  if (loading) return <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!symptoms.length) return <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>No symptoms found for this disease.</Typography>;

  return (
    <Grid container spacing={2} alignItems="flex-start">
      {symptoms.map((symptom) => (
        <Grid item xs={12} sm={6} md={4} key={symptom._id} display="flex" justifyContent="center">
          <Box sx={{ width: CARD_WIDTH, mx: 'auto', display: 'flex', alignItems: 'stretch' }}>
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
                position: 'relative',
                overflow: 'visible',
              }}
              onMouseEnter={() => setHovered(symptom._id)}
              onMouseLeave={() => setHovered(null)}
            >
              <CardContent sx={{ pb: 1 }}>
                <Typography variant="h6" fontWeight={600} color="primary.dark" gutterBottom>
                  {symptom.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {symptom.description}
                </Typography>
                {expanded !== symptom._id && (
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    sx={{
                      mt: 1,
                      borderRadius: 2,
                      fontWeight: 600,
                      textTransform: 'none',
                      minWidth: 120,
                      px: 2,
                      alignSelf: 'flex-start',
                      opacity: hovered === symptom._id ? 1 : 0.2,
                      transition: 'opacity 0.2s',
                    }}
                    onClick={() => handleExpand(symptom._id)}
                  >
                    Fill Your Info
                  </Button>
                )}
              </CardContent>
              <Collapse in={expanded === symptom._id} timeout="auto" unmountOnExit>
                <Box px={2} pb={2}>
                  <QuestionList symptomId={symptom._id} isLoggedIn={isLoggedIn} />
                  <Button
                    variant="outlined"
                    color="secondary"
                    size="small"
                    sx={{ mt: 2, borderRadius: 2, fontWeight: 500, textTransform: 'none' }}
                    fullWidth
                    onClick={() => handleExpand(symptom._id)}
                  >
                    Close
                  </Button>
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