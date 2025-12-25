import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Animated, Dimensions, StatusBar, TouchableOpacity } from 'react-native';
import { Text, Surface, Card, Title, Paragraph, List, Button } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme, GlassCard, NeumorphicCard, PremiumButton, NeonText, FloatingParticle } from '../contexts/ThemeContext';
import { assessDiabetesRisk } from '../utils/api';

const { width, height } = Dimensions.get('window');

const RiskGauge = ({ probability, riskLevel }) => {
  const { theme } = useTheme();
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: probability,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [probability]);

  const animatedWidth = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return theme.gradients.error;
      case 'high': return theme.gradients.warning;
      case 'moderate': return ['#ff9800', '#f57c00'];
      default: return theme.gradients.success;
    }
  };

  const getRiskEmoji = (level) => {
    switch (level?.toLowerCase()) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'moderate': return '🟡';
      default: return '✅';
    }
  };

  return (
    <NeumorphicCard style={styles.riskGaugeCard}>
      <LinearGradient
        colors={getRiskColor(riskLevel)}
        style={styles.riskGaugeGradient}
      >
        <View style={styles.riskGaugeHeader}>
          <Text style={styles.riskEmoji}>{getRiskEmoji(riskLevel)}</Text>
          <NeonText style={styles.riskLevelText} color="text.primary">
            {riskLevel?.toUpperCase()} RISK
          </NeonText>
        </View>

        <View style={styles.gaugeContainer}>
          <View style={styles.gaugeBackground}>
            <Animated.View
              style={[
                styles.gaugeFill,
                { width: animatedWidth },
              ]}
            />
          </View>
          <View style={styles.gaugeLabels}>
            <Text style={[styles.gaugeLabel, { color: 'rgba(255, 255, 255, 0.7)' }]}>0%</Text>
            <Text style={[styles.gaugeValue, { color: 'white' }]}>
              {Math.round(probability * 100)}%
            </Text>
            <Text style={[styles.gaugeLabel, { color: 'rgba(255, 255, 255, 0.7)' }]}>100%</Text>
          </View>
        </View>
      </LinearGradient>
    </NeumorphicCard>
  );
};

const StatCard = ({ title, value, subtitle, icon, gradient }) => {
  const { theme } = useTheme();

  return (
    <NeumorphicCard style={styles.statCard}>
      <LinearGradient
        colors={gradient || theme.gradients.card}
        style={styles.statGradient}
      >
        <View style={styles.statHeader}>
          <Text style={styles.statIcon}>{icon}</Text>
          <NeonText style={styles.statTitle} color="text.primary">
            {title}
          </NeonText>
        </View>
        <NeonText style={styles.statValue} color="text.primary">
          {value}
        </NeonText>
        {subtitle && (
          <Text style={[styles.statSubtitle, { color: 'rgba(255, 255, 255, 0.7)' }]}>
            {subtitle}
          </Text>
        )}
      </LinearGradient>
    </NeumorphicCard>
  );
};

