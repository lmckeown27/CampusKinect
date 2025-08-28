'use client';

import React, { useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import Header from '../layout/Header';
import LeftSidebar from '../layout/LeftSidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    // Check authentication status on mount
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9f6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#708d81] mx-auto mb-4"></div>
          <p className="text-[#708d81]">Loading CampusKinect...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f8f9f6' }}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9f6' }}>
      <Header />
      <LeftSidebar />
      <main className="pl-64 lg:pl-72 xl:pl-80 pt-16 pr-6 lg:pr-8 xl:pr-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout; 