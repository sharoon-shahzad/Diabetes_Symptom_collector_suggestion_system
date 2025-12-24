import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
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
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const { width, height } = Dimensions.get('window');

// Simple card component
const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>
    {children}
  </View>
);

// Stat card component
const StatCard = ({ icon, label, value, color, onPress }) => (
  <TouchableOpacity 
    activeOpacity={0.7}
    onPress={onPress}
    disabled={!onPress}
    style={styles.statCard}
  >
    <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </TouchableOpacity>
);

// Action card component
const ActionCard = ({ icon, title, subtitle, color, onPress, badge }) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
    <Card style={styles.actionCard}>
      <View style={styles.actionCardContent}>
        <View style={[styles.actionIconContainer, { backgroundColor: color + '10' }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.actionTextContainer}>
          <Text style={styles.actionTitle}>{title}</Text>
          <Text style={styles.actionSubtitle}>{subtitle}</Text>
        </View>
        {badge && (
          <View style={[styles.badge, { backgroundColor: color }]}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color="#64748b" />
      </View>
    </Card>
  </TouchableOpacity>
);

const UnifiedDashboardModern = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user, setUser, logout } = useAuth();

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // State
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
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

  // Section configurations
  const undiagnosedSections = [
    { label: 'Home', icon: 'home', color: '#2563eb' },
    { label: 'Profile', icon: 'person-circle', color: '#64748b' },
    { label: 'Health Data', icon: 'fitness', color: '#2196f3' },
    { label: 'Risk Check', icon: 'shield-checkmark', color: '#ff9800' },
    { label: 'Feedback', icon: 'chatbox-ellipses', color: '#4caf50' },
  ];

  const diagnosedSections = [
    { label: 'Home', icon: 'home', color: '#2563eb' },
    { label: 'Profile', icon: 'person-circle', color: '#64748b' },
    { label: 'Suggestions', icon: 'sparkles', color: '#ff9800' },
    { label: 'Chat', icon: 'chatbubbles', color: '#2196f3' },
    { label: 'Feedback', icon: 'chatbox-ellipses', color: '#4caf50' },
  ];

  const sections = useMemo(() => {
    if (!user) return undiagnosedSections;
    if (user?.diabetes_diagnosed === 'yes') return diagnosedSections;
    return undiagnosedSections;
  }, [user?.diabetes_diagnosed]);

  const currentSection = sections?.[selectedIndex] || sections?.[0];

  const completionPct = useMemo(() => {
    if (!diseaseData || !diseaseData.totalQuestions) return 0;
    const pct = (diseaseData.answeredQuestions / diseaseData.totalQuestions) * 100;
    return Math.round(pct);
  }, [diseaseData]);

  // Load all data
  const loadAllData = async () => {
    try {
      setLoading(true);

      // Load disease data
      const diseaseRes = await api.get('/users/my-disease-data');
      setDiseaseData(diseaseRes.data.data);

      // Load personal/medical info if diagnosed
      if (user?.diabetes_diagnosed === 'yes') {
        try {
          const personalRes = await api.get('/personalized-system/personal-info');
          console.log('📊 Personal Info Response:', personalRes.data);
          
          // The API returns data directly, not nested under personalInfo
          const personalData = personalRes.data.data || personalRes.data;
          setPersonalInfo(personalData);
          
          const medicalRes = await api.get('/personalized-system/medical-info');
          console.log('📊 Medical Info Response:', medicalRes.data);
          
          // The API returns data directly
          const medicalData = medicalRes.data.data || medicalRes.data;
          setMedicalInfo(medicalData);

          const completion = calculateCompletion(personalData, medicalData);
          setPersonalInfoCompletion(completion);
          console.log('✅ Personal Info Completion:', completion + '%');

          // Load histories
          const dietRes = await api.get('/personalized-system/diet-plan/history');
          setDietHistory(dietRes.data.data.dietPlans || []);

          const exerciseRes = await api.get('/personalized-system/exercise-plan/history');
          setExerciseHistory(exerciseRes.data.data.exercisePlans || []);

          const lifestyleRes = await api.get('/personalized-system/lifestyle-tips/history');
          setLifestyleHistory(lifestyleRes.data.data.lifestyleTips || []);
        } catch (err) {
          console.log('Error loading personalized data:', err);
          console.log('Error details:', err.response?.data);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateCompletion = (personal, medical) => {
    // Personal fields - check actual API response structure
    const personalFields = [
      'date_of_birth',  // Not 'age'
      'gender',
      'height',
      'weight',
      'country'  // This comes from User model, merged in API response
    ];
    
    // Medical fields - check actual API response structure
    const medicalFields = [
      'diabetes_type',
      'diagnosis_date',  // Not 'diagnosis_year'
      'current_medications'  // This is an array
    ];
    
    let completed = 0;
    let total = personalFields.length + medicalFields.length + 2; // +2 for hba1c and fasting_glucose
    
    // Check personal fields
    personalFields.forEach(field => {
      if (personal?.[field] && personal[field] !== '' && personal[field] !== null) {
        completed++;
      }
    });
    
    // Check medical fields
    medicalFields.forEach(field => {
      if (field === 'current_medications') {
        // Check if medications array has at least one entry
        if (medical?.current_medications && Array.isArray(medical.current_medications) && medical.current_medications.length > 0) {
          completed++;
        }
      } else if (medical?.[field] && medical[field] !== '' && medical[field] !== null) {
        completed++;
      }
    });
    
    // Check nested lab results
    if (medical?.recent_lab_results?.hba1c?.value) {
      completed++;
    }
    if (medical?.recent_lab_results?.fasting_glucose?.value) {
      completed++;
    }
    
    console.log('🔍 Completion Calculation:', {
      personalData: personal,
      medicalData: medical,
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    });

    return Math.round((completed / total) * 100);
  };

  // Animate on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    loadAllData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const handleDiagnosisAnswer = async (answer) => {
    try {
      await api.patch('/users/profile', { diabetes_diagnosed: answer });
      const updatedUser = { ...user, diabetes_diagnosed: answer };
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setShowDiagnosisPopup(false);
      setSelectedIndex(0);
    } catch (error) {
      console.error('Error updating diagnosis:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  };

  // Check diagnosis status
  useEffect(() => {
    if (user && (user.diabetes_diagnosed === null || user.diabetes_diagnosed === undefined)) {
      setShowDiagnosisPopup(true);
    }
  }, [user]);

  const getRiskColor = (level) => {
    const colors = {
      'Very Low': '#10b981',
      'Low': '#22c55e',
      'Moderate': '#f59e0b',
      'High': '#f97316',
      'Very High': '#ef4444',
    };
    return colors[level] || '#64748b';
  };

  // Render Home Section
  const renderHome = () => {
    const isDiagnosed = user?.diabetes_diagnosed === 'yes';

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Welcome Header with Profile Badge */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeContent}>
            <View style={styles.welcomeTextContainer}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>{user?.fullName || user?.username || 'User'}</Text>
              {isDiagnosed && (
                <View style={styles.statusBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#4caf50" />
                  <Text style={styles.statusText}>Actively Monitoring</Text>
                </View>
              )}
            </View>
            <TouchableOpacity 
              style={styles.profileBadgeButton}
              onPress={() => setSelectedIndex(1)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb', '#1e40af']}
                style={styles.profileBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.profileInitial}>
                  {(user?.fullName?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="clipboard-outline"
            label="Questions"
            value={`${diseaseData?.answeredQuestions || 0}/${diseaseData?.totalQuestions || 0}`}
            color="#2563eb"
            onPress={() => setSelectedIndex(2)}
          />
          <StatCard
            icon="pie-chart-outline"
            label="Completion"
            value={`${completionPct}%`}
            color="#2196f3"
          />
          {isDiagnosed && (
            <StatCard
              icon="restaurant-outline"
              label="Diet Plans"
              value={dietHistory?.length || 0}
              color="#ff9800"
              onPress={() => navigation.navigate('DietPlan')}
            />
          )}
          {isDiagnosed && (
            <StatCard
              icon="fitness-outline"
              label="Exercises"
              value={exerciseHistory?.length || 0}
              color="#2196f3"
              onPress={() => navigation.navigate('ExercisePlan')}
            />
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Quick Actions</Text>
          
          {!isDiagnosed && (
            <>
              <ActionCard
                icon="shield-checkmark-outline"
                title="Check Your Risk"
                subtitle="Take a diabetes risk assessment"
                color="#ff9800"
                onPress={() => navigation.navigate('Assessment')}
              />
              <ActionCard
                icon="medical-outline"
                title="Update Health Data"
                subtitle={`${completionPct}% completed`}
                color="#2196f3"
                onPress={() => navigation.navigate('DiseaseData')}
                badge={completionPct < 100 ? `${100 - completionPct}%` : null}
              />
            </>
          )}

          {isDiagnosed && personalInfoCompletion < 100 && (
            <ActionCard
              icon="lock-closed-outline"
              title="Complete Your Profile"
              subtitle="Unlock personalized recommendations"
              color="#64748b"
              onPress={() => navigation.navigate('PersonalMedicalInfo')}
              badge={`${Math.round(personalInfoCompletion)}%`}
            />
          )}

          {isDiagnosed && personalInfoCompletion === 100 && (
            <ActionCard
              icon="sparkles-outline"
              title="Personalized Suggestions"
              subtitle="View your AI-powered recommendations"
              color="#4caf50"
              onPress={() => setSelectedIndex(4)}
              badge="100%"
            />
          )}

          <ActionCard
            icon="chatbubbles-outline"
            title="Chat Assistant"
            subtitle="Ask health-related questions"
            color="#2563eb"
            onPress={() => navigation.navigate('ChatScreen')}
          />
        </View>

        {/* Recent Activity */}
        {user?.last_assessment_at && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Last Assessment</Text>
            <Card>
              <View style={styles.assessmentCard}>
                <View style={[styles.riskBadge, { backgroundColor: getRiskColor(user.last_assessment_risk_level) + '20' }]}>
                  <Text style={[styles.riskLevel, { color: getRiskColor(user.last_assessment_risk_level) }]}>
                    {user.last_assessment_risk_level}
                  </Text>
                </View>
                <Text style={styles.assessmentDate}>
                  {new Date(user.last_assessment_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </Card>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  // Render Profile Section
  const renderProfile = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.section}>
        {/* Profile Header Card with Gradient */}
        <LinearGradient
          colors={['#3b82f6', '#2563eb', '#1e40af']}
          style={styles.profileHeaderCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.profileAvatarContainer}>
            <View style={styles.profileAvatarRing}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>
                  {(user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase()}
                </Text>
              </View>
            </View>
          </View>
          <Text style={styles.profileName}>{user?.fullName || user?.username || 'User'}</Text>
          <View style={styles.profileEmailContainer}>
            <Ionicons name="mail-outline" size={14} color="rgba(255,255,255,0.9)" />
            <Text style={styles.profileEmail}>{user?.email || ''}</Text>
          </View>
        </LinearGradient>

        {/* Account Information */}
        <View style={styles.profileSectionGroup}>
          <Text style={styles.profileSectionTitle}>Account Information</Text>
          
          <Card style={styles.infoCardItem}>
            <View style={styles.infoRowItem}>
              <View style={styles.infoIconBox}>
                <Ionicons name="person-outline" size={20} color="#2563eb" />
              </View>
              <View style={styles.infoTextBox}>
                <Text style={styles.infoLabelText}>Full Name</Text>
                <Text style={styles.infoValueText}>{user?.fullName || 'Not set'}</Text>
              </View>
            </View>
          </Card>

          <Card style={styles.infoCardItem}>
            <View style={styles.infoRowItem}>
              <View style={styles.infoIconBox}>
                <Ionicons name="mail-outline" size={20} color="#2563eb" />
              </View>
              <View style={styles.infoTextBox}>
                <Text style={styles.infoLabelText}>Email</Text>
                <Text style={styles.infoValueText}>{user?.email || 'Not set'}</Text>
              </View>
            </View>
          </Card>

          {user?.gender && (
            <Card style={styles.infoCardItem}>
              <View style={styles.infoRowItem}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="male-female-outline" size={20} color="#2563eb" />
                </View>
                <View style={styles.infoTextBox}>
                  <Text style={styles.infoLabelText}>Gender</Text>
                  <Text style={styles.infoValueText}>{user.gender}</Text>
                </View>
              </View>
            </Card>
          )}

          {user?.date_of_birth && (
            <Card style={styles.infoCardItem}>
              <View style={styles.infoRowItem}>
                <View style={styles.infoIconBox}>
                  <Ionicons name="calendar-outline" size={20} color="#2563eb" />
                </View>
                <View style={styles.infoTextBox}>
                  <Text style={styles.infoLabelText}>Date of Birth</Text>
                  <Text style={styles.infoValueText}>
                    {new Date(user.date_of_birth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        </View>

        {/* Health Status */}
        {user?.diabetes_diagnosed && (
          <View style={styles.profileSectionGroup}>
            <Text style={styles.profileSectionTitle}>Health Status</Text>
            <Card style={styles.statusCardItem}>
              <View style={styles.statusRowItem}>
                <View style={[styles.statusIconBox, { 
                  backgroundColor: user.diabetes_diagnosed === 'yes' ? '#ff980015' : '#4caf5015' 
                }]}>
                  <Ionicons 
                    name={user.diabetes_diagnosed === 'yes' ? 'warning-outline' : 'checkmark-circle-outline'} 
                    size={24} 
                    color={user.diabetes_diagnosed === 'yes' ? '#ff9800' : '#4caf50'} 
                  />
                </View>
                <View style={styles.statusTextBox}>
                  <Text style={styles.statusLabelText}>Diabetes Status</Text>
                  <Text style={[styles.statusValueText, { 
                    color: user.diabetes_diagnosed === 'yes' ? '#ff9800' : '#4caf50' 
                  }]}>
                    {user.diabetes_diagnosed === 'yes' ? 'Diagnosed' : 'Not Diagnosed'}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* Actions */}
        <View style={styles.profileSectionGroup}>
          <Text style={styles.profileSectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.profileActionCard}
            onPress={() => navigation.navigate('PersonalMedicalInfo')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#2196f315' }]}>
              <Ionicons name="create-outline" size={22} color="#2196f3" />
            </View>
            <View style={styles.actionTextContent}>
              <Text style={styles.actionTitleText}>Edit Medical Info</Text>
              <Text style={styles.actionSubtitleText}>Update your health profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.profileActionCard}
            onPress={() => navigation.navigate('DiseaseData')}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#4caf5015' }]}>
              <Ionicons name="fitness-outline" size={22} color="#4caf50" />
            </View>
            <View style={styles.actionTextContent}>
              <Text style={styles.actionTitleText}>Health Data</Text>
              <Text style={styles.actionSubtitleText}>View and update your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.profileActionCard, styles.dangerActionCard]}
            onPress={handleLogout}
          >
            <View style={[styles.actionIconContainer, { backgroundColor: '#ef444415' }]}>
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            </View>
            <View style={styles.actionTextContent}>
              <Text style={[styles.actionTitleText, { color: '#ef4444' }]}>Logout</Text>
              <Text style={styles.actionSubtitleText}>Sign out of your account</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // Render Health Data Section
  const renderHealthData = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Health Data</Text>

        {/* Progress Overview */}
        <Card>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Data Completion</Text>
            <Text style={styles.progressPercentage}>{completionPct}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarTrack}>
              <View
                style={[styles.progressBarFill, { width: `${completionPct}%`, backgroundColor: '#2563eb' }]}
              />
            </View>
          </View>
          <View style={styles.progressStats}>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{diseaseData?.answeredQuestions || 0}</Text>
              <Text style={styles.progressStatLabel}>Answered</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>{diseaseData?.totalQuestions || 0}</Text>
              <Text style={styles.progressStatLabel}>Total</Text>
            </View>
            <View style={styles.progressStat}>
              <Text style={styles.progressStatValue}>
                {(diseaseData?.totalQuestions || 0) - (diseaseData?.answeredQuestions || 0)}
              </Text>
              <Text style={styles.progressStatLabel}>Remaining</Text>
            </View>
          </View>
        </Card>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('DiseaseData')}
        >
          <Ionicons name="create-outline" size={22} color="#fff" />
          <Text style={styles.primaryButtonText}>Update Health Data</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // Render Risk Check Section
  const renderRiskCheck = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Risk Assessment</Text>

        {/* Assessment CTA */}
        <Card style={styles.ctaCard}>
          <View style={styles.ctaContent}>
            <View style={styles.ctaIconContainer}>
              <Ionicons name="shield-checkmark-outline" size={64} color="#ff9800" />
            </View>
            <Text style={styles.ctaTitle}>Check Your Risk</Text>
            <Text style={styles.ctaSubtitle}>
              Take our comprehensive diabetes risk assessment to understand your health status
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Assessment')}
            >
              <Text style={styles.ctaButtonText}>Start Assessment</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Last Assessment Result */}
        {user?.last_assessment_at && (
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.sectionHeading, { fontSize: 18 }]}>Previous Result</Text>
            <Card>
              <View style={styles.resultCard}>
                <View style={[styles.resultBadge, { backgroundColor: getRiskColor(user.last_assessment_risk_level) }]}>
                  <Text style={styles.resultBadgeText}>{user.last_assessment_risk_level}</Text>
                </View>
                <Text style={styles.resultDate}>
                  Assessed on {new Date(user.last_assessment_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
                <TouchableOpacity
                  style={styles.retakeButton}
                  onPress={() => navigation.navigate('Assessment')}
                >
                  <Text style={styles.retakeButtonText}>Retake Assessment</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // Render Suggestions Section
  const renderSuggestions = () => {
    // Check if user has minimal required info (more lenient check)
    const hasBasicInfo = personalInfo && medicalInfo && 
      (personalInfo.date_of_birth || personalInfo.gender || personalInfo.height || personalInfo.weight) &&
      (medicalInfo.diabetes_type || medicalInfo.diagnosis_date);
    
    // Allow access if completion is >= 70% OR has basic info
    const canAccessSuggestions = personalInfoCompletion >= 70 || hasBasicInfo;
    
    console.log('🔐 Access Check:', {
      personalInfoCompletion,
      hasBasicInfo,
      canAccessSuggestions,
      personalInfo: personalInfo ? 'exists' : 'missing',
      medicalInfo: medicalInfo ? 'exists' : 'missing'
    });

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.section}>
          <Text style={styles.sectionHeading}>Personalized Insights</Text>

          {!canAccessSuggestions ? (
          <Card style={styles.lockedCard}>
            <View style={styles.lockedContent}>
              <Ionicons name="lock-closed-outline" size={64} color="#64748b" />
              <Text style={styles.lockedTitle}>Complete Your Profile</Text>
              <Text style={styles.lockedSubtitle}>
                Fill in your personal and medical information to unlock AI-powered personalized recommendations and insights
              </Text>
              <View style={styles.completionBadge}>
                <Text style={styles.completionBadgeText}>{personalInfoCompletion}% Complete</Text>
              </View>
              <TouchableOpacity
                style={styles.unlockButton}
                onPress={() => navigation.navigate('PersonalMedicalInfo')}
              >
                <Text style={styles.unlockButtonText}>Complete Profile</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </Card>
        ) : (
          <>
            {/* Insights Summary Card - Only show if there's data */}
            {(dietHistory?.length > 0 || exerciseHistory?.length > 0 || lifestyleHistory?.length > 0) ? (
              <Card style={styles.insightsCard}>
                <View style={styles.insightsHeader}>
                  <Ionicons name="analytics-outline" size={28} color="#2563eb" />
                  <Text style={styles.insightsTitle}>Your Health Analytics</Text>
                </View>
                <Text style={styles.insightsSubtitle}>
                  Track your personalized plans and monitor your progress
                </Text>
                
                {/* Plan Metrics */}
                <View style={styles.metricsGrid}>
                  <View style={styles.metricItem}>
                    <View style={[styles.metricIconContainer, { backgroundColor: '#ff980015' }]}>
                      <Ionicons name="restaurant" size={24} color="#ff9800" />
                    </View>
                    <Text style={styles.metricValue}>{dietHistory?.length || 0}</Text>
                    <Text style={styles.metricLabel}>Diet Plans</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <View style={[styles.metricIconContainer, { backgroundColor: '#2196f315' }]}>
                      <Ionicons name="fitness" size={24} color="#2196f3" />
                    </View>
                    <Text style={styles.metricValue}>{exerciseHistory?.length || 0}</Text>
                    <Text style={styles.metricLabel}>Exercises</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <View style={[styles.metricIconContainer, { backgroundColor: '#4caf5015' }]}>
                      <Ionicons name="bulb" size={24} color="#4caf50" />
                    </View>
                    <Text style={styles.metricValue}>{lifestyleHistory?.length || 0}</Text>
                    <Text style={styles.metricLabel}>Lifestyle Tips</Text>
                  </View>
                </View>
              </Card>
            ) : (
              <Card style={styles.insightsCard}>
                <View style={styles.insightsHeader}>
                  <Ionicons name="analytics-outline" size={28} color="#64748b" />
                  <Text style={styles.insightsTitle}>Start Your Journey</Text>
                </View>
                <Text style={styles.insightsSubtitle}>
                  Generate your first personalized plan to see analytics here
                </Text>
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="bar-chart-outline" size={48} color="#cbd5e1" />
                  <Text style={styles.emptyStateText}>No plans generated yet</Text>
                </View>
              </Card>
            )}

            {/* Recent Plans - Visual Timeline */}
            {(dietHistory?.length > 0 || exerciseHistory?.length > 0 || lifestyleHistory?.length > 0) && (
              <View style={styles.timelineSection}>
                <Text style={styles.timelineTitle}>Recent Activity</Text>
                
                {/* Diet Plans Timeline */}
                {dietHistory?.slice(0, 3).map((plan, index) => (
                  <Card key={`diet-${index}`} style={styles.timelineCard}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineDot, { backgroundColor: '#ff9800' }]} />
                      <View style={styles.timelineLine} />
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <Ionicons name="restaurant" size={18} color="#ff9800" />
                        <Text style={styles.timelineType}>Diet Plan</Text>
                      </View>
                      <Text style={styles.timelineDate}>
                        {new Date(plan.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                      {plan.goal && (
                        <Text style={styles.timelineDetail}>Goal: {plan.goal}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.timelineAction}
                      onPress={() => navigation.navigate('DietPlan')}
                    >
                      <Ionicons name="chevron-forward" size={20} color="#64748b" />
                    </TouchableOpacity>
                  </Card>
                ))}

                {/* Exercise Plans Timeline */}
                {exerciseHistory?.slice(0, 3).map((plan, index) => (
                  <Card key={`exercise-${index}`} style={styles.timelineCard}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineDot, { backgroundColor: '#2196f3' }]} />
                      <View style={styles.timelineLine} />
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <Ionicons name="fitness" size={18} color="#2196f3" />
                        <Text style={styles.timelineType}>Exercise Plan</Text>
                      </View>
                      <Text style={styles.timelineDate}>
                        {new Date(plan.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                      {plan.fitnessLevel && (
                        <Text style={styles.timelineDetail}>Level: {plan.fitnessLevel}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={styles.timelineAction}
                      onPress={() => navigation.navigate('ExercisePlan')}
                    >
                      <Ionicons name="chevron-forward" size={20} color="#64748b" />
                    </TouchableOpacity>
                  </Card>
                ))}

                {/* Lifestyle Tips Timeline */}
                {lifestyleHistory?.slice(0, 3).map((plan, index) => (
                  <Card key={`lifestyle-${index}`} style={styles.timelineCard}>
                    <View style={styles.timelineLeft}>
                      <View style={[styles.timelineDot, { backgroundColor: '#4caf50' }]} />
                      {index < Math.min(2, lifestyleHistory.length - 1) && <View style={styles.timelineLine} />}
                    </View>
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineHeader}>
                        <Ionicons name="bulb" size={18} color="#4caf50" />
                        <Text style={styles.timelineType}>Lifestyle Tips</Text>
                      </View>
                      <Text style={styles.timelineDate}>
                        {new Date(plan.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.timelineAction}
                      onPress={() => navigation.navigate('LifestyleTips')}
                    >
                      <Ionicons name="chevron-forward" size={20} color="#64748b" />
                    </TouchableOpacity>
                  </Card>
                ))}
              </View>
            )}

            {/* Action Cards */}
            <View style={styles.actionCardsSection}>
              <ActionCard
                icon="restaurant-outline"
                title="Diet Plans"
                subtitle="Generate new personalized meal plans"
                color="#ff9800"
                onPress={() => navigation.navigate('DietPlan')}
              />
              <ActionCard
                icon="fitness-outline"
                title="Exercise Plans"
                subtitle="Create workout routines for your goals"
                color="#2196f3"
                onPress={() => navigation.navigate('ExercisePlan')}
              />
              <ActionCard
                icon="bulb-outline"
                title="Lifestyle Tips"
                subtitle="Get daily health recommendations"
                color="#4caf50"
                onPress={() => navigation.navigate('LifestyleTips')}
              />
              <ActionCard
                icon="medical-outline"
                title="Medical Information"
                subtitle="View and update your health profile"
                color="#64748b"
                onPress={() => navigation.navigate('PersonalMedicalInfo')}
              />
            </View>
          </>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

  // Render Chat Section
  const renderChat = () => (
    <View style={styles.centerContainer}>
      <Ionicons name="chatbubbles-outline" size={72} color="#2196f3" style={{ opacity: 0.3 }} />
      <Text style={styles.emptyTitle}>Chat Assistant</Text>
      <Text style={styles.emptySubtitle}>
        Ask questions about diabetes, health, diet, and get instant AI-powered responses
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('ChatScreen')}
      >
        <Ionicons name="chatbubbles-outline" size={22} color="#fff" />
        <Text style={styles.primaryButtonText}>Open Chat</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Feedback Section
  const renderFeedback = () => (
    <View style={styles.centerContainer}>
      <Ionicons name="chatbox-ellipses-outline" size={72} color="#4caf50" style={{ opacity: 0.3 }} />
      <Text style={styles.emptyTitle}>Share Your Feedback</Text>
      <Text style={styles.emptySubtitle}>
        Help us improve by sharing your experience with the app
      </Text>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('FeedbackScreen')}
      >
        <Ionicons name="chatbox-ellipses-outline" size={22} color="#fff" />
        <Text style={styles.primaryButtonText}>Give Feedback</Text>
      </TouchableOpacity>
    </View>
  );

  // Main render based on selected section
  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    const label = currentSection?.label;

    switch (label) {
      case 'Home':
        return renderHome();
      case 'Profile':
        return renderProfile();
      case 'Health Data':
        return renderHealthData();
      case 'Risk Check':
        return renderRiskCheck();
      case 'Suggestions':
        return renderSuggestions();
      case 'Chat':
        return renderChat();
      case 'Feedback':
        return renderFeedback();
      default:
        return renderHome();
    }
  };

  if (!theme || loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#f7f7fb" />
        <LinearGradient
          colors={['#f7f7fb', '#ffffff', '#f7f7fb']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>
            Loading your dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Gradient Background */}
      <LinearGradient
        colors={['#f7f7fb', '#ffffff', '#f7f7fb']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Floating Menu Button */}
      <TouchableOpacity
        style={styles.floatingMenuButton}
        onPress={() => setDrawerVisible(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#3b82f6', '#2563eb']}
          style={styles.floatingMenuGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="menu" size={24} color="#ffffff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Content with Animation */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {renderContent()}
      </Animated.View>

      {/* Side Drawer Menu */}
      <Modal
        visible={drawerVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDrawerVisible(false)}
      >
        <TouchableOpacity
          style={styles.drawerOverlay}
          activeOpacity={1}
          onPress={() => setDrawerVisible(false)}
        >
          <View style={styles.drawerContainer}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb', '#1e40af']}
              style={styles.drawerHeader}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.drawerProfileRow}>
                <View style={styles.drawerAvatarCompact}>
                  <Text style={styles.drawerAvatarTextCompact}>
                    {(user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.drawerUserInfo}>
                  <Text style={styles.drawerUserNameCompact}>{user?.fullName || user?.username || 'User'}</Text>
                  <View style={styles.drawerBadgeCompact}>
                    <View style={styles.statusDot} />
                    <Text style={styles.drawerBadgeTextCompact}>Active</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>

            <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
              <View style={styles.drawerMenuSection}>
                <Text style={styles.drawerSectionTitle}>Menu</Text>
                {sections.map((section, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.drawerItem,
                      selectedIndex === index && styles.drawerItemActive
                    ]}
                    onPress={() => {
                      setSelectedIndex(index);
                      setDrawerVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.drawerIconContainer, 
                      { backgroundColor: selectedIndex === index ? section.color : section.color + '15' }
                    ]}>
                      <Ionicons 
                        name={section.icon} 
                        size={22} 
                        color={selectedIndex === index ? '#ffffff' : section.color} 
                      />
                    </View>
                    <Text style={[
                      styles.drawerItemText,
                      selectedIndex === index && styles.drawerItemTextActive
                    ]}>
                      {section.label}
                    </Text>
                    {selectedIndex === index && (
                      <View style={styles.activeCheckmark}>
                        <Ionicons name="checkmark-circle" size={20} color={section.color} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.drawerDivider} />

              <View style={styles.drawerMenuSection}>
                <Text style={styles.drawerSectionTitle}>Account</Text>
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    setDrawerVisible(false);
                    handleLogout();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.drawerIconContainer, { backgroundColor: '#fee2e2' }]}>
                    <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                  </View>
                  <Text style={[styles.drawerItemText, { color: '#ef4444', fontWeight: '600' }]}>
                    Logout
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={{ height: 20 }} />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Diagnosis Popup */}
      <Modal
        visible={showDiagnosisPopup}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <View style={styles.popupIconContainer}>
              <Ionicons name="medical-outline" size={64} color="#2563eb" />
            </View>
            <Text style={styles.popupTitle}>Diabetes Diagnosis</Text>
            <Text style={styles.popupSubtitle}>
              Have you been diagnosed with diabetes?
            </Text>
            <View style={styles.popupButtons}>
              <TouchableOpacity
                style={[styles.popupButton, styles.popupButtonYes]}
                onPress={() => handleDiagnosisAnswer('yes')}
              >
                <Text style={styles.popupButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.popupButton, styles.popupButtonNo]}
                onPress={() => handleDiagnosisAnswer('no')}
              >
                <Text style={styles.popupButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
  },
  floatingMenuButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 20,
    left: 20,
    zIndex: 1000,
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingMenuGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#475569',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Card Styles
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  // Welcome Section
  welcomeSection: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : (StatusBar.currentHeight || 0) + 60,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
  },
  profileBadgeButton: {
    marginLeft: 16,
  },
  profileBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  profileInitial: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    color: '#4caf50',
    fontWeight: '600',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: (width - 56) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  // Section
  section: {
    padding: 20,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
  },
  // Action Card
  actionCard: {
    marginBottom: 12,
  },
  actionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#475569',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  // Profile
  profileHeaderCard: {
    marginBottom: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  profileAvatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  profileAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2563eb',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  profileEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  profileSectionGroup: {
    marginBottom: 24,
  },
  profileSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  infoCardItem: {
    marginBottom: 10,
  },
  infoRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#2563eb15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextBox: {
    flex: 1,
  },
  infoLabelText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  infoValueText: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
  },
  statusCardItem: {
    paddingVertical: 20,
  },
  statusRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  statusIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextBox: {
    flex: 1,
  },
  statusLabelText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 6,
    fontWeight: '500',
  },
  statusValueText: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  actionTextContent: {
    flex: 1,
    marginLeft: 14,
  },
  actionTitleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  actionSubtitleText: {
    fontSize: 13,
    color: '#64748b',
  },
  dangerActionCard: {
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  // Old profile styles (keeping for compatibility)
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatarLarge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarLargeText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 12,
  },
  detailLabel: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  profileButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  dangerButton: {
    backgroundColor: '#f44336',
    shadowColor: '#f44336',
  },
  // Progress
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
  },
  progressPercentage: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2563eb',
  },
  progressBarContainer: {
    marginBottom: 20,
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  progressStat: {
    alignItems: 'center',
  },
  progressStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  progressStatLabel: {
    fontSize: 12,
    color: '#475569',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 10,
    elevation: 3,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Insights/Suggestions Styles
  insightsCard: {
    marginBottom: 20,
  },
  insightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  insightsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  insightsSubtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 12,
  },
  timelineSection: {
    marginBottom: 20,
  },
  timelineTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  timelineCard: {
    marginBottom: 12,
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#e2e8f0',
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  timelineType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
  timelineDate: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
  },
  timelineDetail: {
    fontSize: 12,
    color: '#475569',
  },
  timelineAction: {
    padding: 8,
  },
  actionCardsSection: {
    marginTop: 8,
  },
  // CTA Card
  ctaCard: {
    backgroundColor: '#fef3e0',
  },
  ctaContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  ctaIconContainer: {
    marginBottom: 20,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff9800',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: '#ff9800',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Assessment Result
  assessmentCard: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  riskBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  riskLevel: {
    fontSize: 18,
    fontWeight: '700',
  },
  assessmentDate: {
    fontSize: 13,
    color: '#475569',
  },
  resultCard: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  resultBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    marginBottom: 16,
  },
  resultBadgeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  resultDate: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 16,
  },
  retakeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  retakeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563eb',
  },
  // Locked Content
  lockedCard: {
    backgroundColor: '#f8f9fa',
  },
  lockedContent: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  lockedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  lockedSubtitle: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  completionBadge: {
    backgroundColor: '#64748b',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  completionBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  unlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  unlockButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Drawer
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    zIndex: 9999,
  },
  drawerContainer: {
    width: width * 0.85,
    maxWidth: 320,
    height: '100%',
    backgroundColor: '#ffffff',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    zIndex: 10000,
  },
  drawerHeader: {
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  drawerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  drawerAvatarCompact: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  drawerAvatarTextCompact: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
  },
  drawerUserInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  drawerUserNameCompact: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  drawerBadgeCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  drawerBadgeTextCompact: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  drawerContent: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  drawerMenuSection: {
    paddingVertical: 8,
  },
  drawerSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
    marginHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  drawerItemActive: {
    backgroundColor: '#f1f5f9',
  },
  drawerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  drawerItemTextActive: {
    color: '#0f172a',
    fontWeight: '700',
  },
  activeCheckmark: {
    marginLeft: 'auto',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 16,
    marginHorizontal: 20,
  },
  // Popup
  popupOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  popupCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  popupIconContainer: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  popupTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 12,
  },
  popupSubtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  popupButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  popupButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  popupButtonYes: {
    backgroundColor: '#2563eb',
  },
  popupButtonNo: {
    backgroundColor: '#64748b',
  },
  popupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default UnifiedDashboardModern;
