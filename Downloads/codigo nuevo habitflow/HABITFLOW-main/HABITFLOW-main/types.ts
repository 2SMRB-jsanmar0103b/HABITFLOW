export type ViewState = 'LANDING' | 'LOGIN' | 'REGISTER' | 'SUBSCRIPTION_SETUP' | 'ONBOARDING' | 'HOME' | 'HISTORY' | 'STATS' | 'PROFILE' | 'RANKING' | 'ADVISOR';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'extreme';
export type FrequencyType = 'daily' | 'weekly';
export type Language = 'es' | 'en';

export interface Habit {
  id: string;
  title: string;
  description?: string;
  icon: string;
  color: string;
  difficulty: Difficulty;
  frequencyType: FrequencyType;
  xpReward: number;
  completedDates: string[]; // ISO date strings YYYY-MM-DD
  streak: number;
}

export interface User {
  name: string;
  username: string;
  email: string;
  password?: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalXp: number;
  darkMode: boolean;
  language: Language;
  profileImage?: string;
  subscriptionPlan: 'free' | 'basic' | 'premium';
  isGuest?: boolean;
  onboardingCompleted?: boolean;
  friends?: string[];
  weeklyXp?: number;
  maxStreakRecord?: number;
  hardestHabitCompleted?: Difficulty;
  onboardingAnswers?: {
    goal: string;
    energy: string;
    intensity: string;
  };
}

export const HABIT_ICONS = [
  'Sparkles', 'Zap', 'BookOpen', 'Dumbbell', 'Droplets', 'Moon',
  'Sun', 'Briefcase', 'Music', 'Heart', 'Brain', 'Coffee'
];

export const HABIT_COLORS = [
  'bg-brand-lime', 'bg-purple-500', 'bg-blue-500', 
  'bg-pink-500', 'bg-orange-500', 'bg-yellow-400'
];