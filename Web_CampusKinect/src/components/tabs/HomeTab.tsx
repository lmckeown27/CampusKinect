'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, ChevronUp, ChevronDown, ShoppingBag, Wrench, Home, Calendar, XCircle } from 'lucide-react';
import { usePostsStore } from '../../stores/postsStore';
import { useAuthStore } from '../../stores/authStore';
import { PostCard } from '../ui';
import EditPostModal from '../ui/EditPostModal';
import { Post, CreatePostForm } from '../../types';

// Category definitions matching iOS - using Lucide icons similar to SF Symbols
const categories = [
  {
    id: 'goods',
    name: 'Goods',
    Icon: ShoppingBag,
    color: '#10B981',
    subcategories: ['Clothing', 'Parking Permits', 'Household Appliances', 'Electronics', 'Furniture', 'Concert Tickets', 'Kitchen Items', 'School Supplies', 'Sports Equipment', 'Automotive', 'Pets', 'Pet Supplies', 'Other']
  },
  {
    id: 'services',
    name: 'Services',
    Icon: Wrench,
    color: '#F59E0B',
    subcategories: ['Transportation', 'Tutoring', 'Fitness Training', 'Meal Delivery', 'Cleaning', 'Photography', 'Graphic Design', 'Tech Support', 'Web Development', 'Writing & Editing', 'Translation', 'Towing', 'Other']
  },
  {
    id: 'housing',
    name: 'Housing',
    Icon: Home,
    color: '#3B82F6',
    subcategories: ['Leasing', 'Subleasing', 'Roommate Search', 'Storage Space', 'Other']
  },
  {
    id: 'events',
    name: 'Events',
    Icon: Calendar,
    color: '#8B5CF6',
    subcategories: ['Sports Events', 'Study Groups', 'Rush', 'Pickup Basketball', 'Philanthropy', 'Cultural Events', 'Workshops', 'Conferences', 'Meetups', 'Game Nights', 'Movie Nights', 'Hiking Trips', 'Volunteer Events', 'Career Fairs', 'Other']
  }
];

