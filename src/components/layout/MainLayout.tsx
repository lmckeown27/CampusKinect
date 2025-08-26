'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export default function MainLayout({ 
  children, 
  showHeader = true, 
  showBottomNav = true 
}: MainLayoutProps) {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Redirect to login if not authenticated and trying to access protected routes
    if (!isLoading && !isAuthenticated && !pathname.startsWith('/auth')) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show layout for auth pages
  if (pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  // Don't show layout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <Header />}
      
      <main className="pb-20 pt-16">
        {children}
      </main>
      
      {showBottomNav && <BottomNavigation />}
    </div>
  );
} 

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import BottomNavigation from './BottomNavigation';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export default function MainLayout({ 
  children, 
  showHeader = true, 
  showBottomNav = true 
}: MainLayoutProps) {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Redirect to login if not authenticated and trying to access protected routes
    if (!isLoading && !isAuthenticated && !pathname.startsWith('/auth')) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show layout for auth pages
  if (pathname.startsWith('/auth')) {
    return <>{children}</>;
  }

  // Don't show layout if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {showHeader && <Header />}
      
      <main className="pb-20 pt-16">
        {children}
      </main>
      
      {showBottomNav && <BottomNavigation />}
    </div>
  );
} 