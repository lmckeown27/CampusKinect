import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Post, 
  Message, 
  Conversation, 
  CreatePostForm, 
  LoginForm, 
  RegisterForm,
  ApiResponse,
  PaginatedResponse,
  AuthTokens 
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newTokens = await this.refreshToken();
            if (newTokens) {
              this.setTokens(newTokens);
              originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Token management
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  private async refreshToken(): Promise<AuthTokens | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return null;

      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken,
      });

      return response.data.data;
    } catch (error) {
      return null;
    }
  }

  public logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  // Authentication
  public async login(credentials: LoginForm): Promise<{ user: User; tokens: AuthTokens }> {
    const response: AxiosResponse<ApiResponse<{ user: User; tokens: AuthTokens }>> = 
      await this.api.post('/auth/login', credentials);
    
    if (response.data.success && response.data.data) {
      this.setTokens(response.data.data.tokens);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
  }

  public async register(userData: RegisterForm): Promise<{ user: User; tokens: AuthTokens }> {
    const response: AxiosResponse<ApiResponse<{ user: User; tokens: AuthTokens }>> = 
      await this.api.post('/auth/register', userData);
    
    if (response.data.success && response.data.data) {
      this.setTokens(response.data.data.tokens);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Registration failed');
  }

  public async checkAuth(): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/auth/me');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error('Authentication failed');
  }

  // Posts
  public async getPosts(page: number = 1, limit: number = 20, filters?: any): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters,
    });

    const response: AxiosResponse<ApiResponse<PaginatedResponse<Post>>> = 
      await this.api.get(`/posts?${params}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch posts');
  }

  public async getPost(id: string): Promise<Post> {
    const response: AxiosResponse<ApiResponse<Post>> = await this.api.get(`/posts/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch post');
  }

  public async createPost(postData: CreatePostForm): Promise<Post> {
    const formData = new FormData();
    
    Object.entries(postData).forEach(([key, value]) => {
      if (key === 'images' && Array.isArray(value)) {
        value.forEach((file, index) => {
          formData.append(`images`, file);
        });
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as string);
      }
    });

    const response: AxiosResponse<ApiResponse<Post>> = await this.api.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to create post');
  }

  public async updatePost(id: string, postData: Partial<CreatePostForm>): Promise<Post> {
    const response: AxiosResponse<ApiResponse<Post>> = await this.api.put(`/posts/${id}`, postData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update post');
  }

  public async deletePost(id: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/posts/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete post');
    }
  }

  // Verification
  public async verifyEmail(verificationCode: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response: AxiosResponse<ApiResponse<{ user: User; tokens: AuthTokens }>> = 
      await this.api.post('/auth/verify-code', { code: verificationCode });
    
    if (response.data.success && response.data.data) {
      this.setTokens(response.data.data.tokens);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Email verification failed');
  }

  public async resendVerificationCode(email: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.post('/auth/resend-code', { email });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to resend verification code');
    }
  }

  // Messages
  public async getConversations(): Promise<Conversation[]> {
    const response: AxiosResponse<ApiResponse<Conversation[]>> = 
      await this.api.get('/messages/conversations');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch conversations');
  }

  public async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<PaginatedResponse<Message>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response: AxiosResponse<ApiResponse<PaginatedResponse<Message>>> = 
      await this.api.get(`/messages/conversations/${conversationId}/messages?${params}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch messages');
  }

  public async sendMessage(conversationId: string, content: string): Promise<Message> {
    const response: AxiosResponse<ApiResponse<Message>> = 
      await this.api.post(`/messages/conversations/${conversationId}/messages`, { content });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to send message');
  }

  public async createConversation(participantIds: string[]): Promise<Conversation> {
    const response: AxiosResponse<ApiResponse<Conversation>> = 
      await this.api.post('/messages/conversations', { participantIds });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to create conversation');
  }

  // Users
  public async getUser(id: string): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.get(`/users/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch user');
  }

  public async updateProfile(userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put('/users/profile', userData);
    
    if (response.data.success && response.data.data) {
      localStorage.setItem('user', JSON.stringify(response.data.data));
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update profile');
  }

  // Search
  public async searchPosts(query: string, filters?: any): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams({
      q: query,
      ...filters,
    });

    const response: AxiosResponse<ApiResponse<PaginatedResponse<Post>>> = 
      await this.api.get(`/search/posts?${params}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Search failed');
  }

  public async searchUsers(query: string): Promise<User[]> {
    const params = new URLSearchParams({ q: query });
    
    const response: AxiosResponse<ApiResponse<User[]>> = 
      await this.api.get(`/search/users?${params}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'User search failed');
  }

  // Upload
  public async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response: AxiosResponse<ApiResponse<{ url: string }>> = 
      await this.api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Image upload failed');
  }
}

export const apiService = new ApiService();
export default apiService; 