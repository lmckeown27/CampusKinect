'use client';

import React, { useState } from 'react';
import { X, Shield, AlertTriangle, User } from 'lucide-react';
import { User as UserType } from '../../types';
import { apiService } from '../../services/api';

interface BlockUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUserBlocked?: () => void;
}

const BlockUserModal: React.FC<BlockUserModalProps> = ({
  isOpen,
  onClose,
  user,
  onUserBlocked
}) => {
  const [isBlocking, setIsBlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleBlock = async () => {
    setIsBlocking(true);
    setError(null);

    try {
      await apiService.blockUser(user.id);
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        onUserBlocked?.();
        setSuccess(false);
      }, 2000);

    } catch (error: any) {
      setError(error.message || 'Failed to block user. Please try again.');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleClose = () => {
    if (!isBlocking) {
      onClose();
      setError(null);
      setSuccess(false);
    }
  };

  if (!isOpen) return null;

  const displayName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.displayName || user.username || 'Unknown User';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Shield size={20} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Block User</h2>
              <p className="text-sm text-gray-500">
                Prevent this user from contacting you
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isBlocking}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="p-3 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">User Blocked</h3>
              <p className="text-gray-600">
                {displayName} has been blocked and can no longer contact you.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={displayName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <User size={24} className="text-white" />
          </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{displayName}</p>
                  {user.username && (
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  )}
                  {user.major && user.year && (
                    <p className="text-sm text-gray-500">
                      {user.major} • Year {user.year}
                    </p>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-3">
                  <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                    <h4 className="font-medium text-yellow-800 mb-1">
                      Are you sure you want to block this user?
                    </h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• They won't be able to send you messages</li>
                      <li>• You won't see their posts in your feed</li>
                      <li>• Any existing conversations will be hidden</li>
                      <li>• You can unblock them later in your settings</li>
                    </ul>
                </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle size={16} className="text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

          {/* Actions */}
              <div className="flex space-x-3 pt-4">
            <button
                  type="button"
                  onClick={handleClose}
                  disabled={isBlocking}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBlock}
              disabled={isBlocking}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBlocking ? 'Blocking...' : 'Block User'}
            </button>
          </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockUserModal; 