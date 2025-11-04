import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { User, StepsData } from '../types';
import { StorageService } from '../services/storage';
import { getTodayString } from '../utils/dateUtils';
import {
  initialize,
  requestPermission,
  readRecords,
  getSdkStatus,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';
import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';

const healthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.StepCount],
  },
} as HealthKitPermissions;

const StepsScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stepsData, setStepsData] = useState<StepsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [healthAvailable, setHealthAvailable] = useState(false);

  useEffect(() => {
    initializeHealth();
  }, []);

  const initializeHealth = async () => {
    try {
      if (Platform.OS === 'android') {
        // ---------- ANDROID: Health Connect ----------
        const status = await getSdkStatus();

        if (status === SdkAvailabilityStatus.SDK_AVAILABLE) {
          await initialize();
          await requestPermission([
            { accessType: 'read', recordType: 'Steps' },
          ]);
          setHealthAvailable(true);
          await loadStepsFromHealthConnect();
        } else {
          console.log('Health Connect not available, using stored data');
          setHealthAvailable(false);
          await loadDataFromStorage();
        }
      } else if (Platform.OS === 'ios') {
        // ---------- iOS: HealthKit ----------
        AppleHealthKit.initHealthKit(healthKitPermissions, async error => {
          if (error) {
            console.error('HealthKit init error:', error);
            setHealthAvailable(false);
            await loadDataFromStorage();
            return;
          }

          setHealthAvailable(true);
          await loadStepsFromHealthKit();
        });
      } else {
        // Other platforms (web etc.)
        await loadDataFromStorage();
      }
    } catch (error) {
      console.error('Health init failed:', error);
      await loadDataFromStorage();
    } finally {
      setLoading(false);
    }
  };

  // ---------- STORAGE FALLBACK ----------
  const loadDataFromStorage = async () => {
    try {
      const userData = await StorageService.getUser();
      const today = getTodayString();
      const todaySteps = await StorageService.getStepsData(today);

      setUser(userData);
      setStepsData(todaySteps || { date: today, steps: 0 });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  // ---------- ANDROID: HEALTH CONNECT ----------
  const loadStepsFromHealthConnect = async () => {
    const userData = await StorageService.getUser();
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);

    try {
      const result = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: start.toISOString(),
          endTime: today.toISOString(),
        },
      });

      const totalSteps = result.records.reduce(
        (sum, r) => sum + (r.count || 0),
        0,
      );

      const newStepsData: StepsData = {
        date: getTodayString(),
        steps: totalSteps,
      };

      setUser(userData);
      setStepsData(newStepsData);
      await StorageService.saveStepsData(newStepsData);
    } catch (error) {
      console.error('Error reading steps (Android):', error);
      await loadDataFromStorage();
    }
  };

  // ---------- iOS: HEALTHKIT ----------
  const loadStepsFromHealthKit = async () => {
    const userData = await StorageService.getUser();
    const options = {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      endDate: new Date().toISOString(),
    };

    AppleHealthKit.getStepCount(options, async (err, results) => {
      if (err) {
        console.error('Error reading steps (iOS):', err);
        await loadDataFromStorage();
        return;
      }

      const totalSteps = Math.floor(results.value || 0);
      const newStepsData: StepsData = {
        date: getTodayString(),
        steps: totalSteps,
      };

      setUser(userData);
      setStepsData(newStepsData);
      await StorageService.saveStepsData(newStepsData);
    });
  };

  // ---------- MANUAL ADD ----------
  const addSteps = async (stepCount: number) => {
    if (!stepsData || !user) return;

    const newStepsData: StepsData = {
      ...stepsData,
      steps: stepsData.steps + stepCount,
    };

    try {
      await StorageService.saveStepsData(newStepsData);
      setStepsData(newStepsData);

      if (
        newStepsData.steps >= user.stepsGoal &&
        stepsData.steps < user.stepsGoal
      ) {
        Alert.alert('🎉 Congratulations!', "You've reached your daily goal!");
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save steps data');
    }
  };

  // ---------- METRICS ----------
  const getProgress = () => {
    if (!user || !stepsData) return 0;
    return Math.min((stepsData.steps / user.stepsGoal) * 100, 100);
  };

  const getCaloriesBurned = () =>
    stepsData ? Math.round(stepsData.steps * 0.04) : 0;

  const getDistance = () =>
    stepsData ? (stepsData.steps * 0.0008).toFixed(2) : '0.00';

  if (loading || !user || !stepsData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading health data...</Text>
      </View>
    );
  }

  // ---------- UI ----------
  return (
    <View style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.gradient}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>👟 Steps Tracking</Text>
            <Text style={styles.subtitle}>
              {healthAvailable
                ? 'Synced with Health Connect / Apple Health'
                : 'Using local step data'}
            </Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressCircle}>
              <View style={styles.progressInner}>
                <Text style={styles.progressText}>
                  {stepsData.steps.toLocaleString()}
                </Text>
                <Text style={styles.progressLabel}>Steps</Text>
                <Text style={styles.progressPercentage}>
                  {Math.round(getProgress())}%
                </Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{getCaloriesBurned()}</Text>
                <Text style={styles.statLabel}>Calories</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{getDistance()} km</Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {user.stepsGoal.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>Goal</Text>
              </View>
            </View>
          </View>

          <View style={styles.quickAddSection}>
            <Text style={styles.sectionTitle}>Quick Add Steps</Text>
            <View style={styles.quickAddButtons}>
              {[100, 500, 1000].map(v => (
                <TouchableOpacity
                  key={v}
                  style={styles.quickAddButton}
                  onPress={() => addSteps(v)}
                >
                  <Text style={styles.quickAddText}>+{v}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.progressBarSection}>
            <View style={styles.progressBarContainer}>
              <View
                style={[styles.progressBarFill, { width: `${getProgress()}%` }]}
              />
            </View>
            <Text style={styles.progressBarText}>
              {Math.max(0, user.stepsGoal - stepsData.steps).toLocaleString()}{' '}
              steps to goal
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1, backgroundColor: '#121212' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: '#666' },
  scrollView: { flex: 1, paddingTop: 50 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  progressSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#2d2d2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 8,
    borderColor: '#444',
  },
  progressInner: { alignItems: 'center' },
  progressText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 5,
  },
  progressPercentage: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    minWidth: 80,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  quickAddSection: { paddingHorizontal: 20, marginBottom: 30 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  quickAddButtons: { flexDirection: 'row', justifyContent: 'space-around' },
  quickAddButton: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAddText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  progressBarSection: { paddingHorizontal: 20, marginBottom: 30 },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    marginBottom: 10,
  },
  progressBarFill: { height: '100%', backgroundColor: '#fff', borderRadius: 6 },
  progressBarText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default StepsScreen;
