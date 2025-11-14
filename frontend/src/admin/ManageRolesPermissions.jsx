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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import axios from 'axios';

export default function ManageRolesPermissions() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Fetch roles
      const rolesResponse = await axios.get('http://localhost:5000/api/v1/roles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoles(rolesResponse.data.data || []);

      // Fetch permissions
      const permissionsResponse = await axios.get('http://localhost:5000/api/v1/permissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPermissions(permissionsResponse.data.data || []);

      // Fetch role permissions for each role
      const rolePerms = {};
      for (const role of rolesResponse.data.data || []) {
        const rolePermsResponse = await axios.get(`http://localhost:5000/api/v1/roles/${role._id}/permissions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        rolePerms[role._id] = rolePermsResponse.data.data || [];
      }
      setRolePermissions(rolePerms);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (role) => {
    setSelectedRole(role);
    const currentPerms = rolePermissions[role._id] || [];
    setSelectedPermissions(currentPerms.map(rp => rp.permission_id._id));
    setEditDialogOpen(true);
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      const token = localStorage.getItem('accessToken');
      
      await axios.put(`http://localhost:5000/api/v1/roles/${selectedRole._id}/permissions`, {
        permissionIds: selectedPermissions
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setEditDialogOpen(false);
      setSelectedRole(null);
      fetchData(); // Refresh the data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSaveLoading(false);
    }
  };

  const getPermissionCategory = (permission) => {
    return permission.category || 'general';
  };

  const groupPermissionsByCategory = () => {
    const grouped = {};
    permissions.forEach(permission => {
      const category = getPermissionCategory(permission);
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(permission);
    });
    return grouped;
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'super_admin': return 'error';
      case 'admin': return 'warning';
      case 'user': return 'info';
      default: return 'default';
    }
  };

  const formatRole = (roleName) => {
    return roleName.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatPermission = (permission) => {
    return permission.description || permission.name;
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
        <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
        Manage Roles & Permissions
      </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
        Assign and manage permissions for different user roles
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

        <Paper 
          elevation={0} 
          sx={{ 
            bgcolor: 'background.paper',
            border: (t) => `1px solid ${t.palette.divider}`,
            borderRadius: 3,
          }}
        >
        <TableContainer>
          <Table>
            <TableHead>
                <TableRow 
                  sx={{ 
                    bgcolor: (t) => t.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.08)' 
                      : 'rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Permissions Count</TableCell>
                  <TableCell sx={{ color: 'text.primary', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {roles.map((role) => (
                  <TableRow 
                    key={role._id} 
                    sx={{ 
                      '&:hover': { 
                        bgcolor: (t) => t.palette.mode === 'dark' 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.02)',
                      } 
                    }}
                  >
                  <TableCell>
                    <Chip
                      label={formatRole(role.role_name)}
                      color={getRoleColor(role.role_name)}
                      size="medium"
                      sx={{
                        minWidth: 140,
                        fontWeight: 600
                      }}
                    />
                  </TableCell>
                    <TableCell sx={{ color: 'text.primary' }}>
                    {(rolePermissions[role._id] || []).length} permissions
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit Permissions">
                      <IconButton
                        onClick={() => handleEditClick(role)}
                          sx={{ color: 'primary.main' }}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit Permissions Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
            sx: { 
              bgcolor: 'background.paper',
              borderRadius: 3,
            }
        }}
      >
        <DialogTitle>
          Edit Permissions for {selectedRole ? formatRole(selectedRole.role_name) : ''}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {Object.entries(groupPermissionsByCategory()).map(([category, categoryPermissions]) => (
                <Accordion 
                  key={category} 
                  sx={{ 
                    bgcolor: (t) => t.palette.mode === 'dark' 
                      ? 'rgba(255, 255, 255, 0.05)' 
                      : 'rgba(0, 0, 0, 0.02)',
                    mb: 1,
                    borderRadius: 2,
                    '&:before': {
                      display: 'none',
                    },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'text.primary' }} />}>
                  <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                    {category.replace('_', ' ')}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {categoryPermissions.map((permission) => (
                      <FormControlLabel
                        key={permission._id}
                        control={
                          <Checkbox
                            checked={selectedPermissions.includes(permission._id)}
                            onChange={() => handlePermissionToggle(permission._id)}
                            sx={{
                                color: 'primary.main',
                                '&.Mui-checked': { color: 'primary.main' }
                            }}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {permission.name}
                            </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {formatPermission(permission)}
                            </Typography>
                          </Box>
                        }
                      />
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
          </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setEditDialogOpen(false)}
              sx={{ color: 'text.secondary' }}
          >
            Cancel
          </Button>
            <Button
            onClick={handleSave}
            variant="contained"
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
