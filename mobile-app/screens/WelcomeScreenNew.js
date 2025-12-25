import React, { useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
  Text,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

const { width, height } = Dimensions.get('window');

const WelcomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const features = [
    {
      icon: 'pulse-outline',
      title: 'Track Health',
      description: 'Monitor your diabetes symptoms and track progress daily',
      color: theme.colors.primary,
    },
    {
      icon: 'analytics-outline',
      title: 'Smart Insights',
      description: 'Get AI-powered analysis and personalized recommendations',
      color: theme.colors.info,
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Secure Data',
      description: 'Your health information is encrypted and protected',
      color: theme.colors.success,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      {/* Clean Gradient Background */}
      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          {/* Logo/Brand Section */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb', '#1e40af']}
              style={styles.logoGradientCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.logoRingOuter}>
                <View style={styles.logoRingInner}>
                  <View style={styles.logoCircle}>
                    <Ionicons name="medical" size={40} color="#ffffff" />
                  </View>
                </View>
              </View>
            </LinearGradient>
            
            <Text style={styles.title}>
              Diavise
            </Text>
            <View style={styles.subtitleBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#10b981" />
              <Text style={styles.subtitle}>
                Your Trusted Health Companion
              </Text>
            </View>
            
            {/* Stats Pills */}
            <View style={styles.statsRow}>
              <View style={styles.statPill}>
                <Ionicons name="people" size={14} color="#3b82f6" />
                <Text style={styles.statText}>10k+ Users</Text>
              </View>
              <View style={styles.statPill}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.statText}>4.8 Rating</Text>
              </View>
              <View style={styles.statPill}>
                <Ionicons name="shield-checkmark" size={14} color="#10b981" />
                <Text style={styles.statText}>Secure</Text>
              </View>
            </View>
          </View>

          {/* Feature Cards */}
          <View style={styles.featuresContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Why Choose Diavise?</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>Premium</Text>
              </View>
            </View>
            
            {features.map((feature, index) => (
              <View 
                key={index} 
                style={styles.featureCard}
              >
                <View style={[styles.featureIconContainer, { backgroundColor: `${feature.color}15` }]}>
                  <Ionicons name={feature.icon} size={22} color={feature.color} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>
                    {feature.title}
                  </Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA Buttons */}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                console.log('Get Started pressed');
                navigation.navigate('Signup');
              }}
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                style={styles.primaryButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.primaryButtonText}>Get Started</Text>
                <Ionicons name="arrow-forward" size={20} color="#ffffff" />
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                console.log('Sign In pressed');
                navigation.navigate('Login');
              }}
              style={styles.signInButton}
            >
              <View style={styles.outlineButton}>
                <Text style={styles.outlineButtonText}>Already have an account?</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.text.secondary }]}>
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 40,
    paddingBottom: Platform.OS === 'ios' ? 30 : 30,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  
  // Logo Section
  logoContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoGradientCard: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoRingInner: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -1,
  },
  subtitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b98115',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 4,
  },
  
  // Features Section
  featuresContainer: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionBadge: {
    backgroundColor: '#f59e0b15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f59e0b30',
  },
  sectionBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f59e0b',
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 3,
  },
  featureDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  
  // Buttons
  buttonsContainer: {
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginRight: 8,
  },
  signInButton: {
    marginTop: 12,
  },
  outlineButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  outlineButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 12,
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
    color: '#94a3b8',
    lineHeight: 16,
  },
});

export default WelcomeScreen;
