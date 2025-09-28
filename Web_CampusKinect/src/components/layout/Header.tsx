'use client';

import React, { useState, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { useNavigation } from './NavigationContext';
import KinectLogo from '@/assets/logos/KinectLogo.png';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { showNavigation, setShowNavigation, showProfileDropdown, setShowProfileDropdown } = useNavigation();
  const profileIconRef = useRef<HTMLButtonElement>(null);
  // Remove local state for profile menu since it's now in context
  // const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout(() => {
        router.push('/auth/login');
      });
    }
  };

  const toggleNavigation = () => {
    setShowNavigation(!showNavigation);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-gray-800 border-b-4 border-primary z-50" style={{ backgroundColor: '#374151', borderBottom: '4px solid #708d81' }}>

      
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left Side - Navigation Toggle */}
        <div className="flex items-center">
          <button
            onClick={toggleNavigation}
            className="p-3 rounded-lg transition-all duration-300 ease-in-out cursor-pointer text-white w-12 h-12 flex items-center justify-center transform hover:scale-105 hover:shadow-md border-2"
            style={{ 
              backgroundColor: '#708d81',
              borderColor: '#ffffff',
              transition: 'background-color 300ms ease-in-out',
              cursor: 'pointer',
              color: 'white',
              WebkitTapHighlightColor: 'transparent',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5a7268';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#708d81';
            }}
            title={showNavigation ? "Hide Navigation" : "Show Navigation"}
          >
            <div className="transition-all duration-300 ease-in-out transform">
              {showNavigation ? (
                <X size={20} className="animate-in fade-in-0 zoom-in-95 duration-200" />
              ) : (
                <Menu size={20} className="animate-in fade-in-0 zoom-in-95 duration-200" />
              )}
            </div>
          </button>
        </div>

        {/* Center - App Logo & Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center">
          <img 
            src={KinectLogo.src} 
            alt="Kinect Logo" 
            className="w-8 h-8 rounded-md shadow-lg object-contain"
          />
          <h1 
            className="text-xl font-bold text-white"
            style={{ marginLeft: '16px' }}
          >
            CampusKinect
          </h1>
        </div>

        {/* Right Side - User Profile & Actions */}
        <div className="flex items-center space-x-4">
          {/* User Profile */}
          <div className="relative">
            <button
              ref={profileIconRef}
              data-profile-icon="true"
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className="p-3 rounded-lg transition-all duration-300 ease-in-out cursor-pointer text-white w-12 h-12 flex items-center justify-center transform hover:scale-105 hover:shadow-md border-2"
              style={{ 
                backgroundColor: '#708d81',
                borderColor: '#ffffff',
                transition: 'background-color 300ms ease-in-out',
                cursor: 'pointer',
                color: 'white',
                WebkitTapHighlightColor: 'transparent',
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#5a7268';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#708d81';
              }}
            >
              <div className={`transition-all duration-300 ease-in-out transform ${showProfileDropdown ? 'scale-110' : 'scale-100'}`}>
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.firstName}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 bg-[#708d81] rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                )}
              </div>
            </button>


          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 