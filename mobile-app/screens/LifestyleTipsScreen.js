import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../utils/api';

// Category icon mapping removed - using Ionicons instead

const LifestyleTipsScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTips, setSelectedTips] = useState(null);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCurrentTips();
  }, []);

  const fetchCurrentTips = async () => {
    try {
      const response = await api.get('/lifestyle-tips/current');
      if (response.data.tips) {
        setSelectedTips(response.data.tips);
      }
    } catch (err) {
      // 404 is expected when no tips exist yet - not an error
      if (err.response?.status !== 404) {
        console.error('Error fetching lifestyle tips:', err);
      }
      setSelectedTips(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleGenerateTips = async () => {
    setGenerating(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.post('/lifestyle-tips/generate', {
        target_date: today,
      });
      if (response.data.tips) {
        setSelectedTips(response.data.tips);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate lifestyle tips');
    } finally {
      setGenerating(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchCurrentTips();
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <LinearGradient colors={theme.colors.backgroundGradient} style={StyleSheet.absoluteFillObject} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <LinearGradient colors={theme.colors.backgroundGradient} style={StyleSheet.absoluteFillObject} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Lifestyle Tips</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Daily habits and wellness recommendations
            </Text>
          </View>
        </View>

        {error && (
          <Card style={[styles.errorCard, { backgroundColor: '#fee2e2' }]}>
            <Text style={{ color: '#991b1b' }}>{error}</Text>
          </Card>
        )}

        {!selectedTips ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Ionicons name="bulb-outline" size={64} color={theme.colors.primary} style={styles.emptyIcon} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
                No Lifestyle Tips for Today
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                Generate personalized lifestyle tips based on your health profile
              </Text>
              <Button
                title={generating ? 'Generating...' : 'Generate Lifestyle Tips'}
                onPress={handleGenerateTips}
                disabled={generating}
                style={styles.generateButton}
              />
            </View>
          </Card>
        ) : (
          <View>
            {/* Tips Header */}
            <Card style={styles.tipsHeader}>
              <View style={styles.tipsHeaderContent}>
                <View>
                  <Text style={[styles.tipsDate, { color: theme.colors.text.primary }]}>
                    {new Date(selectedTips.target_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={[styles.tipsRegion, { color: theme.colors.text.secondary }]}>
                    Region: {selectedTips.region || 'Global'}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Tips Overview */}
            {selectedTips.overview && (
              <Card style={styles.overviewCard}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  Overview
                </Text>
                <Text style={[styles.overviewText, { color: theme.colors.text.secondary }]}>
                  {selectedTips.overview}
                </Text>
              </Card>
            )}

            {/* Tips by Category */}
            {selectedTips.categories && selectedTips.categories.length > 0 && (
              <View>
                <Text style={[styles.tipsTitle, { color: theme.colors.text.primary }]}>
                  Today's Tips
                </Text>
                {selectedTips.categories.map((category, catIndex) => (
                  category.tips && category.tips.map((tip, tipIndex) => (
                    <Card key={`${catIndex}-${tipIndex}`} style={styles.tipCard}>
                      <View style={styles.tipHeader}>
                        <View style={[styles.tipIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
                          <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                        </View>
                        <View style={styles.tipHeaderContent}>
                          <Text style={[styles.tipCategory, { color: theme.colors.primary }]}>
                            {category.name
                              ? category.name.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                              : 'General'}
                          </Text>
                          {tip.priority && (
                            <View
                              style={[
                                styles.priorityBadge,
                                {
                                  backgroundColor:
                                    tip.priority === 'high'
                                      ? '#fee2e2'
                                      : tip.priority === 'medium'
                                      ? '#fef3c7'
                                      : '#dbeafe',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.priorityText,
                                  {
                                    color:
                                      tip.priority === 'high'
                                        ? '#991b1b'
                                        : tip.priority === 'medium'
                                        ? '#92400e'
                                        : '#1e40af',
                                  },
                                ]}
                              >
                                {tip.priority}
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Text style={[styles.tipTitle, { color: theme.colors.text.primary }]}>
                        {tip.title}
                      </Text>
                      <Text style={[styles.tipDescription, { color: theme.colors.text.secondary }]}>
                        {tip.description}
                      </Text>
                    </Card>
                  ))
                ))}
              </View>
            )}

            {/* Personalized Insights */}
            {selectedTips.personalized_insights && selectedTips.personalized_insights.length > 0 && (
              <Card style={styles.notesCard}>
                <Text style={[styles.notesTitle, { color: theme.colors.text.primary }]}>
                  Personalized Insights
                </Text>
                {selectedTips.personalized_insights.map((insight, idx) => (
                  <Text key={idx} style={[styles.insightItem, { color: theme.colors.text.secondary }]}>
                    • {insight}
                  </Text>
                ))}
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorCard: {
    marginBottom: 16,
    padding: 12,
  },
  emptyCard: {
    padding: 32,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  generateButton: {
    width: '100%',
  },
  tipsHeader: {
    marginBottom: 16,
    padding: 16,
  },
  tipsHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipsDate: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  tipsRegion: {
    fontSize: 14,
  },
  overviewCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  overviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  tipCard: {
    marginBottom: 16,
    padding: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 12,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipHeaderContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tipCategory: {
    fontSize: 14,
    fontWeight: '700',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  notesCard: {
    marginBottom: 16,
    padding: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },
  insightItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default LifestyleTipsScreen;
