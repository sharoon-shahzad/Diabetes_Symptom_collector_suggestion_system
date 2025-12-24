import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../ui/Card';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ProgressCard component with circular progress indicator
 * Matches web app ProgressDonut design (using pure React Native)
 */
const ProgressCard = ({ percentage, title, subtitle }) => {
  const { theme } = useTheme();
  
  const size = 140;
  const strokeWidth = 12;

  return (
    <Card elevation="sm" style={styles.card}>
      <View style={styles.centerContent}>
        <View style={styles.progressContainer}>
          {/* Background circle */}
          <View
            style={[
              styles.circle,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: theme.colors.border,
              },
            ]}
          />
          
          {/* Progress indicator (simplified with colored overlay) */}
          <View
            style={[
              styles.progressOverlay,
              {
                width: size - strokeWidth * 2,
                height: size - strokeWidth * 2,
                borderRadius: (size - strokeWidth * 2) / 2,
                backgroundColor: percentage > 50 ? `${theme.colors.primary}15` : 'transparent',
              },
            ]}
          >
            {percentage > 75 && (
              <View
                style={[
                  styles.progressHighlight,
                  {
                    borderColor: theme.colors.primary,
                    borderWidth: strokeWidth / 2,
                    borderRadius: (size - strokeWidth * 2) / 2,
                  },
                ]}
              />
            )}
          </View>
          
          <View style={styles.percentageContainer}>
            <Text style={[styles.percentage, { color: theme.colors.text.primary }]}>
              {percentage}%
            </Text>
          </View>
        </View>
        
        <Text style={[styles.title, { color: theme.colors.text.primary }]} numberOfLines={2}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]} numberOfLines={2}>
            {subtitle}
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 24,
  },
  centerContent: {
    alignItems: 'center',
  },
  progressContainer: {
    position: 'relative',
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    backgroundColor: 'transparent',
  },
  progressOverlay: {
    position: 'absolute',
  },
  progressHighlight: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  percentageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 32,
    fontWeight: '700',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default ProgressCard;
