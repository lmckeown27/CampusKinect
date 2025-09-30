import { io, Socket } from 'socket.io-client';
import { Message, Conversation } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private messageCallbacks: Map<string, (message: Message) => void> = new Map();
  private conversationCallbacks: Set<() => void> = new Set();

  public initialize(userId: string, token: string): void {
    if (typeof window === 'undefined') {
      console.log('🔌 Skipping socket initialization during SSR');
      return;
    }

    if (this.socket?.connected) {
      console.log('🔌 Socket already connected');
      return;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const socketUrl = isProduction 
      ? 'https://api.campuskinect.net'
      : 'http://localhost:3001';

    console.log('🔌 Initializing Socket.io connection to:', socketUrl);

    this.socket = io(socketUrl, {
      auth: {
        token: token,
        userId: userId
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('🔌 Socket.io connected:', this.socket?.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Socket.io disconnected:', reason);
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('🔌 Socket.io connection error:', error.message);
    });

    this.socket.on('new-message', (message: Message) => {
      console.log('📨 New message received via Socket.io:', message);
      
      // Notify all message callbacks for this conversation
      const callback = this.messageCallbacks.get(message.conversationId);
      if (callback) {
        callback(message);
      }
    });

    this.socket.on('conversation-updated', () => {
      console.log('🔄 Conversation updated via Socket.io');
      
      // Notify all conversation callbacks
      this.conversationCallbacks.forEach(callback => callback());
    });
  }

  public subscribeToMessages(conversationId: string, callback: (message: Message) => void): void {
    if (typeof window === 'undefined') return;
    
    console.log('📨 Subscribing to messages for conversation:', conversationId);
    this.messageCallbacks.set(conversationId, callback);
    
    if (this.socket?.connected) {
      this.socket.emit('join-conversation', conversationId);
    }
  }

  public unsubscribeFromMessages(conversationId: string): void {
    if (typeof window === 'undefined') return;
    
    console.log('📨 Unsubscribing from messages for conversation:', conversationId);
    this.messageCallbacks.delete(conversationId);
    
    if (this.socket?.connected) {
      this.socket.emit('leave-conversation', conversationId);
    }
  }

  public subscribeToConversations(callback: () => void): void {
    if (typeof window === 'undefined') return;
    
    console.log('🔄 Subscribing to conversation updates');
    this.conversationCallbacks.add(callback);
  }

  public unsubscribeFromConversations(callback?: () => void): void {
    if (typeof window === 'undefined') return;
    
    if (callback) {
      console.log('🔄 Unsubscribing specific conversation callback');
      this.conversationCallbacks.delete(callback);
    } else {
      console.log('🔄 Unsubscribing all conversation callbacks');
      this.conversationCallbacks.clear();
    }
  }

  public disconnect(): void {
    if (this.socket) {
      console.log('🔌 Disconnecting Socket.io');
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Clear all callbacks
    this.messageCallbacks.clear();
    this.conversationCallbacks.clear();
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

const socketService = new SocketService();
export default socketService; 