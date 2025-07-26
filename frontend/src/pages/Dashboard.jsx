import React, { useEffect, useState } from 'react';
import {
  Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, Avatar, CssBaseline, Paper, Card, CardContent, CircularProgress, Alert, Grid, Divider, Chip, Modal
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HealingIcon from '@mui/icons-material/Healing';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../utils/auth';
import { fetchMyDiseaseData } from '../utils/api';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import EditDiseaseData from '../components/Dashboard/EditDiseaseData';

const drawerWidth = 240;

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
    // Refresh disease data when editing is complete
    if (selectedIndex === 1) {
      setLoading(true);
      fetchMyDiseaseData()
        .then((data) => setDiseaseData(data))
        .catch(() => setError('Failed to load disease data.'))
        .finally(() => setLoading(false));
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#0B1120' }}>
      <CssBaseline />
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            bgcolor: '#1e2a3a',
            color: '#fff',
            borderTopRightRadius: 32,
            borderBottomRightRadius: 32,
            boxShadow: '4px 0 24px 0 rgba(30,42,58,0.12)',
            border: 'none',
            pt: 2,
          },
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: '#90caf9', width: 64, height: 64, mb: 1, fontSize: 32 }}>
            {user?.fullName?.[0] || 'U'}
          </Avatar>
          <Typography fontWeight={700} fontSize={18}>{user?.fullName}</Typography>
          <Typography fontSize={14} color="#b0bec5">{user?.email}</Typography>
        </Box>
        <List>
          {sections.map((section, idx) => (
            <ListItem key={section.label} selected={selectedIndex === idx} onClick={() => setSelectedIndex(idx)}>
              <ListItemIcon sx={{ color: '#90caf9' }}>{section.icon}</ListItemIcon>
              <ListItemText primary={section.label} />
            </ListItem>
          ))}
          <ListItem onClick={handleLogout}>
            <ListItemIcon sx={{ color: '#ef5350' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      {/* Main Content */}
      <Box component="main" sx={{
        flexGrow: 1,
        p: { xs: 2, md: 6 },
        ml: { md: `${drawerWidth}px` },
        mt: 0,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #23272f 60%, #0B1120 100%)',
      }}>
        <Paper elevation={4} sx={{
          width: '100%',
          maxWidth: 800,
          minHeight: 420,
          borderRadius: 6,
          p: 4,
          mt: 2,
          boxShadow: '0 8px 32px 0 rgba(25, 118, 210, 0.10)',
          background: 'linear-gradient(135deg, #23272f 60%, #1e2a3a 100%)',
          color: '#fff',
        }}>
          {selectedIndex === 0 && (
            <Box>
              <Typography variant="h5" fontWeight={700} mb={2}>My Account</Typography>
              <Typography variant="body1" mb={1}><b>Name:</b> {user?.fullName}</Typography>
              <Typography variant="body1" mb={1}><b>Email:</b> {user?.email}</Typography>
              <Typography variant="body1" mb={1}><b>Gender:</b> {user?.gender}</Typography>
              <Typography variant="body1" mb={1}><b>Date of Birth:</b> {user?.date_of_birth}</Typography>
              <Typography variant="body1" mb={1}><b>Account Status:</b> {user?.isActivated ? 'Activated' : 'Not Activated'}</Typography>
            </Box>
          )}
          {selectedIndex === 1 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                  My Disease Data
                </Typography>
                {diseaseData && diseaseData.disease && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={handleEditDiseaseData}
                    sx={{ borderRadius: 2, fontWeight: 600 }}
                  >
                    Edit My Disease Data
                  </Button>
                )}
              </Box>
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
                  <Card elevation={4} sx={{ mb: 4, borderRadius: 3, background: 'linear-gradient(135deg, #f4f8fb 60%, #e3f0ff 100%)' }}>
                    <CardContent>
                      <Typography variant="h5" fontWeight="bold" color="primary.main">
                        {diseaseData.disease}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Last updated: {diseaseData.lastUpdated ? new Date(diseaseData.lastUpdated).toLocaleString() : 'N/A'}
                      </Typography>
                    </CardContent>
                  </Card>
                  <Grid container spacing={3}>
                    {diseaseData.symptoms && diseaseData.symptoms.length > 0 ? (
                      diseaseData.symptoms.map((symptom, idx) => (
                        <Grid xs={12} md={6} key={symptom.name || idx}>
                          <Card elevation={2} sx={{ borderRadius: 3, mb: 2 }}>
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
                        </Grid>
                      ))
                    ) : (
                      <Grid xs={12}>
                        <Alert severity="info">No symptoms or answers found for this disease.</Alert>
                      </Grid>
                    )}
                  </Grid>
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
            p: 3
          }}
        >
          <EditDiseaseData
            onClose={handleCloseEditModal}
            onDataUpdated={handleDataUpdated}
          />
        </Box>
      </Modal>
    </Box>
  );
} 