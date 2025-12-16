import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { fetchMyDiseaseData } from '../utils/api';

const { width } = Dimensions.get('window');

// Loading Skeleton Component
const SkeletonLoader = () => {
  const shimmerAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-300, 300],
  });

  return (
    <SafeAreaView style={styles.skeletonContainer} edges={['top', 'bottom']}>
      <View style={styles.skeletonHeader} />
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <Animated.View
            style={[
              styles.shimmer,
              { transform: [{ translateX }] },
            ]}
          />
        </View>
      ))}
    </SafeAreaView>
  );
};

// Info Card Component
const InfoCard = ({ icon, label, value, color }) => (
  <View style={[styles.infoCard, { borderLeftColor: color }]}>
    <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel} numberOfLines={1}>{label}</Text>
      <Text style={[styles.infoValue, { color }]} numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

// Symptom Card Component
const SymptomCard = ({ symptom, index }) => {
  const [expanded, setExpanded] = useState(false);

  // Don't render if symptom has no valid name
  if (!symptom || !symptom.name || symptom.name.trim() === '' || symptom.name === 'Unknown Symptom') {
    return null;
  }

  const answeredQuestions = symptom.questions?.filter(q => 
    q.answer !== null && q.answer !== undefined && q.answer !== '' && q.answer !== 'N/A'
  ) || [];
  
  const completionRate = symptom.questions?.length > 0
    ? Math.round((answeredQuestions.length / symptom.questions.length) * 100)
    : 0;

  return (
    <View style={styles.symptomCard}>
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={styles.symptomHeader}
        activeOpacity={0.7}
      >
        <View style={styles.symptomHeaderLeft}>
          <View style={styles.symptomIcon}>
            <Ionicons name="medical" size={22} color="#3b82f6" />
          </View>
          <View style={styles.symptomInfo}>
            <Text style={styles.symptomName}>{symptom.name}</Text>
            <Text style={styles.symptomMeta}>
              {symptom.questions?.length || 0} questions • {answeredQuestions.length} answered
            </Text>
          </View>
        </View>
        <View style={styles.symptomHeaderRight}>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{completionRate}%</Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#64748b"
          />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.questionsContainer}>
          {symptom.questions && symptom.questions.length > 0 ? (
            symptom.questions
              .filter(q => q && q.question && q.question.trim() !== '') // Only show questions with valid text
              .map((q, idx) => (
                <View key={idx} style={styles.questionItem}>
                  <View style={styles.questionHeader}>
                    <View style={styles.questionNumber}>
                      <Text style={styles.questionNumberText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.questionText}>{q.question}</Text>
                  </View>
                  <View style={styles.answerContainer}>
                    <View style={styles.answerRow}>
                      <Ionicons
                        name={q.answer && q.answer !== 'N/A' ? 'checkmark-circle' : 'help-circle-outline'}
                        size={18}
                        color={q.answer && q.answer !== 'N/A' ? '#10b981' : '#94a3b8'}
                      />
                      <Text style={[
                        styles.answerText,
                        (!q.answer || q.answer === 'N/A') && styles.answerTextEmpty
                      ]}>
                        {q.answer && q.answer !== 'N/A' ? q.answer : 'Not answered yet'}
                      </Text>
                    </View>
                    {q.date && (
                      <Text style={styles.answerDate}>
                        {new Date(q.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </Text>
                    )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyQuestions}>
              <Ionicons name="document-outline" size={32} color="#cbd5e1" />
              <Text style={styles.emptyQuestionsText}>No questions available</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Empty State Component
const EmptyState = ({ onRetry }) => (
  <SafeAreaView style={styles.emptyState} edges={['top', 'bottom']}>
    <View style={styles.emptyIconContainer}>
      <Ionicons name="clipboard-outline" size={64} color="#cbd5e1" />
    </View>
    <Text style={styles.emptyTitle}>No Disease Data Available</Text>
    <Text style={styles.emptyMessage}>
      Complete your health assessment to see your disease information and personalized recommendations.
    </Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Ionicons name="refresh" size={20} color="#ffffff" />
      <Text style={styles.retryButtonText}>Refresh</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

// Error State Component
const ErrorState = ({ message, onRetry }) => (
  <SafeAreaView style={styles.errorState} edges={['top', 'bottom']}>
    <View style={styles.errorIconContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
    </View>
    <Text style={styles.errorTitle}>Something Went Wrong</Text>
    <Text style={styles.errorMessage}>{message || 'Failed to load disease data'}</Text>
    <TouchableOpacity style={styles.errorButton} onPress={onRetry}>
      <Ionicons name="refresh" size={20} color="#ef4444" />
      <Text style={styles.errorButtonText}>Try Again</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

// Main Component
const DiseaseDataScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [diseaseData, setDiseaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [renderKey, setRenderKey] = useState(0);

  const loadData = async (isRefreshing = false) => {
    try {
      console.log('🔄 [DiseaseData] Starting data load...');
      
      if (!isRefreshing) {
        setLoading(true);
      }
      setError(null);

      const response = await fetchMyDiseaseData();
      console.log('📦 [DiseaseData] Raw API response:', response);
      
      if (!response) {
        console.log('⚠️ [DiseaseData] Response is null/undefined');
        setDiseaseData(null);
        setLoading(false);
        return;
      }

      // Map backend fields to frontend expected fields
      const mappedData = {
        disease_name: response.disease || response.disease_name || 'Diabetes',
        assessment_date: response.lastUpdated || response.assessment_date || new Date().toISOString(),
        symptoms: Array.isArray(response.symptoms) 
          ? response.symptoms.filter(s => 
              s && 
              s.name && 
              s.name.trim() !== '' && 
              s.name !== 'Unknown Symptom' &&
              s.questions && 
              s.questions.length > 0
            )
          : [],
        totalQuestions: response.totalQuestions || 0,
        answeredQuestions: response.answeredQuestions || 0,
      };
      
      console.log('✅ [DiseaseData] Mapped data:', {
        disease: mappedData.disease_name,
        symptomsCount: mappedData.symptoms.length,
        symptoms: mappedData.symptoms.map(s => s.name),
        totalQ: mappedData.totalQuestions,
        answeredQ: mappedData.answeredQuestions,
      });
      
      setDiseaseData(mappedData);
      setRenderKey(prev => prev + 1);
      
    } catch (err) {
      console.error('❌ [DiseaseData] Error:', err);
      console.error('❌ [DiseaseData] Error details:', {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.message || err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('🏁 [DiseaseData] Load complete. State:', {
        loading: false,
        hasData: !!diseaseData,
        hasError: !!error,
      });
    }
  };

  useEffect(() => {
    console.log('🎬 [DiseaseData] Component mounted, loading data...');
    loadData();
    
    return () => {
      console.log('🔚 [DiseaseData] Component unmounting');
    };
  }, []);

  const onRefresh = () => {
    console.log('♻️ [DiseaseData] Refresh triggered');
    setRefreshing(true);
    loadData(true);
  };

  const handleRetry = () => {
    console.log('🔄 [DiseaseData] Retry triggered');
    setError(null);
    loadData();
  };

  // Calculate statistics SAFELY
  const totalQuestions = diseaseData?.symptoms?.reduce((sum, symptom) => 
    sum + (symptom.questions?.length || 0), 0) || diseaseData?.totalQuestions || 0;
  
  const answeredQuestions = diseaseData?.symptoms?.reduce((sum, symptom) => 
    sum + (symptom.questions?.filter(q => 
      q.answer !== null && q.answer !== undefined && q.answer !== '' && q.answer !== 'N/A'
    ).length || 0), 0) || diseaseData?.answeredQuestions || 0;
  
  const completionPercentage = totalQuestions > 0 
    ? Math.round((answeredQuestions / totalQuestions) * 100) 
    : 0;

  const symptomsCount = diseaseData?.symptoms?.length || 0;

  console.log('🎨 [DiseaseData] Rendering with state:', {
    loading,
    error: !!error,
    hasData: !!diseaseData,
    symptomsCount,
    renderKey,
  });

  // LOADING STATE
  if (loading) {
    console.log('📊 [DiseaseData] Rendering LOADING state');
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#f8fafc', '#ffffff', '#f1f5f9']}
          style={StyleSheet.absoluteFillObject}
        />
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <SkeletonLoader />
      </View>
    );
  }

  // ERROR STATE
  if (error) {
    console.log('❌ [DiseaseData] Rendering ERROR state:', error);
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#f8fafc', '#ffffff', '#f1f5f9']}
          style={StyleSheet.absoluteFillObject}
        />
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <ErrorState message={error} onRetry={handleRetry} />
      </View>
    );
  }

  // EMPTY STATE
  if (!diseaseData || symptomsCount === 0) {
    console.log('📭 [DiseaseData] Rendering EMPTY state');
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#f8fafc', '#ffffff', '#f1f5f9']}
          style={StyleSheet.absoluteFillObject}
        />
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <EmptyState onRetry={handleRetry} />
      </View>
    );
  }

  // MAIN CONTENT - Always visible with full opacity
  console.log('✅ [DiseaseData] Rendering MAIN CONTENT');
  
  return (
    <View style={styles.container} key={renderKey}>
      <LinearGradient
        colors={['#f8fafc', '#ffffff', '#f1f5f9']}
        style={StyleSheet.absoluteFillObject}
      />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="#1e293b" />
      </TouchableOpacity>
      
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.headerTitle}>Disease Assessment</Text>
                <Text style={styles.headerSubtitle}>
                  {diseaseData.disease_name || 'Health Overview'}
                </Text>
              </View>
              <View style={styles.headerBadge}>
                <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              </View>
            </View>
            
            {diseaseData.assessment_date && (
              <View style={styles.dateContainer}>
                <Ionicons name="calendar-outline" size={16} color="#64748b" />
                <Text style={styles.dateText}>
                  Last updated: {new Date(diseaseData.assessment_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>
            )}
          </View>

          {/* Statistics Cards */}
          <View style={styles.statsContainer}>
            <InfoCard
              icon="clipboard-outline"
              label="Total Questions"
              value={totalQuestions.toString()}
              color="#3b82f6"
            />
            <InfoCard
              icon="checkmark-done-outline"
              label="Answered"
              value={answeredQuestions.toString()}
              color="#10b981"
            />
            <InfoCard
              icon="medical-outline"
              label="Symptoms"
              value={symptomsCount.toString()}
              color="#f59e0b"
            />
            <InfoCard
              icon="stats-chart-outline"
              label="Completion"
              value={`${completionPercentage}%`}
              color="#8b5cf6"
            />
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Assessment Progress</Text>
              <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={completionPercentage === 100 ? ['#10b981', '#059669'] : ['#3b82f6', '#2563eb']}
                  style={[styles.progressBarFill, { width: `${completionPercentage}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            </View>
            <Text style={styles.progressLabel}>
              {answeredQuestions} of {totalQuestions} questions completed
            </Text>
          </View>

          {/* Symptoms Section */}
          <View style={styles.symptomsSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="medical" size={20} color="#3b82f6" />
                </View>
                <Text style={styles.sectionTitle}>Symptoms & Responses</Text>
              </View>
              <View style={styles.symptomsBadge}>
                <Text style={styles.symptomsBadgeText}>{symptomsCount}</Text>
              </View>
            </View>

            {diseaseData.symptoms.map((symptom, index) => (
              <SymptomCard key={`symptom-${index}-${symptom.name}`} symptom={symptom} index={index} />
            ))}
          </View>

          {/* Footer Spacing */}
          <View style={styles.footerSpacing} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 10 : (StatusBar.currentHeight + 10 || 50),
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : (StatusBar.currentHeight + 16 || 56),
  },

  // Skeleton Styles
  skeletonContainer: {
    flex: 1,
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : (StatusBar.currentHeight + 16 || 56),
  },
  skeletonHeader: {
    height: 80,
    backgroundColor: '#e2e8f0',
    borderRadius: 16,
    marginBottom: 16,
  },
  skeletonCard: {
    height: 120,
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },

  // Header Styles
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
    flexShrink: 1,
  },
  headerBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10b98115',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
    marginLeft: 6,
    fontWeight: '500',
  },

  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    marginHorizontal: -6,
  },

  // Info Card Styles
  infoCard: {
    width: (width - 52) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    margin: 6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  // Progress Section
  progressSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3b82f6',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },

  // Symptoms Section
  symptomsSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#3b82f615',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  symptomsBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  symptomsBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Symptom Card Styles
  symptomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  symptomHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  symptomIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3b82f615',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  symptomInfo: {
    flex: 1,
    minWidth: 0,
  },
  symptomName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
    flexShrink: 1,
  },
  symptomMeta: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  symptomHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    marginLeft: 8,
  },
  progressBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3b82f6',
  },

  // Questions Container
  questionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  questionItem: {
    marginBottom: 16,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumberText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748b',
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 22,
  },
  answerContainer: {
    marginLeft: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    padding: 12,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  answerText: {
    flex: 1,
    fontSize: 14,
    color: '#334155',
    marginLeft: 8,
    fontWeight: '500',
  },
  answerTextEmpty: {
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  answerDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptyQuestions: {
    alignItems: 'center',
    padding: 32,
  },
  emptyQuestionsText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 300,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Error State
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 300,
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
    gap: 8,
  },
  errorButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ef4444',
  },

  footerSpacing: {
    height: 40,
  },
});

export default DiseaseDataScreen;
