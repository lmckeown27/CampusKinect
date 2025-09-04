'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Edit2, Camera, X } from 'lucide-react';
import { apiService } from '../../services/api';
import { Post, CreatePostForm, User } from '../../types';
import PostCard from '../ui/PostCard';
import EditPostModal from '../ui/EditPostModal';

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

const ProfileTab: React.FC = () => {
  const { user: authUser, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'reposts' | 'bookmarks'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Load saved active tab from localStorage on component mount
  useEffect(() => {
    const savedActiveTab = localStorage.getItem('campusConnect_profileActiveTab');
    if (savedActiveTab && ['posts', 'reposts', 'bookmarks'].includes(savedActiveTab)) {
      setActiveTab(savedActiveTab as 'posts' | 'reposts' | 'bookmarks');
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('campusConnect_profileActiveTab', activeTab);
  }, [activeTab]);

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use real user data from auth store
  const [user, setUser] = useState<User | null>(() => {
    if (authUser) {
      return authUser;
    }
    return null;
  });
  
  // Load saved profile data and sync with auth user
  useEffect(() => {
    if (authUser) {
      const savedProfile = localStorage.getItem('campusConnect_profile');
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          // Merge saved profile data but preserve core user fields from authUser
          const updatedUser = { 
            ...authUser, 
            ...parsedProfile,
            // Always preserve these core fields from authUser
            id: authUser.id,
            username: authUser.username,
            email: authUser.email,
            createdAt: authUser.createdAt
          };
          setUser(updatedUser);
          
          // Also update editForm with the loaded data
          setEditForm({
            firstName: updatedUser.firstName || '',
            lastName: updatedUser.lastName || '',
            major: updatedUser.major || '',
            year: updatedUser.year || 1,
            hometown: updatedUser.hometown || '',
            biography: updatedUser.bio || '',
          });
        } catch (error) {
          console.error('Failed to parse saved profile:', error);
          // Set editForm with real user data if parsing fails
          setEditForm({
            firstName: authUser.firstName || '',
            lastName: authUser.lastName || '',
            major: authUser.major || '',
            year: authUser.year || 1,
            hometown: authUser.hometown || '',
            biography: authUser.bio || '',
          });
        }
      } else {
        // No saved profile, use real user data
        setUser(authUser);
        setEditForm({
          firstName: authUser.firstName || '',
          lastName: authUser.lastName || '',
          major: authUser.major || '',
          year: authUser.year || 1,
          hometown: authUser.hometown || '',
          biography: authUser.bio || '',
        });
      }
    }
  }, [authUser]);
  
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    major: '',
    year: 1,
    hometown: '',
    biography: '',
  });
  
  const years = [
    { value: 1, label: 'Freshman' },
    { value: 2, label: 'Sophomore' },
    { value: 3, label: 'Junior' },
    { value: 4, label: 'Senior' },
    { value: 5, label: 'Super Senior' }
  ];

  // Function to fetch user's posts
  const fetchUserPosts = async () => {
    if (!authUser?.id || postsLoaded) return;
    
    setLoading(true);
    try {
      const response = await apiService.getUserPosts(authUser.id.toString());
      setPosts(response.data);
      setPostsLoaded(true);
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch posts when user is available and activeTab is 'posts'
  useEffect(() => {
    if (authUser && activeTab === 'posts' && !postsLoaded) {
      fetchUserPosts();
    }
  }, [authUser, activeTab, postsLoaded]);

  // Refresh posts function to be called when new post is created
  const refreshPosts = () => {
    setPostsLoaded(false);
    setPosts([]);
  };

  // Expose refresh function globally for other components to use
  useEffect(() => {
    (window as any).refreshUserPosts = refreshPosts;
    
    return () => {
      delete (window as any).refreshUserPosts;
    };
  }, []);

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    try {
      await apiService.deletePost(postId);
      // Remove the deleted post from the posts state
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      // Show success message
      alert('Post deleted successfully');
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  // Handle post editing
  const handleEditPost = (postId: string, currentData: Post) => {
    setEditingPost(currentData);
    setEditModalOpen(true);
  };

  const handleSaveEdit = async (postId: string, formData: Partial<CreatePostForm>) => {
    try {
      await apiService.updatePost(postId, formData);
      // Refresh posts to show updated data
      setPostsLoaded(false);
      setPosts([]);
      alert('Post updated successfully');
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post. Please try again.');
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingPost(null);
  };

  const handleSaveProfile = async () => {
    try {
      // Transform editForm to match API expectations
      const updateData = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        year: editForm.year,
        major: editForm.major,
        hometown: editForm.hometown,
        bio: editForm.biography // Map biography to bio
      };
      
      // Update profile via API
      await updateUser(updateData);
      
      // Update local state immediately
      setUser((prevUser: User | null) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          major: editForm.major,
          year: editForm.year,
          hometown: editForm.hometown,
          bio: editForm.biography
        };
      });
      
      // Save to localStorage as backup
      localStorage.setItem('campusConnect_profile', JSON.stringify(editForm));
      
      // Exit edit mode
      setIsEditing(false);
      
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        
        // Create a canvas to crop the image into a circle
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          // Set canvas size to a square (use the smaller dimension)
          const size = Math.min(img.width, img.height);
          canvas.width = size;
          canvas.height = size;
          
          // Create circular clipping path
          ctx.beginPath();
          ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          ctx.clip();
          
          // Calculate cropping position to center the image
          const offsetX = (img.width - size) / 2;
          const offsetY = (img.height - size) / 2;
          
          // Draw the image centered and cropped
          ctx.drawImage(img, -offsetX, -offsetY, img.width, img.height);
          
          // Convert canvas to data URL
          const croppedImageUrl = canvas.toDataURL('image/png');
          
          setUser((prevUser: User | null) => {
            if (!prevUser) return null;
            return {
              ...prevUser,
              profileImage: croppedImageUrl
            };
          });
          
          // Update auth store immediately for real-time updates across platform
          if (authUser) {
            updateUser({ profileImage: croppedImageUrl });
          }
          
          // Save image to localStorage
          const currentProfile = JSON.parse(localStorage.getItem('campusConnect_profile') || '{}');
          localStorage.setItem('campusConnect_profile', JSON.stringify({
            ...currentProfile,
            profileImage: croppedImageUrl
          }));
        };
        img.src = imageUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Show loading state if no user data
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9f6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#708d81] mx-auto mb-4"></div>
          <p className="text-[#708d81]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9f6', paddingTop: '20px', paddingBottom: '100px' }}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: '#e5e7eb', // gray-200
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d1d5db'; // light grey (gray-300)
                  e.currentTarget.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb'; // return to gray-200
                  e.currentTarget.style.cursor = 'pointer';
                }}
              >
                {user?.profileImage ? (
                  <img 
                    src={user.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover transition-opacity duration-200"
                    style={{ opacity: 1 }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8'; // Slightly fade image on hover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1'; // Return to full opacity
                    }}
                  />
                ) : (
                  <Camera 
                    size={24} 
                    className="text-gray-400 transition-colors duration-200"
                    style={{ color: '#9ca3af' }} // gray-400
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#6b7280'; // darker grey (gray-500) on hover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#9ca3af'; // return to gray-400
                    }}
                  />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      placeholder="First Name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#708d81]"
                    />
                    <input
                      type="text"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      placeholder="Last Name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#708d81]"
                    />
                  </div>
                  
                  <input
                    type="text"
                    value={editForm.major}
                    onChange={(e) => setEditForm({ ...editForm, major: e.target.value })}
                    placeholder="Major"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#708d81]"
                  />
                  
                  <select
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#708d81]"
                  >
                    {years.map(year => (
                      <option key={year.value} value={year.value}>{year.label}</option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    value={editForm.hometown}
                    onChange={(e) => setEditForm({ ...editForm, hometown: e.target.value })}
                    placeholder="Hometown"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#708d81]"
                  />
                  
                  <textarea
                    value={editForm.biography}
                    onChange={(e) => setEditForm({ ...editForm, biography: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#708d81]"
                  />
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="py-4 px-6 text-lg font-semibold rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: '#708d81',
                        color: 'white',
                        border: '2px solid #708d81',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#a8c4a2';
                        e.currentTarget.style.border = '2px solid #a8c4a2';
                        e.currentTarget.style.cursor = 'pointer';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#708d81';
                        e.currentTarget.style.border = '2px solid #708d81';
                        e.currentTarget.style.cursor = 'pointer';
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="py-4 px-6 text-lg font-semibold rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: '#708d81',
                        color: 'white',
                        border: '2px solid #708d81',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#a8c4a2';
                        e.currentTarget.style.border = '2px solid #a8c4a2';
                        e.currentTarget.style.cursor = 'pointer';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#708d81';
                        e.currentTarget.style.border = '2px solid #708d81';
                        e.currentTarget.style.cursor = 'pointer';
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: '#708d81',
                        color: 'white',
                        border: '2px solid #708d81',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#a8c4a2';
                        e.currentTarget.style.border = '2px solid #a8c4a2';
                        e.currentTarget.style.cursor = 'pointer';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#708d81';
                        e.currentTarget.style.border = '2px solid #708d81';
                        e.currentTarget.style.cursor = 'pointer';
                      }}
                    >
                      <Edit2 size={20} />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 mb-1">@{user?.username || 'username'}</p>
                  <p className="text-gray-600 mb-1">{user?.email}</p>
                  
                  {user?.major && (
                    <p className="text-gray-600 mb-1">
                      <strong>Major:</strong> {user?.major}
                    </p>
                  )}
                  
                  {user?.year && (
                    <p className="text-gray-600 mb-1">
                      <strong>Year:</strong> {getYearLabel(user.year)}
                    </p>
                  )}
                  
                  {user?.hometown && (
                    <p className="text-gray-600 mb-1">
                      <strong>Hometown:</strong> {user?.hometown}
                    </p>
                  )}
                  
                  {user?.bio && (
                    <p className="text-gray-700 mt-3">
                      {user.bio}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <nav className="flex justify-center space-x-4" key="nav-buttons">
              {['posts', 'reposts', 'bookmarks'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className="py-3 px-6 font-semibold text-lg rounded-lg transition-all duration-200"
                  style={
                    activeTab === tab
                      ? {
                          backgroundColor: 'white',
                          color: '#708d81',
                          border: '2px solid #708d81',
                          cursor: 'pointer'
                        }
                      : {
                          backgroundColor: '#708d81',
                          color: 'white',
                          border: '2px solid #708d81',
                          cursor: 'pointer'
                        }
                  }
                  onMouseEnter={(e) => {
                    if (activeTab === tab) {
                      // Selected button: turn complete white on hover
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#708d81';
                      e.currentTarget.style.border = '2px solid #708d81';
                    } else {
                      // Unselected button: turn light green on hover
                      e.currentTarget.style.backgroundColor = '#a8c4a2'; // Light green
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.border = '2px solid #a8c4a2';
                    }
                    e.currentTarget.style.cursor = 'pointer';
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab === tab) {
                      // Selected button: return to white background
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.color = '#708d81';
                      e.currentTarget.style.border = '2px solid #708d81';
                    } else {
                      // Unselected button: return to olive green
                      e.currentTarget.style.backgroundColor = '#708d81';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.border = '2px solid #708d81';
                    }
                    e.currentTarget.style.cursor = 'pointer';
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <div>
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#708d81] mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your posts...</p>
                  </div>
                ) : posts.length > 0 ? (
                  <div className="space-y-8" style={{ gap: '2rem' }}>
                    {posts.map((post, index) => {
                      // Ensure post has poster information
                      const postWithPoster = {
                        ...post,
                        poster: post.poster || {
                          id: authUser?.id || 'unknown',
                          firstName: authUser?.firstName || user?.firstName || 'User',
                          lastName: authUser?.lastName || user?.lastName || '',
                          username: authUser?.username || user?.username || 'username',
                          email: authUser?.email || user?.email || '',
                          profileImage: authUser?.profileImage || user?.profileImage,
                          major: authUser?.major || user?.major,
                          year: authUser?.year || user?.year,
                          universityId: authUser?.universityId || 1,
                          createdAt: authUser?.createdAt || new Date().toISOString(),
                          updatedAt: authUser?.updatedAt || new Date().toISOString()
                        }
                      } as Post;
                      return (
                        <div key={post.id} style={{ marginBottom: index < posts.length - 1 ? '2rem' : '0' }}>
                          <PostCard 
                            post={postWithPoster} 
                            showDeleteButton={true}
                            onDelete={handleDeletePost}
                            showEditButton={true}
                            onEdit={handleEditPost}
                          />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">You haven't created any posts yet.</p>
                    <p className="text-gray-400">Share something with your campus community!</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'reposts' && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">You haven't reposted anything yet.</p>
                <p className="text-gray-400">Repost content you find interesting.</p>
              </div>
            )}
            
            {activeTab === 'bookmarks' && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg mb-4">You haven't bookmarked any posts yet.</p>
                <p className="text-gray-400">Save posts you want to revisit later.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          isOpen={editModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

export default ProfileTab; 