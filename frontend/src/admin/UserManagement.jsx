import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel, MenuItem, CircularProgress, Tooltip, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, FormControl, InputLabel, Select, alpha
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
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        fontWeight: 700,
        fontSize: '1.25rem'
      }}>
        {initialData ? 'Edit User' : 'Add User'}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Full Name"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          fullWidth
          margin="normal"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
          type="email"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />
        <TextField
          select
          label="Gender"
          name="gender"
          value={form.gender}
          onChange={handleChange}
          fullWidth
          margin="normal"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
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
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 2,
            }
          }}
        >
          {initialData ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ConfirmDialog({ open, onClose, onConfirm, title, message }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 1, 
        fontWeight: 700,
        fontSize: '1.25rem'
      }}>
        {title || 'Confirm'}
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ pt: 1, fontWeight: 500 }}>
          {message || 'Are you sure?'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button 
          onClick={onClose}
          variant="outlined"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 2,
            }
          }}
        >
          Delete
        </Button>
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
    <Box p={{ xs: 2, md: 4 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: { xs: 3, md: 4 }, 
          mb: 3, 
          borderRadius: 3, 
          background: (t) => t.palette.background.paper,
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} mb={3}>
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              User Management
            </Typography>
            {isSuperAdmin ? (
              <Chip 
                label="Super Admin Mode: Full Access"
                size="small"
                color="error"
                sx={{ fontWeight: 600 }}
              />
            ) : (
              <Chip 
                label="Admin Mode: Limited Access"
                size="small"
                color="warning"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={handleAdd} 
            sx={{ 
              borderRadius: 2, 
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 2,
              }
            }}
          >
            Add User
          </Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer 
            component={Paper} 
            elevation={0}
            sx={{ 
              borderRadius: 2,
              border: (t) => `1px solid ${t.palette.divider}`,
            }}
          >
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow sx={{ 
                  background: (t) => t.palette.mode === 'dark' 
                    ? alpha(t.palette.primary.main, 0.08)
                    : alpha(t.palette.primary.main, 0.04),
                }}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Full Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    <Box display="flex" flexDirection="column">
                      Date of Birth
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>Active</TableCell>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    <Box display="flex" flexDirection="column">
                      <span>Roles</span>
                      {isSuperAdmin ? (
                        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.7rem' }}>
                          (Editable)
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                          (View only)
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    <Box display="flex" flexDirection="column" alignItems="flex-end">
                      <span>Actions</span>
                      {isSuperAdmin ? (
                        <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, fontSize: '0.7rem' }}>
                          (Full access)
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.7rem' }}>
                          (Limited access)
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow 
                    key={user._id} 
                    sx={{ 
                      '&:hover': {
                        bgcolor: (t) => t.palette.mode === 'dark' 
                          ? alpha(t.palette.primary.main, 0.05)
                          : alpha(t.palette.primary.main, 0.02),
                      },
                      borderBottom: (t) => `1px solid ${t.palette.divider}`,
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>{user.fullName}</TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.9rem' }}>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.gender} 
                        size="small"
                        variant="outlined"
                        sx={{ 
                          textTransform: 'capitalize',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.9rem' }}>
                      {user.date_of_birth ? user.date_of_birth.slice(0, 10) : '—'}
                    </TableCell>
                    <TableCell>
                      {user.isActivated ? (
                        <Chip 
                          label="Active" 
                          color="success" 
                          size="small"
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: 1.5,
                          }}
                        />
                      ) : (
                        <Chip 
                          label="Inactive" 
                          color="warning" 
                          size="small"
                          sx={{ 
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            borderRadius: 1.5,
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={0.5} flexWrap="wrap">
                        {Array.isArray(user.roles) && user.roles.map(role => (
                          <Chip 
                            key={role} 
                            label={role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                            size="small" 
                            sx={{ 
                              bgcolor: role === 'super_admin' 
                                ? 'error.main' 
                                : role === 'admin' 
                                ? 'warning.main' 
                                : 'primary.main',
                              color: '#fff',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderRadius: 1.5,
                            }} 
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box display="flex" gap={0.5} justifyContent="flex-end" alignItems="center">
                        <Tooltip title="Edit User" arrow>
                          <IconButton 
                            size="small"
                            onClick={() => handleEdit(user)}
                            sx={{ 
                              color: 'primary.main',
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                              '&:hover': {
                                bgcolor: (t) => alpha(t.palette.primary.main, 0.15),
                              }
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete User" arrow>
                          <IconButton 
                            size="small"
                            onClick={() => handleDelete(user._id)}
                            sx={{ 
                              color: 'error.main',
                              bgcolor: (t) => alpha(t.palette.error.main, 0.08),
                              '&:hover': {
                                bgcolor: (t) => alpha(t.palette.error.main, 0.15),
                              }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {isSuperAdmin && (
                          <Chip 
                            label="Role Editable" 
                            size="small" 
                            color="success"
                            sx={{ 
                              ml: 1, 
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              height: 24,
                            }} 
                          />
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
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