import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, MenuItem, CircularProgress, Tooltip, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControl, InputLabel, Select
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

function UserFormDialog({ open, onClose, onSubmit, initialData, isSuperAdmin, roles }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    gender: '',
    date_of_birth: '',
    isActivated: true,
    role: ''
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
        role: initialData.roles?.[0] || ''
      });
    } else {
      setForm({ fullName: '', email: '', gender: '', date_of_birth: '', isActivated: true, role: '' });
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

  const formatRole = (roleName) => {
    return roleName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
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
        
        {/* Role selection - only visible to super admins */}
        {isSuperAdmin ? (
          <>
            <Typography variant="body2" color="#90caf9" sx={{ mt: 2, mb: 1 }}>
              Super Admin: You can change this user's role
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>
              <Select
                name="role"
                value={form.role}
                onChange={handleChange}
                label="Role"
              >
                {roles.map((role) => (
                  <MenuItem key={role._id} value={role.role_name}>
                    {formatRole(role.role_name)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        ) : (
          <Typography variant="body2" color="#b0bec5" sx={{ mt: 2, mb: 1, fontStyle: 'italic' }}>
            Note: Only Super Admins can change user roles
          </Typography>
        )}
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
  const [roles, setRoles] = useState([]); // State to hold roles for super admin
  const [currentUserRoles, setCurrentUserRoles] = useState([]); // Current user's roles

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

  const loadRoles = async () => {
    try {
      // Only try to fetch roles if user is super admin
      if (currentUserRoles.includes('super_admin')) {
        const res = await axiosInstance.get('/roles');
        setRoles(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch roles:', err);
    }
  };

  const loadCurrentUserRoles = async () => {
    try {
      const res = await axiosInstance.get('/users/roles');
      setCurrentUserRoles(res.data.data);
    } catch (err) {
      console.error('Failed to fetch current user roles:', err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadCurrentUserRoles();
  }, []);

  // Load roles after current user roles are loaded
  useEffect(() => {
    if (currentUserRoles.includes('super_admin')) {
      loadRoles();
    }
  }, [currentUserRoles]);

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
        // Update user details
        await axiosInstance.put(`/users/updateUser/${editData._id}`, {
          fullName: data.fullName,
          email: data.email,
          gender: data.gender,
          date_of_birth: data.date_of_birth,
          isActivated: data.isActivated
        });

        // Update user role if it's a super admin and role has changed
        if (isSuperAdmin && data.role && data.role !== editData.roles?.[0]) {
          await axiosInstance.put(`/users/updateUserRole/${editData._id}`, {
            role: data.role
          });
        }

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

  const isSuperAdmin = currentUserRoles.includes('super_admin');

  return (
    <Box p={3}>
      <Paper elevation={3} sx={{ p: 4, mb: 2, borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(25, 118, 210, 0.08)', background: '#101624', color: '#fff' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#fff">
          User Management
        </Typography>
        {isSuperAdmin ? (
          <Typography variant="body2" color="#90caf9" mb={2}>
            Super Admin Mode: You can edit user roles and permissions
          </Typography>
        ) : (
          <Typography variant="body2" color="#b0bec5" mb={2}>
            Admin Mode: You can edit user details but cannot change roles
          </Typography>
        )}
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
                  <TableCell sx={{ color: '#fff' }}>
                    Roles
                    {isSuperAdmin ? (
                      <Typography variant="caption" display="block" sx={{ color: '#90caf9', fontWeight: 'normal' }}>
                        (Editable)
                      </Typography>
                    ) : (
                      <Typography variant="caption" display="block" sx={{ color: '#b0bec5', fontWeight: 'normal' }}>
                        (View only)
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right" sx={{ color: '#fff' }}>
                    Actions
                    {isSuperAdmin ? (
                      <Typography variant="caption" display="block" sx={{ color: '#90caf9', fontWeight: 'normal' }}>
                        (Full access)
                      </Typography>
                    ) : (
                      <Typography variant="caption" display="block" sx={{ color: '#b0bec5', fontWeight: 'normal' }}>
                        (Limited access)
                      </Typography>
                    )}
                  </TableCell>
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
                        <Chip 
                          key={role} 
                          label={role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                          size="small" 
                          sx={{ 
                            mr: 0.5, 
                            color: '#fff', 
                            bgcolor: role === 'super_admin' ? '#d32f2f' : role === 'admin' ? '#ed6c02' : '#1976d2', 
                            fontWeight: 600 
                          }} 
                        />
                      ))}
                    </TableCell>
                    <TableCell align="right" sx={{ color: '#fff' }}>
                      <Tooltip title="Edit">
                        <IconButton color="primary" onClick={() => handleEdit(user)}><EditIcon /></IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton color="error" onClick={() => handleDelete(user._id)}><DeleteIcon /></IconButton>
                      </Tooltip>
                      {isSuperAdmin && (
                        <Tooltip title="Super Admin: Can edit roles">
                          <Chip 
                            label="Role Editable" 
                            size="small" 
                            sx={{ 
                              ml: 1, 
                              color: '#fff', 
                              bgcolor: '#4caf50', 
                              fontSize: '0.7rem' 
                            }} 
                          />
                        </Tooltip>
                      )}
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
        isSuperAdmin={isSuperAdmin}
        roles={roles}
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