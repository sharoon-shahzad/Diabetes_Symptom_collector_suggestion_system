import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text,
  StyleSheet, 
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Animated,
  TextInput,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { fetchSymptoms, fetchQuestionsBySymptom, submitAnswer } from '../utils/api';

const { width } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation();
  
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptomIndex, setCurrentSymptomIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    loadSymptoms();
  }, []);

  useEffect(() => {
    if (symptoms.length > 0 && currentSymptomIndex < symptoms.length) {
      loadQuestions(symptoms[currentSymptomIndex]._id);
      
      // Animate content entry
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.95);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [symptoms, currentSymptomIndex]);

  const loadSymptoms = async () => {
    try {
      console.log('Fetching symptoms...');
      const data = await fetchSymptoms();
      console.log('Symptoms data:', data);
      setSymptoms(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching symptoms:', err);
      setError('Failed to load symptoms');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (symptomName) => {
    setQuestionsLoading(true);
    fadeAnim.setValue(0);
    try {
      console.log('Fetching questions for symptom:', symptomName);
      const data = await fetchQuestionsBySymptom(symptomName);
      console.log('Questions data:', data);
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setQuestionsLoading(false);
    }
  };

  const handleAnswer = (questionId, answerId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }));
  };

  const handleNext = async () => {
    if (currentSymptomIndex < symptoms.length - 1) {
      await submitCurrentAnswers();
      setCurrentSymptomIndex(prev => prev + 1);
    } else {
      // Final submission - complete onboarding
      await submitCurrentAnswers();
      console.log('✅ Onboarding completed - navigating to Dashboard');
      navigation.navigate('Dashboard');
    }
  };

  const handlePrevious = () => {
    if (currentSymptomIndex > 0) {
      setCurrentSymptomIndex(prev => prev - 1);
    }
  };

  const submitCurrentAnswers = async () => {
    setSubmitting(true);
    try {
      const currentQuestions = questions;
      const promises = currentQuestions.map(async (question) => {
        const answerId = answers[question._id];
        if (answerId) {
          await submitAnswer(question._id, answerId);
        }
      });
      await Promise.all(promises);
      console.log('Submitted answers for symptom:', symptoms[currentSymptomIndex].name);
    } catch (err) {
      console.error('Error submitting answers:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <LinearGradient
          colors={['#f8fafc', '#ffffff', '#f1f5f9']}
          style={StyleSheet.absoluteFillObject}
        />
        
        <View style={styles.loadingContainer}>
          <View style={styles.loadingIconWrapper}>
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.loadingIcon}
            >
              <Ionicons name="medical" size={48} color="#ffffff" />
            </LinearGradient>
          </View>
          <Text style={styles.loadingTitle}>Preparing Your Assessment</Text>
          <Text style={styles.loadingSubtitle}>
            Loading health questionnaire...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <LinearGradient
          colors={['#f8fafc', '#ffffff', '#f1f5f9']}
          style={StyleSheet.absoluteFillObject}
        />
        
        <View style={styles.errorContainer}>
          <View style={styles.errorCard}>
            <View style={styles.errorIconContainer}>
              <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
            </View>
            <Text style={styles.errorTitle}>Unable to Load</Text>
            <Text style={styles.errorMessage}>
              {error || 'Something went wrong. Please try again.'}
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={loadSymptoms}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="refresh" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Try Again</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (symptoms.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <LinearGradient
          colors={['#f8fafc', '#ffffff', '#f1f5f9']}
          style={StyleSheet.absoluteFillObject}
        />
        
        <View style={styles.emptyContainer}>
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>No Questions Available</Text>
            <Text style={styles.emptyMessage}>
              Please contact support if this issue persists.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentSymptom = symptoms[currentSymptomIndex];
  const progress = ((currentSymptomIndex + 1) / symptoms.length) * 100;
  const answeredInCurrentSection = questions.filter(q => answers[q._id]).length;
  const totalInCurrentSection = questions.length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <LinearGradient
        colors={['#f8fafc', '#ffffff', '#f1f5f9']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Modern Header */}
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBadge}>
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  style={styles.iconGradient}
                >
                  <Ionicons name="medical-outline" size={24} color="#ffffff" />
                </LinearGradient>
              </View>
              <View style={styles.headerText}>
                <Text style={styles.headerTitle}>Health Assessment</Text>
                <Text style={styles.headerSubtitle}>
                  Complete your profile for personalized insights
                </Text>
              </View>
            </View>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressSection}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                Section {currentSymptomIndex + 1} of {symptoms.length}
              </Text>
              <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${progress}%`,
                    transform: [{ scale: scaleAnim }],
                  },
                ]}
              >
                <LinearGradient
                  colors={['#3b82f6', '#2563eb']}
                  style={styles.progressGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </Animated.View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Symptom Category Badge */}
        <View style={styles.categoryBadge}>
          <View style={styles.categoryIcon}>
            <Ionicons name="pulse" size={16} color="#3b82f6" />
          </View>
          <Text style={styles.categoryText}>{currentSymptom?.name}</Text>
          <View style={styles.categoryCount}>
            <Text style={styles.categoryCountText}>
              {answeredInCurrentSection}/{totalInCurrentSection}
            </Text>
          </View>
        </View>

        {/* Questions Container */}
        <Animated.View
          style={[
            styles.questionsContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {questionsLoading ? (
            <View style={styles.loadingQuestions}>
              <View style={styles.spinner}>
                <Ionicons name="hourglass-outline" size={32} color="#3b82f6" />
              </View>
              <Text style={styles.loadingQuestionsText}>Loading questions...</Text>
            </View>
          ) : questions.length === 0 ? (
            <View style={styles.noQuestions}>
              <Ionicons name="information-circle-outline" size={40} color="#94a3b8" />
              <Text style={styles.noQuestionsText}>
                No questions available for this category.
              </Text>
            </View>
          ) : (
            questions.map((question, index) => (
              <View key={question._id} style={styles.questionCard}>
                <View style={styles.questionHeader}>
                  <View style={styles.questionNumber}>
                    <Text style={styles.questionNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.questionText}>{question.question_text}</Text>
                </View>

                <View style={styles.answerSection}>
                  {renderQuestionInput(question)}
                </View>
              </View>
            ))
          )}
        </Animated.View>

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          {currentSymptomIndex > 0 && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handlePrevious}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={20} color="#3b82f6" />
              <Text style={styles.secondaryButtonText}>Previous</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.primaryButton,
              currentSymptomIndex === 0 && styles.fullWidthButton,
            ]}
            onPress={handleNext}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={submitting ? ['#94a3b8', '#64748b'] : ['#3b82f6', '#2563eb']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.buttonText}>
                {submitting
                  ? 'Submitting...'
                  : currentSymptomIndex === symptoms.length - 1
                  ? 'Complete Assessment'
                  : 'Next Section'}
              </Text>
              {!submitting && (
                <Ionicons name="chevron-forward" size={20} color="#ffffff" />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // Helper function to render different question types
  function renderQuestionInput(question) {
    const selectedAnswer = answers[question._id];

    switch (question.question_type) {
      case 'radio':
        return (
          <View style={styles.radioGroup}>
            {question.options?.map((option, idx) => (
              <TouchableOpacity
                key={`${question._id}-${idx}`}
                style={[
                  styles.radioOption,
                  selectedAnswer === option && styles.radioOptionSelected,
                ]}
                onPress={() => handleAnswer(question._id, option)}
                activeOpacity={0.7}
              >
                <View style={styles.radioCircle}>
                  {selectedAnswer === option && (
                    <View style={styles.radioCircleSelected} />
                  )}
                </View>
                <Text
                  style={[
                    styles.radioText,
                    selectedAnswer === option && styles.radioTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 'text':
      case 'textarea':
        return (
          <TextInput
            style={[
              styles.textInput,
              question.question_type === 'textarea' && styles.textareaInput,
            ]}
            placeholder="Type your answer here..."
            placeholderTextColor="#94a3b8"
            value={selectedAnswer || ''}
            onChangeText={(value) => handleAnswer(question._id, value)}
            multiline={question.question_type === 'textarea'}
            numberOfLines={question.question_type === 'textarea' ? 4 : 1}
          />
        );

      case 'number':
        return (
          <TextInput
            style={styles.textInput}
            placeholder="Enter a number..."
            placeholderTextColor="#94a3b8"
            value={selectedAnswer || ''}
            onChangeText={(value) => handleAnswer(question._id, value)}
            keyboardType="numeric"
          />
        );

      case 'email':
        return (
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email..."
            placeholderTextColor="#94a3b8"
            value={selectedAnswer || ''}
            onChangeText={(value) => handleAnswer(question._id, value)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        );

      case 'tel':
        return (
          <TextInput
            style={styles.textInput}
            placeholder="Enter phone number..."
            placeholderTextColor="#94a3b8"
            value={selectedAnswer || ''}
            onChangeText={(value) => handleAnswer(question._id, value)}
            keyboardType="phone-pad"
          />
        );

      default:
        return (
          <View style={styles.unsupportedType}>
            <Ionicons name="alert-circle-outline" size={20} color="#f59e0b" />
            <Text style={styles.unsupportedText}>
              Question type "{question.question_type}" is not supported.
            </Text>
          </View>
        );
    }
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingIconWrapper: {
    marginBottom: 32,
  },
  loadingIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  errorIconContainer: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 40,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Header
  headerContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTop: {
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBadge: {
    marginRight: 16,
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },

  // Progress Section
  progressSection: {
    marginTop: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3b82f6',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressGradient: {
    flex: 1,
    borderRadius: 8,
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // Category Badge
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginRight: 12,
  },
  categoryCount: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },

  // Questions Container
  questionsContainer: {
    gap: 20,
  },
  loadingQuestions: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  spinner: {
    marginBottom: 16,
  },
  loadingQuestionsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  noQuestions: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noQuestionsText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 22,
  },

  // Question Card
  questionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  questionNumber: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 24,
  },

  // Answer Section
  answerSection: {
    marginTop: 8,
  },

  // Radio Group
  radioGroup: {
    gap: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  radioOptionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioCircleSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
  },
  radioText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  radioTextSelected: {
    color: '#0f172a',
    fontWeight: '600',
  },

  // Text Input
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#0f172a',
    minHeight: 48,
  },
  textareaInput: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },

  // Unsupported Type
  unsupportedType: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  unsupportedText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    marginLeft: 10,
    lineHeight: 20,
  },

  // Navigation Buttons
  navigationButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fullWidthButton: {
    flex: 1,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3b82f6',
  },
});

export default OnboardingScreen;