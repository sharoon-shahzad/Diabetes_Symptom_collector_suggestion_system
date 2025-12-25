import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../utils/api';

const categoryList = [
  'Overall System Experience',
  'Onboarding Process',
  'Assessment Feature',
  'Dashboard Experience',
  'Content & Resources',
  'Technical Aspects',
  'Open Feedback',
];

const FeedbackScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [categoryRatings, setCategoryRatings] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load feedback on mount and when screen focuses
  useFocusEffect(
    useCallback(() => {
      loadFeedback();
    }, [])
  );

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get('/feedback/my-feedback');
      setFeedbackList(response.data.data.feedback || []);
    } catch (error) {
      console.error('Error loading feedback:', error);
      Alert.alert('Error', 'Failed to load feedback');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadFeedback();
  };

  const handleNewFeedback = () => {
    setEditingFeedback(null);
    setRating(0);
    setComment('');
    setIsAnonymous(false);
    setCategoryRatings({});
    setShowForm(true);
  };

  const handleEditFeedback = (item) => {
    setEditingFeedback(item);
    setRating(item.rating || 0);
    setComment(item.comment || '');
    setIsAnonymous(item.is_anonymous || false);
    setCategoryRatings(item.category_ratings || {});
    setShowForm(true);
  };

  const handleDeleteFeedback = (id) => {
    Alert.alert(
      'Delete Feedback',
      'Are you sure you want to delete this feedback?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/feedback/${id}`);
              Alert.alert('Success', 'Feedback deleted successfully');
              loadFeedback();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete feedback');
            }
          },
        },
      ]
    );
  };

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please provide a rating');
      return;
    }

    setSubmitting(true);
    try {
      if (editingFeedback) {
        // Update existing feedback
        await api.put(`/feedback/${editingFeedback._id}`, {
          rating,
          comment: comment || null,
          is_anonymous: isAnonymous,
          category_ratings: categoryRatings,
        });
        Alert.alert('Success', 'Feedback updated successfully');
      } else {
        // Submit new feedback
        await api.post('/feedback', {
          rating,
          comment: comment || null,
          is_anonymous: isAnonymous,
          category_ratings: categoryRatings,
        });
        Alert.alert('Success', 'Feedback submitted successfully');
      }
      setShowForm(false);
      loadFeedback();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCategoryRating = (category, value) => {
    setCategoryRatings((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const renderStars = (currentRating, onPress) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <Ionicons
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={32}
              color={star <= currentRating ? '#FFB800' : theme.colors.text.disabled}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderSmallStars = (currentRating, onPress) => {
    return (
      <View style={styles.smallStarsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress && onPress(star)}
            disabled={!onPress}
          >
            <Ionicons
              name={star <= currentRating ? 'star' : 'star-outline'}
              size={20}
              color={star <= currentRating ? '#FFB800' : theme.colors.text.disabled}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate stats
  const totalCount = feedbackList.length;
  const averageRating = totalCount > 0
    ? (feedbackList.reduce((sum, f) => sum + (f.rating || 0), 0) / totalCount).toFixed(1)
    : '0.0';

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <LinearGradient colors={theme.colors.backgroundGradient} style={StyleSheet.absoluteFillObject} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading feedback...
          </Text>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>My Feedback</Text>
            <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
              Track your submissions and share your experience
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Total Submissions</Text>
            <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{totalCount}</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>Average Rating</Text>
            <View style={styles.statValueRow}>
              <Ionicons name="star" size={20} color="#FFB800" />
              <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>{averageRating}</Text>
            </View>
          </Card>
        </View>

        {/* Submit Button */}
        <Button
          title="Submit New Feedback"
          onPress={handleNewFeedback}
          variant="primary"
          fullWidth
          style={styles.submitButton}
          icon={<Ionicons name="add-circle-outline" size={20} color="#fff" />}
        />

        {/* Feedback List */}
        <View style={styles.feedbackListContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Your Feedback History
          </Text>

          {feedbackList.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Ionicons name="chatbubbles-outline" size={64} color={theme.colors.text.disabled} />
              <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
                No feedback submitted yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.colors.text.disabled }]}>
                Share your experience to help us improve
              </Text>
            </Card>
          ) : (
            feedbackList.map((item) => (
              <Card key={item._id} style={styles.feedbackCard}>
                <View style={styles.feedbackHeader}>
                  <View style={styles.feedbackRating}>
                    {renderSmallStars(item.rating)}
                  </View>
                  <View style={styles.feedbackActions}>
                    <TouchableOpacity onPress={() => handleEditFeedback(item)} style={styles.actionButton}>
                      <Ionicons name="pencil" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDeleteFeedback(item._id)} style={styles.actionButton}>
                      <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                {item.comment && (
                  <Text style={[styles.feedbackComment, { color: theme.colors.text.primary }]}>
                    {item.comment}
                  </Text>
                )}

                <View style={styles.feedbackFooter}>
                  <Text style={[styles.feedbackDate, { color: theme.colors.text.secondary }]}>
                    {formatDate(item.submitted_on)}
                  </Text>
                  {item.is_anonymous && (
                    <View style={[styles.anonymousBadge, { backgroundColor: `${theme.colors.primary}15` }]}>
                      <Text style={[styles.anonymousText, { color: theme.colors.primary }]}>
                        Anonymous
                      </Text>
                    </View>
                  )}
                </View>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Feedback Form Modal */}
      <Modal
        visible={showForm}
        animationType="slide"
        onRequestClose={() => setShowForm(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
          <LinearGradient colors={theme.colors.backgroundGradient} style={StyleSheet.absoluteFillObject} />
          
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
                {editingFeedback ? 'Edit Feedback' : 'Share Your Feedback'}
              </Text>
              <TouchableOpacity onPress={() => setShowForm(false)}>
                <Ionicons name="close" size={28} color={theme.colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Overall Rating */}
            <Card style={styles.formCard}>
              <Text style={[styles.formLabel, { color: theme.colors.text.primary }]}>
                Overall Rating <Text style={{ color: theme.colors.error }}>*</Text>
              </Text>
              {renderStars(rating, setRating)}
              {rating > 0 && (
                <Text style={[styles.ratingText, { color: theme.colors.text.secondary }]}>
                  {rating} {rating === 1 ? 'star' : 'stars'}
                </Text>
              )}
            </Card>

            {/* Comment */}
            <Card style={styles.formCard}>
              <Text style={[styles.formLabel, { color: theme.colors.text.primary }]}>
                Comments or Suggestions (Optional)
              </Text>
              <TextInput
                style={[styles.commentInput, { 
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.border,
                }]}
                value={comment}
                onChangeText={setComment}
                placeholder="Share your thoughts, suggestions, or any issues..."
                placeholderTextColor={theme.colors.text.disabled}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </Card>

            {/* Category Ratings */}
            <Card style={styles.formCard}>
              <Text style={[styles.formLabel, { color: theme.colors.text.primary }]}>
                Category Ratings (Optional)
              </Text>
              {categoryList.map((category) => (
                <View key={category} style={styles.categoryItem}>
                  <Text style={[styles.categoryLabel, { color: theme.colors.text.secondary }]}>
                    {category}
                  </Text>
                  {renderSmallStars(categoryRatings[category] || 0, (value) => handleCategoryRating(category, value))}
                </View>
              ))}
            </Card>

            {/* Anonymous Toggle */}
            <TouchableOpacity
              style={styles.anonymousToggle}
              onPress={() => setIsAnonymous(!isAnonymous)}
            >
              <Ionicons
                name={isAnonymous ? 'checkbox' : 'square-outline'}
                size={24}
                color={theme.colors.primary}
              />
              <Text style={[styles.anonymousLabel, { color: theme.colors.text.secondary }]}>
                Submit anonymously
              </Text>
            </TouchableOpacity>

            {/* Form Buttons */}
            <View style={styles.formButtons}>
              <Button
                title="Cancel"
                onPress={() => setShowForm(false)}
                variant="outline"
                style={styles.formButton}
              />
              <Button
                title={submitting ? 'Submitting...' : (editingFeedback ? 'Update' : 'Submit')}
                onPress={handleSubmitFeedback}
                variant="primary"
                disabled={submitting || rating === 0}
                loading={submitting}
                style={styles.formButton}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  submitButton: {
    marginBottom: 20,
  },
  feedbackListContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  feedbackCard: {
    padding: 14,
    marginBottom: 10,
  },
  feedbackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  feedbackRating: {
    flex: 1,
  },
  feedbackActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  feedbackComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  feedbackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackDate: {
    fontSize: 12,
  },
  anonymousBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  anonymousText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  smallStarsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  formCard: {
    padding: 14,
    marginBottom: 14,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  ratingText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  commentInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  anonymousToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  anonymousLabel: {
    fontSize: 14,
    flex: 1,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    flex: 1,
  },
});

export default FeedbackScreen;
