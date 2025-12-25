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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { fetchSymptoms, fetchQuestionsBySymptom, fetchUserAnswers } from '../utils/api';
import api from '../utils/api';
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
  const [recentFeedback, setRecentFeedback] = useState([]);

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
    
    // Add recent feedback submissions
    if (recentFeedback && recentFeedback.length > 0) {
      recentFeedback.forEach(feedback => {
        items.push({
          type: 'Feedback',
          color: 'success',
          title: 'Feedback Submitted',
          description: `Rated ${feedback.rating} stars${feedback.comment ? ' with comments' : ''}`,
          time: feedback.submitted_on,
        });
      });
    }
    
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
        color: 'info',
        title: 'Assessment Progress',
        description: `${completionPct}% completed`,
        time: new Date().toISOString(),
      });
    }
    
    if (user?.disease) {
      items.push({
        type: 'Disease',
        color: 'warning',
        title: 'Tracking Diabetes',
        description: 'Monitoring your health condition',
        time: user.createdAt || new Date().toISOString(),
      });
    }
    
    // Sort by time (most recent first) and return top 5
    return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
  }, [answeredQuestions, totalQuestions, completionPct, lastUpdated, user, recentFeedback]);

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
      
      // Fetch recent feedback
      try {
        const feedbackResponse = await api.get('/feedback/my-feedback');
        const feedbackData = feedbackResponse.data.data.feedback || [];
        // Get only the 2 most recent feedback items
        setRecentFeedback(feedbackData.slice(0, 2));
        console.log('✅ Fetched feedback:', feedbackData.length);
      } catch (feedbackErr) {
        console.log('⚠️ Could not fetch feedback:', feedbackErr.message);
        setRecentFeedback([]);
      }
      
      setError(null);
      
    } catch (err) {
      console.error('❌ Dashboard load error:', err);
      
      // Handle 401 Unauthorized - token expired or invalid
      if (err.response?.status === 401) {
        console.log('🔐 Authentication error - redirecting to login');
        // Clear stored token
        await AsyncStorage.removeItem('accessToken');
        await AsyncStorage.removeItem('refreshToken');
        // Navigate to login
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
        return;
      }
      
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
            <View style={styles.userInfoContainer}>
              <Text style={[styles.greeting, { color: theme.colors.text.secondary }]}>
                Welcome back,
              </Text>
              <Text style={[styles.userName, { color: theme.colors.text.primary }]} numberOfLines={1}>
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

        {/* Quick Actions - Column Layout */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: theme.colors.primary }]}
            onPress={() => completionPct === 100 ? navigation.navigate('Assessment') : navigation.navigate('Onboarding')}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name={completionPct === 100 ? "analytics" : "clipboard"} size={28} color="#ffffff" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>
                {completionPct === 100 ? 'Assessment' : 'Continue Assessment'}
              </Text>
              <Text style={styles.quickActionSubtitle}>
                {completionPct === 100 ? 'View your results' : `${completionPct}% completed`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: '#10b981' }]}
            onPress={() => navigation.navigate('PersonalizedDashboard')}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="sparkles" size={28} color="#ffffff" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Personalized Plans</Text>
              <Text style={styles.quickActionSubtitle}>
                AI-powered recommendations
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: theme.colors.info }]}
            onPress={() => navigation.navigate('DiseaseData')}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="document-text" size={28} color="#ffffff" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>My Health Data</Text>
              <Text style={styles.quickActionSubtitle}>
                View all your information
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: '#8B5CF6' }]}
            onPress={() => navigation.navigate('Feedback')}
            activeOpacity={0.8}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="chatbubbles" size={28} color="#ffffff" />
            </View>
            <View style={styles.quickActionContent}>
              <Text style={styles.quickActionTitle}>Share Feedback</Text>
              <Text style={styles.quickActionSubtitle}>
                Help us improve the app
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Health Overview - Modern Grid */}
        <View style={styles.statsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Health Overview
            </Text>
            <View style={[styles.sectionBadge, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Ionicons name="pulse" size={16} color={theme.colors.primary} />
            </View>
          </View>
          
          <View style={styles.statsGrid}>
            {/* Completion Rate - Featured */}
            <Card style={[styles.featuredStatCard, { 
              backgroundColor: completionPct >= 75 ? theme.colors.success : completionPct >= 50 ? theme.colors.primary : theme.colors.warning 
            }]}>
              <View style={styles.featuredStatContent}>
                <View style={styles.featuredStatIcon}>
                  <Ionicons 
                    name={completionPct === 100 ? "checkmark-circle" : "analytics"} 
                    size={32} 
                    color="rgba(255,255,255,0.95)" 
                  />
                </View>
                <View style={styles.featuredStatText}>
                  <Text style={styles.featuredStatValue}>{completionPct}%</Text>
                  <Text style={styles.featuredStatLabel}>Completion Rate</Text>
                  <Text style={styles.featuredStatCaption}>
                    {completionPct === 100 ? '🎉 Fully Complete' : `${pendingQuestions} remaining`}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Stats Row */}
            <View style={styles.statsRow}>
              {/* Total Questions */}
              <Card style={styles.compactStatCard}>
                <View style={[styles.compactStatIcon, { backgroundColor: `${theme.colors.primary}15` }]}>
                  <Ionicons name="list" size={20} color={theme.colors.primary} />
                </View>
                <Text style={[styles.compactStatValue, { color: theme.colors.text.primary }]}>
                  {totalQuestions}
                </Text>
                <Text style={[styles.compactStatLabel, { color: theme.colors.text.secondary }]}>
                  Total
                </Text>
              </Card>

              {/* Completed */}
              <Card style={styles.compactStatCard}>
                <View style={[styles.compactStatIcon, { backgroundColor: `${theme.colors.success}15` }]}>
                  <Ionicons name="checkmark-done" size={20} color={theme.colors.success} />
                </View>
                <Text style={[styles.compactStatValue, { color: theme.colors.text.primary }]}>
                  {answeredQuestions}
                </Text>
                <Text style={[styles.compactStatLabel, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                  Done
                </Text>
              </Card>

              {/* Remaining */}
              <Card style={styles.compactStatCard}>
                <View style={[styles.compactStatIcon, { backgroundColor: `${theme.colors.warning}15` }]}>
                  <Ionicons name="hourglass-outline" size={20} color={theme.colors.warning} />
                </View>
                <Text style={[styles.compactStatValue, { color: theme.colors.text.primary }]}>
                  {pendingQuestions}
                </Text>
                <Text style={[styles.compactStatLabel, { color: theme.colors.text.secondary }]}>
                  Remaining
                </Text>
              </Card>
            </View>
          </View>
        </View>

        {/* Progress Section - Modern */}
        <View style={styles.progressSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Your Progress
            </Text>
            <View style={[styles.sectionBadge, { backgroundColor: `${theme.colors.info}15` }]}>
              <Ionicons name="trending-up" size={16} color={theme.colors.info} />
            </View>
          </View>
          
          <Card elevation="md" style={styles.progressCardContainer}>
            <View style={styles.progressContent}>
              {/* Progress Bar */}
              <View style={styles.progressBarSection}>
                <View style={styles.progressStats}>
                  <View>
                    <Text style={[styles.progressTitle, { color: theme.colors.text.primary }]}>
                      Assessment Journey
                    </Text>
                    <Text style={[styles.progressSubtitle, { color: theme.colors.text.secondary }]}>
                      {answeredQuestions} of {totalQuestions} completed
                    </Text>
                  </View>
                  <View style={styles.progressPercentageBadge}>
                    <Text style={[styles.progressPercentageText, { color: theme.colors.primary }]}>
                      {completionPct}%
                    </Text>
                  </View>
                </View>
                
                {/* Modern Progress Bar */}
                <View style={[styles.progressBarContainer, { backgroundColor: `${theme.colors.primary}10` }]}>
                  <View 
                    style={[
                      styles.progressBarFill,
                      { 
                        width: `${completionPct}%`,
                        backgroundColor: completionPct === 100 ? theme.colors.success : theme.colors.primary,
                      }
                    ]}
                  >
                    {completionPct > 0 && (
                      <LinearGradient
                        colors={[
                          completionPct === 100 ? theme.colors.success : theme.colors.primary,
                          completionPct === 100 ? '#059669' : '#1e40af',
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={StyleSheet.absoluteFillObject}
                      />
                    )}
                  </View>
                </View>

                {/* Milestones */}
                <View style={styles.milestonesContainer}>
                  <View style={styles.milestone}>
                    <View style={[
                      styles.milestoneIcon,
                      { 
                        backgroundColor: completionPct >= 25 ? `${theme.colors.success}20` : `${theme.colors.text.disabled}15`,
                        borderColor: completionPct >= 25 ? theme.colors.success : theme.colors.text.disabled,
                      }
                    ]}>
                      <Ionicons 
                        name={completionPct >= 25 ? "checkmark" : "ellipse"} 
                        size={12} 
                        color={completionPct >= 25 ? theme.colors.success : theme.colors.text.disabled} 
                      />
                    </View>
                    <Text style={[styles.milestoneText, { color: theme.colors.text.secondary }]}>25%</Text>
                  </View>
                  <View style={styles.milestone}>
                    <View style={[
                      styles.milestoneIcon,
                      { 
                        backgroundColor: completionPct >= 50 ? `${theme.colors.success}20` : `${theme.colors.text.disabled}15`,
                        borderColor: completionPct >= 50 ? theme.colors.success : theme.colors.text.disabled,
                      }
                    ]}>
                      <Ionicons 
                        name={completionPct >= 50 ? "checkmark" : "ellipse"} 
                        size={12} 
                        color={completionPct >= 50 ? theme.colors.success : theme.colors.text.disabled} 
                      />
                    </View>
                    <Text style={[styles.milestoneText, { color: theme.colors.text.secondary }]}>50%</Text>
                  </View>
                  <View style={styles.milestone}>
                    <View style={[
                      styles.milestoneIcon,
                      { 
                        backgroundColor: completionPct >= 75 ? `${theme.colors.success}20` : `${theme.colors.text.disabled}15`,
                        borderColor: completionPct >= 75 ? theme.colors.success : theme.colors.text.disabled,
                      }
                    ]}>
                      <Ionicons 
                        name={completionPct >= 75 ? "checkmark" : "ellipse"} 
                        size={12} 
                        color={completionPct >= 75 ? theme.colors.success : theme.colors.text.disabled} 
                      />
                    </View>
                    <Text style={[styles.milestoneText, { color: theme.colors.text.secondary }]}>75%</Text>
                  </View>
                  <View style={styles.milestone}>
                    <View style={[
                      styles.milestoneIcon,
                      { 
                        backgroundColor: completionPct === 100 ? `${theme.colors.success}20` : `${theme.colors.text.disabled}15`,
                        borderColor: completionPct === 100 ? theme.colors.success : theme.colors.text.disabled,
                      }
                    ]}>
                      <Ionicons 
                        name={completionPct === 100 ? "trophy" : "ellipse"} 
                        size={12} 
                        color={completionPct === 100 ? theme.colors.success : theme.colors.text.disabled} 
                      />
                    </View>
                    <Text style={[styles.milestoneText, { color: theme.colors.text.secondary }]}>100%</Text>
                  </View>
                </View>
              </View>

              {/* Action Button */}
              {completionPct < 100 ? (
                <TouchableOpacity
                  style={[styles.continueButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => navigation.navigate('Onboarding')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.continueButtonText}>Continue Assessment</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </TouchableOpacity>
              ) : (
                <View style={[styles.completedBadge, { backgroundColor: `${theme.colors.success}15` }]}>
                  <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                  <Text style={[styles.completedText, { color: theme.colors.success }]}>
                    Assessment Completed!
                  </Text>
                </View>
              )}
            </View>
          </Card>
        </View>

        {/* Recent Activity - Modern */}
        <View style={styles.activitySection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Recent Activity
            </Text>
            <View style={[styles.sectionBadge, { backgroundColor: `${theme.colors.secondary}15` }]}>
              <Ionicons name="time" size={16} color={theme.colors.secondary} />
            </View>
          </View>
          
          {activityItems.length > 0 ? (
            <View style={styles.activityList}>
              {activityItems.slice(0, 3).map((activity, index) => {
                const getIconName = (type) => {
                  switch (type) {
                    case 'Details': return 'document-text';
                    case 'Disease': return 'medical';
                    case 'Assessment': return 'analytics';
                    case 'Feedback': return 'chatbubble-ellipses';
                    default: return 'checkmark-circle';
                  }
                };

                const getColor = (color) => {
                  switch (color) {
                    case 'primary': return theme.colors.primary;
                    case 'success': return theme.colors.success;
                    case 'info': return theme.colors.info;
                    case 'warning': return theme.colors.warning;
                    default: return theme.colors.primary;
                  }
                };

                const formatTime = (timestamp) => {
                  const date = new Date(timestamp);
                  const now = new Date();
                  const diffMs = now - date;
                  const diffMins = Math.floor(diffMs / 60000);
                  const diffHours = Math.floor(diffMs / 3600000);
                  const diffDays = Math.floor(diffMs / 86400000);

                  if (diffMins < 1) return 'Just now';
                  if (diffMins < 60) return `${diffMins}m ago`;
                  if (diffHours < 24) return `${diffHours}h ago`;
                  if (diffDays < 7) return `${diffDays}d ago`;
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                };

                const iconColor = getColor(activity.color);

                return (
                  <Card key={index} style={styles.activityCard}>
                    <View style={styles.activityContent}>
                      <View style={[styles.activityIconWrapper, { backgroundColor: `${iconColor}15` }]}>
                        <Ionicons name={getIconName(activity.type)} size={20} color={iconColor} />
                      </View>
                      
                      <View style={styles.activityTextContainer}>
                        <Text style={[styles.activityTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
                          {activity.title}
                        </Text>
                        <Text style={[styles.activityDescription, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                          {activity.description}
                        </Text>
                      </View>

                      <Text style={[styles.activityTime, { color: theme.colors.text.disabled }]}>
                        {formatTime(activity.time)}
                      </Text>
                    </View>
                  </Card>
                );
              })}
            </View>
          ) : (
            <Card style={styles.emptyActivityCard}>
              <Ionicons name="time-outline" size={48} color={theme.colors.text.disabled} />
              <Text style={[styles.emptyActivityText, { color: theme.colors.text.secondary }]}>
                No recent activity
              </Text>
              <Text style={[styles.emptyActivitySubtext, { color: theme.colors.text.disabled }]}>
                Your activity will appear here
              </Text>
            </Card>
          )}
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
    gap: 16,
  },
  userInfoContainer: {
    flex: 1,
    maxWidth: '70%',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  profileBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 20,
    fontWeight: '700',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 32,
    gap: 12,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  quickActionSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '400',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    gap: 12,
  },
  featuredStatCard: {
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  featuredStatContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  featuredStatIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredStatText: {
    flex: 1,
  },
  featuredStatValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  featuredStatLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  featuredStatCaption: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.75)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  compactStatCard: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  compactStatIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactStatValue: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  compactStatLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  progressCardContainer: {
    padding: 18,
    borderRadius: 16,
  },
  progressContent: {
    gap: 16,
  },
  progressBarSection: {
    gap: 12,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  progressSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  progressPercentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  progressPercentageText: {
    fontSize: 16,
    fontWeight: '700',
  },
  progressBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  milestonesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  milestone: {
    alignItems: 'center',
    gap: 4,
  },
  milestoneIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  milestoneText: {
    fontSize: 10,
    fontWeight: '600',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 15,
    fontWeight: '600',
  },
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  activityList: {
    gap: 10,
  },
  activityCard: {
    padding: 14,
    borderRadius: 12,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  activityIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  activityDescription: {
    fontSize: 12,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyActivityCard: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyActivityText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyActivitySubtext: {
    fontSize: 12,
    fontWeight: '500',
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
