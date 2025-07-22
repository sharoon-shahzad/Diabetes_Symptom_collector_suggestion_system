import React from 'react';
import { Box, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField, Paper, Divider, Card, CardContent } from '@mui/material';

const QuestionnaireForm = ({ questions }) => {
  if (!questions || questions.length === 0) return null;

  // Group questions by category for better UI
  const grouped = questions.reduce((acc, q) => {
    acc[q.category] = acc[q.category] || [];
    acc[q.category].push(q);
    return acc;
  }, {});

  const categoryLabels = {
    basic: 'Basic Questions',
    intermediate: 'Intermediate Questions',
    advanced: 'Advanced Questions',
  };

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom color="text.primary">
        Screening Questions
      </Typography>
      {Object.entries(grouped).map(([category, qs], idx) => (
        <Box key={category} mb={idx < Object.keys(grouped).length - 1 ? 4 : 0}>
          <Typography variant="subtitle1" fontWeight={500} color="primary.light" gutterBottom>
            {categoryLabels[category] || category}
          </Typography>
          <Divider sx={{ mb: 2, bgcolor: 'primary.dark' }} />
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }} gap={3}>
            {qs.map((q, i) => (
              <Card
                key={q._id || q.question_text}
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
                  <FormControl fullWidth>
                    <FormLabel sx={{ mb: 1, color: 'text.primary', fontWeight: 500 }}>{q.question_text}</FormLabel>
                    {q.input_type === 'boolean' ? (
                      <RadioGroup row name={q.question_text} sx={{ gap: 2 }}>
                        <FormControlLabel value="yes" control={<Radio color="primary" />} label="Yes" />
                        <FormControlLabel value="no" control={<Radio color="primary" />} label="No" />
                      </RadioGroup>
                    ) : (
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        placeholder="Enter your answer"
                        sx={{ input: { color: 'text.primary' } }}
                      />
                    )}
                  </FormControl>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default QuestionnaireForm; 