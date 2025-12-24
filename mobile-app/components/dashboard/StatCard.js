import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../ui/Card';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * StatCard component matching web app StatWidget design
 */
const StatCard = ({ title, value, caption, icon, color = 'primary', onPress }) => {
  const { theme } = useTheme();
  
  const getColor = () => {
    switch (color) {
      case 'primary': return theme.colors.primary;
      case 'secondary': return theme.colors.secondary;
      case 'success': return theme.colors.success;
      case 'warning': return theme.colors.warning;
      case 'error': return theme.colors.error;
      case 'info': return theme.colors.info;
      default: return theme.colors.primary;
    }
  };

  const mainColor = getColor();

  return (
    <Card elevation="sm" style={styles.card}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.secondary }]} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.iconContainer, { backgroundColor: `${mainColor}15`, borderColor: `${mainColor}30` }]}>
          {icon || <Ionicons name="trending-up" size={20} color={mainColor} />}
        </View>
      </View>
      
      <Text style={[styles.value, { color: theme.colors.text.primary }]} numberOfLines={1}>
        {value}
      </Text>
      
      {caption && (
        <Text style={[styles.caption, { color: theme.colors.text.secondary }]} numberOfLines={2}>
          {caption}
        </Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 110,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    flex: 1,
    marginRight: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    flexShrink: 0,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 32,
    numberOfLines: 1,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    numberOfLines: 2,
  },
});

export default StatCard;
