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

const ExercisePlanScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTodaysPlan();
  }, []);

  const fetchTodaysPlan = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/exercise-plan/date/${today}`);
      if (response.data.plan) {
        setSelectedPlan(response.data.plan);
      }
    } catch (err) {
      // 404 is expected when no plan exists yet - not an error
      if (err.response?.status !== 404) {
        console.error('Error fetching exercise plan:', err);
      }
      setSelectedPlan(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleGeneratePlan = async () => {
    setGenerating(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.post('/exercise-plan/generate', {
        target_date: today,
      });
      if (response.data.success) {
        setSelectedPlan(response.data.plan);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate exercise plan');
    } finally {
      setGenerating(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodaysPlan();
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
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Exercise Plan</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Customized fitness routines and workouts
            </Text>
          </View>
        </View>

        {error && (
          <Card style={[styles.errorCard, { backgroundColor: '#fee2e2' }]}>
            <Text style={{ color: '#991b1b' }}>{error}</Text>
          </Card>
        )}

        {!selectedPlan ? (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyContent}>
              <Ionicons name="fitness-outline" size={64} color={theme.colors.primary} style={styles.emptyIcon} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
                No Exercise Plan for Today
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                Generate a personalized exercise plan based on your fitness level and goals
              </Text>
              <Button
                title={generating ? 'Generating...' : 'Generate Exercise Plan'}
                onPress={handleGeneratePlan}
                disabled={generating}
                style={styles.generateButton}
              />
            </View>
          </Card>
        ) : (
          <View>
            {/* Plan Header */}
            <Card style={styles.planHeader}>
              <View style={styles.planHeaderContent}>
                <View>
                  <Text style={[styles.planDate, { color: theme.colors.text.primary }]}>
                    {new Date(selectedPlan.target_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  <Text style={[styles.planRegion, { color: theme.colors.text.secondary }]}>
                    Region: {selectedPlan.region || 'Global'}
                  </Text>
                </View>
              </View>
            </Card>

            {/* Plan Summary */}
            {selectedPlan.summary && (
              <Card style={styles.summaryCard}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  Workout Summary
                </Text>
                <Text style={[styles.summaryText, { color: theme.colors.text.secondary }]}>
                  {selectedPlan.summary}
                </Text>
              </Card>
            )}

            {/* Exercises */}
            {selectedPlan.sessions && selectedPlan.sessions.length > 0 && (
              <View>
                <Text style={[styles.exercisesTitle, { color: theme.colors.text.primary }]}>
                  Today's Workout Sessions
                </Text>
                {selectedPlan.sessions.map((session, sessionIndex) => (
                  <Card key={sessionIndex} style={styles.sessionCard}>
                    <View style={styles.sessionHeader}>
                      <Text style={[styles.sessionName, { color: theme.colors.primary }]}>
                        {session.name}
                      </Text>
                      {session.time && (
                        <Text style={[styles.sessionTime, { color: theme.colors.text.secondary }]}>
                          {session.time}
                        </Text>
                      )}
                    </View>
                    {session.total_duration_min && (
                      <Text style={[styles.sessionDuration, { color: theme.colors.text.secondary }]}>
                        {session.total_duration_min} minutes • {session.total_estimated_calories || 0} calories
                      </Text>
                    )}
                    {session.items && session.items.length > 0 && (
                      <View style={styles.exercisesList}>
                        {session.items.map((exercise, exIndex) => (
                          <View key={exIndex} style={styles.exerciseItem}>
                            <View style={styles.exerciseItemHeader}>
                              <Text style={[styles.exerciseName, { color: theme.colors.text.primary }]}>
                                • {exercise.exercise}
                              </Text>
                              {exercise.category && (
                                <View style={[styles.categoryBadge, { backgroundColor: `${theme.colors.primary}20` }]}>
                                  <Text style={[styles.categoryText, { color: theme.colors.primary }]}>
                                    {exercise.category}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <View style={styles.exerciseDetails}>
                              <View style={styles.detailItem}>
                                <Ionicons name="time-outline" size={14} color={theme.colors.text.secondary} />
                                <Text style={[styles.detailText, { color: theme.colors.text.secondary }]}>
                                  {exercise.duration_min} min
                                </Text>
                              </View>
                              {exercise.intensity && (
                                <View style={styles.detailItem}>
                                  <Text style={[styles.detailText, { color: theme.colors.text.secondary }]}>
                                    Intensity: {exercise.intensity}
                                  </Text>
                                </View>
                              )}
                              {exercise.estimated_calories && (
                                <View style={styles.detailItem}>
                                  <Text style={[styles.detailText, { color: theme.colors.text.secondary }]}>
                                    {exercise.estimated_calories} cal
                                  </Text>
                                </View>
                              )}
                            </View>
                            {exercise.notes && (
                              <Text style={[styles.exerciseNotes, { color: theme.colors.text.secondary }]}>
                                {exercise.notes}
                              </Text>
                            )}
                            {exercise.precautions && exercise.precautions.length > 0 && (
                              <View style={styles.precautionsSection}>
                                <Text style={[styles.precautionsTitle, { color: theme.colors.text.secondary }]}>
                                  Precautions:
                                </Text>
                                {exercise.precautions.map((precaution, pIndex) => (
                                  <Text key={pIndex} style={[styles.precautionItem, { color: theme.colors.text.secondary }]}>
                                    • {precaution}
                                  </Text>
                                ))}
                              </View>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </Card>
                ))}
              </View>
            )}

            {/* Tips */}
            {selectedPlan.tips && selectedPlan.tips.length > 0 && (
              <Card style={styles.notesCard}>
                <Text style={[styles.notesTitle, { color: theme.colors.text.primary }]}>
                  Exercise Tips
                </Text>
                {selectedPlan.tips.map((tip, idx) => (
                  <Text key={idx} style={[styles.tipItem, { color: theme.colors.text.secondary }]}>
                    • {tip}
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
  planHeader: {
    marginBottom: 16,
    padding: 16,
  },
  planHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planDate: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  planRegion: {
    fontSize: 14,
  },
  summaryCard: {
    marginBottom: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  exercisesTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  sessionCard: {
    marginBottom: 16,
    padding: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionName: {
    fontSize: 18,
    fontWeight: '700',
  },
  sessionTime: {
    fontSize: 14,
  },
  sessionDuration: {
    fontSize: 14,
    marginBottom: 12,
  },
  exercisesList: {
    marginTop: 8,
  },
  exerciseItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  exerciseItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  exerciseNotes: {
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  precautionsSection: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#fee2e2',
  },
  precautionsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  precautionItem: {
    fontSize: 12,
    marginLeft: 8,
    lineHeight: 18,
  },
  exerciseDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
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
  tipItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default ExercisePlanScreen;
