'use client';

import React from 'react';
import Header from '../layout/Header';
import { NavigationProvider, useNavigation } from './NavigationContext';
import LeftSidebar from '../layout/LeftSidebar';
// import { useAuthStore } from '../../stores/authStore';
// import { useNavigation } from './NavigationContext';
// import { Users, Calendar, DollarSign, BookOpen, TrendingUp, UserPlus, Menu } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayoutContent: React.FC<MainLayoutProps> = ({ children }) => {
  // Temporarily bypass auth check for testing
  const isAuthenticated = true; // Force authenticated state
  const isLoading = false; // Force not loading state
  
  // const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const { showNavigation, setShowNavigation } = useNavigation();

  // useEffect(() => {
  //   // Check authentication status on mount
  //   checkAuth();
  // }, [checkAuth]);

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
    <div style={{ backgroundColor: '#f8f9f6', minHeight: '100vh' }}>
      <Header />
      <div className="flex pt-16">
        {/* Left Sidebar - Navigation */}
        {showNavigation && (
          <div className="transition-all duration-300 ease-in-out">
            <LeftSidebar />
          </div>
        )}
        
        {/* Center Column - Main Content */}
        <main className={`flex-1 mx-auto px-4 transition-all duration-300 ease-in-out ${
          showNavigation ? 'max-w-4xl' : 'max-w-6xl'
        }`}>
          {children}
        </main>
        
        {/* Right Sidebar - Temporarily Hidden */}
        {/* <div className="w-80 hidden xl:block p-6">...</div> */}
      </div>
    </div>
  );
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <NavigationProvider>
      <MainLayoutContent children={children} />
    </NavigationProvider>
  );
};

export default MainLayout; 