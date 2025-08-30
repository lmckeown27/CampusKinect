'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Edit, Save, X, User, Mail, Calendar, MapPin, GraduationCap, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { Post } from '../../types';

// Helper function to convert year number to descriptive name
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
  
  // Mock user data for testing (same as MainLayout)
  const mockUser = {
    firstName: "Liam",
    lastName: "McKeown",
    email: "liam.mckeown38415@gmail.com",
    username: "liam_mckeown38",
    major: "Computer Science",
    year: 3,
    hometown: "San Jose, CA",
    biography: "Passionate computer science student with a love for problem-solving and innovation.",
    profileImage: null
  };
  
  // Use mock user if authStore doesn't have user data
  const [user, setUser] = useState(() => {
    // Try to load from localStorage first, then fall back to mock data
    const savedProfile = localStorage.getItem('campusConnect_profile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        return { ...mockUser, ...parsedProfile };
      } catch (error) {
        console.error('Failed to parse saved profile:', error);
        return mockUser;
      }
    }
    return mockUser;
  });
  
  // Load saved profile data from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('campusConnect_profile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        const updatedUser = { ...mockUser, ...parsedProfile };
        setUser(updatedUser);
        
        // Also update editForm with the loaded data
        setEditForm({
          firstName: updatedUser.firstName || '',
          lastName: updatedUser.lastName || '',
          major: updatedUser.major || '',
          year: updatedUser.year || 1,
          hometown: updatedUser.hometown || '',
          biography: updatedUser.biography || '',
        });
      } catch (error) {
        console.error('Failed to parse saved profile:', error);
        // Set editForm with mock data if parsing fails
        setEditForm({
          firstName: mockUser.firstName || '',
          lastName: mockUser.lastName || '',
          major: mockUser.major || '',
          year: mockUser.year || 1,
          hometown: mockUser.hometown || '',
          biography: mockUser.biography || '',
        });
      }
    } else {
      // No saved profile, use mock data
      setEditForm({
        firstName: mockUser.firstName || '',
        lastName: mockUser.lastName || '',
        major: mockUser.major || '',
        year: mockUser.year || 1,
        hometown: mockUser.hometown || '',
        biography: mockUser.biography || '',
      });
    }
  }, []);
  
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    major: '',
    year: 1,
    hometown: '',
    biography: '',
  });
  




  // Mock data for posts and bookmarks - REMOVED
  // const mockPosts: Post[] = [
  //   {
  //     id: '1',
  //     title: 'Calculus Textbook for Sale',
  //     description: 'Excellent condition, barely used. Includes all practice problems.',
  //     postType: 'goods',
  //     duration: 'one-time',
  //     tags: ['textbooks', 'math', 'calculus'],
  //     userId: 'user1',
  //     universityId: 'uni1',
  //     grade: 95,
  //     isActive: true,
  //     createdAt: '2024-01-15T10:00:00Z',
  //     updatedAt: '2024-01-15T10:00:00Z',
  //   },
  //   {
  //     id: '2',
  //     title: 'Math Tutoring Available',
  //     description: 'Experienced tutor offering help with calculus, linear algebra, and statistics.',
  //     postType: 'tutoring',
  //     duration: 'recurring',
  //     tags: ['tutoring', 'math', 'calculus', 'statistics'],
  //     userId: 'user1',
  //     universityId: 'uni1',
  //     grade: 92,
  //     isActive: true,
  //     createdAt: '2024-01-10T14:30:00Z',
  //     updatedAt: '2024-01-10T14:30:00Z',
  //   },
  // ];

  // const mockBookmarks: Post[] = [
  //   {
  //     id: '3',
  //     title: 'Roommate Needed for Fall Semester',
  //     description: 'Looking for a roommate for a 2-bedroom apartment near campus.',
  //     postType: 'housing',
  //     duration: 'indefinite',
  //     tags: ['housing', 'roommate', 'apartment'],
  //     userId: 'user2',
  //     universityId: 'uni1',
  //     grade: 88,
  //     isActive: true,
  //     createdAt: '2024-01-12T09:15:00Z',
  //     updatedAt: '2024-01-12T09:15:00Z',
  //   },
  // ];

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
    
    // Save to localStorage - merge with existing profile data
    const currentProfile = localStorage.getItem('campusConnect_profile');
    const existingProfile = currentProfile ? JSON.parse(currentProfile) : {};
    const updatedProfile = { ...existingProfile, ...editForm };
    localStorage.setItem('campusConnect_profile', JSON.stringify(updatedProfile));

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    // Load fresh data from localStorage instead of using potentially stale user state
    const savedProfile = localStorage.getItem('campusConnect_profile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        const currentUser = { ...mockUser, ...parsedProfile };
        setEditForm({
          firstName: currentUser.firstName || '',
          lastName: currentUser.lastName || '',
          major: currentUser.major || '',
          year: currentUser.year || 1,
          hometown: currentUser.hometown || '',
          biography: currentUser.biography || '',
        });
      } catch (error) {
        console.error('Failed to parse saved profile in cancel:', error);
      }
    } else {
      // Fall back to mock data if no saved profile
      setEditForm({
        firstName: mockUser.firstName || '',
        lastName: mockUser.lastName || '',
        major: mockUser.major || '',
        year: mockUser.year || 1,
        hometown: mockUser.hometown || '',
        biography: mockUser.biography || '',
      });
    }
    setIsEditing(false);
  };

  const handleProfileImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        
        // Update user state with new image
        setUser((prevUser: any) => ({
          ...prevUser,
          profileImage: imageData
        }));
        
        // Save to localStorage - merge with existing profile data
        const currentProfile = localStorage.getItem('campusConnect_profile');
        const profileData = currentProfile ? JSON.parse(currentProfile) : {};
        profileData.profileImage = imageData;
        localStorage.setItem('campusConnect_profile', JSON.stringify(profileData));
        
        // Also update the user state to include the new image
        setUser((prevUser: any) => ({
          ...prevUser,
          profileImage: imageData
        }));
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const renderPostCard = (post: Post, showActions: boolean = false) => (
    <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{post.title}</h4>
          <p className="text-sm text-gray-600 line-clamp-2">{post.description}</p>
        </div>
        {showActions && (
          <div className="flex items-center space-x-2 ml-4">
            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
              <Edit size={16} />
            </button>
            <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span className="capitalize">{post.postType}</span>
        <span>Grade: {post.grade}%</span>
      </div>
    </div>
  );

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
    <div style={{ backgroundColor: '#f8f9f6' }}>
      {/* Profile Header */}
      <div className="bg-white border-b border-[#708d81]">
        <div className="max-w-xl mx-auto px-4 py-6">
          <div className="flex items-start space-x-6">
            {/* Profile Image */}
            <div className="relative">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.firstName}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 bg-[#708d81] rounded-full flex items-center justify-center">
                  <User size={48} className="text-white" />
                </div>
              )}
                                      <button 
                          onClick={handleProfileImageClick}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-[#708d81] text-white rounded-full flex items-center justify-center hover:bg-[#5a7268] transition-colors shadow-sm"
                          title="Change profile picture"
                        >
                          <Edit size={16} />
                        </button>
              
              {/* Hidden file input for profile image upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-[#708d81]">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-[#708d81] opacity-70">@{user.username}</p>
                </div>
                
                {/* Edit Profile Form - Inline with button */}
                {isEditing && (
                  <div className="flex items-center">
                    <div className="flex flex-col" style={{ marginRight: '24px' }}>
                      <input
                        type="text"
                        value={editForm.major}
                        onChange={(e) => handleInputChange('major', e.target.value)}
                        placeholder="Major"
                        className="w-48 px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent text-sm"
                        style={{ marginBottom: '16px' }}
                      />
                      <select
                        value={editForm.year}
                        onChange={(e) => handleInputChange('year', parseInt(e.target.value || '0'))}
                        className="w-48 px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent text-sm"
                        style={{ marginBottom: '16px' }}
                      >
                        {years.map(year => (
                          <option key={year.value} value={year.value}>{year.label}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editForm.hometown}
                        onChange={(e) => handleInputChange('hometown', e.target.value)}
                        placeholder="Hometown"
                        className="w-48 px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent text-sm"
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <textarea
                        value={editForm.biography}
                        onChange={(e) => handleInputChange('biography', e.target.value)}
                        placeholder="Biography"
                        rows={3}
                        className="w-48 px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent resize-none text-sm"
                        style={{ marginBottom: '16px' }}
                      />
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 rounded transition-colors text-sm"
                          style={{ backgroundColor: '#f0f2f0', color: '#708d81' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e8ebe8'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f2f0'}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveProfile}
                          className="px-3 py-1 rounded transition-colors text-sm"
                          style={{ backgroundColor: '#708d81', color: 'white' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a7268'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#708d81'}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: '#708d81', color: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a7268'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#708d81'}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-3 gap-4 w-fit mb-4">
                <div className="text-[#708d81] opacity-70">
                  <span>{user.year ? getYearLabel(user.year) : 'Not specified'}</span>
                </div>
                <div className="text-[#708d81] opacity-70">
                  <span>{user.major}</span>
                </div>
                <div className="text-[#708d81] opacity-70">
                  <span>{user.hometown}</span>
                </div>
              </div>

              {/* Biography */}
              <div>
                <h3 className="text-lg font-semibold text-[#708d81] mb-2">About Me</h3>
                <p className="text-[#708d81] opacity-70 leading-relaxed">
                  {user.biography || 'No biography added yet.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>






      {/* Content Tabs */}
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-6">
                    <div className="relative bg-[#708d81] rounded-lg p-0 w-80" style={{ backgroundColor: '#708d81' }}>
            <div className="flex relative w-full">

            
            {/* Tab Buttons - Unified Navigation Bar */}
            <button
              onClick={() => setActiveTab('posts')}
              className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                activeTab === 'posts' ? 'text-[#708d81]' : 'text-white hover:text-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'posts' ? 'white' : '#708d81',
                color: activeTab === 'posts' ? '#708d81' : 'white'
              }}
            >
              Posts
            </button>
            
            <button
              onClick={() => setActiveTab('reposts')}
              className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                activeTab === 'reposts' ? 'text-[#708d81]' : 'text-white hover:text-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'reposts' ? 'white' : '#708d81',
                color: activeTab === 'reposts' ? '#708d81' : 'white'
              }}
            >
              Reposts
            </button>
            
            <button
              onClick={() => setActiveTab('bookmarks')}
              className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors rounded-md ${
                activeTab === 'bookmarks' ? 'text-[#708d81]' : 'text-white hover:text-gray-200'
              }`}
              style={{
                backgroundColor: activeTab === 'bookmarks' ? 'white' : '#708d81',
                color: activeTab === 'bookmarks' ? '#708d81' : 'white'
              }}
            >
              Bookmarks
            </button>
          </div>
        </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'posts' && (
            <div className="text-center py-12 text-[#708d81] opacity-70">
              <p className="text-lg mb-2">No posts yet</p>
              <p className="text-sm">Create your first post to get started</p>
            </div>
          )}
          
          {activeTab === 'reposts' && (
            <div className="text-center py-12 text-[#708d81] opacity-70">
              <p className="text-lg mb-2">No reposts yet</p>
              <p className="text-sm">Repost content you want to share with others</p>
            </div>
          )}
          
          {activeTab === 'bookmarks' && (
            <div className="text-center py-12 text-[#708d81] opacity-70">
              <p className="text-lg mb-2">No bookmarks yet</p>
              <p className="text-sm">Bookmark posts you're interested in</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileTab; 