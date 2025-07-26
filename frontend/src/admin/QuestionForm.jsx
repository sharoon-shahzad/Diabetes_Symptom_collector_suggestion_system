import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, IconButton, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const QUESTION_TYPES = [
  { value: 'text', label: 'Text Field' },
  { value: 'radio', label: 'Radio (Single Choice)' },
  { value: 'dropdown', label: 'Dropdown' },
];

export default function QuestionForm({ open, onClose, onSubmit, initialData }) {
  const [questionText, setQuestionText] = useState('');
  const [questionType, setQuestionType] = useState('text');
  const [options, setOptions] = useState(['']);

  useEffect(() => {
    if (initialData) {
      setQuestionText(initialData.question_text || '');
      setQuestionType(initialData.question_type || 'text');
      setOptions(initialData.options && initialData.options.length > 0 ? initialData.options : ['']);
    } else {
      setQuestionText('');
      setQuestionType('text');
      setOptions(['']);
    }
  }, [initialData, open]);

  const handleOptionChange = (idx, value) => {
    const newOptions = [...options];
    newOptions[idx] = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (idx) => {
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    const data = {
      question_text: questionText,
      question_type: questionType,
      options: questionType === 'text' ? [] : options.filter(opt => opt.trim() !== ''),
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit Question' : 'Add Question'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Question Text"
          value={questionText}
          onChange={e => setQuestionText(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Question Type</InputLabel>
          <Select
            value={QUESTION_TYPES.map(t=>t.value).includes(questionType) ? questionType : QUESTION_TYPES[0].value}
            label="Question Type"
            onChange={e => setQuestionType(e.target.value)}
            disabled={QUESTION_TYPES.length === 0}
          >
            {QUESTION_TYPES.map(type => (
              <MenuItem key={type.value} value={type.value}>{type.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {(questionType === 'radio' || questionType === 'dropdown') && (
          <Box mt={2}>
            <Typography variant="subtitle1">Options</Typography>
            {options.map((opt, idx) => (
              <Box key={idx} display="flex" alignItems="center" mb={1}>
                <TextField
                  value={opt}
                  onChange={e => handleOptionChange(idx, e.target.value)}
                  fullWidth
                  size="small"
                  sx={{ mr: 1 }}
                />
                <IconButton onClick={() => handleRemoveOption(idx)} disabled={options.length === 1}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button startIcon={<AddIcon />} onClick={handleAddOption} sx={{ mt: 1 }}>
              Add Option
            </Button>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">{initialData ? 'Update' : 'Add'}</Button>
      </DialogActions>
    </Dialog>
  );
} 