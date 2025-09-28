'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, UserX, Shield, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiService } from '../../../services/api';
import { BlockedUser } from '../../../types';

const BlockedUsersPage: React.FC = () => {
  const router = useRouter();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBlockedUsers();
  }, []);

  const loadBlockedUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiService.getBlockedUsers();
      setBlockedUsers(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load blocked users');
      console.error('Failed to load blocked users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnblock = async (userId: string, displayName: string) => {
    if (!confirm(`Are you sure you want to unblock ${displayName}? They will be able to see your content and message you again.`)) {
      return;
    }

    try {
      await apiService.unblockUser(userId);
      // Remove from local list
      setBlockedUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err: any) {
      console.error('Failed to unblock user:', err);
      alert('Failed to unblock user. Please try again.');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Blocked Users</h1>
              <p className="text-sm text-gray-500 mt-1">Manage users you have blocked</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading blocked users...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Blocked Users</h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={loadBlockedUsers}
                className="px-4 py-2 bg-[#708d81] text-white rounded-md hover:bg-[#5a7268] transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : blockedUsers.length === 0 ? (
            <div className="p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Blocked Users</h3>
              <p className="text-sm text-gray-500">
                You haven't blocked anyone yet. When you block users, they'll appear here and you can manage them.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {blockedUsers.map((user) => (
                <div key={user.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.displayName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {user.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{user.displayName}</h3>
                      {user.username && (
                        <p className="text-sm text-gray-500">@{user.username}</p>
                      )}
                      <p className="text-xs text-gray-400">Blocked {formatTimeAgo(user.blockedAt)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleUnblock(user.id, user.displayName)}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-6 w-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">About Blocking Users</h3>
              <div className="text-sm text-blue-700 space-y-2">
                <p>When you block a user:</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>You won't see their posts or messages</li>
                  <li>They won't be able to message you</li>
                  <li>They won't be able to view your profile or posts</li>
                  <li>You won't receive notifications from their activity</li>
                </ul>
                <p className="mt-3">
                  You can unblock users at any time. Blocking is private - the other user won't be notified that you've blocked them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockedUsersPage; 