import React from 'react';
import { Box, Typography, FormGroup, FormControlLabel, Checkbox, Paper, Card, CardContent } from '@mui/material';

const SymptomChecklist = ({ symptoms }) => {
  if (!symptoms || symptoms.length === 0) return null;

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
        Symptom Checklist
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Which of the following symptoms do you have? (Select all that apply)
      </Typography>
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
        {symptoms.map((symptom) => (
          <Card
            key={symptom._id || symptom.name}
            elevation={2}
            sx={{
              bgcolor: 'background.paper',
              borderRadius: 3,
              boxShadow: 3,
              p: 2,
              minWidth: 0,
              transition: 'box-shadow 0.2s',
              '&:hover': { boxShadow: 8 },
            }}
          >
            <CardContent>
              <FormControlLabel
                control={<Checkbox name={symptom.name} color="primary" />}
                label={
                  <Box>
                    <Typography variant="body1" fontWeight={500} color="text.primary">{symptom.name}</Typography>
                    {symptom.description && (
                      <Typography variant="caption" color="text.secondary">{symptom.description}</Typography>
                    )}
                  </Box>
                }
                sx={{ mb: 2 }}
              />
            </CardContent>
          </Card>
        ))}
      </Box>
    </Paper>
  );
};

export default SymptomChecklist; 