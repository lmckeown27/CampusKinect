import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  ApiResponse, 
  PaginatedResponse, 
  User, 
  Post, 
  Conversation, 
  Message, 
  MessageRequest,
  LoginCredentials,
  RegisterData,
  CreatePostForm
} from '@/types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api/v1';
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
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, try to refresh
          const refreshed = await this.refreshToken();
          if (refreshed) {
            // Retry the original request
            const token = this.getAuthToken();
            error.config.headers.Authorization = `Bearer ${token}`;
            return this.api.request(error.config);
          } else {
            // Refresh failed, redirect to login
            this.logout();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth token management
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('campusconnect_token');
  }

  private setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('campusconnect_token', token);
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('campusconnect_refresh_token');
  }

  private setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('campusconnect_refresh_token', token);
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return false;

      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
      this.setAuthToken(accessToken);
      this.setRefreshToken(newRefreshToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  private logout(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('campusconnect_token');
    localStorage.removeItem('campusconnect_refresh_token');
    window.location.href = '/auth/login';
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {
    const response = await this.api.post('/auth/login', credentials);
    const { accessToken, refreshToken } = response.data.data.tokens;
    this.setAuthToken(accessToken);
    this.setRefreshToken(refreshToken);
    return response.data;
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; tokens: { accessToken: string; refreshToken: string } }>> {
    const response = await this.api.post('/auth/register', data);
    const { accessToken, refreshToken } = response.data.data.tokens;
    this.setAuthToken(accessToken);
    this.setRefreshToken(refreshToken);
    return response.data;
  }

  async logoutUser(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } finally {
      this.logout();
    }
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  // Posts endpoints
  async getPosts(filters: {
    mainTab?: string;
    subTab?: string;
    tags?: string[];
    search?: string;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<PaginatedResponse<Post>>> {
    const response = await this.api.get('/posts', { params: filters });
    return response.data;
  }

  async getPost(postId: number): Promise<ApiResponse<Post>> {
    const response = await this.api.get(`/posts/${postId}`);
    return response.data;
  }

  async createPost(data: CreatePostForm): Promise<ApiResponse<Post>> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('postType', data.postType);
    formData.append('durationType', data.durationType);
    
    if (data.duration) formData.append('duration', data.duration.toString());
    if (data.eventStart) formData.append('eventStart', data.eventStart);
    if (data.eventEnd) formData.append('eventEnd', data.eventEnd);
    
    data.tags.forEach(tag => formData.append('tags[]', tag));
    data.images.forEach(image => formData.append('images', image));

    const response = await this.api.post('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  async updatePost(postId: number, data: Partial<CreatePostForm>): Promise<ApiResponse<Post>> {
    const response = await this.api.put(`/posts/${postId}`, data);
    return response.data;
  }

  async deletePost(postId: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/posts/${postId}`);
    return response.data;
  }

  async bookmarkPost(postId: number): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/posts/${postId}/bookmark`);
    return response.data;
  }

  async unbookmarkPost(postId: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/posts/${postId}/bookmark`);
    return response.data;
  }

  // Messages endpoints
  async getConversations(): Promise<ApiResponse<Conversation[]>> {
    const response = await this.api.get('/messages/conversations');
    return response.data;
  }

  async getMessages(conversationId: number): Promise<ApiResponse<Message[]>> {
    const response = await this.api.get(`/messages/conversations/${conversationId}/messages`);
    return response.data;
  }

  async sendMessage(conversationId: number, content: string, type: string = 'text'): Promise<ApiResponse<Message>> {
    const response = await this.api.post(`/messages/conversations/${conversationId}/messages`, {
      content,
      messageType: type,
    });
    return response.data;
  }

  async getMessageRequests(): Promise<ApiResponse<MessageRequest[]>> {
    const response = await this.api.get('/messages/requests');
    return response.data;
  }

  async sendMessageRequest(data: {
    toUserId: number;
    postId?: number;
    message: string;
  }): Promise<ApiResponse<MessageRequest>> {
    const response = await this.api.post('/messages/requests', data);
    return response.data;
  }

  async respondToMessageRequest(requestId: number, action: 'accept' | 'reject'): Promise<ApiResponse<void>> {
    const response = await this.api.put(`/messages/requests/${requestId}`, { action });
    return response.data;
  }

  // User endpoints
  async getUserProfile(userId: number): Promise<ApiResponse<User>> {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.api.put('/users/profile', data);
    return response.data;
  }

  async getUserPosts(userId: number, filters?: {
    limit?: number;
    offset?: number;
    postType?: string;
  }): Promise<ApiResponse<PaginatedResponse<Post>>> {
    const response = await this.api.get(`/users/${userId}/posts`, { params: filters });
    return response.data;
  }

  async getUserBookmarks(userId: number): Promise<ApiResponse<Post[]>> {
    const response = await this.api.get(`/users/${userId}/bookmarks`);
    return response.data;
  }

  // Search endpoints
  async searchPosts(query: string, filters?: {
    tags?: string[];
    postType?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<PaginatedResponse<Post>>> {
    const response = await this.api.get('/search/posts', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  }

  async searchUsers(query: string, filters?: {
    universityId?: number;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    const response = await this.api.get('/search/users', { 
      params: { q: query, ...filters } 
    });
    return response.data;
  }

  // Utility methods
  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 