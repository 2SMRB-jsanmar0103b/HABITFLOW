import { User, Habit } from '../types';

const API_URL = 'http://localhost:5000/api';

/**
 * Storage service connected to the MongoDB Backend.
 */
export const storageService = {
  // Helper for API requests
  api: async (endpoint: string, options: RequestInit = {}) => {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'API Error');
      }
      return await res.json();
    } catch (e) {
      console.error(`API Call failed: ${endpoint}`, e);
      throw e;
    }
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      return await storageService.api('/users');
    } catch (e) {
      return [];
    }
  },

  findUser: async (identifier: string): Promise<User | undefined> => {
    // This is less efficient with the current API structure but keeps compatibility
    // In a real app, we'd have a specific search endpoint
    const users = await storageService.getAllUsers();
    return users.find(u =>
      u.email.toLowerCase() === identifier.toLowerCase() ||
      u.username.toLowerCase() === identifier.toLowerCase()
    );
  },

  authenticate: async (identifier: string, password: string): Promise<User | null> => {
    try {
      const user = await storageService.api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });
      if (user) {
        localStorage.setItem('habitflow_token', user.email); // Simple session management for now
      }
      return user;
    } catch (e) {
      return null;
    }
  },

  register: async (userData: Partial<User>): Promise<User | null> => {
    try {
      const user = await storageService.api('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      if (user) {
        localStorage.setItem('habitflow_token', user.email);
      }
      return user;
    } catch (e) {
      throw e;
    }
  },

  saveUser: async (user: User) => {
    if (!user || !user.email) return;
    try {
      await storageService.api(`/users/${user.email}`, {
        method: 'PUT',
        body: JSON.stringify(user)
      });
    } catch (e) {
      console.error('Failed to save user', e);
    }
  },

  loadHabits: async (email: string): Promise<Habit[]> => {
    if (!email) return [];
    try {
      return await storageService.api(`/habits/${email}`);
    } catch (e) {
      return [];
    }
  },

  saveHabits: async (email: string, habits: Habit[]) => {
    if (!email) return;
    try {
      await storageService.api(`/habits/${email}`, {
        method: 'POST',
        body: JSON.stringify(habits)
      });
    } catch (e) {
      console.error('Failed to save habits', e);
    }
  },

  getCurrentSessionUser: async (): Promise<User | null> => {
    const email = localStorage.getItem('habitflow_token');
    if (!email) return null;
    // We need to fetch the fresh user data
    const users = await storageService.getAllUsers();
    return users.find(u => u.email === email) || null;
  },

  logout: () => {
    localStorage.removeItem('habitflow_token');
  }
};