/**
 * Lifestyle Tips Dashboard
 * Auto-generates and displays daily lifestyle tips.
 * No emojis — MaterialCommunityIcons only
 */
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@components/common/Button';
import { FullScreenLoader } from '@components/common/FullScreenLoader';
import { ErrorState } from '@components/common/ErrorState';
import { EmptyState } from '@components/common/EmptyState';
import {
  useGetCurrentTipsQuery,
  useAutoGenerateTipsMutation,
  useGetTipsHistoryQuery,
  useDeleteTipsMutation,
  type TipCategory,
} from '@features/lifestyle/lifestyleTipsApi';
import { spacing, borderRadius, shadows } from '@theme/spacing';
import colors from '@theme/colors';

const PRIORITY_COLORS: Record<string, string> = {
  high: '#C0392B',
  medium: '#D4882A',
  low: '#3D7A68',
};

const CATEGORY_ICONS: Record<string, string> = {
  sleep_hygiene: 'sleep',
  stress_management: 'meditation',
  hydration: 'water-outline',
  blood_sugar_monitoring: 'water-thermometer-outline',
  medication_adherence: 'pill',
  foot_care: 'shoe-print',
  dental_health: 'tooth-outline',
  social_support: 'handshake-outline',
  nutrition: 'food-apple-outline',
  activity: 'run',
  monitoring: 'chart-line',
};

