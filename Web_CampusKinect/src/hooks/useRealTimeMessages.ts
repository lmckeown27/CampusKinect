import { useEffect, useCallback, useRef, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useMessagesStore } from '../stores/messagesStore';
import socketService from '../services/socketService';
import { Message } from '../types';

export const useRealTimeMessages = (conversationId: string | null) => {
  const { user } = useAuthStore();
  const { fetchConversations } = useMessagesStore();
  const isInitializedRef = useRef(false);
  const [newMessageReceived, setNewMessageReceived] = useState<Message | null>(null);

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
    // Emit the new message to parent component via state
    setNewMessageReceived(message);
    // Also refresh conversation list to update last message
    fetchConversations();
  }, [fetchConversations]);

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
    newMessageReceived,
    clearNewMessage: () => setNewMessageReceived(null)
  };
};

export default useRealTimeMessages; 