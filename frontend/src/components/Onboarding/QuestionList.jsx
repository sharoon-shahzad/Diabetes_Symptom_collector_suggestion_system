import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef, useCallback } from 'react';
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
  Chip,
  alpha,
  IconButton,
  Popover,
} from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const QuestionList = forwardRef(({ symptomId, symptomName, symptomDescription, isLoggedIn, onDataUpdated, onAnswersChange, userAge, userGender }, ref) => {
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
  const [heightValues, setHeightValues] = useState({}); // Store feet/inches for each height question
  const [helpAnchorEl, setHelpAnchorEl] = useState(null); // For help popover
  const navigate = useNavigate();

  // Expose saveAll function to parent
  useImperativeHandle(ref, () => ({
    saveAll: handleSaveAll,
    hasUnansweredQuestions: () => {
      const unanswered = questions.filter((q) => !answeredIds.includes(q._id) && !answers[q._id]);
      return unanswered.length > 0;
    }
  }));

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!symptomId) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/questions/public/symptom/${symptomId}`);
        const data = await response.json();
        const questionsList = Array.isArray(data) ? data : (Array.isArray(data.data) ? data.data : []);
        setQuestions(questionsList);
        setError(null);
        
        console.log('QuestionList - userAge:', userAge);
        console.log('QuestionList - userGender:', userGender);
        console.log('QuestionList - questions loaded:', questionsList.length);
        
        // Auto-fill age and gender if questions ask for them and user data is available
        const updatedAnswers = {};
        const preFilledQuestionIds = [];
        
        if (userAge && questionsList.length > 0) {
          const ageQuestion = questionsList.find((q) => 
            q.question_text.toLowerCase().includes('age') && 
            (q.question_type === 'text' || q.question_type === 'number')
          );
          if (ageQuestion) {
            // Use the formatted age string directly (e.g., "23 years and 4 months")
            updatedAnswers[ageQuestion._id] = typeof userAge === 'string' ? userAge : userAge.toString();
            preFilledQuestionIds.push(ageQuestion._id);
          }
        }
        
        if (userGender && questionsList.length > 0) {
          const genderQuestion = questionsList.find((q) => 
            q.question_text.toLowerCase().includes('gender') && 
            q.question_type === 'radio'
          );
          if (genderQuestion) {
            // Normalize gender value to match question options (Male/Female)
            const normalizedGender = userGender.charAt(0).toUpperCase() + userGender.slice(1).toLowerCase();
            updatedAnswers[genderQuestion._id] = normalizedGender;
            preFilledQuestionIds.push(genderQuestion._id);
          }
        }
        
        // Only log if we actually have pre-filled answers
        if (Object.keys(updatedAnswers).length > 0) {
          console.log('Pre-filled answers:', updatedAnswers);
        }
        
        if (Object.keys(updatedAnswers).length > 0) {
          setAnswers((prev) => {
            const newAnswers = { ...prev, ...updatedAnswers };
            // Notify parent after state update
            setTimeout(() => {
              if (onAnswersChange) {
                onAnswersChange(newAnswers, questionsList);
              }
            }, 0);
            return newAnswers;
          });
        }
        
        // Only fetch user's answered questions if logged in
        if (isLoggedIn && questionsList.length > 0) {
          try {
            const token = localStorage.getItem('accessToken');
            const ansRes = await fetch(`/api/v1/users/my-disease-data`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            const ansData = await ansRes.json();
            const answered = [...preFilledQuestionIds]; // Include pre-filled questions
            const loadedAnswers = {}; // Store the actual answer values
            
            if (ansData.data && ansData.data.symptoms && symptomName) {
              // Case-insensitive, trimmed match for symptom name
              const symptomBlock = ansData.data.symptoms.find((s) => s.name.trim().toLowerCase() === symptomName.trim().toLowerCase());
              if (symptomBlock && Array.isArray(symptomBlock.questions)) {
                for (const q of symptomBlock.questions) {
                  // Try to match by question text (case-insensitive, trimmed)
                  const match = questionsList.find((qq) => qq.question_text.trim().toLowerCase() === q.question.trim().toLowerCase());
                  if (match) {
                    answered.push(match._id);
                    // Store the actual answer value
                    loadedAnswers[match._id] = q.answer || 'answered';
                  }
                }
              }
            }
            setAnsweredIds(answered);
            
            // Set the loaded answers in state
            if (Object.keys(loadedAnswers).length > 0) {
              setAnswers(prev => {
                const newAnswers = { ...prev, ...loadedAnswers };
                // Notify parent with actual answer values
                setTimeout(() => {
                  if (onAnswersChange) {
                    onAnswersChange(newAnswers, questionsList);
                  }
                }, 100);
                return newAnswers;
              });
            } else if (answered.length === questionsList.length && onAnswersChange) {
              // Fallback: If no answer values but all questions marked as answered
              const mockAnswers = {};
              questionsList.forEach(q => {
                if (answered.includes(q._id)) {
                  mockAnswers[q._id] = 'answered';
                }
              });
              setTimeout(() => {
                onAnswersChange(mockAnswers, questionsList);
              }, 100);
            }
          } catch (err) {
            // If user data fetch fails, just continue without answered questions
            setAnsweredIds([]);
          }
        } else {
          setAnsweredIds(preFilledQuestionIds);
        }
      } catch (err) {
        setError('Error fetching questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [symptomId, symptomName, isLoggedIn, userAge, userGender, onAnswersChange]);

  const handleInputChange = useCallback((questionId, value) => {
    // Update state immediately
    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: value };
      // Notify parent immediately - React 18 will batch automatically
      if (onAnswersChange) {
        onAnswersChange(newAnswers, questions);
      }
      return newAnswers;
    });
    setSuccess((prev) => ({ ...prev, [questionId]: false }));
    setSaveError((prev) => ({ ...prev, [questionId]: '' }));
  }, [onAnswersChange, questions]);

  const handleSave = async (questionId) => {
    // For unauthenticated users, just mark as saved locally
    if (!isLoggedIn) {
      setSuccess((prev) => ({ ...prev, [questionId]: true }));
      return;
    }
    
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
    // For unauthenticated users, just mark as saved locally
    if (!isLoggedIn) {
      setGlobalSuccess(true);
      // Store answers in sessionStorage for later use
      // Get existing pending answers if any
      const existingData = sessionStorage.getItem('pendingOnboardingAnswers');
      let existingAnswers = {};
      
      if (existingData) {
        try {
          const parsed = JSON.parse(existingData);
          existingAnswers = parsed.answers || {};
        } catch (e) {
          console.error('Failed to parse existing answers:', e);
        }
      }
      
      // Merge new answers with existing ones
      const mergedAnswers = { ...existingAnswers, ...answers };
      
      sessionStorage.setItem('pendingOnboardingAnswers', JSON.stringify({
        answers: mergedAnswers,
        symptomId,
        symptomName,
        lastUpdated: new Date().toISOString(),
      }));
      
      console.log('💾 Saved to sessionStorage:');
      console.log('  - Symptom:', symptomName);
      console.log('  - New answers:', Object.keys(answers).length);
      console.log('  - Total answers:', Object.keys(mergedAnswers).length);
      console.log('  - Answer details:', mergedAnswers);
      return;
    }
    
    setGlobalSaving(true);
    setGlobalError('');
    setGlobalSuccess(false);
    
    // Clear any pending answers from sessionStorage before saving to database
    const hadPendingAnswers = sessionStorage.getItem('pendingOnboardingAnswers');
    
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
      
      // Clear all temporary storage after successful database save
      if (hadPendingAnswers) {
        sessionStorage.removeItem('pendingOnboardingAnswers');
        sessionStorage.removeItem('onboardingState');
        localStorage.removeItem('onboardingState');
        localStorage.removeItem('redirectAfterLogin');
        console.log('🧹 Cleared all temporary storage after saving to database');
      }
      
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
    
    // ✅ USE DATABASE RENDER_CONFIG for special rendering
    if (question.render_config && question.render_config.type === 'unit_conversion') {
      const config = question.render_config.config;
      
      // Height unit conversion (feet/inches → cm)
      if (!heightValues[question._id] && value) {
        const cmValue = parseFloat(value);
        if (!isNaN(cmValue)) {
          const totalInches = cmValue / 2.54;
          const feet = Math.floor(totalInches / 12);
          const inches = Math.round(totalInches % 12);
          setHeightValues(prev => ({
            ...prev,
            [question._id]: { feet, inches }
          }));
        }
      }
      
      const currentHeight = heightValues[question._id] || { feet: '', inches: '' };
      
      // Dynamically get units from config
      const feetUnit = config.from_units.find(u => u.name === 'feet');
      const inchesUnit = config.from_units.find(u => u.name === 'inches');
      
      return (
        <Box display="flex" gap={2} alignItems="center">
          <Select
            value={currentHeight.feet}
            onChange={(e) => {
              const feet = parseFloat(e.target.value) || 0;
              const inches = parseFloat(currentHeight.inches) || 0;
              // Use formula from database
              const totalCm = Math.round((feet * 30.48) + (inches * 2.54));
              setHeightValues(prev => ({
                ...prev,
                [question._id]: { feet: e.target.value, inches: currentHeight.inches }
              }));
              handleInputChange(question._id, totalCm.toString());
            }}
            disabled={isAnswered}
            displayEmpty
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="" disabled>{feetUnit?.label || 'Feet'}</MenuItem>
            {(feetUnit?.options || [3, 4, 5, 6, 7, 8]).map(ft => (
              <MenuItem key={ft} value={ft}>{ft} ft</MenuItem>
            ))}
          </Select>
          <Select
            value={currentHeight.inches}
            onChange={(e) => {
              const feet = parseFloat(currentHeight.feet) || 0;
              const inches = parseFloat(e.target.value) || 0;
              const totalCm = Math.round((feet * 30.48) + (inches * 2.54));
              setHeightValues(prev => ({
                ...prev,
                [question._id]: { feet: currentHeight.feet, inches: e.target.value }
              }));
              handleInputChange(question._id, totalCm.toString());
            }}
            disabled={isAnswered}
            displayEmpty
            size="small"
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="" disabled>{inchesUnit?.label || 'Inches'}</MenuItem>
            {(inchesUnit?.options || [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).map(inch => (
              <MenuItem key={inch} value={inch}>{inch} in</MenuItem>
            ))}
          </Select>
          {currentHeight.feet && currentHeight.inches !== '' && (
            <Typography variant="body2" color="text.secondary">
              ({Math.round((parseFloat(currentHeight.feet) * 30.48) + (parseFloat(currentHeight.inches) * 2.54))} cm)
            </Typography>
          )}
        </Box>
      );
    }
    
    // ✅ RESPECT DATABASE QUESTION_TYPE (no hardcoded overrides)
    switch (question.question_type) {
      case 'radio':
        return (
          <Box display="flex" alignItems="center" gap={1}>
            <RadioGroup
              row
              value={value}
              onChange={(e) => handleInputChange(question._id, e.target.value)}
            >
              {(question.options || []).map((option) => (
                <FormControlLabel 
                  key={option} 
                  value={option} 
                  control={<Radio disabled={isAnswered} />} 
                  label={option} 
                  disabled={isAnswered}
                />
              ))}
            </RadioGroup>
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
                    onChange={(e) => {
                      let newValue = Array.isArray(value) ? [...value] : [];
                      if (e.target.checked) newValue.push(option);
                      else newValue = newValue.filter((v) => v !== option);
                      handleInputChange(question._id, newValue);
                    }}
                    disabled={isAnswered}
                  />}
                  label={option}
                />
              ))}
            </Box>
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
              onChange={(e) => handleInputChange(question._id, e.target.value)}
              disabled={dropdownOptions.length === 0 || isAnswered}
              displayEmpty
              renderValue={(selected) => selected || 'Select...'}
              MenuProps={{
                PaperProps: {
                  sx: { zIndex: 20000, pointerEvents: 'auto' }
                },
                disablePortal: false,
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <MenuItem value="" disabled>Select...</MenuItem>
              {dropdownOptions.map((option) => (
                <MenuItem key={option} value={option}>{option}</MenuItem>
              ))}
            </Select>
          </Box>
        );
        
      case 'range':
        return <Slider value={typeof value === 'number' ? value : 50} onChange={(_, v) => handleInputChange(question._id, v)} aria-label="Default" valueLabelDisplay="auto" disabled={isAnswered} />;
        
      case 'number':
        return (
          <TextField 
            fullWidth 
            type="number" 
            variant="outlined" 
            size="small" 
            value={value} 
            onChange={(e) => handleInputChange(question._id, e.target.value)} 
            disabled={isAnswered}
            autoComplete="off"
            inputProps={{
              min: 0,
              step: 1
            }}
          />
        );
        
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
        return (
          <TextField 
            fullWidth 
            type={question.question_type} 
            variant="outlined" 
            size="small" 
            value={value} 
            onChange={(e) => handleInputChange(question._id, e.target.value)} 
            disabled={isAnswered}
            autoComplete="off"
            multiline={question.question_type === 'textarea'}
            rows={question.question_type === 'textarea' ? 3 : 1}
          />
        );
        
      default:
        return <Typography color="error">Unsupported question type: {question.question_type}</Typography>;
    }
  };

  const handleHelpOpen = (event) => {
    setHelpAnchorEl(event.currentTarget);
  };

  const handleHelpClose = () => {
    setHelpAnchorEl(null);
  };

  const helpOpen = Boolean(helpAnchorEl);

  if (loading) return <CircularProgress size={24} sx={{ my: 2 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!questions.length) return <Typography color="success.main" sx={{ my: 2 }}>All questions completed for this symptom!</Typography>;

  return (
    <Stack spacing={3} mt={3}>
      {/* Help Button for Symptom Description */}
      {symptomDescription && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Need help understanding these questions?
          </Typography>
          <Button
            onClick={handleHelpOpen}
            startIcon={<HelpOutline />}
            variant="outlined"
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Help
          </Button>
        </Box>
      )}
      
      {/* Help Popover */}
      <Popover
        open={helpOpen}
        anchorEl={helpAnchorEl}
        onClose={handleHelpClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            p: 3,
            maxWidth: 500,
            maxHeight: '70vh',
            overflow: 'auto',
            borderRadius: 3,
            boxShadow: (theme) => theme.shadows[12],
          },
        }}
      >
        <Box display="flex" alignItems="center" mb={2}>
          <HelpOutline color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h6" fontWeight={700} color="primary">
            {symptomName}
          </Typography>
        </Box>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            lineHeight: 1.9,
            whiteSpace: 'pre-line',
            '& .section-title': {
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '1rem',
              display: 'block',
              marginBottom: 1,
              marginTop: 2,
            }
          }}
          dangerouslySetInnerHTML={{
            __html: symptomDescription
              .split('\n')
              .map(line => {
                // Style all-caps lines as section headers
                if (line.trim() && line.trim() === line.trim().toUpperCase() && line.trim().length > 3) {
                  return `<span class="section-title">${line.trim()}</span>`;
                }
                return line;
              })
              .join('\n')
          }}
        />
        <Box mt={3} display="flex" justifyContent="flex-end">
          <Button 
            onClick={handleHelpClose} 
            variant="contained" 
            size="small"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            Got it!
          </Button>
        </Box>
      </Popover>

      {questions.map((question) => (
        <Paper
          key={question._id}
          elevation={2}
          sx={{
            p: 3,
            borderRadius: 3,
            position: 'relative',
            background: (theme) => theme.palette.background.paper,
            border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: (theme) => theme.shadows[6],
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
              transform: 'translateY(-2px)',
            },
          }}
        >
          <Box position="relative" zIndex={1}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <FormControl fullWidth>
                <FormLabel
                  sx={{
                    fontWeight: 600,
                    fontSize: '1rem',
                    mb: 2,
                    color: 'text.primary',
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
      {/* Save button removed - auto-save handled by Next button in parent */}
      {questions.length > 0 && questions.every((q) => answeredIds.includes(q._id)) && (
        <Box mt={2}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            You have already answered all questions for this symptom. Click Next to continue.
          </Alert>
        </Box>
      )}
      {globalSuccess && (
        <Box mt={2}>
          <Alert severity="success" sx={{ borderRadius: 2 }}>All answers saved successfully!</Alert>
        </Box>
      )}
      {globalError && (
        <Box mt={2}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>{globalError}</Alert>
        </Box>
      )}
    </Stack>
  );
});

export default QuestionList; 
