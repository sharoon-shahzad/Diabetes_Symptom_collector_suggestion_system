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
  Paper,
  Button
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const QuestionList = ({ symptomId, isLoggedIn }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState({});
  const [success, setSuccess] = useState({});
  const [saveError, setSaveError] = useState({});
  const [globalSaving, setGlobalSaving] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [globalSuccess, setGlobalSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!symptomId) return;
      try {
        setLoading(true);
        const response = await axios.get(`/api/v1/questions/questions/symptom/${symptomId}`);
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

  const handleInputChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setSuccess((prev) => ({ ...prev, [questionId]: false }));
    setSaveError((prev) => ({ ...prev, [questionId]: '' }));
  };

  const handleSave = async (questionId) => {
    setSaving((prev) => ({ ...prev, [questionId]: true }));
    setSuccess((prev) => ({ ...prev, [questionId]: false }));
    setSaveError((prev) => ({ ...prev, [questionId]: '' }));
    try {
      const answerText = answers[questionId];
      if (!answerText || answerText.trim() === '') {
        setSaveError((prev) => ({ ...prev, [questionId]: 'Please provide an answer.' }));
        setSaving((prev) => ({ ...prev, [questionId]: false }));
        return;
      }
      await axiosInstance.post('/questions/onboarding/answer', { questionId, answerText });
      setSuccess((prev) => ({ ...prev, [questionId]: true }));
    } catch (err) {
      setSaveError((prev) => ({ ...prev, [questionId]: err.response?.data?.message || 'Failed to save answer.' }));
    } finally {
      setSaving((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const handleSaveAll = async () => {
    setGlobalSaving(true);
    setGlobalError('');
    setGlobalSuccess(false);
    let anyError = false;
    for (const question of questions) {
      const answerText = answers[question._id];
      if (!answerText || (Array.isArray(answerText) ? answerText.length === 0 : answerText.trim() === '')) {
        setSaveError((prev) => ({ ...prev, [question._id]: 'Please provide an answer.' }));
        anyError = true;
        continue;
      }
      try {
        // DEBUG: Log token and headers
        const token = localStorage.getItem('accessToken');
        console.log('DEBUG accessToken:', token);
        const headers = { Authorization: `Bearer ${token}` };
        console.log('DEBUG headers:', headers);
        // END DEBUG
        await axiosInstance.post('/questions/answer', { questionId: question._id, answerText: Array.isArray(answerText) ? answerText.join(', ') : answerText });
        setSuccess((prev) => ({ ...prev, [question._id]: true }));
        setSaveError((prev) => ({ ...prev, [question._id]: '' }));
      } catch (err) {
        setSaveError((prev) => ({ ...prev, [question._id]: err.response?.data?.message || 'Failed to save answer.' }));
        setSuccess((prev) => ({ ...prev, [question._id]: false }));
        anyError = true;
      }
    }
    setGlobalSaving(false);
    setGlobalSuccess(!anyError);
    setGlobalError(anyError ? 'Some answers failed to save. Please check and try again.' : '');
  };

  const renderQuestion = (question) => {
    const value = answers[question._id] || '';
    switch (question.question_type) {
      case 'radio':
        return (
          <RadioGroup
            row
            value={value}
            onChange={e => handleInputChange(question._id, e.target.value)}
          >
            {(question.options || []).map((option) => (
              <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
            ))}
          </RadioGroup>
        );
      case 'checkbox':
        return (
          <Box>
            {(question.options || []).map((option) => (
              <FormControlLabel
                key={option}
                control={<Checkbox
                  checked={Array.isArray(value) ? value.includes(option) : false}
                  onChange={e => {
                    let newValue = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) newValue.push(option);
                    else newValue = newValue.filter(v => v !== option);
                    handleInputChange(question._id, newValue);
                  }}
                />}
                label={option}
              />
            ))}
          </Box>
        );
      case 'dropdown':
        return (
          <Select
            fullWidth
            value={value}
            onChange={e => handleInputChange(question._id, e.target.value)}
          >
            {(question.options || []).map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        );
      case 'range':
        return <Slider value={typeof value === 'number' ? value : 50} onChange={(_, v) => handleInputChange(question._id, v)} aria-label="Default" valueLabelDisplay="auto" />;
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
        return <TextField fullWidth type={question.question_type} variant="outlined" size="small" value={value} onChange={e => handleInputChange(question._id, e.target.value)} />;
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
        <Paper key={question._id} elevation={2} sx={{ p: 2, borderRadius: 2, bgcolor: 'background.paper', position: 'relative' }}>
          <FormControl fullWidth>
            <FormLabel sx={{ fontWeight: 600 }}>{question.question_text}</FormLabel>
            {renderQuestion(question)}
          </FormControl>
          <Box mt={1}>
            {success[question._id] && <Typography color="success.main" fontWeight={500}>Saved!</Typography>}
            {saveError[question._id] && <Typography color="error.main" fontWeight={500}>{saveError[question._id]}</Typography>}
          </Box>
        </Paper>
      ))}
      <Box mt={2} display="flex" alignItems="center" gap={2} justifyContent="flex-end">
        {isLoggedIn ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', minWidth: 180 }}
            onClick={handleSaveAll}
            disabled={globalSaving}
          >
            {globalSaving ? 'Saving...' : 'Save Details'}
          </Button>
        ) : (
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', minWidth: 220 }}
            onClick={() => navigate('/signin')}
          >
            Login first in order to save details
          </Button>
        )}
        {globalSuccess && <Typography color="success.main" fontWeight={600}>All answers saved!</Typography>}
        {globalError && <Typography color="error.main" fontWeight={600}>{globalError}</Typography>}
      </Box>
    </Stack>
  );
};

export default QuestionList; 