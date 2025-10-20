import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  TextInput,
} from 'react-native';
import { User, WaterIntake } from '../types';
import { StorageService } from '../services/storage';
import { getTodayString } from '../utils/dateUtils';

const GLASS_SIZES = [150, 250, 350, 500];

interface WaterEntry {
  amount: number;
  timestamp: string;
}

const WaterScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [waterIntake, setWaterIntake] = useState<WaterIntake | null>(null);
  const [selectedGlassSize, setSelectedGlassSize] = useState(250);
  const [customAmount, setCustomAmount] = useState('');
  const [waterEntries, setWaterEntries] = useState<WaterEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await StorageService.getUser();
      const today = getTodayString();
      const todayWater = await StorageService.getWaterIntake(today);
      const entries = await loadWaterEntries(today);

      setUser(userData);
      setWaterIntake(todayWater || {
        date: today,
        glasses: 0,
        totalMl: 0,
        glassSize: 250,
      });
      setWaterEntries(entries);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWaterEntries = async (date: string): Promise<WaterEntry[]> => {
    try {
      const entriesKey = `water_entries_${date}`;
      const stored = await StorageService.getData(entriesKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  };

  const saveWaterEntry = async (amount: number) => {
    const today = getTodayString();
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    const newEntry: WaterEntry = { amount, timestamp };
    const updatedEntries = [...waterEntries, newEntry];
    
    try {
      const entriesKey = `water_entries_${today}`;
      await StorageService.saveData(entriesKey, JSON.stringify(updatedEntries));
      setWaterEntries(updatedEntries);
    } catch (error) {
      console.error('Error saving water entry:', error);
    }
  };

  const addWater = async (amount?: number) => {
    if (!waterIntake || !user) return;

    const waterAmount = amount || selectedGlassSize;
    const newWaterIntake: WaterIntake = {
      ...waterIntake,
      glasses: waterIntake.glasses + 1,
      totalMl: waterIntake.totalMl + waterAmount,
      glassSize: selectedGlassSize,
    };

    try {
      await StorageService.saveWaterIntake(newWaterIntake);
      await saveWaterEntry(waterAmount);
      setWaterIntake(newWaterIntake);

      // Check if goal is reached
      if (newWaterIntake.totalMl >= user.waterGoal && waterIntake.totalMl < user.waterGoal) {
        Alert.alert('🎉 Congratulations!', 'You\'ve reached your daily water goal!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update water intake');
    }
  };

  const handleAddWater = () => addWater();

  const addCustomWater = async () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount <= 0 || amount > 2000) {
      Alert.alert('Error', 'Please enter a valid amount (1-2000ml)');
      return;
    }
    
    await addWater(amount);
    setCustomAmount('');
  };

  const removeWater = async () => {
    if (!waterIntake || waterIntake.glasses === 0) return;

    const newWaterIntake: WaterIntake = {
      ...waterIntake,
      glasses: Math.max(0, waterIntake.glasses - 1),
      totalMl: Math.max(0, waterIntake.totalMl - waterIntake.glassSize),
    };

    try {
      await StorageService.saveWaterIntake(newWaterIntake);
      setWaterIntake(newWaterIntake);
    } catch (error) {
      Alert.alert('Error', 'Failed to update water intake');
    }
  };

  const getProgress = () => {
    if (!user || !waterIntake) return 0;
    return Math.min((waterIntake.totalMl / user.waterGoal) * 100, 100);
  };

  const getRemainingGlasses = () => {
    if (!user || !waterIntake) return 0;
    const remaining = user.waterGoal - waterIntake.totalMl;
    return Math.ceil(remaining / selectedGlassSize);
  };

  if (loading || !user || !waterIntake) {
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
            <Text style={styles.title}>💧 Water Tracking</Text>
            <Text style={styles.subtitle}>Stay hydrated throughout the day</Text>
          </View>

          {/* Progress Circle */}
          <View style={styles.progressSection}>
            <View style={styles.progressCircle}>
              <View style={styles.progressInner}>
                <Text style={styles.progressText}>{Math.round(getProgress())}%</Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            </View>
            
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{waterIntake.totalMl}ml</Text>
                <Text style={styles.statLabel}>Consumed</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{user.waterGoal}ml</Text>
                <Text style={styles.statLabel}>Goal</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{waterIntake.glasses}</Text>
                <Text style={styles.statLabel}>Glasses</Text>
              </View>
            </View>
          </View>

          {/* Glass Size Selection */}
          <View style={styles.glassSizeSection}>
            <Text style={styles.sectionTitle}>Glass Size</Text>
            <View style={styles.glassSizeButtons}>
              {GLASS_SIZES.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.glassSizeButton,
                    selectedGlassSize === size && styles.selectedGlassSize
                  ]}
                  onPress={() => setSelectedGlassSize(size)}
                >
                  <Text style={[
                    styles.glassSizeText,
                    selectedGlassSize === size && styles.selectedGlassSizeText
                  ]}>
                    {size}ml
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Custom Amount Input */}
            <View style={styles.customAmountSection}>
              <Text style={styles.customAmountLabel}>Custom Amount</Text>
              <View style={styles.customAmountContainer}>
                <TextInput
                  style={styles.customAmountInput}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  placeholder="Enter ml"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  keyboardType="numeric"
                  maxLength={4}
                />
                <TouchableOpacity
                  style={[
                    styles.customAmountButton,
                    !customAmount && styles.disabledButton
                  ]}
                  onPress={addCustomWater}
                  disabled={!customAmount}
                >
                  <Text style={styles.customAmountButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Add Water Section */}
          <View style={styles.addWaterSection}>
            <View style={styles.waterControls}>
              <TouchableOpacity
                style={[styles.controlButton, styles.removeButton]}
                onPress={removeWater}
                disabled={waterIntake.glasses === 0}
              >
                <Text style={styles.controlButtonText}>-</Text>
              </TouchableOpacity>

              <View style={styles.glassDisplay}>
                <Text style={styles.glassEmoji}>🥤</Text>
                <Text style={styles.glassSize}>{selectedGlassSize}ml</Text>
              </View>

              <TouchableOpacity
                style={[styles.controlButton, styles.addButton]}
                onPress={handleAddWater}
              >
                <Text style={styles.controlButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.addWaterButton} onPress={handleAddWater}>
              <Text style={styles.addWaterButtonText}>Add Glass</Text>
            </TouchableOpacity>
          </View>

          {/* Remaining Info */}
          <View style={styles.remainingSection}>
            <Text style={styles.remainingTitle}>To reach your goal:</Text>
            <Text style={styles.remainingText}>
              {getRemainingGlasses() > 0 
                ? `${getRemainingGlasses()} more glasses (${selectedGlassSize}ml each)`
                : 'Goal achieved! 🎉'
              }
            </Text>
          </View>

          {/* Today's Water Log */}
          {waterEntries.length > 0 && (
            <View style={styles.waterLogSection}>
              <Text style={styles.sectionTitle}>Today's Water Log</Text>
              <View style={styles.waterLogList}>
                {waterEntries.slice(-5).map((entry, index) => (
                  <View key={index} style={styles.waterLogEntry}>
                    <Text style={styles.waterLogAmount}>{entry.amount}ml</Text>
                    <Text style={styles.waterLogTime}>{entry.timestamp}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tips */}
          <View style={styles.tipsSection}>
            <Text style={styles.tipsTitle}>💡 Hydration Tips</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Start your day with a glass of water</Text>
              <Text style={styles.tipItem}>• Drink water before meals</Text>
              <Text style={styles.tipItem}>• Keep a water bottle nearby</Text>
              <Text style={styles.tipItem}>• Set reminders throughout the day</Text>
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  glassSizeSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  glassSizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  glassSizeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGlassSize: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#fff',
  },
  glassSizeText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  selectedGlassSizeText: {
    color: '#4facfe',
  },
  addWaterSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  waterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  removeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  controlButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4facfe',
  },
  glassDisplay: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 25,
  },
  glassEmoji: {
    fontSize: 40,
    marginBottom: 5,
  },
  glassSize: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  addWaterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addWaterButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4facfe',
  },
  remainingSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  remainingTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
    fontWeight: '600',
  },
  remainingText: {
    fontSize: 16,
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
  customAmountSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  customAmountLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 10,
    fontWeight: '600',
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customAmountInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  customAmountButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  customAmountButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4facfe',
  },
  disabledButton: {
    opacity: 0.5,
  },
  waterLogSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  waterLogList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
  },
  waterLogEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  waterLogAmount: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  waterLogTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default WaterScreen;
