'use client';

import React, { useEffect } from 'react';
import Header from '../layout/Header';
import { NavigationProvider, useNavigation } from './NavigationContext';
import Navigationbar from '../layout/Navigationbar';
import Profilebar from '../layout/Profilebar';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayoutContent: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated, checkAuth, isLoading, user } = useAuthStore();
  const { showNavigation, setShowNavigation, showProfileDropdown, setShowProfileDropdown } = useNavigation();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#525252' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#708d81] mx-auto mb-4"></div>
          <p className="text-[#708d81]">Loading CampusKinect...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#525252' }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#525252', minHeight: '100vh' }}>
      <Header />

      <div className="flex pt-16">
        {/* Left Sidebar - Navigation */}
        {showNavigation && (
          <div className="w-80 flex-shrink-0 bg-grey-medium border-r-4 border-primary h-[calc(100vh-4rem)] overflow-y-auto" style={{ borderRight: '4px solid #708d81' }}>
            <Navigationbar />
          </div>
        )}

        {/* Center Column - Main Content */}
        <main className={`flex-1 transition-all duration-300 ${
          showNavigation ? 'ml-0' : 'ml-0'
        } ${showProfileDropdown ? 'mr-0' : 'mr-0'}`}>
          {children}
        </main>

        {/* Right Sidebar - Profile Dropdown (when open) */}
        {showProfileDropdown && (
          <div className="w-80 flex-shrink-0 bg-grey-medium border-l-4 border-primary h-[calc(100vh-4rem)] overflow-y-auto" style={{ borderLeft: '4px solid #708d81' }}>
            <Profilebar 
              showProfileDropdown={showProfileDropdown} 
              setShowProfileDropdown={setShowProfileDropdown} 
              user={user} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <NavigationProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </NavigationProvider>
  );
};

export default MainLayout; 