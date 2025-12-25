import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Animated, 
  Dimensions, 
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { 
  useTheme, 
  GlassCard, 
  NeumorphicCard, 
  PremiumButton, 
  NeonText, 
  FloatingParticle,
  AnimatedCard,
  GradientProgress,
} from '../contexts/ThemeContext';
import { fetchMyDiseaseData, fetchSymptoms, fetchQuestionsBySymptom, fetchUserAnswers } from '../utils/api';

const { width, height } = Dimensions.get('window');

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  const [diseaseData, setDiseaseData] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [refreshing, setRefreshing] = useState(false);
  
  // New dynamic state variables
  const [userProgress, setUserProgress] = useState(0);
  const [hasData, setHasData] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [headerScale] = useState(new Animated.Value(0.95));
  const [pulseAnim] = useState(new Animated.Value(1));


  useFocusEffect(
    React.useCallback(() => {
      loadDiseaseData();
      animateIn();
      startPulseAnimation();
    }, [])
  );

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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

  const loadDiseaseData = async () => {
    setLoading(true);
    try {
      // Fetch symptoms for the disease
      const symptoms = await fetchSymptoms();
      
      // Fetch all questions for all symptoms
      const allQuestions = [];
      for (const symptom of symptoms) {
        const questions = await fetchQuestionsBySymptom(symptom._id);
        allQuestions.push(...questions);
      }
      console.log("Fetched questions count:", allQuestions.length);
      
      // Fetch user's answers
      const userAnswers = await fetchUserAnswers();
      console.log("Raw user answers from backend:", userAnswers);
      
      // Create a map of question_id to answer
      const answerMap = {};
      userAnswers.forEach(ua => {
        const qid = ua.question_id?._id || ua.question_id;
        answerMap[qid] = {
          answer: ua.answer,
          date: ua.createdAt
        };
      });
      
      console.log("Answer map:", answerMap);
      
      // Map questions to answers
      const mappedAnswers = allQuestions.map(q => ({
        question_id: q._id,
        question: q.question_text,
        answer: answerMap[q._id]?.answer === 'N/A' ? null : answerMap[q._id]?.answer,
        date: answerMap[q._id]?.date || null
      }));
      
      setUserAnswers(mappedAnswers);
      
      console.log("Fetched user profile:", user);
      console.log("Fetched user answers:", mappedAnswers);
      console.log("Calculated progress:", progress);
      
      // Calculate progress
      const answeredCount = mappedAnswers.filter(a => a.answer !== null).length;
      const totalCount = allQuestions.length;
      
      setTotalQuestions(totalCount);
      setAnsweredQuestions(answeredCount);
      
      let progress = 0;
      if (totalCount > 0 && answeredCount > 0) {
        progress = Math.round((answeredCount / totalCount) * 100);
        progress = Math.min(progress, 100);
      }
      
      setUserProgress(progress);
      setHasData(answeredCount > 0 && progress > 0);
      
      console.log('Mapped Answers:', mappedAnswers);
      console.log('Progress Debug:');
      console.log('- Total Questions:', totalCount);
      console.log('- Answered Questions:', answeredCount);
      console.log('- Calculated progress:', progress, '%');
    } catch (err) {
      console.error('Error loading data:', err);
      setDiseaseData({});
      setUserAnswers([]);
      setTotalQuestions(0);
      setAnsweredQuestions(0);
      setUserProgress(0);
      setHasData(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDiseaseData();
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Welcome');
  };


  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="transparent" 
        translucent 
      />
      
      {/* Background with gradient */}
      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Show loading overlay if loading */}
      {loading && (
        <View style={[StyleSheet.absoluteFillObject, styles.loadingOverlay]}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <LinearGradient
              colors={theme.gradients.primary}
              style={styles.loadingSpinner}
            >
              <Ionicons name="refresh" size={40} color="#ffffff" />
            </LinearGradient>
          </Animated.View>
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            Loading dashboard...
          </Text>
        </View>
      )}

      {/* Floating Particles for premium effect */}
      <FloatingParticle 
        style={styles.particle1}
        size={8}
        duration={4000}
        color={theme.colors.primaryLight}
      />
      <FloatingParticle 
        style={styles.particle2}
        size={6}
        duration={3500}
        delay={500}
        color={theme.colors.accent}
      />
      <FloatingParticle 
        style={styles.particle3}
        size={10}
        duration={5000}
        delay={1000}
        color={theme.colors.primary}
      />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Premium Header Card */}
          <Animated.View style={{ transform: [{ scale: headerScale }] }}>
            <GlassCard style={styles.headerCard} variant="premium">
              <LinearGradient
                colors={theme.gradients.primary}
                style={styles.headerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.headerContent}>
                  <View style={styles.headerLeft}>
                    <View style={styles.avatarContainer}>
                      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                        <LinearGradient
                          colors={['#ffffff', 'rgba(255, 255, 255, 0.7)']}
                          style={styles.avatar}
                        >
                          <Text style={styles.avatarText}>
                            {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                          </Text>
                        </LinearGradient>
                      </Animated.View>
                    </View>
                    <View style={styles.headerTextContainer}>
                      <Text style={styles.welcomeText}>Welcome back,</Text>
                      <NeonText style={styles.nameText} color="text.inverse" glow={false}>
                        {user?.fullName || 'User'}
                      </NeonText>
                      <Text style={styles.subText}>
                        {new Date().toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </Text>
                    </View>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)']}
                      style={styles.logoutButtonInner}
                    >
                      <Ionicons name="log-out-outline" size={20} color="#ffffff" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </GlassCard>
          </Animated.View>

        {/* Account Info Card */}
        <AnimatedCard delay={200}>
          <NeumorphicCard style={styles.accountCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={theme.gradients.primary}
                  style={styles.sectionIcon}
                >
                  <Ionicons name="person" size={24} color="#ffffff" />
                </LinearGradient>
              </View>
              <NeonText style={styles.sectionTitle} color="primary">
                Account Information
              </NeonText>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="mail" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                    Email Address
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                    {user?.email || 'Not available'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons 
                    name={user?.gender === 'Male' ? 'male' : user?.gender === 'Female' ? 'female' : 'male-female'} 
                    size={18} 
                    color={theme.colors.primary} 
                  />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                    Gender
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                    {user?.gender || 'Not specified'}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailItem}>
                <View style={styles.detailIcon}>
                  <Ionicons name="calendar" size={18} color={theme.colors.primary} />
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: theme.colors.text.secondary }]}>
                    Date of Birth
                  </Text>
                  <Text style={[styles.detailValue, { color: theme.colors.text.primary }]}>
                    {user?.date_of_birth || 'Not specified'}
                  </Text>
                </View>
              </View>
            </View>
          </NeumorphicCard>
        </AnimatedCard>

        {/* Progress Card - Dynamic */}
        <AnimatedCard delay={300}>
          <GlassCard style={styles.progressCard} variant="strong">
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <LinearGradient
                  colors={theme.gradients.accent}
                  style={styles.sectionIcon}
                >
                  <Ionicons name="fitness" size={24} color="#ffffff" />
                </LinearGradient>
              </View>
              <NeonText style={styles.sectionTitle} color="primary">
                Health Assessment
              </NeonText>
            </View>

            <View style={styles.progressContent}>
              {!hasData ? (
                // No data state
                <>
                  <Text style={[styles.progressLabel, { color: theme.colors.text.primary, textAlign: 'center', fontSize: 16 }]}>
                    No data yet
                  </Text>
                  <Text style={[styles.progressSubtext, { color: theme.colors.text.secondary, textAlign: 'center', marginBottom: 20 }]}>
                    Start your health assessment to track your progress
                  </Text>
                  <PremiumButton
                    onPress={() => navigation.navigate('Onboarding')}
                    variant="primary"
                    size="large"
                    style={styles.actionButton}
                  >
                    <View style={styles.buttonContent}>
                      <Ionicons name="rocket" size={20} color="#ffffff" />
                      <NeonText style={styles.buttonText} color="text.inverse" glow={false}>
                        Fill Form
                      </NeonText>
                    </View>
                  </PremiumButton>
                </>
              ) : (
                // Has data state
                <>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressLabel, { color: theme.colors.text.primary }]}>
                      Your Progress
                    </Text>
                    <View style={[
                      styles.progressBadge,
                      { backgroundColor: userProgress === 100 ? theme.colors.success : theme.colors.warning }
                    ]}>
                      <Text style={styles.progressBadgeText}>{userProgress}%</Text>
                    </View>
                  </View>

                  <Text style={[styles.progressSubtext, { color: theme.colors.text.secondary }]}>
                    {userProgress === 100
                      ? '🎉 Assessment completed successfully!'
                      : `${answeredQuestions} of ${totalQuestions} questions answered`
                    }
                  </Text>

                  <GradientProgress
                    progress={userProgress / 100}
                    height={12}
                    colors={userProgress === 100 ? theme.gradients.success : theme.gradients.primary}
                  />

                  <View style={styles.buttonContainer}>
                    {userProgress < 100 ? (
                      <PremiumButton
                        onPress={() => navigation.navigate('Onboarding')}
                        variant="primary"
                        size="large"
                        style={styles.actionButton}
                      >
                        <View style={styles.buttonContent}>
                          <Ionicons name="play" size={20} color="#ffffff" />
                          <NeonText style={styles.buttonText} color="text.inverse" glow={false}>
                            Start Assessment
                          </NeonText>
                        </View>
                      </PremiumButton>
                    ) : (
                      <PremiumButton
                        onPress={() => navigation.navigate('Assessment')}
                        variant="success"
                        size="large"
                        style={styles.actionButton}
                      >
                        <View style={styles.buttonContent}>
                          <Ionicons name="analytics" size={20} color="#ffffff" />
                          <NeonText style={styles.buttonText} color="text.inverse" glow={false}>
                            View Results
                          </NeonText>
                        </View>
                      </PremiumButton>
                    )}
                  </View>
                </>
              )}
            </View>
          </GlassCard>
        </AnimatedCard>
        
        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacer} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : (StatusBar.currentHeight + 16 || 48),
  },
  // Particles
  particle1: {
    top: '15%',
    left: '10%',
  },
  particle2: {
    top: '25%',
    right: '15%',
  },
  particle3: {
    top: '45%',
    left: '20%',
  },
  // Header
  headerCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
    borderRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1976d2',
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
  subText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  logoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  logoutButtonInner: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  // Section Card
  accountCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIconContainer: {
    marginRight: 12,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  // Details
  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    marginVertical: 4,
  },
  // Progress Card
  progressCard: {
    marginBottom: 16,
    padding: 24,
  },
  progressContent: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  progressInfo: {
    marginBottom: 16,
  },
  progressSubtext: {
    fontSize: 14,
  },
  buttonContainer: {
    marginTop: 20,
  },
  actionButton: {
    marginTop: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 100 : (StatusBar.currentHeight + 100 || 148),
    paddingHorizontal: 20,
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default DashboardScreen;