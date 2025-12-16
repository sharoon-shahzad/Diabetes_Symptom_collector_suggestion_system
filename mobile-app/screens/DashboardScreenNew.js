import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchSymptoms, fetchQuestionsBySymptom, fetchUserAnswers } from '../utils/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import StatCard from '../components/dashboard/StatCard';
import ProgressCard from '../components/dashboard/ProgressCard';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';

const DashboardScreenNew = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Dynamic Data
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Computed values
  const completionPct = useMemo(() => {
    if (!totalQuestions) return 0;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  }, [answeredQuestions, totalQuestions]);

  const pendingQuestions = useMemo(() => {
    return totalQuestions - answeredQuestions;
  }, [totalQuestions, answeredQuestions]);

  const activityItems = useMemo(() => {
    const items = [];
    
    if (lastUpdated) {
      items.push({
        type: 'Details',
        color: 'primary',
        title: 'Profile Updated',
        description: `${answeredQuestions} of ${totalQuestions} questions answered`,
        time: lastUpdated,
      });
    }
    
    if (answeredQuestions > 0) {
      items.push({
        type: 'Assessment',
        color: 'success',
        title: 'Assessment Progress',
        description: `${completionPct}% completed`,
        time: new Date().toISOString(),
      });
    }
    
    if (user?.disease) {
      items.push({
        type: 'Disease',
        color: 'info',
        title: 'Tracking Diabetes',
        description: 'Monitoring your health condition',
        time: user.createdAt || new Date().toISOString(),
      });
    }
    
    return items;
  }, [answeredQuestions, totalQuestions, completionPct, lastUpdated, user]);

  // Load data function with accurate counting
  const loadDashboardData = async () => {
    try {
      console.log('📊 Loading dashboard data...');
      
      // Fetch all symptoms
      const symptoms = await fetchSymptoms();
      console.log('✅ Fetched symptoms:', symptoms.length);
      
      // Fetch all questions for all symptoms
      const allQuestions = [];
      for (const symptom of symptoms) {
        const questions = await fetchQuestionsBySymptom(symptom._id);
        allQuestions.push(...questions);
      }
      console.log('✅ Total questions fetched:', allQuestions.length);
      
      // Fetch user's answers
      const rawAnswers = await fetchUserAnswers();
      console.log('✅ Raw user answers:', rawAnswers);
      
      // Create answer map
      const answerMap = {};
      rawAnswers.forEach(ua => {
        const qid = ua.question_id?._id || ua.question_id;
        if (qid) {
          answerMap[qid] = {
            answer: ua.answer,
            date: ua.createdAt
          };
        }
      });
      
      // Map questions to answers
      const mappedAnswers = allQuestions.map(q => ({
        question_id: q._id,
        question: q.question_text,
        answer: answerMap[q._id]?.answer === 'N/A' ? null : answerMap[q._id]?.answer,
        date: answerMap[q._id]?.date || null
      }));
      
      // Calculate ACCURATE counts
      const answered = mappedAnswers.filter(a => a.answer !== null && a.answer !== undefined).length;
      const total = allQuestions.length;
      
      console.log('📈 Dashboard Stats:');
      console.log('   Total Questions:', total);
      console.log('   Answered Questions:', answered);
      console.log('   Pending Questions:', total - answered);
      console.log('   Completion:', Math.round((answered / total) * 100) + '%');
      
      // Update state
      setTotalQuestions(total);
      setAnsweredQuestions(answered);
      setUserAnswers(mappedAnswers);
      setLastUpdated(rawAnswers[0]?.createdAt || new Date().toISOString());
      setError(null);
      
    } catch (err) {
      console.error('❌ Dashboard load error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on mount and when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <LinearGradient
          colors={theme.colors.backgroundGradient}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading your dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Premium Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>
                Welcome back,
              </Text>
              <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
                {user?.fullName || 'User'}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.profileBadge, { backgroundColor: `${theme.colors.primary}15` }]}
              onPress={() => navigation.navigate('Profile')}
            >
              <Text style={[styles.profileInitial, { color: theme.colors.primary }]}>
                {user?.fullName?.[0]?.toUpperCase() || 'U'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: theme.colors.primary }]}
            onPress={() => completionPct === 100 ? navigation.navigate('Assessment') : navigation.navigate('Onboarding')}
            activeOpacity={0.8}
          >
            <Ionicons name={completionPct === 100 ? "analytics" : "clipboard"} size={24} color="#ffffff" />
            <Text style={styles.quickActionText}>
              {completionPct === 100 ? 'Assessment' : 'Continue'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: theme.colors.info }]}
            onPress={() => navigation.navigate('DiseaseData')}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text" size={24} color="#ffffff" />
            <Text style={styles.quickActionText}>My Data</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid - 2x2 Modern Cards */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Health Overview
          </Text>
          
          <View style={styles.statsGrid}>
            {/* Total Questions */}
            <View style={styles.statItem}>
              <StatCard
                title="Total Questions"
                value={totalQuestions.toString()}
                caption="Available assessments"
                icon={<Ionicons name="help-circle-outline" size={22} color={theme.colors.primary} />}
                color="primary"
              />
            </View>
            
            {/* Answered */}
            <View style={styles.statItem}>
              <StatCard
                title="Completed"
                value={answeredQuestions.toString()}
                caption="Questions answered"
                icon={<Ionicons name="checkmark-circle-outline" size={22} color={theme.colors.success} />}
                color="success"
              />
            </View>
            
            {/* Pending */}
            <View style={styles.statItem}>
              <StatCard
                title="Remaining"
                value={pendingQuestions.toString()}
                caption="Questions left"
                icon={<Ionicons name="time-outline" size={22} color={theme.colors.warning} />}
                color="warning"
              />
            </View>
            
            {/* Progress */}
            <View style={styles.statItem}>
              <StatCard
                title="Progress"
                value={`${completionPct}%`}
                caption={completionPct === 100 ? 'Completed!' : 'In progress'}
                icon={<Ionicons name="trending-up-outline" size={22} color={theme.colors.info} />}
                color="info"
              />
            </View>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressSection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Your Progress
          </Text>
          
          <Card elevation="md" style={styles.progressCardContainer}>
            <ProgressCard
              percentage={completionPct}
              title="Assessment Completion"
              subtitle={`${answeredQuestions} of ${totalQuestions} questions answered`}
            />
            
            {completionPct < 100 && (
              <View style={styles.progressActions}>
                <Button
                  variant="primary"
                  size="medium"
                  fullWidth
                  onPress={() => navigation.navigate('Onboarding')}
                >
                  Continue Assessment
                </Button>
              </View>
            )}
          </Card>
        </View>

        {/* Activity Timeline */}
        <View style={styles.activitySection}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Recent Activity
          </Text>
          
          <ActivityTimeline activities={activityItems} />
        </View>

        {/* Error State */}
        {error && (
          <Card elevation="sm" style={styles.errorCard}>
            <Ionicons name="alert-circle" size={24} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
            <TouchableOpacity onPress={loadDashboardData}>
              <Text style={[styles.retryText, { color: theme.colors.primary }]}>
                Tap to retry
              </Text>
            </TouchableOpacity>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight || 20),
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  profileBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: '700',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  quickAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statItem: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  progressCardContainer: {
    padding: 20,
  },
  progressActions: {
    marginTop: 20,
  },
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  errorCard: {
    marginHorizontal: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  retryText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DashboardScreenNew;
