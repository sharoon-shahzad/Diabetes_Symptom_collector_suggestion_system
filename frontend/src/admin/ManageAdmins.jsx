import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Tooltip,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    role: ''
  });
  const [roles, setRoles] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:5000/api/v1/users/allAdmins', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmins(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:5000/api/v1/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setEditForm({
      fullName: admin.fullName,
      email: admin.email,
      role: admin.roles?.[0] || 'user'
    });
    setEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    try {
      setSaveLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Update user details
      await axios.put(`http://localhost:5000/api/v1/users/updateUser/${selectedAdmin._id}`, {
        fullName: editForm.fullName,
        email: editForm.email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update user role if changed
      if (editForm.role !== selectedAdmin.roles?.[0]) {
        await axios.put(`http://localhost:5000/api/v1/users/updateUserRole/${selectedAdmin._id}`, {
          role: editForm.role
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setEditDialogOpen(false);
      setSelectedAdmin(null);
      fetchAdmins(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update admin');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://localhost:5000/api/v1/users/deleteUser/${adminId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdmins(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete admin');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin': return 'error';
      case 'admin': return 'warning';
      case 'user': return 'info';
      default: return 'default';
    }
  };

  const formatRole = (role) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom color="#fff">
        Manage Admins
      </Typography>
      <Typography variant="body1" color="#b0bec5" mb={4}>
        Manage admin users, their roles, and permissions
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper elevation={3} sx={{ bgcolor: '#1e2a3a', color: '#fff' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#263445' }}>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Role</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#fff', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin._id} sx={{ '&:hover': { bgcolor: '#263445' } }}>
                  <TableCell sx={{ color: '#fff' }}>{admin.fullName}</TableCell>
                  <TableCell sx={{ color: '#fff' }}>{admin.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={formatRole(admin.roles?.[0] || 'user')}
                      color={getRoleColor(admin.roles?.[0] || 'user')}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={admin.isActivated ? 'Active' : 'Inactive'}
                      color={admin.isActivated ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Admin">
                      <IconButton
                        onClick={() => handleEditClick(admin)}
                        sx={{ color: '#90caf9', mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Admin">
                      <IconButton
                        onClick={() => handleDeleteAdmin(admin._id)}
                        disabled={deleteLoading}
                        sx={{ color: '#ef5350' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1e2a3a', color: '#fff' }}>
          Edit Admin
        </DialogTitle>
        <DialogContent sx={{ bgcolor: '#1e2a3a', color: '#fff' }}>
          <TextField
            fullWidth
            label="Full Name"
            value={editForm.fullName}
            onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#263445' },
                '&:hover fieldset': { borderColor: '#90caf9' },
                '&.Mui-focused fieldset': { borderColor: '#90caf9' }
              },
              '& .MuiInputLabel-root': { color: '#b0bec5' },
              '& .MuiInputBase-input': { color: '#fff' }
            }}
          />
          <TextField
            fullWidth
            label="Email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            margin="normal"
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#263445' },
                '&:hover fieldset': { borderColor: '#90caf9' },
                '&.Mui-focused fieldset': { borderColor: '#90caf9' }
              },
              '& .MuiInputLabel-root': { color: '#b0bec5' },
              '& .MuiInputBase-input': { color: '#fff' }
            }}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel sx={{ color: '#b0bec5' }}>Role</InputLabel>
            <Select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              sx={{
                color: '#fff',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#263445' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#90caf9' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#90caf9' }
              }}
            >
              {roles.map((role) => (
                <MenuItem key={role._id} value={role.role_name}>
                  {formatRole(role.role_name)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1e2a3a' }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ color: '#b0bec5' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={saveLoading}
            sx={{ bgcolor: '#90caf9', color: '#1e2a3a' }}
          >
            {saveLoading ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
