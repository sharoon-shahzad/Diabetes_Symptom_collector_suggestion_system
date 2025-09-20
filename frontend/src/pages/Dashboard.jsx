import React, { useEffect, useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Avatar, CssBaseline, Paper, Card, CardContent, CircularProgress, Alert, Grid, Divider, Chip, Modal, IconButton, Tooltip
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HealingIcon from '@mui/icons-material/Healing';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth';
import { fetchMyDiseaseData } from '../utils/api';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import EditDiseaseData from '../components/Dashboard/EditDiseaseData';
import ThemeToggle from '../components/Common/ThemeToggle';

const drawerWidth = 220;

const sections = [
  { label: 'My Account', icon: <AccountCircleIcon /> },
  { label: 'My Disease Data', icon: <HealingIcon /> },
];

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [diseaseData, setDiseaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        navigate('/signin');
      }
    }
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (selectedIndex === 1) {
      setLoading(true);
      setError(null);
      fetchMyDiseaseData()
        .then((data) => setDiseaseData(data))
        .catch(() => setError('Failed to load disease data.'))
        .finally(() => setLoading(false));
    }
  }, [selectedIndex]);

  const handleLogout = async () => {
    await logout();
    navigate('/signin');
  };

  const handleEditDiseaseData = () => {
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleDataUpdated = () => {
    if (selectedIndex === 1) {
      setLoading(true);
      fetchMyDiseaseData()
        .then((data) => setDiseaseData(data))
        .catch(() => setError('Failed to load disease data.'))
        .finally(() => setLoading(false));
    }
  };

  const handleAssessRisk = () => {
    navigate('/assessment');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            bgcolor: 'background.sidebar',
            color: 'text.primary',
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            boxShadow: '4px 0 24px 0 rgba(0,0,0,0.12)',
            border: 'none', // Ensure no border or divider between sidebar and main area
            pt: 0,
            px: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          },
        }}
      >
        <Box>
          {/* User Info */}
          <Box display="flex" flexDirection="column" alignItems="center" py={2}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40, mb: 1, fontSize: 20 }}>
              {user?.fullName?.[0] || 'U'}
            </Avatar>
            <Typography fontWeight={700} fontSize={16}>{user?.fullName}</Typography>
            <Typography fontSize={13} color="text.secondary">{user?.email}</Typography>
          </Box>
          <Divider sx={{ my: 1, bgcolor: 'divider' }} />
          {/* Navigation */}
          <List>
            {sections.map((section, idx) => (
              <ListItem
                key={section.label}
                selected={selectedIndex === idx}
                onClick={() => setSelectedIndex(idx)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                  },
                  transition: 'background 0.2s',
                  cursor: 'pointer',
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main', minWidth: 36 }}>{section.icon}</ListItemIcon>
                <ListItemText primary={<Typography fontWeight={600}>{section.label}</Typography>} />
              </ListItem>
            ))}
          </List>
        </Box>
        <Box pb={2} px={2}>
          <Divider sx={{ mb: 1, bgcolor: 'divider' }} />
          <Box display="flex" justifyContent="center" mb={1}>
            <ThemeToggle size="small" />
          </Box>
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
      {/* Main Content */}
      <Box component="main" sx={{
        flexGrow: 1,
        p: { xs: 2, md: 6 },
        ml: 0, // Remove left margin so content is flush with sidebar
        mt: 0,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'background.default',
      }}>
        <Paper elevation={6} sx={{
          width: '100%',
          maxWidth: 900,
          minHeight: 480,
          borderRadius: 6,
          p: { xs: 2, md: 5 },
          mt: 2,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.10)',
          background: 'background.paper',
          color: 'text.primary',
        }}>
          {/* Section Header */}
          <Box mb={4} display="flex" alignItems="center" gap={2}>
            <Typography variant="h4" fontWeight={900}>
              {selectedIndex === 0 ? 'My Account' : 'My Disease Data'}
            </Typography>
            {selectedIndex === 1 && diseaseData && diseaseData.disease && (
              <Tooltip title="Edit Disease Data">
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={handleEditDiseaseData}
                  sx={{ borderRadius: 2, fontWeight: 700, ml: 2 }}
                >
                  Edit
                </Button>
              </Tooltip>
            )}
            {selectedIndex === 1 && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => navigate('/assessment')}
                sx={{ borderRadius: 2, fontWeight: 700, ml: 1 }}
              >
                View Assessment
              </Button>
            )}
          </Box>
          <Divider sx={{ mb: 4, bgcolor: 'divider' }} />
          {selectedIndex === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card elevation={3} sx={{ borderRadius: 4, bgcolor: 'background.card', color: 'text.primary', mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700} gutterBottom>Profile Information</Typography>
                    <Divider sx={{ mb: 2, bgcolor: '#263445' }} />
                    <Typography variant="body1" mb={1}><b>Name:</b> {user?.fullName}</Typography>
                    <Typography variant="body1" mb={1}><b>Email:</b> {user?.email}</Typography>
                    <Typography variant="body1" mb={1}><b>Gender:</b> {user?.gender}</Typography>
                    <Typography variant="body1" mb={1}><b>Date of Birth:</b> {user?.date_of_birth}</Typography>
                    <Typography variant="body1" mb={1}><b>Account Status:</b> {user?.isActivated ? 'Activated' : 'Not Activated'}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          {selectedIndex === 1 && (
            <Box>
              {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Box p={3}>
                  <Alert severity="error">{error}</Alert>
                </Box>
              ) : !diseaseData || !diseaseData.disease ? (
                <Box p={3}>
                  <Box mb={3}>
                    <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                      Details Progress
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={0}
                          sx={{ height: 12, borderRadius: 6, background: '#e3f0ff' }}
                        />
                      </Box>
                      <Typography fontWeight={700} color="primary.main">
                        0%
                      </Typography>
                    </Box>
                    <Box mt={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate('/onboarding')}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                      >
                        Fill Your Details
                      </Button>
                    </Box>
                  </Box>
                </Box>
              ) : (
                <>
                  {/* Progress Bar and Percentage */}
                  {typeof diseaseData.totalQuestions === 'number' && diseaseData.totalQuestions > 0 && (
                    <Box mb={3}>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Onboarding Progress
                      </Typography>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.round((diseaseData.answeredQuestions / diseaseData.totalQuestions) * 100)}
                            sx={{ height: 12, borderRadius: 6, background: '#e3f0ff' }}
                          />
                        </Box>
                        <Typography fontWeight={700} color="primary.main">
                          {Math.round((diseaseData.answeredQuestions / diseaseData.totalQuestions) * 100)}%
                        </Typography>
                      </Box>
                      {diseaseData.answeredQuestions < diseaseData.totalQuestions && (
                        <Box mt={2}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => navigate('/onboarding')}
                            sx={{ borderRadius: 2, fontWeight: 700 }}
                          >
                            Fill Remaining Details
                          </Button>
                        </Box>
                      )}
                    </Box>
                  )}
                  <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto' }}>
                    {/* Disease Info Card */}
                    <Card elevation={4} sx={{ mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #f4f8fb 60%, #e3f0ff 100%)', color: '#23272f', width: '100%' }}>
                      <CardContent>
                        <Typography variant="h5" fontWeight="bold" color="primary.main">
                          {diseaseData.disease}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                          Last updated: {diseaseData.lastUpdated ? new Date(diseaseData.lastUpdated).toLocaleString() : 'N/A'}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Box>
                      {diseaseData.symptoms && diseaseData.symptoms.length > 0 ? (
                        diseaseData.symptoms.map((symptom, idx) => (
                          <Card key={symptom.name || idx} elevation={2} sx={{ borderRadius: 3, mb: 4, bgcolor: '#f4f8fb', color: '#23272f', width: '100%' }}>
                            <CardContent>
                              <Typography variant="h6" fontWeight="bold" color="secondary.main" gutterBottom>
                                {symptom.name}
                              </Typography>
                              {symptom.questions && symptom.questions.length > 0 ? (
                                <Box>
                                  {symptom.questions.map((q, qIdx) => (
                                    <Box key={q.question + qIdx} mb={2}>
                                      <Typography variant="subtitle1" fontWeight={500}>
                                        Q: {q.question}
                                      </Typography>
                                      <Box display="flex" alignItems="center" gap={1}>
                                        <Chip label={q.answer} color="primary" variant="outlined" />
                                        <Typography variant="caption" color="text.secondary">
                                          {q.date ? new Date(q.date).toLocaleDateString() : ''}
                                        </Typography>
                                      </Box>
                                      {qIdx < symptom.questions.length - 1 && <Divider sx={{ my: 1 }} />}
                                    </Box>
                                  ))}
                                </Box>
                              ) : (
                                <Typography color="text.secondary">No questions answered for this symptom.</Typography>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <Alert severity="info">No symptoms or answers found for this disease.</Alert>
                      )}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          )}
        </Paper>
      </Box>

      {/* Edit Disease Data Modal */}
      <Modal
        open={showEditModal}
        onClose={handleCloseEditModal}
        aria-labelledby="edit-disease-data-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1000,
            maxHeight: '90vh',
            bgcolor: '#fff',
            borderRadius: 3,
            boxShadow: 24,
            overflow: 'auto',
            p: 3,
            position: 'relative',
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography id="edit-disease-data-modal" variant="h6" fontWeight={700} color="#23272f">
              Edit Disease Data
            </Typography>
            <IconButton onClick={handleCloseEditModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <EditDiseaseData
            onClose={handleCloseEditModal}
            onDataUpdated={handleDataUpdated}
          />
        </Box>
      </Modal>
    </Box>
  );
}