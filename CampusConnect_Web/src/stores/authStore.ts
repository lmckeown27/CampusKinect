import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginForm, RegisterForm } from '../types';
import apiService from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
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
      login: async (credentials: LoginForm) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, tokens } = await apiService.login(credentials);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          let errorMessage = 'Login failed';
          
          // Handle specific error scenarios
          if (error.response?.status === 401) {
            if (error.response?.data?.message?.toLowerCase().includes('not found') ||
                error.response?.data?.message?.toLowerCase().includes('does not exist')) {
              errorMessage = 'Account not found. This email is not registered in our database.';
            } else if (error.response?.data?.message?.toLowerCase().includes('invalid credentials')) {
              errorMessage = 'Invalid email or password. Please check your credentials.';
            } else {
              errorMessage = 'Invalid email or password. Please check your credentials.';
            }
          } else if (error.response?.status === 403) {
            if (error.response?.data?.message?.toLowerCase().includes('not verified')) {
              errorMessage = 'Email not verified. Please check your email for a verification code.';
            } else {
              errorMessage = 'Account access denied. Please contact support.';
            }
          } else if (error.response?.status === 422) {
            errorMessage = 'Please check your email format and try again.';
          } else if (error.response?.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (userData: RegisterForm) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, tokens } = await apiService.register(userData);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          let errorMessage = 'Registration failed';
          
          // Handle specific error scenarios
          if (error.response?.status === 409) {
            if (error.response?.data?.message?.toLowerCase().includes('email') && 
                error.response?.data?.message?.toLowerCase().includes('already exists')) {
              errorMessage = 'An account with this email already exists. Please sign in instead.';
            } else if (error.response?.data?.message?.toLowerCase().includes('username') && 
                       error.response?.data?.message?.toLowerCase().includes('already exists')) {
              errorMessage = 'This username is already taken. Please choose a different one.';
            } else {
              errorMessage = 'Account already exists. Please sign in instead.';
            }
          } else if (error.response?.status === 422) {
            errorMessage = 'Please check your information and try again.';
          } else if (error.response?.status >= 500) {
            errorMessage = 'Server error. Please try again later.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        apiService.logout();
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
      },

      checkAuth: async () => {
        set({ isLoading: true });
        
        try {
          const user = await apiService.checkAuth();
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        } catch (error: any) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        
        try {
          const updatedUser = await apiService.updateProfile(userData);
          set({ 
            user: updatedUser, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          set({ 
            error: error.message || 'Profile update failed', 
            isLoading: false 
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
); 