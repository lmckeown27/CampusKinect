'use client';

import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState<'posts' | 'bookmarks'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  
  // Mock user data for testing (same as MainLayout)
  const mockUser = {
    firstName: "Liam",
    lastName: "McKeown",
    email: "liam.mckeown38415@gmail.com",
    username: "liam_mckeown38",
    major: "Computer Science",
    year: 3,
    hometown: "San Jose, CA",
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
    console.log('Loading from localStorage:', savedProfile);
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        console.log('Parsed profile:', parsedProfile);
        setUser((prevUser: any) => ({ ...prevUser, ...parsedProfile }));
      } catch (error) {
        console.error('Failed to parse saved profile:', error);
      }
    }
  }, []);
  
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    major: user?.major || '',
    year: user?.year || 1,
    hometown: user?.hometown || '',
  });

  // Keep editForm synchronized with user state and localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('campusConnect_profile');
    const currentUserData = savedProfile ? JSON.parse(savedProfile) : user;
    
    setEditForm({
      firstName: currentUserData?.firstName || '',
      lastName: currentUserData?.lastName || '',
      major: currentUserData?.major || '',
      year: currentUserData?.year || 1,
      hometown: currentUserData?.hometown || '',
    });
  }, [user]);

  // Mock data for posts and bookmarks
  const mockPosts: Post[] = [
    {
      id: '1',
      title: 'Calculus Textbook for Sale',
      description: 'Excellent condition, barely used. Includes all practice problems.',
      postType: 'goods',
      duration: 'one-time',
      tags: ['textbooks', 'math', 'calculus'],
      userId: 'user1',
      universityId: 'uni1',
      grade: 95,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    {
      id: '2',
      title: 'Math Tutoring Available',
      description: 'Experienced tutor offering help with calculus, linear algebra, and statistics.',
      postType: 'tutoring',
      duration: 'recurring',
      tags: ['tutoring', 'math', 'calculus', 'statistics'],
      userId: 'user1',
      universityId: 'uni1',
      grade: 92,
      isActive: true,
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
    },
  ];

  const mockBookmarks: Post[] = [
    {
      id: '3',
      title: 'Roommate Needed for Fall Semester',
      description: 'Looking for a roommate for a 2-bedroom apartment near campus.',
      postType: 'housing',
      duration: 'indefinite',
      tags: ['housing', 'roommate', 'apartment'],
      userId: 'user2',
      universityId: 'uni1',
      grade: 88,
      isActive: true,
      createdAt: '2024-01-12T09:15:00Z',
      updatedAt: '2024-01-12T09:15:00Z',
    },
  ];

  const years = [
    { value: 1, label: 'Freshman' },
    { value: 2, label: 'Sophomore' },
    { value: 3, label: 'Junior' },
    { value: 4, label: 'Senior' },
    { value: 5, label: 'Super Senior' }
  ];

  const handleSaveProfile = async () => {
    try {
      console.log('Saving profile:', editForm);
      
      // Update local state immediately
      setUser((prevUser: any) => ({
        ...prevUser,
        ...editForm
      }));
      
      // Try to update in authStore if available
      if (authUser) {
        await updateUser(editForm);
      }
      
      // Save to localStorage
      localStorage.setItem('campusConnect_profile', JSON.stringify(editForm));
      console.log('Profile saved to localStorage');

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      major: user?.major || '',
      year: user?.year || 1,
      hometown: user?.hometown || '',
    });
    setIsEditing(false);
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
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#708d81] text-white rounded-full flex items-center justify-center hover:bg-[#5a7268] transition-colors">
                <Edit size={16} />
              </button>
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
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-[#708d81] text-white rounded-lg hover:bg-[#5a7268] transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {/* Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 text-[#708d81] opacity-70">
                  <GraduationCap size={16} />
                  <span>{user.major}</span>
                </div>
                <div className="flex items-center space-x-2 text-[#708d81] opacity-70">
                  <Calendar size={16} />
                  <span>{user.year ? getYearLabel(user.year) : 'Not specified'}</span>
                </div>
                <div className="flex items-center space-x-2 text-[#708d81] opacity-70">
                  <MapPin size={16} />
                  <span>{user.hometown}</span>
                </div>
              </div>

              {/* Major Display */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-[#708d81] mb-2">Major</h3>
                <p className="text-[#708d81] opacity-70">{user.major || 'Not specified'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <div className="bg-white border-b border-[#708d81]">
          <div className="max-w-xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#708d81] mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={editForm.firstName}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#708d81] mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editForm.lastName}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#708d81] mb-2">
                  Major
                </label>
                <input
                  type="text"
                  value={editForm.major}
                  onChange={(e) => handleInputChange('major', e.target.value)}
                  className="w-full px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#708d81] mb-2">
                  Year
                </label>
                <select
                  value={editForm.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value || '0'))}
                  className="w-full px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
                >
                  {years.map(year => (
                    <option key={year.value} value={year.value}>{year.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#708d81] mb-2">
                  Hometown
                </label>
                <input
                  type="text"
                  value={editForm.hometown}
                  onChange={(e) => handleInputChange('hometown', e.target.value)}
                  className="w-full px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-[#708d81] hover:text-[#5a7268] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                className="px-4 py-2 bg-[#708d81] text-white rounded-lg hover:bg-[#5a7268] transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Stats */}
      <div className="bg-white border-b border-[#708d81]">
        <div className="max-w-xl mx-auto px-4 py-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#708d81]">{mockPosts.length}</div>
              <div className="text-sm text-[#708d81] opacity-70">Posts</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#708d81]">{mockBookmarks.length}</div>
              <div className="text-sm text-[#708d81] opacity-70">Bookmarks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#708d81]">95%</div>
              <div className="text-sm text-[#708d81] opacity-70">Avg. Grade</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-[#f0f2f0] p-1 rounded-lg mb-6">
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'posts'
                ? 'bg-white text-[#708d81] shadow-sm'
                : 'text-[#708d81] hover:text-[#5a7268]'
            }`}
          >
            My Posts ({mockPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'bookmarks'
                ? 'bg-white text-[#708d81] shadow-sm'
                : 'text-[#708d81] hover:text-[#5a7268]'
            }`}
          >
            Bookmarks ({mockBookmarks.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'posts' ? (
            mockPosts.length > 0 ? (
              mockPosts.map(post => renderPostCard(post, true))
            ) : (
              <div className="text-center py-12 text-[#708d81] opacity-70">
                <p className="text-lg mb-2">No posts yet</p>
                <p className="text-sm">Create your first post to get started</p>
              </div>
            )
          ) : (
            mockBookmarks.length > 0 ? (
              mockBookmarks.map(post => renderPostCard(post))
            ) : (
              <div className="text-center py-12 text-[#708d81] opacity-70">
                <p className="text-lg mb-2">No bookmarks yet</p>
                <p className="text-sm">Bookmark posts you're interested in</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileTab; 