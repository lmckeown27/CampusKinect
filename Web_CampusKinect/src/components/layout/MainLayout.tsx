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
      {/* Debug indicator */}
      <div style={{ position: 'fixed', top: '70px', left: '10px', zIndex: 1000, background: 'red', color: 'white', padding: '5px', fontSize: '12px' }}>
        Nav: {showNavigation ? 'SHOWN' : 'HIDDEN'} | Profile: {showProfileDropdown ? 'SHOWN' : 'HIDDEN'}
      </div>
      <div className="flex pt-16">
        {/* Left Sidebar - Navigation */}
        {showNavigation && (
          <div className="w-80 flex-shrink-0 bg-gray-100 border-r-4 border-primary h-screen overflow-y-auto pt-4" style={{ backgroundColor: '#f3f4f6', borderRight: '4px solid #708d81' }}>
            <div className="p-6">
              <Navigationbar />
            </div>
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
          <div className="w-80 flex-shrink-0 bg-grey-medium border-l border-gray-200 h-screen overflow-y-auto pt-4">
            <div className="p-6">
              <Profilebar 
                showProfileDropdown={showProfileDropdown} 
                setShowProfileDropdown={setShowProfileDropdown} 
                user={user} 
              />
            </div>
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