import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import socketService from '../services/socketService';

/**
 * Hook to initialize real-time messaging using server-side authentication
 * Uses HTTP-only cookies and your existing EC2 auth infrastructure
 * No localStorage - completely SSR-safe
 */
export const useRealTimeMessaging = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    // Only initialize on client-side when user is authenticated
    if (typeof window === 'undefined' || !user) {
      return;
    }

    // Initialize socket with server-side authentication
    socketService.initialize().catch((error) => {
      console.error('Failed to initialize real-time messaging:', error);
      // App continues to work without real-time features
    });

    // Cleanup on unmount or user logout
    return () => {
      socketService.disconnect();
    };
  }, [user]);

  return {
    isConnected: socketService.isSocketConnected(),
    subscribeToMessages: socketService.subscribeToMessages.bind(socketService),
    unsubscribeFromMessages: socketService.unsubscribeFromMessages.bind(socketService),
    subscribeToConversations: socketService.subscribeToConversations.bind(socketService),
    unsubscribeFromConversations: socketService.unsubscribeFromConversations.bind(socketService),
  };
}; 