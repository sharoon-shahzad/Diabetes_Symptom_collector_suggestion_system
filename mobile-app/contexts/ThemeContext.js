import React, { createContext, useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Futuristic Premium Theme Configuration - Matching Web App Exactly
const lightTheme = {
  colors: {
    // Primary colors matching web app exactly
    primary: '#2563eb',
    primaryLight: '#60a5fa',
    primaryDark: '#1e40af',
    primaryGlow: 'rgba(37, 99, 235, 0.3)',
    
    // Secondary colors
    secondary: '#64748b',
    secondaryLight: '#94a3b8',
    secondaryDark: '#475569',

    // Background system matching web
    background: '#f7f7fb',
    backgroundGradient: ['#f8fafc', '#f1f5f9'],
    backgroundPaper: '#ffffff',
    
    // Surface variants
    surface: '#ffffff',
    surfaceGlass: 'rgba(255, 255, 255, 0.7)',
    surfaceGlassLight: 'rgba(255, 255, 255, 0.4)',
    surfaceGlassDark: 'rgba(255, 255, 255, 0.9)',
    
    // Card system
    card: '#ffffff',
    cardGlass: 'rgba(255, 255, 255, 0.25)',
    cardElevated: 'rgba(255, 255, 255, 0.95)',

    // Text hierarchy matching web
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      disabled: '#999999',
      hint: '#666666',
      inverse: '#ffffff',
    },

    // Borders & Dividers
    border: '#e0e0e0',
    borderLight: 'rgba(255, 255, 255, 0.3)',
    borderGlass: 'rgba(255, 255, 255, 0.18)',
    divider: '#e0e0e0',

    // Status colors matching web
    success: '#4caf50',
    successLight: '#81c784',
    successDark: '#388e3c',
    
    warning: '#ff9800',
    warningLight: '#ffb74d',
    warningDark: '#f57c00',
    
    error: '#f44336',
    errorLight: '#e57373',
    errorDark: '#d32f2f',
    
    info: '#2196f3',
    infoLight: '#64b5f6',
    infoDark: '#1976d2',

    // Premium accents
    accent: '#00d4ff',
    accentGlow: 'rgba(0, 212, 255, 0.4)',
    neon: '#00ffff',
    glow: 'rgba(37, 99, 235, 0.25)',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.1)',
    shadowDark: 'rgba(0, 0, 0, 0.15)',
    shadowLight: 'rgba(0, 0, 0, 0.05)',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.4)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
  },

  gradients: {
    // Primary gradients
    primary: ['#1976d2', '#42a5f5'],
    primaryVertical: ['#1976d2', '#1565c0'],
    primaryGlow: ['rgba(25, 118, 210, 0.8)', 'rgba(66, 165, 245, 0.4)'],
    
    // Secondary gradients
    secondary: ['#dc004e', '#ff5983'],
    secondaryVertical: ['#dc004e', '#9a0036'],
    
    // Background gradients
    background: ['#f5f7fa', '#c3cfe2'],
    backgroundVertical: ['#f5f7fa', '#e8eef5'],
    backgroundSubtle: ['#fafbfc', '#f0f4f8'],
    
    // Card gradients with glassmorphism
    card: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.15)'],
    cardElevated: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.95)'],
    glass: ['rgba(255, 255, 255, 0.25)', 'rgba(255, 255, 255, 0.1)'],
    glassStrong: ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.2)'],
    
    // Accent gradients
    accent: ['#00d4ff', '#1976d2'],
    accentVertical: ['#00d4ff', '#00a0d4'],
    neon: ['#00ffff', '#00d4ff'],
    
    // Status gradients
    success: ['#4caf50', '#81c784'],
    warning: ['#ff9800', '#ffb74d'],
    error: ['#f44336', '#e57373'],
    info: ['#2196f3', '#64b5f6'],
    
    // Special effects
    shimmer: ['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent'],
    glow: ['rgba(25, 118, 210, 0.0)', 'rgba(25, 118, 210, 0.3)', 'rgba(25, 118, 210, 0.0)'],
  },

  typography: {
    fontFamily: Platform.select({
      ios: 'System',
      android: 'Roboto',
      default: 'System',
    }),
    fontSize: {
      xs: 11,
      sm: 13,
      md: 15,
      base: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 28,
      huge: 32,
      display: 40,
    },
    fontWeight: {
      thin: '200',
      light: '300',
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      heavy: '800',
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
      loose: 2,
    },
  },

  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    xxxl: 48,
    huge: 64,
  },

  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    full: 9999,
  },

  elevation: {
    none: 0,
    low: 2,
    medium: 4,
    high: 8,
    higher: 12,
    highest: 16,
  },

  // Neumorphism effects
  neumorphism: {
    light: {
      shadowColor: '#ffffff',
      shadowOffset: { width: -6, height: -6 },
      shadowOpacity: 0.9,
      shadowRadius: 12,
      elevation: 8,
      backgroundColor: '#f5f7fa',
    },
    dark: {
      shadowColor: '#000000',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
      backgroundColor: '#f5f7fa',
    },
    inset: {
      shadowColor: '#c3cfe2',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 4,
      backgroundColor: '#e8eef5',
    },
  },

  // Glassmorphism effects (updated for better visibility without blur)
  glassmorphism: {
    subtle: {
      backgroundColor: 'rgba(255, 255, 255, 0.75)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.9)',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    medium: {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.95)',
      shadowColor: 'rgba(0, 0, 0, 0.1)',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 12,
    },
    strong: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 1)',
      shadowColor: 'rgba(0, 0, 0, 0.12)',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.3,
      shadowRadius: 24,
      elevation: 16,
    },
    premium: {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.85)',
      shadowColor: 'rgba(25, 118, 210, 0.3)',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.4,
      shadowRadius: 32,
      elevation: 20,
    },
  },

  animations: {
    duration: {
      instant: 100,
      fast: 200,
      normal: 300,
      medium: 400,
      slow: 500,
      slower: 700,
      slowest: 1000,
    },
    timing: {
      easeInOut: [0.4, 0.0, 0.2, 1],
      easeOut: [0.0, 0.0, 0.2, 1],
      easeIn: [0.4, 0.0, 1, 1],
      sharp: [0.4, 0.0, 0.6, 1],
    },
  },
};

