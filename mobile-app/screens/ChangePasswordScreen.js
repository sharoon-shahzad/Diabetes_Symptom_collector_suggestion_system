import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import Input from '../components/ui/Input';
import { changePassword } from '../utils/api';

const ChangePasswordScreen = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (formData.newPassword) {
      calculatePasswordStrength(formData.newPassword);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.newPassword]);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
    setPasswordStrength(Math.min(strength, 100));
  };

  const getStrengthColor = () => {
    if (passwordStrength < 40) return '#ef4444';
    if (passwordStrength < 70) return '#f59e0b';
    return '#10b981';
  };

  const getStrengthText = () => {
    if (passwordStrength < 40) return 'Weak';
    if (passwordStrength < 70) return 'Medium';
    return 'Strong';
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (formData.newPassword === formData.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      
      Alert.alert(
        'Success',
        'Your password has been changed successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err) {
      console.log('Change password error:', err);
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to change password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#f8fafc', '#ffffff', '#f1f5f9']}
        style={StyleSheet.absoluteFillObject}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <View style={styles.backButtonCircle}>
                  <Ionicons name="arrow-back" size={20} color="#0f172a" />
                </View>
              </TouchableOpacity>

              <LinearGradient
                colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
                style={styles.iconContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.iconRing}>
                  <Ionicons name="key" size={28} color="#ffffff" />
                </View>
              </LinearGradient>

              <Text style={styles.title}>Change Password</Text>
              <Text style={styles.subtitle}>
                Keep your account secure with a strong password
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Current Password */}
              <Input
                label="Current Password"
                value={formData.currentPassword}
                onChangeText={(text) => updateField('currentPassword', text)}
                placeholder="Enter current password"
                secureTextEntry={!showPasswords.current}
                error={errors.currentPassword}
                leftIcon={
                  <Ionicons name="lock-closed-outline" size={20} color="#64748b" />
                }
                rightIcon={
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('current')}
                  >
                    <Ionicons
                      name={showPasswords.current ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                }
              />

              {/* New Password */}
              <View style={styles.passwordFieldContainer}>
                <Input
                  label="New Password"
                  value={formData.newPassword}
                  onChangeText={(text) => updateField('newPassword', text)}
                  placeholder="Enter new password (min. 8 characters)"
                  secureTextEntry={!showPasswords.new}
                  error={errors.newPassword}
                  leftIcon={
                    <Ionicons name="lock-open-outline" size={20} color="#64748b" />
                  }
                  rightIcon={
                    <TouchableOpacity onPress={() => togglePasswordVisibility('new')}>
                      <Ionicons
                        name={showPasswords.new ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#64748b"
                      />
                    </TouchableOpacity>
                  }
                />

                {/* Password Strength Indicator */}
                {formData.newPassword.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBarBackground}>
                      <View
                        style={[
                          styles.strengthBarFill,
                          {
                            width: `${passwordStrength}%`,
                            backgroundColor: getStrengthColor(),
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                      {getStrengthText()}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <Input
                label="Confirm New Password"
                value={formData.confirmPassword}
                onChangeText={(text) => updateField('confirmPassword', text)}
                placeholder="Re-enter new password"
                secureTextEntry={!showPasswords.confirm}
                error={errors.confirmPassword}
                leftIcon={
                  <Ionicons name="checkmark-circle-outline" size={20} color="#64748b" />
                }
                rightIcon={
                  <TouchableOpacity
                    onPress={() => togglePasswordVisibility('confirm')}
                  >
                    <Ionicons
                      name={showPasswords.confirm ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#64748b"
                    />
                  </TouchableOpacity>
                }
              />

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Password must contain:</Text>
                <View style={styles.requirementsList}>
                  <RequirementItem
                    text="At least 8 characters"
                    met={formData.newPassword.length >= 8}
                  />
                  <RequirementItem
                    text="Uppercase & lowercase letters"
                    met={
                      /[a-z]/.test(formData.newPassword) &&
                      /[A-Z]/.test(formData.newPassword)
                    }
                  />
                  <RequirementItem
                    text="At least one number"
                    met={/[0-9]/.test(formData.newPassword)}
                  />
                  <RequirementItem
                    text="Special character (recommended)"
                    met={/[^a-zA-Z0-9]/.test(formData.newPassword)}
                  />
                </View>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleSubmit}
                disabled={loading}
              >
                <LinearGradient
                  colors={['#8b5cf6', '#7c3aed']}
                  style={styles.submitButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? 'Changing Password...' : 'Change Password'}
                  </Text>
                  {!loading && <Ionicons name="checkmark" size={18} color="#ffffff" />}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Security Tip */}
            <View style={styles.securityTip}>
              <View style={styles.tipIcon}>
                <Ionicons name="shield-checkmark" size={20} color="#10b981" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Security Tip</Text>
                <Text style={styles.tipText}>
                  Use a unique password that you don't use for other accounts. Consider
                  using a password manager to keep track of your passwords.
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const RequirementItem = ({ text, met }) => (
  <View style={styles.requirementItem}>
    <Ionicons
      name={met ? 'checkmark-circle' : 'ellipse-outline'}
      size={16}
      color={met ? '#10b981' : '#cbd5e1'}
    />
    <Text style={[styles.requirementText, { color: met ? '#10b981' : '#64748b' }]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : 40,
    paddingBottom: 30,
  },
  content: {
    flex: 1,
  },
  
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 10,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  iconRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },

  // Form
  form: {
    marginBottom: 24,
  },
  passwordFieldContainer: {
    marginBottom: 16,
  },
  
  // Password Strength
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
    marginBottom: 4,
  },
  strengthBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 12,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '700',
    width: 60,
    textAlign: 'right',
  },

  // Requirements
  requirementsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 10,
  },
  requirementsList: {
    gap: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Submit Button
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginRight: 6,
  },

  // Security Tip
  securityTip: {
    flexDirection: 'row',
    backgroundColor: '#10b98110',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#10b98130',
    marginTop: 8,
  },
  tipIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
  },
});

export default ChangePasswordScreen;
