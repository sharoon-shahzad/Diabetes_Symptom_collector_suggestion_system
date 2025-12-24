import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  useWindowDimensions,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import RenderHtml from 'react-native-render-html';
import api from '../utils/api';
import { initPromise } from '../utils/api';

const { width, height } = Dimensions.get('window');

// Default placeholder image URL
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80';

const ContentDetailScreen = ({ route, navigation }) => {
  const { contentId } = route.params;
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { width } = useWindowDimensions();

  useEffect(() => {
    loadContent();
  }, [contentId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      await initPromise;
      const response = await api.get(`/content/${contentId}`);
      setContent(response.data.data);
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading article...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !content) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#0f172a" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadContent}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const categoryColor = content.category?.color || getCategoryColor(content.category?.name);

  // HTML rendering configuration
  const htmlStyles = {
    body: {
      fontSize: 16,
      color: '#334155',
      lineHeight: 28,
    },
    p: {
      marginBottom: 16,
      textAlign: 'justify',
    },
    h1: {
      fontSize: 24,
      fontWeight: '700',
      color: '#0f172a',
      marginTop: 24,
      marginBottom: 12,
    },
    h2: {
      fontSize: 22,
      fontWeight: '700',
      color: '#0f172a',
      marginTop: 20,
      marginBottom: 10,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      color: '#0f172a',
      marginTop: 18,
      marginBottom: 8,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1e293b',
      marginTop: 16,
      marginBottom: 8,
    },
    ul: {
      marginBottom: 16,
      paddingLeft: 8,
    },
    ol: {
      marginBottom: 16,
      paddingLeft: 8,
    },
    li: {
      marginBottom: 8,
      lineHeight: 24,
    },
    strong: {
      fontWeight: '700',
      color: '#0f172a',
    },
    em: {
      fontStyle: 'italic',
      color: '#475569',
    },
    a: {
      color: '#2563eb',
      textDecorationLine: 'underline',
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: '#2563eb',
      backgroundColor: '#f8fafc',
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 12,
      paddingBottom: 12,
      marginVertical: 16,
      fontStyle: 'italic',
      color: '#475569',
    },
    code: {
      backgroundColor: '#f1f5f9',
      color: '#dc2626',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: 'monospace',
      fontSize: 14,
    },
    pre: {
      backgroundColor: '#1e293b',
      padding: 16,
      borderRadius: 8,
      marginVertical: 16,
      overflow: 'scroll',
    },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header - Overlay on image */}
      <View style={styles.headerOverlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="bookmark-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="heart-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Article Label */}
        <View style={styles.articleLabelContainer}>
          <Text style={styles.articleLabel}>ARTICLE</Text>
        </View>

        {/* Featured Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: content.featuredImage?.url || DEFAULT_IMAGE }}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />
        </View>

        {/* Content Container */}
        <View style={styles.contentWrapper}>
          {/* Category Badge */}
          <View style={styles.categoryContainer}>
            <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}15` }]}>
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {content.category?.name || 'General'}
              </Text>
            </View>
            {content.isFeatured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={14} color="#f59e0b" />
                <Text style={styles.featuredText}>Featured</Text>
              </View>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{content.title}</Text>

          {/* Meta Information */}
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#64748b" />
              <Text style={styles.metaText}>
                {formatDate(content.publishedAt || content.createdAt)}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color="#64748b" />
              <Text style={styles.metaText}>{content.readingTime || 1} min read</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="eye-outline" size={16} color="#64748b" />
              <Text style={styles.metaText}>{content.viewCount || 0} views</Text>
            </View>
          </View>

          {/* Excerpt */}
          {content.excerpt && (
            <View style={styles.excerptContainer}>
              <Text style={styles.excerpt}>{content.excerpt}</Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Content */}
          <View style={styles.contentContainer}>
            <RenderHtml
              contentWidth={width - 40}
              source={{ html: content.content || '<p>No content available</p>' }}
              tagsStyles={htmlStyles}
              baseStyle={{
                fontSize: 16,
                color: '#334155',
              }}
            />
          </View>

          {/* Tags */}
          {content.tags && content.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>Tags</Text>
              <View style={styles.tagsWrapper}>
                {content.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Author Info */}
          {content.author && (
            <View style={styles.authorContainer}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorInitial}>
                  {content.author.fullName?.[0]?.toUpperCase() || 'A'}
                </Text>
              </View>
              <View style={styles.authorInfo}>
                <Text style={styles.authorLabel}>Written by</Text>
                <Text style={styles.authorName}>{content.author.fullName || 'Author'}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  imageContainer: {
    width: width,
    height: height * 0.4,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  articleLabelContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: 'center',
  },
  articleLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  contentWrapper: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 0,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#fef3c7',
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d97706',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 34,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  excerptContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    marginBottom: 20,
  },
  excerpt: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 20,
  },
  contentContainer: {
    marginBottom: 24,
  },
  tagsContainer: {
    marginBottom: 24,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  authorInfo: {
    flex: 1,
  },
  authorLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
    fontWeight: '500',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
});

export default ContentDetailScreen;
