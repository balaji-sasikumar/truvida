export interface User {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  username: string;
  password: string;
  waterGoal: number;
  stepsGoal: number;
  notificationsEnabled: boolean;
  waterReminderInterval: number;
}

export interface WaterIntake {
  date: string;
  glasses: number;
  totalMl: number;
  glassSize: number;
}

export interface StepsData {
  date: string;
  steps: number;
}

export interface DailyProgress {
  date: string;
  waterIntake: WaterIntake;
  stepsData: StepsData;
}

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  JoinClan: undefined;
  Leaderboard: undefined;
};

export type TabParamList = {
  Home: undefined;
  Water: undefined;
  Steps: undefined;
  Profile: undefined;
};