// Dark theme extending light theme
const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    // Primary colors matching web dark theme
    primary: '#90caf9',
    primaryLight: '#e3f2fd',
    primaryDark: '#42a5f5',
    
    // Secondary colors
    secondary: '#f48fb1',
    secondaryLight: '#f8bbd9',
    secondaryDark: '#ec407a',

    // Dark backgrounds matching web
    background: '#0a0a0a',
    backgroundGradient: ['#0b1220', '#0a0a0a'],
    backgroundPaper: '#1a1a1a',
    
    // Surface variants
    surface: '#1a1a1a',
    surfaceGlass: 'rgba(26, 26, 26, 0.7)',
    surfaceGlassLight: 'rgba(26, 26, 26, 0.4)',
    surfaceGlassDark: 'rgba(26, 26, 26, 0.9)',
    
    // Card system
    card: '#1e1e1e',
    cardGlass: 'rgba(30, 30, 30, 0.25)',
    cardElevated: 'rgba(30, 30, 30, 0.95)',

    // Text hierarchy matching web dark
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#666666',
      hint: '#b0b0b0',
      inverse: '#0a0a0a',
    },

    // Borders & Dividers
    border: '#333333',
    borderLight: 'rgba(51, 51, 51, 0.3)',
    borderGlass: 'rgba(51, 51, 51, 0.18)',
    divider: '#333333',

    // Status colors matching web dark
    success: '#66bb6a',
    successLight: '#98ee99',
    successDark: '#388e3c',
    
    warning: '#ffa726',
    warningLight: '#ffd54f',
    warningDark: '#f57c00',
    
    error: '#f44336',
    errorLight: '#e57373',
    errorDark: '#d32f2f',
    
    info: '#29b6f6',
    infoLight: '#73e8ff',
    infoDark: '#0288d1',

    // Premium accents
    accent: '#00d4ff',
    accentGlow: 'rgba(0, 212, 255, 0.4)',
    neon: '#00ffff',
    glow: 'rgba(144, 202, 249, 0.25)',
    
    // Shadows
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowDark: 'rgba(0, 0, 0, 0.4)',
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    
    // Overlay
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayLight: 'rgba(0, 0, 0, 0.4)',
  },
    background: '#0a0a0a',
    backgroundGradient: ['#23272f', '#0B1120'],
    backgroundPaper: '#1a1a1a',
    
    // Dark surfaces
    surface: '#1a1a1a',
    surfaceGlass: 'rgba(30, 30, 30, 0.7)',
    surfaceGlassLight: 'rgba(30, 30, 30, 0.4)',
    surfaceGlassDark: 'rgba(30, 30, 30, 0.9)',
    
    // Dark cards
    card: '#1e1e1e',
    cardGlass: 'rgba(30, 30, 30, 0.25)',
    cardElevated: 'rgba(30, 30, 30, 0.95)',

    // Dark text
    text: {
      primary: '#ffffff',
      secondary: '#b0b0b0',
      disabled: '#666666',
      hint: '#888888',
      inverse: '#1a1a1a',
    },

    // Dark borders
    border: '#333333',
    borderLight: 'rgba(255, 255, 255, 0.1)',
    borderGlass: 'rgba(255, 255, 255, 0.08)',
    divider: '#2a2a2a',

    // Shadows for dark mode
    shadow: 'rgba(0, 0, 0, 0.4)',
    shadowDark: 'rgba(0, 0, 0, 0.6)',
    shadowLight: 'rgba(0, 0, 0, 0.2)',
    
    glow: 'rgba(66, 165, 245, 0.3)',
};


