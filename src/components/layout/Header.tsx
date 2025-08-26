'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { User, Settings, LogOut } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        {/* App Title */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600">CampusConnect</h1>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center space-x-3">
          {/* User Avatar */}
          <div className="relative">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.displayName}</p>
            <p className="text-xs text-gray-500">{user?.universityName}</p>
          </div>

          {/* Settings & Logout */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {/* TODO: Navigate to settings */}}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
} 