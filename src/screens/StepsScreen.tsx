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

const StepsScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stepsData, setStepsData] = useState<StepsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // In a real app, you would set up pedometer listener here
    // For demo purposes, we'll simulate step counting
    simulateStepCounting();
  }, []);

  const loadData = async () => {
    try {
      const userData = await StorageService.getUser();
      const today = getTodayString();
      const todaySteps = await StorageService.getStepsData(today);

      setUser(userData);
      setStepsData(todaySteps || {
        date: today,
        steps: 0,
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const simulateStepCounting = () => {
    // Simulate random step increments for demo
    const interval = setInterval(() => {
      setStepsData(prev => {
        if (prev) {
          const newSteps = prev.steps + Math.floor(Math.random() * 10);
          const updatedData = { ...prev, steps: newSteps };
          StorageService.saveStepsData(updatedData);
          return updatedData;
        }
        return prev;
      });
    }, 5000);

    return () => clearInterval(interval);
  };

  const addSteps = async (stepCount: number) => {
    if (!stepsData || !user) return;

    const newStepsData: StepsData = {
      ...stepsData,
      steps: stepsData.steps + stepCount,
    };

    try {
      await StorageService.saveStepsData(newStepsData);
      setStepsData(newStepsData);

      // Check if goal is reached
      if (newStepsData.steps >= user.stepsGoal && stepsData.steps < user.stepsGoal) {
        Alert.alert('🎉 Congratulations!', 'You\'ve reached your daily steps goal!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save steps data');
    }
  };

  const getProgress = () => {
    if (!user || !stepsData) return 0;
    return Math.min((stepsData.steps / user.stepsGoal) * 100, 100);
  };

  const getCaloriesBurned = () => {
    if (!stepsData) return 0;
    // Rough estimate: 0.04 calories per step
    return Math.round(stepsData.steps * 0.04);
  };

  const getDistance = () => {
    if (!stepsData) return 0;
    // Rough estimate: 0.8 meters per step
    return (stepsData.steps * 0.0008).toFixed(2);
  };

  if (loading || !user || !stepsData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.gradient}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>👟 Steps Tracking</Text>
            <Text style={styles.subtitle}>Every step counts towards your health</Text>
          </View>

          {/* Progress Circle */}
          <View style={styles.progressSection}>
            <View style={styles.progressCircle}>
              <View style={styles.progressInner}>
                <Text style={styles.progressText}>{stepsData.steps.toLocaleString()}</Text>
                <Text style={styles.progressLabel}>Steps</Text>
                <Text style={styles.progressPercentage}>{Math.round(getProgress())}%</Text>
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
                <Text style={styles.statValue}>{user.stepsGoal.toLocaleString()}</Text>
                <Text style={styles.statLabel}>Goal</Text>
              </View>
            </View>
          </View>

          {/* Quick Add Steps */}
          <View style={styles.quickAddSection}>
            <Text style={styles.sectionTitle}>Quick Add Steps</Text>
            <View style={styles.quickAddButtons}>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addSteps(100)}
              >
                <Text style={styles.quickAddText}>+100</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addSteps(500)}
              >
                <Text style={styles.quickAddText}>+500</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={() => addSteps(1000)}
              >
                <Text style={styles.quickAddText}>+1000</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarSection}>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${getProgress()}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressBarText}>
              {Math.max(0, user.stepsGoal - stepsData.steps).toLocaleString()} steps to goal
            </Text>
          </View>

          {/* Activity Levels */}
          <View style={styles.activitySection}>
            <Text style={styles.sectionTitle}>Activity Level</Text>
            <View style={styles.activityLevels}>
              <View style={[
                styles.activityLevel,
                stepsData.steps >= 2500 && styles.activeLevel
              ]}>
                <Text style={styles.activityEmoji}>🚶‍♂️</Text>
                <Text style={styles.activityText}>Light</Text>
                <Text style={styles.activitySteps}>2,500+</Text>
              </View>
              <View style={[
                styles.activityLevel,
                stepsData.steps >= 5000 && styles.activeLevel
              ]}>
                <Text style={styles.activityEmoji}>🚶‍♀️</Text>
                <Text style={styles.activityText}>Moderate</Text>
                <Text style={styles.activitySteps}>5,000+</Text>
              </View>
              <View style={[
                styles.activityLevel,
                stepsData.steps >= 10000 && styles.activeLevel
              ]}>
                <Text style={styles.activityEmoji}>🏃‍♂️</Text>
                <Text style={styles.activityText}>Active</Text>
                <Text style={styles.activitySteps}>10,000+</Text>
              </View>
              <View style={[
                styles.activityLevel,
                stepsData.steps >= 15000 && styles.activeLevel
              ]}>
                <Text style={styles.activityEmoji}>🏃‍♀️</Text>
                <Text style={styles.activityText}>Very Active</Text>
                <Text style={styles.activitySteps}>15,000+</Text>
              </View>
            </View>
          </View>

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Walking Tips</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Take the stairs instead of elevators</Text>
              <Text style={styles.tipItem}>• Park farther away from your destination</Text>
              <Text style={styles.tipItem}>• Take walking breaks during work</Text>
              <Text style={styles.tipItem}>• Walk while talking on the phone</Text>
              <Text style={styles.tipItem}>• Set hourly reminders to move</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    backgroundColor: '#ff6b6b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 8,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressInner: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  progressPercentage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickAddSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  quickAddButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAddButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickAddText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#43e97b',
  },
  progressBarSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  progressBarText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  activitySection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  activityLevels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityLevel: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 10,
    flex: 1,
    marginHorizontal: 2,
  },
  activeLevel: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  activityEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  activityText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  activitySteps: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  tipsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
  },
  tipItem: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
    lineHeight: 24,
  },
});

export default StepsScreen;
