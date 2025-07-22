import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Checkbox,
  Select,
  MenuItem,
  Slider,
  Stack,
  Paper
} from '@mui/material';
import axios from 'axios';

const QuestionList = ({ symptomId }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!symptomId) return;
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/onboarding/questions/symptom/${symptomId}`);
        console.log('Fetched questions for', symptomId, response.data);
        let data = response.data;
        if (Array.isArray(data)) setQuestions(data);
        else if (Array.isArray(data.data)) setQuestions(data.data);
        else setQuestions([]);
        setError(null);
      } catch (err) {
        setError('Error fetching questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [symptomId]);

  const renderQuestion = (question) => {
    switch (question.question_type) {
      case 'radio':
        return (
          <RadioGroup row>
            {(question.options || []).map((option) => (
              <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>
        );
      case 'checkbox':
        return (
          <Box>
            {(question.options || []).map((option) => (
              <FormControlLabel key={option} control={<Checkbox />} label={option} />
            ))}
          </Box>
        );
      case 'dropdown':
        return (
          <Select fullWidth>
            {(question.options || []).map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        );
      case 'range':
        return <Slider defaultValue={50} aria-label="Default" valueLabelDisplay="auto" />;
      case 'number':
      case 'text':
      case 'textarea':
      case 'date':
      case 'time':
      case 'datetime-local':
      case 'email':
      case 'password':
      case 'tel':
      case 'url':
      case 'color':
        return <TextField fullWidth type={question.question_type} variant="outlined" size="small" />;
      default:
        return <Typography>Unsupported question type.</Typography>;
    }
  };

  if (loading) return <CircularProgress size={24} sx={{ my: 2 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!questions.length) return <Typography color="text.secondary" sx={{ my: 2 }}>No questions for this symptom.</Typography>;

  return (
    <Stack spacing={3} mt={2}>
      {questions.map((question) => (
        <Paper key={question._id} elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper' }}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontWeight: 600 }}>{question.question_text}</FormLabel>
            {renderQuestion(question)}
          </FormControl>
        </Paper>
      ))}
    </Stack>
  );
};

export default QuestionList; 