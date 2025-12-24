import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';

const { width } = Dimensions.get('window');

const SymptomsScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [diseaseData, setDiseaseData] = useState(null);
  const [completionPct, setCompletionPct] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users/my-disease-data');
      setDiseaseData(response.data.data);
      
      const total = response.data.data?.totalQuestions || 1;
      const answered = response.data.data?.answeredQuestions || 0;
      setCompletionPct(Math.round((answered / total) * 100));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const InfoCard = ({ icon, title, value, color }) => (
    <View style={styles.infoCard}>
      <View style={[styles.infoIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  const ActionButton = ({ icon, title, subtitle, color, onPress }) => (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIconCircle, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <Text style={styles.actionButtonTitle}>{title}</Text>
      <Text style={styles.actionButtonSubtitle}>{subtitle}</Text>
      <View style={[styles.actionArrow, { backgroundColor: color }]}>
        <Ionicons name="arrow-forward" size={20} color="#ffffff" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#2563eb" />
      }
    >
      <Animated.View style={{ opacity: fadeAnim }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Health Tracking</Text>
          <Text style={styles.subtitle}>Monitor your symptoms and risk factors</Text>
        </View>

        {/* Progress Overview */}
        <View style={styles.section}>
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View>
                <Text style={styles.progressTitle}>Health Data Completion</Text>
                <Text style={styles.progressSubtitle}>
                  {diseaseData?.answeredQuestions || 0} of {diseaseData?.totalQuestions || 0} questions answered
                </Text>
              </View>
              <View style={styles.progressCircle}>
                {/* Clean circular indicator with percentage text */}
                <View style={{
                  width: 70,
                  height: 70,
                  borderRadius: 35,
                  borderWidth: 6,
                  borderColor: completionPct === 100 ? '#2563eb' : '#e2e8f0',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                }}>
                  <Text style={[styles.progressPercentage, { fontSize: 20 }]}>{completionPct}%</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${completionPct}%` }]} />
            </View>

            {completionPct < 100 && (
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={() => navigation.navigate('DiseaseData')}
              >
                <Text style={styles.continueButtonText}>Continue Onboarding</Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoGrid}>
          <InfoCard
            icon="calendar-outline"
            title="Last Updated"
            value={diseaseData?.lastUpdated 
              ? new Date(diseaseData.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'Never'
            }
            color="#2563eb"
          />
          <InfoCard
            icon="checkmark-circle-outline"
            title="Status"
            value={completionPct === 100 ? 'Complete' : 'In Progress'}
            color={completionPct === 100 ? '#10b981' : '#f59e0b'}
          />
        </View>

        {/* Main Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Actions</Text>
          
          <ActionButton
            icon="clipboard-outline"
            title="Update Health Data"
            subtitle="Manage your symptoms and conditions"
            color="#2563eb"
            onPress={() => navigation.navigate('DiseaseData')}
          />

          <ActionButton
            icon="shield-checkmark-outline"
            title="Risk Assessment"
            subtitle="Check your diabetes risk level"
            color="#ff9800"
            onPress={() => navigation.navigate('Assessment')}
          />
        </View>

        {/* Health Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Tips</Text>
          <View style={styles.tipCard}>
            <Ionicons name="bulb-outline" size={24} color="#10b981" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Keep your data updated</Text>
              <Text style={styles.tipText}>
                Regular updates help us provide more accurate health insights and recommendations.
              </Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7fb',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    flexWrap: 'wrap',
    marginTop: 48, // Further increased margin for maximum visibility
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    flexWrap: 'wrap',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 16,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 13,
    color: '#64748b',
    flexWrap: 'wrap',
  },
  progressCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2563eb15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2563eb',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  continueButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  actionButton: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    position: 'relative',
  },
  actionIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  actionButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  actionArrow: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#10b98115',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#10b98130',
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
    flexWrap: 'wrap',
  },
});

export default SymptomsScreen;
