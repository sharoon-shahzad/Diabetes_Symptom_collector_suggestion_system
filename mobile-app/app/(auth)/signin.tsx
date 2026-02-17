/**
 * Sign In Screen
 * Gradient header + clean form card, no emojis
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { TextInput } from '@components/common/TextInput';
import { useLoginMutation } from '@features/auth/authApi';
import { useAppDispatch } from '@store/hooks';
import { setUser } from '@features/auth/authSlice';
import { loginSchema, type LoginFormData } from '@utils/validation';
import { spacing, borderRadius, shadows } from '@theme/spacing';
import colors from '@theme/colors';
import { storage, STORAGE_KEYS } from '@utils/storage';

const HERO_FROM = '#3D5A80';
const HERO_TO = '#293D56';

export default function SignInScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [rememberMe, setRememberMe] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setUser(result.data.user));

      const pendingAnswers = await storage.getItem(STORAGE_KEYS.PENDING_ONBOARDING_ANSWERS);
      if (pendingAnswers) {
        await storage.removeItem(STORAGE_KEYS.PENDING_ONBOARDING_ANSWERS);
      }

      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Login Error', error?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Hero */}
          <LinearGradient colors={[HERO_FROM, HERO_TO]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.hero}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(auth)/welcome')} style={s.heroBack}>
              <MaterialCommunityIcons name="arrow-left" size={20} color="#FFF" />
            </TouchableOpacity>
            <View style={s.heroIconWrap}>
              <MaterialCommunityIcons name="login" size={26} color={HERO_FROM} />
            </View>
            <Text style={s.heroTitle}>Welcome Back</Text>
            <Text style={s.heroSub}>Sign in to continue managing your health</Text>
          </LinearGradient>

          {/* Form */}
          <View style={s.card}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  leftIcon="email-outline"
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                  password
                  autoComplete="password"
                  textContentType="password"
                  leftIcon="lock-outline"
                />
              )}
            />

            {/* Remember + Forgot */}
            <View style={s.optionsRow}>
              <TouchableOpacity style={s.rememberRow} activeOpacity={0.7} onPress={() => setRememberMe(!rememberMe)}>
                <Checkbox status={rememberMe ? 'checked' : 'unchecked'} color={HERO_FROM} />
                <Text style={s.rememberText}>Remember me</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Sign In */}
            <TouchableOpacity
              style={[s.submitBtn, isLoading && s.submitBtnDisabled]}
              activeOpacity={0.85}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <LinearGradient colors={[HERO_FROM, HERO_TO]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.submitGradient}>
                {isLoading ? (
                  <Text style={s.submitText}>Signing in...</Text>
                ) : (
                  <>
                    <Text style={s.submitText}>Sign In</Text>
                    <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={s.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.neutral[50] },
  scroll: { flexGrow: 1, padding: spacing[4] },

  // Hero
  hero: { borderRadius: borderRadius.lg, padding: spacing[5], marginBottom: spacing[5], ...shadows.md },
  heroBack: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing[3] },
  heroIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.92)', justifyContent: 'center', alignItems: 'center', marginBottom: spacing[2] },
  heroTitle: { fontSize: 24, fontWeight: '700', color: '#FFF', letterSpacing: -0.3 },
  heroSub: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  // Card
  card: { backgroundColor: colors.neutral[0], borderRadius: borderRadius.md, padding: spacing[5], gap: spacing[4], ...shadows.xs, borderWidth: 1, borderColor: colors.neutral[100], marginBottom: spacing[5] },

  // Options
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rememberRow: { flexDirection: 'row', alignItems: 'center' },
  rememberText: { fontSize: 13, fontWeight: '500', color: colors.neutral[600] },
  forgotText: { fontSize: 13, fontWeight: '600', color: colors.primary[600] },

  // Submit
  submitBtn: { borderRadius: borderRadius.md, overflow: 'hidden', ...shadows.sm },
  submitBtnDisabled: { opacity: 0.7 },
  submitGradient: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing[2], paddingVertical: spacing[4] },
  submitText: { fontSize: 16, fontWeight: '700', color: '#FFF' },

  // Footer
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 13, fontWeight: '500', color: colors.neutral[500] },
  footerLink: { fontSize: 13, fontWeight: '700', color: colors.primary[600] },
});
