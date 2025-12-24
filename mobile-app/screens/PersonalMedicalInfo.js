import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../utils/api';
import DateTimePicker from '@react-native-community/datetimepicker';

const PersonalMedicalInfo = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  
  const comingFromSummary = route.params?.from === 'summary';
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDiagnosisDatePicker, setShowDiagnosisDatePicker] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    fullName: '',
    date_of_birth: null,
    gender: '',
    country: '',
    country_code: '',
    phone_number: '',
    weight: '',
    height: '',
    activity_level: '',
    sleep_hours: '',
    diabetes_type: '',
    diagnosis_date: null,
    previous_diagnosis: '',
    duration_of_diabetes: '',
    medications: '',
    family_history: '',
    allergies: '',
  });

  useEffect(() => {
    loadExistingData();
  }, []);

  const loadExistingData = async () => {
    try {
      const [personalRes, medicalRes] = await Promise.all([
        api.get('/personalized-system/personal-info'),
        api.get('/personalized-system/medical-info'),
      ]);

      if (personalRes.data.success && personalRes.data.data) {
        const personal = personalRes.data.data;
        setFormData((prev) => ({
          ...prev,
          fullName: user?.fullName || personal.fullName || '',
          date_of_birth: personal.date_of_birth ? new Date(personal.date_of_birth) : null,
          gender: personal.gender || '',
          country: personal.country || '',
          country_code: personal.country_code || '',
          phone_number: personal.phone_number || '',
          weight: personal.weight ? String(personal.weight) : '',
          height: personal.height ? String(personal.height) : '',
          activity_level: personal.activity_level || '',
          sleep_hours: personal.sleep_hours ? String(personal.sleep_hours) : '',
        }));
      }

      if (medicalRes.data.success && medicalRes.data.data) {
        const medical = medicalRes.data.data;
        setFormData((prev) => ({
          ...prev,
          diabetes_type: medical.diabetes_type || '',
          diagnosis_date: medical.diagnosis_date ? new Date(medical.diagnosis_date) : null,
          previous_diagnosis: medical.previous_diagnosis || '',
          duration_of_diabetes: medical.duration_of_diabetes || '',
          medications: medical.medications || '',
          family_history: medical.family_history || '',
          allergies: medical.allergies || '',
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    if (activeStep < 3) {
      setActiveStep((prev) => prev + 1);
    } else {
      await handleSave();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      // Validate required fields
      if (!formData.date_of_birth) {
        setErrorMessage('Date of birth is required.');
        setLoading(false);
        return;
      }
      if (!formData.gender) {
        setErrorMessage('Gender is required.');
        setLoading(false);
        return;
      }
      if (!formData.height || parseFloat(formData.height) <= 0) {
        setErrorMessage('Height is required and must be greater than 0.');
        setLoading(false);
        return;
      }
      if (!formData.weight || parseFloat(formData.weight) <= 0) {
        setErrorMessage('Weight is required and must be greater than 0.');
        setLoading(false);
        return;
      }
      if (!formData.diabetes_type) {
        setErrorMessage('Diabetes type is required.');
        setLoading(false);
        return;
      }
      if (!formData.diagnosis_date) {
        setErrorMessage('Diagnosis date is required.');
        setLoading(false);
        return;
      }

      // Save personal info
      const personalData = {
        date_of_birth: formatDate(formData.date_of_birth),
        gender: formData.gender,
        country: formData.country,
        country_code: formData.country_code,
        phone_number: formData.phone_number,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        activity_level: formData.activity_level,
        sleep_hours: parseFloat(formData.sleep_hours) || null,
      };

      // Save medical info
      const medicalData = {
        diabetes_type: formData.diabetes_type,
        diagnosis_date: formatDate(formData.diagnosis_date),
      };

      await Promise.all([
        api.post('/personalized-system/personal-info', personalData),
        api.post('/personalized-system/medical-info', medicalData),
      ]);

      setSuccessMessage('Your information has been saved successfully!');
      
      setTimeout(() => {
        if (comingFromSummary) {
          navigation.replace('PersonalizedDashboard');
        } else {
          navigation.goBack();
        }
      }, 2000);
    } catch (error) {
      console.error('Error saving data:', error);
      setErrorMessage(error.response?.data?.message || 'Failed to save information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getProgress = () => {
    return ((activeStep + 1) / 4) * 100;
  };

  const steps = [
    { label: 'Basic Info', description: 'Tell us about yourself' },
    { label: 'Lifestyle', description: 'Your daily habits' },
    { label: 'Medical', description: 'Health background' },
    { label: 'Review', description: 'Confirm details' },
  ];

  const countryOptions = [
    { label: 'Pakistan', value: 'Pakistan', code: '+92' },
    { label: 'India', value: 'India', code: '+91' },
    { label: 'United States', value: 'United States', code: '+1' },
    { label: 'United Kingdom', value: 'United Kingdom', code: '+44' },
    { label: 'UAE', value: 'UAE', code: '+971' },
    { label: 'Saudi Arabia', value: 'Saudi Arabia', code: '+966' },
    { label: 'Bangladesh', value: 'Bangladesh', code: '+880' },
    { label: 'Canada', value: 'Canada', code: '+1' },
    { label: 'Australia', value: 'Australia', code: '+61' },
    { label: 'Other', value: 'Other', code: '' },
  ];

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <View style={styles.formContainer}>
            {/* Full Name */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Full Name *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text.primary }]}
                value={formData.fullName}
                onChangeText={(text) => handleInputChange('fullName', text)}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.text.secondary}
                editable={!user?.fullName}
              />
            </View>

            {/* Gender */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Gender</Text>
              <View style={styles.buttonGroup}>
                {['Male', 'Female', 'Other'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.optionButton,
                      formData.gender === option && { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => handleInputChange('gender', option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: formData.gender === option ? '#fff' : theme.colors.text.primary },
                      ]}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date of Birth */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Date of Birth *</Text>
              <TouchableOpacity
                style={[styles.input, { backgroundColor: theme.colors.surface, justifyContent: 'center' }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: formData.date_of_birth ? theme.colors.text.primary : theme.colors.text.secondary }}>
                  {formData.date_of_birth ? formData.date_of_birth.toLocaleDateString() : 'Select date'}
                </Text>
              </TouchableOpacity>
              
              {Platform.OS === 'ios' ? (
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={showDatePicker}
                  onRequestClose={() => setShowDatePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text style={styles.modalButton}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Select Date of Birth</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                          <Text style={[styles.modalButton, { fontWeight: '600' }]}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={formData.date_of_birth || new Date()}
                        mode="date"
                        display="spinner"
                        onChange={(event, selectedDate) => {
                          if (selectedDate) {
                            handleInputChange('date_of_birth', selectedDate);
                          }
                        }}
                        maximumDate={new Date()}
                        textColor="#000000"
                        style={styles.iosDatePicker}
                      />
                    </View>
                  </View>
                </Modal>
              ) : (
                showDatePicker && (
                  <DateTimePicker
                    value={formData.date_of_birth || new Date()}
                    mode="date"
                    display="calendar"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate && event.type !== 'dismissed') {
                        handleInputChange('date_of_birth', selectedDate);
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )
              )}
            </View>

            {/* Country */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Country / Region *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countryScroll}>
                {countryOptions.map((country) => (
                  <TouchableOpacity
                    key={country.value}
                    style={[
                      styles.countryButton,
                      formData.country === country.value && { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => {
                      handleInputChange('country', country.value);
                      handleInputChange('country_code', country.code);
                    }}
                  >
                    <Text
                      style={[
                        styles.countryText,
                        { color: formData.country === country.value ? '#fff' : theme.colors.text.primary },
                      ]}
                    >
                      {country.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Phone Number *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text.primary }]}
                value={formData.phone_number}
                onChangeText={(text) => handleInputChange('phone_number', text)}
                placeholder={formData.country_code ? `${formData.country_code} XXXXXXXXXX` : 'Enter phone number'}
                placeholderTextColor={theme.colors.text.secondary}
                keyboardType="phone-pad"
                editable={!user?.phone_number}
              />
            </View>
          </View>
        );

      case 1:
        return (
          <View style={styles.formContainer}>
            {/* Weight */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Weight (kg) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text.primary }]}
                value={formData.weight}
                onChangeText={(text) => handleInputChange('weight', text)}
                placeholder="e.g., 70"
                placeholderTextColor={theme.colors.text.secondary}
                keyboardType="numeric"
              />
            </View>

            {/* Height */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Height (cm) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text.primary }]}
                value={formData.height}
                onChangeText={(text) => handleInputChange('height', text)}
                placeholder="e.g., 170"
                placeholderTextColor={theme.colors.text.secondary}
                keyboardType="numeric"
              />
            </View>

            {/* Activity Level */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Activity Level</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activityScroll}>
                {['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active', 'Extremely Active'].map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.activityButton,
                      formData.activity_level === level && { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => handleInputChange('activity_level', level)}
                  >
                    <Text
                      style={[
                        styles.activityText,
                        { color: formData.activity_level === level ? '#fff' : theme.colors.text.primary },
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Sleep Hours */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Sleep Hours (per night) *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text.primary }]}
                value={formData.sleep_hours}
                onChangeText={(text) => handleInputChange('sleep_hours', text)}
                placeholder="e.g., 7"
                placeholderTextColor={theme.colors.text.secondary}
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.formContainer}>
            {/* Diabetes Type */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Diabetes Type</Text>
              <View style={styles.buttonGroup}>
                {['Type 1', 'Type 2', 'Gestational', 'Prediabetes', 'Other'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.optionButton,
                      formData.diabetes_type === type && { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => handleInputChange('diabetes_type', type)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { color: formData.diabetes_type === type ? '#fff' : theme.colors.text.primary },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Diagnosis Date */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Diagnosis Date</Text>
              <TouchableOpacity
                style={[styles.input, { backgroundColor: theme.colors.surface, justifyContent: 'center' }]}
                onPress={() => setShowDiagnosisDatePicker(true)}
              >
                <Text
                  style={{
                    color: formData.diagnosis_date ? theme.colors.text.primary : theme.colors.text.secondary,
                  }}
                >
                  {formData.diagnosis_date ? formData.diagnosis_date.toLocaleDateString() : 'Select date'}
                </Text>
              </TouchableOpacity>
              
              {Platform.OS === 'ios' ? (
                <Modal
                  transparent={true}
                  animationType="slide"
                  visible={showDiagnosisDatePicker}
                  onRequestClose={() => setShowDiagnosisDatePicker(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={() => setShowDiagnosisDatePicker(false)}>
                          <Text style={styles.modalButton}>Cancel</Text>
                        </TouchableOpacity>
                        <Text style={styles.modalTitle}>Select Diagnosis Date</Text>
                        <TouchableOpacity onPress={() => setShowDiagnosisDatePicker(false)}>
                          <Text style={[styles.modalButton, { fontWeight: '600' }]}>Done</Text>
                        </TouchableOpacity>
                      </View>
                      <DateTimePicker
                        value={formData.diagnosis_date || new Date()}
                        mode="date"
                        display="spinner"
                        onChange={(event, selectedDate) => {
                          if (selectedDate) {
                            handleInputChange('diagnosis_date', selectedDate);
                          }
                        }}
                        maximumDate={new Date()}
                        textColor="#000000"
                        style={styles.iosDatePicker}
                      />
                    </View>
                  </View>
                </Modal>
              ) : (
                showDiagnosisDatePicker && (
                  <DateTimePicker
                    value={formData.diagnosis_date || new Date()}
                    mode="date"
                    display="calendar"
                    onChange={(event, selectedDate) => {
                      setShowDiagnosisDatePicker(false);
                      if (selectedDate && event.type !== 'dismissed') {
                        handleInputChange('diagnosis_date', selectedDate);
                      }
                    }}
                    maximumDate={new Date()}
                  />
                )
              )}
            </View>

            {/* Duration of Diabetes */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Duration of Diabetes</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.text.primary }]}
                value={formData.duration_of_diabetes}
                onChangeText={(text) => handleInputChange('duration_of_diabetes', text)}
                placeholder="e.g., 2 years"
                placeholderTextColor={theme.colors.text.secondary}
              />
            </View>

            {/* Allergies */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.colors.text.primary }]}>Allergies</Text>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.text.primary }]}
                value={formData.allergies}
                onChangeText={(text) => handleInputChange('allergies', text)}
                placeholder="List any allergies (food, medicine, etc.)"
                placeholderTextColor={theme.colors.text.secondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <ScrollView style={styles.reviewContainer}>
            <Text style={[styles.reviewTitle, { color: theme.colors.primary }]}>Review Your Information</Text>
            <Text style={[styles.reviewSubtitle, { color: theme.colors.text.secondary }]}>
              Please review your information before saving.
            </Text>

            {/* Basic Info */}
            <Card style={styles.reviewSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Basic Information</Text>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Full Name:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
                  {formData.fullName || 'Not provided'}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Date of Birth:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
                  {formData.date_of_birth ? formData.date_of_birth.toLocaleDateString() : 'Not provided'}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Gender:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
                  {formData.gender || 'Not provided'}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Country:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
                  {formData.country || 'Not provided'}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Phone:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
                  {formData.country_code && formData.phone_number
                    ? `${formData.country_code} ${formData.phone_number}`
                    : formData.phone_number || 'Not provided'}
                </Text>
              </View>
            </Card>

            {/* Lifestyle Info */}
            <Card style={styles.reviewSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Lifestyle Information</Text>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Weight:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
                  {formData.weight ? `${formData.weight} kg` : 'Not provided'}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Height:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
                  {formData.height ? `${formData.height} cm` : 'Not provided'}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Activity Level:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
                  {formData.activity_level || 'Not provided'}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Sleep Hours:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
                  {formData.sleep_hours ? `${formData.sleep_hours} hrs` : 'Not provided'}
                </Text>
              </View>
            </Card>

            {/* Medical Info */}
            <Card style={styles.reviewSection}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>Medical History</Text>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Diabetes Type:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
                  {formData.diabetes_type || 'Not provided'}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Diagnosis Date:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
                  {formData.diagnosis_date ? formData.diagnosis_date.toLocaleDateString() : 'Not provided'}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Duration:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
                  {formData.duration_of_diabetes || 'Not provided'}
                </Text>
              </View>
              <View style={styles.reviewItem}>
                <Text style={[styles.reviewLabel, { color: theme.colors.text.secondary }]}>Allergies:</Text>
                <Text style={[styles.reviewValue, { color: theme.colors.text.primary }]}>
                  {formData.allergies || 'Not provided'}
                </Text>
              </View>
            </Card>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <LinearGradient colors={theme.colors.backgroundGradient} style={StyleSheet.absoluteFillObject} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Personal & Medical Information</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Complete your profile to receive personalized health recommendations
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { backgroundColor: '#e5e7eb' }]}>
            <View
              style={[styles.progressBarFill, { width: `${getProgress()}%`, backgroundColor: theme.colors.primary }]}
            />
          </View>
        </View>

        {/* Stepper */}
        <View style={styles.stepperContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: index <= activeStep ? theme.colors.primary : '#e5e7eb',
                  },
                ]}
              >
                <Text style={[styles.stepNumber, { color: index <= activeStep ? '#fff' : '#9ca3af' }]}>
                  {index + 1}
                </Text>
              </View>
              <Text style={[styles.stepLabel, { color: theme.colors.text.secondary }]}>{step.label}</Text>
            </View>
          ))}
        </View>

        {/* Messages */}
        {successMessage && (
          <Card style={[styles.messageCard, { backgroundColor: '#d1fae5' }]}>
            <Text style={{ color: '#065f46' }}>{successMessage}</Text>
          </Card>
        )}
        {errorMessage && (
          <Card style={[styles.messageCard, { backgroundColor: '#fee2e2' }]}>
            <Text style={{ color: '#991b1b' }}>{errorMessage}</Text>
          </Card>
        )}

        {/* Step Content */}
        <Card style={styles.contentCard}>{renderStepContent()}</Card>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <Button
            title="Back"
            onPress={handleBack}
            disabled={activeStep === 0 || loading}
            variant="outline"
            style={styles.navButton}
          />
          <Button
            title={loading ? 'Saving...' : activeStep === 3 ? 'Save & Complete' : 'Next'}
            onPress={handleNext}
            disabled={loading}
            style={styles.navButton}
          />
        </View>

        <Text style={[styles.securityText, { color: theme.colors.text.secondary }]}>
          Your information is secure and will only be used to personalize your health recommendations
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  messageCard: {
    marginBottom: 16,
    padding: 12,
  },
  contentCard: {
    marginBottom: 20,
    padding: 16,
  },
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  countryScroll: {
    flexGrow: 0,
  },
  countryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  countryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityScroll: {
    flexGrow: 0,
  },
  activityButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
  },
  activityText: {
    fontSize: 13,
    fontWeight: '600',
  },
  reviewContainer: {
    flex: 1,
  },
  reviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  reviewSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  reviewSection: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  reviewLabel: {
    fontSize: 14,
    flex: 1,
  },
  reviewValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
  },
  securityText: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalButton: {
    fontSize: 17,
    color: '#007AFF',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  iosDatePicker: {
    width: '100%',
    height: 260,
    backgroundColor: '#fff',
  },
});

export default PersonalMedicalInfo;
