/**
 * Monthly Diet Plan Dashboard
 * Lists monthly diet plans, allows generating new ones.
 * No emojis — MaterialCommunityIcons only
 */
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl, TouchableOpacity } from 'react-native';
import { Text, Portal, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@components/common/Button';
import { TextInput } from '@components/common/TextInput';
import { FullScreenLoader } from '@components/common/FullScreenLoader';
import { ErrorState } from '@components/common/ErrorState';
import { EmptyState } from '@components/common/EmptyState';
import {
  useGetMonthlyPlanHistoryQuery,
  useGenerateMonthlyDietPlanMutation,
  useDeleteMonthlyPlanMutation,
} from '@features/monthly-diet/monthlyDietPlanApi';
import { spacing, borderRadius, shadows } from '@theme/spacing';
import colors from '@theme/colors';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthlyDietPlanDashboardScreen() {
  const router = useRouter();
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data, isLoading, error, refetch } = useGetMonthlyPlanHistoryQuery({ limit: 12 });
  const [generate, { isLoading: generating }] = useGenerateMonthlyDietPlanMutation();
  const [deletePlan] = useDeleteMonthlyPlanMutation();

  const plans = data?.data || (data as any)?.plans || [];

  const handleGenerate = async () => {
    try {
      await generate({ month: selectedMonth, year: selectedYear }).unwrap();
      setShowGenerateModal(false);
      refetch();
      Alert.alert('Success', 'Monthly diet plan generated!');
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message || 'Failed to generate plan.');
    }
  };

  const handleDelete = (planId: string) => {
    Alert.alert('Delete Plan', 'Are you sure you want to delete this monthly plan?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePlan(planId).unwrap();
            refetch();
          } catch {
            Alert.alert('Error', 'Failed to delete plan.');
          }
        },
      },
    ]);
  };

  if (isLoading) return <FullScreenLoader />;
  if (error) return <ErrorState onRetry={refetch} error="Failed to load monthly plans." />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#FFF" />}
      >
        {/* Hero Header */}
        <LinearGradient
          colors={['#6B5B8A', '#503F6E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={20} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons name="calendar-month-outline" size={24} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
          <Text style={styles.heroTitle}>Monthly Diet Plans</Text>
          <Text style={styles.heroSubtitle}>Comprehensive monthly meal planning with multiple options</Text>
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{plans.length}</Text>
              <Text style={styles.heroStatLabel}>Total Plans</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>
                {plans.length > 0 ? MONTHS[(plans[0].month || 1) - 1]?.substring(0, 3) : '--'}
              </Text>
              <Text style={styles.heroStatLabel}>Latest Month</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{plans.length > 0 ? plans[0].year : '--'}</Text>
              <Text style={styles.heroStatLabel}>Year</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Generate button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setShowGenerateModal(true)}
        >
          <LinearGradient
            colors={['#6B5B8A', '#7D6D9C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.generateBtn}
          >
            <MaterialCommunityIcons name="calendar-plus" size={20} color="#FFF" />
            <Text style={styles.generateText}>Generate New Monthly Plan</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        {plans.length === 0 ? (
          <EmptyState
            icon="calendar-month-outline"
            title="No Monthly Plans"
            message="Generate your first monthly diet plan to get started."
          />
        ) : (
          <>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Plan History</Text>
              <View style={styles.sectionLine} />
            </View>

            {plans.map((plan: any) => (
              <View key={plan._id} style={styles.planCard}>
                <View style={styles.planRow}>
                  <View style={styles.planIconWrap}>
                    <MaterialCommunityIcons name="calendar-month" size={20} color="#6B5B8A" />
                  </View>
                  <View style={styles.planInfo}>
                    <Text style={styles.planTitle}>
                      {MONTHS[(plan.month || 1) - 1]} {plan.year}
                    </Text>
                    <Text style={styles.planDate}>
                      Created {new Date(plan.created_at || plan.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.planActions}>
                  <TouchableOpacity
                    style={styles.viewBtn}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/personalized/monthly-diet-plan/${plan._id}` as any)}
                  >
                    <MaterialCommunityIcons name="eye-outline" size={16} color="#6B5B8A" />
                    <Text style={styles.viewBtnText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    activeOpacity={0.7}
                    onPress={() => handleDelete(plan._id)}
                  >
                    <MaterialCommunityIcons name="delete-outline" size={16} color={colors.error.main} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      {/* Generate Modal */}
      <Portal>
        <Modal
          visible={showGenerateModal}
          onDismiss={() => setShowGenerateModal(false)}
          contentContainerStyle={styles.modal}
        >
          <View style={styles.modalHeader}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons name="calendar-plus" size={24} color="#6B5B8A" />
            </View>
            <Text style={styles.modalTitle}>Generate Monthly Plan</Text>
            <Text style={styles.modalSubtitle}>Select month and year for your plan</Text>
          </View>

          <Text style={styles.fieldLabel}>Month</Text>
          <View style={styles.monthGrid}>
            {MONTHS.map((month, idx) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.monthButton,
                  selectedMonth === idx + 1 && styles.monthButtonSelected,
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedMonth(idx + 1)}
              >
                <Text style={[
                  styles.monthButtonText,
                  selectedMonth === idx + 1 && styles.monthButtonTextSelected,
                ]}>
                  {month.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            label="Year"
            value={String(selectedYear)}
            onChangeText={(v) => setSelectedYear(parseInt(v) || new Date().getFullYear())}
            keyboardType="numeric"
          />

          <View style={styles.modalActions}>
            <Button variant="outline" onPress={() => setShowGenerateModal(false)}>Cancel</Button>
            <Button variant="primary" onPress={handleGenerate} loading={generating}>Generate</Button>
          </View>
        </Modal>
      </Portal>
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
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  heroStatLabel: { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 2 },

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
  generateText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#FFFFFF' },

  /* Section */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral[800] },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.neutral[100] },

  /* Plan Cards */
  planCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.xs,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
    gap: spacing[3],
  },
  planIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F5F3F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  planInfo: { flex: 1 },
  planTitle: { fontSize: 15, fontWeight: '600', color: colors.neutral[900] },
  planDate: { fontSize: 12, color: colors.neutral[500], marginTop: 2 },
  planActions: { flexDirection: 'row', gap: spacing[2] },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[2],
    borderRadius: borderRadius.sm,
    backgroundColor: '#F5F3F8',
    gap: 6,
  },
  viewBtnText: { fontSize: 13, fontWeight: '600', color: '#6B5B8A' },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.error.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Modal */
  modal: {
    backgroundColor: colors.neutral[0],
    margin: spacing[4],
    padding: spacing[5],
    borderRadius: borderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: { alignItems: 'center', marginBottom: spacing[4] },
  modalIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F5F3F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.neutral[900] },
  modalSubtitle: { fontSize: 13, color: colors.neutral[500], marginTop: 4 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.neutral[600], marginBottom: spacing[2] },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2], marginBottom: spacing[4] },
  monthButton: {
    width: '30%',
    paddingVertical: spacing[2],
    borderRadius: borderRadius.sm,
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  monthButtonSelected: {
    backgroundColor: '#6B5B8A',
    borderColor: '#6B5B8A',
  },
  monthButtonText: { fontSize: 13, fontWeight: '600', color: colors.neutral[600] },
  monthButtonTextSelected: { color: '#FFFFFF' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing[3], marginTop: spacing[4] },
});
