// Core data types for CampusKinect
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  year?: number;
  major?: string;
  hometown?: string;
  universityId: string;
  profileImage?: string;
  profilePicture?: string;
  bio?: string;
  isVerified?: boolean;
  university?: University;
  stats?: {
    postCount: number;
    fulfilledPosts: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface University {
  id: string;
  name: string;
  domain: string;
  country: string;
  city?: string;
  state?: string;
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
  poster?: User;
  university?: University;
  // Content safety fields
  isFlagged?: boolean;
  flagReason?: string;
  flaggedAt?: string;
  contentSafetyScore?: number;
}

// Content Moderation Types
export interface ContentReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  contentId: string;
  contentType: 'post' | 'message' | 'user';
  reason: 'harassment' | 'hate_speech' | 'spam' | 'inappropriate_content' | 'scam' | 'violence' | 'sexual_content' | 'false_information' | 'other';
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  moderatorId?: string;
  moderatorNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface CreateReportForm {
  contentId: string;
  contentType: 'post' | 'message' | 'user';
  reason: 'harassment' | 'hate_speech' | 'spam' | 'inappropriate_content' | 'scam' | 'violence' | 'sexual_content' | 'false_information' | 'other';
  details?: string;
}

export interface UserBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

export interface BlockedUser {
  id: string;
  username: string;
  displayName: string;
  profilePicture?: string;
  blockedAt: string;
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

// POST-CENTRIC Conversation Interface (Updated to match iOS)
export interface Conversation {
  id: string;
  createdAt: string;
  lastMessageAt?: string;
  
  // POST CONTEXT (PRIMARY EMPHASIS) - Flattened fields
  postId: string;
  postTitle: string;
  postType: string;
  
  // OTHER USER INFO (SECONDARY) - Simplified
  otherUser: ConversationListUser;
  
  // MESSAGE INFO
  lastMessage?: string;
  lastMessageSenderId?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

// Simplified user for conversation lists (matches iOS ConversationListUser)
export interface ConversationListUser {
  id: string;
  university: string;
  displayName: string; // Computed property fallback
}

// POST-CENTRIC Supporting Interfaces
export interface ConversationPost {
  id: string;
  title: string;
  description: string;
  type: string;
  location?: string;
  expiresAt?: string;
  isFulfilled: boolean;
  createdAt: string;
  author: ConversationUser;
}

export interface ConversationUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName: string;
  profilePicture?: string;
}

export interface MessageRequest {
  id: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ignored';
  createdAt: string;
  fromUser: User;
  toUser?: User;
  post?: {
    id: string;
    title: string;
    postType: string;
  };
}

// POST-CENTRIC Start Conversation Request
export interface StartConversationRequest {
  otherUserId: string;
  postId: string; // Now required!
  initialMessage?: string;
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
  postTypes?: string[]; // For multiple category selection
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