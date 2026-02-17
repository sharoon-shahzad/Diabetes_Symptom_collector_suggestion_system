/**
 * Exercise Plan Landing Screen
 * Lists existing exercise plans and allows generating new ones.
 * No emojis — MaterialCommunityIcons only
 */

import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useGetExercisePlansQuery } from '@features/exercise/exercisePlanApi';
import { ExercisePlanCard } from '@components/health/ExercisePlanCard';
import { FullScreenLoader } from '@components/common/FullScreenLoader';
import { ErrorState } from '@components/common/ErrorState';
import { EmptyState } from '@components/common/EmptyState';
import { spacing, borderRadius, shadows } from '@theme/spacing';
import colors from '@theme/colors';

export default function ExercisePlanScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useGetExercisePlansQuery();

  if (isLoading) return <FullScreenLoader />;
  if (isError) return <ErrorState onRetry={refetch} error="Failed to load exercise plans. Please check your connection and try again." />;

  const plans = data?.data || [];
  const latestGoal = plans.length > 0 && plans[0].goal
    ? plans[0].goal.replace(/_/g, ' ')
    : '--';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <FlatList
        data={plans}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ExercisePlanCard
            plan={item}
            onPress={() => router.push(`/personalized/exercise-plan/${item._id}`)}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FFF" />}
        ListHeaderComponent={() => (
          <View style={styles.listHeader}>
            {/* Hero Header */}
            <LinearGradient
              colors={['#4A6078', '#384D60']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroTop}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                  <MaterialCommunityIcons name="arrow-left" size={20} color="#FFF" />
                </TouchableOpacity>
                <View style={styles.heroIconWrap}>
                  <MaterialCommunityIcons name="run" size={24} color="rgba(255,255,255,0.9)" />
                </View>
              </View>
              <Text style={styles.heroTitle}>Exercise Plans</Text>
              <Text style={styles.heroSubtitle}>Stay active with tailored workout routines</Text>
              <View style={styles.heroStatsRow}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{plans.length}</Text>
                  <Text style={styles.heroStatLabel}>Total Plans</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue} numberOfLines={1}>{latestGoal}</Text>
                  <Text style={styles.heroStatLabel}>Latest Goal</Text>
                </View>
                <View style={styles.heroStatDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{plans.length > 0 ? 'Active' : 'None'}</Text>
                  <Text style={styles.heroStatLabel}>Status</Text>
                </View>
              </View>
            </LinearGradient>

            {/* Generate button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/personalized/exercise-plan/generate')}
            >
              <LinearGradient
                colors={['#4A6078', '#5A7088']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.generateBtn}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={20} color="#FFF" />
                <Text style={styles.generateText}>Generate New Exercise Plan</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Section header */}
            {plans.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Plans</Text>
                <View style={styles.sectionLine} />
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            icon="weight-lifter"
            title="No Exercise Plans Yet"
            message="Generate your first personalized exercise plan to get started."
            onCtaPress={() => router.push('/personalized/exercise-plan/generate')}
            ctaLabel="Generate Plan"
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  list: {
    padding: spacing[4],
    paddingBottom: spacing[8],
  },
  listHeader: {
    marginBottom: spacing[4],
  },

  /* Hero */
  heroCard: {
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    marginBottom: spacing[4],
    ...shadows.md,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
    marginTop: 2,
    marginBottom: spacing[4],
  },
  heroStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 2,
  },

  /* Generate */
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    gap: 8,
    marginBottom: spacing[4],
  },
  generateText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* Section */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.neutral[100],
  },
});
