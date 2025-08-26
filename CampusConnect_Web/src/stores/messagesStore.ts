import { create } from 'zustand';
import { Message, Conversation } from '../types';
import apiService from '../services/api';

interface MessagesState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  messageRequests: Conversation[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

interface MessagesActions {
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string, page?: number) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  createConversation: (participantIds: string[]) => Promise<void>;
  markAsRead: (conversationId: string, messageIds: string[]) => Promise<void>;
  respondToRequest: (conversationId: string, accept: boolean) => Promise<void>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  clearMessages: () => void;
  clearError: () => void;
  updateUnreadCount: () => void;
}

type MessagesStore = MessagesState & MessagesActions;

const initialState: MessagesState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  messageRequests: [],
  isLoading: false,
  error: null,
  unreadCount: 0,
};

export const useMessagesStore = create<MessagesStore>((set, get) => ({
  ...initialState,

  fetchConversations: async () => {
    set({ isLoading: true, error: null });

    try {
      const conversations = await apiService.getConversations();
      
      // Separate regular conversations from message requests
      const regularConversations = conversations.filter(conv => conv.participants && conv.participants.length > 0);
      const requests = conversations.filter(conv => !conv.participants || conv.participants.length === 0);

      set({
        conversations: regularConversations,
        messageRequests: requests,
        unreadCount: conversations.reduce((total, conv) => total + conv.unreadCount, 0),
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch conversations', 
        isLoading: false 
      });
    }
  },

  fetchMessages: async (conversationId: string, page = 1) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiService.getMessages(conversationId, page, 50);
      const { data } = response;

      set((state) => ({
        messages: page === 1 ? data : [...state.messages, ...data],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch messages', 
        isLoading: false 
      });
    }
  },

  sendMessage: async (conversationId: string, content: string) => {
    if (!content.trim()) return;

    try {
      const newMessage = await apiService.sendMessage(conversationId, content);
      
      set((state) => ({
        messages: [...state.messages, newMessage],
        conversations: state.conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessage: newMessage, lastMessageAt: newMessage.createdAt }
            : conv
        ),
      }));

      // Update current conversation if it's the active one
      const { currentConversation } = get();
      if (currentConversation?.id === conversationId) {
        set({
          currentConversation: {
            ...currentConversation,
            lastMessage: newMessage,
            lastMessageAt: newMessage.createdAt,
          },
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to send message' });
      throw error;
    }
  },

  createConversation: async (participantIds: string[]) => {
    set({ isLoading: true, error: null });

    try {
      const newConversation = await apiService.createConversation(participantIds);
      
      set((state) => ({
        conversations: [newConversation, ...state.conversations],
        currentConversation: newConversation,
        messages: [],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create conversation', 
        isLoading: false 
      });
      throw error;
    }
  },

  markAsRead: async (conversationId: string, messageIds: string[]) => {
    try {
      // This would typically call an API to mark messages as read
      // For now, just update local state
      set((state) => ({
        messages: state.messages.map(msg => 
          messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
        ),
        conversations: state.conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: Math.max(0, conv.unreadCount - messageIds.length) }
            : conv
        ),
      }));

      // Update unread count
      get().updateUnreadCount();
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark messages as read' });
    }
  },

  respondToRequest: async (conversationId: string, accept: boolean) => {
    try {
      if (accept) {
        // Accept the message request - this would typically call an API
        // For now, just move it to regular conversations
        set((state) => {
          const request = state.messageRequests.find(req => req.id === conversationId);
          if (!request) return state;

          return {
            messageRequests: state.messageRequests.filter(req => req.id !== conversationId),
            conversations: [request, ...state.conversations],
          };
        });
      } else {
        // Reject the message request - this would typically call an API
        // For now, just remove it from requests
        set((state) => ({
          messageRequests: state.messageRequests.filter(req => req.id !== conversationId),
        }));
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to respond to request' });
    }
  },

  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation });
    
    if (conversation) {
      // Fetch messages for the selected conversation
      get().fetchMessages(conversation.id, 1);
    } else {
      // Clear messages when no conversation is selected
      set({ messages: [] });
    }
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  clearError: () => {
    set({ error: null });
  },

  updateUnreadCount: () => {
    const { conversations } = get();
    const totalUnread = conversations.reduce((total, conv) => total + conv.unreadCount, 0);
    set({ unreadCount: totalUnread });
  },
})); 