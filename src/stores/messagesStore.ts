import { create } from 'zustand';
import { Conversation, Message, MessageRequest } from '@/types';
import apiService from '@/services/api';

interface MessagesState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  messageRequests: MessageRequest[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

interface MessagesActions {
  // Conversations
  fetchConversations: () => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  
  // Messages
  fetchMessages: (conversationId: number) => Promise<void>;
  sendMessage: (conversationId: number, content: string, type?: string) => Promise<void>;
  markMessageAsRead: (messageId: number) => void;
  
  // Message Requests
  fetchMessageRequests: () => Promise<void>;
  sendMessageRequest: (data: {
    toUserId: number;
    postId?: number;
    message: string;
  }) => Promise<void>;
  respondToMessageRequest: (requestId: number, action: 'accept' | 'reject') => Promise<void>;
  
  // Local state management
  addMessage: (message: Message) => void;
  updateMessage: (messageId: number, updates: Partial<Message>) => void;
  removeMessage: (messageId: number) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: number, updates: Partial<Conversation>) => void;
  removeConversation: (conversationId: number) => void;
  clearMessages: () => void;
  clearError: () => void;
  updateUnreadCount: () => void;
}

type MessagesStore = MessagesState & MessagesActions;

export const useMessagesStore = create<MessagesStore>((set, get) => ({
  // Initial state
  conversations: [],
  currentConversation: null,
  messages: [],
  messageRequests: [],
  isLoading: false,
  error: null,
  unreadCount: 0,

  // Actions
  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.getConversations();
      
      if (response.success && response.data) {
        const conversations = response.data;
        const unreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);
        
        set({
          conversations,
          isLoading: false,
          unreadCount,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Failed to fetch conversations',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch conversations',
      });
    }
  },

  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation });
    
    if (conversation) {
      get().fetchMessages(conversation.id);
    } else {
      set({ messages: [] });
    }
  },

  fetchMessages: async (conversationId: number) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.getMessages(conversationId);
      
      if (response.success && response.data) {
        set({
          messages: response.data,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Failed to fetch messages',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch messages',
      });
    }
  },

  sendMessage: async (conversationId: number, content: string, type: string = 'text') => {
    try {
      const response = await apiService.sendMessage(conversationId, content, type);
      
      if (response.success && response.data) {
        const newMessage = response.data;
        get().addMessage(newMessage);
        
        // Update conversation's last message
        get().updateConversation(conversationId, {
          lastMessage: newMessage,
          lastMessageAt: newMessage.createdAt,
        });
      } else {
        set({ error: response.message || 'Failed to send message' });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to send message' });
    }
  },

  markMessageAsRead: (messageId: number) => {
    const messages = get().messages.map(message => 
      message.id === messageId ? { ...message, isRead: true } : message
    );
    
    set({ messages });
    get().updateUnreadCount();
  },

  fetchMessageRequests: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.getMessageRequests();
      
      if (response.success && response.data) {
        set({
          messageRequests: response.data,
          isLoading: false,
        });
      } else {
        set({
          isLoading: false,
          error: response.message || 'Failed to fetch message requests',
        });
      }
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Failed to fetch message requests',
      });
    }
  },

  sendMessageRequest: async (data: {
    toUserId: number;
    postId?: number;
    message: string;
  }) => {
    try {
      const response = await apiService.sendMessageRequest(data);
      
      if (response.success && response.data) {
        const newRequest = response.data;
        set({
          messageRequests: [newRequest, ...get().messageRequests],
        });
      } else {
        set({ error: response.message || 'Failed to send message request' });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to send message request' });
    }
  },

  respondToMessageRequest: async (requestId: number, action: 'accept' | 'reject') => {
    try {
      await apiService.respondToMessageRequest(requestId, action);
      
      // Remove from message requests
      const messageRequests = get().messageRequests.filter(req => req.id !== requestId);
      set({ messageRequests });
      
      // If accepted, create a new conversation
      if (action === 'accept') {
        // The backend will create the conversation, so we'll refresh
        get().fetchConversations();
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to respond to message request' });
    }
  },

  addMessage: (message: Message) => {
    const messages = [...get().messages, message];
    set({ messages });
  },

  updateMessage: (messageId: number, updates: Partial<Message>) => {
    const messages = get().messages.map(message => 
      message.id === messageId ? { ...message, ...updates } : message
    );
    
    set({ messages });
  },

  removeMessage: (messageId: number) => {
    const messages = get().messages.filter(message => message.id !== messageId);
    set({ messages });
  },

  addConversation: (conversation: Conversation) => {
    const conversations = [conversation, ...get().conversations];
    set({ conversations });
    get().updateUnreadCount();
  },

  updateConversation: (conversationId: number, updates: Partial<Conversation>) => {
    const conversations = get().conversations.map(conv => 
      conv.id === conversationId ? { ...conv, ...updates } : conv
    );
    
    set({ conversations });
    get().updateUnreadCount();
  },

  removeConversation: (conversationId: number) => {
    const conversations = get().conversations.filter(conv => conv.id !== conversationId);
    set({ conversations });
    get().updateUnreadCount();
  },

  clearMessages: () => {
    set({ 
      conversations: [], 
      currentConversation: null, 
      messages: [], 
      messageRequests: [],
      unreadCount: 0,
    });
  },

  clearError: () => {
    set({ error: null });
  },

  updateUnreadCount: () => {
    const conversations = get().conversations;
    const unreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);
    set({ unreadCount });
  },
})); 