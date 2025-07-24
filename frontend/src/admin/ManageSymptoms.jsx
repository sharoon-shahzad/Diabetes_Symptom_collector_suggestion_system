import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, FormControl, InputLabel, Select, MenuItem, CircularProgress, List, ListItem, ListItemText, IconButton, ListItemSecondaryAction } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { fetchDiseases, fetchSymptomsByDisease, addSymptom, updateSymptom, deleteSymptom } from '../utils/api';
import SymptomForm from './SymptomForm';
import ConfirmDialog from './ConfirmDialog';

export default function ManageSymptoms() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisease, setSelectedDisease] = useState('');
  const [symptoms, setSymptoms] = useState([]);
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDiseases = async () => {
      setLoading(true);
      const data = await fetchDiseases();
      setDiseases(data);
      setLoading(false);
    };
    loadDiseases();
  }, []);

  useEffect(() => {
    if (selectedDisease) {
      setSymptomLoading(true);
      setError(null);
      fetchSymptomsByDisease(selectedDisease)
        .then(data => {
          setSymptoms(data);
          setSymptomLoading(false);
        })
        .catch(err => {
          setError('Failed to fetch symptoms.');
          setSymptoms([]);
          setSymptomLoading(false);
        });
    } else {
      setSymptoms([]);
      setError(null);
    }
  }, [selectedDisease]);

  const handleAdd = () => {
    setEditData(null);
    setFormOpen(true);
  };

  const handleEdit = (symptom) => {
    setEditData(symptom);
    setFormOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setFormOpen(false);
    if (editData) {
      await updateSymptom(editData._id, data);
    } else {
      await addSymptom(selectedDisease, data);
    }
    const updated = await fetchSymptomsByDisease(selectedDisease);
    setSymptoms(updated);
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    if (deleteId) {
      await deleteSymptom(deleteId);
      setDeleteId(null);
      const updated = await fetchSymptomsByDisease(selectedDisease);
      setSymptoms(updated);
    }
  };

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 4, mb: 2, borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.08)', background: 'linear-gradient(135deg, #f4f8fb 60%, #e3f0ff 100%)' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Manage Symptoms
        </Typography>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Disease</InputLabel>
          <Select
            label="Select Disease"
            value={selectedDisease}
            onChange={e => setSelectedDisease(e.target.value)}
            disabled={loading}
          >
            {loading ? (
              <MenuItem value=""><CircularProgress size={20} /></MenuItem>
            ) : diseases.length === 0 ? (
              <MenuItem value="" disabled>No diseases found</MenuItem>
            ) : (
              diseases.map(disease => (
                <MenuItem key={disease._id} value={disease._id}>{disease.name}</MenuItem>
              ))
            )}
          </Select>
        </FormControl>
        {selectedDisease && (
          <>
            {symptomLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
                <Typography color="error">{error}</Typography>
              </Box>
            ) : (
              <List sx={{ background: 'transparent' }}>
                {symptoms.map(symptom => (
                  <ListItem key={symptom._id} divider sx={{ background: 'rgba(255,255,255,0.7)', borderRadius: 2, mb: 2, boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.04)' }}>
                    <ListItemText
                      primary={symptom.name}
                      secondary={symptom.description}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" color="primary" onClick={() => handleEdit(symptom)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" color="error" onClick={() => handleDelete(symptom._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
                Add Symptom
              </Button>
            </Box>
          </>
        )}
      </Paper>
      <SymptomForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editData}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Symptom"
        message="Are you sure you want to delete this symptom? This will also delete all related questions."
      />
    </Box>
  );
} 