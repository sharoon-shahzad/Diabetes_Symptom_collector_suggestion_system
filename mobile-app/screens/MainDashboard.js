import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import DiagnosisModal from '../components/DiagnosisModal';
import AssessmentInsightModal from '../components/AssessmentInsightModal';

// Import screens
import HomeScreen from './HomeScreen';
import SymptomsScreen from './SymptomsScreen';
import SuggestionsScreen from './SuggestionsScreen';
import ProfileScreen from './ProfileScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

const MainDashboard = ({ navigation }) => {
  const { user, setUser } = useAuth();
  const isDiagnosed = user?.diabetes_diagnosed === 'yes';
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  // Check diagnosis and assessment status
  useEffect(() => {
    console.log('👤 User object:', user);
    console.log('💉 Diabetes diagnosed:', user?.diabetes_diagnosed);
    console.log('📊 Last assessment:', user?.last_assessment_at);
    
    if (!user) return;

    // Check if diagnosis is null/undefined
    if (user.diabetes_diagnosed === null || user.diabetes_diagnosed === undefined) {
      console.log('🏥 User has no diagnosis set');
      setShowDiagnosisModal(true);
    }

    // Check if user has assessment but hasn't been diagnosed with diabetes
    const hasAssessment = !!user.last_assessment_at;
    const isDiagnosed = user.diabetes_diagnosed === 'yes';
    
    console.log('📊 Has assessment:', hasAssessment);
    console.log('💉 Is diagnosed:', isDiagnosed);
    
    if (hasAssessment && !isDiagnosed) {
      console.log('📊 Showing assessment insight modal (has assessment, not diagnosed)');
      // Assessment modal takes precedence over diagnosis modal if user has completed assessment
      setShowDiagnosisModal(false);
      setShowAssessmentModal(true);
    }
  }, [user]);

  const handleDiagnosisAnswer = async (answer) => {
    try {
      // Update backend
      await api.post('/personalized-system/diabetes-diagnosis', {
        diabetes_diagnosed: answer,
      });

      // Update local user state
      const updatedUser = {
        ...user,
        diabetes_diagnosed: answer,
      };
      setUser(updatedUser);

      // Close modal
      setShowDiagnosisModal(false);

      // If user answered "no" and hasn't completed onboarding, redirect to onboarding
      if (answer === 'no' && !user?.onboardingCompleted) {
        navigation.navigate('Onboarding');
      }
    } catch (error) {
      console.error('Error updating diabetes diagnosis:', error);
      Alert.alert('Error', 'Failed to save your response. Please try again.');
    }
  };

  const handleAssessmentAnswer = async (answerKey) => {
    try {
      console.log('📊 Assessment answer:', answerKey);
      
      // Map popup answers to diagnosis values
      if (answerKey === 'diagnosed_diabetic' || answerKey === 'diagnosed_not_diabetic') {
        const diagnosisValue = answerKey === 'diagnosed_diabetic' ? 'yes' : 'no';
        await handleDiagnosisAnswer(diagnosisValue);
      }
      
      // In all cases, hide the assessment popup
      setShowAssessmentModal(false);
    } catch (error) {
      console.error('Error handling assessment answer:', error);
      setShowAssessmentModal(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#f7f7fb" />
      
      {/* Diagnosis Modal - shown for new users without diagnosis */}
      <DiagnosisModal
        visible={showDiagnosisModal}
        onAnswer={handleDiagnosisAnswer}
      />

      {/* Assessment Insight Modal - shown after assessment for users not diagnosed */}
      <AssessmentInsightModal
        visible={showAssessmentModal}
        riskLevel={user?.last_assessment_risk_level}
        probability={user?.last_assessment_probability}
        assessedAt={user?.last_assessment_at}
        onSelectAnswer={handleAssessmentAnswer}
      />
      
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Symptoms') {
              iconName = focused ? 'fitness' : 'fitness-outline';
            } else if (route.name === 'Suggestions') {
              iconName = focused ? 'sparkles' : 'sparkles-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2563eb',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e2e8f0',
            height: Platform.OS === 'ios' ? 85 : 65,
            paddingBottom: Platform.OS === 'ios' ? 20 : 10,
            paddingTop: 8,
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Symptoms" component={SymptomsScreen} />
        {isDiagnosed && (
          <Tab.Screen name="Suggestions" component={SuggestionsScreen} />
        )}
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
  },
});

export default MainDashboard;
