// CampusConnect Web Frontend Types

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  profilePicture?: string;
  year?: number;
  major?: string;
  hometown?: string;
  universityId: number;
  universityName: string;
  universityDomain: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// University Types
export interface University {
  id: number;
  name: string;
  domain: string;
  city?: string;
  state?: string;
  country: string;
  isActive: boolean;
}

// Post Types
export interface Post {
  id: number;
  userId: number;
  universityId: number;
  title: string;
  description: string;
  postType: 'offer' | 'request' | 'event';
  durationType: 'one-time' | 'recurring' | 'event';
  expiresAt?: string;
  eventStart?: string;
  eventEnd?: string;
  isFulfilled: boolean;
  isActive: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  images: string[];
  user: User;
  university: University;
  engagementScore: number;
  finalScore: number;
  relativeGrade: 'A' | 'B' | 'C' | 'D';
}

// Tag Types
export interface Tag {
  id: number;
  name: string;
  category: string;
  isActive: boolean;
}

// Message Types
export interface Message {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  messageType: 'text' | 'image' | 'contact' | 'location' | 'file';
  mediaUrl?: string;
  isRead: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  sender: User;
}

// Conversation Types
export interface Conversation {
  id: number;
  user1Id: number;
  user2Id: number;
  postId?: number;
  isActive: boolean;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  otherUser: User;
  lastMessage?: Message;
  unreadCount: number;
}

// Message Request Types
export interface MessageRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  postId?: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ignored';
  createdAt: string;
  updatedAt: string;
  fromUser: User;
  toUser: User;
  post?: Post;
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  year?: number;
  major?: string;
  hometown?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
    hasMore: boolean;
  };
}

// Form Types
export interface CreatePostForm {
  title: string;
  description: string;
  postType: 'offer' | 'request' | 'event';
  durationType: 'one-time' | 'recurring' | 'event';
  duration?: number; // days
  tags: string[];
  images: File[];
  eventStart?: string;
  eventEnd?: string;
}

// UI State Types
export interface UIState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export interface ModalState {
  isOpen: boolean;
  type: 'create-post' | 'edit-post' | 'delete-post' | 'message-request' | null;
  data?: any;
}

// Navigation Types
export type MainTab = 'home' | 'create-post' | 'messages' | 'profile';
export type HomeTab = 'goods-services' | 'all' | 'events';

// Filter Types
export interface PostFilters {
  mainTab: HomeTab;
  subTab: string;
  tags: string[];
  search: string;
  sortBy: 'relevance' | 'newest' | 'oldest' | 'score';
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  duration?: number;
  isVisible: boolean;
} 