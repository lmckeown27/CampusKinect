import { create } from 'zustand';
import { Message, Conversation, MessageRequest, StartConversationRequest } from '../types';
import apiService from '../services/api';

interface MessagesState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  messageRequests: MessageRequest[];
  sentMessageRequests: MessageRequest[];
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

interface MessagesActions {
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string, page?: number) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  startConversation: (request: StartConversationRequest) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  createMessageRequest: (toUserId: string, content: string, postId?: string) => Promise<void>;
  fetchMessageRequests: () => Promise<void>;
  fetchSentMessageRequests: () => Promise<void>;
  respondToMessageRequest: (requestId: string, action: 'accepted' | 'rejected' | 'ignored', message?: string) => Promise<void>;
  markAsRead: (conversationId: string, messageIds: string[]) => Promise<void>;
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
  sentMessageRequests: [],
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
      
      set({
        conversations,
        unreadCount: conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0),
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
    try {
      const newMessage = await apiService.sendMessage(conversationId, content);
      
      set((state) => ({
        messages: [...state.messages, newMessage],
        conversations: state.conversations.map(conv => 
          conv.id === conversationId 
            ? { 
                ...conv, 
                lastMessage: newMessage.content, // POST-CENTRIC: lastMessage is now a string
                lastMessageAt: newMessage.createdAt,
                lastMessageSenderId: newMessage.senderId,
                lastMessageTime: newMessage.createdAt
              }
            : conv
        ),
      }));

      // Update current conversation if it's the active one
      const { currentConversation } = get();
      if (currentConversation?.id === conversationId) {
        set({
          currentConversation: {
            ...currentConversation,
            lastMessage: newMessage.content, // POST-CENTRIC: lastMessage is now a string
            lastMessageAt: newMessage.createdAt,
            lastMessageSenderId: newMessage.senderId,
            lastMessageTime: newMessage.createdAt,
          },
        });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to send message' });
      throw error;
    }
  },

  startConversation: async (request: StartConversationRequest) => {
    set({ isLoading: true, error: null });

    try {
      const response = await apiService.startConversation(request);
      
      // POST-CENTRIC: The response structure is different, so we'll refresh conversations
      // instead of trying to manually add the new conversation
      await get().fetchConversations();
      
      set({ isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to start conversation', 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteConversation: async (conversationId: string) => {
    set({ isLoading: true, error: null });

    try {
      await apiService.deleteConversation(conversationId);
      
      set((state) => ({
        conversations: state.conversations.filter(conv => conv.id !== conversationId),
        currentConversation: state.currentConversation?.id === conversationId ? null : state.currentConversation,
        messages: state.currentConversation?.id === conversationId ? [] : state.messages,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete conversation', 
        isLoading: false 
      });
      throw error;
    }
  },

  createMessageRequest: async (toUserId: string, content: string, postId?: string) => {
    set({ isLoading: true, error: null });

    try {
      const messageRequest = await apiService.createMessageRequest(toUserId, content, postId);
      
      set((state) => ({
        sentMessageRequests: [messageRequest.messageRequest, ...state.sentMessageRequests],
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to send message request', 
        isLoading: false 
      });
      throw error;
    }
  },

  fetchMessageRequests: async () => {
    set({ isLoading: true, error: null });

    try {
      const messageRequests = await apiService.getMessageRequests();
      
      set({
        messageRequests,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch message requests', 
        isLoading: false 
      });
    }
  },

  fetchSentMessageRequests: async () => {
    set({ isLoading: true, error: null });

    try {
      const sentMessageRequests = await apiService.getSentMessageRequests();
      
      set({
        sentMessageRequests,
        isLoading: false,
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to fetch sent message requests', 
        isLoading: false 
      });
    }
  },

  respondToMessageRequest: async (requestId: string, action: 'accepted' | 'rejected' | 'ignored', message?: string) => {
    set({ isLoading: true, error: null });

    try {
      await apiService.respondToMessageRequest(requestId, action, message);
      
      // Remove the request from messageRequests if accepted/rejected
      if (action !== 'ignored') {
        set((state) => ({
          messageRequests: state.messageRequests.filter(req => req.id !== requestId),
          isLoading: false,
        }));

        // If accepted, refresh conversations to get the new conversation
        if (action === 'accepted') {
          get().fetchConversations();
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to respond to message request', 
        isLoading: false 
      });
      throw error;
    }
  },

  markAsRead: async (conversationId: string, messageIds: string[]) => {
    try {
      // Implementation for marking messages as read
      // This would require a backend endpoint
      console.log('Mark as read not implemented yet');
    } catch (error: any) {
      set({ error: error.message || 'Failed to mark as read' });
    }
  },

  setCurrentConversation: (conversation: Conversation | null) => {
    set({ currentConversation: conversation, messages: [] });
  },

  clearMessages: () => {
    set({ messages: [], currentConversation: null });
  },

  clearError: () => {
    set({ error: null });
  },

  updateUnreadCount: () => {
    const { conversations } = get();
    const unreadCount = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);
    set({ unreadCount });
  },
})); 