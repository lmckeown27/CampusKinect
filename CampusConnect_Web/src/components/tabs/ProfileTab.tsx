'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Edit2, Camera, X } from 'lucide-react';

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
  const [user, setUser] = useState<any>(() => {
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

  const handleSaveProfile = () => {
    // Update local state immediately
    setUser((prevUser: any) => ({
      ...prevUser,
      ...editForm
    }));
    
    // Save to localStorage
    localStorage.setItem('campusConnect_profile', JSON.stringify(editForm));
    
    // Exit edit mode
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setUser((prevUser: any) => ({
          ...prevUser,
          profileImage: imageUrl
        }));
        
        // Save image to localStorage
        const currentProfile = JSON.parse(localStorage.getItem('campusConnect_profile') || '{}');
        localStorage.setItem('campusConnect_profile', JSON.stringify({
          ...currentProfile,
          profileImage: imageUrl
        }));
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
                  
                  {(user?.bio || user?.biography) && (
                    <p className="text-gray-700 mt-3">
                      {user?.bio || user?.biography}
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
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                {activeTab === 'posts' && "You haven't created any posts yet."}
                {activeTab === 'reposts' && "You haven't reposted anything yet."}
                {activeTab === 'bookmarks' && "You haven't bookmarked any posts yet."}
              </p>
              <p className="text-gray-400">
                {activeTab === 'posts' && "Share something with your campus community!"}
                {activeTab === 'reposts' && "Repost content you find interesting."}
                {activeTab === 'bookmarks' && "Save posts you want to revisit later."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab; 