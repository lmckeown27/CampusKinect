import { io, Socket } from 'socket.io-client';
import { Message, Conversation } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private isInitialized = false;
  private messageCallbacks: Map<string, Set<(message: Message) => void>> = new Map();
  private conversationCallbacks: Set<(data: any) => void> = new Set();

  initialize(userId: string, baseURL?: string) {
    if (this.isInitialized && this.socket?.connected) {
      console.log('🔌 Socket already initialized and connected');
      return;
    }

    // Use environment-specific URL
    const socketURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'https://campuskinect.net';
    
    console.log('🔌 Initializing socket connection to:', socketURL);

    this.socket = io(socketURL, {
      path: '/socket.io/',
      transports: ['polling', 'websocket'],  // Try polling first, then upgrade to websocket
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
    });

    this.setupEventListeners(userId);
    this.isInitialized = true;
  }

  private setupEventListeners(userId: string) {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      
      // Join personal room for direct messages
      this.socket?.emit('join-personal', userId);
      console.log(`📬 Joined personal room: user-${userId}`);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
    });

    // Listen for new messages
    this.socket.on('new-message', (data: { conversationId: string; message: Message }) => {
      console.log('📨 New message received:', data);
      
      // Notify specific conversation listeners
      const conversationCallbacks = this.messageCallbacks.get(data.conversationId);
      if (conversationCallbacks) {
        conversationCallbacks.forEach(callback => callback(data.message));
      }
      
      // Notify conversation list listeners
      this.conversationCallbacks.forEach(callback => callback(data));
    });

    // Listen for conversation updates
    this.socket.on('conversation-updated', (data: any) => {
      console.log('🔄 Conversation updated:', data);
      this.conversationCallbacks.forEach(callback => callback(data));
    });
  }

  // Subscribe to messages for a specific conversation
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    if (!this.messageCallbacks.has(conversationId)) {
      this.messageCallbacks.set(conversationId, new Set());
    }
    this.messageCallbacks.get(conversationId)?.add(callback);
    
    console.log(`📬 Subscribed to messages for conversation: ${conversationId}`);
  }

  // Unsubscribe from messages for a specific conversation
  unsubscribeFromMessages(conversationId: string, callback?: (message: Message) => void) {
    if (callback) {
      this.messageCallbacks.get(conversationId)?.delete(callback);
    } else {
      this.messageCallbacks.delete(conversationId);
    }
    
    console.log(`📭 Unsubscribed from messages for conversation: ${conversationId}`);
  }

  // Subscribe to conversation list updates
  subscribeToConversations(callback: (data: any) => void) {
    this.conversationCallbacks.add(callback);
    console.log('📬 Subscribed to conversation updates');
  }

  // Unsubscribe from conversation list updates
  unsubscribeFromConversations(callback: (data: any) => void) {
    this.conversationCallbacks.delete(callback);
    console.log('📭 Unsubscribed from conversation updates');
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isInitialized = false;
      this.messageCallbacks.clear();
      this.conversationCallbacks.clear();
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService; 