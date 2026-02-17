/**
 * Google Fit Integration Screen
 *
 * This screen allows users to connect their Google Fit account to the app,
 * request necessary permissions, and sync their fitness data.
 */
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Fitness from 'expo-fitness';
import { Button } from '@components/common/Button';
import { Card } from '@components/common/Card';
import { spacing, layout } from '@theme/spacing';
import { textStyles } from '@theme/typography';
import colors from '@theme/colors';

export default function GoogleFitScreen() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [steps, setSteps] = useState<number | null>(null);

  const getPermissionsList = () => {
    // Some environments may not fully support expo-fitness; avoid crashing at module init time.
    const PermissionKind = (Fitness as any)?.PermissionKind;
    const PermissionAccess = (Fitness as any)?.PermissionAccess;
    if (!PermissionKind || !PermissionAccess) return [];

    return [
      { kind: PermissionKind.Steps, access: PermissionAccess.Read },
      { kind: PermissionKind.Distance, access: PermissionAccess.Read },
      { kind: PermissionKind.FloorsClimbed, access: PermissionAccess.Read },
      { kind: PermissionKind.Calories, access: PermissionAccess.Read },
    ];
  };

  useEffect(() => {
    Fitness.isAvailableAsync().then(setIsAvailable).catch(() => setIsAvailable(false));
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      const permissions = getPermissionsList();
      if (permissions.length === 0) {
        setHasPermissions(false);
        return;
      }
      const result = await Fitness.getPermissionsAsync(permissions as any);
      const allPermissionsGranted = Object.values(result).every((status) => status === 'granted');
      setHasPermissions(allPermissionsGranted);
    } catch {
      setHasPermissions(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const permissions = getPermissionsList();
      if (permissions.length === 0) {
        Alert.alert('Unavailable', 'Google Fit integration is not available in this environment.');
        return;
      }
      const result = await Fitness.requestPermissionsAsync(permissions as any);
      const allPermissionsGranted = Object.values(result).every((status) => status === 'granted');
      setHasPermissions(allPermissionsGranted);
      if (allPermissionsGranted) {
        Alert.alert('Success', 'Permissions granted! You can now sync your data.');
      } else {
        Alert.alert('Permission Denied', 'Some permissions were not granted. The app may not function correctly.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while requesting permissions.');
    }
  };

  const getSteps = async () => {
    if (!hasPermissions) {
      Alert.alert('Permissions Required', 'Please grant permissions to read step data.');
      return;
    }
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    try {
      const stepsCount = await Fitness.getStepsAsync(startOfDay, today);
      setSteps(stepsCount);
    } catch (error) {
      Alert.alert('Error', 'Could not fetch step count.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Google Fit Integration</Text>
        
        <Card style={styles.card}>
          <Text style={styles.description}>
            Connect your Google Fit account to automatically sync your steps, distance, and other activity data.
          </Text>
          {!isAvailable && <Text style={styles.errorText}>Google Fit is not available on this device.</Text>}
        </Card>

        {isAvailable && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Permissions</Text>
            <Text style={styles.statusText}>Status: {hasPermissions ? 'Granted' : 'Not Granted'}</Text>
            {!hasPermissions && (
              <Button 
                variant="outline" 
                onPress={requestPermissions}
                style={styles.button}
              >
                Request Permissions
              </Button>
            )}
          </Card>
        )}

        {hasPermissions && (
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Sync Data</Text>
            {steps !== null && <Text style={styles.stepsText}>Today's Steps: {steps}</Text>}
            <Button 
              variant="primary" 
              onPress={getSteps}
              style={styles.button}
            >
              Sync Today's Steps
            </Button>
          </Card>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: spacing[4],
  },
  title: {
    ...textStyles.h4,
    marginBottom: spacing[6],
  },
  card: {
    marginBottom: spacing[6],
    padding: spacing[4],
  },
  cardTitle: {
    ...textStyles.h6,
    marginBottom: spacing[3],
  },
  description: {
    ...textStyles.body1,
    color: colors.light.text.secondary,
  },
  statusText: {
    ...textStyles.body1,
    marginBottom: spacing[4],
  },
  stepsText: {
    ...textStyles.body1,
    fontWeight: '600',
    marginBottom: spacing[4],
  },
  errorText: {
    color: colors.error.main,
    marginTop: spacing[4],
  },
  button: {
    marginTop: spacing[2],
  },
});
