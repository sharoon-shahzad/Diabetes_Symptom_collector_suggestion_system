/**
 * Suggestions Screen
 * Personalized health suggestions hub — diet plans, exercise plans,
 * lifestyle tips, habits tracker, monthly diet, and AI chat.
 * No emojis — MaterialCommunityIcons only
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppSelector } from '@store/hooks';
import { selectUser } from '@features/auth/authSlice';
import { useGetDietPlansQuery } from '@features/diet/dietPlanApi';
import { useGetExercisePlansQuery } from '@features/exercise/exercisePlanApi';
import { useGetCurrentTipsQuery } from '@features/lifestyle/lifestyleTipsApi';
import { useGetCurrentWeeklyHabitsQuery } from '@features/habits/weeklyHabitsApi';
import { Button } from '@components/common/Button';
import { spacing, borderRadius, shadows } from '@theme/spacing';
import colors from '@theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = spacing[3];
const CARD_WIDTH = (SCREEN_WIDTH - spacing[4] * 2 - CARD_GAP) / 2;

interface FeatureItem {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  route: string;
  color: string;
  bgStart: string;
  bgEnd: string;
  count?: number;
}

export default function SuggestionsScreen() {
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const isDiagnosed = user?.diabetes_diagnosed;
  const firstName = user?.fullName?.split(' ')[0] || 'there';

  const { data: dietData, isLoading: dietLoading, isError: dietError, refetch: dietRefetch } = useGetDietPlansQuery();
  const { data: exerciseData, isLoading: exerciseLoading, isError: exerciseError, refetch: exerciseRefetch } = useGetExercisePlansQuery();
  const { data: tipsData, refetch: tipsRefetch } = useGetCurrentTipsQuery();
  const { data: habitsData, refetch: habitsRefetch } = useGetCurrentWeeklyHabitsQuery();

  const isLoading = dietLoading || exerciseLoading;

  const handleRefresh = () => {
    dietRefetch();
    exerciseRefetch();
    tipsRefetch();
    habitsRefetch();
  };

  const dietCount = dietData?.data?.length || 0;
  const exerciseCount = exerciseData?.data?.length || 0;
  const hasTips = !!tipsData;
  const hasHabits = !!(habitsData?.data);

  const features: FeatureItem[] = [
    {
      icon: 'food-apple-outline',
      title: 'Diet Plans',
      subtitle: dietCount > 0 ? `${dietCount} plan${dietCount !== 1 ? 's' : ''}` : 'Create plan',
      route: '/personalized/diet-plan',
      count: dietCount,
      color: '#3D7A68',
      bgStart: '#F3F9F7',
      bgEnd: '#E6F2EE',
    },
    {
      icon: 'run',
      title: 'Exercise',
      subtitle: exerciseCount > 0 ? `${exerciseCount} plan${exerciseCount !== 1 ? 's' : ''}` : 'Get started',
      route: '/personalized/exercise-plan',
      count: exerciseCount,
      color: '#4A6078',
      bgStart: '#F0F4F8',
      bgEnd: '#E2EAF2',
    },
    {
      icon: 'calendar-month-outline',
      title: 'Monthly Diet',
      subtitle: 'Meal planning',
      route: '/personalized/monthly-diet-plan',
      color: '#6B5B8A',
      bgStart: '#F5F3F8',
      bgEnd: '#EDEAF2',
    },
    {
      icon: 'lightbulb-outline',
      title: 'Lifestyle Tips',
      subtitle: hasTips ? 'New tips ready' : 'Get advice',
      route: '/personalized/lifestyle-tips',
      color: '#4A7580',
      bgStart: '#F0F6F7',
      bgEnd: '#E3EEF0',
    },
    {
      icon: 'checkbox-marked-outline',
      title: 'Habits',
      subtitle: hasHabits ? 'Track progress' : 'Start tracking',
      route: '/personalized/habits',
      color: '#8A7245',
      bgStart: '#F9F6F0',
      bgEnd: '#F2EDE2',
    },
    {
      icon: 'robot-outline',
      title: 'AI Assistant',
      subtitle: 'Ask anything',
      route: '/(tabs)/chat',
      color: '#4E5180',
      bgStart: '#F0F0F6',
      bgEnd: '#E5E5EF',
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor={colors.primary[600]}
          />
        }
      >
        {/* ─── Hero Header ─── */}
        <LinearGradient
          colors={['#3B3F6B', '#2D3154']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroTextWrap}>
              <Text style={styles.heroGreeting}>Hello, {firstName}</Text>
              <Text style={styles.heroTitle}>Your Health Hub</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons name="heart-pulse" size={28} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{dietCount}</Text>
              <Text style={styles.heroStatLabel}>Diet Plans</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{exerciseCount}</Text>
              <Text style={styles.heroStatLabel}>Exercise Plans</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{isDiagnosed ? 'Active' : 'Pending'}</Text>
              <Text style={styles.heroStatLabel}>Status</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ─── Diagnosis Gate ─── */}
        {!isDiagnosed && (
          <View style={styles.gateCard}>
            <View style={styles.gateRow}>
              <View style={styles.gateIconWrap}>
                <MaterialCommunityIcons
                  name="clipboard-pulse-outline"
                  size={22}
                  color={colors.primary[600]}
                />
              </View>
              <View style={styles.gateTextWrap}>
                <Text style={styles.gateTitle}>Complete Health Assessment</Text>
                <Text style={styles.gateSubtitle}>
                  Unlock personalized suggestions tailored to your needs.
                </Text>
              </View>
            </View>
            <Button
              variant="primary"
              onPress={() => router.push('/assessment')}
              style={styles.gateButton}
            >
              Start Assessment
            </Button>
          </View>
        )}

        {/* ─── Quick Actions ─── */}
        {isDiagnosed && (
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionPill}
              activeOpacity={0.7}
              onPress={() => router.push('/personalized/diet-plan/generate' as any)}
            >
              <LinearGradient
                colors={['#3D7A68', '#4D8E7A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.quickPillGradient}
              >
                <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
                <Text style={styles.quickPillText}>New Diet Plan</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickActionPill}
              activeOpacity={0.7}
              onPress={() => router.push('/personalized/exercise-plan/generate' as any)}
            >
              <LinearGradient
                colors={['#4A6078', '#5A7088']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.quickPillGradient}
              >
                <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
                <Text style={styles.quickPillText}>New Exercise Plan</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* ─── Features Grid ─── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isDiagnosed ? 'Your Health Tools' : 'Available Features'}
          </Text>
          <View style={styles.sectionLine} />
        </View>

        <View style={styles.grid}>
          {features.map((item) => (
            <TouchableOpacity
              key={item.title}
              activeOpacity={0.75}
              onPress={() => router.push(item.route as any)}
              style={styles.gridCard}
            >
              <LinearGradient
                colors={[item.bgStart, item.bgEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gridCardGradient}
              >
                <View style={styles.gridCardTop}>
                  <View style={[styles.gridIconWrap, { backgroundColor: `${item.color}18` }]}>
                    <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
                  </View>
                  {item.count !== undefined && item.count > 0 && (
                    <View style={[styles.gridBadge, { backgroundColor: item.color }]}>
                      <Text style={styles.gridBadgeText}>{item.count}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.gridCardTitle, { color: item.color }]}>{item.title}</Text>
                <Text style={styles.gridCardSubtitle}>{item.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Medical Info Link ─── */}
        {isDiagnosed && (
          <TouchableOpacity
            style={styles.medicalInfoCard}
            activeOpacity={0.7}
            onPress={() => router.push('/personalized/personal-medical-info' as any)}
          >
            <View style={styles.medInfoIconWrap}>
              <MaterialCommunityIcons name="account-edit-outline" size={20} color={colors.neutral[600]} />
            </View>
            <View style={styles.medInfoTextWrap}>
              <Text style={styles.medInfoTitle}>Personal Medical Info</Text>
              <Text style={styles.medInfoSubtitle}>Update your health profile</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.neutral[400]} />
          </TouchableOpacity>
        )}

        {/* ─── Error Banner (if plans failed to load) ─── */}
        {(dietError || exerciseError) && (
          <View style={styles.errorBanner}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color={colors.error.dark} />
            <Text style={styles.errorText}>
              Some data failed to load. Pull down to refresh.
            </Text>
          </View>
        )}

        <View style={{ height: spacing[8] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollContent: {
    padding: spacing[4],
  },

  /* ─── Hero ─── */
  heroCard: {
    borderRadius: borderRadius.lg,
    padding: spacing[5],
    marginBottom: spacing[4],
    ...shadows.md,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[5],
  },
  heroTextWrap: {
    flex: 1,
  },
  heroGreeting: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  heroIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
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

  /* ─── Diagnosis Gate ─── */
  gateCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.primary[100],
    ...shadows.xs,
  },
  gateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    gap: spacing[3],
  },
  gateIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  gateTextWrap: {
    flex: 1,
  },
  gateTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  gateSubtitle: {
    fontSize: 12,
    color: colors.neutral[500],
    lineHeight: 16,
    marginTop: 2,
  },
  gateButton: {
    alignSelf: 'stretch',
  },

  /* ─── Quick Actions ─── */
  quickActionsContainer: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[5],
  },
  quickActionPill: {
    flex: 1,
  },
  quickPillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    borderRadius: borderRadius.full,
    gap: 6,
  },
  quickPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  /* ─── Section Header ─── */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    gap: spacing[2],
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

  /* ─── Features Grid ─── */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: spacing[4],
  },
  gridCard: {
    width: CARD_WIDTH,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.xs,
  },
  gridCardGradient: {
    padding: spacing[4],
    minHeight: 120,
    justifyContent: 'space-between',
  },
  gridCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  gridIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridBadge: {
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignItems: 'center',
  },
  gridBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  gridCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  gridCardSubtitle: {
    fontSize: 11,
    color: colors.neutral[500],
    marginTop: 2,
  },

  /* ─── Medical Info ─── */
  medicalInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[100],
    gap: spacing[3],
    ...shadows.xs,
  },
  medInfoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  medInfoTextWrap: {
    flex: 1,
  },
  medInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  medInfoSubtitle: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 1,
  },

  /* ─── Error Banner ─── */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.error.bg,
    borderRadius: borderRadius.sm,
    padding: spacing[3],
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  errorText: {
    fontSize: 12,
    color: colors.error.dark,
    flex: 1,
  },
});
