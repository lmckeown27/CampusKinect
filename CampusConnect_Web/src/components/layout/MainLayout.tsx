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
            <div className="w-80 bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-300 ease-in-out transform">
              {/* User Info Section */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <User size={24} className="text-white" />
                    </div>
                  </div>
                  
                  {/* User Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      @{user?.username || 'username'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    router.push('/settings');
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-[#708d81] rounded-md transition-colors cursor-pointer"
                  style={{ backgroundColor: '#f0f2f0' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f2f0';
                    e.currentTarget.style.color = '#708d81';
                  }}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    // Simple logout - redirect to login page
                    router.push('/auth/login');
                  }}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-[#708d81] rounded-md transition-colors cursor-pointer"
                  style={{ backgroundColor: '#f0f2f0' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#708d81';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f0f2f0';
                    e.currentTarget.style.color = '#708d81';
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign out</span>
                </button>
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