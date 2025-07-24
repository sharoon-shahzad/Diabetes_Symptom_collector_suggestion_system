import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, List, ListItem, ListItemText, IconButton, ListItemSecondaryAction, CircularProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { fetchDiseases, addDisease, updateDisease, deleteDisease } from '../utils/api';
import DiseaseForm from './DiseaseForm';
import ConfirmDialog from './ConfirmDialog';

export default function ManageDiseases() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadDiseases = async () => {
    setLoading(true);
    try {
      const data = await fetchDiseases();
      setDiseases(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiseases();
  }, []);

  const handleAdd = () => {
    setEditData(null);
    setFormOpen(true);
  };

  const handleEdit = (disease) => {
    setEditData(disease);
    setFormOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleFormSubmit = async (data) => {
    setFormOpen(false);
    if (editData) {
      await updateDisease(editData._id, data);
    } else {
      await addDisease(data);
    }
    loadDiseases();
  };

  const handleConfirmDelete = async () => {
    setConfirmOpen(false);
    if (deleteId) {
      await deleteDisease(deleteId);
      setDeleteId(null);
      loadDiseases();
    }
  };

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 4, mb: 2, borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.08)', background: 'linear-gradient(135deg, #f4f8fb 60%, #e3f0ff 100%)' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Manage Diseases
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ background: 'transparent' }}>
            {diseases.map((disease) => (
              <ListItem key={disease._id} divider sx={{ background: 'rgba(255,255,255,0.7)', borderRadius: 2, mb: 2, boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.04)' }}>
                <ListItemText
                  primary={disease.name}
                  secondary={disease.description}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" color="primary" onClick={() => handleEdit(disease)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" color="error" onClick={() => handleDelete(disease._id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
            Add Disease
          </Button>
        </Box>
      </Paper>
      <DiseaseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editData}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Disease"
        message="Are you sure you want to delete this disease? This will also delete all related symptoms and questions."
      />
    </Box>
  );
} 