import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (email: string, password: string, name: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      
      initialize: async () => {
        set({ loading: true });
        // Simulate quick initialization
        setTimeout(() => {
          set({ loading: false });
        }, 100);
      },
      
      login: async (email: string, password: string) => {
        try {
          // Mock login - replace with real auth later
          const mockUser = {
            id: '1',
            email,
            name: 'Demo User',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          };
          
          set({
            isAuthenticated: true,
            user: mockUser
          });
          
          return true;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      loginWithGoogle: async () => {
        try {
          // Mock Google login
          const mockUser = {
            id: '1',
            email: 'user@gmail.com',
            name: 'Google User',
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          };
          
          set({
            isAuthenticated: true,
            user: mockUser
          });
          
          return true;
        } catch (error) {
          console.error('Google login error:', error);
          return false;
        }
      },
      
      register: async (email: string, password: string, name: string, username: string) => {
        try {
          // Mock registration
          const mockUser = {
            id: '1',
            email,
            name,
            avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
          };
          
          set({
            isAuthenticated: true,
            user: mockUser
          });
          
          return true;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      },
      
      logout: async () => {
        set({
          isAuthenticated: false,
          user: null
        });
      },
      
      resetPassword: async (email: string) => {
        // Mock password reset
        return true;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);