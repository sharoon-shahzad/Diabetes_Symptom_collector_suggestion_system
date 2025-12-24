import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const { width, height } = Dimensions.get('window');

// Section configurations
const undiagnosedSections = [
  { label: 'Insights', icon: 'analytics' },
  { label: 'My Account', icon: 'person-circle' },
  { label: 'My Disease Data', icon: 'medical' },
  { label: 'Check My Risk', icon: 'shield-checkmark' },
  { label: 'My Feedback', icon: 'chatbox-ellipses' },
];

const diagnosedSections = [
  { label: 'Insights', icon: 'analytics' },
  { label: 'My Account', icon: 'person-circle' },
  { label: 'Personalized Suggestions', icon: 'sparkles' },
  { label: 'Chat Assistant', icon: 'chatbubbles' },
  { label: 'My Feedback', icon: 'chatbox-ellipses' },
];

const UnifiedDashboard = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user, setUser, logout } = useAuth();

  // State
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  
  // Data states
  const [diseaseData, setDiseaseData] = useState(null);
  const [assessmentSummary, setAssessmentSummary] = useState(null);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [personalInfoCompletion, setPersonalInfoCompletion] = useState(0);
  const [dietHistory, setDietHistory] = useState([]);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [lifestyleHistory, setLifestyleHistory] = useState([]);
  
  // Diagnosis popup states
  const [showDiagnosisPopup, setShowDiagnosisPopup] = useState(false);
  const [showAssessmentPopup, setShowAssessmentPopup] = useState(false);

  // Determine sections based on diagnosis
  const sections = useMemo(() => {
    if (!user) return undiagnosedSections;
    if (user?.diabetes_diagnosed === 'yes') return diagnosedSections;
    return undiagnosedSections;
  }, [user?.diabetes_diagnosed]);

  const currentSection = sections?.[selectedIndex]?.label || 'Insights';

  // Completion percentage
  const completionPct = useMemo(() => {
    if (!diseaseData || !diseaseData.totalQuestions) return 0;
    const pct = (diseaseData.answeredQuestions / diseaseData.totalQuestions) * 100;
    return Math.round(pct);
  }, [diseaseData]);

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  // Always show diagnosis popup for undiagnosed users on login until answered YES
  useEffect(() => {
    if (user && (user.diabetes_diagnosed === null || user.diabetes_diagnosed === undefined || user.diabetes_diagnosed === 'no')) {
      setShowDiagnosisPopup(true);
    } else {
      setShowDiagnosisPopup(false);
    }
    const hasAssessment = !!user?.last_assessment_at;
    const isDiagnosed = user?.diabetes_diagnosed === 'yes';
    if (hasAssessment && !isDiagnosed && currentSection === 'Insights') {
      setShowAssessmentPopup(true);
    }
  }, [user, currentSection]);

  // Load data based on section
  useFocusEffect(
    useCallback(() => {
      loadSectionData();
    }, [currentSection, user])
  );

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadSectionData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      if (currentSection === 'Insights' || currentSection === 'My Disease Data') {
        await loadDiseaseData();
        if (currentSection === 'Insights') {
          await loadAssessmentSummary();
        }
      }

      if (user.diabetes_diagnosed === 'yes' && 
          (currentSection === 'Insights' || currentSection === 'Personalized Suggestions')) {
        await loadPersonalizedData();
      }
    } catch (error) {
      console.error('Error loading section data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiseaseData = async () => {
    try {
      const response = await api.get('/users/my-disease-data');
      setDiseaseData(response.data.data);
    } catch (error) {
      console.error('Error loading disease data:', error);
    }
  };

  const loadAssessmentSummary = async () => {
    try {
      const response = await api.post('/assessment/diabetes');
      const result = response.data?.data?.result || {};
      const features = response.data?.data?.features || {};

      const symptoms_present = Object.entries(features)
        .filter(([k, v]) => !['Age', 'Gender', 'Obesity'].includes(k) && Number(v) === 1)
        .map(([k]) => k);

      const feature_importance = {};
      if (result.feature_importance && typeof result.feature_importance === 'object') {
        Object.entries(result.feature_importance).forEach(([k, v]) => {
          if (v && typeof v === 'object' && typeof v.importance === 'number') {
            feature_importance[k] = v.importance;
          }
        });
      }

      setAssessmentSummary({
        risk_level: (result.risk_level || 'low').charAt(0).toUpperCase() + (result.risk_level || 'low').slice(1),
        probability: Number(result.diabetes_probability || 0),
        confidence: Number(result.confidence || 0),
        symptoms_present,
        feature_importance,
      });
    } catch (error) {
      console.error('Error loading assessment:', error);
      setAssessmentSummary(null);
    }
  };

  const loadPersonalizedData = async () => {
    try {
      const [personalRes, medicalRes, dietRes, exerciseRes, lifestyleRes] = await Promise.all([
        api.get('/personalized-system/personal-info'),
        api.get('/personalized-system/medical-info'),
        api.get('/diet-plan/history?limit=30'),
        api.get('/exercise-plan/history?limit=30'),
        api.get('/lifestyle-tips/history?limit=30'),
      ]);

      const personalData = personalRes.data?.data || {};
      const medicalData = medicalRes.data?.data || {};

      const personalFields = ['fullName', 'date_of_birth', 'gender', 'phone_number'];
      const medicalFields = ['diabetes_type', 'diagnosis_date'];
      const total = personalFields.length + medicalFields.length;
      const completed = [...personalFields, ...medicalFields].reduce((count, field) => {
        const source = personalFields.includes(field) ? personalData : medicalData;
        return source[field] ? count + 1 : count;
      }, 0);

      setPersonalInfoCompletion(total ? Math.round((completed / total) * 100) : 0);
      setPersonalInfo(personalData);
      setMedicalInfo(medicalData);
      setDietHistory(dietRes.data?.plans || []);
      setExerciseHistory(exerciseRes.data?.plans || []);
      setLifestyleHistory(lifestyleRes.data?.history || []);
    } catch (error) {
      console.error('Error loading personalized data:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadSectionData().finally(() => setRefreshing(false));
  }, [currentSection]);

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  // Handle diagnosis answer and trigger profile completion if YES
  const handleDiagnosisAnswer = async (answer) => {
    try {
      await api.post('/personalized-system/diabetes-diagnosis', {
        diabetes_diagnosed: answer,
      });
      const updatedUser = { ...user, diabetes_diagnosed: answer };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setShowDiagnosisPopup(false);
      if (answer === 'yes') {
        // Show Complete Medical Profile quick action by setting a flag
        setShowCompleteProfileAction(true);
      } else if (!user?.onboardingCompleted) {
        navigation.navigate('Onboarding');
      }
    } catch (error) {
      console.error('Error updating diagnosis:', error);
      alert('Failed to save your response. Please try again.');
    }
  };

  // State for showing Complete Medical Profile quick action
  const [showCompleteProfileAction, setShowCompleteProfileAction] = useState(false);

  // Listen for profile completion and update dashboard
  useEffect(() => {
    if (user?.diabetes_diagnosed === 'yes' && personalInfoCompletion >= 100) {
      setShowCompleteProfileAction(false);
    }
  }, [user?.diabetes_diagnosed, personalInfoCompletion]);

  const renderSectionContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading...
          </Text>
        </View>
      );
    }

    switch (currentSection) {
      case 'Insights':
        return renderInsights();
      case 'My Account':
        return renderMyAccount();
      case 'My Disease Data':
        return renderMyDiseaseData();
      case 'Check My Risk':
        return renderCheckMyRisk();
      case 'Personalized Suggestions':
        return renderPersonalizedSuggestions();
      case 'Chat Assistant':
        return renderChatAssistant();
      case 'My Feedback':
        return renderMyFeedback();
      default:
        return null;
    }
  };

  const renderInsights = () => {
    if (user?.diabetes_diagnosed === 'yes') {
      return renderDiagnosedInsights();
    }
    return renderUndiagnosedInsights();
  };

  const renderUndiagnosedInsights = () => (
    <View style={styles.content}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}> 
        Your Health Insights
      </Text>

      {/* Progress Card */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="bar-chart" size={24} color={theme.colors.primary} />
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Profile Completion
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${completionPct}%`,
                  backgroundColor: theme.colors.primary 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
            {completionPct}% Complete
          </Text>
        </View>
        <Text style={[styles.cardSubtext, { color: theme.colors.text.secondary }]}>
          {diseaseData?.answeredQuestions || 0} of {diseaseData?.totalQuestions || 0} questions answered
        </Text>
      </View>

      {/* Risk Assessment Card */}
      {assessmentSummary && (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color={getRiskColor(assessmentSummary.risk_level)} />
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
              Risk Assessment
            </Text>
          </View>
          <View style={styles.riskContainer}>
            <Text style={[styles.riskLevel, { color: getRiskColor(assessmentSummary.risk_level) }]}>
              {assessmentSummary.risk_level} Risk
            </Text>
            <Text style={[styles.riskProbability, { color: theme.colors.text.secondary }]}>
              Probability: {(assessmentSummary.probability * 100).toFixed(1)}%
            </Text>
            <Text style={[styles.riskConfidence, { color: theme.colors.text.secondary }]}>
              Confidence: {(assessmentSummary.confidence * 100).toFixed(1)}%
            </Text>
          </View>
          {(assessmentSummary?.symptoms_present || []).length > 0 && (
            <View style={styles.symptomsContainer}>
              <Text style={[styles.symptomsTitle, { color: theme?.colors?.text?.primary || '#0f172a' }]}>
                Detected Symptoms:
              </Text>
              {(assessmentSummary.symptoms_present || []).map((symptom, idx) => (
                <View key={idx} style={styles.symptomChip}>
                  <Text style={[styles.symptomText, { color: theme?.colors?.primary || '#2563eb' }]}>
                    {symptom}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Quick Actions */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}> 
          Quick Actions
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setSelectedIndex(sections.findIndex(s => s.label === 'My Disease Data'))}
        >
          <Ionicons name="create" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Update Disease Data</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
          onPress={() => setSelectedIndex(sections.findIndex(s => s.label === 'Check My Risk'))}
        >
          <Ionicons name="shield-checkmark" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Check My Risk</Text>
        </TouchableOpacity>
        {/* Show Complete Medical Profile quick action if needed */}
        {showCompleteProfileAction && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b981', marginTop: 12 }]}
            onPress={() => navigation.navigate('PersonalMedicalInfo')}
          >
            <Ionicons name="medkit" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Complete Medical Profile</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderDiagnosedInsights = () => (
    <View style={styles.content}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Your Health Dashboard
      </Text>

      {/* Profile Completion */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="person" size={24} color={theme.colors.primary} />
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Profile Status
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${personalInfoCompletion}%`,
                  backgroundColor: personalInfoCompletion >= 100 ? '#10b981' : theme.colors.primary 
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, { color: theme.colors.text.secondary }]}>
            {personalInfoCompletion}% Complete
          </Text>
        </View>
        {personalInfoCompletion < 100 && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary, marginTop: 12 }]}
            onPress={() => navigation.navigate('PersonalMedicalInfo')}
          >
            <Text style={styles.actionButtonText}>Complete Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Activity */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
          Recent Activity
        </Text>
        <View style={styles.activityRow}>
          <Ionicons name="restaurant" size={20} color={theme.colors.primary} />
          <Text style={[styles.activityText, { color: theme.colors.text.secondary }]}>
            {dietHistory?.length || 0} Diet Plans
          </Text>
        </View>
        <View style={styles.activityRow}>
          <Ionicons name="fitness" size={20} color={theme.colors.primary} />
          <Text style={[styles.activityText, { color: theme.colors.text.secondary }]}>
            {exerciseHistory?.length || 0} Exercise Plans
          </Text>
        </View>
        <View style={styles.activityRow}>
          <Ionicons name="bulb" size={20} color={theme.colors.primary} />
          <Text style={[styles.activityText, { color: theme.colors.text.secondary }]}>
            {lifestyleHistory?.length || 0} Lifestyle Tips
          </Text>
        </View>
      </View>

      {/* Quick Access */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
          Quick Access
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => setSelectedIndex(sections.findIndex(s => s.label === 'Personalized Suggestions'))}
        >
          <Ionicons name="sparkles" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>View Suggestions</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
          onPress={() => setSelectedIndex(sections.findIndex(s => s.label === 'Chat Assistant'))}
        >
          <Ionicons name="chatbubbles" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Ask AI Assistant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMyAccount = () => (
    <ScrollView 
      style={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        My Account
      </Text>

      {/* Profile Info Card */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
              {user?.fullName || 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.colors.text.secondary }]}>
              {user?.email}
            </Text>
          </View>
        </View>
      </View>

      {/* Account Actions */}
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
            Edit Profile
          </Text>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ChangePassword')}
        >
          <Ionicons name="lock-closed-outline" size={24} color={theme.colors.primary} />
          <Text style={[styles.menuItemText, { color: theme.colors.text.primary }]}>
            Change Password
          </Text>
          <Ionicons name="chevron-forward" size={24} color={theme.colors.text.secondary} />
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={[styles.menuItemText, { color: '#ef4444' }]}>
            Logout
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderMyDiseaseData = () => (
    <View style={styles.content}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        My Disease Data
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
          Your Information
        </Text>
        <Text style={[styles.cardSubtext, { color: theme.colors.text.secondary }]}>
          Complete your health profile to get personalized insights
        </Text>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary, marginTop: 16 }]}
          onPress={() => navigation.navigate('DiseaseData')}
        >
          <Ionicons name="create" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Edit Disease Data</Text>
        </TouchableOpacity>
      </View>

      {diseaseData && (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {diseaseData.answeredQuestions || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                Answered
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.secondary }]}>
                {diseaseData.totalQuestions || 0}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                Total
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.accent }]}>
                {completionPct}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
                Complete
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderCheckMyRisk = () => (
    <View style={styles.content}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Risk Assessment
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.cardHeader}>
          <Ionicons name="shield-checkmark" size={32} color={theme.colors.primary} />
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary, marginLeft: 12 }]}>
            Check Your Diabetes Risk
          </Text>
        </View>
        <Text style={[styles.cardSubtext, { color: theme.colors.text.secondary, marginTop: 12 }]}>
          Take our comprehensive assessment to understand your diabetes risk level
        </Text>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary, marginTop: 20 }]}
          onPress={() => navigation.navigate('Assessment')}
        >
          <Ionicons name="clipboard" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Start Assessment</Text>
        </TouchableOpacity>
      </View>

      {user?.last_assessment_at && (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
            Last Assessment
          </Text>
          <View style={styles.assessmentResult}>
            <Text style={[styles.assessmentRisk, { color: getRiskColor(user.last_assessment_risk_level) }]}>
              {user.last_assessment_risk_level} Risk
            </Text>
            <Text style={[styles.assessmentDate, { color: theme.colors.text.secondary }]}>
              {new Date(user.last_assessment_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  const renderPersonalizedSuggestions = () => (
    <ScrollView 
      style={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        Personalized Suggestions
      </Text>

      {personalInfoCompletion < 100 ? (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="lock-closed" size={48} color={theme.colors.text.secondary} style={{ alignSelf: 'center' }} />
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary, textAlign: 'center', marginTop: 12 }]}>
            Complete Your Profile
          </Text>
          <Text style={[styles.cardSubtext, { color: theme.colors.text.secondary, textAlign: 'center', marginTop: 8 }]}>
            Fill in your personal and medical information to unlock personalized suggestions
          </Text>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary, marginTop: 20 }]}
            onPress={() => navigation.navigate('PersonalMedicalInfo')}
          >
            <Text style={styles.actionButtonText}>Complete Profile ({personalInfoCompletion}%)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Diet Plan */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('DietPlan')}
          >
            <View style={styles.suggestionCard}>
              <View style={[styles.suggestionIcon, { backgroundColor: '#fef3c7' }]}>
                <Ionicons name="restaurant" size={32} color="#f59e0b" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.suggestionTitle, { color: theme.colors.text.primary }]}>
                  Diet Plans
                </Text>
                <Text style={[styles.suggestionSubtext, { color: theme.colors.text.secondary }]}>
                  {dietHistory?.length || 0} plans generated
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>

          {/* Exercise Plan */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('ExercisePlan')}
          >
            <View style={styles.suggestionCard}>
              <View style={[styles.suggestionIcon, { backgroundColor: '#dbeafe' }]}>
                <Ionicons name="fitness" size={32} color="#3b82f6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.suggestionTitle, { color: theme.colors.text.primary }]}>
                  Exercise Plans
                </Text>
                <Text style={[styles.suggestionSubtext, { color: theme.colors.text.secondary }]}>
                  {exerciseHistory?.length || 0} plans generated
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>

          {/* Lifestyle Tips */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('LifestyleTips')}
          >
            <View style={styles.suggestionCard}>
              <View style={[styles.suggestionIcon, { backgroundColor: '#dcfce7' }]}>
                <Ionicons name="bulb" size={32} color="#22c55e" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.suggestionTitle, { color: theme.colors.text.primary }]}>
                  Lifestyle Tips
                </Text>
                <Text style={[styles.suggestionSubtext, { color: theme.colors.text.secondary }]}>
                  {lifestyleHistory?.length || 0} tips received
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>

          {/* Medical Info */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('PersonalMedicalInfo')}
          >
            <View style={styles.suggestionCard}>
              <View style={[styles.suggestionIcon, { backgroundColor: '#fce7f3' }]}>
                <Ionicons name="medical" size={32} color="#ec4899" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.suggestionTitle, { color: theme.colors.text.primary }]}>
                  Medical Information
                </Text>
                <Text style={[styles.suggestionSubtext, { color: theme.colors.text.secondary }]}>
                  View and update your health data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.text.secondary} />
            </View>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );

  const renderChatAssistant = () => (
    <View style={styles.content}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        AI Chat Assistant
      </Text>

      {personalInfoCompletion < 100 ? (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="lock-closed" size={48} color={theme.colors.text.secondary} style={{ alignSelf: 'center' }} />
          <Text style={[styles.cardTitle, { color: theme.colors.text.primary, textAlign: 'center', marginTop: 12 }]}>
            Chat Assistant Locked
          </Text>
          <Text style={[styles.cardSubtext, { color: theme.colors.text.secondary, textAlign: 'center', marginTop: 8 }]}>
            Complete your profile to unlock the AI Chat Assistant
          </Text>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary, marginTop: 20 }]}
            onPress={() => navigation.navigate('PersonalMedicalInfo')}
          >
            <Text style={styles.actionButtonText}>Complete Profile ({personalInfoCompletion}%)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="chatbubbles" size={64} color={theme.colors.primary} />
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary, marginTop: 16, textAlign: 'center' }]}>
              AI Health Assistant
            </Text>
            <Text style={[styles.cardSubtext, { color: theme.colors.text.secondary, marginTop: 8, textAlign: 'center' }]}>
              Get instant answers to your health questions and personalized recommendations
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.primary, marginTop: 24 }]}
            onPress={() => navigation.navigate('ChatAssistant')}
          >
            <Ionicons name="chatbubbles" size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const renderMyFeedback = () => (
    <View style={styles.content}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
        My Feedback
      </Text>

      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
          Share Your Experience
        </Text>
        <Text style={[styles.cardSubtext, { color: theme.colors.text.secondary, marginTop: 8 }]}>
          Help us improve by sharing your feedback
        </Text>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary, marginTop: 20 }]}
          onPress={() => navigation.navigate('Feedback')}
        >
          <Ionicons name="chatbox-ellipses" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>View & Submit Feedback</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getRiskColor = (riskLevel) => {
    if (!riskLevel) return '#64748b';
    const level = (riskLevel || '').toLowerCase();
    if (level === 'low') return '#10b981';
    if (level === 'medium') return '#f59e0b';
    return '#ef4444';
  };

  // Early return if theme not loaded
  if (!theme || !theme.colors) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 12, fontSize: 16, color: '#64748b' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={theme?.colors?.gradient || ['#f8fafc', '#f1f5f9']}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme?.colors?.surface || '#ffffff' }]}>
          <TouchableOpacity onPress={() => setDrawerVisible(true)}>
            <Ionicons name="menu" size={28} color={theme?.colors?.text?.primary || '#0f172a'} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme?.colors?.text?.primary || '#0f172a' }]}>
            {currentSection}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <View style={[styles.avatarSmall, { backgroundColor: theme?.colors?.primary || '#2563eb' }]}>
              <Text style={styles.avatarSmallText}>
                {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {renderSectionContent()}
        </ScrollView>
      </SafeAreaView>

      {/* Drawer Menu */}
      <Modal
        visible={drawerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.drawerOverlay}>
          <TouchableOpacity 
            style={styles.drawerBackdrop} 
            activeOpacity={1}
            onPress={() => setDrawerVisible(false)}
          />
          <View style={[styles.drawer, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.drawerHeader}>
              <Text style={[styles.drawerTitle, { color: theme.colors.text.primary }]}>
                Menu
              </Text>
              <TouchableOpacity onPress={() => setDrawerVisible(false)}>
                <Ionicons name="close" size={28} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.drawerContent}>
              {(sections || []).map((section, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.drawerItem,
                    selectedIndex === index && { backgroundColor: theme?.colors?.primaryLight || '#e0f2fe' }
                  ]}
                  onPress={() => {
                    setSelectedIndex(index);
                    setDrawerVisible(false);
                  }}
                >
                  <Ionicons 
                    name={section.icon} 
                    size={24} 
                    color={selectedIndex === index ? (theme?.colors?.primary || '#2563eb') : (theme?.colors?.text?.secondary || '#64748b')} 
                  />
                  <Text style={[
                    styles.drawerItemText,
                    { color: selectedIndex === index ? (theme?.colors?.primary || '#2563eb') : (theme?.colors?.text?.primary || '#0f172a') }
                  ]}>
                    {section.label}
                  </Text>
                </TouchableOpacity>
              ))}

              <View style={styles.drawerDivider} />

              <TouchableOpacity
                style={styles.drawerItem}
                onPress={() => {
                  setDrawerVisible(false);
                  handleLogout();
                }}
              >
                <Ionicons name="log-out-outline" size={24} color="#ef4444" />
                <Text style={[styles.drawerItemText, { color: '#ef4444' }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Diagnosis Popup */}
      <Modal
        visible={showDiagnosisPopup}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.popupOverlay}>
          <View style={[styles.popupCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.popupTitle, { color: theme.colors.text.primary }]}>
              Diabetes Diagnosis
            </Text>
            <Text style={[styles.popupText, { color: theme.colors.text.secondary }]}>
              Have you been diagnosed with diabetes?
            </Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity
                style={[styles.popupButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleDiagnosisAnswer('yes')}
              >
                <Text style={styles.popupButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.popupButton, { backgroundColor: theme.colors.secondary }]}
                onPress={() => handleDiagnosisAnswer('no')}
              >
                <Text style={styles.popupButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '600',
  },
  riskContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  riskLevel: {
    fontSize: 32,
    fontWeight: '700',
  },
  riskProbability: {
    fontSize: 16,
    marginTop: 8,
  },
  riskConfidence: {
    fontSize: 14,
    marginTop: 4,
  },
  symptomsContainer: {
    marginTop: 16,
  },
  symptomsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  symptomChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#dbeafe',
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  symptomText: {
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  activityText: {
    fontSize: 16,
    marginLeft: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '700',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#e5e7eb',
  },
  assessmentResult: {
    marginTop: 16,
    alignItems: 'center',
  },
  assessmentRisk: {
    fontSize: 28,
    fontWeight: '700',
  },
  assessmentDate: {
    fontSize: 14,
    marginTop: 8,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  suggestionSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: width * 0.75,
    maxWidth: 300,
    height: '100%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  drawerContent: {
    flex: 1,
    padding: 12,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 16,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupCard: {
    width: width * 0.85,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  popupText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  popupButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  popupButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  popupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UnifiedDashboard;
