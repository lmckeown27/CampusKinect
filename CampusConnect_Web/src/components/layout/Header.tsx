'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'next/navigation';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useNavigation } from './NavigationContext';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { showNavigation, setShowNavigation, showProfileDropdown, setShowProfileDropdown } = useNavigation();
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
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-[#708d81] z-50">

      
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left Side - Navigation Toggle */}
        <div className="flex items-center">
          <button
            onClick={toggleNavigation}
            className={`p-2 rounded-lg transition-all duration-200 ${
              showNavigation 
                ? 'text-[#708d81] hover:text-[#5a7268] hover:bg-[#f0f2f0]' 
                : 'text-white bg-[#708d81] hover:bg-[#5a7268]'
            }`}
            title={showNavigation ? "Hide Navigation" : "Show Navigation"}
          >
            {showNavigation ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Center - App Logo & Title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-md flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900">CampusKinect</h1>
        </div>

        {/* Right Side - User Profile & Actions */}
        <div className="flex items-center space-x-4">
          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              className={`flex items-center space-x-2 p-2 rounded-lg transition-colors ${
                showProfileDropdown 
                  ? 'bg-[#f0f2f0] text-[#708d81]' 
                  : 'hover:bg-[#f0f2f0] text-[#708d81]'
              }`}
            >
              {/* Profile icon always stays in place */}
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.firstName}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
              )}
              <span className="text-sm font-medium text-[#708d81] hidden sm:block">
                {user?.firstName} {user?.lastName}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 