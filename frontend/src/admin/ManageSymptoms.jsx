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
      try {
        const data = await fetchDiseases();
        console.log('Diseases loaded:', data);
        setDiseases(data);
        if (data && data.length > 0) {
          setSelectedDisease(data[0]._id);
        }
      } catch (err) {
        console.error('Error loading diseases:', err);
      }
      setLoading(false);
    };
    loadDiseases();
  }, []);

  useEffect(() => {
    if (selectedDisease) {
      console.log('Selected disease ID:', selectedDisease);
      setSymptomLoading(true);
      setError(null);
      fetchSymptomsByDisease(selectedDisease)
        .then(data => {
          console.log('Symptoms fetched:', data);
          setSymptoms(data);
          setSymptomLoading(false);
        })
        .catch(err => {
          console.error('Error fetching symptoms:', err);
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
      <Paper elevation={3} sx={{ p: 4, mb: 2, borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.08)', background: '#101624', color: '#fff' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#fff">
          Manage Symptoms
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
        {selectedDisease && (
          <>
            {symptomLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
                <CircularProgress sx={{ color: '#fff' }} />
              </Box>
            ) : error ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight={80}>
                <Typography color="#fff">{error}</Typography>
              </Box>
            ) : (
              <Box>
                {symptoms.map((symptom, idx) => (
                  <Box key={symptom._id} display="flex" alignItems="center" justifyContent="space-between" py={2} borderBottom={idx !== symptoms.length - 1 ? '1px solid #263445' : 'none'}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700} color="#fff">{symptom.name}</Typography>
                      <Typography variant="body2" color="#fff">{symptom.description}</Typography>
                    </Box>
                    <Box>
                      <IconButton edge="end" color="primary" onClick={() => handleEdit(symptom)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" color="error" onClick={() => handleDelete(symptom._id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
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