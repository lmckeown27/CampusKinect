'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Lock, User, LogIn } from 'lucide-react';

interface GuestRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: string; // e.g., "like", "comment", "post", "message"
}

export default function GuestRestrictionModal({ isOpen, onClose, action }: GuestRestrictionModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    router.push('/auth/login');
  };

  const handleSignUp = () => {
    onClose();
    router.push('/auth/register');
  };

  const getActionText = () => {
    switch (action.toLowerCase()) {
      case 'like':
        return 'like posts';
      case 'comment':
        return 'comment on posts';
      case 'post':
        return 'create posts';
      case 'message':
        return 'send messages';
      case 'bookmark':
        return 'bookmark posts';
      default:
        return 'use this feature';
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div 
        className="bg-grey-light rounded-xl shadow-2xl w-full max-w-md mx-4 border-2 border-[#708d81]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div className="flex items-center">
            <Lock className="text-[#708d81] mr-3" size={24} />
            <h2 className="text-xl font-bold text-white">Account Required</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 text-center mb-6">
            You need to create an account or sign in to {getActionText()}.
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleSignUp}
              className="w-full bg-[#708d81] hover:bg-[#5a7166] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <User size={20} className="mr-2" />
              Create Account
            </button>

            <button
              onClick={handleLogin}
              className="w-full bg-grey-medium hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors border-2 border-[#708d81] flex items-center justify-center"
            >
              <LogIn size={20} className="mr-2" />
              Sign In
            </button>

            <button
              onClick={onClose}
              className="w-full bg-transparent text-gray-400 hover:text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Continue Browsing
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          <p className="text-gray-500 text-xs text-center">
            Join your campus community to connect, share, and discover.
          </p>
        </div>
      </div>
    </div>
  );
}
