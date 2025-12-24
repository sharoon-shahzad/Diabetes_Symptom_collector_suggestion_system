import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
    <View style={styles.skeletonContainer}>
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
    </View>
  );
};

// Dynamic Configuration for Containers
const getDynamicConfig = (diseaseData) => {
  // Use the values directly from the API response, with defaults
  const totalQuestions = diseaseData?.totalQuestions || 17; // Default to 17 if not provided
  const answeredQuestions = Math.min(diseaseData?.answeredQuestions || 0, totalQuestions);
  const completionPercentage = totalQuestions > 0
    ? Math.round((answeredQuestions / totalQuestions) * 100)
    : 0;
  const symptomsCount = diseaseData?.symptoms?.length || 0;  console.log('🔢 Dynamic Config Calculations:', {
    totalQuestions,
    answeredQuestions,
    completionPercentage,
    symptomsCount,
    diseaseData: diseaseData ? 'present' : 'null'
  });

  return {
    // Statistics Cards Configuration
    statsCards: [
      {
        key: 'totalQuestions',
        icon: 'clipboard-outline',
        label: 'Total Questions',
        value: totalQuestions.toString(),
        color: '#3b82f6',
        onPress: null,
      },
      {
        key: 'answeredQuestions',
        icon: 'checkmark-done-outline',
        label: 'Answered',
        value: answeredQuestions.toString(),
        color: '#10b981',
        onPress: null,
      },
      {
        key: 'symptoms',
        icon: 'medical-outline',
        label: 'Symptoms',
        value: symptomsCount.toString(),
        color: '#f59e0b',
        onPress: null,
      },
      {
        key: 'completion',
        icon: 'stats-chart-outline',
        label: 'Completion',
        value: `${completionPercentage}%`,
        color: '#8b5cf6',
        onPress: null,
      },
    ],

    // Sections Configuration
    sections: [
      {
        key: 'progress',
        title: 'Assessment Progress',
        icon: 'stats-chart-outline',
        iconColor: '#3b82f6',
        backgroundColor: '#ffffff',
        showProgressBar: true,
        progressValue: completionPercentage,
        progressLabel: `${answeredQuestions} of ${totalQuestions} questions completed`,
        enabled: true,
      },
      {
        key: 'symptoms',
        title: 'Symptoms & Responses',
        icon: 'medical',
        iconColor: '#3b82f6',
        backgroundColor: '#ffffff',
        badgeValue: symptomsCount,
        enabled: symptomsCount > 0,
      },
    ],

    // Header Configuration
    header: {
      title: 'Disease Assessment',
      subtitle: diseaseData?.disease_name || diseaseData?.disease || 'Health Overview',
      badgeIcon: 'shield-checkmark',
      badgeColor: '#10b981',
      showDate: !!diseaseData?.assessment_date || !!diseaseData?.lastUpdated,
      dateIcon: 'calendar-outline',
      dateLabel: 'Last updated',
      dateValue: diseaseData?.assessment_date || diseaseData?.lastUpdated,
    },

    // Colors and Theme
    theme: {
      primary: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      secondary: '#8b5cf6',
      error: '#ef4444',
      background: '#ffffff',
      surface: '#f8fafc',
      text: {
        primary: '#0f172a',
        secondary: '#64748b',
        hint: '#94a3b8',
      },
    },
  };
};

// Info Card Component
const InfoCard = ({ config, theme }) => (
  <TouchableOpacity
    style={[styles.infoCard, { borderLeftColor: config.color }]}
    onPress={config.onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}>
      <Ionicons name={config.icon} size={24} color={config.color} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{config.label}</Text>
      <Text style={[styles.infoValue, { color: config.color }]}>{config.value}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={theme?.text?.hint || "#94a3b8"} />
  </TouchableOpacity>
);

// Dynamic Section Component
const DynamicSection = ({ section, children, theme }) => {
  if (!section.enabled) return null;

  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, { backgroundColor: section.backgroundColor || '#ffffff' }]}>
        <View style={styles.sectionHeaderLeft}>
          <View style={[styles.sectionIconContainer, { backgroundColor: section.iconColor + '15' }]}>
            <Ionicons name={section.icon} size={20} color={section.iconColor} />
          </View>
          <Text style={[styles.sectionTitle, { color: theme?.text?.primary || '#0f172a' }]}>{section.title}</Text>
        </View>
        {section.badgeValue !== undefined && (
          <View style={[styles.sectionBadge, { backgroundColor: section.iconColor }]}>
            <Text style={styles.sectionBadgeText}>{section.badgeValue}</Text>
          </View>
        )}
      </View>
      {children}
    </View>
  );
};

