// Core data types for CampusKinect
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  year?: number;
  major?: string;
  hometown?: string;
  universityId: string;
  profileImage?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface University {
  id: string;
  name: string;
  domain: string;
  country: string;
  marketSize: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  postType: 'goods' | 'services' | 'events' | 'housing' | 'tutoring' | 'offer' | 'request' | 'event';
  duration: string;
  location?: string;
  tags: string[];
  images?: string[];
  userId: string;
  universityId: string;
  grade: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  university?: University;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  isRead: boolean;
  createdAt: string;
  sender?: User;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessageAt: string;
  createdAt: string;
  participants?: User[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface CreatePostForm {
  title: string;
  description: string;
  postType: 'goods' | 'services' | 'events' | 'housing';
  duration: string;
  location?: string;
  tags: string[];
  images?: File[];
}

export interface LoginForm {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterForm {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  year?: number;
  major?: string;
  hometown?: string;
}

export interface RegisterApiData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  year?: number;
  major?: string;
  hometown?: string;
}

// UI state types
export interface UIState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export interface ModalState {
  isOpen: boolean;
  type: 'createPost' | 'editPost' | 'deletePost' | 'imageUpload' | null;
  data?: any;
}

export type MainTab = 'home' | 'createPost' | 'messages' | 'profile';

export interface HomeTab {
  activeFilter: 'all' | 'goods' | 'services' | 'events' | 'housing' | 'tutoring';
  searchQuery: string;
  selectedTags: string[];
  showLeftPanel: boolean;
  showRightPanel: boolean;
}

export interface PostFilters {
  postType?: string;
  tags?: string[];
  location?: string;
  duration?: string;
  grade?: number;
}

export interface Theme {
  mode: 'light' | 'dark' | 'system';
  primaryColor: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
} 