import { useEffect, useCallback, useRef, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useMessagesStore } from '../stores/messagesStore';
import socketService from '../services/socketService';
import { Message } from '../types';

// Transform backend message format (snake_case) to frontend format (camelCase)
const transformMessage = (msg: any, conversationId: string): Message => {
  // Handle both camelCase (new) and snake_case (old) backend responses
  const senderId = msg.senderId || msg.sender_id;
  const isRead = msg.isRead !== undefined ? msg.isRead : msg.is_read;
  const createdAt = msg.createdAt || msg.created_at;
  const messageType = msg.messageType || msg.message_type || 'text';
  const mediaUrl = msg.mediaUrl || msg.media_url;
  
  return {
    id: msg.id.toString(),
    content: msg.content || '',
    senderId: senderId.toString(),
    conversationId: conversationId,
    isRead: isRead,
    createdAt: createdAt,
    messageType: messageType as 'text' | 'image' | 'system',
    mediaUrl: mediaUrl,
    sender: msg.sender ? {
      id: senderId.toString(),
      username: msg.sender.username || '',
      email: '', // Not included in message sender data
      firstName: msg.sender.firstName || msg.sender.first_name || '',
      lastName: msg.sender.lastName || msg.sender.last_name || '',
      displayName: msg.sender.displayName || msg.sender.display_name,
      profilePicture: msg.sender.profilePicture || msg.sender.profile_picture,
      universityId: '', // Not included in message sender data
      createdAt: '', // Not included in message sender data
      updatedAt: '' // Not included in message sender data
    } : undefined
  };
};

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
  const handleNewMessage = useCallback((message: any) => {
    console.log('📨 Real-time message received (raw):', message);
    // Transform backend format to frontend format
    const transformedMessage = transformMessage(message, conversationId || '');
    console.log('✅ Transformed real-time message:', transformedMessage);
    // Emit the transformed message to parent component via state
    setNewMessageReceived(transformedMessage);
    // Also refresh conversation list to update last message
    fetchConversations();
  }, [conversationId, fetchConversations]);

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