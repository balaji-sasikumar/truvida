import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Circle } from 'react-native-progress';
import { useNavigation } from '@react-navigation/native';
import { User, WaterIntake, StepsData, TabParamList } from '../types';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StorageService } from '../services/storage';
import { getGreeting, getTodayString } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = BottomTabNavigationProp<TabParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
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
      setWaterIntake(
        todayWater || {
          date: today,
          glasses: 0,
          totalMl: 0,
          glassSize: 250,
        },
      );
      setStepsData(
        todaySteps || {
          date: today,
          steps: 0,
        },
      );
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWaterProgress = () => {
    if (!user || !waterIntake) return 0;
    return Math.min(waterIntake.totalMl / user.waterGoal, 1);
  };

  const getStepsProgress = () => {
    if (!user || !stepsData) return 0;
    return Math.min(stepsData.steps / user.stepsGoal, 1);
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

  // Helper component for rendering donut
  const Donut = ({
    progress,
    value,
    target,
    stats,
    color,
  }: {
    progress: number;
    value: string | number;
    target: string | number;
    stats: { label: string; value: string | number }[];
    color: string;
  }) => (
    <View style={styles.donutWrapper}>
      <View style={styles.donutChart}>
        <Circle
          size={120}
          progress={progress}
          thickness={12}
          color={color}
          unfilledColor="#444"
          showsText={false}
        />
        <View style={styles.donutTextContainer}>
          <Text style={styles.donutValue}>{value}</Text>
          <Text style={styles.donutTarget}>/{target}</Text>
        </View>
      </View>
      <View style={styles.donutStats}>
        {stats.map((s, idx) => (
          <View key={idx} style={styles.statItem}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greetingText}>{getGreeting(user.name)}</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>

          {/* Progress Cards */}
          <View style={styles.cardsContainer}>
            {/* Water Progress Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>💧 Water Intake</Text>
                <Text style={styles.cardSubtitle}>Stay hydrated</Text>
              </View>
              <Donut
                progress={getWaterProgress()}
                value={`${waterIntake?.totalMl || 0}ml`}
                target={`${user.waterGoal}ml`}
                stats={[
                  { label: 'Remaining', value: `${getRemainingWater()}ml` },
                  { label: 'Glasses', value: waterIntake?.glasses || 0 },
                ]}
                color="#4facfe"
              />
            </View>

            {/* Steps Progress Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>👣 Steps Today</Text>
                <Text style={styles.cardSubtitle}>Keep moving</Text>
              </View>
              <Donut
                progress={(() => {
                  const progress = getStepsProgress();
                  console.log('Steps progress:', progress);
                  return progress;
                })()}
                value={stepsData?.steps || 0}
                target={user.stepsGoal}
                stats={[
                  { label: 'To Goal', value: getRemainingSteps() },
                  {
                    label: 'Distance',
                    value: `${Math.round((stepsData?.steps || 0) * 0.0008)} km`,
                  },
                ]}
                color="#ff6b6b"
              />
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
  container: { flex: 1 },
  gradient: { flex: 1, backgroundColor: '#121212' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 18, color: 'rgba(255, 255, 255, 0.7)' },
  scrollView: { flex: 1, paddingTop: 50 },
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
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  cardsContainer: { paddingHorizontal: 20, marginBottom: 30 },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardHeader: { marginBottom: 20 },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  donutWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  donutChart: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutTextContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  donutTarget: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  donutStats: { flex: 1, justifyContent: 'space-around', paddingLeft: 15 },
  statItem: { alignItems: 'center' },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  motivationCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  motivationText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 10,
    lineHeight: 24,
  },
  motivationAuthor: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreen;
