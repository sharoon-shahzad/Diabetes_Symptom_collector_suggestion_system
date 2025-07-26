import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, MenuItem, CircularProgress, Tooltip, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axiosInstance from '../utils/axiosInstance';

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

function UserFormDialog({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    gender: '',
    date_of_birth: '',
    isActivated: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        fullName: initialData.fullName || '',
        email: initialData.email || '',
        gender: initialData.gender || '',
        date_of_birth: initialData.date_of_birth ? initialData.date_of_birth.slice(0, 10) : '',
        isActivated: initialData.isActivated,
      });
    } else {
      setForm({ fullName: '', email: '', gender: '', date_of_birth: '', isActivated: true });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? 'Edit User' : 'Add User'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          type="email"
        />
        <TextField
          select
          label="Gender"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          fullWidth
          margin="normal"
        >
          {GENDER_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Date of Birth"
          name="date_of_birth"
          value={form.date_of_birth}
          onChange={handleChange}
          fullWidth
          margin="normal"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
        <FormControlLabel
          control={<Switch checked={form.isActivated} onChange={handleChange} name="isActivated" />}
          label="Activated"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>{initialData ? 'Update' : 'Add'}</Button>
      </DialogActions>
    </Dialog>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title || 'Confirm'}</DialogTitle>
      <DialogContent>
        <Typography>{message || 'Are you sure?'}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/users/allUsers');
      setUsers(res.data.data.filter(u => !u.deleted_at));
    } catch (err) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAdd = () => {
    setEditData(null);
    setFormOpen(true);
  };

  const handleEdit = (user) => {
    setEditData(user);
    setFormOpen(true);
  };

  const handleDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editData) {
        await axiosInstance.put(`/users/updateUser/${editData._id}`, data);
        toast.success('User updated successfully');
      } else {
        toast.info('Add user not implemented');
      }
      setFormOpen(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/users/deleteUser/${deleteId}`);
      toast.success('User deleted successfully');
      setDeleteId(null);
      setConfirmOpen(false);
      loadUsers();
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 4, mb: 2, borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.08)', background: '#101624', color: '#fff' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#fff">
          User Management
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={120}>
            <CircularProgress sx={{ color: '#fff' }} />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ background: '#101624', borderRadius: 3, boxShadow: '0 2px 8px 0 rgba(25, 118, 210, 0.04)', color: '#fff' }}>
            <Table sx={{ background: '#101624', color: '#fff' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: '#fff' }}>Full Name</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Email</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Gender</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Date of Birth</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Active</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Roles</TableCell>
                  <TableCell align="right" sx={{ color: '#fff' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user._id} sx={{ background: '#101624', color: '#fff' }}>
                    <TableCell sx={{ color: '#fff' }}>{user.fullName}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{user.email}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{user.gender}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>{user.date_of_birth ? user.date_of_birth.slice(0, 10) : ''}</TableCell>
                    <TableCell sx={{ color: '#fff' }}>
                      {user.isActivated ? (
                        <Chip label="Active" color="success" size="small" />
                      ) : (
                        <Chip label="Inactive" color="warning" size="small" />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: '#fff' }}>
                      {Array.isArray(user.roles) && user.roles.map(role => (
                        <Chip key={role} label={role} size="small" sx={{ mr: 0.5, color: '#fff', bgcolor: '#1976d2', fontWeight: 600 }} />
                      ))}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#fff' }}>
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEdit(user)}><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(user._id)}><DeleteIcon /></IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd} sx={{ color: '#fff', bgcolor: '#1976d2', fontWeight: 600, '&:hover': { bgcolor: '#1565c0' } }}>
            Add User
          </Button>
        </Box>
      </Paper>
      <UserFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editData}
      />
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user?"
      />
    </Box>
  );
} 