'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Users, Mail, MapPin, GraduationCap, Calendar, 
  FileText, MessageSquare, AlertTriangle, CheckCircle, Ban,
  MapPinned, Tag, Image as ImageIcon, Flag,
  ExternalLink, Trash2, UserX
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { apiService } from '../../../../../services/api';
import { useAuthStore } from '../../../../../stores/authStore';
import MainLayout from '../../../../../components/layout/MainLayout';

interface UserProfile {
  user: {
    id: string;
    username: string;
    displayName: string;
    email: string;
    profilePicture: string;
    year: string;
    major: string;
    hometown: string;
    bio: string;
    isActive: boolean;
    isVerified: boolean;
    isBanned: boolean;
    bannedAt: string;
    banUntil: string;
    banReason: string;
    createdAt: string;
    university: {
      id: number;
      name: string;
    };
  };
  statistics: {
    activePosts: number;
    totalPosts: number;
    messagesSent: number;
    reportsReceived: number;
    reportsMade: number;
  };
  posts: Array<{
    id: string;
    title: string;
    description: string;
    postType: string;
    durationType: string;
    tags: string[];
    location: string;
    isActive: boolean;
    isFlagged: boolean;
    flagReason: string;
    createdAt: string;
    updatedAt: string;
    images: Array<{ url: string; order: number }>;
    conversationCount: number;
  }>;
}

