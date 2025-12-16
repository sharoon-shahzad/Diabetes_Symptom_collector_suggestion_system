import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    LinearProgress,
    Divider,
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import {
    Edit as EditIcon,
    ArrowBack as ArrowBackIcon,
    CheckCircle as CheckCircleIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance.js';
import dayjs from 'dayjs';

const PersonalMedicalInfoPage = () => {
    const navigate = useNavigate();
    const [personalInfo, setPersonalInfo] = useState(null);
    const [medicalInfo, setMedicalInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [personalCompletion, setPersonalCompletion] = useState(0);
    const [medicalCompletion, setMedicalCompletion] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [personalRes, medicalRes] = await Promise.all([
                axiosInstance.get('/personalized-system/personal-info'),
                axiosInstance.get('/personalized-system/medical-info'),
            ]);

            if (personalRes.data.success) {
                setPersonalInfo(personalRes.data.data);
                calculateCompletion('personal', personalRes.data.data);
            }
            if (medicalRes.data.success) {
                setMedicalInfo(medicalRes.data.data);
                calculateCompletion('medical', medicalRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateCompletion = (type, data) => {
        if (type === 'personal') {
            const fields = ['fullName', 'date_of_birth', 'gender', 'phone_number', 'weight', 'height', 'activity_level', 'sleep_hours'];
            const filledFields = fields.filter(field => data && data[field]);
            const percentage = Math.round((filledFields.length / fields.length) * 100);
            setPersonalCompletion(percentage);
        } else if (type === 'medical') {
            const fields = ['diabetes_type', 'diagnosis_date', 'current_medications', 'allergies', 'chronic_conditions', 'family_history'];
            const filledFields = fields.filter(field => data && data[field]);
            const percentage = Math.round((filledFields.length / fields.length) * 100);
            setMedicalCompletion(percentage);
        }
    };

    const handleEditClick = () => {
        navigate('/personalized-suggestions', { state: { from: 'summary' } });
    };

    const handleBack = () => {
        navigate('/personalized-suggestions/dashboard', { replace: true });
    };

    const renderField = (label, value, isEmpty = false) => (
        <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase' }}>
                {label}
            </Typography>
            <Typography
                variant="body1"
                sx={{
                    mt: 0.5,
                    color: isEmpty ? '#999' : 'text.primary',
                    fontStyle: isEmpty ? 'italic' : 'normal',
                }}
            >
                {isEmpty ? 'Not provided' : value}
            </Typography>
        </Box>
    );

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
            <Container maxWidth="md">
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={handleBack}
                        sx={{ mr: 2, textTransform: 'none' }}
                    >
                        Back
                    </Button>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: 'primary.main' }}>
                            Personal & Medical Information
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            View and manage your health profile
                        </Typography>
                    </Box>
                </Box>

                {/* Personal Information Card */}
                <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            bgcolor: '#dbeafe',
                            p: 3,
                            borderBottom: '1px solid #bfdbfe',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#1e40af' }}>
                                Personal Information
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Basic profile details
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#2563eb' }}>
                                    {personalCompletion}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Complete
                                </Typography>
                            </Box>
                            {personalCompletion === 100 && (
                                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 32 }} />
                            )}
                        </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ px: 3, pt: 2 }}>
                        <LinearProgress
                            variant="determinate"
                            value={personalCompletion}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: '#e5e7eb',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: '#2563eb',
                                    borderRadius: 4,
                                },
                            }}
                        />
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                {renderField('Full Name', personalInfo?.fullName, !personalInfo?.fullName)}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderField('Gender', personalInfo?.gender, !personalInfo?.gender)}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderField(
                                    'Date of Birth',
                                    personalInfo?.date_of_birth
                                        ? dayjs(personalInfo.date_of_birth).format('MMM DD, YYYY')
                                        : 'Not provided',
                                    !personalInfo?.date_of_birth
                                )}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderField('Phone Number', personalInfo?.phone_number, !personalInfo?.phone_number)}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderField('Weight (kg)', personalInfo?.weight, !personalInfo?.weight)}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderField('Height (cm)', personalInfo?.height, !personalInfo?.height)}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderField('Activity Level', personalInfo?.activity_level, !personalInfo?.activity_level)}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderField('Sleep Hours', personalInfo?.sleep_hours, !personalInfo?.sleep_hours)}
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Medical Information Card */}
                <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            bgcolor: '#fce7f3',
                            p: 3,
                            borderBottom: '1px solid #fbcfe8',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ color: '#9f1239' }}>
                                Medical Information
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Health history and current status
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: '#ec4899' }}>
                                    {medicalCompletion}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Complete
                                </Typography>
                            </Box>
                            {medicalCompletion === 100 && (
                                <CheckCircleIcon sx={{ color: '#10b981', fontSize: 32 }} />
                            )}
                        </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ px: 3, pt: 2 }}>
                        <LinearProgress
                            variant="determinate"
                            value={medicalCompletion}
                            sx={{
                                height: 8,
                                borderRadius: 4,
                                bgcolor: '#e5e7eb',
                                '& .MuiLinearProgress-bar': {
                                    bgcolor: '#ec4899',
                                    borderRadius: 4,
                                },
                            }}
                        />
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                {renderField('Diabetes Type', medicalInfo?.diabetes_type, !medicalInfo?.diabetes_type)}
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                {renderField(
                                    'Diagnosis Date',
                                    medicalInfo?.diagnosis_date
                                        ? dayjs(medicalInfo.diagnosis_date).format('MMM DD, YYYY')
                                        : 'Not provided',
                                    !medicalInfo?.diagnosis_date
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                {renderField(
                                    'Previous Diagnosis',
                                    medicalInfo?.previous_diagnosis,
                                    !medicalInfo?.previous_diagnosis
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                {renderField(
                                    'Current Medications',
                                    medicalInfo?.medications,
                                    !medicalInfo?.medications
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                {renderField(
                                    'Allergies',
                                    medicalInfo?.allergies,
                                    !medicalInfo?.allergies
                                )}
                            </Grid>
                            <Grid item xs={12}>
                                {renderField(
                                    'Family History',
                                    medicalInfo?.family_history,
                                    !medicalInfo?.family_history
                                )}
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>

                {/* Edit Button */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={handleEditClick}
                        sx={{
                            textTransform: 'none',
                            fontSize: '1rem',
                            px: 4,
                            py: 1.5,
                        }}
                    >
                        Edit Information
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default PersonalMedicalInfoPage;
