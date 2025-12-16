import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../ui/Card';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ActivityTimeline component matching web app design
 */
const ActivityTimeline = ({ activities = [] }) => {
  const { theme } = useTheme();

  const getIconName = (type) => {
    switch (type) {
      case 'Details': return 'document-text';
      case 'Disease': return 'medical';
      case 'Assessment': return 'analytics';
      default: return 'checkmark-circle';
    }
  };

  const getColor = (color) => {
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

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!activities || activities.length === 0) {
    return (
      <Card elevation="sm" style={styles.card}>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Activity Timeline
        </Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={40} color={theme.colors.text.hint} />
          <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
            No recent activity
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card elevation="sm" style={styles.card}>
      <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
        Activity Timeline
      </Text>
      
      <View style={styles.timeline}>
        {activities.map((activity, index) => {
          const iconColor = getColor(activity.color || 'primary');
          
          return (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View style={[styles.iconCircle, { backgroundColor: `${iconColor}15`, borderColor: `${iconColor}30` }]}>
                  <Ionicons name={getIconName(activity.type)} size={16} color={iconColor} />
                </View>
                {index < activities.length - 1 && (
                  <View style={[styles.timelineLine, { backgroundColor: theme.colors.border }]} />
                )}
              </View>
              
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: theme.colors.text.primary }]} numberOfLines={2}>
                  {activity.title}
                </Text>
                <Text style={[styles.timelineDescription, { color: theme.colors.text.secondary }]} numberOfLines={2}>
                  {activity.description}
                </Text>
                <Text style={[styles.timelineTime, { color: theme.colors.text.hint }]}>
                  {formatTime(activity.time)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },
  timeline: {
    paddingLeft: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: 4,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 13,
    marginBottom: 4,
    lineHeight: 18,
  },
  timelineTime: {
    fontSize: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
});

export default ActivityTimeline;