export default function AdminUserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // Authorization check
  useEffect(() => {
    checkAdminAuthorization();
  }, []);

  const checkAdminAuthorization = async () => {
    try {
      if (!user) {
        router.push('/home');
        return;
      }
      
      const isAuthorizedAdmin = user.email === 'lmckeown@calpoly.edu' || user.username === 'liam_mckeown38';
      
      if (!isAuthorizedAdmin) {
        router.push('/home');
        return;
      }

      setIsAuthorized(true);
      loadUserProfile();
    } catch (error) {
      console.error('Authorization error:', error);
      router.push('/home');
    }
  };

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const data = await apiService.adminGetUserProfile(userId);
      setProfile(data);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      alert('Failed to load user profile');
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!profile) return;
    
    const reason = prompt('Enter the reason for banning this user:');
    if (!reason) return;

    const confirmed = confirm(`Are you sure you want to ban ${profile.user.displayName}? This action will deactivate their account and hide all their posts.`);
    if (!confirmed) return;

    try {
      await apiService.adminBanUser(userId, reason);
      alert('User banned successfully');
      loadUserProfile();
    } catch (error) {
      console.error('Failed to ban user:', error);
      alert('Failed to ban user. Please try again.');
    }
  };

  const handleDeletePost = async (postId: string, postTitle: string) => {
    const confirmed = confirm(`Are you sure you want to delete the post "${postTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    try {
      await apiService.adminDeletePost(postId);
      alert('Post deleted successfully');
      loadUserProfile();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  if (!isAuthorized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#708d81' }}></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#000000' }}>
          <div className="text-center">
            <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: '#f59e0b' }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: '#ffffff' }}>User Not Found</h2>
            <button
              onClick={() => router.push('/admin/users')}
              className="mt-4 px-6 py-2 rounded-lg font-medium"
              style={{ backgroundColor: '#708d81', color: '#ffffff' }}
            >
              Back to Users
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#000000', paddingBottom: '100px' }}>
        {/* Header */}
        <div className="sticky top-0 z-10 border-b" style={{ backgroundColor: '#000000', borderColor: '#525252' }}>
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/users')}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <ArrowLeft size={24} style={{ color: '#ffffff' }} />
              </button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold" style={{ color: '#ffffff' }}>User Profile</h1>
                <p className="text-sm" style={{ color: '#9ca3af' }}>
                  {profile.user.university.name} • Viewing as Admin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          {/* User Info Card */}
          <div 
            className="rounded-lg p-6"
            style={{ 
              backgroundColor: '#1a1a1a',
              border: `2px solid ${profile.user.isBanned ? '#dc2626' : '#525252'}`
            }}
          >
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                {profile.user.profilePicture ? (
                  <img
                    src={profile.user.profilePicture}
                    alt={profile.user.displayName}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-32 h-32 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#262626' }}
                  >
                    <Users size={64} style={{ color: '#708d81' }} />
                  </div>
                )}
              </div>

              {/* User Details */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-3xl font-bold" style={{ color: '#ffffff' }}>
                      {profile.user.displayName}
                    </h2>
                    {profile.user.isVerified && (
                      <CheckCircle size={24} style={{ color: '#10b981' }} />
                    )}
                  </div>
                  <p className="text-lg mb-2" style={{ color: '#9ca3af' }}>@{profile.user.username}</p>
                  {profile.user.isBanned && (
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg" style={{ backgroundColor: '#7f1d1d' }}>
                      <Ban size={16} style={{ color: '#dc2626' }} />
                      <span className="font-semibold" style={{ color: '#dc2626' }}>
                        BANNED: {profile.user.banReason}
                      </span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Mail size={16} style={{ color: '#9ca3af' }} />
                    <span style={{ color: '#ffffff' }}>{profile.user.email}</span>
                  </div>
                  {profile.user.major && (
                    <div className="flex items-center space-x-2">
                      <GraduationCap size={16} style={{ color: '#9ca3af' }} />
                      <span style={{ color: '#ffffff' }}>{profile.user.major}</span>
                    </div>
                  )}
                  {profile.user.year && (
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} style={{ color: '#9ca3af' }} />
                      <span style={{ color: '#ffffff' }}>{profile.user.year}</span>
                    </div>
                  )}
                  {profile.user.hometown && (
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} style={{ color: '#9ca3af' }} />
                      <span style={{ color: '#ffffff' }}>{profile.user.hometown}</span>
                    </div>
                  )}
                </div>

                {profile.user.bio && (
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#9ca3af' }}>Bio:</p>
                    <p style={{ color: '#ffffff' }}>{profile.user.bio}</p>
                  </div>
                )}

                <div className="text-xs" style={{ color: '#9ca3af' }}>
                  Member since {new Date(profile.user.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              {/* Admin Actions */}
              <div className="flex-shrink-0 space-y-2">
                {!profile.user.isBanned && (
                  <button
                    onClick={handleBanUser}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                    style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                  >
                    <UserX size={16} />
                    <span>Ban User</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="rounded-lg p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #525252' }}>
              <FileText size={24} className="mb-2" style={{ color: '#3b82f6' }} />
              <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{profile.statistics.activePosts}</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Active Posts</p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #525252' }}>
              <FileText size={24} className="mb-2" style={{ color: '#6b7280' }} />
              <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{profile.statistics.totalPosts}</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Total Posts</p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #525252' }}>
              <MessageSquare size={24} className="mb-2" style={{ color: '#8b5cf6' }} />
              <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{profile.statistics.messagesSent}</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Messages Sent</p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #525252' }}>
              <Flag size={24} className="mb-2" style={{ color: '#f59e0b' }} />
              <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{profile.statistics.reportsReceived}</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Reports Received</p>
            </div>
            <div className="rounded-lg p-4" style={{ backgroundColor: '#1a1a1a', border: '1px solid #525252' }}>
              <Flag size={24} className="mb-2" style={{ color: '#10b981' }} />
              <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{profile.statistics.reportsMade}</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Reports Made</p>
            </div>
          </div>

          {/* Posts Section */}
          <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1a1a' }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>
              All Posts ({profile.posts.length})
            </h2>

            {profile.posts.length === 0 ? (
              <div className="text-center py-12">
                <FileText size={48} className="mx-auto mb-4" style={{ color: '#9ca3af' }} />
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#ffffff' }}>No Posts Yet</h3>
                <p style={{ color: '#9ca3af' }}>This user hasn't created any posts.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.posts.map((post) => (
                  <div
                    key={post.id}
                    className="rounded-lg p-4"
                    style={{
                      backgroundColor: '#262626',
                      border: `2px solid ${post.isFlagged ? '#dc2626' : !post.isActive ? '#f59e0b' : '#525252'}`
                    }}
                  >
                    <div className="flex gap-4">
                      {/* Post Image */}
                      {post.images && post.images.length > 0 ? (
                        <img
                          src={post.images[0].url}
                          alt={post.title}
                          className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div 
                          className="w-24 h-24 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#1a1a1a' }}
                        >
                          <ImageIcon size={32} style={{ color: '#9ca3af' }} />
                        </div>
                      )}

                      {/* Post Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg mb-1 truncate" style={{ color: '#ffffff' }}>
                              {post.title}
                            </h3>
                            <p className="text-sm line-clamp-2 mb-2" style={{ color: '#9ca3af' }}>
                              {post.description}
                            </p>
                          </div>
                          <div className="flex flex-col items-end space-y-1 ml-4">
                            {!post.isActive && (
                              <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: '#f59e0b', color: '#ffffff' }}>
                                INACTIVE
                              </span>
                            )}
                            {post.isFlagged && (
                              <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: '#dc2626', color: '#ffffff' }}>
                                FLAGGED
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3 text-sm">
                          <div className="flex items-center space-x-1 px-2 py-1 rounded" style={{ backgroundColor: '#3b82f620', color: '#3b82f6' }}>
                            <span className="font-medium">{post.postType}</span>
                          </div>
                          {post.tags && post.tags.length > 0 && (
                            <>
                              {post.tags.slice(0, 3).map((tag, idx) => (
                                <div key={idx} className="flex items-center space-x-1 px-2 py-1 rounded" style={{ backgroundColor: '#708d8120', color: '#708d81' }}>
                                  <Tag size={12} />
                                  <span>{tag}</span>
                                </div>
                              ))}
                              {post.tags.length > 3 && (
                                <span style={{ color: '#9ca3af' }}>+{post.tags.length - 3} more</span>
                              )}
                            </>
                          )}
                          {post.location && (
                            <div className="flex items-center space-x-1" style={{ color: '#9ca3af' }}>
                              <MapPinned size={14} />
                              <span>{post.location}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1" style={{ color: '#9ca3af' }}>
                            <MessageSquare size={14} />
                            <span>{post.conversationCount} conversations</span>
                          </div>
                        </div>

                        {post.isFlagged && post.flagReason && (
                          <div className="mb-3 p-2 rounded" style={{ backgroundColor: '#7f1d1d' }}>
                            <p className="text-xs" style={{ color: '#dc2626' }}>
                              <strong>Flag Reason:</strong> {post.flagReason}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-xs" style={{ color: '#71717a' }}>
                            Posted {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleDeletePost(post.id, post.title)}
                            className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                            style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

