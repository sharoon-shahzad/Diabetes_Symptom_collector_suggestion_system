import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import api from '../utils/api';

const { width } = Dimensions.get('window');

const PersonalizedDashboard = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [personalInfoCompletion, setPersonalInfoCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletion();
  }, []);

  const fetchCompletion = async () => {
    try {
      const [personalRes, medicalRes] = await Promise.all([
        api.get('/personalized-system/personal-info'),
        api.get('/personalized-system/medical-info'),
      ]);
      
      const personalFields = ['date_of_birth', 'gender', 'phone_number'];
      const medicalFields = ['diabetes_type', 'diagnosis_date'];
      const personalData = personalRes.data?.data || {};
      const medicalData = medicalRes.data?.data || {};
      
      const total = personalFields.length + medicalFields.length;
      const completed = [...personalFields, ...medicalFields].reduce((count, field) => {
        const source = personalFields.includes(field) ? personalData : medicalData;
        return source[field] ? count + 1 : count;
      }, 0);
      
      setPersonalInfoCompletion(total ? Math.round((completed / total) * 100) : 0);
    } catch (e) {
      console.error('Error fetching completion:', e);
      setPersonalInfoCompletion(0);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      id: 'personal-medical',
      title: 'Personal & Medical Information',
      description: 'Manage your personal details and medical history',
      icon: 'person',
      color: '#2563eb',
      route: 'PersonalMedicalInfo',
      completion: personalInfoCompletion,
      isActive: true,
    },
    {
      id: 'diet-plan',
      title: 'Diet Plan',
      description: 'AI-powered meal plans based on regional guidelines',
      icon: 'restaurant',
      color: '#10b981',
      route: 'DietPlan',
      completion: 0,
      isActive: true,
    },
    {
      id: 'exercise-plan',
      title: 'Exercise Plan',
      description: 'Customized fitness routines and workouts',
      icon: 'fitness',
      color: '#f59e0b',
      route: 'ExercisePlan',
      completion: 0,
      isActive: true,
    },
    {
      id: 'lifestyle-tips',
      title: 'Lifestyle Tips',
      description: 'Daily habits and wellness recommendations',
      icon: 'bulb',
      color: '#8b5cf6',
      route: 'LifestyleTips',
      completion: 0,
      isActive: true,
    },
    {
      id: 'pro-tips',
      title: 'Pro Tips',
      description: 'Expert advice and best practices',
      icon: 'trophy',
      color: '#ec4899',
      route: null,
      completion: 0,
      isActive: false,
    },
    {
      id: 'chat-assistant',
      title: 'Chat Assistant',
      description: 'Get instant answers from AI assistant',
      icon: 'chatbubbles',
      color: '#06b6d4',
      route: 'ChatAssistant',
      completion: 0,
      isActive: true,
    },
  ];

  const handleCardPress = (section) => {
    if (section.isActive && section.route) {
      navigation.navigate(section.route, { from: 'dashboard' });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <LinearGradient colors={theme.colors.backgroundGradient} style={StyleSheet.absoluteFillObject} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <LinearGradient colors={theme.colors.backgroundGradient} style={StyleSheet.absoluteFillObject} />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Personalized Health System
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            AI-powered health recommendations tailored to your needs
          </Text>
        </View>

        {/* Cards Grid */}
        <View style={styles.cardsContainer}>
          {sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              activeOpacity={section.isActive ? 0.7 : 1}
              onPress={() => handleCardPress(section)}
              style={styles.cardWrapper}
            >
              <Card style={[
                styles.sectionCard,
                !section.isActive && styles.inactiveCard
              ]}>
                {/* Status Badge */}
                <View style={[
                  styles.badge,
                  { backgroundColor: section.isActive ? '#10b981' : '#d1d5db' }
                ]}>
                  <Text style={[
                    styles.badgeText,
                    { color: section.isActive ? '#fff' : '#6b7280' }
                  ]}>
                    {section.isActive ? 'Active' : 'Coming Soon'}
                  </Text>
                </View>

                {/* Icon Section */}
                <View style={[styles.iconContainer, { backgroundColor: `${section.color}20` }]}>
                  <Ionicons name={section.icon} size={40} color={section.color} />
                </View>

                {/* Content */}
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
                    {section.title}
                  </Text>
                  <Text style={[styles.cardDescription, { color: theme.colors.text.secondary }]}>
                    {section.description}
                  </Text>

                  {/* Progress Bar */}
                  {section.isActive && section.completion > 0 && (
                    <View style={styles.progressSection}>
                      <View style={styles.progressHeader}>
                        <Text style={[styles.progressLabel, { color: theme.colors.text.secondary }]}>
                          Completion
                        </Text>
                        <Text style={[styles.progressValue, { color: section.color }]}>
                          {section.completion}%
                        </Text>
                      </View>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[
                            styles.progressBarFill,
                            { width: `${section.completion}%`, backgroundColor: section.color }
                          ]}
                        />
                      </View>
                    </View>
                  )}
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTop: {
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    gap: 16,
  },
  cardWrapper: {
    width: '100%',
  },
  sectionCard: {
    padding: 0,
    overflow: 'hidden',
  },
  inactiveCard: {
    opacity: 0.7,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  iconContainer: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default PersonalizedDashboard;
