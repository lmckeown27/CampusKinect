'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import { User, Settings, LogOut, Bell } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    // Show logout confirmation
    alert(`👋 LOGGING OUT!
    
🚪 Logging out of CampusKinect
🔄 Clearing session data
📱 Redirecting to login page...`);
    
    logout(() => {
      // Redirect to login page after logout
      router.push('/auth/login');
    });
    setShowProfileMenu(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-[#708d81] z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-600 rounded-md flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <h1 className="text-xl font-bold text-neutral-900">CampusKinect</h1>
        </div>

        {/* Right Side - User Profile & Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-[#708d81] hover:text-[#5a7268] hover:bg-[#f0f2f0] rounded-full transition-colors">
            <Bell size={20} />
          </button>

          {/* Settings */}
          <button className="p-2 text-[#708d81] hover:text-[#5a7268] hover:bg-[#f0f2f0] rounded-full transition-colors">
            <Settings size={20} />
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-[#f0f2f0] transition-colors"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.firstName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              )}
              <span className="text-sm font-medium text-[#708d81] hidden sm:block">
                {user?.firstName} {user?.lastName}
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#708d81] py-2 z-50">
                <div className="px-4 py-2 border-b border-[#f0f2f0]">
                  <p className="text-sm font-medium text-[#708d81]">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-[#708d81] opacity-70">{user?.email}</p>
                </div>
                
                <button
                  onClick={() => {
                    // Navigate to profile
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-[#708d81] hover:bg-[#f0f2f0] transition-colors"
                >
                  View Profile
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close profile menu */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  );
};

export default Header; 