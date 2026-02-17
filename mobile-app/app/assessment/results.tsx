/**
 * Assessment Results Screen
 * Gradient hero + muted card design — no emojis, no old Card/Button/textStyles/colors.light.*
 */
import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useGetLatestAssessmentQuery } from '@features/assessment/assessmentApi';
import type { DiabetesAssessmentResult } from '@features/assessment/assessmentApi';
import { FullScreenLoader } from '@components/common/FullScreenLoader';
import { spacing, borderRadius, shadows } from '@theme/spacing';
import colors from '@theme/colors';

const HERO_FROM = '#3D5A80';
const HERO_TO = '#293D56';

const RISK_META: Record<string, { color: string; icon: string; label: string; advice: string }> = {
  High: {
    color: colors.error.main,
    icon: 'alert-circle',
    label: 'High Risk',
    advice: 'Please consult a healthcare professional as soon as possible.',
  },
  Medium: {
    color: '#EF8C1A',
    icon: 'alert',
    label: 'Medium Risk',
    advice: 'Monitor closely and maintain healthy lifestyle habits.',
  },
  Low: {
    color: colors.success.main,
    icon: 'check-circle',
    label: 'Low Risk',
    advice: 'Great news! Keep up your healthy lifestyle.',
  },
};

export default function AssessmentResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ data?: string }>();

  const passedData = useMemo(() => {
    try {
      if (params.data) return JSON.parse(params.data) as DiabetesAssessmentResult;
    } catch {}
    return null;
  }, [params.data]);

  const { data: latestData, isLoading } = useGetLatestAssessmentQuery(undefined, { skip: !!passedData });
  const assessment = passedData || latestData?.data;

  if (isLoading && !passedData) return <FullScreenLoader />;

  /* ——— Empty state ——— */
  if (!assessment) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <ScrollView contentContainerStyle={s.scroll}>
          <LinearGradient colors={[HERO_FROM, HERO_TO]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/dashboard')} style={s.heroBack}>
              <MaterialCommunityIcons name="arrow-left" size={20} color="#FFF" />
            </TouchableOpacity>
            <View style={s.heroRow}>
              <View style={s.heroIconWrap}>
                <MaterialCommunityIcons name="clipboard-pulse-outline" size={22} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.heroTitle}>Assessment Results</Text>
                <Text style={s.heroSub}>No results yet</Text>
              </View>
            </View>
          </LinearGradient>

          <View style={s.emptyCard}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color={colors.neutral[300]} />
            <Text style={s.emptyTitle}>No Results Available</Text>
            <Text style={s.emptyDesc}>Complete a health assessment to see your results here.</Text>
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/assessment')}>
              <LinearGradient colors={[HERO_FROM, HERO_TO]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.gradBtn}>
                <MaterialCommunityIcons name="clipboard-edit-outline" size={18} color="#FFF" />
                <Text style={s.gradBtnText}>Take Assessment</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const riskLevel = assessment.result?.risk_level || 'Low';
  const probability = assessment.result?.diabetes_probability ?? 0;
  const confidence = assessment.result?.confidence ?? 0;
  const meta = RISK_META[riskLevel] || RISK_META.Low;
  const features = assessment.features || {};
  const totalSymptoms = assessment.result?.total_symptoms || Object.keys(features).length;
  const presentCount = Object.values(features).filter(v => Number(v) > 0).length;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={[HERO_FROM, HERO_TO]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/dashboard')} style={s.heroBack}>
            <MaterialCommunityIcons name="arrow-left" size={20} color="#FFF" />
          </TouchableOpacity>
          <View style={s.heroRow}>
            <View style={s.heroIconWrap}>
              <MaterialCommunityIcons name="clipboard-pulse-outline" size={22} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.heroTitle}>Assessment Results</Text>
              <Text style={s.heroSub}>
                {assessment.assessment_date
                  ? new Date(assessment.assessment_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : 'Latest Assessment'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Risk Level Card */}
        <View style={[s.riskCard, { borderLeftColor: meta.color }]}>
          <View style={[s.riskIconWrap, { backgroundColor: meta.color + '15' }]}>
            <MaterialCommunityIcons name={meta.icon as any} size={28} color={meta.color} />
          </View>
          <Text style={[s.riskLabel, { color: meta.color }]}>{meta.label}</Text>
          <Text style={s.riskAdvice}>{meta.advice}</Text>
        </View>

        {/* Probability & Confidence */}
        <View style={s.metricsRow}>
          <View style={s.metricCard}>
            <View style={[s.metricIconWrap, { backgroundColor: meta.color + '12' }]}>
              <MaterialCommunityIcons name="percent-outline" size={18} color={meta.color} />
            </View>
            <Text style={s.metricValue}>{(probability * 100).toFixed(1)}%</Text>
            <Text style={s.metricLabel}>Probability</Text>
            <View style={s.barTrack}>
              <View style={[s.barFill, { width: `${Math.min(probability * 100, 100)}%`, backgroundColor: meta.color }]} />
            </View>
          </View>
          <View style={s.metricCard}>
            <View style={[s.metricIconWrap, { backgroundColor: HERO_FROM + '12' }]}>
              <MaterialCommunityIcons name="shield-check-outline" size={18} color={HERO_FROM} />
            </View>
            <Text style={s.metricValue}>{(confidence * 100).toFixed(1)}%</Text>
            <Text style={s.metricLabel}>Confidence</Text>
            <View style={s.barTrack}>
              <View style={[s.barFill, { width: `${Math.min(confidence * 100, 100)}%`, backgroundColor: HERO_FROM }]} />
            </View>
          </View>
        </View>

        {/* Symptoms Analyzed */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View style={[s.sectionIconWrap, { backgroundColor: HERO_FROM + '10' }]}>
              <MaterialCommunityIcons name="format-list-checks" size={16} color={HERO_FROM} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.sectionTitle}>Symptoms Analyzed</Text>
              <Text style={s.sectionSub}>{presentCount} present out of {totalSymptoms} analyzed</Text>
            </View>
          </View>

          {Object.entries(features).map(([key, value]) => {
            const present = Number(value) > 0;
            return (
              <View key={key} style={s.featureRow}>
                <View style={[s.featureDot, { backgroundColor: present ? meta.color : colors.success.main }]} />
                <Text style={s.featureName}>{key.replace(/_/g, ' ')}</Text>
                <View style={[s.featureBadge, { backgroundColor: present ? meta.color + '12' : colors.success.main + '12' }]}>
                  <Text style={[s.featureBadgeText, { color: present ? meta.color : colors.success.main }]}>
                    {present ? 'Present' : 'Absent'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Assessment Details */}
        {assessment.model_info && (
          <View style={s.section}>
            <View style={s.sectionHeader}>
              <View style={[s.sectionIconWrap, { backgroundColor: HERO_FROM + '10' }]}>
                <MaterialCommunityIcons name="information-outline" size={16} color={HERO_FROM} />
              </View>
              <Text style={s.sectionTitle}>Assessment Details</Text>
            </View>

            <DetailRow label="Assessment Type" value={assessment.model_info.assessment_type} />
            {assessment.enhancement_status && (
              <DetailRow label="Enhanced Analysis" value={assessment.enhancement_status.enhanced ? 'Yes' : 'No'} />
            )}
            <DetailRow label="Cached Result" value={assessment.is_cached ? 'Yes' : 'No'} />
          </View>
        )}

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/assessment')}>
            <LinearGradient colors={[HERO_FROM, HERO_TO]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.gradBtn}>
              <MaterialCommunityIcons name="restart" size={18} color="#FFF" />
              <Text style={s.gradBtnText}>Retake Assessment</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <MaterialCommunityIcons name="shield-alert-outline" size={18} color={colors.neutral[400]} style={{ marginTop: 2 }} />
          <Text style={s.disclaimerText}>
            This assessment is for informational purposes only and does not constitute medical advice. Please consult a healthcare professional for proper diagnosis and treatment.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.detailRow}>
      <Text style={s.detailLabel}>{label}</Text>
      <Text style={s.detailValue} numberOfLines={2}>{value}</Text>
    </View>
  );
}

// ——— Styles ———
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral[50] },
  scroll: { padding: spacing[4], paddingBottom: spacing[12] },

  // Hero
  hero: { borderRadius: borderRadius.lg, padding: spacing[5], marginBottom: spacing[5], ...shadows.md },
  heroBack: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing[3] },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3] },
  heroIconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: 22, fontWeight: '700', color: '#FFF', letterSpacing: -0.3 },
  heroSub: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Empty
  emptyCard: { alignItems: 'center', gap: spacing[4], paddingVertical: spacing[10], paddingHorizontal: spacing[6], backgroundColor: colors.neutral[0], borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.neutral[100], ...shadows.xs },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.neutral[800] },
  emptyDesc: { fontSize: 13, fontWeight: '400', color: colors.neutral[500], textAlign: 'center', lineHeight: 19 },

  // Risk card
  riskCard: { alignItems: 'center', gap: spacing[2], backgroundColor: colors.neutral[0], borderRadius: borderRadius.md, padding: spacing[5], borderWidth: 1, borderColor: colors.neutral[100], borderLeftWidth: 4, marginBottom: spacing[4], ...shadows.xs },
  riskIconWrap: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: spacing[1] },
  riskLabel: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  riskAdvice: { fontSize: 13, fontWeight: '400', color: colors.neutral[500], textAlign: 'center', lineHeight: 19 },

  // Metrics
  metricsRow: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[4] },
  metricCard: { flex: 1, alignItems: 'center', gap: spacing[1], backgroundColor: colors.neutral[0], borderRadius: borderRadius.md, padding: spacing[4], borderWidth: 1, borderColor: colors.neutral[100], ...shadows.xs },
  metricIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: spacing[1] },
  metricValue: { fontSize: 22, fontWeight: '800', color: colors.neutral[800], letterSpacing: -0.3 },
  metricLabel: { fontSize: 12, fontWeight: '500', color: colors.neutral[500], marginBottom: spacing[2] },
  barTrack: { width: '100%', height: 5, borderRadius: 3, backgroundColor: colors.neutral[100], overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },

  // Section
  section: { backgroundColor: colors.neutral[0], borderRadius: borderRadius.md, padding: spacing[4], borderWidth: 1, borderColor: colors.neutral[100], marginBottom: spacing[4], ...shadows.xs },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] },
  sectionIconWrap: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral[800] },
  sectionSub: { fontSize: 12, fontWeight: '400', color: colors.neutral[500], marginTop: 1 },

  // Feature rows
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.neutral[50] },
  featureDot: { width: 8, height: 8, borderRadius: 4 },
  featureName: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.neutral[700], textTransform: 'capitalize' },
  featureBadge: { paddingHorizontal: spacing[2], paddingVertical: 2, borderRadius: borderRadius.sm },
  featureBadgeText: { fontSize: 11, fontWeight: '700' },

  // Detail rows
  detailRow: { flexDirection: 'column', paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: colors.neutral[50], gap: 2 },
  detailLabel: { fontSize: 12, fontWeight: '500', color: colors.neutral[400] },
  detailValue: { fontSize: 14, fontWeight: '600', color: colors.neutral[800] },

  // Actions
  actions: { gap: spacing[3], marginBottom: spacing[4] },
  gradBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing[2], paddingVertical: spacing[3] + 2, borderRadius: borderRadius.md, ...shadows.sm },
  gradBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  outlineBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing[2], paddingVertical: spacing[3], borderRadius: borderRadius.md, borderWidth: 1.5, borderColor: HERO_FROM + '30', backgroundColor: colors.neutral[0] },
  outlineBtnText: { fontSize: 14, fontWeight: '600', color: HERO_FROM },

  // Disclaimer
  disclaimer: { flexDirection: 'row', gap: spacing[3], backgroundColor: colors.neutral[0], borderRadius: borderRadius.md, padding: spacing[4], borderWidth: 1, borderColor: colors.neutral[100] },
  disclaimerText: { flex: 1, fontSize: 11, fontWeight: '400', color: colors.neutral[400], fontStyle: 'italic', lineHeight: 16 },
});
