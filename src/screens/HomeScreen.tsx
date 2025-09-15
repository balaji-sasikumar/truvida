import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { User, WaterIntake, StepsData } from '../types';
import { StorageService } from '../services/storage';
import { getGreeting, getTodayString } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [waterIntake, setWaterIntake] = useState<WaterIntake | null>(null);
  const [stepsData, setStepsData] = useState<StepsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await StorageService.getUser();
      const today = getTodayString();
      const todayWater = await StorageService.getWaterIntake(today);
      const todaySteps = await StorageService.getStepsData(today);

      setUser(userData);
      setWaterIntake(todayWater || {
        date: today,
        glasses: 0,
        totalMl: 0,
        glassSize: 250,
      });
      setStepsData(todaySteps || {
        date: today,
        steps: 0,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWaterProgress = () => {
    if (!user || !waterIntake) return 0;
    return Math.min((waterIntake.totalMl / user.waterGoal) * 100, 100);
  };

  const getStepsProgress = () => {
    if (!user || !stepsData) return 0;
    return Math.min((stepsData.steps / user.stepsGoal) * 100, 100);
  };

  const getRemainingWater = () => {
    if (!user || !waterIntake) return user?.waterGoal || 2000;
    return Math.max(user.waterGoal - waterIntake.totalMl, 0);
  };

  const getRemainingSteps = () => {
    if (!user || !stepsData) return user?.stepsGoal || 10000;
    return Math.max(user.stepsGoal - stepsData.steps, 0);
  };

  if (loading || !user) {
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
            <Text style={styles.greetingText}>{getGreeting(user.name)}</Text>
            <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric'
            })}</Text>
          </View>

          {/* Progress Cards */}
          <View style={styles.cardsContainer}>
            {/* Water Progress Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>💧 Water Intake</Text>
                <Text style={styles.cardSubtitle}>Stay hydrated</Text>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${getWaterProgress()}%`, backgroundColor: '#00f2fe' }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(getWaterProgress())}%</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{waterIntake?.totalMl || 0}ml</Text>
                  <Text style={styles.statLabel}>Consumed</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{getRemainingWater()}ml</Text>
                  <Text style={styles.statLabel}>Remaining</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{waterIntake?.glasses || 0}</Text>
                  <Text style={styles.statLabel}>Glasses</Text>
                </View>
              </View>
            </View>

            {/* Steps Progress Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>👟 Steps Today</Text>
                <Text style={styles.cardSubtitle}>Keep moving</Text>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${getStepsProgress()}%`, backgroundColor: '#43e97b' }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(getStepsProgress())}%</Text>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stepsData?.steps || 0}</Text>
                  <Text style={styles.statLabel}>Steps</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{getRemainingSteps()}</Text>
                  <Text style={styles.statLabel}>To Goal</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Math.round((stepsData?.steps || 0) * 0.0008)} km</Text>
                  <Text style={styles.statLabel}>Distance</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionEmoji}>💧</Text>
                <Text style={styles.actionText}>Add Water</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionEmoji}>🚶‍♂️</Text>
                <Text style={styles.actionText}>Log Steps</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionEmoji}>⚙️</Text>
                <Text style={styles.actionText}>Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Motivational Quote */}
          <View style={styles.motivationCard}>
            <Text style={styles.motivationText}>
              "Take care of your body. It's the only place you have to live."
            </Text>
            <Text style={styles.motivationAuthor}>- Jim Rohn</Text>
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
    backgroundColor: '#4facfe',
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
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  cardsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 45,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  motivationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  motivationText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 10,
    lineHeight: 24,
  },
  motivationAuthor: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreen;
