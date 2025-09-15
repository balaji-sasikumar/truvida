import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, DailyProgress, WaterIntake, StepsData } from '../types';

const KEYS = {
  USER: 'user',
  DAILY_PROGRESS: 'daily_progress',
  WATER_INTAKE: 'water_intake',
  STEPS_DATA: 'steps_data',
};

export class StorageService {
  static async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  static async updateUser(updates: Partial<User>): Promise<void> {
    try {
      const currentUser = await this.getUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, ...updates };
        await this.saveUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  static async saveDailyProgress(progress: DailyProgress): Promise<void> {
    try {
      const key = `${KEYS.DAILY_PROGRESS}_${progress.date}`;
      await AsyncStorage.setItem(key, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving daily progress:', error);
      throw error;
    }
  }

  static async getDailyProgress(date: string): Promise<DailyProgress | null> {
    try {
      const key = `${KEYS.DAILY_PROGRESS}_${date}`;
      const progressData = await AsyncStorage.getItem(key);
      return progressData ? JSON.parse(progressData) : null;
    } catch (error) {
      console.error('Error getting daily progress:', error);
      return null;
    }
  }

  static async saveWaterIntake(waterIntake: WaterIntake): Promise<void> {
    try {
      const key = `${KEYS.WATER_INTAKE}_${waterIntake.date}`;
      await AsyncStorage.setItem(key, JSON.stringify(waterIntake));
    } catch (error) {
      console.error('Error saving water intake:', error);
      throw error;
    }
  }

  static async getWaterIntake(date: string): Promise<WaterIntake | null> {
    try {
      const key = `${KEYS.WATER_INTAKE}_${date}`;
      const waterData = await AsyncStorage.getItem(key);
      return waterData ? JSON.parse(waterData) : null;
    } catch (error) {
      console.error('Error getting water intake:', error);
      return null;
    }
  }

  static async saveStepsData(stepsData: StepsData): Promise<void> {
    try {
      const key = `${KEYS.STEPS_DATA}_${stepsData.date}`;
      await AsyncStorage.setItem(key, JSON.stringify(stepsData));
    } catch (error) {
      console.error('Error saving steps data:', error);
      throw error;
    }
  }

  static async getStepsData(date: string): Promise<StepsData | null> {
    try {
      const key = `${KEYS.STEPS_DATA}_${date}`;
      const stepsData = await AsyncStorage.getItem(key);
      return stepsData ? JSON.parse(stepsData) : null;
    } catch (error) {
      console.error('Error getting steps data:', error);
      return null;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}
