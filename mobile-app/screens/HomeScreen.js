import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import api from '../utils/api';
import { initPromise } from '../utils/api';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [diseaseData, setDiseaseData] = useState(null);
  const [completionPct, setCompletionPct] = useState(0);
  const [cmsContent, setCmsContent] = useState([]);
  const [loadingCms, setLoadingCms] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    loadCmsContent();
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
      // If 401 error, user will be logged out automatically by interceptor
      if (error.response?.status === 401) {
        navigation.replace('Login');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCmsContent = async () => {
    try {
      setLoadingCms(true);
      await initPromise; // Wait for API initialization
      const response = await api.get('/content', {
        params: {
          status: 'published',
          limit: 5,
          sort: '-publishedAt',
        }
      });
      setCmsContent(response.data.data || []);
    } catch (error) {
      console.error('Error loading CMS content:', error);
    } finally {
      setLoadingCms(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
    loadCmsContent();
  };

  const getCategoryColor = (categoryName) => {
    const colors = {
      'nutrition': '#10b981',
      'exercise': '#f59e0b',
      'lifestyle': '#8b5cf6',
      'health': '#ef4444',
      'tips': '#06b6d4',
      'news': '#2563eb',
    };
    return colors[categoryName?.toLowerCase()] || '#64748b';
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const ContentCard = ({ item }) => {
    const categoryColor = item.category?.color || getCategoryColor(item.category?.name);
    
    return (
      <TouchableOpacity 
        style={styles.contentCard} 
        activeOpacity={0.7}
        onPress={() => {
          navigation.navigate('ContentDetail', { contentId: item._id });
        }}
      >
        <View style={styles.contentHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15` }]}>
            <Text style={[styles.categoryText, { color: categoryColor }]}>
              {item.category?.name || 'General'}
            </Text>
          </View>
          {item.isFeatured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color="#f59e0b" />
            </View>
          )}
        </View>
        
        <Text style={styles.contentTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={styles.contentExcerpt} numberOfLines={2}>
          {item.excerpt}
        </Text>
        
        <View style={styles.contentFooter}>
          <View style={styles.contentMeta}>
            <Ionicons name="time-outline" size={14} color="#94a3b8" />
            <Text style={styles.metaText}>{item.readingTime || 1} min read</Text>
          </View>
          <View style={styles.contentMeta}>
            <Ionicons name="eye-outline" size={14} color="#94a3b8" />
            <Text style={styles.metaText}>{item.viewCount || 0} views</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ActionCard = ({ icon, title, subtitle, color, onPress, badge }) => (
    <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      {badge && (
        <View style={[styles.badge, { backgroundColor: color }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={20} color="#64748b" />
    </TouchableOpacity>
  );

  const isDiagnosed = user?.diabetes_diagnosed === 'yes';

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
          <View style={{ flex: 1 }}>
            <Text style={styles.appName}>Diavise</Text>
            <Text style={styles.appTagline}>Your Health Companion</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileBadge}
            onPress={() => navigation.navigate('Profile')}
          >
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              style={styles.profileGradient}
            >
              <Text style={styles.profileInitial}>
                {(user?.fullName?.[0] || 'U').toUpperCase()}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* CMS Content Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Resources</Text>
            {loadingCms && <ActivityIndicator size="small" color="#2563eb" />}
          </View>
          
          {!loadingCms && cmsContent.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
              <Text style={styles.emptyStateText}>No content available</Text>
            </View>
          ) : (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.contentScrollContainer}
            >
              {cmsContent.map((item) => (
                <ContentCard key={item._id} item={item} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          {!isDiagnosed && (
            <>
              <ActionCard
                icon="shield-checkmark-outline"
                title="Check Your Risk"
                subtitle="Take a diabetes risk assessment"
                color="#ff9800"
                onPress={() => navigation.navigate('Assessment')}
              />
              <ActionCard
                icon="fitness-outline"
                title="Update Health Data"
                subtitle={`${completionPct}% completed`}
                color="#2196f3"
                onPress={() => navigation.navigate('DiseaseData')}
                badge={completionPct < 100 ? `${100 - completionPct}%` : null}
              />
            </>
          )}

          {isDiagnosed && (
            <>
              <ActionCard
                icon="sparkles-outline"
                title="Personalized Suggestions"
                subtitle="Diet, exercise & lifestyle tips"
                color="#10b981"
                onPress={() => navigation.navigate('PersonalizedDashboard')}
              />
              <ActionCard
                icon="chatbubbles-outline"
                title="Chat Assistant"
                subtitle="Ask health-related questions"
                color="#2563eb"
                onPress={() => navigation.navigate('ChatScreen')}
              />
            </>
          )}

          <ActionCard
            icon="chatbox-ellipses-outline"
            title="Give Feedback"
            subtitle="Help us improve"
            color="#64748b"
            onPress={() => navigation.navigate('Feedback')}
          />
        </View>

        {/* Last Assessment */}
        {user?.last_assessment_at && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Assessment</Text>
            <View style={styles.infoCard}>
              <Ionicons name="calendar-outline" size={20} color="#2563eb" />
              <Text style={styles.infoText}>
                {new Date(user.last_assessment_at).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
          </View>
        )}
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
    paddingTop: 24,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 32,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
  },
  appTagline: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  profileBadge: {
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  profileGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  contentScrollContainer: {
    paddingRight: 16,
  },
  contentCard: {
    width: width * 0.75,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  featuredBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    lineHeight: 24,
  },
  contentExcerpt: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 12,
  },
  contentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  contentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
    fontWeight: '500',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
    marginRight: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  actionSubtitle: {
    fontSize: 13,
    color: '#64748b',
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  infoCard: {
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
  infoText: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '500',
  },
});

export default HomeScreen;
