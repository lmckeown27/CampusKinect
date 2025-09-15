'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Edit2, Camera, X, Repeat, Bookmark } from 'lucide-react';
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
  const authStore = useAuthStore();
  const { user: authUser, updateUser } = authStore;
  const [activeTab, setActiveTab] = useState<'posts' | 'reposts' | 'bookmarks'>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [reposts, setReposts] = useState<Post[]>([]);
  const [bookmarks, setBookmarks] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(false);
  const [repostsLoaded, setRepostsLoaded] = useState(false);
  const [bookmarksLoaded, setBookmarksLoaded] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  // Load saved active tab from sessionStorage on component mount (user-specific)
  useEffect(() => {
    if (authUser?.id) {
      const savedActiveTab = sessionStorage.getItem(`campusConnect_profileActiveTab_${authUser.id}`);
      if (savedActiveTab && ['posts', 'reposts', 'bookmarks'].includes(savedActiveTab)) {
        setActiveTab(savedActiveTab as 'posts' | 'reposts' | 'bookmarks');
      }
    }
  }, [authUser?.id]);

  // Save active tab to sessionStorage whenever it changes (user-specific)
  useEffect(() => {
    if (authUser?.id) {
      sessionStorage.setItem(`campusConnect_profileActiveTab_${authUser.id}`, activeTab);
    }
  }, [activeTab, authUser?.id]);

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use real user data from auth store
  const [user, setUser] = useState<User | null>(() => {
    if (authUser) {
      return authUser;
    }
    return null;
  });
  
  // Load saved profile data and sync with auth user (user-specific)
  useEffect(() => {
    if (authUser) {
      const savedProfile = sessionStorage.getItem(`campusConnect_profile_${authUser.id}`);
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
            createdAt: authUser.createdAt,
            // Always use profilePicture from authUser (most up-to-date)
            profilePicture: authUser.profilePicture
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
  
  // Sync auth store changes to local user state (important for profile picture persistence)
  useEffect(() => {
    if (authUser) {
      setUser(prevUser => ({
        ...prevUser,
        ...authUser,
        // Preserve any local form edits but ensure profilePicture is from auth store
        profilePicture: authUser.profilePicture
      }));
    }
  }, [authUser?.profilePicture]);
  
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

  // Fetch user reposts
  const fetchUserReposts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserReposts();
      console.log('🔄 Fetched reposts:', response.data.length, 'posts');
      console.log('🔄 First repost:', response.data[0]);
      setReposts(response.data);
      setRepostsLoaded(true);
    } catch (error) {
      console.error('Failed to fetch user reposts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user bookmarks
  const fetchUserBookmarks = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserBookmarks();
      console.log('📚 Fetched bookmarks:', response.data.length, 'posts');
      console.log('📚 First bookmark:', response.data[0]);
      setBookmarks(response.data);
      setBookmarksLoaded(true);
    } catch (error) {
      console.error('Failed to fetch user bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data based on active tab
  useEffect(() => {
    if (authUser) {
      if (activeTab === 'posts' && !postsLoaded) {
        fetchUserPosts();
      } else if (activeTab === 'reposts' && !repostsLoaded) {
        fetchUserReposts();
      } else if (activeTab === 'bookmarks' && !bookmarksLoaded) {
        fetchUserBookmarks();
      }
    }
  }, [authUser, activeTab, postsLoaded, repostsLoaded, bookmarksLoaded]);

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

  // Memoized posts with poster data to prevent infinite renders
  const postsWithPoster = useMemo(() => {
    return posts.map(post => {
      if (post.poster) {
        return post;
      }
      
      // Create default poster only when needed
      return {
        ...post,
        poster: {
          id: authUser?.id || 'unknown',
          firstName: authUser?.firstName || user?.firstName || 'User',
          lastName: authUser?.lastName || user?.lastName || '',
          username: authUser?.username || user?.username || 'username',
          email: authUser?.email || user?.email || '',
          profilePicture: authUser?.profilePicture || user?.profilePicture,
          major: authUser?.major || user?.major,
          year: authUser?.year || user?.year,
          universityId: authUser?.universityId || 1,
          createdAt: authUser?.createdAt || new Date().toISOString(),
          updatedAt: authUser?.updatedAt || new Date().toISOString()
        }
      } as Post;
    });
  }, [posts, authUser, user]);

  const handleSaveProfile = async () => {
    try {
      // Validate required fields
      if (!editForm.firstName?.trim() || !editForm.lastName?.trim()) {
        alert('First name and last name are required.');
        return;
      }

      // Validate field lengths (matching backend validation)
      if (editForm.firstName.length > 100) {
        alert('First name cannot exceed 100 characters.');
        return;
      }

      if (editForm.lastName.length > 100) {
        alert('Last name cannot exceed 100 characters.');
        return;
      }

      if (editForm.major && editForm.major.length > 200) {
        alert('Major cannot exceed 200 characters.');
        return;
      }

      if (editForm.hometown && editForm.hometown.length > 200) {
        alert('Hometown cannot exceed 200 characters.');
        return;
      }

      if (editForm.biography && editForm.biography.length > 500) {
        alert('Bio cannot exceed 500 characters.');
        return;
      }

      if (editForm.year < 1 || editForm.year > 10) {
        alert('Year must be between 1 and 10.');
        return;
      }

      // Validate names contain only letters (matching backend validation)
      const nameRegex = /^[A-Za-z]+$/;
      if (!nameRegex.test(editForm.firstName.trim())) {
        alert('First name must contain only letters.');
        return;
      }

      if (!nameRegex.test(editForm.lastName.trim())) {
        alert('Last name must contain only letters.');
        return;
      }

      // Transform editForm to match API expectations
      const updateData = {
        firstName: editForm.firstName.trim(),
        lastName: editForm.lastName.trim(),
        year: parseInt(editForm.year.toString()), // Ensure it's a number
        major: editForm.major?.trim() || undefined,
        hometown: editForm.hometown?.trim() || undefined,
        bio: editForm.biography?.trim() || undefined // Map biography to bio
      };

      // Remove undefined values to avoid sending empty strings
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined || updateData[key as keyof typeof updateData] === '') {
          delete updateData[key as keyof typeof updateData];
        }
      });

      console.log('Sending profile update:', updateData);
      
      // Update profile via API (using the working authStore pattern)
      await updateUser(updateData);
      
      // Update local state immediately
      setUser((prevUser: User | null) => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          firstName: updateData.firstName,
          lastName: updateData.lastName,
          major: updateData.major || prevUser.major,
          year: updateData.year,
          hometown: updateData.hometown || prevUser.hometown,
          bio: updateData.bio || prevUser.bio
        };
      });
      
      // Save to sessionStorage as backup (user-specific)
      if (authUser?.id) {
        sessionStorage.setItem(`campusConnect_profile_${authUser.id}`, JSON.stringify(editForm));
      }
      
      // Exit edit mode
      setIsEditing(false);
      
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      
      // Provide more specific error messages
      if (error.message) {
        alert(`Failed to update profile: ${error.message}`);
      } else {
        alert('Failed to update profile. Please try again.');
      }
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
          
          // Fill canvas with white background first
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, size, size);
          
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
          
          // Convert data URL to File for upload
          const dataURLtoFile = (dataURL: string, filename: string): File => {
            const arr = dataURL.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            return new File([u8arr], filename, { type: mime });
          };

          // Upload to backend and update database
          (async () => {
            try {
              const file = dataURLtoFile(croppedImageUrl, 'profile-picture.png');
              
              // Upload image to backend
              const uploadResult = await apiService.uploadImage(file);
              const profilePictureUrl = uploadResult.url;
              
              // Update user profile picture in database
              const updatedUser = await apiService.updateProfilePicture(profilePictureUrl);
              
              // Update local state with backend URL
              setUser((prevUser: User | null) => {
                if (!prevUser) return null;
                return {
                  ...prevUser,
                  profilePicture: profilePictureUrl // Use backend URL consistently
                };
              });
              
              // Update global auth store so all components see the new profile picture
              if (authUser && authUser.id === user?.id) {
                // Use dedicated profile picture update function for safety
                // This ensures PostCard, UserProfileTab, and other components see the change
                await authStore.updateProfilePicture(profilePictureUrl);
              }
              
              console.log('Profile picture uploaded successfully:', profilePictureUrl);
              
            } catch (error) {
              console.error('Failed to upload profile picture:', error);
              alert('Failed to upload profile picture. Please try again.');
              
              // Fallback: still update local display only
              setUser((prevUser: User | null) => {
                if (!prevUser) return null;
                return {
                  ...prevUser,
                  profilePicture: croppedImageUrl
                };
              });
            }
          })();
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
        <div className="bg-grey-light rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden transition-all duration-200"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: '#737373', // white background
                  cursor: 'pointer',
                  border: '2px solid #e5e7eb' // add subtle border
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb'; // very light gray hover
                  e.currentTarget.style.borderColor = '#d1d5db'; // darker border on hover
                  e.currentTarget.style.cursor = 'pointer';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF'; // return to white
                  e.currentTarget.style.borderColor = '#e5e7eb'; // return to original border
                  e.currentTarget.style.cursor = 'pointer';
                }}
              >
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
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
                    {/* EDIT PROFILE BUTTON COMMENTED OUT - User will fix locally */}
                    {/*
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
                    */}
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
                  <div className="bg-grey-light rounded-lg shadow-sm">
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
                          backgroundColor: '#737373',
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
                      e.currentTarget.style.backgroundColor = '#737373';
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
                      e.currentTarget.style.backgroundColor = '#737373';
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
                    {postsWithPoster.map((post, index) => (
                      <div key={post.id} style={{ marginBottom: index < postsWithPoster.length - 1 ? '2rem' : '0' }}>
                        <PostCard 
                          post={post} 
                          showDeleteButton={true}
                          onDelete={handleDeletePost}
                          showEditButton={true}
                          onEdit={handleEditPost}
                        />
                      </div>
                    ))}
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
              <div>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Loading your reposts...</p>
                  </div>
                ) : reposts.length > 0 ? (
                  <div className="space-y-6">
                    {reposts.map((post, index) => (
                      <div key={`repost-${post.id}-${index}`} className="relative">
                        {/* Repost indicator */}
                        <div className="flex items-center space-x-2 text-gray-500 text-sm mb-3">
                          <Repeat size={16} />
                          <span>You reposted</span>
                        </div>
                        <PostCard 
                          post={post}
                          showDeleteButton={false}
                          showEditButton={false}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">You haven't reposted anything yet.</p>
                    <p className="text-gray-400">Repost content you find interesting.</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'bookmarks' && (
              <div>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Loading your bookmarks...</p>
                  </div>
                ) : bookmarks.length > 0 ? (
                  <div className="space-y-6">
                    {bookmarks.map((post, index) => (
                      <div key={`bookmark-${post.id}-${index}`} className="relative">
                        {/* Bookmark indicator */}
                        <div className="flex items-center space-x-2 text-gray-500 text-sm mb-3">
                          <Bookmark size={16} />
                          <span>You bookmarked</span>
                        </div>
                        <PostCard 
                          post={post}
                          showDeleteButton={false}
                          showEditButton={false}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">You haven't bookmarked any posts yet.</p>
                    <p className="text-gray-400">Save posts you want to revisit later.</p>
                  </div>
                )}
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