const HomeTab: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    filteredPosts, 
    isLoading, 
    error, 
    hasMore, 
    fetchPosts, 
    setFilters,
    clearFilters,
    filters,
    deletePost,
    updatePost
  } = usePostsStore();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedOfferRequest, setSelectedOfferRequest] = useState<string | null>(null);
  
  // Edit modal state
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Admin university viewing
  const [viewingUniversityId, setViewingUniversityId] = useState<number | null>(null);
  const [viewingUniversityName, setViewingUniversityName] = useState<string | null>(null);

  // Load initial posts
  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  // Check for admin viewing university on mount
  useEffect(() => {
    const viewingId = localStorage.getItem('adminViewingUniversityId');
    const viewingName = localStorage.getItem('adminViewingUniversityName');
    
    if (viewingId && viewingName) {
      setViewingUniversityId(parseInt(viewingId));
      setViewingUniversityName(viewingName);
    }
  }, []);

  // Apply filters when category or tags change
  useEffect(() => {
    if (selectedCategory || selectedTags.length > 0) {
      const newFilters: any = {};
      
      if (selectedCategory) {
        newFilters.postType = selectedCategory;
      }
      
      if (selectedTags.length > 0) {
        newFilters.tags = selectedTags;
      }
      
      if (selectedOfferRequest) {
        // Add offer/request to tags
        newFilters.tags = [...(newFilters.tags || []), selectedOfferRequest];
      }
      
      setFilters(newFilters);
    } else {
      clearFilters();
    }
  }, [selectedCategory, selectedTags, selectedOfferRequest, setFilters, clearFilters]);

  const handleCategoryClick = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      // Deselect category
      setSelectedCategory(null);
      setSelectedTags([]);
      setSelectedOfferRequest(null);
      setIsCategoryExpanded(true);
    } else {
      // Select new category
      setSelectedCategory(categoryId);
      setSelectedTags([]);
      setSelectedOfferRequest(null);
      setIsCategoryExpanded(true);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleClearAll = () => {
    setSelectedCategory(null);
    setSelectedTags([]);
    setSelectedOfferRequest(null);
    clearFilters();
  };

  const handleClearUniversityView = () => {
    localStorage.removeItem('adminViewingUniversityId');
    localStorage.removeItem('adminViewingUniversityName');
    setViewingUniversityId(null);
    setViewingUniversityName(null);
  };

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
    }
  };

  // Handle post edit
  const handleEditPost = (postId: string, post: Post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  // Handle save edited post
  const handleSaveEditedPost = async (postId: string, formData: Partial<CreatePostForm>) => {
    try {
      await updatePost(postId, formData);
      setIsEditModalOpen(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post. Please try again.');
    }
  };

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const showOfferRequestToggle = selectedCategory && ['goods', 'services', 'housing'].includes(selectedCategory);

  // Filter posts by university if admin is viewing a specific one
  // Include posts sent to all universities (universityId is null or '0')
  const displayPosts = viewingUniversityId 
    ? filteredPosts.filter(post => 
        post.universityId === String(viewingUniversityId) || 
        !post.universityId || 
        post.universityId === '0'
      )
    : filteredPosts;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#525252', paddingBottom: '100px' }}>
      <div className="max-w-4xl mx-auto">
        {/* Admin University Viewing Banner */}
        {viewingUniversityId && viewingUniversityName && (
          <div className="sticky z-20 px-4 py-3" style={{ backgroundColor: '#708d81', borderBottom: '1px solid rgba(255,255,255,0.2)', top: '80px' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white">
                  Admin Mode: Viewing {viewingUniversityName}
                </span>
              </div>
              <button
                onClick={handleClearUniversityView}
                className="flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-medium transition-colors hover:bg-white hover:bg-opacity-20"
                style={{ color: 'white' }}
              >
                <XCircle size={16} />
                <span>View All Universities</span>
              </button>
            </div>
          </div>
        )}

        {/* Header with Clear All Button and Offer/Request Toggle */}
        <div className="sticky z-10 px-4 py-5" style={{ 
          backgroundColor: '#525252', 
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          top: viewingUniversityId ? '132px' : '80px'
        }}>
          <div className="flex items-center justify-between">
            {selectedTags.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1 text-sm font-medium rounded-lg transition-all hover:bg-gray-100"
                style={{ 
                  backgroundColor: 'white',
                  color: '#708d81',
                  border: '1px solid #708d81'
                }}
              >
                Clear All
              </button>
            )}
            {selectedTags.length === 0 && <div />}
            
            <div />
            
            {showOfferRequestToggle && (
              <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #708d81' }}>
                <button
                  onClick={() => setSelectedOfferRequest(selectedOfferRequest === 'offer' ? null : 'offer')}
                  className="px-3 py-1 text-xs font-medium transition-all hover:bg-gray-100"
                  style={{
                    backgroundColor: selectedOfferRequest === 'offer' ? '#708d81' : 'white',
                    color: selectedOfferRequest === 'offer' ? 'white' : '#708d81'
                  }}
                >
                  Offers
                </button>
                <button
                  onClick={() => setSelectedOfferRequest(selectedOfferRequest === 'request' ? null : 'request')}
                  className="px-3 py-1 text-xs font-medium transition-all hover:bg-gray-100"
                  style={{
                    backgroundColor: selectedOfferRequest === 'request' ? '#708d81' : 'white',
                    color: selectedOfferRequest === 'request' ? 'white' : '#708d81'
                  }}
                >
                  Requests
                </button>
              </div>
            )}
            {!showOfferRequestToggle && <div />}
          </div>
        </div>

        {/* Main Category Buttons */}
        <div className="px-4 py-4">
          <div className="flex gap-4 justify-center">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="flex-1 max-w-[200px] px-4 py-3 rounded-xl font-medium transition-all hover:scale-[1.02] hover:shadow-xl"
                style={{
                  backgroundColor: selectedCategory === category.id ? '#708d81' : 'white',
                  color: selectedCategory === category.id ? 'white' : '#708d81',
                  border: `2px solid ${selectedCategory === category.id ? '#708d81' : '#708d81'}`,
                }}
              >
                <div className="text-center">
                  <div className="mb-1 flex justify-center">
                    <category.Icon size={28} strokeWidth={2} />
                  </div>
                  <div className="text-sm">{category.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Subcategory Tags Section */}
        {selectedCategory && isCategoryExpanded && selectedCategoryData && (
          <div className="px-4 py-3 animate-fadeIn">
            <div className="text-xs text-gray-400 mb-3">
              {selectedCategoryData.name} Tags
            </div>
            <div className="grid grid-cols-2 gap-2">
              {selectedCategoryData.subcategories.map(subcategory => (
                <button
                  key={subcategory}
                  onClick={() => handleTagToggle(subcategory)}
                  className="px-3 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02] hover:shadow-xl"
                  style={{
                    backgroundColor: selectedTags.includes(subcategory) ? '#708d81' : 'white',
                    color: selectedTags.includes(subcategory) ? 'white' : '#708d81',
                    border: `1px solid #708d81`,
                  }}
                >
                  {subcategory}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Collapse/Expand Arrow */}
        {selectedCategory && (
          <div className="px-4">
            <button
              onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
              className="w-full py-2 flex justify-center items-center transition-colors"
              style={{ backgroundColor: 'rgba(112, 141, 129, 0.1)' }}
            >
              {isCategoryExpanded ? (
                <ChevronUp size={20} className="text-gray-400" />
              ) : (
                <ChevronDown size={20} className="text-gray-400" />
              )}
            </button>
          </div>
        )}

        {/* Active Filter Bar */}
        {selectedTags.length > 0 && (
          <div className="px-4 py-3">
            <div className="flex overflow-x-auto gap-2 pb-2">
              {selectedTags.map(tag => (
                <div
                  key={tag}
                  className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap"
                  style={{ backgroundColor: '#708d81', color: 'white' }}
                >
                  <span>{tag}</span>
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="hover:opacity-80"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="px-4 pb-4">
          {isLoading && displayPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#708d81' }}></div>
              <p style={{ color: '#708d81' }}>Loading posts...</p>
            </div>
          ) : displayPosts.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-white mb-2">No Posts Yet</h3>
              <p className="text-gray-400">
                {viewingUniversityId 
                  ? `No posts found for ${viewingUniversityName}.`
                  : 'Be the first to share something with your campus community!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayPosts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  onEdit={handleEditPost}
                  onDelete={handleDeletePost}
                />
              ))}
              
              {/* Load more indicator */}
              {hasMore && (
                <div className="text-center py-4">
                  <button
                    onClick={() => fetchPosts((filteredPosts.length / 20) + 1, false)}
                    className="px-6 py-2 rounded-lg font-medium"
                    style={{ backgroundColor: '#708d81', color: 'white' }}
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg" style={{ backgroundColor: '#ef4444', color: 'white' }}>
            <p className="font-medium">{error}</p>
          </div>
        )}
      </div>

      {/* Edit Post Modal */}
      {editingPost && (
        <EditPostModal
          post={editingPost}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPost(null);
          }}
          onSave={handleSaveEditedPost}
        />
      )}
    </div>
  );
};

export default HomeTab;