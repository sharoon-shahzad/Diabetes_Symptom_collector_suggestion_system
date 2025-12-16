import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, NeonText, FloatingParticle } from '../contexts/ThemeContext';

const SplashScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.3));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Logo animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
        { iterations: 1 }
      ),
    ]).start();

    // Rotate animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Navigate after delay
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Welcome');
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
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
      <FloatingParticle style={styles.particle4} size={7} duration={3800} delay={1500} color={theme.colors.primaryLight} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Animated Logo Container */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [
                { scale: pulseAnim },
                { rotate },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={theme.gradients.primary}
            style={styles.logoGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="fitness" size={80} color="#ffffff" />
          </LinearGradient>
        </Animated.View>

        {/* App Name */}
        <NeonText style={styles.appName} color="primary" animated>
          Diabetes Health
        </NeonText>
        <NeonText style={styles.subtitle} color="text.primary" glow={false}>
          Symptom Tracker & Assessment
        </NeonText>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: pulseAnim,
                backgroundColor: theme.colors.primary,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: pulseAnim,
                backgroundColor: theme.colors.primaryLight,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: pulseAnim,
                backgroundColor: theme.colors.accent,
              },
            ]}
          />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    top: '70%',
    left: '20%',
  },
  particle4: {
    top: '80%',
    right: '25%',
  },
  // Logo
  logoContainer: {
    marginBottom: 30,
  },
  logoGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(25, 118, 210, 0.3)',
  },
  // Text
  appName: {
    fontSize: 34,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 40,
    opacity: 0.8,
  },
  // Loading
  loadingContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default SplashScreen;