const AnimatedCard = ({ children, delay = 0 }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const { theme } = useTheme();

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: theme.animations.duration.normal,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: theme.animations.duration.normal,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

const AssessmentScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fadeAnim] = useState(new Animated.Value(0));
  const [particleAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadAssessment();
    startParticleAnimation();
  }, []);

  const startParticleAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(particleAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(particleAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const loadAssessment = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await assessDiabetesRisk();
      console.log('API Response:', response);

      // The API returns { features, result, userStatus }
      const result = response?.result || {};
      const features = response?.features || {};

      console.log('Result from ML model:', result);
      console.log('Features from ML model:', features);

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

      // Normalize feature importance to percentages (0-100%)
      const normalizeFeatureImportance = (importanceObj) => {
        const values = Object.values(importanceObj);
        const total = values.reduce((sum, val) => sum + val, 0);
        
        const normalized = {};
        Object.entries(importanceObj).forEach(([key, value]) => {
          normalized[key] = (value / total) * 100;  // Convert to percentage
        });
        
        return normalized;
      };

      const normalizedImportance = normalizeFeatureImportance(feature_importance);

      const normalized = {
        risk_level: (result.risk_level || 'low').charAt(0).toUpperCase() + (result.risk_level || 'low').slice(1),
        probability: Number(result.diabetes_probability || 0),
        confidence: Number(result.confidence || 0),
        recommendations: result?.recommendations?.general_recommendations || [],
        next_steps: result?.recommendations?.next_steps || [],
        feature_importance: normalizedImportance,  // Use normalized values
        symptoms_present,
      };

      console.log('Normalized assessment data:', normalized);
      setData(normalized);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: theme.animations.duration.slow,
        useNativeDriver: true,
      }).start();
    } catch (err) {
      console.error('Assessment error:', err);
      setError('Failed to fetch assessment data: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={theme.gradients.background}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <FloatingParticle
            style={[
              styles.particle1,
              {
                transform: [
                  {
                    translateY: particleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20],
                    }),
                  },
                ],
              },
            ]}
          />
          <View style={styles.loadingContainer}>
            <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: pulseAnim }] }}>
              <NeonText style={styles.loadingText} color="primary">
                🔬 Analyzing your health data...
              </NeonText>
            </Animated.View>
          </View>
        </LinearGradient>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={theme.gradients.background}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <FloatingParticle
            style={[
              styles.particle1,
              {
                transform: [
                  {
                    translateY: particleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20],
                    }),
                  },
                ],
              },
            ]}
          />
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <NeumorphicCard style={styles.errorCard}>
              <NeonText style={styles.errorTitle} color="error">
                Assessment Error
              </NeonText>
              <Text style={[styles.errorText, { color: theme.colors.text.secondary }]}>
                {error}
              </Text>
              <PremiumButton onPress={loadAssessment} style={styles.retryButton} colors={theme.gradients.primary}>
                <NeonText style={styles.retryText} color="surface">
                  🔄 Retry Assessment
                </NeonText>
              </PremiumButton>
            </NeumorphicCard>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={theme.gradients.background}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <FloatingParticle
            style={[
              styles.particle1,
              {
                transform: [
                  {
                    translateY: particleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -20],
                    }),
                  },
                ],
              },
            ]}
          />
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <NeumorphicCard style={styles.emptyCard}>
              <NeonText style={styles.emptyTitle} color="primary">
                No Assessment Data
              </NeonText>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                Complete your onboarding to get personalized health insights.
              </Text>
            </NeumorphicCard>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={theme.gradients.background}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        {/* Floating Particles */}
        <FloatingParticle
          style={[
            styles.particle1,
            {
              transform: [
                {
                  translateY: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
              ],
            },
          ]}
        />
        <FloatingParticle
          style={[
            styles.particle2,
            {
              transform: [
                {
                  translateY: particleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -30],
                  }),
                },
              ],
            },
          ]}
        />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <GlassCard style={styles.headerCard}>
          <LinearGradient
            colors={theme.gradients.primary}
            style={styles.headerGradient}
          >
            <NeonText style={styles.headerTitle} color="surface">
              🏥 Diabetes Risk Assessment
            </NeonText>
            <Text style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>
              AI-powered health analysis based on your responses
            </Text>
          </LinearGradient>
        </GlassCard>

        {/* Risk Gauge */}
        <AnimatedCard delay={200}>
          <RiskGauge probability={data.probability} riskLevel={data.risk_level} />
        </AnimatedCard>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <AnimatedCard delay={400}>
            <StatCard
              title="Confidence"
              value={`${Math.round(data.confidence * 100)}%`}
              subtitle="AI Prediction Accuracy"
              icon="🎯"
              gradient={theme.gradients.accent}
            />
          </AnimatedCard>

          <AnimatedCard delay={600}>
            <StatCard
              title="Symptoms"
              value={data.symptoms_present?.length || 0}
              subtitle="Risk factors identified"
              icon="📊"
              gradient={theme.gradients.secondary}
            />
          </AnimatedCard>
        </View>

        {/* Recommendations */}
        <AnimatedCard delay={800}>
          <NeumorphicCard style={styles.sectionCard}>
            <LinearGradient
              colors={theme.gradients.card}
              style={styles.sectionGradient}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>💡</Text>
                <NeonText style={styles.sectionTitle} color="primary">
                  Health Recommendations
                </NeonText>
              </View>
              <View style={styles.recommendationsList}>
                {data.recommendations && data.recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <Text style={styles.bulletPoint}>•</Text>
                    <Text style={[styles.recommendationText, { color: theme.colors.text.primary }]}>
                      {rec}
                    </Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </NeumorphicCard>
        </AnimatedCard>

        {/* Next Steps */}
        <AnimatedCard delay={1000}>
          <NeumorphicCard style={styles.sectionCard}>
            <LinearGradient
              colors={theme.gradients.card}
              style={styles.sectionGradient}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionIcon}>🚀</Text>
                <NeonText style={styles.sectionTitle} color="primary">
                  Next Steps
                </NeonText>
              </View>
              <View style={styles.nextStepsList}>
                {data.next_steps && data.next_steps.map((step, index) => (
                  <View key={index} style={styles.nextStepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.nextStepText, { color: theme.colors.text.primary }]}>
                      {step}
                    </Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </NeumorphicCard>
        </AnimatedCard>
      </Animated.View>
    </ScrollView>
    </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 160, // Moved even further down for maximum visibility and clickability
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backgroundGradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  particle1: {
    position: 'absolute',
    top: height * 0.1,
    left: width * 0.1,
    opacity: 0.6,
  },
  particle2: {
    position: 'absolute',
    top: height * 0.3,
    right: width * 0.15,
    opacity: 0.4,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
  },
  errorCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    width: '100%',
    borderRadius: 12,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCard: {
    margin: 20,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  headerCard: {
    marginBottom: 20,
    padding: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 25,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  riskGaugeCard: {
    marginBottom: 20,
    padding: 0,
    borderRadius: 16,
    overflow: 'hidden',
  },
  riskGaugeGradient: {
    padding: 20,
    alignItems: 'center',
  },
  riskGaugeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  riskEmoji: {
    fontSize: 32,
    marginRight: 10,
  },
  riskLevelText: {
    fontSize: 20,
    fontWeight: '700',
  },
  gaugeContainer: {
    width: '100%',
  },
  gaugeBackground: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  gaugeFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 6,
  },
  gaugeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gaugeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  gaugeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    padding: 0,
    borderRadius: 12,
  },
  statGradient: {
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 10,
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: 16,
    padding: 0,
    borderRadius: 16,
  },
  sectionGradient: {
    padding: 20,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  recommendationsList: {
    gap: 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPoint: {
    fontSize: 16,
    color: '#1976d2',
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  nextStepsList: {
    gap: 16,
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  nextStepText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});

export default AssessmentScreen;