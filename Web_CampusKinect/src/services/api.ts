import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  Post, 
  Message, 
  Conversation, 
  CreatePostForm, 
  LoginForm, 
  RegisterApiData,
  ApiResponse,
  PaginatedResponse,
  AuthTokens,
  ContentReport,
  CreateReportForm,
  BlockedUser
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    // Environment-aware configuration
    const isProduction = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
    const defaultURL = isProduction 
      ? 'https://api.campuskinect.net/api/v1' 
      : 'http://localhost:3001/api/v1';
    
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || defaultURL;
    
    // Log configuration in development only
    if (!isProduction && typeof window !== 'undefined') {
      console.log('🔗 API Service initialized:', {
        baseURL: this.baseURL,
        environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development'
      });
    }
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: isProduction ? 30000 : 10000, // Longer timeout for production
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
  }

  public async register(userData: RegisterApiData): Promise<any> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = 
        await this.api.post('/auth/register', userData);
      
      if (response.data.success) {
        // Handle new registration flow (pending verification)
        if (response.data.data && response.data.data.registrationId) {
          return response.data; // Return full response for new flow
        }
        
        // Handle legacy flow (auto-verify with tokens)
        if (response.data.data && response.data.data.user && response.data.data.tokens) {
          this.setTokens(response.data.data.tokens);
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
          }
          return response.data.data;
        }
        
        throw new Error('Unexpected response format from registration');
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error: any) {
      throw error;
    }
  }

  public async checkAuth(): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await this.api.get('/auth/me');
    
    if (response.data.success && response.data.data && response.data.data.user) {
      return response.data.data.user;
    }
    
    throw new Error('Authentication failed');
  }

  // Posts
  public async getPosts(page: number = 1, limit: number = 20, filters?: any): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    // Add other filters
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          if (Array.isArray(filters[key])) {
            // For arrays (like tags), append each item with array notation
            filters[key].forEach((item: string) => {
              params.append(`${key}[]`, item);
            });
          } else {
            params.append(key, filters[key].toString());
          }
        }
      });
    }

    const response: AxiosResponse<ApiResponse<{posts: Post[], pagination: any}>> = 
      await this.api.get(`/posts?${params}`);
    

    
    if (response.data.success && response.data.data) {
      // Transform backend structure to frontend structure
      const transformedPosts = response.data.data.posts.map((post: any) => ({
        ...post,
        user: post.poster, // Map 'poster' to 'user' for frontend compatibility
      }));
      
      return {
        data: transformedPosts,
        pagination: response.data.data.pagination
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch posts');
  }

  public async getPost(id: string): Promise<Post> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/posts/${id}`);
    
    if (response.data.success && response.data.data) {
      // Transform backend structure to frontend structure
      return {
        ...response.data.data,
        user: response.data.data.poster, // Map 'poster' to 'user' for frontend compatibility
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch post');
  }

  public async createPost(postData: CreatePostForm): Promise<Post> {
    // Transform postData to match backend expectations
    const transformedData: any = { ...postData };
    
    // Keep postType as-is since backend expects 'goods', 'services', 'housing', 'events'
    // No transformation needed for postType
    
    // Map duration to durationType (backend expects durationType field)
    let durationType = postData.duration || 'one-time';
    
    // Map frontend duration values to backend expected values
    if (postData.postType === 'events') {
      // For event posts, always use 'event' durationType
      durationType = 'event';
    } else if (durationType === 'ongoing') {
      // Map "Ongoing" to recurring for non-event posts
      durationType = 'recurring';
    }
    
    transformedData.durationType = durationType;
    // Remove the old duration field to avoid confusion
    delete transformedData.duration;
    
    console.log('Sending transformed data:', transformedData);

    try {
      let imageUrls: string[] = [];
      
      // If we have image files, upload them first
      if (postData.images && postData.images.length > 0) {
        const imageFormData = new FormData();
        
        // Add detailed logging for debugging
        console.log('🖼️ Preparing to upload images:', {
          count: postData.images.length,
          files: postData.images.map((file, i) => ({
            index: i,
            name: file.name,
            size: file.size,
            type: file.type,
            isFile: file instanceof File
          }))
        });
        
        postData.images.forEach((file, index) => {
          if (!(file instanceof File)) {
            console.error(`❌ File at index ${index} is not a File object:`, file);
            throw new Error(`Invalid file at position ${index + 1}. Please try uploading again.`);
          }
          imageFormData.append('images', file);
        });

        try {
          console.log('📤 Uploading images to /upload/images endpoint...');
          
          const imageUploadResponse: AxiosResponse<ApiResponse<{ images: { url: string }[] }>> = 
            await this.api.post('/upload/images', imageFormData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
          
          console.log('✅ Image upload response:', imageUploadResponse.data);
          
          if (imageUploadResponse.data.success && imageUploadResponse.data.data?.images) {
            imageUrls = imageUploadResponse.data.data.images.map(img => img.url);
            console.log('🎯 Extracted image URLs:', imageUrls);
          } else {
            throw new Error('Invalid response format from image upload');
          }
        } catch (imageError: any) {
          console.error('❌ Image upload failed:', imageError);
          console.error('📋 Error response:', imageError.response?.data);
          console.error('🔢 Error status:', imageError.response?.status);
          console.error('📝 Error details:', imageError.response?.data?.error);
          throw new Error(`Failed to upload images. ${imageError.response?.data?.error?.message || 'Please try again.'}`);
        }
      }

      // Create post with image URLs
      const postDataWithImages = {
        ...transformedData,
        images: imageUrls, // Use uploaded image URLs instead of File objects
      };

      console.log('📝 Creating post with data:', {
        ...postDataWithImages,
        images: imageUrls.length > 0 ? `${imageUrls.length} image URLs: ${imageUrls.join(', ')}` : 'No images'
      });

      const response: AxiosResponse<ApiResponse<any>> = await this.api.post('/posts', postDataWithImages, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.data.success && response.data.data) {
        // Transform backend structure to frontend structure
        return {
          ...response.data.data,
          user: response.data.data.poster, // Map 'poster' to 'user' for frontend compatibility
        };
      }
      
      throw new Error(response.data.message || 'Failed to create post');
    } catch (axiosError: any) {
      // Handle axios errors with detailed validation information
      if (axiosError.response?.data?.error?.details) {
        const error = new Error(axiosError.response.data.message || 'Validation failed');
        (error as any).details = axiosError.response.data.error.details;
        (error as any).isValidationError = true;
        throw error;
      }
      
      // Re-throw other errors
      throw new Error(axiosError.response?.data?.message || axiosError.message || 'Failed to create post');
    }
  }

  public async updatePost(id: string, postData: Partial<CreatePostForm>): Promise<Post> {
    // Transform postData to match backend expectations (similar to createPost)
    const transformedData: any = { ...postData };
    
    // Map frontend postType categories to backend expectations
    if (postData.postType === 'events') {
      transformedData.postType = 'event';
    }
    // Keep 'goods', 'services', 'housing' as-is since backend expects them
    
    // Map duration to durationType (backend expects durationType field)
    if (postData.duration) {
      let durationType = postData.duration;
      
      // Map frontend duration values to backend expected values
      if (transformedData.postType === 'event') {
        // For event posts, always use 'event' durationType
        durationType = 'event';
      } else if (durationType === 'ongoing') {
        // Map "Ongoing" to recurring for non-event posts
        durationType = 'recurring';
      }
      
      transformedData.durationType = durationType;
      // Remove the old duration field to avoid confusion
      delete transformedData.duration;
    }

    const response: AxiosResponse<ApiResponse<{ post: Post }>> = await this.api.put(`/posts/${id}`, transformedData);
    
    if (response.data.success && response.data.data) {
      return response.data.data.post;
    }
    
    throw new Error(response.data.message || 'Failed to update post');
  }

  public async deletePost(id: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(`/posts/${id}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete post');
    }
  }

  public async getUserPosts(userId: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response: AxiosResponse<ApiResponse<{posts: Post[], pagination: any}>> = 
      await this.api.get(`/users/${userId}/posts?${params}`);
    
    if (response.data.success && response.data.data) {
      // Get current user info from localStorage
      let currentUser = null;
      if (typeof window !== 'undefined') {
        try {
          const userStr = localStorage.getItem('user');
          currentUser = userStr ? JSON.parse(userStr) : null;
        } catch (error) {
          console.warn('Failed to parse user from localStorage:', error);
        }
      }
      
      // Transform backend structure to frontend structure
      const transformedPosts = response.data.data.posts.map((post: any) => ({
        ...post,
        userId: userId,
        createdAt: post.createdAt,
        user: currentUser || {
          id: userId,
          firstName: 'User',
          lastName: '',
          username: `user_${userId}`
        }
      }));
      
      return {
        data: transformedPosts,
        pagination: response.data.data.pagination
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch user posts');
  }

  // Verification
  public async verifyEmail(verificationCode: string): Promise<{ user: User; tokens: AuthTokens }> {
    const response: AxiosResponse<ApiResponse<{ user: User; tokens: AuthTokens }>> = 
      await this.api.post('/auth/verify-code', { code: verificationCode });
    
    if (response.data.success && response.data.data) {
      this.setTokens(response.data.data.tokens);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
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
    // Add cache busting to ensure fresh data
    const cacheBuster = `?_t=${Date.now()}`;
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.get(`/messages/conversations${cacheBuster}`);
    
    if (response.data.success && response.data.data?.conversations) {
            console.log('🔄 Frontend API: Raw backend response:', response.data.data);
      
      // Transform backend format to frontend format
      const transformed = response.data.data.conversations.map((conv: any) => {
        console.log('🔄 Frontend API: Transforming conversation:', conv);
        const frontendConv = {
          id: conv.id.toString(),
          participantIds: [conv.otherUser.id],
          lastMessageAt: conv.lastMessageTime || conv.createdAt,
          createdAt: conv.createdAt,
          participants: [conv.otherUser],
          lastMessage: conv.lastMessage ? {
            id: 'unknown',
            content: typeof conv.lastMessage === 'string' ? conv.lastMessage : conv.lastMessage.content,
            senderId: typeof conv.lastMessage === 'string' ? 'unknown' : conv.lastMessage.senderId?.toString() || 'unknown',
            conversationId: conv.id.toString(),
            isRead: true,
            createdAt: conv.lastMessageTime || conv.createdAt
          } : undefined,
          unreadCount: conv.unreadCount || 0
        };
        console.log('🔄 Frontend API: Transformed to:', frontendConv);
        return frontendConv;
      });
      
      console.log('🔄 Frontend API: Final transformed conversations:', transformed);
      return transformed;
    }
    
    throw new Error(response.data.message || 'Failed to fetch conversations');
  }

  public async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<PaginatedResponse<Message>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.get(`/messages/conversations/${conversationId}/messages?${params}`);
    
    if (response.data.success && response.data.data) {
      // Transform backend message format to frontend format
      const messages = response.data.data.messages?.map((msg: any) => ({
        id: msg.id.toString(),
        content: msg.content,
        senderId: msg.senderId.toString(), // Use direct senderId from backend instead of msg.sender.id
        conversationId: conversationId,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender.id.toString(),
          username: msg.sender.username,
          firstName: msg.sender.firstName,
          lastName: msg.sender.lastName,
          displayName: msg.sender.displayName,
          profilePicture: msg.sender.profilePicture
        }
      })) || [];

      return {
        data: messages,
        pagination: response.data.data.pagination
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch messages');
  }

  public async sendMessage(conversationId: string, content: string): Promise<Message> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post(`/messages/conversations/${conversationId}/messages`, { content });
    
    if (response.data.success && response.data.data?.message) {
      const msg = response.data.data.message;
      
      // Transform backend message format to frontend format (same as getMessages)
      return {
        id: msg.id.toString(),
        content: msg.content,
        senderId: msg.sender.id.toString(), // Add the missing senderId property!
        conversationId: conversationId,
        isRead: msg.isRead,
        createdAt: msg.createdAt,
        sender: {
          id: msg.sender.id.toString(),
          username: msg.sender.username,
          firstName: msg.sender.firstName,
          lastName: msg.sender.lastName,
          displayName: msg.sender.displayName,
          profilePicture: msg.sender.profilePicture,
          email: '', // Not needed for message display
          universityId: '0', // Not needed for message display  
          createdAt: '',
          updatedAt: ''
        }
      };
    }
    
    throw new Error(response.data.message || 'Failed to send message');
  }

  public async createConversation(otherUserId: string, initialMessage: string = ''): Promise<Conversation> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post('/messages/conversations', { 
        otherUserId: parseInt(otherUserId), 
        initialMessage 
      });
    
    if (response.data.success && response.data.data?.conversation) {
      // Convert the backend response to match frontend Conversation type
      const backendConv = response.data.data.conversation;
      return {
        id: backendConv.id.toString(),
        participantIds: [otherUserId], // We know the other participant
        lastMessageAt: backendConv.createdAt,
        createdAt: backendConv.createdAt,
        participants: [backendConv.otherUser],
        unreadCount: 0
      };
    }
    
    throw new Error(response.data.message || 'Failed to create conversation');
  }

  public async deleteConversation(conversationId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.delete(`/messages/conversations/${conversationId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete conversation');
    }
  }

  public async createMessageRequest(toUserId: string, content: string, postId?: string): Promise<any> {
    const requestData: any = { toUserId: parseInt(toUserId), content };
    if (postId) {
      requestData.postId = parseInt(postId);
    }

    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post('/messages/requests', requestData);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to send message request');
  }

  public async getMessageRequests(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.get('/messages/requests');
    
    if (response.data.success && response.data.data) {
      return response.data.data.requests || [];
    }
    
    throw new Error(response.data.message || 'Failed to fetch message requests');
  }

  public async getSentMessageRequests(): Promise<any[]> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.get('/messages/requests/sent');
    
    if (response.data.success && response.data.data) {
      return response.data.data.requests || [];
    }
    
    throw new Error(response.data.message || 'Failed to fetch sent message requests');
  }

  public async respondToMessageRequest(requestId: string, action: 'accepted' | 'rejected' | 'ignored', message?: string): Promise<any> {
    const requestData: any = { action };
    if (message) {
      requestData.message = message;
    }

    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.put(`/messages/requests/${requestId}/respond`, requestData);
    
    if (response.data.success) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to respond to message request');
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
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.data));
      }
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to update profile');
  }

  // Search
  public async searchPosts(query: string, filters?: any): Promise<PaginatedResponse<Post>> {
    const params = new URLSearchParams({
      query: query,
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
    const params = new URLSearchParams({ query: query });
    
    const response: AxiosResponse<ApiResponse<{users: User[], pagination: any, searchQuery: string}>> = 
      await this.api.get(`/search/users?${params}`);
    
    if (response.data.success && response.data.data && response.data.data.users) {
      return response.data.data.users;
    }
    
    throw new Error(response.data.message || 'User search failed');
  }

  public async getUserById(userId: string): Promise<User> {
    const response: AxiosResponse<ApiResponse<User>> = 
      await this.api.get(`/users/${userId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch user');
  }

  // Upload
  public async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response: AxiosResponse<ApiResponse<{ image: { url: string; filename: string; thumbnail: string; thumbnailUrl: string } }>> = 
      await this.api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
    if (response.data.success && response.data.data && response.data.data.image) {
      return { url: response.data.data.image.url };
    }
    
    throw new Error(response.data.message || 'Image upload failed');
  }

  // Update user profile picture
  public async updateProfilePicture(profilePictureUrl: string): Promise<User> {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = 
      await this.api.put('/users/profile-picture', { profilePictureUrl });
    
    if (response.data.success && response.data.data) {
      return response.data.data.user;
    }
    
    throw new Error(response.data.message || 'Failed to update profile picture');
  }

  // Upload images to existing post
  public async uploadPostImages(postId: string, files: File[]): Promise<{ url: string; id: string; filename: string; order: number }[]> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response: AxiosResponse<ApiResponse<{ images: { id: string; filename: string; url: string; order: number }[] }>> = 
      await this.api.post(`/upload/post-images/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    
    if (response.data.success && response.data.data && response.data.data.images) {
      return response.data.data.images;
    }
    
    throw new Error(response.data.message || 'Failed to upload post images');
  }

  // Delete image from post
  public async deletePostImage(filename: string): Promise<void> {
    // filename should be just the filename (e.g., "image.jpg"), not full URL
    const response: AxiosResponse<ApiResponse<void>> = 
      await this.api.delete(`/upload/image/${filename}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete image');
    }
  }

  // Post Interactions - Bookmark and Repost
  public async toggleBookmark(postId: string): Promise<{ action: 'added' | 'removed' }> {
    // First check if user already bookmarked this post
    const interactions = await this.getUserInteractions(postId);
    
    if (interactions.hasBookmarked) {
      // Remove bookmark
      const response: AxiosResponse<ApiResponse<any>> = 
        await this.api.delete(`/posts/${postId}/interact`, {
          data: { interactionType: 'bookmark' }
        });
      
      if (response.data.success) {
        return { action: 'removed' };
      }
      throw new Error(response.data.message || 'Failed to remove bookmark');
    } else {
      // Add bookmark
      const response: AxiosResponse<ApiResponse<any>> = 
        await this.api.post(`/posts/${postId}/interact`, {
          interactionType: 'bookmark'
        });
      
      if (response.data.success) {
        return { action: 'added' };
      }
      throw new Error(response.data.message || 'Failed to add bookmark');
    }
  }

  public async toggleRepost(postId: string): Promise<{ action: 'added' | 'removed' }> {
    // First check if user already reposted this post
    const interactions = await this.getUserInteractions(postId);
    
    if (interactions.hasReposted) {
      // Remove repost
      const response: AxiosResponse<ApiResponse<any>> = 
        await this.api.delete(`/posts/${postId}/interact`, {
          data: { interactionType: 'repost' }
        });
      
      if (response.data.success) {
        return { action: 'removed' };
      }
      throw new Error(response.data.message || 'Failed to remove repost');
    } else {
      // Add repost
      const response: AxiosResponse<ApiResponse<any>> = 
        await this.api.post(`/posts/${postId}/interact`, {
          interactionType: 'repost'
        });
      
      if (response.data.success) {
        return { action: 'added' };
      }
      throw new Error(response.data.message || 'Failed to add repost');
    }
  }

  public async getUserInteractions(postId: string): Promise<{
    hasBookmarked: boolean;
    hasReposted: boolean;
    hasShared: boolean;
    hasMessaged: boolean;
    bookmarkedAt: string | null;
    repostedAt: string | null;
    sharedAt: string | null;
    messagedAt: string | null;
  }> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.get(`/posts/${postId}/user-interactions`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    // Return default values if failed
    return {
      hasBookmarked: false,
      hasReposted: false,
      hasShared: false,
      hasMessaged: false,
      bookmarkedAt: null,
      repostedAt: null,
      sharedAt: null,
      messagedAt: null
    };
  }

  public async getUserBookmarks(page: number = 1, limit: number = 20): Promise<{
    data: Post[];
    pagination: any;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response: AxiosResponse<ApiResponse<Post[]> & { pagination?: any }> = 
      await this.api.get(`/posts/user/bookmarks?${params}`);
    
    if (response.data.success && response.data.data) {
      return {
        data: response.data.data,
        pagination: response.data.pagination || {}
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch bookmarks');
  }

  public async getUserReposts(page: number = 1, limit: number = 20): Promise<{
    data: Post[];
    pagination: any;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response: AxiosResponse<ApiResponse<Post[]> & { pagination?: any }> = 
      await this.api.get(`/posts/user/reposts?${params}`);
    
    if (response.data.success && response.data.data) {
      return {
        data: response.data.data,
        pagination: response.data.pagination || {}
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch reposts');
  }

  // Content Moderation & Safety Methods
  public async reportContent(reportData: CreateReportForm): Promise<ContentReport> {
    const response: AxiosResponse<ApiResponse<{ report: ContentReport }>> = 
      await this.api.post('/reports', {
        contentId: parseInt(reportData.contentId),
        contentType: reportData.contentType,
        reason: reportData.reason,
        details: reportData.details
      });

    if (response.data.success && response.data.data) {
      return response.data.data.report;
    }
    
    throw new Error(response.data.message || 'Failed to submit report');
  }

  public async getUserReports(page: number = 1, limit: number = 20): Promise<PaginatedResponse<ContentReport>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response: AxiosResponse<ApiResponse<{ data: ContentReport[], pagination: any }>> = 
      await this.api.get(`/reports/my-reports?${params}`);
    
    if (response.data.success && response.data.data) {
      return {
        data: response.data.data.data,
        pagination: response.data.data.pagination
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch reports');
  }

  public async blockUser(userId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post('/users/block', {
        userId: parseInt(userId)
      });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to block user');
    }
  }

  public async unblockUser(userId: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post('/users/unblock', {
        userId: parseInt(userId)
      });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to unblock user');
    }
  }

  public async getBlockedUsers(page: number = 1, limit: number = 20): Promise<PaginatedResponse<BlockedUser>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response: AxiosResponse<ApiResponse<{ data: BlockedUser[], pagination: any }>> = 
      await this.api.get(`/users/blocked?${params}`);
    
    if (response.data.success && response.data.data) {
      return {
        data: response.data.data.data,
        pagination: response.data.data.pagination
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch blocked users');
  }

  public async isUserBlocked(userId: string): Promise<boolean> {
    const response: AxiosResponse<ApiResponse<{ isBlocked: boolean }>> = 
      await this.api.get(`/users/is-blocked/${userId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data.isBlocked;
    }
    
    return false;
  }

  // =============================================================================
  // Admin Moderation Methods (Apple Guideline 1.2 Compliance)
  // =============================================================================
  
  public async getPendingReports(page: number = 1, limit: number = 20): Promise<PaginatedResponse<ContentReport>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response: AxiosResponse<ApiResponse<{ data: ContentReport[], pagination: any }>> = 
      await this.api.get(`/admin/reports/pending?${params}`);
    
    if (response.data.success && response.data.data) {
      return {
        data: response.data.data.data,
        pagination: response.data.data.pagination
      };
    }
    
    throw new Error(response.data.message || 'Failed to fetch pending reports');
  }

  public async getModerationStats(): Promise<{
    pendingReports: number;
    resolvedToday: number;
    averageResponseTime: number;
    totalUsers: number;
    bannedUsers: number;
  }> {
    const response: AxiosResponse<ApiResponse<{
      pendingReports: number;
      resolvedToday: number;
      averageResponseTime: number;
      totalUsers: number;
      bannedUsers: number;
    }>> = await this.api.get('/admin/moderation/stats');
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Failed to fetch moderation stats');
  }

  public async moderateReport(reportId: string, action: 'approve' | 'dismiss', moderatorNotes?: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post(`/admin/reports/${reportId}/moderate`, {
        action,
        moderatorNotes
      });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to moderate report');
    }
  }

  public async banUser(userId: string, reason: string): Promise<void> {
    const response: AxiosResponse<ApiResponse<any>> = 
      await this.api.post(`/admin/users/${userId}/ban`, {
        reason
      });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to ban user');
    }
  }
}

export const apiService = new ApiService();
export default apiService; 