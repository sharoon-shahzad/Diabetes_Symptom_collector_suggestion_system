import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';

/**
 * QuickActions component matching web app design
 * Floating action buttons for key tasks
 */
const QuickActions = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const actions = [
    {
      icon: 'add-circle',
      label: 'Assessment',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('Assessment'),
    },
    {
      icon: 'clipboard',
      label: 'Onboarding',
      color: theme.colors.info,
      onPress: () => navigation.navigate('Onboarding'),
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.actionButton,
            { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            }
          ]}
          onPress={action.onPress}
          activeOpacity={0.7}
        >
          <Ionicons name={action.icon} size={20} color={action.color} />
          <Text style={[styles.actionLabel, { color: theme.colors.text.primary }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default QuickActions;
