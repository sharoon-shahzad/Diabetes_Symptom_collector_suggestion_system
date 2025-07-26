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
      <Paper elevation={3} sx={{ p: 4, mb: 2, borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.08)', background: '#101624', color: '#fff' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#fff">
          Manage Diseases
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress sx={{ color: '#fff' }} />
          </Box>
        ) : (
          <Box>
            {diseases.length === 0 ? (
              <Typography color="#fff" sx={{ my: 2 }}>No diseases found.</Typography>
            ) : (
              diseases.map((disease, idx) => (
                <Box key={disease._id} display="flex" alignItems="center" justifyContent="space-between" py={2} borderBottom={idx !== diseases.length - 1 ? '1px solid #263445' : 'none'}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="#fff">{disease.name}</Typography>
                    <Typography variant="body2" color="#fff">{disease.description}</Typography>
                  </Box>
                  <Box>
                    <IconButton edge="end" color="primary" onClick={() => handleEdit(disease)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton edge="end" color="error" onClick={() => handleDelete(disease._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>
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