'use client';

import React, { useEffect, useRef } from 'react';
import { User, LogOut, Settings, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfilebarProps {
  showProfileDropdown: boolean;
  setShowProfileDropdown: (show: boolean) => void;
  user: {
    firstName: string;
    lastName: string;
    username: string;
    email?: string;
    profilePicture?: string;
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
      // Don't close if clicking on the profile icon button (check by class name)
      const target = event.target as Element;
      if (target && target.closest('button[data-profile-icon]')) {
        return;
      }
      
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
    <div className="relative z-50" ref={profileRef}>
      <div className="w-64 lg:w-72 xl:w-80 flex flex-col py-6 transition-all duration-300 ease-in-out transform rounded-lg shadow-2xl border border-gray-200 hover:shadow-3xl" style={{ backgroundColor: '#708d81' }}>
        {/* User Info Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
              )}
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
            style={{ backgroundColor: '#f0f2f0', color: '#708d81', marginBottom: '16px', cursor: 'pointer' }}
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
            style={{ backgroundColor: '#f0f2f0', color: '#708d81', marginBottom: '16px', cursor: 'pointer' }}
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
          
          {/* Admin Button - Only for liam_mckeown38 */}
          {(user?.email === 'lmckeown@calpoly.edu' || user?.username === 'liam_mckeown38') && (
            <button
              onClick={() => {
                console.log('🔍 ADMIN BUTTON CLICKED');
                console.log('User data:', user);
                console.log('Navigating to /admin...');
                setShowProfileDropdown(false);
                router.push('/admin');
              }}
              className="w-full flex items-center space-x-4 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer shadow-md hover:shadow-lg"
              style={{ backgroundColor: '#dc2626', color: 'white', marginBottom: '16px', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#991b1b';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.color = 'white';
              }}
            >
              <Shield size={16} />
              <span>&nbsp;Admin Panel</span>
            </button>
          )}
          
          <button
            onClick={() => {
              setShowProfileDropdown(false);
              // Simple logout - redirect to login page
              router.push('/auth/login');
            }}
            className="w-full flex items-center space-x-4 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer shadow-md hover:shadow-lg"
            style={{ backgroundColor: '#f0f2f0', color: '#708d81', cursor: 'pointer' }}
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