import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import api from '../utils/api';

const ProfileScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get('/auth/profile');
        setProfileData(res.data.data.user);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfileData(user); // Fallback to context user
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const displayUser = profileData || user;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await logout();
              // Small delay to ensure state updates propagate
              await new Promise(resolve => setTimeout(resolve, 100));
              setLoading(false);
              // Use replace instead of reset to ensure clean navigation
              navigation.replace('Welcome');
            } catch (error) {
              console.error('Logout error:', error);
              setLoading(false);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const InfoRow = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
          <Ionicons name={icon} size={20} color={theme.colors.primary} />
        </View>
        <Text style={[styles.infoLabel, { color: theme.colors.text.secondary }]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.infoValue, { color: theme.colors.text.primary }]} numberOfLines={1}>
        {value || 'Not set'}
      </Text>
    </View>
  );

  const ActionButton = ({ icon, label, onPress, variant = 'default' }) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        {
          backgroundColor: variant === 'danger' 
            ? `${theme.colors.error}10` 
            : `${theme.colors.primary}05`,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionLeft}>
        <Ionicons 
          name={icon} 
          size={22} 
          color={variant === 'danger' ? theme.colors.error : theme.colors.primary} 
        />
        <Text 
          style={[
            styles.actionLabel, 
            { color: variant === 'danger' ? theme.colors.error : theme.colors.text.primary }
          ]}
        >
          {label}
        </Text>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={variant === 'danger' ? theme.colors.error : theme.colors.text.secondary} 
      />
    </TouchableOpacity>
  );

  if (loading && !profileData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
        <LinearGradient
          colors={theme.colors.backgroundGradient}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />

      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            Profile
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Profile Card - Modern */}
        <View style={styles.profileCardWrapper}>
          <LinearGradient
            colors={[theme.colors.primary, '#1e40af']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.profileGradientCard}
          >
            {/* Decorative circles */}
            <View style={[styles.decorativeCircle, styles.circle1]} />
            <View style={[styles.decorativeCircle, styles.circle2]} />
            
            <View style={styles.profileCardContent}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatarRing}>
                  <View style={styles.avatarInner}>
                    <Text style={styles.avatarText}>
                      {displayUser?.fullName?.[0]?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>
                  {displayUser?.fullName || 'User'}
                </Text>
                <View style={styles.emailContainer}>
                  <Ionicons name="mail" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.profileEmail}>
                    {displayUser?.email || 'No email'}
                  </Text>
                </View>
                {displayUser?.diabetes_diagnosed && (
                  <View style={styles.diseaseBadge}>
                    <Ionicons name="medical" size={13} color="#fff" />
                    <Text style={styles.diseaseText}>
                      {displayUser.diabetes_diagnosed === 'yes' 
                        ? 'Diagnosed with Diabetes' 
                        : displayUser.diabetes_diagnosed === 'no'
                        ? 'Not Diabetic'
                        : 'Diabetes Risk Assessment'}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Personal Information
            </Text>
            <View style={[styles.sectionBadge, { backgroundColor: `${theme.colors.primary}15` }]}>
              <Ionicons name="person" size={14} color={theme.colors.primary} />
            </View>
          </View>
          <Card elevation="md" style={styles.infoCard}>
            <InfoRow icon="person-outline" label="Full Name" value={displayUser?.fullName} />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <InfoRow icon="mail-outline" label="Email" value={displayUser?.email} />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <InfoRow 
              icon="call-outline" 
              label="Phone" 
              value={
                displayUser?.phone_number 
                  ? `${displayUser?.country_code || ''} ${displayUser?.phone_number}`.trim()
                  : 'Not set'
              } 
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <InfoRow 
              icon="medical-outline" 
              label="Condition" 
              value={
                displayUser?.diabetes_diagnosed === 'yes' 
                  ? 'Diagnosed with Diabetes' 
                  : displayUser?.diabetes_diagnosed === 'no'
                  ? 'Not Diabetic (Tested)'
                  : 'Not yet diagnosed'
              } 
            />
          </Card>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Account Details
            </Text>
            <View style={[styles.sectionBadge, { backgroundColor: `${theme.colors.info}15` }]}>
              <Ionicons name="shield-checkmark" size={14} color={theme.colors.info} />
            </View>
          </View>
          <Card elevation="md" style={styles.infoCard}>
            <InfoRow 
              icon="calendar-outline" 
              label="Member Since" 
              value={displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Not available'} 
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <InfoRow 
              icon="time-outline" 
              label="Last Updated" 
              value={displayUser?.updatedAt ? new Date(displayUser.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'Not available'} 
            />
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
              Actions
            </Text>
            <View style={[styles.sectionBadge, { backgroundColor: `${theme.colors.secondary}15` }]}>
              <Ionicons name="settings" size={14} color={theme.colors.secondary} />
            </View>
          </View>
          <Card elevation="md" style={styles.actionsCard}>
            <ActionButton 
              icon="key-outline" 
              label="Change Password" 
              onPress={() => navigation.navigate('ChangePassword')} 
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <ActionButton 
              icon="log-out-outline" 
              label="Logout" 
              onPress={handleLogout}
              variant="danger"
            />
          </Card>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.colors.text.secondary }]}>
            Diavise v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 50,
    paddingBottom: 30,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  profileCardWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  profileGradientCard: {
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 120,
    height: 120,
    top: -30,
    right: -30,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: -20,
    left: -20,
  },
  profileCardContent: {
    alignItems: 'center',
  },
  avatarWrapper: {
    marginBottom: 12,
  },
  avatarRing: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  avatarInner: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2563eb',
  },
  profileInfo: {
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
  },
  profileEmail: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.95)',
  },
  diseaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  diseaseText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: '#fff',
  },
  section: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    padding: 14,
    borderRadius: 14,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 12,
    maxWidth: '45%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  actionsCard: {
    padding: 6,
    borderRadius: 14,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ProfileScreen;
