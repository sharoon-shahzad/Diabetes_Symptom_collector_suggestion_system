import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StatusBar,
  TextInput as RNTextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { 
  useTheme, 
  GlassCard, 
  PremiumButton, 
  NeonText,
  FloatingParticle,
} from '../contexts/ThemeContext';

const SignupScreen = () => {
  const navigation = useNavigation();
  const { register } = useAuth();
  const { theme } = useTheme();
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!fullName || !email || !password || !dob || !gender) {
      Alert.alert('Error', 'All fields are required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Invalid email format.');
      return false;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert('Error', 'Password must be at least 8 characters and include at least 1 letter, 1 number, and 1 symbol.');
      return false;
    }
    const date = new Date(dob);
    if (isNaN(date.getTime())) {
      Alert.alert('Error', 'Invalid date of birth. Use YYYY-MM-DD format.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({
        fullName,
        email,
        password,
        gender,
        date_of_birth: dob,
      });
      Alert.alert('Success', 'Check your email to activate your account.');
      setFullName('');
      setEmail('');
      setPassword('');
      setDob('');
      setGender('');
      navigation.navigate('Login');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Floating Particles */}
      <FloatingParticle style={styles.particle1} size={8} duration={4000} color={theme.colors.primaryLight} />
      <FloatingParticle style={styles.particle2} size={6} duration={3500} delay={500} color={theme.colors.accent} />
      <FloatingParticle style={styles.particle3} size={10} duration={4500} delay={1000} color={theme.colors.primary} />
      <FloatingParticle style={styles.particle4} size={7} duration={4200} delay={1500} color={theme.colors.secondary} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <LinearGradient
                colors={theme.gradients.secondary}
                style={styles.iconContainer}
              >
                <Ionicons name="person-add" size={40} color="#ffffff" />
              </LinearGradient>
              <NeonText style={styles.title} color="secondary">
                Create Account
              </NeonText>
              <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
                Join us and start your personalized health journey
              </Text>
            </View>

            {/* Signup Form Card */}
            <GlassCard style={styles.formCard} variant="strong">
              {/* Full Name Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
                  Full Name
                </Text>
                <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
                  <Ionicons name="person-outline" size={20} color={theme.colors.text.secondary} />
                  <RNTextInput
                    style={[styles.textInput, { color: theme.colors.text.primary }]}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.colors.text.secondary}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
                  Email Address
                </Text>
                <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
                  <Ionicons name="mail-outline" size={20} color={theme.colors.text.secondary} />
                  <RNTextInput
                    style={[styles.textInput, { color: theme.colors.text.primary }]}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.colors.text.secondary}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
                  Password
                </Text>
                <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.secondary} />
                  <RNTextInput
                    style={[styles.textInput, { color: theme.colors.text.primary }]}
                    placeholder="Min. 8 characters"
                    placeholderTextColor={theme.colors.text.secondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color={theme.colors.text.secondary} 
                    />
                  </TouchableOpacity>
                </View>
                <Text style={styles.passwordHint}>
                  Include letters, numbers & symbols
                </Text>
              </View>

              {/* Date of Birth Input */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
                  Date of Birth
                </Text>
                <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.text.secondary} />
                  <RNTextInput
                    style={[styles.textInput, { color: theme.colors.text.primary }]}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.colors.text.secondary}
                    value={dob}
                    onChangeText={setDob}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>

              {/* Gender Selection */}
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: theme.colors.text.primary }]}>
                  Gender
                </Text>
                <View style={styles.genderContainer}>
                  {['Male', 'Female', 'Prefer not to say'].map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[
                        styles.genderOption,
                        { borderColor: theme.colors.border },
                        gender === option && {
                          borderColor: theme.colors.primary,
                          borderWidth: 2,
                        },
                      ]}
                      onPress={() => setGender(option)}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={
                          gender === option 
                            ? theme.gradients.primary 
                            : ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.3)']
                        }
                        style={styles.genderGradient}
                      >
                        <Ionicons 
                          name={
                            option === 'Male' ? 'male' : 
                            option === 'Female' ? 'female' : 
                            'help-outline'
                          } 
                          size={24} 
                          color={gender === option ? '#ffffff' : theme.colors.text.secondary} 
                        />
                        <Text 
                          style={[
                            styles.genderText,
                            { color: gender === option ? '#ffffff' : theme.colors.text.primary }
                          ]}
                        >
                          {option}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Sign Up Button */}
              <PremiumButton
                onPress={handleSubmit}
                disabled={loading}
                variant="secondary"
                size="large"
                style={styles.signupButton}
              >
                <View style={styles.buttonContent}>
                  {loading ? (
                    <Text style={styles.buttonText}>Creating Account...</Text>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                      <Text style={styles.buttonText}>Create Account</Text>
                    </>
                  )}
                </View>
              </PremiumButton>
            </GlassCard>

            {/* Login Link */}
            <TouchableOpacity 
              style={styles.loginContainer}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.7}
            >
              <Text style={[styles.loginText, { color: theme.colors.text.secondary }]}>
                Already have an account?{' '}
                <Text style={[styles.loginLink, { color: theme.colors.secondary }]}>
                  Sign In
                </Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 40 : (StatusBar.currentHeight + 40 || 60),
    paddingBottom: Platform.OS === 'ios' ? 40 : 40,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  // Particles
  particle1: {
    top: '12%',
    left: '8%',
  },
  particle2: {
    top: '35%',
    right: '10%',
  },
  particle3: {
    top: '60%',
    left: '15%',
  },
  particle4: {
    top: '82%',
    right: '18%',
  },
  // Header
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 0, 78, 0.3)',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Form Card
  formCard: {
    padding: 24,
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  passwordHint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    marginLeft: 4,
  },
  // Gender Selection
  genderContainer: {
    gap: 12,
  },
  genderOption: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  genderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  genderText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  signupButton: {
    marginTop: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
  // Login Link
  loginContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loginText: {
    fontSize: 15,
    fontWeight: '500',
  },
  loginLink: {
    fontWeight: '700',
  },
});

export default SignupScreen;