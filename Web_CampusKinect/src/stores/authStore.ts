import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, LoginForm, RegisterApiData } from '../types';
import apiService from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  // Guest mode state
  isGuest: boolean;
  guestUniversityId: number | null;
  guestUniversityName: string | null;
}

interface AuthActions {
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterApiData) => Promise<void>;
  logout: (redirectCallback?: () => void) => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateProfilePicture: (profilePictureUrl: string) => Promise<void>;
  verifyEmail: (verificationCode: string) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  attemptTokenRefresh: () => Promise<boolean>;
  debugUserData: () => void;
  forceLogout: () => void;
  // Guest mode actions
  enterGuestMode: (universityId: number, universityName: string) => void;
  exitGuestMode: () => void;
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
      isGuest: false,
      guestUniversityId: null,
      guestUniversityName: null,

      // Actions
      login: async (credentials: LoginForm) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user } = await apiService.login(credentials);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          console.error('Login error:', error);
          set({ 
            error: error.message || 'Login failed. Please try again.',
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      register: async (userData: RegisterApiData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.register(userData);
          
          // Registration successful - user needs to verify email
          set({ 
            isLoading: false,
            error: null,
            user: null,
            isAuthenticated: false
          });
          
          return response;
        } catch (error: any) {
          console.error('Registration error:', error);
          set({ 
            error: error.message || 'Registration failed. Please try again.',
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      logout: (redirectCallback?: () => void) => {
        try {
          // Save current guest university selection to preserve it
          const currentState = get();
          const savedUniversityId = currentState.guestUniversityId;
          const savedUniversityName = currentState.guestUniversityName;
          
          // Call API logout
          apiService.logout();
          
          // Clear authentication state but enter guest mode
          if (savedUniversityId && savedUniversityName) {
            // Restore previous guest university selection
            set({ 
              user: null, 
              isAuthenticated: false, 
              error: null,
              isLoading: false,
              isGuest: true,
              guestUniversityId: savedUniversityId,
              guestUniversityName: savedUniversityName
            });
            console.log('👤 Logout: Re-entered guest mode with saved university:', savedUniversityName);
          } else {
            // No saved university - will show selector
            set({ 
              user: null, 
              isAuthenticated: false, 
              error: null,
              isLoading: false,
              isGuest: false,
              guestUniversityId: null,
              guestUniversityName: null
            });
            console.log('👤 Logout: No guest university - will show selector');
          }
          
          // Execute callback if provided
          if (redirectCallback) {
            redirectCallback();
          }
        } catch (error) {
          console.error('Logout error:', error);
          // Still clear state even if API call fails
          const currentState = get();
          const savedUniversityId = currentState.guestUniversityId;
          const savedUniversityName = currentState.guestUniversityName;
          
          if (savedUniversityId && savedUniversityName) {
            set({ 
              user: null, 
              isAuthenticated: false, 
              error: null,
              isLoading: false,
              isGuest: true,
              guestUniversityId: savedUniversityId,
              guestUniversityName: savedUniversityName
            });
          } else {
            set({ 
              user: null, 
              isAuthenticated: false, 
              error: null,
              isLoading: false,
              isGuest: false,
              guestUniversityId: null,
              guestUniversityName: null
            });
          }
          
          if (redirectCallback) {
            redirectCallback();
          }
        }
      },

      checkAuth: async () => {
        // Skip auth check during SSR/build
        if (typeof window === 'undefined') {
          return;
        }

        set({ isLoading: true });
        
        try {
          const user = await apiService.checkAuth();
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          console.error('Auth check error:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false,
            error: null // Don't show auth check errors to user
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
          console.error('Update user error:', error);
          set({ 
            error: error.message || 'Failed to update profile. Please try again.',
            isLoading: false
          });
          throw error;
        }
      },

      updateProfilePicture: async (profilePictureUrl: string) => {
        const currentUser = get().user;
        if (!currentUser) return;

        set({ isLoading: true, error: null });
        
        try {
          const updatedUser = await apiService.updateProfile({ 
            profilePicture: profilePictureUrl 
          });
          set({ 
            user: updatedUser, 
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          console.error('Update profile picture error:', error);
          set({ 
            error: error.message || 'Failed to update profile picture. Please try again.',
            isLoading: false
          });
          throw error;
        }
      },

      verifyEmail: async (verificationCode: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user } = await apiService.verifyEmail(verificationCode);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          console.error('Email verification error:', error);
          set({ 
            error: error.message || 'Email verification failed. Please try again.',
            isLoading: false,
            isAuthenticated: false,
            user: null
          });
          throw error;
        }
      },

      resendVerificationCode: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiService.resendVerificationCode(email);
          set({ 
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          console.error('Resend verification error:', error);
          set({ 
            error: error.message || 'Failed to resend verification code. Please try again.',
            isLoading: false
          });
          throw error;
        }
      },

      attemptTokenRefresh: async (): Promise<boolean> => {
        try {
          const user = await apiService.checkAuth();
          set({ 
            user, 
            isAuthenticated: true, 
            error: null
          });
          return true;
        } catch (error) {
          console.error('Token refresh failed:', error);
          set({ 
            user: null, 
            isAuthenticated: false, 
            error: null
          });
          return false;
        }
      },

      debugUserData: () => {
        const state = get();
        console.log('🔍 Auth Store Debug:', {
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          isLoading: state.isLoading,
          error: state.error
        });
      },

      forceLogout: () => {
        console.log('🚪 Force logout triggered');
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null,
          isLoading: false
        });
      },

      // Guest Mode Actions
      enterGuestMode: (universityId: number, universityName: string) => {
        console.log(`👤 Entering guest mode for ${universityName}`);
        set({
          isGuest: true,
          guestUniversityId: universityId,
          guestUniversityName: universityName,
          isAuthenticated: false,
          user: null
        });
      },

      exitGuestMode: () => {
        console.log('👤 Exiting guest mode');
        set({
          isGuest: false,
          guestUniversityId: null,
          guestUniversityName: null
        });
      }
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: (key: string) => {
          if (typeof window === 'undefined') return null;
          const value = localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: (key: string, value: unknown) => {
          if (typeof window === 'undefined') return;
          localStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key: string) => {
          if (typeof window === 'undefined') return;
          localStorage.removeItem(key);
        },
      },
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        isGuest: state.isGuest,
        guestUniversityId: state.guestUniversityId,
        guestUniversityName: state.guestUniversityName
      }),
    }
  )
); 