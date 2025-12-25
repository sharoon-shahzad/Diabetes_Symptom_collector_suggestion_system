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

const DietPlanScreen = () => {
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
      const response = await api.get(`/diet-plan/date/${today}`);
      if (response.data.plan) {
        setSelectedPlan(response.data.plan);
      }
    } catch (err) {
      // 404 is expected when no plan exists yet - not an error
      if (err.response?.status !== 404) {
        console.error('Error fetching diet plan:', err);
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
      const response = await api.post('/diet-plan/generate', {
        target_date: today,
      });
      if (response.data.success) {
        setSelectedPlan(response.data.plan);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate diet plan');
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
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Diet Plan</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              AI-powered meal plans based on regional guidelines
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
              <Ionicons name="restaurant-outline" size={64} color={theme.colors.primary} style={styles.emptyIcon} />
              <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
                No Diet Plan for Today
              </Text>
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                Generate a personalized diet plan based on your profile and regional guidelines
              </Text>
              <Button
                title={generating ? 'Generating...' : 'Generate Diet Plan'}
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

            {/* Nutritional Summary */}
            {selectedPlan.nutritional_totals && (
              <Card style={styles.summaryCard}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                  Nutritional Summary
                </Text>
                <View style={styles.nutritionGrid}>
                  <View style={styles.nutritionItem}>
                    <Text style={[styles.nutritionLabel, { color: theme.colors.text.secondary }]}>
                      Calories
                    </Text>
                    <Text style={[styles.nutritionValue, { color: '#f59e0b' }]}>
                      {selectedPlan.nutritional_totals.calories || selectedPlan.total_calories || 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={[styles.nutritionLabel, { color: theme.colors.text.secondary }]}>
                      Protein
                    </Text>
                    <Text style={[styles.nutritionValue, { color: '#10b981' }]}>
                      {selectedPlan.nutritional_totals.protein ? `${selectedPlan.nutritional_totals.protein}g` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={[styles.nutritionLabel, { color: theme.colors.text.secondary }]}>
                      Carbs
                    </Text>
                    <Text style={[styles.nutritionValue, { color: '#3b82f6' }]}>
                      {selectedPlan.nutritional_totals.carbs ? `${selectedPlan.nutritional_totals.carbs}g` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.nutritionItem}>
                    <Text style={[styles.nutritionLabel, { color: theme.colors.text.secondary }]}>
                      Fats
                    </Text>
                    <Text style={[styles.nutritionValue, { color: '#ef4444' }]}>
                      {selectedPlan.nutritional_totals.fat ? `${selectedPlan.nutritional_totals.fat}g` : 'N/A'}
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Meals */}
            {selectedPlan.meals && selectedPlan.meals.length > 0 && (
              <View>
                <Text style={[styles.mealsTitle, { color: theme.colors.text.primary }]}>Today's Meals</Text>
                {selectedPlan.meals.map((meal, index) => (
                  <Card key={index} style={styles.mealCard}>
                    <View style={styles.mealHeader}>
                      <Text style={[styles.mealTime, { color: theme.colors.primary }]}>
                        {meal.name || `Meal ${index + 1}`}
                      </Text>
                      {meal.timing && (
                        <Text style={[styles.mealTimeLabel, { color: theme.colors.text.secondary }]}>
                          {meal.timing}
                        </Text>
                      )}
                    </View>
                    {meal.total_calories && (
                      <Text style={[styles.mealCalories, { color: theme.colors.text.secondary }]}>
                        {meal.total_calories} calories
                      </Text>
                    )}
                    {meal.items && meal.items.length > 0 && (
                      <View style={styles.itemsSection}>
                        <Text style={[styles.itemsTitle, { color: theme.colors.text.primary }]}>
                          Food Items:
                        </Text>
                        {meal.items.map((item, idx) => (
                          <View key={idx} style={styles.foodItem}>
                            <Text style={[styles.foodName, { color: theme.colors.text.primary }]}>
                              • {item.food}
                            </Text>
                            <Text style={[styles.foodPortion, { color: theme.colors.text.secondary }]}>
                              {item.portion} {item.calories ? `(${item.calories} cal)` : ''}
                            </Text>
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
                  Dietary Tips
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
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  nutritionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  mealsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  mealCard: {
    marginBottom: 16,
    padding: 16,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTime: {
    fontSize: 16,
    fontWeight: '700',
  },
  mealTimeLabel: {
    fontSize: 14,
  },
  mealCalories: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 12,
  },
  itemsSection: {
    marginTop: 8,
  },
  itemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  foodItem: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  foodPortion: {
    fontSize: 13,
    marginLeft: 12,
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

export default DietPlanScreen;
