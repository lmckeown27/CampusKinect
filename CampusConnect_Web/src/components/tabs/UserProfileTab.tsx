'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { apiService } from '../../services/api';
import { Post, User } from '../../types';
import PostCard from '../ui/PostCard';
import { useRouter } from 'next/navigation';

// Helper function to get year label
const getYearLabel = (year: number): string => {
  const yearLabels: { [key: number]: string } = {
    1: 'Freshman',
    2: 'Sophomore', 
    3: 'Junior',
    4: 'Senior',
    5: 'Super Senior'
  };

  return yearLabels[year] || `Year ${year}`;
};

interface UserProfileTabProps {
  userId: string;
}

const UserProfileTab: React.FC<UserProfileTabProps> = ({ userId }) => {
  const { user: currentUser } = useAuthStore();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if viewing own profile
  const isOwnProfile = currentUser?.id === userId;

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (isOwnProfile && currentUser) {
          // If viewing own profile, use current user data
          setUser(currentUser);
        } else {
          // Fetch other user's data
          const userData = await apiService.getUser(userId);
          setUser(userData);
        }
      } catch (err: any) {
        console.error('Error fetching user:', err);
        setError(err.message || 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, currentUser, isOwnProfile]);

  // Fetch user's posts
  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        setPostsLoading(true);
        const response = await apiService.getUserPosts(userId);
        setPosts(response.data);
      } catch (err: any) {
        console.error('Error fetching user posts:', err);
        // Don't show error for posts, just show empty state
      } finally {
        setPostsLoading(false);
      }
    };

    if (userId) {
      fetchUserPosts();
    }
  }, [userId]);

  const handleSendMessage = () => {
    // Navigate to messages with this user
    router.push(`/messages?userId=${userId}`);
  };

  const handleBackClick = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#708d81]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">Error loading profile</div>
        <div className="text-gray-500 mb-4">{error}</div>
        <button
          onClick={handleBackClick}
          className="px-4 py-2 bg-[#708d81] text-white rounded-lg hover:bg-[#a8c4a2] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 text-xl mb-4">User not found</div>
        <button
          onClick={handleBackClick}
          className="px-4 py-2 bg-[#708d81] text-white rounded-lg hover:bg-[#a8c4a2] transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={handleBackClick}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-4"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isOwnProfile ? 'Your Profile' : `${user.firstName}'s Profile`}
        </h1>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-300 p-6 mb-6">
        <div className="flex items-start space-x-6">
          {/* Profile Picture */}
          <div className="flex-shrink-0">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-24 h-24 rounded-full object-cover"
                style={{ border: '3px solid #708d81' }}
              />
            ) : (
              <div 
                className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center"
                style={{ border: '3px solid #708d81' }}
              >
                <span className="text-white text-2xl font-bold">
                  {user.firstName?.charAt(0) || '?'}{user.lastName?.charAt(0) || '?'}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-500 text-lg">@{user.username}</p>
              </div>
              
              {/* Message Button (only show if not own profile) */}
              {!isOwnProfile && (
                <button
                  onClick={handleSendMessage}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#708d81] text-white rounded-lg hover:bg-[#a8c4a2] transition-colors"
                >
                  <MessageCircle size={20} />
                  <span>Message</span>
                </button>
              )}
            </div>

            {/* Academic Info */}
            <div className="mb-3">
              <p className="text-gray-700 text-lg">
                {user.major || 'Major not specified'} • {user.year ? getYearLabel(user.year) : 'Year not specified'}
              </p>
            </div>

            {/* University Info */}
            <div className="mb-3">
              <p className="text-gray-600">
                📍 {user.university?.name || 'University not specified'}
              </p>
              {user.university?.city && user.university?.state && (
                <p className="text-gray-500 text-sm">
                  {user.university.city}, {user.university.state}
                </p>
              )}
            </div>

            {/* Hometown */}
            {user.hometown && (
              <div className="mb-3">
                <p className="text-gray-600">
                  🏠 From {user.hometown}
                </p>
              </div>
            )}

            {/* Verification Status */}
            {user.isVerified && (
              <div className="mb-3">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Verified Student
                </span>
              </div>
            )}

            {/* Member Since */}
            <div className="mb-4">
              <p className="text-gray-500 text-sm">
                📅 Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Stats */}
            <div className="mb-4">
              <div className="flex space-x-4 text-sm">
                <div className="text-center">
                  <p className="font-bold text-lg text-gray-900">{user.stats?.postCount || 0}</p>
                  <p className="text-gray-500">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg text-gray-900">{user.stats?.fulfilledPosts || 0}</p>
                  <p className="text-gray-500">Fulfilled</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mb-4">
                <p className="text-gray-600">{user.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-300 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {isOwnProfile ? 'Your Posts' : `${user.firstName}'s Posts`}
        </h3>
        
        {postsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#708d81]"></div>
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={post}
                showDeleteButton={isOwnProfile}
                showEditButton={isOwnProfile}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-lg">
              {isOwnProfile ? "You haven't posted anything yet." : `${user.firstName} hasn't posted anything yet.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileTab; 