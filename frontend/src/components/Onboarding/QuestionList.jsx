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
  Button,
  Chip
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const QuestionList = ({ symptomId, symptomName, isLoggedIn, onDataUpdated }) => {
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
  const [answeredIds, setAnsweredIds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!symptomId) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/questions/public/symptom/${symptomId}`);
        const data = await response.json();
        if (Array.isArray(data)) setQuestions(data);
        else if (Array.isArray(data.data)) setQuestions(data.data);
        else setQuestions([]);
        setError(null);
        
        // Only fetch user's answered questions if logged in
        if (isLoggedIn && ((Array.isArray(data) && data.length > 0) || (Array.isArray(data.data) && data.data.length > 0))) {
          try {
            const token = localStorage.getItem('accessToken');
            const ansRes = await fetch(`/api/v1/users/my-disease-data`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            const ansData = await ansRes.json();
            const answered = [];
            if (ansData.data && ansData.data.symptoms && symptomName) {
              // Case-insensitive, trimmed match for symptom name
              const symptomBlock = ansData.data.symptoms.find(s => s.name.trim().toLowerCase() === symptomName.trim().toLowerCase());
              if (symptomBlock && Array.isArray(symptomBlock.questions)) {
                for (const q of symptomBlock.questions) {
                  // Try to match by question text (case-insensitive, trimmed)
                  const match = (Array.isArray(data) ? data : data.data).find(qq => qq.question_text.trim().toLowerCase() === q.question.trim().toLowerCase());
                  if (match) answered.push(match._id);
                }
              }
            }
            setAnsweredIds(answered);
          } catch (err) {
            // If user data fetch fails, just continue without answered questions
            setAnsweredIds([]);
          }
        } else {
          setAnsweredIds([]);
        }
      } catch (err) {
        setError('Error fetching questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [symptomId, symptomName, isLoggedIn]);

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
      const token = localStorage.getItem('accessToken');
      await fetch('/api/v1/questions/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ questionId, answerText })
      });
      setSuccess((prev) => ({ ...prev, [questionId]: true }));
      
      // Call the callback to refresh completion status
      if (onDataUpdated) {
        onDataUpdated();
      }
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
    try {
      const promises = Object.keys(answers).map(async (questionId) => {
        const answerText = answers[questionId];
        if (!answerText || answerText.trim() === '') {
          throw new Error(`Please provide an answer for all questions.`);
        }
        const token = localStorage.getItem('accessToken');
        return fetch('/api/v1/questions/answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ questionId, answerText })
        });
      });
      await Promise.all(promises);
      setGlobalSuccess(true);
      setAnswers({});
      
      // Call the callback to refresh completion status
      if (onDataUpdated) {
        onDataUpdated();
      }
    } catch (err) {
      setGlobalError(err.message || 'Failed to save answers.');
    } finally {
      setGlobalSaving(false);
    }
  };

  const renderQuestion = (question) => {
    const value = answers[question._id] || '';
    const isAnswered = answeredIds.includes(question._id);
    switch (question.question_type) {
      case 'radio':
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <RadioGroup
              row
              value={value}
              onChange={e => handleInputChange(question._id, e.target.value)}
              disabled={isAnswered}
            >
              {(question.options || []).map((option) => (
                <FormControlLabel key={option} value={option} control={<Radio />} label={option} />
              ))}
            </RadioGroup>
            {isAnswered && <CheckCircleIcon color="success" fontSize="small" />}
          </Box>
        );
      case 'checkbox':
        return (
          <Box display="flex" alignItems="center" gap={1}>
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
                    disabled={isAnswered}
                  />}
                  label={option}
                />
              ))}
            </Box>
            {isAnswered && <CheckCircleIcon color="success" fontSize="small" />}
          </Box>
        );
      case 'dropdown':
        const dropdownOptions = question.options || [];
        const hasValue = dropdownOptions.includes(value);
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Select
              fullWidth
              value={hasValue ? value : ''}
              onChange={e => handleInputChange(question._id, e.target.value)}
              disabled={dropdownOptions.length === 0 || isAnswered}
              displayEmpty
              renderValue={selected => selected || 'Select...'}
              MenuProps={{
                PaperProps: {
                  sx: { zIndex: 20000, pointerEvents: 'auto' }
                },
                disablePortal: false,
              }}
              onClick={e => e.stopPropagation()}
              onMouseDown={e => e.stopPropagation()}
            >
              <MenuItem value="" disabled>Select...</MenuItem>
              {dropdownOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
            {isAnswered && <CheckCircleIcon color="success" fontSize="small" />}
          </Box>
        );
      case 'range':
        return <Slider value={typeof value === 'number' ? value : 50} onChange={(_, v) => handleInputChange(question._id, v)} aria-label="Default" valueLabelDisplay="auto" disabled={isAnswered} />;
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
        return <TextField fullWidth type={question.question_type} variant="outlined" size="small" value={value} onChange={e => handleInputChange(question._id, e.target.value)} disabled={isAnswered} />;
      default:
        return <Typography>Unsupported question type.</Typography>;
    }
  };

  if (loading) return <CircularProgress size={24} sx={{ my: 2 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!questions.length) return <Typography color="success.main" sx={{ my: 2 }}>All questions completed for this symptom!</Typography>;

  return (
    <Stack spacing={3} mt={3}>
      {questions.map((question) => (
        <Paper
          key={question._id}
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            position: 'relative',
            background: 'radial-gradient(circle at 0% 0%, #111827 0%, #020617 45%, #020617 100%)',
            border: '1px solid rgba(148, 163, 184, 0.35)',
            boxShadow: '0 24px 60px rgba(15, 23, 42, 0.65)',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 10% 0%, rgba(59,130,246,0.18) 0, transparent 55%), radial-gradient(circle at 85% 100%, rgba(139,92,246,0.2) 0, transparent 55%)',
              opacity: 0.9,
              pointerEvents: 'none',
            },
          }}
        >
          <Box position="relative" zIndex={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <FormControl fullWidth>
                <FormLabel
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: '#e5e7eb',
                    mb: 1,
                  }}
                >
                  {question.question_text}
                </FormLabel>
                {renderQuestion(question)}
              </FormControl>
              {success[question._id] && (
                <Chip
                  label="Saved"
                  color="success"
                  size="small"
                  sx={{ ml: 2, fontWeight: 600 }}
                />
              )}
            </Box>
            <Box mt={0.5}>
              {saveError[question._id] && (
                <Typography color="error.main" fontWeight={500} variant="body2">
                  {saveError[question._id]}
                </Typography>
              )}
            </Box>
          </Box>
        </Paper>
      ))}
      <Box mt={2} display="flex" alignItems="center" gap={2} justifyContent="flex-end">
        {questions.length > 0 && questions.every(q => answeredIds.includes(q._id)) ? (
          <Typography color="info.main" fontWeight={600}>
            You have already answered all questions for this symptom. You can view and edit your responses in your dashboard.
          </Typography>
        ) : isLoggedIn ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{
              borderRadius: 999,
              fontWeight: 800,
              textTransform: 'none',
              minWidth: 200,
              px: 4,
              py: 1.2,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
              boxShadow: '0 14px 40px rgba(79, 70, 229, 0.55)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
                boxShadow: '0 18px 48px rgba(79, 70, 229, 0.7)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.25s ease-out',
            }}
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