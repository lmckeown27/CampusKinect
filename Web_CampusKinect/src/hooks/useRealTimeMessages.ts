import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useMessagesStore } from '../stores/messagesStore';
import socketService from '../services/socketService';
import { Message } from '../types';

export const useRealTimeMessages = (conversationId: string | null) => {
  const { user } = useAuthStore();
  const { messages, fetchConversations, fetchMessages } = useMessagesStore();
  const isInitializedRef = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    if (!user?.id || isInitializedRef.current) return;

    console.log('🔌 Initializing real-time messaging for user:', user.id);
    socketService.initialize(user.id.toString());
    isInitializedRef.current = true;

    return () => {
      socketService.disconnect();
      isInitializedRef.current = false;
    };
  }, [user?.id]);

  // Handle new messages for specific conversation
  const handleNewMessage = useCallback((message: Message) => {
    console.log('📨 Real-time message received:', message);
    // Refresh messages for the current conversation
    if (conversationId) {
      fetchMessages(conversationId);
    }
  }, [conversationId, fetchMessages]);

  // Handle conversation updates
  const handleConversationUpdate = useCallback((data: any) => {
    console.log('🔄 Conversation update received:', data);
    fetchConversations();
  }, [fetchConversations]);

  // Subscribe to messages for current conversation
  useEffect(() => {
    if (!conversationId || !socketService.isConnected()) return;

    console.log('📬 Subscribing to conversation:', conversationId);
    socketService.subscribeToMessages(conversationId, handleNewMessage);

    return () => {
      console.log('📭 Unsubscribing from conversation:', conversationId);
      socketService.unsubscribeFromMessages(conversationId, handleNewMessage);
    };
  }, [conversationId, handleNewMessage]);

  // Subscribe to conversation list updates
  useEffect(() => {
    if (!user?.id || !socketService.isConnected()) return;

    console.log('📬 Subscribing to conversation updates');
    socketService.subscribeToConversations(handleConversationUpdate);

    return () => {
      console.log('📭 Unsubscribing from conversation updates');
      socketService.unsubscribeFromConversations(handleConversationUpdate);
    };
  }, [user?.id, handleConversationUpdate]);

  return {
    isConnected: socketService.isConnected(),
  };
};

export default useRealTimeMessages; 