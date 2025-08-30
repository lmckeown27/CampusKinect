'use client';

import React, { useEffect, useRef } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfilebarProps {
  showProfileDropdown: boolean;
  setShowProfileDropdown: (show: boolean) => void;
  user: {
    firstName: string;
    lastName: string;
    username: string;
  } | null;
}

const Profilebar: React.FC<ProfilebarProps> = ({ 
  showProfileDropdown, 
  setShowProfileDropdown, 
  user 
}) => {
  const router = useRouter();
  const profileRef = useRef<HTMLDivElement>(null);
  
  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    if (showProfileDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileDropdown, setShowProfileDropdown]);

  if (!showProfileDropdown) {
    return null;
  }

  return (
    <div className="absolute right-0 top-0 z-50" ref={profileRef}>
      <div className="w-80 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out transform hover:shadow-3xl">
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
        <div className="p-2 space-y-3">
          <button
            onClick={() => {
              setShowProfileDropdown(false);
              router.push('/profile');
            }}
            className="w-full flex items-center space-x-4 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#f0f2f0', color: '#708d81', marginBottom: '16px' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#708d81';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f2f0';
              e.currentTarget.style.color = '#708d81';
            }}
          >
            <User size={16} />
            <span>&nbsp;Profile</span>
          </button>
          <button
            onClick={() => {
              setShowProfileDropdown(false);
              router.push('/settings');
            }}
            className="w-full flex items-center space-x-4 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#f0f2f0', color: '#708d81', marginBottom: '16px' }}
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
            <span>&nbsp;Settings</span>
          </button>
          <button
            onClick={() => {
              setShowProfileDropdown(false);
              // Simple logout - redirect to login page
              router.push('/auth/login');
            }}
            className="w-full flex items-center space-x-4 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#f0f2f0', color: '#708d81' }}
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
            <span>&nbsp;Sign out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profilebar; 