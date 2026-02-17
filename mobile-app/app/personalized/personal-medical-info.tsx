/**
 * Personal & Medical Information Screen
 * View and edit personal and medical info for personalized suggestions.
 * No emojis — MaterialCommunityIcons only
 */
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Divider, Portal, Modal } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '@components/common/Button';
import { TextInput } from '@components/common/TextInput';
import { FullScreenLoader } from '@components/common/FullScreenLoader';
import { ErrorState } from '@components/common/ErrorState';
import {
  useGetPersonalInfoQuery,
  useSavePersonalInfoMutation,
  useGetMedicalInfoQuery,
  useSaveMedicalInfoMutation,
} from '@features/personalized/personalizedApi';
import { spacing, borderRadius, shadows } from '@theme/spacing';
import colors from '@theme/colors';
import type { PersonalInfo, MedicalInfo } from '@app-types/api';

type EditSection = 'personal' | 'medical' | null;

export default function PersonalMedicalInfoScreen() {
  const router = useRouter();
  const [editSection, setEditSection] = useState<EditSection>(null);

  // API
  const { data: personalData, isLoading: loadingPersonal, error: errorPersonal, refetch: refetchPersonal } = useGetPersonalInfoQuery();
  const { data: medicalData, isLoading: loadingMedical, error: errorMedical, refetch: refetchMedical } = useGetMedicalInfoQuery();
  const [savePersonal, { isLoading: savingPersonal }] = useSavePersonalInfoMutation();
  const [saveMedical, { isLoading: savingMedical }] = useSaveMedicalInfoMutation();

  // Edit form state
  const [personalForm, setPersonalForm] = useState<Partial<PersonalInfo>>({});
  const [medicalForm, setMedicalForm] = useState<Partial<MedicalInfo>>({});

  const personal = personalData?.data;
  const medical = medicalData?.data;

  if (loadingPersonal || loadingMedical) return <FullScreenLoader />;
  if (errorPersonal || errorMedical) {
    return <ErrorState onRetry={() => { refetchPersonal(); refetchMedical(); }} error="Failed to load information." />;
  }

  const openEditPersonal = () => {
    setPersonalForm({
      date_of_birth: personal?.date_of_birth || '',
      gender: personal?.gender || '',
      height: personal?.height || '',
      weight: personal?.weight || '',
      activity_level: personal?.activity_level || '',
      dietary_preference: personal?.dietary_preference || '',
      smoking_status: personal?.smoking_status || '',
      alcohol_use: personal?.alcohol_use || '',
      sleep_hours: personal?.sleep_hours || '',
    });
    setEditSection('personal');
  };

  const openEditMedical = () => {
    setMedicalForm({
      diabetes_type: medical?.diabetes_type || '',
      diagnosis_date: medical?.diagnosis_date || '',
      last_medical_checkup: medical?.last_medical_checkup || '',
    });
    setEditSection('medical');
  };

  const handleSavePersonal = async () => {
    try {
      await savePersonal(personalForm).unwrap();
      setEditSection(null);
      refetchPersonal();
      Alert.alert('Success', 'Personal information updated.');
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message || 'Failed to save.');
    }
  };

  const handleSaveMedical = async () => {
    try {
      await saveMedical(medicalForm).unwrap();
      setEditSection(null);
      refetchMedical();
      Alert.alert('Success', 'Medical information updated.');
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message || 'Failed to save.');
    }
  };

  const renderField = (label: string, value: any, icon?: string) => (
    <View style={styles.fieldRow} key={label}>
      {icon && (
        <View style={styles.fieldIconWrap}>
          <MaterialCommunityIcons name={icon as any} size={14} color={colors.neutral[400]} />
        </View>
      )}
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || '--'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <LinearGradient
          colors={['#3B3F6B', '#2D3154']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={20} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons name="account-edit-outline" size={24} color="rgba(255,255,255,0.9)" />
            </View>
          </View>
          <Text style={styles.heroTitle}>Personal & Medical Info</Text>
          <Text style={styles.heroSubtitle}>Your health profile for personalized suggestions</Text>
        </LinearGradient>

        {/* Personal Information */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="account-outline" size={18} color={colors.neutral[600]} />
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.sectionLine} />
          <TouchableOpacity onPress={openEditPersonal} style={styles.editBtn}>
            <MaterialCommunityIcons name="pencil-outline" size={16} color="#3B3F6B" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          {renderField('Date of Birth', personal?.date_of_birth, 'calendar-outline')}
          {renderField('Gender', personal?.gender, 'gender-male-female')}
          {renderField('Height', personal?.height ? `${personal.height} cm` : null, 'human-male-height')}
          {renderField('Weight', personal?.weight ? `${personal.weight} kg` : null, 'scale-bathroom')}
          {renderField('Activity Level', personal?.activity_level, 'run')}
          {renderField('Dietary Preference', personal?.dietary_preference, 'food-apple-outline')}
          {renderField('Smoking Status', personal?.smoking_status, 'smoking-off')}
          {renderField('Alcohol Use', personal?.alcohol_use, 'glass-cocktail')}
          {renderField('Sleep Hours', personal?.sleep_hours ? `${personal.sleep_hours} hrs` : null, 'sleep')}
        </View>

        {/* Medical Information */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="medical-bag" size={18} color={colors.neutral[600]} />
          <Text style={styles.sectionTitle}>Medical Information</Text>
          <View style={styles.sectionLine} />
          <TouchableOpacity onPress={openEditMedical} style={styles.editBtn}>
            <MaterialCommunityIcons name="pencil-outline" size={16} color="#3B3F6B" />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          {renderField('Diabetes Type', medical?.diabetes_type, 'water-thermometer-outline')}
          {renderField('Diagnosis Date', medical?.diagnosis_date, 'calendar-check-outline')}
          {renderField('Last Checkup', medical?.last_medical_checkup, 'stethoscope')}
          {renderField('Medications', medical?.current_medications?.map(m => m.medication_name).join(', '), 'pill')}
          {renderField('Allergies', medical?.allergies?.map(a => a.allergen).join(', '), 'alert-circle-outline')}
          {renderField('Chronic Conditions', medical?.chronic_conditions?.map(c => c.condition_name).join(', '), 'hospital-box-outline')}
          {renderField('Family History', medical?.family_history?.map(f => `${f.relation}: ${f.condition}`).join(', '), 'family-tree')}
        </View>
      </ScrollView>

      {/* Edit Personal Modal */}
      <Portal>
        <Modal
          visible={editSection === 'personal'}
          onDismiss={() => setEditSection(null)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <MaterialCommunityIcons name="account-edit-outline" size={24} color="#3B3F6B" />
              </View>
              <Text style={styles.modalTitle}>Edit Personal Info</Text>
            </View>
            <TextInput label="Date of Birth (YYYY-MM-DD)" value={String(personalForm.date_of_birth || '')} onChangeText={(v) => setPersonalForm(p => ({ ...p, date_of_birth: v }))} />
            <TextInput label="Gender" value={String(personalForm.gender || '')} onChangeText={(v) => setPersonalForm(p => ({ ...p, gender: v }))} />
            <TextInput label="Height (cm)" value={String(personalForm.height || '')} onChangeText={(v) => setPersonalForm(p => ({ ...p, height: v }))} keyboardType="numeric" />
            <TextInput label="Weight (kg)" value={String(personalForm.weight || '')} onChangeText={(v) => setPersonalForm(p => ({ ...p, weight: v }))} keyboardType="numeric" />
            <TextInput label="Activity Level" value={String(personalForm.activity_level || '')} onChangeText={(v) => setPersonalForm(p => ({ ...p, activity_level: v }))} />
            <TextInput label="Dietary Preference" value={String(personalForm.dietary_preference || '')} onChangeText={(v) => setPersonalForm(p => ({ ...p, dietary_preference: v }))} />
            <TextInput label="Smoking Status" value={String(personalForm.smoking_status || '')} onChangeText={(v) => setPersonalForm(p => ({ ...p, smoking_status: v }))} />
            <TextInput label="Alcohol Use" value={String(personalForm.alcohol_use || '')} onChangeText={(v) => setPersonalForm(p => ({ ...p, alcohol_use: v }))} />
            <TextInput label="Sleep Hours" value={String(personalForm.sleep_hours || '')} onChangeText={(v) => setPersonalForm(p => ({ ...p, sleep_hours: v }))} keyboardType="numeric" />
            <View style={styles.modalActions}>
              <Button variant="outline" onPress={() => setEditSection(null)} style={styles.modalButton}>Cancel</Button>
              <Button variant="primary" onPress={handleSavePersonal} loading={savingPersonal} style={styles.modalButton}>Save</Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Edit Medical Modal */}
      <Portal>
        <Modal
          visible={editSection === 'medical'}
          onDismiss={() => setEditSection(null)}
          contentContainerStyle={styles.modal}
        >
          <ScrollView>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconWrap}>
                <MaterialCommunityIcons name="medical-bag" size={24} color="#3B3F6B" />
              </View>
              <Text style={styles.modalTitle}>Edit Medical Info</Text>
            </View>
            <TextInput label="Diabetes Type" value={String(medicalForm.diabetes_type || '')} onChangeText={(v) => setMedicalForm(p => ({ ...p, diabetes_type: v }))} />
            <TextInput label="Diagnosis Date (YYYY-MM-DD)" value={String(medicalForm.diagnosis_date || '')} onChangeText={(v) => setMedicalForm(p => ({ ...p, diagnosis_date: v }))} />
            <TextInput label="Last Checkup (YYYY-MM-DD)" value={String(medicalForm.last_medical_checkup || '')} onChangeText={(v) => setMedicalForm(p => ({ ...p, last_medical_checkup: v }))} />
            <View style={styles.modalActions}>
              <Button variant="outline" onPress={() => setEditSection(null)} style={styles.modalButton}>Cancel</Button>
              <Button variant="primary" onPress={handleSaveMedical} loading={savingMedical} style={styles.modalButton}>Save</Button>
            </View>
          </ScrollView>
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
    marginBottom: spacing[5],
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
  heroSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500', marginTop: 2 },

  /* Section */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral[800] },
  sectionLine: { flex: 1, height: 1, backgroundColor: colors.neutral[100] },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: borderRadius.full,
    backgroundColor: '#F0F0F6',
  },
  editBtnText: { fontSize: 12, fontWeight: '600', color: '#3B3F6B' },

  /* Section Card */
  sectionCard: {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.md,
    padding: spacing[4],
    marginBottom: spacing[5],
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.xs,
  },

  /* Fields */
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[50],
  },
  fieldIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing[2],
  },
  fieldLabel: { flex: 1, fontSize: 13, color: colors.neutral[500], fontWeight: '500' },
  fieldValue: { flex: 1, fontSize: 14, color: colors.neutral[800], fontWeight: '500', textAlign: 'right' },

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
    backgroundColor: '#F0F0F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.neutral[900] },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing[3], marginTop: spacing[4] },
  modalButton: { minWidth: 100 },
});
