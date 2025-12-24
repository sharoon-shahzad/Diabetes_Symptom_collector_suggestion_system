import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  useTheme, 
  GlassCard, 
  PremiumButton, 
  NeonText,
  FloatingParticle,
} from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const { width } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user, loading } = useAuth();
  
  console.log('WelcomeScreen rendered');
  console.log('Navigation object:', navigation);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      if (loading) return; // Wait for auth to load
      
      const token = await AsyncStorage.getItem('accessToken');
      if (token && user) {
        console.log('✅ User already logged in, navigating to Dashboard');
        navigation.replace('Dashboard');
      }
    };
    
    checkAuth();
  }, [user, loading]);

  useEffect(() => {
    console.log('WelcomeScreen useEffect - starting animations');
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    {
      icon: 'pulse',
      title: 'Track Symptoms',
      description: 'Monitor your health with comprehensive symptom tracking',
      color: theme.colors.primary,
    },
    {
      icon: 'analytics',
      title: 'Smart Insights',
      description: 'Get AI-powered analysis and personalized recommendations',
      color: theme.colors.secondary,
    },
    {
      icon: 'shield-checkmark',
      title: 'Secure & Private',
      description: 'Your health data is encrypted and protected',
      color: theme.colors.accent,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Particles */}
      <FloatingParticle style={styles.particle1} size={10} duration={4000} color={theme.colors.primaryLight} />
      <FloatingParticle style={styles.particle2} size={8} duration={3500} delay={500} color={theme.colors.accent} />
      <FloatingParticle style={styles.particle3} size={12} duration={4500} delay={1000} color={theme.colors.primary} />
      <FloatingParticle style={styles.particle4} size={7} duration={4200} delay={1500} color={theme.colors.secondary} />
      <FloatingParticle style={styles.particle5} size={9} duration={3800} delay={2000} color={theme.colors.primaryLight} />

      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
        pointerEvents="box-none"
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={theme.gradients.primary}
            style={styles.logoContainer}
          >
            <Ionicons name="fitness" size={60} color="#ffffff" />
          </LinearGradient>
          
          <NeonText style={styles.mainTitle} color="primary">
            Diabetes Health
          </NeonText>
          <NeonText style={styles.subTitle} color="secondary">
            Companion
          </NeonText>
          
          <Text style={[styles.tagline, { color: theme.colors.text.secondary }]}>
            Your personalized health tracking and wellness platform
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <GlassCard key={index} style={styles.featureCard} variant="medium">
              <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '20' }]}>
                <Ionicons name={feature.icon} size={28} color={feature.color} />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={[styles.featureTitle, { color: theme.colors.text.primary }]}>
                  {feature.title}
                </Text>
                <Text style={[styles.featureDescription, { color: theme.colors.text.secondary }]}>
                  {feature.description}
                </Text>
              </View>
            </GlassCard>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {console.log('Rendering action buttons')}
          <PremiumButton
            onPress={() => {
              console.log('Sign In button pressed - navigating to Login');
              navigation.navigate('Login');
            }}
            variant="primary"
            size="large"
            style={styles.primaryButton}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="log-in" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Sign In</Text>
            </View>
          </PremiumButton>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: theme.colors.secondary }]}
            onPress={() => {
              console.log('Create Account button pressed - navigating to Signup');
              navigation.navigate('Signup');
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.6)', 'rgba(255,255,255,0.3)']}
              style={styles.secondaryGradient}
            >
              <Ionicons name="person-add" size={20} color={theme.colors.secondary} />
              <Text style={[styles.secondaryButtonText, { color: theme.colors.secondary }]}>
                Create Account
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {console.log('Action buttons rendered')}
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight + 60 || 80),
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 40,
    justifyContent: 'space-between',
  },
  // Particles
  particle1: {
    top: '8%',
    left: '5%',
  },
  particle2: {
    top: '25%',
    right: '8%',
  },
  particle3: {
    top: '48%',
    left: '12%',
  },
  particle4: {
    top: '68%',
    right: '15%',
  },
  particle5: {
    top: '88%',
    left: '20%',
  },
  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.3)',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  // Features
  featuresContainer: {
    gap: 16,
    marginBottom: 30,
  },
  featureCard: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  // Action Buttons
  actionContainer: {
    gap: 16,
  },
  primaryButton: {
    marginBottom: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
  secondaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
  },
  secondaryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default WelcomeScreen;