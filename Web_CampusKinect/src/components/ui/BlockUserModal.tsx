'use client';

import React, { useState } from 'react';
import { X, UserX, Shield, AlertTriangle } from 'lucide-react';

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  userProfilePicture?: string;
  onSubmit?: (userId: string) => Promise<void>;
}

const BlockUserModal: React.FC<BlockUserModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
  userProfilePicture,
  onSubmit
}) => {
  const [isBlocking, setIsBlocking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isOpen) return null;

  const handleBlock = async () => {
    setIsBlocking(true);

    try {
      if (onSubmit) {
        await onSubmit(userId);
      } else {
        // Default API call if no custom onSubmit provided
        const response = await fetch('/api/v1/users/block', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify({ userId: parseInt(userId) })
        });

        if (!response.ok) {
          throw new Error('Failed to block user');
        }
      }

      setShowConfirmation(true);
      setTimeout(() => {
        setShowConfirmation(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Failed to block user:', error);
      // You could show an error toast here
    } finally {
      setIsBlocking(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">User Blocked</h3>
            <p className="text-sm text-gray-500">
              {userName} has been blocked. You can unblock them anytime in Settings → Privacy & Safety.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-red-100">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Block User</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* User Info */}
          <div className="mb-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              {userProfilePicture ? (
                <img
                  src={userProfilePicture}
                  alt={userName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">You are about to block:</p>
                <p className="font-semibold text-gray-900">{userName}</p>
              </div>
            </div>
          </div>

          {/* What happens when you block */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              What happens when you block this user:
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 mt-0.5">
                  <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Hide their content</p>
                  <p className="text-sm text-gray-500">You won't see their posts or messages</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 mt-0.5">
                  <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Prevent messaging</p>
                  <p className="text-sm text-gray-500">They won't be able to message you</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 mt-0.5">
                  <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Hide your profile</p>
                  <p className="text-sm text-gray-500">They won't be able to view your profile or posts</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 mt-0.5">
                  <div className="h-2 w-2 bg-red-600 rounded-full"></div>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Stop notifications</p>
                  <p className="text-sm text-gray-500">You won't receive notifications from their activity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Unblock info */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">You can unblock users anytime</p>
                <p className="text-sm text-blue-700 mt-1">
                  Go to Settings → Privacy & Safety → Blocked Users to manage your blocked users list.
                </p>
              </div>
            </div>
          </div>

          {/* Alternative actions */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Other options:</h4>
            <button
              onClick={() => {
                // You could open a report modal here
                console.log('Report user instead');
              }}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-orange-600" />
                <span className="text-gray-900">Report this user instead</span>
              </div>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleBlock}
              disabled={isBlocking}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBlocking ? 'Blocking...' : 'Block User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockUserModal; 