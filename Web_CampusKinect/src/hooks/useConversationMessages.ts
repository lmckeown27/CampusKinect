import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import apiService from '../services/api';
import socketService from '../services/socketService';
import { Message, Conversation } from '../types';

// Query key factory
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: string) => [...conversationKeys.lists(), { filters }] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  messages: (conversationId: string) => ['messages', conversationId] as const,
};

// Hook for fetching conversation messages with real-time updates
export const useConversationMessages = (conversationId: string | null) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
  const queryClient = useQueryClient();

  // Subscribe to real-time message updates
  useEffect(() => {
    if (!conversationId) return;

    const handleNewMessage = (message: Message) => {
      if (isDebugMode) {
        console.log('📨 Real-time: New message received for conversation:', conversationId);
      }
      queryClient.setQueryData(
        conversationKeys.messages(conversationId),
        (oldData: Message[] | undefined) => {
          if (!oldData) return [message];
          const messageExists = oldData.some(msg => msg.id === message.id);
          if (messageExists) return oldData;
          return [...oldData, message];
        }
      );
    };

    socketService.subscribeToMessages(conversationId, handleNewMessage);

    return () => {
      socketService.unsubscribeFromMessages(conversationId);
    };
  }, [conversationId, queryClient, isDebugMode]);

  return useQuery({
    queryKey: conversationKeys.messages(conversationId || ''),
    queryFn: async () => {
      if (!conversationId) return [];
      const response = await apiService.getMessages(conversationId);
      return response.data || [];
    },
    enabled: !!conversationId,
    staleTime: isProduction ? 5 * 60 * 1000 : 30 * 1000, // 5min prod, 30s dev
    refetchInterval: isProduction ? 60 * 1000 : 30 * 1000, // 1min prod, 30s dev (fallback only)
    refetchIntervalInBackground: false, // Real-time updates handle this
  });
};

// Hook for sending messages
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      return await apiService.sendMessage(conversationId, content);
    },
    onSuccess: (newMessage: Message, { conversationId }: { conversationId: string; content: string }) => {
      // Update the messages cache
      queryClient.setQueryData(
        conversationKeys.messages(conversationId),
        (oldData: Message[] | undefined) => {
          if (!oldData) return [newMessage];
          return [...oldData, newMessage];
        }
      );

      // Invalidate conversations list to update last message
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    },
  });
};

// Hook for fetching conversations with real-time updates
export const useConversations = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const queryClient = useQueryClient();

  // Subscribe to real-time conversation updates
  useEffect(() => {
    const handleConversationUpdate = () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.lists() });
    };

    socketService.subscribeToConversations(handleConversationUpdate);

    return () => {
      socketService.unsubscribeFromConversations(handleConversationUpdate);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: conversationKeys.lists(),
    queryFn: async (): Promise<Conversation[]> => {
      const conversations = await apiService.getConversations();
      return conversations || [];
    },
    staleTime: isProduction ? 2 * 60 * 1000 : 15 * 1000, // 2min prod, 15s dev
    refetchInterval: isProduction ? 5 * 60 * 1000 : 30 * 1000, // 5min prod, 30s dev (fallback only)
    refetchIntervalInBackground: false, // Real-time updates handle this
  });
};

// Optimistic message sending hook
export const useOptimisticSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      return await apiService.sendMessage(conversationId, content);
    },
    onMutate: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: conversationKeys.messages(conversationId) });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(conversationKeys.messages(conversationId)) as Message[] | undefined;

      // Optimistically update to the new value
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        content,
        senderId: 'current-user', // Will be replaced with real data
        conversationId,
        isRead: false,
        createdAt: new Date().toISOString(),
        messageType: 'text',
      };

      queryClient.setQueryData(
        conversationKeys.messages(conversationId),
        (old: Message[] | undefined) => [...(old || []), optimisticMessage]
      );

      // Return a context object with the snapshotted value
      return { previousMessages: previousMessages || [] };
    },
    onError: (err: Error, { conversationId }: { conversationId: string; content: string }, context: { previousMessages: Message[] } | undefined) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(conversationKeys.messages(conversationId), context?.previousMessages);
    },
    onSettled: (data: Message | undefined, error: Error | null, { conversationId }: { conversationId: string; content: string }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: conversationKeys.messages(conversationId) });
    },
  });
}; 