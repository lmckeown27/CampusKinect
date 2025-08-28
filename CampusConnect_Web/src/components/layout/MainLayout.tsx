'use client';

import React from 'react';
import Header from '../layout/Header';
import { NavigationProvider, useNavigation } from './NavigationContext';
import LeftSidebar from '../layout/LeftSidebar';
import { User, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
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
  const { showNavigation, setShowNavigation, showProfileDropdown, setShowProfileDropdown } = useNavigation();
  const router = useRouter();
  
  // Mock user data for testing
  const user = {
    firstName: "Liam",
    lastName: "McKeown",
    email: "liam.mckeown38415@gmail.com",
    username: "liam_mckeown38"
  };

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
          <div className="transition-all duration-300 ease-in-out ml-2">
            <LeftSidebar />
          </div>
        )}
        
        {/* Center Column - Main Content */}
        <main className={`flex-1 mx-auto px-4 transition-all duration-300 ease-in-out ${
          showNavigation && showProfileDropdown ? 'max-w-3xl' : 
          showNavigation ? 'max-w-4xl' : 
          showProfileDropdown ? 'max-w-4xl' : 'max-w-6xl'
        }`}>
          {children}
        </main>

        {/* Right Sidebar - Profile Dropdown (when open) */}
        {showProfileDropdown && (
          <div className="mr-2">
            <div className="w-64 lg:w-72 xl:w-80 border-l border-[#708d81] flex flex-col py-6 transition-all duration-300 ease-in-out transform rounded-l-lg" style={{ backgroundColor: '#708d81' }}>
              {/* Profile Header */}
              <div className="px-6 mb-8">
                {/* Header removed for cleaner interface */}
              </div>

              {/* Profile Info */}
              <div className="flex-1 px-4">
                <div className="bg-white rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                        <User size={24} className="text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-[#708d81]">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-sm text-[#708d81] opacity-70">@{user?.username || 'username'}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Actions */}
                <div>
                  <button
                    onClick={() => {
                      // Navigate to profile
                      setShowProfileDropdown(false);
                      router.push('/profile');
                    }}
                    className="flex items-center space-x-4 w-full px-4 py-3 rounded-xl transition-colors cursor-pointer text-white"
                    style={{ backgroundColor: '#ff6b6b', marginBottom: '16px' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e8ebe8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff6b6b';
                    }}
                  >
                    <User size={24} />
                    <span className="text-base font-medium">View Profile</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Handle logout
                      setShowProfileDropdown(false);
                    }}
                    className="flex items-center space-x-4 w-full px-4 py-3 rounded-xl transition-colors cursor-pointer text-white"
                    style={{ backgroundColor: '#ff6b6b', marginBottom: '16px' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e8ebe8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff6b6b';
                    }}
                  >
                    <LogOut size={24} />
                    <span className="text-base font-medium">Logout</span>
                  </button>

                  <button
                    onClick={() => {
                      // Handle settings
                      setShowProfileDropdown(false);
                    }}
                    className="flex items-center space-x-4 w-full px-4 py-3 rounded-xl transition-colors cursor-pointer text-white"
                    style={{ backgroundColor: '#ff6b6b' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e8ebe8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ff6b6b';
                    }}
                  >
                    <Settings size={24} />
                    <span className="text-base font-medium">Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Click outside to close profile dropdown */}
        {showProfileDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowProfileDropdown(false)}
          />
        )}
        
        {/* Right Sidebar - Temporarily Hidden */}
        {/* <div className="w-80 hidden xl:block p-6">...</div> */}
      </div>
    </div>
  );
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return <MainLayoutContent>{children}</MainLayoutContent>;
};

export default MainLayout; 