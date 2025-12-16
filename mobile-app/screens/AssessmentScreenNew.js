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
import { assessDiabetesRisk } from '../utils/api';

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
      {[1, 2, 3, 4].map((i) => (
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

// Error State Component
const ErrorState = ({ message, onRetry }) => (
  <SafeAreaView style={styles.emptyState} edges={['top', 'bottom']}>
    <View style={styles.emptyIconContainer}>
      <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
    </View>
    <Text style={styles.emptyTitle}>Assessment Error</Text>
    <Text style={styles.emptyMessage}>{message || 'Failed to load assessment data'}</Text>
    <TouchableOpacity style={styles.errorButton} onPress={onRetry}>
      <Ionicons name="refresh" size={20} color="#ef4444" />
      <Text style={styles.errorButtonText}>Try Again</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

// Empty State Component
const EmptyState = ({ onRetry }) => (
  <SafeAreaView style={styles.emptyState} edges={['top', 'bottom']}>
    <View style={styles.emptyIconContainer}>
      <Ionicons name="document-text-outline" size={64} color="#cbd5e1" />
    </View>
    <Text style={styles.emptyTitle}>No Assessment Data</Text>
    <Text style={styles.emptyMessage}>
      Complete your health questionnaire to see your personalized diabetes risk assessment.
    </Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Ionicons name="refresh" size={20} color="#ffffff" />
      <Text style={styles.retryButtonText}>Refresh</Text>
    </TouchableOpacity>
  </SafeAreaView>
);

// Risk Level Card Component
const RiskLevelCard = ({ riskLevel, probability }) => {
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: probability,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [probability]);

  const getRiskConfig = (level) => {
    const configs = {
      critical: {
        color: '#dc2626',
        bgColor: '#fee2e2',
        icon: 'alert-circle',
        label: 'Critical Risk',
        emoji: '🚨',
        gradient: ['#dc2626', '#b91c1c'],
      },
      high: {
        color: '#ea580c',
        bgColor: '#fed7aa',
        icon: 'warning',
        label: 'High Risk',
        emoji: '⚠️',
        gradient: ['#ea580c', '#c2410c'],
      },
      moderate: {
        color: '#f59e0b',
        bgColor: '#fef3c7',
        icon: 'information-circle',
        label: 'Moderate Risk',
        emoji: '🟡',
        gradient: ['#f59e0b', '#d97706'],
      },
      low: {
        color: '#10b981',
        bgColor: '#d1fae5',
        icon: 'checkmark-circle',
        label: 'Low Risk',
        emoji: '✅',
        gradient: ['#10b981', '#059669'],
      },
    };
    return configs[level?.toLowerCase()] || configs.low;
  };

  const config = getRiskConfig(riskLevel);
  const percentage = Math.round(probability * 100);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.riskCard, { backgroundColor: '#ffffff' }]}>
      <LinearGradient
        colors={config.gradient}
        style={styles.riskGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.riskHeader}>
          <Text style={styles.riskEmoji}>{config.emoji}</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.riskLabel}>Diabetes Risk Level</Text>
            <Text style={styles.riskLevel}>{config.label}</Text>
          </View>
          <View style={styles.riskBadge}>
            <Text style={styles.riskPercentage}>{percentage}%</Text>
          </View>
        </View>

        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: progressWidth },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>0%</Text>
            <Text style={styles.progressLabel}>50%</Text>
            <Text style={styles.progressLabel}>100%</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, color = '#3b82f6' }) => (
  <View style={[styles.statCard, { backgroundColor: '#ffffff' }]}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Feature Importance Card Component
const FeatureCard = ({ feature, importance, index, maxImportance }) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [widthAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 100),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(widthAnim, {
          toValue: importance,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [importance, index]);

  // Calculate relative width based on max importance
  const relativeWidth = maxImportance > 0 ? (importance / maxImportance) * 100 : 0;
  const barWidth = widthAnim.interpolate({
    inputRange: [0, maxImportance || 1],
    outputRange: ['0%', `${relativeWidth}%`],
  });

  const getFeatureIcon = (featureName) => {
    const icons = {
      polyuria: 'water',
      polydipsia: 'fitness',
      'sudden weight loss': 'trending-down',
      weakness: 'battery-dead',
      polyphagia: 'restaurant',
      'genital thrush': 'medical',
      'visual blurring': 'eye',
      itching: 'hand-left',
      irritability: 'sad',
      'delayed healing': 'bandage',
      'partial paresis': 'body',
      'muscle stiffness': 'barbell',
      alopecia: 'person',
      obesity: 'scale',
      age: 'calendar',
      gender: 'person-outline',
    };
    return icons[featureName?.toLowerCase()] || 'pulse';
  };

  // Format importance as a readable score (not percentage)
  const formattedImportance = importance.toFixed(2);

  return (
    <Animated.View
      style={[
        styles.featureCard,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={styles.featureHeader}>
        <View style={styles.featureLeft}>
          <View style={styles.featureIconContainer}>
            <Ionicons name={getFeatureIcon(feature)} size={20} color="#3b82f6" />
          </View>
          <Text style={styles.featureName}>{feature}</Text>
        </View>
        <Text style={styles.featureScore}>{formattedImportance}</Text>
      </View>
      <View style={styles.featureBarContainer}>
        <Animated.View
          style={[
            styles.featureBar,
            { width: barWidth },
          ]}
        />
      </View>
    </Animated.View>
  );
};

// Recommendation Card Component
const RecommendationCard = ({ icon, text, index }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 150),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={[
        styles.recommendationCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.recommendationIconContainer}>
        <Ionicons name={icon} size={24} color="#3b82f6" />
      </View>
      <Text style={styles.recommendationText}>{text}</Text>
    </Animated.View>
  );
};

// Symptoms Present Card Component
const SymptomChip = ({ symptom, index }) => {
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.sequence([
      Animated.delay(index * 80),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
    ]).start();
  }, [index]);

  return (
    <Animated.View
      style={[
        styles.symptomChip,
        {
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Ionicons name="checkmark-circle" size={16} color="#10b981" />
      <Text style={styles.symptomChipText}>{symptom}</Text>
    </Animated.View>
  );
};

// Main Component
const AssessmentScreenNew = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [assessmentData, setAssessmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async (isRefreshing = false) => {
    try {
      console.log('🔄 [Assessment] Starting data load...');

      if (!isRefreshing) {
        setLoading(true);
      }
      setError(null);

      const response = await assessDiabetesRisk();
      console.log('📦 [Assessment] Raw API response:', response);

      if (!response || !response.result) {
        console.log('⚠️ [Assessment] Invalid response structure');
        setError('Invalid assessment data received');
        return;
      }

      const result = response.result || {};
      const features = response.features || {};

      // Extract symptoms present
      const symptomsPresent = Object.entries(features)
        .filter(([k, v]) => !['Age', 'Gender', 'Obesity'].includes(k) && Number(v) === 1)
        .map(([k]) => k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

      // Extract feature importance
      const featureImportance = {};
      if (result.feature_importance && typeof result.feature_importance === 'object') {
        Object.entries(result.feature_importance).forEach(([k, v]) => {
          if (v && typeof v === 'object' && typeof v.importance === 'number') {
            featureImportance[k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())] = v.importance;
          }
        });
      }

      // Process feature importance - don't normalize to 100%, show relative importance
      const processFeatureImportance = (importanceObj) => {
        console.log('🔍 [Assessment] Raw feature importance from ML model:', importanceObj);

        const processed = {};
        Object.entries(importanceObj).forEach(([key, value]) => {
          if (value && typeof value === 'object' && typeof value.importance === 'number') {
            // Keep the importance as-is from the ML model (it's already scaled appropriately)
            // Just format the key name
            const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            processed[formattedKey] = value.importance;
          }
        });

        console.log('✅ [Assessment] Processed feature importance:', processed);
        return processed;
      };

      const processedImportance = processFeatureImportance(featureImportance);      const mappedData = {
        riskLevel: (result.risk_level || 'low').toLowerCase(),
        probability: Number(result.diabetes_probability || 0),
        confidence: Number(result.confidence || 0),
        recommendations: result?.recommendations?.general_recommendations || [],
        nextSteps: result?.recommendations?.next_steps || [],
        featureImportance: processedImportance,  // Use processed values from ML model
        symptomsPresent,
        userStatus: response.userStatus || 'assessed',
      };

      console.log('✅ [Assessment] Mapped data:', mappedData);
      setAssessmentData(mappedData);
    } catch (err) {
      console.error('❌ [Assessment] Error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load assessment data');
    } finally {
      setLoading(false);
      setRefreshing(false);
      console.log('🏁 [Assessment] Load complete');
    }
  };

  useEffect(() => {
    console.log('🎬 [Assessment] Component mounted');
    loadData();

    return () => {
      console.log('🔚 [Assessment] Component unmounting');
    };
  }, []);

  const onRefresh = () => {
    console.log('♻️ [Assessment] Refresh triggered');
    setRefreshing(true);
    loadData(true);
  };

  const handleRetry = () => {
    console.log('🔄 [Assessment] Retry triggered');
    setError(null);
    loadData();
  };

  // LOADING STATE
  if (loading) {
    console.log('📊 [Assessment] Rendering LOADING state');
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
    console.log('❌ [Assessment] Rendering ERROR state:', error);
    return (
      <View style={styles.container}>
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
        <ErrorState message={error} onRetry={handleRetry} />
      </View>
    );
  }

  // EMPTY STATE
  if (!assessmentData) {
    console.log('📭 [Assessment] Rendering EMPTY state');
    return (
      <View style={styles.container}>
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
        <EmptyState onRetry={handleRetry} />
      </View>
    );
  }

  // MAIN CONTENT
  console.log('✅ [Assessment] Rendering MAIN CONTENT');

  return (
    <View style={styles.container}>
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Assessment Results</Text>
            <Text style={styles.headerSubtitle}>
              AI-powered diabetes risk analysis based on your health data
            </Text>
          </View>

          {/* Risk Level Card */}
          <RiskLevelCard
            riskLevel={assessmentData.riskLevel}
            probability={assessmentData.probability}
          />

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard
              icon="shield-checkmark"
              label="Confidence"
              value={`${Math.round(assessmentData.confidence * 100)}%`}
              color="#8b5cf6"
            />
            <StatCard
              icon="pulse"
              label="Symptoms"
              value={assessmentData.symptomsPresent.length}
              color="#ec4899"
            />
          </View>

          {/* Symptoms Present Section */}
          {assessmentData.symptomsPresent.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="medical" size={24} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Symptoms Detected</Text>
              </View>
              <View style={styles.symptomsContainer}>
                {assessmentData.symptomsPresent.map((symptom, index) => (
                  <SymptomChip key={index} symptom={symptom} index={index} />
                ))}
              </View>
            </View>
          )}

          {/* Feature Importance Section */}
          {Object.keys(assessmentData.featureImportance).length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="analytics" size={24} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Risk Factors</Text>
              </View>
              <Text style={styles.sectionDescription}>
                ML model importance scores showing relative contribution to your risk assessment
              </Text>
              {(() => {
                const sortedFeatures = Object.entries(assessmentData.featureImportance)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5);
                const maxImportance = Math.max(...sortedFeatures.map(([, importance]) => importance));
                
                return sortedFeatures.map(([feature, importance], index) => (
                  <FeatureCard
                    key={feature}
                    feature={feature}
                    importance={importance}
                    index={index}
                    maxImportance={maxImportance}
                  />
                ));
              })()}
            </View>
          )}

          {/* Recommendations Section */}
          {assessmentData.recommendations.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="clipboard" size={24} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Recommendations</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Personalized health recommendations based on your assessment
              </Text>
              {assessmentData.recommendations.map((rec, index) => (
                <RecommendationCard
                  key={index}
                  icon="checkmark-circle-outline"
                  text={rec}
                  index={index}
                />
              ))}
            </View>
          )}

          {/* Next Steps Section */}
          {assessmentData.nextSteps.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="footsteps" size={24} color="#3b82f6" />
                <Text style={styles.sectionTitle}>Next Steps</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Recommended actions to manage your diabetes risk
              </Text>
              {assessmentData.nextSteps.map((step, index) => (
                <RecommendationCard
                  key={index}
                  icon="arrow-forward-circle-outline"
                  text={step}
                  index={index}
                />
              ))}
            </View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerCard}>
              <Ionicons name="information-circle" size={20} color="#64748b" />
              <Text style={styles.footerText}>
                This assessment is for informational purposes only. Please consult with a healthcare professional for medical advice.
              </Text>
            </View>
          </View>
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
    top: StatusBar.currentHeight + 10 || 50,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
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
    paddingTop: StatusBar.currentHeight + 70 || 110,
  },

  // Skeleton Styles
  skeletonContainer: {
    flex: 1,
    padding: 16,
    paddingTop: StatusBar.currentHeight + 70 || 110,
  },
  skeletonHeader: {
    height: 100,
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
    backgroundColor: '#f1f5f9',
  },

  // Empty/Error State Styles
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  errorButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },

  // Header Styles
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
  },

  // Risk Card Styles
  riskCard: {
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  riskGradient: {
    padding: 24,
  },
  riskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  riskEmoji: {
    fontSize: 48,
  },
  riskLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 4,
  },
  riskLevel: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  riskBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  riskPercentage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },

  // Stats Grid Styles
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },

  // Section Styles
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },

  // Symptoms Styles
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  symptomChipText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },

  // Feature Card Styles
  featureCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  featureLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  featureScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
  },
  featureBarContainer: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  featureBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },

  // Recommendation Card Styles
  recommendationCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  recommendationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    lineHeight: 22,
    fontWeight: '500',
  },

  // Footer Styles
  footer: {
    marginTop: 16,
    marginBottom: 16,
  },
  footerCard: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
  },
});

export default AssessmentScreenNew;
