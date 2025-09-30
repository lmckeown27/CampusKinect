'use client';

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import socketService from '../../services/socketService';

interface QueryProviderProps {
  children: React.ReactNode;
}

// Create a factory function to avoid SSR issues
const createQueryClient = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: isProduction ? 5 * 60 * 1000 : 30 * 1000, // 5min prod, 30s dev
        gcTime: isProduction ? 10 * 60 * 1000 : 5 * 60 * 1000, // 10min prod, 5min dev
        retry: isProduction ? 3 : 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: isProduction,
      },
      mutations: {
        retry: 1,
      },
    },
  });
};

let queryClient: QueryClient | undefined;

const getQueryClient = () => {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
};

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const client = getQueryClient();

  // Initialize Socket.io when user is authenticated
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const { user } = useAuthStore.getState();
    
    if (user?.id) {
      const token = localStorage.getItem('ck_token') || localStorage.getItem('ck_prod_token');
      if (token) {
        socketService.initialize(user.id.toString(), token);
      }
    } else {
      socketService.disconnect();
    }
    
    const unsubscribe = useAuthStore.subscribe((state) => {
      if (state.user?.id) {
        const token = localStorage.getItem('ck_token') || localStorage.getItem('ck_prod_token');
        if (token) {
          socketService.initialize(state.user.id.toString(), token);
        }
      } else {
        socketService.disconnect();
      }
    });
    
    return () => {
      unsubscribe();
      socketService.disconnect();
    };
  }, []);
  
  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}; 