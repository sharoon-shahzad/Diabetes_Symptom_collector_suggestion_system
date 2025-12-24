import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AssessmentInsightModal = ({ visible, riskLevel, probability, assessedAt, onSelectAnswer }) => {
  const prettyRisk = riskLevel
    ? riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1).toLowerCase()
    : 'Unknown';

  const probPercent = probability != null ? Math.round(Number(probability) * 100) : null;

  const getRiskColor = () => {
    const level = (riskLevel || '').toLowerCase();
    if (level === 'low') return ['#10b981', '#059669'];
    if (level === 'medium') return ['#f59e0b', '#d97706'];
    return ['#ef4444', '#dc2626'];
  };

  const getRiskBadgeColor = () => {
    const level = (riskLevel || '').toLowerCase();
    if (level === 'low') return '#10b981';
    if (level === 'medium') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => {
        console.log('⚠️ User tried to close assessment modal - preventing');
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Title */}
            <Text style={styles.title}>Your latest diabetes risk insight</Text>

            {/* Risk Badge */}
            <View style={[styles.riskBadge, { backgroundColor: `${getRiskBadgeColor()}15` }]}>
              <Text style={[styles.riskBadgeText, { color: getRiskBadgeColor() }]}>
                Risk level: {prettyRisk}
              </Text>
            </View>

            {/* Probability */}
            {probPercent !== null && (
              <Text style={styles.probability}>
                Estimated probability: {probPercent}%
              </Text>
            )}

            {/* Timestamp */}
            {assessedAt && (
              <Text style={styles.timestamp}>
                Based on your symptom assessment from{'\n'}
                {new Date(assessedAt).toLocaleString()}
              </Text>
            )}

            {/* Description */}
            <Text style={styles.description}>
              This assessment estimates your chance of having diabetes using your answers. 
              It helps you decide when to get checked, but it cannot confirm whether you have diabetes.
            </Text>

            {/* What to do next */}
            <View style={styles.nextStepsContainer}>
              <Text style={styles.nextStepsTitle}>What should you do next?</Text>
              <Text style={styles.nextStepsText}>
                We strongly recommend booking blood tests for diabetes (such as fasting blood 
                sugar or HbA1c) and discussing these results with a healthcare professional.
              </Text>
            </View>

            {/* Disclaimer */}
            <Text style={styles.disclaimer}>
              This tool is not a diagnosis and does not replace medical advice.
            </Text>

            {/* Question */}
            <Text style={styles.question}>
              Have you already had tests and received a diagnosis for diabetes?
            </Text>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              {/* Option 1: Diagnosed with diabetes */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => onSelectAnswer('diagnosed_diabetic')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={getRiskColor()}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>
                    Yes – I have been diagnosed with diabetes
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Option 2: Tested and not diabetic */}
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => onSelectAnswer('diagnosed_not_diabetic')}
                activeOpacity={0.8}
              >
                <Text style={styles.outlineButtonText}>
                  Yes – I had tests and was told I am not diabetic
                </Text>
              </TouchableOpacity>

              {/* Option 3: Not tested yet */}
              <TouchableOpacity
                style={styles.textButton}
                onPress={() => onSelectAnswer('not_tested_yet')}
                activeOpacity={0.7}
              >
                <Text style={styles.textButtonText}>
                  Not yet – I have not had tests for diabetes
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 15,
  },
  scrollContent: {
    padding: 28,
    paddingBottom: 36,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 32,
  },
  riskBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 12,
  },
  riskBadgeText: {
    fontSize: 15,
    fontWeight: '800',
  },
  probability: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  nextStepsContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  nextStepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  nextStepsText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  question: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
  },
  outlineButton: {
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563eb',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2563eb',
    textAlign: 'center',
  },
  textButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  textButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    textAlign: 'center',
  },
});

export default AssessmentInsightModal;