export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const theme = isDarkMode ? darkTheme : lightTheme;

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {children}
      </LinearGradient>
    </ThemeContext.Provider>
  );
};

// ========== PREMIUM STYLED COMPONENTS ==========

// Glass Card with semi-transparent background (blur removed)
const GlassCard = ({ children, style, variant = 'medium', elevated = false, ...props }) => {
  const { theme } = useTheme();
  const glassStyle = theme.glassmorphism[variant] || theme.glassmorphism.medium;

  return (
    <View
      style={[styles.glassCard, glassStyle, style]}
      {...props}
    >
      {children}
    </View>
  );
};

// Neumorphic Card with depth
const NeumorphicCard = ({ children, style, variant = 'light', ...props }) => {
  const { theme } = useTheme();
  const neuStyle = theme.neumorphism[variant];

  return (
    <View style={[styles.neumorphicCard, neuStyle, style]} {...props}>
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0)']}
        style={styles.neumorphicHighlight}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      {children}
    </View>
  );
};

// Premium Button with animations
const PremiumButton = ({
  children,
  onPress,
  variant = 'primary',
  size = 'medium',
  style,
  disabled = false,
  ...props
}) => {
  const { theme } = useTheme();
  const [scaleAnim] = useState(new Animated.Value(1));
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const gradientColors = theme.gradients[variant] || theme.gradients.primary;
  
  const buttonSizes = {
    small: { paddingVertical: 10, paddingHorizontal: 20, minHeight: 40, fontSize: 14 },
    medium: { paddingVertical: 14, paddingHorizontal: 28, minHeight: 52, fontSize: 16 },
    large: { paddingVertical: 18, paddingHorizontal: 36, minHeight: 60, fontSize: 18 },
  };

  const sizeStyle = buttonSizes[size] || buttonSizes.medium;

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[styles.premiumButton, style]}
      activeOpacity={0.85}
      {...props}
    >
      <Animated.View 
        style={{ 
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <LinearGradient
          colors={disabled ? ['#cccccc', '#999999'] : gradientColors}
          style={[styles.premiumButtonInner, sizeStyle]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View
            style={[
              styles.glowEffect,
              {
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.7],
                }),
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.4)', 'transparent']}
              style={styles.buttonHighlight}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </Animated.View>
          {children}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Neon Text with glow effect
const NeonText = ({ 
  children, 
  style, 
  color = 'primary', 
  glow = true,
  animated = false,
  ...props 
}) => {
  const { theme } = useTheme();
  const [glowAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [animated]);

  // Handle nested color paths like 'text.primary'
  const getColorValue = (colorPath) => {
    const parts = colorPath.split('.');
    let value = theme.colors;
    for (const part of parts) {
      value = value?.[part];
    }
    return value || theme.colors.primary;
  };

  const textColor = getColorValue(color);
  
  const glowRadius = animated
    ? glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [8, 16],
      })
    : 10;

  const TextComponent = animated ? Animated.Text : Text;

  return (
    <TextComponent
      style={[
        styles.neonText,
        {
          color: textColor,
          textShadowColor: glow ? textColor : 'transparent',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: animated ? glowRadius : (glow ? 12 : 0),
        },
        style,
      ]}
      {...props}
    >
      {children}
    </TextComponent>
  );
};

