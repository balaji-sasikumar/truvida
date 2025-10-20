import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  StatusBar,
} from 'react-native';

import { User } from '../types';
import { StorageService } from '../services/storage';

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    waterGoal: '',
    stepsGoal: '',
    notificationsEnabled: true,
    waterReminderInterval: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await StorageService.getUser();
      if (userData) {
        setUser(userData);
        setFormData({
          name: userData.name,
          age: userData.age.toString(),
          height: userData.height.toString(),
          weight: userData.weight.toString(),
          waterGoal: userData.waterGoal.toString(),
          stepsGoal: userData.stepsGoal.toString(),
          notificationsEnabled: userData.notificationsEnabled,
          waterReminderInterval: userData.waterReminderInterval.toString(),
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    const {
      name,
      age,
      height,
      weight,
      waterGoal,
      stepsGoal,
      waterReminderInterval,
    } = formData;
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return false;
    }
    const ageNum = parseInt(age);
    const heightNum = parseFloat(height);
    const weightNum = parseFloat(weight);
    const waterGoalNum = parseInt(waterGoal);
    const stepsGoalNum = parseInt(stepsGoal);
    const reminderInterval = parseInt(waterReminderInterval);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      Alert.alert('Error', 'Please enter a valid age (1-120)');
      return false;
    }
    if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
      Alert.alert('Error', 'Please enter a valid height in cm (50-300)');
      return false;
    }
    if (isNaN(weightNum) || weightNum < 20 || weightNum > 500) {
      Alert.alert('Error', 'Please enter a valid weight in kg (20-500)');
      return false;
    }
    if (isNaN(waterGoalNum) || waterGoalNum < 500 || waterGoalNum > 5000) {
      Alert.alert('Error', 'Please enter a valid water goal (500-5000ml)');
      return false;
    }
    if (isNaN(stepsGoalNum) || stepsGoalNum < 1000 || stepsGoalNum > 50000) {
      Alert.alert('Error', 'Please enter a valid steps goal (1000-50000)');
      return false;
    }
    if (
      isNaN(reminderInterval) ||
      reminderInterval < 1 ||
      reminderInterval > 12
    ) {
      Alert.alert(
        'Error',
        'Please enter a valid reminder interval (1-12 hours)',
      );
      return false;
    }
    return true;
  };

  const saveProfile = async () => {
    if (!validateForm() || !user) return;
    try {
      const updatedUser: User = {
        ...user,
        name: formData.name.trim(),
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        waterGoal: parseInt(formData.waterGoal),
        stepsGoal: parseInt(formData.stepsGoal),
        notificationsEnabled: formData.notificationsEnabled,
        waterReminderInterval: parseInt(formData.waterReminderInterval),
      };
      await StorageService.saveUser(updatedUser);
      setUser(updatedUser);
      setEditMode(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const cancelEdit = () => {
    if (user) {
      setFormData({
        name: user.name,
        age: user.age.toString(),
        height: user.height.toString(),
        weight: user.weight.toString(),
        waterGoal: user.waterGoal.toString(),
        stepsGoal: user.stepsGoal.toString(),
        notificationsEnabled: user.notificationsEnabled,
        waterReminderInterval: user.waterReminderInterval.toString(),
      });
    }
    setEditMode(false);
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'Are you sure you want to clear all data? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.clearAllData();
              Alert.alert('Success', 'All data cleared successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ],
    );
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
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <View style={styles.gradient}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>💪 Profile</Text>
            <Text style={styles.subtitle}>Manage your wellness profile</Text>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{user.name}</Text>
                <Text style={styles.profileUsername}>@{user.username}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditMode(!editMode)}
              >
                <Text style={styles.editButtonText}>
                  {editMode ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Personal Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={[styles.input, !editMode && styles.disabledInput]}
                  value={formData.name}
                  onChangeText={value => handleInputChange('name', value)}
                  editable={editMode}
                  placeholder="Enter your name"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Age</Text>
                  <TextInput
                    style={[styles.input, !editMode && styles.disabledInput]}
                    value={formData.age}
                    onChangeText={value => handleInputChange('age', value)}
                    editable={editMode}
                    keyboardType="numeric"
                    placeholder="Age"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  />
                </View>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Height (cm)</Text>
                  <TextInput
                    style={[styles.input, !editMode && styles.disabledInput]}
                    value={formData.height}
                    onChangeText={value => handleInputChange('height', value)}
                    editable={editMode}
                    keyboardType="numeric"
                    placeholder="Height"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  />
                </View>
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Weight (kg)</Text>
                <TextInput
                  style={[styles.input, !editMode && styles.disabledInput]}
                  value={formData.weight}
                  onChangeText={value => handleInputChange('weight', value)}
                  editable={editMode}
                  keyboardType="numeric"
                  placeholder="Weight"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
              </View>
            </View>

            {/* Goals */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Goals</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Water Goal (ml)</Text>
                <TextInput
                  style={[styles.input, !editMode && styles.disabledInput]}
                  value={formData.waterGoal}
                  onChangeText={value => handleInputChange('waterGoal', value)}
                  editable={editMode}
                  keyboardType="numeric"
                  placeholder="Water goal"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Steps Goal</Text>
                <TextInput
                  style={[styles.input, !editMode && styles.disabledInput]}
                  value={formData.stepsGoal}
                  onChangeText={value => handleInputChange('stepsGoal', value)}
                  editable={editMode}
                  keyboardType="numeric"
                  placeholder="Steps goal"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
              </View>
            </View>

            {/* Notifications */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notifications</Text>
              {/* Row for Water Reminders and Toggle */}
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Water Reminders</Text>
                <Switch
                  value={formData.notificationsEnabled}
                  onValueChange={value =>
                    handleInputChange('notificationsEnabled', value)
                  }
                  disabled={!editMode}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={
                    formData.notificationsEnabled ? '#f5dd4b' : '#f4f3f4'
                  }
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Reminder Interval (hours)</Text>
                <TextInput
                  style={[styles.input, !editMode && styles.disabledInput]}
                  value={formData.waterReminderInterval}
                  onChangeText={value =>
                    handleInputChange('waterReminderInterval', value)
                  }
                  editable={editMode}
                  keyboardType="numeric"
                  placeholder="Reminder interval"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                />
              </View>
            </View>

            {/* Action Buttons */}
            {editMode && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveProfile}
                >
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelEdit}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Danger Zone */}
            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Danger Zone</Text>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={clearAllData}
              >
                <Text style={styles.dangerButtonText}>Clear All Data</Text>
              </TouchableOpacity>
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
    paddingBottom: 120,
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
  profileCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  editButton: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    padding: 25,
    marginBottom: 20,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 15,
  },
  halfWidth: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#2d2d2d',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#444',
  },
  disabledInput: {
    backgroundColor: '#252525',
    borderColor: '#444',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 0,
  },
  switchLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  dangerZone: {
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    padding: 25,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 15,
  },
  dangerButton: {
    backgroundColor: '#f44336',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default ProfileScreen;