// Dynamic Progress Section Component
const ProgressSection = ({ section, theme }) => {
  if (!section.enabled || !section.showProgressBar) return null;

  return (
    <View style={[styles.progressSection, { backgroundColor: section.backgroundColor || '#ffffff' }]}>
      <View style={styles.progressHeader}>
        <Text style={[styles.progressTitle, { color: theme?.text?.primary || '#0f172a' }]}>{section.title}</Text>
        <Text style={[styles.progressPercentage, { color: section.iconColor }]}>{section.progressValue}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <LinearGradient
            colors={section.progressValue === 100 ? ['#10b981', '#059669'] : [section.iconColor, section.iconColor + 'dd']}
            style={[styles.progressBarFill, { width: `${section.progressValue}%` }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </View>
      </View>
      <Text style={[styles.progressLabel, { color: theme?.text?.secondary || '#64748b' }]}>
        {section.progressLabel}
      </Text>
    </View>
  );
};

// Symptom Card Component
const SymptomCard = ({ symptom, index }) => {
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = new Animated.Value(0);

  const toggleExpand = () => {
    Animated.timing(animatedHeight, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setExpanded(!expanded);
  };

  const answeredQuestions = symptom.questions?.filter(q => q.answer !== null && q.answer !== undefined) || [];
  const completionRate = symptom.questions?.length > 0
    ? Math.round((answeredQuestions.length / symptom.questions.length) * 100)
    : 0;

  return (
    <View style={[styles.symptomCard, expanded && styles.symptomCardExpanded]}>
      <TouchableOpacity
        onPress={toggleExpand}
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
        <Animated.View style={styles.questionsContainer}>
          {symptom.questions && symptom.questions.length > 0 ? (
            symptom.questions.map((q, idx) => (
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
                      name={q.answer ? 'checkmark-circle' : 'help-circle-outline'}
                      size={18}
                      color={q.answer ? '#10b981' : '#94a3b8'}
                    />
                    <Text style={[
                      styles.answerText,
                      !q.answer && styles.answerTextEmpty
                    ]}>
                      {q.answer || 'Not answered yet'}
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
        </Animated.View>
      )}
    </View>
  );
};

// Empty State Component
const EmptyState = ({ onGetStarted }) => (
  <View style={styles.emptyState}>
    <View style={styles.emptyIconContainer}>
      <Ionicons name="clipboard-outline" size={72} color="#cbd5e1" />
    </View>
    <Text style={styles.emptyTitle}>No disease data available</Text>
    <Text style={styles.emptyMessage}>
      Complete your health assessment to see your disease information and personalized recommendations.
    </Text>
    <TouchableOpacity style={styles.getStartedButton} onPress={onGetStarted} activeOpacity={0.8}>
      <Text style={styles.getStartedButtonText}>Let's Get Started</Text>
    </TouchableOpacity>
  </View>
);

// Error State Component
const ErrorState = ({ message, onRetry }) => (
  <View style={styles.errorState}>
    <View style={styles.errorIconContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
    </View>
    <Text style={styles.errorTitle}>Something Went Wrong</Text>
    <Text style={styles.errorMessage}>{message || 'Failed to load disease data'}</Text>
    <TouchableOpacity style={styles.errorButton} onPress={onRetry}>
      <Ionicons name="refresh" size={20} color="#ef4444" />
      <Text style={styles.errorButtonText}>Try Again</Text>
    </TouchableOpacity>
  </View>
);

// Main Component
const DiseaseDataScreen = () => {
  const { theme } = useTheme();
  const [diseaseData, setDiseaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const fadeAnim = new Animated.Value(0);

  const loadData = async (isRefreshing = false) => {
    try {
      console.log('🔄 Loading disease data...');
      if (!isRefreshing) {
        setLoading(true);
      }
      setError(null);

      const data = await fetchMyDiseaseData();
      console.log('✅ Disease data received:', JSON.stringify(data, null, 2));
      console.log('🔍 API Response breakdown:', {
        hasData: !!data,
        totalQuestions: data?.totalQuestions,
        answeredQuestions: data?.answeredQuestions,
        symptomsCount: data?.symptoms?.length,
        disease: data?.disease
      });
      
      if (data && Object.keys(data).length > 0) {
        // Map backend fields to frontend expected fields
        const mappedData = {
          disease_name: data.disease || data.disease_name || 'Diabetes',
          assessment_date: data.lastUpdated || data.assessment_date || new Date().toISOString(),
          symptoms: data.symptoms || [],
          totalQuestions: data.totalQuestions || 17, // Default to 17 questions
          answeredQuestions: data.answeredQuestions || 0,
        };
        
        console.log('✅ Mapped disease data:', mappedData);
        setDiseaseData(mappedData);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }).start();
      } else {
        console.log('⚠️ No disease data received or empty data');
        setDiseaseData(null);
      }
    } catch (err) {
      console.error('❌ Error loading disease data:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('🏁 Loading complete');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-refresh when screen comes into focus (after onboarding)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 DiseaseDataScreen focused - checking for updates');
      loadData();
      return () => {
        // Cleanup if needed
      };
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData(true);
  };

  const handleRetry = () => {
    loadData();
  };

  // Determine if user has completed onboarding - show data only when they have answered questions
  const hasData = diseaseData && diseaseData.answeredQuestions > 0;

  console.log('🎯 State Evaluation:', {
    loading,
    error: !!error,
    hasData,
    answeredQuestions: diseaseData?.answeredQuestions,
    diseaseData: !!diseaseData
  });

  // Clean JSX conditionals - no mixed logic
  if (loading) {
    console.log('📊 Rendering: Loading State');
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

  if (error) {
    console.log('❌ Rendering: Error State', error);
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

  if (hasData) {
    console.log('✅ Rendering: Disease Data', {
      answeredQuestions: diseaseData.answeredQuestions,
      totalQuestions: diseaseData.totalQuestions,
      symptomsCount: diseaseData.symptoms?.length
    });

    // Get dynamic configuration
    const config = getDynamicConfig(diseaseData);

    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#f8fafc', '#ffffff', '#f1f5f9']}
          style={StyleSheet.absoluteFillObject}
        />
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.headerTitle}>{config.header.title}</Text>
                  <Text style={styles.headerSubtitle}>
                    {config.header.subtitle}
                  </Text>
                </View>
                <View style={styles.headerBadge}>
                  <Ionicons name={config.header.badgeIcon} size={20} color={config.header.badgeColor} />
                </View>
              </View>

              {config.header.showDate && (
                <View style={styles.dateContainer}>
                  <Ionicons name={config.header.dateIcon} size={16} color={config.theme.text.secondary} />
                  <Text style={styles.dateText}>
                    {config.header.dateLabel}: {new Date(config.header.dateValue).toLocaleDateString('en-US', {
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
              {config.statsCards.map((cardConfig) => (
                <InfoCard
                  key={cardConfig.key}
                  config={cardConfig}
                  theme={config.theme}
                />
              ))}
            </View>

            {/* Dynamic Sections */}
            {config.sections.map((section) => {
              if (section.key === 'progress') {
                return (
                  <ProgressSection
                    key={section.key}
                    section={section}
                    theme={config.theme}
                  />
                );
              }
              if (section.key === 'symptoms') {
                return (
                  <DynamicSection
                    key={section.key}
                    section={section}
                    theme={config.theme}
                  >
                    {diseaseData.symptoms.map((symptom, index) => (
                      <SymptomCard key={index} symptom={symptom} index={index} />
                    ))}
                  </DynamicSection>
                );
              }
              return null;
            })}

            {/* Footer Spacing */}
            <View style={styles.footerSpacing} />
          </Animated.View>
        </ScrollView>
      </View>
    );
  }

  // Default: Empty State (no disease data or answeredQuestions == 0)
  console.log('📭 Rendering: Empty State (no data or answeredQuestions == 0)', {
    diseaseData: !!diseaseData,
    answeredQuestions: diseaseData?.answeredQuestions
  });

  const handleGetStarted = () => {
    console.log('🚀 Navigating to OnboardingScreen');
    navigation.navigate('Onboarding');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#f8fafc', '#ffffff', '#f1f5f9']}
        style={StyleSheet.absoluteFillObject}
      />
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <EmptyState onGetStarted={handleGetStarted} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight + 20 || 60),
  },

  // Skeleton Styles
  skeletonContainer: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : (StatusBar.currentHeight + 20 || 60),
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
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.5,
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
    marginBottom: 20,
    gap: 12,
  },

  // Info Card Styles
  infoCard: {
    flex: 1,
    minWidth: (width - 52) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  // Progress Section
  progressSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
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
  sectionBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sectionBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
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
  symptomCardExpanded: {
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  symptomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  symptomHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  symptomIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3b82f615',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  symptomInfo: {
    flex: 1,
  },
  symptomName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  symptomMeta: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  symptomHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  getStartedButtonText: {
    fontSize: 16,
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
