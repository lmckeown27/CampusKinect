import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private messageCallbacks: Map<string, (message: Message) => void> = new Map();
  private conversationCallbacks: Map<string, () => void> = new Map();

  // Initialize socket connection using server-side authentication
  public async initialize(): Promise<void> {
    // Skip during SSR to prevent build hanging
    if (typeof window === 'undefined') {
      return;
    }

    // Skip if already connected
    if (this.socket?.connected) {
      return;
    }

    try {
      // Get Socket.io token from server using existing HTTP-only cookie authentication
      const response = await fetch('/api/v1/auth/socket-token', {
        method: 'GET',
        credentials: 'include', // Uses HTTP-only cookies from your existing auth
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to get socket token:', response.status);
        return;
      }

      const { token, userId } = await response.json();

      // Initialize Socket.io with server-provided token
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';
      
      this.socket = io(wsUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.setupEventListeners(userId);

    } catch (error) {
      console.error('Socket initialization failed:', error);
      // Fail silently - real-time features will be disabled but app continues to work
    }
  }

  private setupEventListeners(userId: string): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Real-time messaging connected');
      this.isConnected = true;
      
      // Join user's personal room for receiving messages
      this.socket?.emit('join-user-room', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Real-time messaging disconnected');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    // Message events
    this.socket.on('new-message', (message: Message) => {
      // Notify all subscribed components
      this.messageCallbacks.forEach((callback, conversationId) => {
        if (message.conversationId === conversationId) {
          callback(message);
        }
      });
    });

    // Conversation events
    this.socket.on('conversation-updated', () => {
      // Notify conversation list components
      this.conversationCallbacks.forEach((callback) => {
        callback();
      });
    });
  }

  // Subscribe to messages for a specific conversation
  public subscribeToMessages(conversationId: string, callback: (message: Message) => void): void {
    if (typeof window === 'undefined') return;
    
    this.messageCallbacks.set(conversationId, callback);
  }

  // Unsubscribe from messages for a specific conversation
  public unsubscribeFromMessages(conversationId: string): void {
    this.messageCallbacks.delete(conversationId);
  }

  // Subscribe to conversations list updates
  public subscribeToConversations(callback: () => void): void {
    if (typeof window === 'undefined') return;
    
    this.conversationCallbacks.set('conversations', callback);
  }

  // Unsubscribe from conversations list updates
  public unsubscribeFromConversations(): void {
    this.conversationCallbacks.delete('conversations');
  }

  // Disconnect socket
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Get connection status
  public isSocketConnected(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService; 