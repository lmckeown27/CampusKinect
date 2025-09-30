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

    // Socket.io is on root domain, NOT /api/v1
    // Remove /api/v1 from URL if present
    let socketURL = baseURL || process.env.NEXT_PUBLIC_API_URL || 'https://campuskinect.net';
    socketURL = socketURL.replace(/\/api\/v1\/?$/, ''); // Remove /api/v1 suffix
    
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
      console.log('   Transport:', this.socket?.io.engine.transport.name);
      
      // Join personal room for direct messages
      this.socket?.emit('join-personal', userId);
      console.log(`📬 Emitting join-personal for user: ${userId}`);
    });

    this.socket.on('joined-personal', (data: { userId: string; socketId: string }) => {
      console.log('✅ Confirmed joined personal room:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isInitialized = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
      console.error('   Error type:', error.constructor.name);
      console.error('   Message:', error.message);
    });

    this.socket.on('error', (error) => {
      console.error('🔴 Socket error:', error);
    });

    // Listen for new messages
    this.socket.on('new-message', (data: { conversationId: any; message: Message }) => {
      console.log('📨 New message received:', data);
      
      // Normalize conversationId to string for consistent matching
      const conversationId = String(data.conversationId);
      
      // Notify specific conversation listeners
      const conversationCallbacks = this.messageCallbacks.get(conversationId);
      if (conversationCallbacks) {
        console.log('✅ Found callbacks for conversation:', conversationId, '- notifying listeners');
        conversationCallbacks.forEach(callback => callback(data.message));
      } else {
        console.log('⚠️ No callbacks found for conversation:', conversationId);
        console.log('📋 Active subscriptions:', Array.from(this.messageCallbacks.keys()));
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
    // Normalize to string for consistent matching
    const normalizedId = String(conversationId);
    
    if (!this.messageCallbacks.has(normalizedId)) {
      this.messageCallbacks.set(normalizedId, new Set());
    }
    this.messageCallbacks.get(normalizedId)?.add(callback);
    
    console.log(`📬 Subscribed to messages for conversation: ${normalizedId}`);
  }

  // Unsubscribe from messages for a specific conversation
  unsubscribeFromMessages(conversationId: string, callback?: (message: Message) => void) {
    // Normalize to string for consistent matching
    const normalizedId = String(conversationId);
    
    if (callback) {
      this.messageCallbacks.get(normalizedId)?.delete(callback);
    } else {
      this.messageCallbacks.delete(normalizedId);
    }
    
    console.log(`📭 Unsubscribed from messages for conversation: ${normalizedId}`);
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