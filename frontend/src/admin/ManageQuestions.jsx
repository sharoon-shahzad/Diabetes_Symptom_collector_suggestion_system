import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress, List, ListItem, ListItemText, IconButton, ListItemSecondaryAction } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { fetchDiseases, fetchSymptomsByDisease, fetchQuestionsBySymptom, addQuestion, updateQuestion, deleteQuestion } from '../utils/api';
import QuestionForm from './QuestionForm';
import ConfirmDialog from './ConfirmDialog';

export default function ManageQuestions() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [questions, setQuestions] = useState([]);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState(null);
  const [symptomError, setSymptomError] = useState(null);

  useEffect(() => {
    const loadDiseases = async () => {
      setLoading(true);
      try {
        const data = await fetchDiseases();
        console.log('Diseases loaded (questions):', data);
        setDiseases(data);
        if (data && data.length > 0) {
          setSelectedDisease(data[0]._id);
        }
      } catch (err) {
        console.error('Error loading diseases (questions):', err);
      }
      setLoading(false);
    };
    loadDiseases();
  }, []);

  useEffect(() => {
    if (selectedDisease) {
      console.log('Selected disease ID (questions):', selectedDisease);
      setSymptomLoading(true);
      setSymptomError(null);
      fetchSymptomsByDisease(selectedDisease)
        .then(data => {
          console.log('Symptoms fetched (questions):', data);
          setSymptoms(data);
          // Auto-select the first symptom if available
          if (data && data.length > 0) {
            setSelectedSymptom(data[0]._id);
          }
          setSymptomLoading(false);
        })
        .catch(err => {
          console.error('Error fetching symptoms (questions):', err);
          setSymptomError('Failed to fetch symptoms.');
          setSymptoms([]);
          setSymptomLoading(false);
        });
    } else {
      setSymptoms([]);
      setSelectedSymptom('');
      setSymptomError(null);
    }
  }, [selectedDisease]);

  useEffect(() => {
    if (selectedSymptom) {
      console.log('Fetching questions for symptom:', selectedSymptom);
      setQuestionLoading(true);
      fetchQuestionsBySymptom(selectedSymptom).then(data => {
        console.log('Questions fetched:', data);
        setQuestions(data);
        setQuestionLoading(false);
      }).catch(err => {
        console.error('Error fetching questions:', err);
        setQuestions([]);
        setQuestionLoading(false);
      });
    } else {
      setQuestions([]);
    }
  }, [selectedSymptom]);

  const handleAdd = () => {
    setEditData(null);
    setFormOpen(true);
  };

  const handleEdit = (question) => {
    setEditData(question);
    setFormOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setFormOpen(false);
    if (editData) {
      await updateQuestion(editData._id, data);
    } else {
      await addQuestion(selectedSymptom, data);
    }
    const updated = await fetchQuestionsBySymptom(selectedSymptom);
    setQuestions(updated);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    if (deleteId) {
      await deleteQuestion(deleteId);
      setDeleteId(null);
      const updated = await fetchQuestionsBySymptom(selectedSymptom);
      setQuestions(updated);
    }
  };

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 4, mb: 2, borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.08)', background: '#101624', color: '#fff' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#fff">
          Manage Questions
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: '#fff' }}>Select Disease</InputLabel>
          <Select
            label="Select Disease"
            value={diseases.map(d=>d._id).includes(selectedDisease) ? selectedDisease : (diseases[0]?._id || '')}
            onChange={e => setSelectedDisease(e.target.value)}
            disabled={loading || diseases.length === 0}
            sx={{ color: '#fff', '.MuiSelect-icon': { color: '#fff' } }}
          >
            {loading ? (
              <MenuItem value=""><CircularProgress size={20} sx={{ color: '#fff' }} /></MenuItem>
            ) : diseases.length === 0 ? (
              <MenuItem value="" disabled>No diseases found</MenuItem>
            ) : (
              diseases.map(disease => (
                <MenuItem key={disease._id} value={disease._id}>{disease.name}</MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        <FormControl fullWidth sx={{ mb: 2 }} disabled={!selectedDisease}>
          <InputLabel sx={{ color: '#fff' }}>Select Symptom</InputLabel>
          <Select
            label="Select Symptom"
            value={symptoms.map(s=>s._id).includes(selectedSymptom) ? selectedSymptom : (symptoms[0]?._id || '')}
            onChange={e => setSelectedSymptom(e.target.value)}
            disabled={symptomLoading || !selectedDisease || symptoms.length === 0}
            sx={{ color: '#fff', '.MuiSelect-icon': { color: '#fff' } }}
          >
            {symptomLoading ? (
              <MenuItem value=""><CircularProgress size={20} sx={{ color: '#fff' }} /></MenuItem>
            ) : symptoms.length === 0 ? (
              <MenuItem value="" disabled>No symptoms found</MenuItem>
            ) : (
              symptoms.map(symptom => (
                <MenuItem key={symptom._id} value={symptom._id}>{symptom.name}</MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        {selectedSymptom && (
          <>
            {questionLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
                <CircularProgress sx={{ color: '#fff' }} />
              </Box>
            ) : (
              <Box>
                {questions.map((question, idx) => (
                  <Box key={question._id} display="flex" alignItems="center" justifyContent="space-between" py={2} borderBottom={idx !== questions.length - 1 ? '1px solid #263445' : 'none'}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="#fff">{question.question_text}</Typography>
                      <Typography variant="body2" color="#fff">
                        {question.question_type === 'text'
                          ? 'Text Field'
                          : `${question.question_type.charAt(0).toUpperCase() + question.question_type.slice(1)}: ${question.options?.join(', ')}`}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton edge="end" color="primary" onClick={() => handleEdit(question)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" color="error" onClick={() => handleDelete(question._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
                Add Question
              </Button>
            </Box>
          </>
        )}
      </Paper>
      <QuestionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editData}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Question"
        message="Are you sure you want to delete this question?"
      />
    </Box>
  );
} 