// Floating Particle Animation
const FloatingParticle = ({ 
  size = 6, 
  color,
  style, 
  duration = 3000,
  delay = 0,
  ...props 
}) => {
  const { theme } = useTheme();
  const [position] = useState(new Animated.Value(0));
  const [opacity] = useState(new Animated.Value(0));
  const [scale] = useState(new Animated.Value(1));

  useEffect(() => {
    const animate = () => {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(position, {
              toValue: -30,
              duration: duration,
              useNativeDriver: true,
            }),
            Animated.timing(position, {
              toValue: 0,
              duration: duration,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 0.7,
              duration: duration / 2,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.2,
              duration: duration / 2,
              useNativeDriver: true,
            }),
          ])
        ),
        Animated.loop(
          Animated.sequence([
            Animated.timing(scale, {
              toValue: 1.3,
              duration: duration * 0.7,
              useNativeDriver: true,
            }),
            Animated.timing(scale, {
              toValue: 1,
              duration: duration * 0.7,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    };
    animate();
  }, []);

  const particleColor = color || theme.colors.primaryLight;

  return (
    <Animated.View
      style={[
        styles.floatingParticle,
        {
          width: size,
          height: size,
          backgroundColor: particleColor,
          opacity,
          transform: [
            { translateY: position },
            { scale },
          ],
        },
        style,
      ]}
      {...props}
    />
  );
};

// Animated Card with entrance animation
const AnimatedCard = ({ children, delay = 0, style, ...props }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={[
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// Progress Bar with gradient
const GradientProgress = ({ 
  progress = 0, 
  height = 8, 
  style,
  colors,
  showPercentage = false,
}) => {
  const { theme } = useTheme();
  const [width] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.spring(width, {
      toValue: progress * 100,
      friction: 5,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const gradientColors = colors || theme.gradients.primary;

  return (
    <View style={[styles.progressContainer, { height }, style]}>
      <View style={styles.progressTrack}>
        <Animated.View style={{ width: width.interpolate({
          inputRange: [0, 100],
          outputRange: ['0%', '100%'],
        }) }}>
          <LinearGradient
            colors={gradientColors}
            style={[styles.progressBar, { height }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>
      {showPercentage && (
        <NeonText style={styles.progressText} color="primary">
          {Math.round(progress * 100)}%
        </NeonText>
      )}
    </View>
  );
};

// Shimmer Loading Effect
export const ShimmerLoader = ({ width = '100%', height = 20, style }) => {
  const { theme } = useTheme();
  const [shimmerAnim] = useState(new Animated.Value(0));

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
    <View style={[styles.shimmerContainer, { width, height }, style]}>
      <Animated.View style={{ transform: [{ translateX }] }}>
        <LinearGradient
          colors={theme.gradients.shimmer}
          style={styles.shimmer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: 24,
    padding: 20,
    margin: 8,
    overflow: 'hidden',
  },
  glassCardInner: {
    flex: 1,
  },
  neumorphicCard: {
    borderRadius: 24,
    padding: 20,
    margin: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  neumorphicHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  floatingParticle: {
    borderRadius: 9999,
    position: 'absolute',
  },
  premiumButton: {
    borderRadius: 16,
    overflow: 'hidden',
    margin: 4,
  },
  premiumButtonInner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  glowEffect: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  neonText: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressTrack: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  progressBar: {
    borderRadius: 9999,
  },
  progressText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '700',
  },
  shimmerContainer: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  shimmer: {
    width: 300,
    height: '100%',
  },
});

export {
  GlassCard,
  NeumorphicCard,
  PremiumButton,
  NeonText,
  FloatingParticle,
  AnimatedCard,
  GradientProgress,
};