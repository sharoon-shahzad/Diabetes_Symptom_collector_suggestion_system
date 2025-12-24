import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';

const { width } = Dimensions.get('window');

const SuggestionsScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [personalInfo, setPersonalInfo] = useState(null);
  const [medicalInfo, setMedicalInfo] = useState(null);
  const [completion, setCompletion] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const personalRes = await api.get('/personalized-system/personal-info');
      const personalData = personalRes.data.data || personalRes.data;
      setPersonalInfo(personalData);
      
      const medicalRes = await api.get('/personalized-system/medical-info');
      const medicalData = medicalRes.data.data || medicalRes.data;
      setMedicalInfo(medicalData);

      // Calculate completion
      const fields = [
        personalData?.date_of_birth,
        personalData?.gender,
        personalData?.height,
        personalData?.weight,
        personalData?.country,
        medicalData?.diabetes_type,
        medicalData?.diagnosis_date,
        medicalData?.current_medications?.length > 0,
        medicalData?.recent_lab_results?.hba1c?.value,
        medicalData?.recent_lab_results?.fasting_glucose?.value,
      ];
      
      const completed = fields.filter(f => f !== null && f !== undefined && f !== '').length;
      setCompletion(Math.round((completed / fields.length) * 100));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const SuggestionCard = ({ icon, title, subtitle, color, onPress, badge }) => (
    <TouchableOpacity style={styles.suggestionCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.suggestionIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionTitle}>{title}</Text>
        <Text style={styles.suggestionSubtitle}>{subtitle}</Text>
      </View>
      {badge && (
        <View style={[styles.suggestionBadge, { backgroundColor: color }]}>
          <Text style={styles.suggestionBadgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={24} color="#64748b" />
    </TouchableOpacity>
  );

  const canAccess = completion >= 70;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
      }
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Personalized Care</Text>
          <Text style={styles.subtitle}>AI-powered health recommendations</Text>
        </View>

        {!canAccess ? (
          /* Profile Completion Required */
          <View style={styles.lockedCard}>
            <View style={styles.lockedIconContainer}>
              <Ionicons name="lock-closed" size={48} color="#64748b" />
            </View>
            <Text style={styles.lockedTitle}>Complete Your Profile</Text>
            <Text style={styles.lockedSubtitle}>
              Fill in your personal and medical information to unlock personalized health recommendations
            </Text>
            
            <View style={styles.completionCard}>
              <View style={styles.completionHeader}>
                <Text style={styles.completionText}>Profile Completion</Text>
                <Text style={styles.completionPercentage}>{completion}%</Text>
              </View>
              <View style={styles.completionBar}>
                <View style={[styles.completionFill, { width: `${completion}%` }]} />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.completeButton}
              onPress={() => navigation.navigate('PersonalMedicalInfo')}
            >
              <Text style={styles.completeButtonText}>Complete Profile</Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          /* Suggestions Available */
          <>
            {/* Quick Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Your Health Profile</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Ionicons name="person-outline" size={20} color="#2563eb" />
                  <Text style={styles.statLabel}>Complete</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#10b981" />
                  <Text style={styles.statLabel}>Verified</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="star-outline" size={20} color="#f59e0b" />
                  <Text style={styles.statLabel}>Active</Text>
                </View>
              </View>
            </View>

            {/* Suggestions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Health Recommendations</Text>
              
              <SuggestionCard
                icon="restaurant-outline"
                title="Diet Plan"
                subtitle="Personalized meal recommendations"
                color="#10b981"
                onPress={() => navigation.navigate('DietPlan')}
                badge="AI"
              />

              <SuggestionCard
                icon="fitness-outline"
                title="Exercise Plan"
                subtitle="Custom workout routines"
                color="#f59e0b"
                onPress={() => navigation.navigate('ExercisePlan')}
                badge="AI"
              />

              <SuggestionCard
                icon="bulb-outline"
                title="Lifestyle Tips"
                subtitle="Daily health guidance"
                color="#8b5cf6"
                onPress={() => navigation.navigate('LifestyleTips')}
                badge="AI"
              />

              <SuggestionCard
                icon="chatbubbles-outline"
                title="Chat Assistant"
                subtitle="Ask health questions anytime"
                color="#2563eb"
                onPress={() => navigation.navigate('ChatScreen')}
                badge="24/7"
              />

              <SuggestionCard
                icon="medical-outline"
                title="Medical Information"
                subtitle="View and update your health profile"
                color="#64748b"
                onPress={() => navigation.navigate('PersonalMedicalInfo')}
              />
            </View>
          </>
        )}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    flexWrap: 'wrap',
    marginTop: 48, // Further increased margin for better visibility
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  lockedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  lockedIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#64748b15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  lockedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  lockedSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  completionCard: {
    width: '100%',
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  completionPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
  },
  completionBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  completionFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
    width: '100%',
  },
  completeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  suggestionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  suggestionContent: {
    flex: 1,
    marginRight: 8,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    flexWrap: 'wrap',
  },
  suggestionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  suggestionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});

export default SuggestionsScreen;
