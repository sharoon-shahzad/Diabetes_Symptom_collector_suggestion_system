import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreenNew';
import SignupScreen from './screens/SignupScreenNew';
import LoginScreen from './screens/LoginScreenNew';
import DashboardScreen from './screens/DashboardScreenNew';
import DiseaseDataScreen from './screens/DiseaseDataScreenNew';
import OnboardingScreen from './screens/OnboardingScreen';
import AssessmentScreen from './screens/AssessmentScreenNew';
import ProfileScreen from './screens/ProfileScreen';
import ErrorBoundary from './components/ui/ErrorBoundary';

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563eb',
    secondary: '#64748b',
    background: 'transparent', // Make background transparent for gradient
    surface: 'rgba(255, 255, 255, 0.9)',
    text: '#0f172a',
    onSurface: '#0f172a',
    onBackground: '#0f172a',
  },
  fonts: {
    ...MD3LightTheme.fonts,
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      fontFamily: 'Inter_400Regular',
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      fontFamily: 'Inter_400Regular',
    },
    bodySmall: {
      ...MD3LightTheme.fonts.bodySmall,
      fontFamily: 'Inter_400Regular',
    },
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontFamily: 'Inter_700Bold',
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontFamily: 'Inter_600SemiBold',
    },
    headlineSmall: {
      ...MD3LightTheme.fonts.headlineSmall,
      fontFamily: 'Inter_600SemiBold',
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontFamily: 'Inter_500Medium',
    },
    titleMedium: {
      ...MD3LightTheme.fonts.titleMedium,
      fontFamily: 'Inter_500Medium',
    },
    titleSmall: {
      ...MD3LightTheme.fonts.titleSmall,
      fontFamily: 'Inter_500Medium',
    },
    labelLarge: {
      ...MD3LightTheme.fonts.labelLarge,
      fontFamily: 'Inter_500Medium',
    },
    labelMedium: {
      ...MD3LightTheme.fonts.labelMedium,
      fontFamily: 'Inter_500Medium',
    },
    labelSmall: {
      ...MD3LightTheme.fonts.labelSmall,
      fontFamily: 'Inter_500Medium',
    },
  },
};

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Or a loading screen
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <PaperProvider theme={paperTheme}>
            <NavigationContainer>
              <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Dashboard" component={DashboardScreen} />
                <Stack.Screen name="DiseaseData" component={DiseaseDataScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Assessment" component={AssessmentScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </PaperProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
