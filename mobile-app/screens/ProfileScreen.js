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

const ProfileScreen = () => {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);

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
            setLoading(true);
            try {
              await logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Welcome' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
            } finally {
              setLoading(false);
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

  if (loading) {
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

        {/* Profile Card */}
        <Card elevation="lg" style={styles.profileCard}>
          <View style={[styles.avatarContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={[styles.profileName, { color: theme.colors.text.primary }]}>
            {user?.fullName || 'User'}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.colors.text.secondary }]}>
            {user?.email || 'No email'}
          </Text>
          {user?.disease && (
            <View style={[styles.diseaseBadge, { backgroundColor: `${theme.colors.info}15` }]}>
              <Ionicons name="medical" size={14} color={theme.colors.info} />
              <Text style={[styles.diseaseText, { color: theme.colors.info }]}>
                {user.disease}
              </Text>
            </View>
          )}
        </Card>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Personal Information
          </Text>
          <Card elevation="md" style={styles.infoCard}>
            <InfoRow icon="person-outline" label="Full Name" value={user?.fullName} />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <InfoRow icon="mail-outline" label="Email" value={user?.email} />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <InfoRow icon="call-outline" label="Phone" value={user?.phone} />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <InfoRow icon="medical-outline" label="Condition" value={user?.disease} />
          </Card>
        </View>

        {/* Account Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Account Details
          </Text>
          <Card elevation="md" style={styles.infoCard}>
            <InfoRow 
              icon="shield-checkmark-outline" 
              label="User ID" 
              value={user?._id?.substring(0, 12) + '...'} 
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <InfoRow 
              icon="calendar-outline" 
              label="Member Since" 
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} 
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <InfoRow 
              icon="time-outline" 
              label="Last Updated" 
              value={user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'} 
            />
          </Card>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Actions
          </Text>
          <Card elevation="md" style={styles.actionsCard}>
            <ActionButton 
              icon="pencil-outline" 
              label="Edit Profile" 
              onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon')} 
            />
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <ActionButton 
              icon="key-outline" 
              label="Change Password" 
              onPress={() => Alert.alert('Coming Soon', 'Password change will be available soon')} 
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
    paddingTop: StatusBar.currentHeight || 20,
    paddingBottom: 40,
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
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  diseaseBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  diseaseText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  infoCard: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
    maxWidth: '40%',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  actionsCard: {
    padding: 8,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
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
    marginTop: 16,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ProfileScreen;
