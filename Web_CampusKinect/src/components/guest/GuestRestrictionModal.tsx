'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { User, LogIn, X, Lock } from 'lucide-react';

interface GuestRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: string;
}

export default function GuestRestrictionModal({ isOpen, onClose, feature }: GuestRestrictionModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    router.push('/auth/login');
  };

  const handleCreateAccount = () => {
    onClose();
    router.push('/auth/register');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      onClick={onClose}
    >
      <div 
        className="bg-grey-light rounded-xl shadow-2xl w-full max-w-md mx-4 border-2 border-[#708d81]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-[#708d81] bg-opacity-20 flex items-center justify-center">
              <Lock size={24} className="text-[#708d81]" />
            </div>
            <h2 className="text-xl font-bold text-white">Sign In Required</h2>
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
            To access <span className="font-semibold text-[#708d81]">{feature}</span>, you need to have an account.
          </p>

          <div className="space-y-3">
            {/* Sign In Button */}
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-grey-medium hover:bg-gray-600 text-white font-medium rounded-lg transition-colors border border-[#708d81]"
            >
              <LogIn size={20} />
              <span>Sign In to Existing Account</span>
            </button>

            {/* Create Account Button */}
            <button
              onClick={handleCreateAccount}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-[#708d81] hover:bg-[#5a7166] text-white font-medium rounded-lg transition-colors"
            >
              <User size={20} />
              <span>Create New Account</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-600">
            <p className="text-xs text-gray-400 text-center">
              Creating an account is free and gives you full access to:
            </p>
            <ul className="mt-3 space-y-1 text-xs text-gray-400">
              <li className="flex items-center space-x-2">
                <span className="text-[#708d81]">✓</span>
                <span>Create and manage posts</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#708d81]">✓</span>
                <span>Send and receive messages</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#708d81]">✓</span>
                <span>Customize your profile</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="text-[#708d81]">✓</span>
                <span>Access all platform features</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
