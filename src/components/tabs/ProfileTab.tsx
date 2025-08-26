'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePostsStore } from '@/stores/postsStore';
import { 
  Edit, 
  Settings, 
  Bookmark, 
  Check, 
  Trash2, 
  User,
  Calendar,
  MapPin,
  GraduationCap,
  Home
} from 'lucide-react';
import { formatDate, getPostTypeLabel, getPostTypeColor, getGradeColor } from '@/utils';

export default function ProfileTab() {
  const { user, updateUser } = useAuthStore();
  const { getUserPosts, getUserBookmarks } = usePostsStore();
  
  const [activeTab, setActiveTab] = useState<'posts' | 'bookmarks'>('posts');
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    hometown: user?.hometown || '',
    year: user?.year || undefined,
    major: user?.major || '',
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // In a real app, these would be API calls
      // For now, using mock data
      const mockPosts = [
        {
          id: 1,
          title: 'Looking for roommate',
          description: 'Need a roommate for next semester...',
          postType: 'request',
          createdAt: new Date().toISOString(),
          isFulfilled: false,
          relativeGrade: 'A',
        },
        {
          id: 2,
          title: 'Selling textbooks',
          description: 'Various textbooks for sale...',
          postType: 'offer',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isFulfilled: true,
          relativeGrade: 'B',
        }
      ];
      
      setUserPosts(mockPosts);
      setBookmarkedPosts([]);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateUser(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      displayName: user?.displayName || '',
      hometown: user?.hometown || '',
      year: user?.year || undefined,
      major: user?.major || '',
    });
    setIsEditing(false);
  };

  const handlePostSelect = (postId: number) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleFulfillPosts = () => {
    setShowFulfillModal(true);
  };

  const confirmFulfillPosts = () => {
    // Remove selected posts
    const newPosts = userPosts.filter(post => !selectedPosts.has(post.id));
    setUserPosts(newPosts);
    setSelectedPosts(new Set());
    setShowFulfillModal(false);
  };

  const handleDeletePost = (postId: number) => {
    const newPosts = userPosts.filter(post => post.id !== postId);
    setUserPosts(newPosts);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Profile Picture */}
              <div className="relative">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.displayName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                      className="text-xl font-semibold text-gray-900 bg-gray-50 border border-gray-300 rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      value={editForm.hometown}
                      onChange={(e) => setEditForm(prev => ({ ...prev, hometown: e.target.value }))}
                      placeholder="Hometown"
                      className="text-sm text-gray-600 bg-gray-50 border border-gray-300 rounded px-2 py-1"
                    />
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={editForm.year || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, year: parseInt(e.target.value) || undefined }))}
                        placeholder="Year"
                        min="1"
                        max="6"
                        className="text-sm text-gray-600 bg-gray-50 border border-gray-300 rounded px-2 py-1 w-20"
                      />
                      <input
                        type="text"
                        value={editForm.major}
                        onChange={(e) => setEditForm(prev => ({ ...prev, major: e.target.value }))}
                        placeholder="Major"
                        className="text-sm text-gray-600 bg-gray-50 border border-gray-300 rounded px-2 py-1 flex-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{user.displayName}</h1>
                    <p className="text-sm text-gray-600">{user.universityName}</p>
                    {user.hometown && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.hometown}
                      </div>
                    )}
                    {(user.year || user.major) && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        {user.year && `Year ${user.year}`}
                        {user.year && user.major && ' • '}
                        {user.major}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEditProfile}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Edit Profile"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {/* TODO: Navigate to settings */}}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{userPosts.length}</div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{bookmarkedPosts.length}</div>
              <div className="text-sm text-gray-500">Bookmarks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {userPosts.filter(post => post.isFulfilled).length}
              </div>
              <div className="text-sm text-gray-500">Fulfilled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Posts
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'bookmarks'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bookmark className="w-4 h-4 inline mr-2" />
            Bookmarks
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'posts' && (
          <div>
            {/* Posts Actions */}
            {userPosts.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedPosts.size} post{selectedPosts.size !== 1 ? 's' : ''} selected
                  </span>
                </div>
                {selectedPosts.size > 0 && (
                  <button
                    onClick={handleFulfillPosts}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Fulfill Selected</span>
                  </button>
                )}
              </div>
            )}

            {/* Posts List */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No posts yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first post to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userPosts.map(post => (
                  <div
                    key={post.id}
                    className={`bg-white rounded-lg border border-gray-200 p-4 ${
                      selectedPosts.has(post.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedPosts.has(post.id)}
                            onChange={() => handlePostSelect(post.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPostTypeColor(post.postType)}`}>
                            {getPostTypeLabel(post.postType)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(post.relativeGrade)}`}>
                            Grade: {post.relativeGrade}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{post.description}</p>
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span>{formatDate(post.createdAt)}</span>
                          {post.isFulfilled && (
                            <span className="text-green-600 font-medium">✓ Fulfilled</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {/* TODO: Edit post */}}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          title="Edit post"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div>
            {bookmarkedPosts.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500">No bookmarked posts</p>
                <p className="text-sm text-gray-400 mt-1">Posts you bookmark will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarkedPosts.map(post => (
                  <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    {/* Bookmarked post content would go here */}
                    <p className="text-gray-500">Bookmarked post content</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fulfill Confirmation Modal */}
      {showFulfillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fulfill Posts</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to mark {selectedPosts.size} post{selectedPosts.size !== 1 ? 's' : ''} as fulfilled? 
              This action will permanently delete these posts.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFulfillModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmFulfillPosts}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirm Fulfill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePostsStore } from '@/stores/postsStore';
import { 
  Edit, 
  Settings, 
  Bookmark, 
  Check, 
  Trash2, 
  User,
  Calendar,
  MapPin,
  GraduationCap,
  Home
} from 'lucide-react';
import { formatDate, getPostTypeLabel, getPostTypeColor, getGradeColor } from '@/utils';

export default function ProfileTab() {
  const { user, updateUser } = useAuthStore();
  const { getUserPosts, getUserBookmarks } = usePostsStore();
  
  const [activeTab, setActiveTab] = useState<'posts' | 'bookmarks'>('posts');
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());
  const [showFulfillModal, setShowFulfillModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    hometown: user?.hometown || '',
    year: user?.year || undefined,
    major: user?.major || '',
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // In a real app, these would be API calls
      // For now, using mock data
      const mockPosts = [
        {
          id: 1,
          title: 'Looking for roommate',
          description: 'Need a roommate for next semester...',
          postType: 'request',
          createdAt: new Date().toISOString(),
          isFulfilled: false,
          relativeGrade: 'A',
        },
        {
          id: 2,
          title: 'Selling textbooks',
          description: 'Various textbooks for sale...',
          postType: 'offer',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isFulfilled: true,
          relativeGrade: 'B',
        }
      ];
      
      setUserPosts(mockPosts);
      setBookmarkedPosts([]);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      await updateUser(editForm);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      displayName: user?.displayName || '',
      hometown: user?.hometown || '',
      year: user?.year || undefined,
      major: user?.major || '',
    });
    setIsEditing(false);
  };

  const handlePostSelect = (postId: number) => {
    const newSelected = new Set(selectedPosts);
    if (newSelected.has(postId)) {
      newSelected.delete(postId);
    } else {
      newSelected.add(postId);
    }
    setSelectedPosts(newSelected);
  };

  const handleFulfillPosts = () => {
    setShowFulfillModal(true);
  };

  const confirmFulfillPosts = () => {
    // Remove selected posts
    const newPosts = userPosts.filter(post => !selectedPosts.has(post.id));
    setUserPosts(newPosts);
    setSelectedPosts(new Set());
    setShowFulfillModal(false);
  };

  const handleDeletePost = (postId: number) => {
    const newPosts = userPosts.filter(post => post.id !== postId);
    setUserPosts(newPosts);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              {/* Profile Picture */}
              <div className="relative">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.displayName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-blue-600" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.displayName}
                      onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                      className="text-xl font-semibold text-gray-900 bg-gray-50 border border-gray-300 rounded px-2 py-1"
                    />
                    <input
                      type="text"
                      value={editForm.hometown}
                      onChange={(e) => setEditForm(prev => ({ ...prev, hometown: e.target.value }))}
                      placeholder="Hometown"
                      className="text-sm text-gray-600 bg-gray-50 border border-gray-300 rounded px-2 py-1"
                    />
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={editForm.year || ''}
                        onChange={(e) => setEditForm(prev => ({ ...prev, year: parseInt(e.target.value) || undefined }))}
                        placeholder="Year"
                        min="1"
                        max="6"
                        className="text-sm text-gray-600 bg-gray-50 border border-gray-300 rounded px-2 py-1 w-20"
                      />
                      <input
                        type="text"
                        value={editForm.major}
                        onChange={(e) => setEditForm(prev => ({ ...prev, major: e.target.value }))}
                        placeholder="Major"
                        className="text-sm text-gray-600 bg-gray-50 border border-gray-300 rounded px-2 py-1 flex-1"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{user.displayName}</h1>
                    <p className="text-sm text-gray-600">{user.universityName}</p>
                    {user.hometown && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {user.hometown}
                      </div>
                    )}
                    {(user.year || user.major) && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        {user.year && `Year ${user.year}`}
                        {user.year && user.major && ' • '}
                        {user.major}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSaveProfile}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEditProfile}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Edit Profile"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {/* TODO: Navigate to settings */}}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{userPosts.length}</div>
              <div className="text-sm text-gray-500">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{bookmarkedPosts.length}</div>
              <div className="text-sm text-gray-500">Bookmarks</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {userPosts.filter(post => post.isFulfilled).length}
              </div>
              <div className="text-sm text-gray-500">Fulfilled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'posts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Posts
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'bookmarks'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bookmark className="w-4 h-4 inline mr-2" />
            Bookmarks
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'posts' && (
          <div>
            {/* Posts Actions */}
            {userPosts.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedPosts.size} post{selectedPosts.size !== 1 ? 's' : ''} selected
                  </span>
                </div>
                {selectedPosts.size > 0 && (
                  <button
                    onClick={handleFulfillPosts}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Fulfill Selected</span>
                  </button>
                )}
              </div>
            )}

            {/* Posts List */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No posts yet</p>
                <p className="text-sm text-gray-400 mt-1">Create your first post to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userPosts.map(post => (
                  <div
                    key={post.id}
                    className={`bg-white rounded-lg border border-gray-200 p-4 ${
                      selectedPosts.has(post.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            checked={selectedPosts.has(post.id)}
                            onChange={() => handlePostSelect(post.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPostTypeColor(post.postType)}`}>
                            {getPostTypeLabel(post.postType)}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(post.relativeGrade)}`}>
                            Grade: {post.relativeGrade}
                          </span>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{post.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{post.description}</p>
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span>{formatDate(post.createdAt)}</span>
                          {post.isFulfilled && (
                            <span className="text-green-600 font-medium">✓ Fulfilled</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => {/* TODO: Edit post */}}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          title="Edit post"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div>
            {bookmarkedPosts.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <p className="text-gray-500">No bookmarked posts</p>
                <p className="text-sm text-gray-400 mt-1">Posts you bookmark will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookmarkedPosts.map(post => (
                  <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    {/* Bookmarked post content would go here */}
                    <p className="text-gray-500">Bookmarked post content</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fulfill Confirmation Modal */}
      {showFulfillModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Fulfill Posts</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to mark {selectedPosts.size} post{selectedPosts.size !== 1 ? 's' : ''} as fulfilled? 
              This action will permanently delete these posts.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFulfillModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmFulfillPosts}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirm Fulfill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 