export default function LifestyleTipsDashboardScreen() {
  const router = useRouter();

  const { data: currentTips, isLoading: loadingCurrent, error: errorCurrent, refetch: refetchCurrent } = useGetCurrentTipsQuery();
  const { data: history = [], isLoading: loadingHistory, refetch: refetchHistory } = useGetTipsHistoryQuery({ limit: 10 });
  const [autoGenerate, { isLoading: generating }] = useAutoGenerateTipsMutation();
  const [deleteTips] = useDeleteTipsMutation();

  // Count total tips across all categories
  const tipCount = currentTips?.categories?.reduce((sum: number, cat: TipCategory) => sum + (cat.tips?.length || 0), 0) || 0;

  // A 404 means "no tips for today" — not a real failure
  const is404 = errorCurrent && 'status' in errorCurrent && (errorCurrent as any).status === 404;

  // Auto-generate once on first visit if no current tips
  const autoGenAttempted = useRef(false);
  useEffect(() => {
    if (autoGenAttempted.current) return;
    if (loadingCurrent) return;               // still fetching — wait
    if (currentTips) return;                   // tips exist — nothing to do
    if (errorCurrent && !is404) return;        // real error — don't retry

    autoGenAttempted.current = true;
    autoGenerate()
      .unwrap()
      .then(() => refetchCurrent())
      .catch(() => {});
  }, [loadingCurrent, currentTips, errorCurrent]);

  const handleRefresh = async () => {
    try {
      await autoGenerate().unwrap();
      refetchCurrent();
      refetchHistory();
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message || 'Failed to generate tips.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Tips', 'Delete these lifestyle tips?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTips(id).unwrap();
            refetchCurrent();
            refetchHistory();
          } catch {
            Alert.alert('Error', 'Failed to delete.');
          }
        },
      },
    ]);
  };

  if (loadingCurrent && !currentTips) return <FullScreenLoader />;
  if (errorCurrent && !is404 && !currentTips) return <ErrorState onRetry={refetchCurrent} error="Failed to load tips." />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={generating} onRefresh={handleRefresh} tintColor="#FFF" />}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={['#4A7580', '#375A64']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={20} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons name="lightbulb-outline" size={24} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
          <Text style={styles.heroTitle}>Lifestyle Tips</Text>
          <Text style={styles.heroSubtitle}>Daily personalized recommendations for better health</Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{tipCount}</Text>
              <Text style={styles.heroStatLabel}>Today's Tips</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{history.length}</Text>
              <Text style={styles.heroStatLabel}>History</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{tipCount > 0 ? 'Active' : 'None'}</Text>
              <Text style={styles.heroStatLabel}>Status</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Refresh button */}
        <TouchableOpacity activeOpacity={0.7} onPress={handleRefresh}>
          <LinearGradient
            colors={['#4A7580', '#5A8590']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.refreshBtn}
          >
            <MaterialCommunityIcons name="refresh" size={18} color="#FFF" />
            <Text style={styles.refreshText}>Generate New Tips</Text>
          </LinearGradient>
        </TouchableOpacity>

        {generating && (
          <View style={styles.generatingCard}>
            <ActivityIndicator size="large" color="#4A7580" />
            <Text style={styles.generatingText}>Generating your personalized tips...</Text>
          </View>
        )}

        {/* Today's Tips */}
        {currentTips && currentTips.categories?.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Tips</Text>
              <View style={styles.sectionLine} />
            </View>

            {currentTips.categories.map((cat: TipCategory, catIdx: number) => (
              <View key={catIdx}>
                {/* Category header */}
                <View style={styles.categoryHeader}>
                  <View style={styles.categoryIconWrap}>
                    <MaterialCommunityIcons
                      name={(CATEGORY_ICONS[cat.name] || 'lightbulb-on-outline') as any}
                      size={18}
                      color="#4A7580"
                    />
                  </View>
                  <Text style={styles.categoryName}>{cat.name?.replace(/_/g, ' ')}</Text>
                  <Text style={styles.categoryCount}>{cat.tips?.length || 0}</Text>
                </View>

                {/* Tips in this category */}
                {cat.tips?.map((tip, idx) => (
                  <View key={idx} style={styles.tipCard}>
                    <View style={styles.tipHeader}>
                      <View style={styles.tipInfo}>
                        <Text style={styles.tipTitle}>{tip.title}</Text>
                      </View>
                      <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[tip.priority] || colors.neutral[400] }]}>
                        <Text style={styles.priorityText}>{tip.priority}</Text>
                      </View>
                    </View>
                    <Text style={styles.tipDescription}>{tip.description}</Text>
                  </View>
                ))}
              </View>
            ))}

            {/* Personalized Insights */}
            {currentTips.personalized_insights && currentTips.personalized_insights.length > 0 && (
              <>
                <View style={[styles.sectionHeader, { marginTop: spacing[4] }]}>
                  <Text style={styles.sectionTitle}>Personalized Insights</Text>
                  <View style={styles.sectionLine} />
                </View>
                {currentTips.personalized_insights.map((insight: string, idx: number) => (
                  <View key={idx} style={styles.insightCard}>
                    <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color="#D4882A" />
                    <Text style={styles.insightText}>{insight}</Text>
                  </View>
                ))}
              </>
            )}
          </>
        ) : !generating ? (
          <EmptyState
            icon="lightbulb-outline"
            title="No Tips Today"
            message="Pull to refresh to generate today's tips."
          />
        ) : null}

        {/* History */}
        {history.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: spacing[4] }]}>
              <Text style={styles.sectionTitle}>History</Text>
              <View style={styles.sectionLine} />
            </View>

            {history.map((entry) => (
              <TouchableOpacity
                key={entry._id}
                style={styles.historyCard}
                activeOpacity={0.7}
                onPress={() => router.push(`/personalized/lifestyle-tips/${entry._id}` as any)}
              >
                <View style={styles.historyRow}>
                  <View style={styles.historyIconWrap}>
                    <MaterialCommunityIcons name="history" size={18} color={colors.neutral[500]} />
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyDate}>
                      {new Date(entry.target_date || entry.createdAt || '').toLocaleDateString()}
                    </Text>
                    <Text style={styles.historyCount}>
                      {entry.categories?.reduce((s, c) => s + (c.tips?.length || 0), 0) || 0} tips
                    </Text>
                  </View>
                  <View style={styles.historyRight}>
                    <TouchableOpacity
                      style={styles.historyDeleteBtn}
                      onPress={(e) => { e.stopPropagation(); handleDelete(entry._id); }}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons name="delete-outline" size={16} color={colors.error.main} />
                    </TouchableOpacity>
                    <MaterialCommunityIcons name="chevron-right" size={18} color={colors.neutral[400]} />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.neutral[50] },
  container: { padding: spacing[4], paddingBottom: spacing[12] },

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
  heroTitle: { fontSize: 22, fontWeight: '700', color: '#FFFFFF', letterSpacing: -0.3 },
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginTop: 2, marginBottom: spacing[4] },
  heroStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  heroStatLabel: { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 2 },

  /* Refresh */
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.full,
    gap: 8,
    marginBottom: spacing[4],
  },
  refreshText: { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },

  /* Generating */
  generatingCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    padding: spacing[6],
    alignItems: 'center',
    marginBottom: spacing[4],
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.xs,
  },
  generatingText: { fontSize: 14, color: colors.neutral[500], marginTop: spacing[3] },

  /* Section */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral[800] },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.neutral[100] },

  /* Tip Cards */
  tipCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.xs,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing[3], gap: spacing[3] },
  tipInfo: { flex: 1 },
  tipTitle: { fontSize: 15, fontWeight: '600', color: colors.neutral[900] },
  priorityBadge: { paddingHorizontal: spacing[2], paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 11, color: '#FFF', fontWeight: '600', textTransform: 'capitalize' },
  tipDescription: { fontSize: 14, color: colors.neutral[600], lineHeight: 20 },

  /* Category header */
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
    marginTop: spacing[2],
  },
  categoryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F0F6F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[700],
    textTransform: 'capitalize',
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral[400],
  },

  /* Personalized Insights */
  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    backgroundColor: '#FFF8ED',
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: '#F5E6D0',
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral[700],
    lineHeight: 19,
  },

  /* History */
  historyCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    padding: spacing[3],
    marginBottom: spacing[2],
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  historyIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: { flex: 1 },
  historyDate: { fontSize: 14, fontWeight: '500', color: colors.neutral[800] },
  historyCount: { fontSize: 12, color: colors.neutral[500], marginTop: 1 },
  historyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  historyDeleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.error.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
