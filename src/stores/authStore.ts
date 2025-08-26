import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import apiService from '@/services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    year?: number;
    major?: string;
    hometown?: string;
  }) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.login({ email, password });
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || 'Login failed',
            });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.register(userData);
          
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              isLoading: false,
              error: response.message || 'Registration failed',
            });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
          });
          return false;
        }
      },

      logout: () => {
        // Clear local storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('campusconnect_token');
          localStorage.removeItem('campusconnect_refresh_token');
        }
        
        // Reset state
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      },

      checkAuth: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('campusconnect_token') : null;
        
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        set({ isLoading: true });
        
        try {
          const response = await apiService.getCurrentUser();
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              isAuthenticated: false,
              user: null,
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            error: error.message || 'Authentication check failed',
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
    }),
    {
      name: 'campusconnect-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
); 