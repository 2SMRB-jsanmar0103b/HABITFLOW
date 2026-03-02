import { User, Habit, Difficulty } from '../types';

const STORAGE_KEYS = {
  USERS: 'habitflow_users_db_v1',
  CURRENT_USER_EMAIL: 'habitflow_current_session_email_v1',
  HABITS_PREFIX: 'habitflow_habits_v1_'
};

const DUMMY_USERS: Partial<User>[] = [
  { name: 'Alex Rivera', username: 'arivera', email: 'alex@dummy.com', totalXp: 12500, level: 12, maxStreakRecord: 42, hardestHabitCompleted: 'extreme' },
  { name: 'Elena Sanz', username: 'elenasanz', email: 'elena@dummy.com', totalXp: 9800, level: 10, maxStreakRecord: 28, hardestHabitCompleted: 'hard' },
  { name: 'Marcos Fit', username: 'mfit99', email: 'marcos@dummy.com', totalXp: 8200, level: 9, maxStreakRecord: 35, hardestHabitCompleted: 'extreme' },
  { name: 'Lucía Zen', username: 'lucia_zen', email: 'lucia@dummy.com', totalXp: 7500, level: 8, maxStreakRecord: 15, hardestHabitCompleted: 'medium' },
  { name: 'Javi Focus', username: 'javi_focus', email: 'javi@dummy.com', totalXp: 6200, level: 7, maxStreakRecord: 12, hardestHabitCompleted: 'hard' },
  { name: 'Sara Flow', username: 'saraflow', email: 'sara@dummy.com', totalXp: 4500, level: 5, maxStreakRecord: 8, hardestHabitCompleted: 'medium' },
  { name: 'Dani Habit', username: 'danihabit', email: 'dani@dummy.com', totalXp: 3200, level: 4, maxStreakRecord: 21, hardestHabitCompleted: 'extreme' },
  { name: 'Nerea Paz', username: 'nereapaz', email: 'nerea@dummy.com', totalXp: 2100, level: 3, maxStreakRecord: 5, hardestHabitCompleted: 'easy' },
];

/**
 * Enhanced storage service simulating a multi-user database with password authentication.
 */
export const storageService = {
  getAllUsers: (): User[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      let users = data ? JSON.parse(data) : [];
      
      // Seed dummy data if empty to make ranking look alive
      if (users.length < 5) {
        const seedUsers = DUMMY_USERS.map(u => ({
          ...u,
          password: 'password123',
          currentXp: 0,
          nextLevelXp: 1000,
          darkMode: true,
          language: 'es' as const,
          isGuest: false,
          subscriptionPlan: 'free' as const
        })) as User[];
        
        // Merge without duplicates
        const existingEmails = new Set(users.map((u: User) => u.email.toLowerCase()));
        seedUsers.forEach(su => {
          if (!existingEmails.has(su.email.toLowerCase())) {
            users.push(su);
          }
        });
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      }
      return users;
    } catch (e) {
      return [];
    }
  },

  findUser: (identifier: string): User | undefined => {
    if (!identifier) return undefined;
    const users = storageService.getAllUsers();
    return users.find(u => 
      u.email.toLowerCase() === identifier.toLowerCase() || 
      u.username.toLowerCase() === identifier.toLowerCase()
    );
  },

  authenticate: (identifier: string, password: string): User | null => {
    const user = storageService.findUser(identifier);
    if (user && user.password === password) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_EMAIL, user.email);
      return user;
    }
    return null;
  },

  saveUser: (user: User) => {
    if (!user || !user.email) return;
    const users = storageService.getAllUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    if (!user.isGuest) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_EMAIL, user.email);
    }
  },

  loadHabits: (email: string): Habit[] => {
    if (!email) return [];
    const data = localStorage.getItem(`${STORAGE_KEYS.HABITS_PREFIX}${email}`);
    try {
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveHabits: (email: string, habits: Habit[]) => {
    if (!email) return;
    localStorage.setItem(`${STORAGE_KEYS.HABITS_PREFIX}${email}`, JSON.stringify(habits));
  },

  getCurrentSessionUser: (): User | null => {
    const email = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_EMAIL);
    if (!email) return null;
    return storageService.findUser(email) || null;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_EMAIL);
  }
};