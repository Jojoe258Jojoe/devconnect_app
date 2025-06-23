import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  provider?: string;
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
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      loading: false,
      
      initialize: async () => {
        set({ loading: true });
        
        try {
          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Session error:', error);
            set({ isAuthenticated: false, user: null, loading: false });
            return;
          }

          if (session?.user) {
            // User is authenticated
            const user: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
              avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
              provider: session.user.app_metadata?.provider
            };

            set({
              isAuthenticated: true,
              user,
              loading: false
            });
          } else {
            set({ isAuthenticated: false, user: null, loading: false });
          }
        } catch (error) {
          console.error('Initialize error:', error);
          set({ isAuthenticated: false, user: null, loading: false });
        }
      },
      
      login: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            console.error('Login error:', error);
            return false;
          }

          if (data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email || '',
              name: data.user.user_metadata?.full_name || 'User',
              avatar: data.user.user_metadata?.avatar_url,
              provider: 'email'
            };

            set({
              isAuthenticated: true,
              user
            });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },

      loginWithGoogle: async () => {
        try {
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
              queryParams: {
                access_type: 'offline',
                prompt: 'consent',
              },
            },
          });

          if (error) {
            console.error('Google login error:', error);
            return false;
          }

          // OAuth redirect will handle the rest
          return true;
        } catch (error) {
          console.error('Google login error:', error);
          return false;
        }
      },
      
      register: async (email: string, password: string, name: string, username: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
                username: username,
              },
            },
          });

          if (error) {
            console.error('Registration error:', error);
            return false;
          }

          if (data.user) {
            const user: User = {
              id: data.user.id,
              email: data.user.email || '',
              name: name,
              provider: 'email'
            };

            set({
              isAuthenticated: true,
              user
            });
            return true;
          }
          
          return false;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      },
      
      logout: async () => {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            isAuthenticated: false,
            user: null
          });
        }
      },
      
      resetPassword: async (email: string) => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/reset-password`,
          });

          if (error) {
            console.error('Reset password error:', error);
            return false;
          }

          return true;
        } catch (error) {
          console.error('Reset password error:', error);
          return false;
        }
      },

      updateProfile: (updates: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates }
          });
        }
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