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
import {
  Svg,
  Path,
  G,
  Defs,
  Mask,
  Circle as SvgCircle,
} from 'react-native-svg';
import { User, WaterIntake } from '../types';
import { StorageService } from '../services/storage';
import { getTodayString } from '../utils/dateUtils';

const GLASS_SIZES = [150, 250, 350, 500];

interface WaterEntry {
  id: string;
  amount: number;
  timestamp: string;
}

const WaterScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [waterIntake, setWaterIntake] = useState<WaterIntake | null>(null);
  const [selectedGlassSize, setSelectedGlassSize] = useState(250);
  const [customAmount, setCustomAmount] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
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
      setWaterIntake(
        todayWater || {
          date: today,
          glasses: 0,
          totalMl: 0,
          glassSize: 250,
        },
      );
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
    } catch {
      return [];
    }
  };

  const saveWaterEntry = async (amount: number) => {
    const today = getTodayString();
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const newEntry: WaterEntry = {
      id: Date.now().toString(),
      amount,
      timestamp,
    };
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
      if (
        newWaterIntake.totalMl >= user.waterGoal &&
        waterIntake.totalMl < user.waterGoal
      ) {
        Alert.alert(
          '🎉 Congratulations!',
          "You've reached your daily water goal!",
        );
      }
    } catch {
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
    } catch {
      Alert.alert('Error', 'Failed to update water intake');
    }
  };

  const removeWaterEntry = async (entryId: string) => {
    const today = getTodayString();
    const updatedEntries = waterEntries.filter(entry => entry.id !== entryId);
    try {
      const entriesKey = `water_entries_${today}`;
      await StorageService.saveData(entriesKey, JSON.stringify(updatedEntries));
      setWaterEntries(updatedEntries);

      const totalRemoved =
        waterEntries.find(entry => entry.id === entryId)?.amount || 0;
      if (waterIntake) {
        const newWaterIntake = {
          ...waterIntake,
          glasses: Math.max(0, waterIntake.glasses - 1),
          totalMl: Math.max(0, waterIntake.totalMl - totalRemoved),
        };
        await StorageService.saveWaterIntake(newWaterIntake);
        setWaterIntake(newWaterIntake);
      }
    } catch (error) {
      console.error('Error removing water entry:', error);
      Alert.alert('Error', 'Failed to remove water entry');
    }
  };

  const saveWaterGoal = async () => {
    const newGoal = parseInt(goalInput);
    if (isNaN(newGoal) || newGoal <= 0) {
      Alert.alert('Error', 'Please enter a valid water goal');
      return;
    }
    if (newGoal < 500 || newGoal > 10000) {
      Alert.alert('Error', 'Water goal should be between 500ml and 10000ml');
      return;
    }
    try {
      if (!user) return;
      const updatedUser: User = {
        ...user,
        waterGoal: newGoal,
      };
      await StorageService.saveUser(updatedUser);
      setUser(updatedUser);
      setEditingGoal(false);
      setGoalInput('');
      Alert.alert('Success', 'Water goal updated successfully!');
    } catch {
      Alert.alert('Error', 'Failed to update water goal');
    }
  };

  const getProgress = () => {
    if (!user || !waterIntake) return 0;
    return Math.min(waterIntake.totalMl / user.waterGoal, 1);
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
            <Text style={styles.title}>💧 Water Tracking</Text>
            <Text style={styles.subtitle}>
              Stay hydrated throughout the day
            </Text>
          </View>

          {/* Progress Circle */}
          <View style={styles.progressSection}>
            <View style={styles.progressCircle}>
              <WaterWaveProgress
                progress={getProgress()}
                size={200}
                strokeWidth={8}
                waterColor="#4facfe"
                backgroundColor="#2d2d2d"
                borderColor="#444"
              />
              <View style={styles.progressInner}>
                <Text style={styles.progressText}>
                  {Math.round(getProgress() * 100)}%
                </Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{waterIntake.totalMl}ml</Text>
                <Text style={styles.statLabel}>Consumed</Text>
              </View>
              <TouchableOpacity
                style={styles.goalBox}
                onPress={() => {
                  setEditingGoal(true);
                  setGoalInput(user?.waterGoal.toString() || '');
                }}
              >
                <Text style={styles.statValue}>{user.waterGoal}ml</Text>
                <Text style={styles.statLabel}>Goal</Text>
              </TouchableOpacity>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{waterIntake.glasses}</Text>
                <Text style={styles.statLabel}>Glasses</Text>
              </View>
            </View>
          </View>

          {/* Edit Goal Modal */}
          {editingGoal && (
            <View style={styles.editGoalModal}>
              <View style={styles.editGoalContainer}>
                <Text style={styles.editGoalTitle}>Edit Water Goal</Text>
                <Text style={styles.editGoalSubtitle}>
                  Set your daily water intake goal
                </Text>
                <TextInput
                  style={styles.editGoalInput}
                  value={goalInput}
                  onChangeText={setGoalInput}
                  placeholder="Enter goal in ml"
                  keyboardType="numeric"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                />
                <View style={styles.editGoalButtons}>
                  <TouchableOpacity
                    style={[styles.editGoalButton, styles.cancelButton]}
                    onPress={() => setEditingGoal(false)}
                  >
                    <Text style={styles.editGoalButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editGoalButton, styles.saveButton]}
                    onPress={saveWaterGoal}
                    disabled={!goalInput}
                  >
                    <Text style={styles.editGoalButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Glass Size Selection */}
          <View style={styles.glassSizeSection}>
            <Text style={styles.sectionTitle}>Glass Size</Text>
            <View style={styles.glassSizeButtons}>
              {GLASS_SIZES.map(size => {
                let glassIcon = '';
                if (size <= 200) glassIcon = '🥃';
                else if (size <= 300) glassIcon = '🥛';
                else if (size <= 400) glassIcon = '🥤';
                else glassIcon = '🧋';

                return (
                  <TouchableOpacity
                    key={size}
                    style={[
                      styles.glassSizeButton,
                      selectedGlassSize === size && styles.selectedGlassSize,
                    ]}
                    onPress={() => setSelectedGlassSize(size)}
                  >
                    <View style={styles.glassIconContainer}>
                      <Text style={styles.glassSizeIcon}>{glassIcon}</Text>
                      <View
                        style={{ flexDirection: 'row', alignItems: 'flex-end' }}
                      >
                        <Text
                          style={[
                            styles.glassSizeNumber,
                            selectedGlassSize === size &&
                              styles.selectedGlassSizeNumber,
                          ]}
                        >
                          {size}
                        </Text>
                        <Text
                          style={[
                            styles.glassSizeMl,
                            selectedGlassSize === size &&
                              styles.selectedGlassSizeMl,
                          ]}
                        >
                          ml
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Custom Amount Input */}
            <View style={styles.customInputContainer}>
              <Text style={styles.customAmountLabel}>Custom Amount</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={[
                    styles.customInput,
                    focusedInput === 'customAmount' && styles.inputFocused,
                  ]}
                  value={customAmount}
                  onChangeText={setCustomAmount}
                  placeholder="Enter ml"
                  placeholderTextColor="#888"
                  keyboardType="numeric"
                  maxLength={4}
                  onFocus={() => setFocusedInput('customAmount')}
                  onBlur={() => setFocusedInput(null)}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  style={[
                    styles.addCustomButton,
                    !customAmount && styles.addCustomButtonDisabled,
                  ]}
                  onPress={addCustomWater}
                  disabled={!customAmount}
                >
                  <Text style={{ fontSize: 16, marginRight: 4 }}>🥤</Text>
                  <Text style={styles.addCustomButtonText}>Add</Text>
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
                <Text style={styles.glassEmoji}>💧</Text>
                <Text style={styles.glassSize}>{selectedGlassSize}ml</Text>
              </View>
              <TouchableOpacity
                style={[styles.controlButton, styles.addButton]}
                onPress={handleAddWater}
              >
                <Text style={styles.controlButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.addWaterButton}
              onPress={handleAddWater}
            >
              <Text style={styles.addWaterButtonText}>Add Glass</Text>
            </TouchableOpacity>
          </View>

          {/* Remaining Info */}
          <View style={styles.remainingSection}>
            <Text style={styles.remainingTitle}>To reach your goal:</Text>
            <Text style={styles.remainingText}>
              {getRemainingGlasses() > 0
                ? `${getRemainingGlasses()} more glasses (${selectedGlassSize}ml each)`
                : 'Goal achieved! 🎉'}
            </Text>
          </View>

          {/* Today's Water Log */}
          {waterEntries.length > 0 && (
            <View style={styles.waterLogSection}>
              <Text style={styles.sectionTitle}>Today's Water Log</Text>
              <View style={styles.waterLogList}>
                {waterEntries.map(entry => (
                  <View key={entry.id} style={styles.waterLogEntry}>
                    <View style={styles.waterLogInfo}>
                      <Text style={styles.waterLogAmount}>
                        {entry.amount}ml
                      </Text>
                      <Text style={styles.waterLogTime}>{entry.timestamp}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => removeWaterEntry(entry.id)}
                    >
                      <Text style={styles.deleteButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
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
    backgroundColor: '#121212',
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
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  progressSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  glassSizeSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14, // or manually add marginHorizontal on .statBox
    width: '100%',
  },

  progressCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  progressInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
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
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    minWidth: 80,
  },
  goalBox: {
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    minWidth: 80,
  },
  editGoalModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  editGoalContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    alignItems: 'center',
  },
  editGoalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  editGoalSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 20,
    textAlign: 'center',
  },
  editGoalInput: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    width: '100%',
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 20,
  },
  editGoalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  editGoalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  saveButton: {
    backgroundColor: '#4facfe',
  },
  editGoalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  glassSizeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  glassSizeButton: {
    backgroundColor: '#2d2d2d',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#333',
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  selectedGlassSize: {
    backgroundColor: '#444',
    borderColor: '#4facfe',
  },
  glassIconContainer: {
    alignItems: 'center',
  },
  glassSizeIcon: {
    fontSize: 30,
    marginBottom: 8,
    color: '#fff',
  },
  glassSizeText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  selectedGlassSizeText: {
    color: '#4facfe',
    fontWeight: '700',
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
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    paddingVertical: 25,
    paddingHorizontal: 30,
    minWidth: 120,
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
    color: 'rgba(255, 255, 255, 0.7)',
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
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    padding: 20,
  },
  tipItem: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
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
    justifyContent: 'space-between',
    backgroundColor: '#222',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#333',
    gap: 10,
  },
  customAmountInput: {
    flex: 1,
    color: '#fff',
    backgroundColor: 'transparent',
    fontSize: 16,
    padding: 0,
    marginRight: 10,
    borderWidth: 0,
  },
  customAmountButton: {
    backgroundColor: '#4facfe',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  customAmountButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 6,
  },
  customAmountInputFocused: {
    borderColor: '#667eea',
    backgroundColor: '#333',
  },
  disabledButton: {
    opacity: 0.5,
  },
  waterLogSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  waterLogList: {
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    padding: 15,
  },
  waterLogEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  waterLogInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  waterLogAmount: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    marginRight: 10,
  },
  waterLogTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 89, 94, 0.2)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#ff595e',
    fontWeight: 'bold',
  },
  glassSizeNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  selectedGlassSizeNumber: {
    color: '#4facfe',
  },
  glassSizeMl: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 2,
    fontWeight: '400',
  },
  selectedGlassSizeMl: {
    color: '#4facfe',
  },

  customInputContainer: {
    marginTop: 14,
    marginBottom: 8,
    paddingHorizontal: 0,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#202328',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#364066',
    padding: 4,
  },
  customInput: {
    flex: 1,
    backgroundColor: 'transparent',
    color: '#fff',
    fontSize: 15,
    padding: 10,
    borderRadius: 15,
  },
  inputFocused: {
    borderColor: '#4facfe',
    backgroundColor: '#222',
  },
  addCustomButton: {
    backgroundColor: '#4facfe',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 9,
    marginLeft: 8,
  },
  addCustomButtonDisabled: {
    backgroundColor: '#4facfe99',
  },
  addCustomButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

interface WaterWaveProgressProps {
  progress: number;
  size: number;
  strokeWidth: number;
  waterColor: string;
  backgroundColor: string;
  borderColor: string;
}

const WaterWaveProgress: React.FC<WaterWaveProgressProps> = ({
  progress,
  size,
  strokeWidth,
  waterColor,
  backgroundColor,
  borderColor,
}) => {
  const radius = (size - strokeWidth) / 2;
  const waveHeight = 7; // Increase for more pronounced wave
  const waveLength = 38;
  const waveBase = size - radius * 2 * progress - strokeWidth;

  const createWavePath = (offset: number) => {
    let path = `M 0 ${waveBase}`;
    for (let i = 0; i <= size; i += 5) {
      const waveY =
        waveBase +
        waveHeight * Math.sin(((i + offset) * 2 * Math.PI) / waveLength);
      path += ` L ${i} ${waveY}`;
    }
    path += ` L ${size} ${size} L 0 ${size} Z`;
    return path;
  };

  const [waveOffset, setWaveOffset] = React.useState<number>(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setWaveOffset(prev => (prev + 2) % waveLength);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <Mask id="circle-mask">
            <SvgCircle cx={size / 2} cy={size / 2} r={radius} fill="#fff" />
          </Mask>
        </Defs>
        <SvgCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill={backgroundColor}
          stroke={borderColor}
          strokeWidth={strokeWidth}
        />
        <G mask="url(#circle-mask)">
          <Path
            d={createWavePath(waveOffset)}
            fill={waterColor}
            opacity={0.8}
          />
          <Path
            d={createWavePath(waveOffset + waveLength / 2)}
            fill={waterColor}
            opacity={0.5}
          />
        </G>
      </Svg>
    </View>
  );
};

export default WaterScreen;
