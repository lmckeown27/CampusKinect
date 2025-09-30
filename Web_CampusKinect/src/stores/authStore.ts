import { create } from 'zustand';
import { User, LoginForm, RegisterApiData } from '../types';
import apiService from '../services/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
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
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()((set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

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
          let errorMessage = 'Login failed';
          
          // Handle banned user error (comes from apiService with BANNED: prefix)
          if (error.message && error.message.startsWith('BANNED:')) {
            // Re-throw banned error so LoginForm can handle the popup
            throw error;
          }
          
          // Handle specific error scenarios
          if (error.response?.status === 400) {
            // Handle validation errors (including unsupported university)
            const errorData = error.response?.data?.error;
            if (errorData?.details && Array.isArray(errorData.details)) {
              // Extract validation error messages
              const validationMessages = errorData.details.map((detail: any) => detail.msg || detail.message).filter(Boolean);
              if (validationMessages.length > 0) {
                errorMessage = validationMessages[0]; // Show first validation error
              }
            } else if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
            }
          } else if (error.response?.status === 401) {
            if (error.response?.data?.message?.toLowerCase().includes('not found') ||
                error.response?.data?.message?.toLowerCase().includes('does not exist')) {
              errorMessage = 'Account not found. This username or email is not registered in our database.';
            } else if (error.response?.data?.message?.toLowerCase().includes('invalid credentials')) {
              errorMessage = 'Invalid username/email or password. Please check your credentials.';
            } else {
              errorMessage = 'Invalid username/email or password. Please check your credentials.';
            }
          } else if (error.response?.status === 403) {
            if (error.response?.data?.message?.toLowerCase().includes('not verified')) {
              errorMessage = 'Email not verified. Please check your email for a verification code.';
            } else {
              errorMessage = 'Account access denied. Please contact support.';
            }
          } else if (error.response?.status === 422) {
            errorMessage = 'Please check your username or email format and try again.';
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

      register: async (userData: RegisterApiData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await apiService.register(userData);
          
          // Handle new registration flow (no user/tokens until verification)
          if (response.data && response.data.registrationId) {
            // New flow: registration pending verification
            set({ 
              user: null, 
              isAuthenticated: false,
              isLoading: false,
              error: null 
            });
          } else if (response.data && response.data.user) {
            // Legacy flow: user created immediately (auto-verify)
            const { user } = response.data;
            set({ 
              user, 
              isAuthenticated: false, // Keep false until email verified
              isLoading: false,
              error: null 
            });
            console.log('User created and auto-verified');
          } else {
            throw new Error('Unexpected response format from registration');
          }
        } catch (error: any) {
          console.error('Registration error:', error);
          
          let errorMessage = 'Registration failed';
          
          // Handle specific error scenarios
          if (error.response?.status === 400) {
            // Handle validation errors (including unsupported university)
            const errorData = error.response?.data?.error;
            if (errorData?.details && Array.isArray(errorData.details)) {
              // Extract validation error messages
              const validationMessages = errorData.details.map((detail: any) => detail.msg || detail.message).filter(Boolean);
              if (validationMessages.length > 0) {
                errorMessage = validationMessages[0]; // Show first validation error
              }
            } else if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
            }
          } else if (error.response?.status === 409) {
            const message = error.response?.data?.message?.toLowerCase() || '';
            if (message.includes('email') && message.includes('already exists')) {
              errorMessage = 'This email address has already been used to create an account. Please sign in instead.';
            } else if (message.includes('username') && message.includes('already exists')) {
              errorMessage = 'This username has already been taken. Please choose a different username.';
            } else if (message.includes('already exists')) {
              errorMessage = 'This username and/or email has already been used to create an account. Please sign in instead.';
            } else {
              errorMessage = 'This username and/or email has already been used to create an account. Please sign in instead.';
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

      logout: (redirectCallback?: () => void) => {
        apiService.logout();
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
        if (redirectCallback) {
          redirectCallback();
        }
      },

      checkAuth: async () => {
        set({ isLoading: true });
        
        try {
          // Server-side authentication check using HTTP-only cookies
          const response = await fetch('/api/v1/auth/me', {
            method: 'GET',
            credentials: 'include', // Uses HTTP-only cookies
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const { user } = await response.json();
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
          } else {
            // Not authenticated - clear state
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false,
              error: null 
            });
          }
        } catch (error) {
          // If there's an error, clear the auth state
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
          // Merge updated data with existing user data instead of replacing
          set((state) => ({ 
            user: state.user ? { ...state.user, ...updatedUser } : updatedUser,
            isLoading: false,
            error: null 
          }));
        } catch (error: any) {
          set({ 
            error: error.message || 'Profile update failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      updateProfilePicture: async (profilePictureUrl: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const updatedUser = await apiService.updateProfilePicture(profilePictureUrl);
          console.log('🖼️ Auth store profile picture updated for user:', updatedUser.id, 'URL:', profilePictureUrl);
          
          // Update user state with the new profile picture
          set((state) => ({ 
            user: state.user ? { 
              ...state.user, 
              profilePicture: profilePictureUrl,
              profileImage: profilePictureUrl // Ensure consistency
            } : updatedUser,
            isLoading: false,
            error: null 
          }));
        } catch (error: any) {
          console.error('Profile picture update failed in auth store:', error);
          set({ 
            error: error.message || 'Profile picture update failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      verifyEmail: async (verificationCode: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { user, tokens } = await apiService.verifyEmail(verificationCode);
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          let errorMessage = 'Email verification failed';
          
          if (error.response?.status === 400) {
            errorMessage = 'Invalid verification code. Please check and try again.';
          } else if (error.response?.status === 410) {
            errorMessage = 'Verification code has expired. Please request a new one.';
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

      resendVerificationCode: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          await apiService.resendVerificationCode(email);
          set({ 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          let errorMessage = 'Failed to resend verification code';
          
          if (error.response?.status === 404) {
            errorMessage = 'Email not found. Please check your email address.';
          } else if (error.response?.status === 429) {
            errorMessage = 'Too many requests. Please wait before requesting another code.';
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

      attemptTokenRefresh: async (): Promise<boolean> => {
        try {
          const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
          if (!refreshToken) return false;

          const newTokens = await apiService.refreshAccessToken();
          if (newTokens) {
            // Refresh successful - keep current user state
            return true;
          }
          return false;
        } catch (error) {
          return false;
        }
      },

      // DEBUG: Check for user data inconsistencies
      debugUserData: () => {
        if (typeof window === 'undefined') return;
        
        const storeUser = get().user;
        const localStorageUser = localStorage.getItem('user');
        const accessToken = sessionStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        
        console.log('🔍 AUTH DEBUG:');
        console.log('Store User:', storeUser);
        console.log('LocalStorage User:', localStorageUser ? JSON.parse(localStorageUser) : null);
        console.log('Access Token exists:', !!accessToken);
        console.log('Refresh Token exists:', !!refreshToken);
        
        // Check for mismatch
        if (localStorageUser && storeUser) {
          const lsUser = JSON.parse(localStorageUser);
          if (lsUser.username !== storeUser.username) {
            console.error('🚨 USER MISMATCH DETECTED!');
            console.error('LocalStorage username:', lsUser.username);
            console.error('Store username:', storeUser.username);
          }
        }
      },

      // Force clear all auth data (for debugging user mismatch)
      forceLogout: () => {
        if (typeof window === 'undefined') return;
        
        // Clear all storage
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage'); // Zustand persistence
        
        // Clear store state
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null
        });
        
        console.log('🧹 FORCE LOGOUT: All auth data cleared');
      },
    })); 