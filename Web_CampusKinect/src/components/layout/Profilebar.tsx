'use client';

import React, { useEffect, useRef, useState } from 'react';
import { User, LogOut, Settings, Shield, LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import GuestRestrictionModal from '../guest/GuestRestrictionModal';

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
  const { isGuest, isAuthenticated } = useAuthStore();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestFeature, setGuestFeature] = useState('');
  
  // Profile dropdown only closes when profile button is clicked (no click-outside behavior)

  if (!showProfileDropdown) {
    return null;
  }

  const isGuestMode = isGuest && !isAuthenticated;

  const handleGuestAction = (featureName: string) => {
    setGuestFeature(featureName);
    setShowGuestModal(true);
  };

  return (
    <div className="relative z-40" ref={profileRef}>
      <div className="w-full flex flex-col pb-6 transition-all duration-300 ease-in-out transform">
        
        {/* Profile Header */}
        <div className="px-6 mb-8">
          {/* Header spacing to match navigation */}
        </div>
        
        {/* User Info Section */}
        <div className="px-4 mb-4 border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-3">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {isGuestMode ? (
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                  <User size={24} className="text-gray-400" />
                </div>
              ) : user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-[#708d81] rounded-full flex items-center justify-center">
                  <User size={24} className="text-white" />
                </div>
              )}
            </div>
            
            {/* User Details */}
            <div className="flex-1 min-w-0">
              {isGuestMode ? (
                <>
                  <p className="text-sm font-medium text-white truncate">
                    Guest User
                  </p>
                  <p className="text-sm text-white opacity-70 truncate">
                    Browsing Mode
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-white truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-sm text-white opacity-70 truncate">
                    @{user?.username || 'username'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div className="flex-1 px-4">
          {isGuestMode ? (
            /* Guest Mode Buttons */
            <>
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  router.push('/auth/login');
                }}
                className="w-full flex items-center space-x-4 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#f0f2f0', color: '#708d81', marginBottom: '16px', cursor: 'pointer', border: '2px solid #708d81' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#708d81';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f2f0';
                  e.currentTarget.style.color = '#708d81';
                }}
              >
                <LogIn size={16} />
                <span>&nbsp;Sign In</span>
              </button>
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  router.push('/auth/register');
                }}
                className="w-full flex items-center space-x-4 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer shadow-md hover:shadow-lg"
                style={{ backgroundColor: '#708d81', color: 'white', marginBottom: '16px', cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5a7166';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#708d81';
                }}
              >
                <User size={16} />
                <span>&nbsp;Create Account</span>
              </button>
            </>
          ) : (
            /* Authenticated User Buttons */
            <>
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
            </>
          )}
        </div>
        
        {/* Bottom Section - Additional Options */}
        <div className="px-4 mt-8">
          <div className="border-t border-[#f0f2f0] pt-4">
            {/* Additional options can be added here */}
          </div>
        </div>
      </div>
      
      {/* Guest Restriction Modal */}
      <GuestRestrictionModal
        isOpen={showGuestModal}
        onClose={() => setShowGuestModal(false)}
        feature={guestFeature}
      />
    </div>
  );
};

export default Profilebar; 