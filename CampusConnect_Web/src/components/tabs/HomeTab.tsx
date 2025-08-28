'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MapPin, Calendar, Tag, X, Plus } from 'lucide-react';
import { usePostsStore } from '../../stores/postsStore';
import PostCard from '../ui/PostCard';
import TagSelector from '../ui/TagSelector';

const HomeTab: React.FC = () => {
  const { 
    filteredPosts, 
    isLoading, 
    error, 
    hasMore, 
    fetchPosts, 
    searchPosts, 
    setFilters,
    clearFilters 
  } = usePostsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string[]>(['all']);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  
  // Separate state for Offer/Request tags to ensure complete isolation
  // Each category has its own Offer/Request state
  const [offerRequestTags, setOfferRequestTags] = useState<{[key: string]: string[]}>({
    goods: [],
    services: [],
    housing: [],
    tutoring: []
  });
  
  // Track previous activeFilter to detect changes
  const prevActiveFilterRef = useRef<string[]>(['all']);

  // Get available subtags based on selected main categories
  const getAvailableSubtags = () => {
    // Show subtags when any specific category is selected (not 'all')
    const selectedCategories = activeFilter.filter(f => f !== 'all');
    if (selectedCategories.length === 0) {
      return [];
    }
    
    const availableSubtags: string[] = [];
    selectedCategories.forEach(category => {
      if (subTags[category as keyof typeof subTags]) {
        availableSubtags.push(...subTags[category as keyof typeof subTags]);
      }
    });
    
    return [...new Set(availableSubtags)]; // Remove duplicates
  };

  // Get subtags grouped by their main category for better organization
  const getSubtagsByCategory = () => {
    const selectedCategories = activeFilter.filter(f => f !== 'all');
    if (selectedCategories.length === 0) {
      return {};
    }
    
    const groupedSubtags: { [key: string]: string[] } = {};
    selectedCategories.forEach(category => {
      if (subTags[category as keyof typeof subTags]) {
        groupedSubtags[category] = subTags[category as keyof typeof subTags];
      }
    });
    
    return groupedSubtags;
  };

  // Filter posts based on selected subtags
  const getFilteredPostsBySubtags = () => {
    // Combine both regular tags and offer/request tags
    const allSelectedTags = [...selectedTags, ...Object.values(offerRequestTags).flat()];
    
    if (allSelectedTags.length === 0) {
      return filteredPosts;
    }
    
    return filteredPosts.filter(post => {
      // Check if post has any of the selected subtags
      return allSelectedTags.some(tag => 
        post.tags?.includes(tag) || 
        post.title?.toLowerCase().includes(tag.toLowerCase()) ||
        post.description?.toLowerCase().includes(tag.toLowerCase())
      );
    });
  };

  // Get count of selected subtags by category
  const getSelectedSubtagsByCategory = () => {
    const selectedCategories = activeFilter.filter(f => f !== 'all');
    const counts: { [key: string]: number } = {};
    
    selectedCategories.forEach(category => {
      const categorySubtags = subTags[category as keyof typeof subTags] || [];
      // Only count regular subtags, not Offer/Request tags
      counts[category] = selectedTags.filter(tag => categorySubtags.includes(tag)).length;
    });
    
    return counts;
  };

  // Check if Offer/Request tags should be visible
  const shouldShowOfferRequestTags = () => {
    const selectedCategories = activeFilter.filter(f => f !== 'all');
    // Show Offer/Request tags when any category that supports them is selected
    // This includes goods, services, housing, tutoring - anything except events
    return selectedCategories.some(category => 
      category === 'goods' || 
      category === 'services' || 
      category === 'housing' || 
      category === 'tutoring'
    );
  };

  // Check if Offer/Request tags are currently available for selection
  const areOfferRequestTagsAvailable = () => {
    const selectedCategories = activeFilter.filter(f => f !== 'all');
    // Show offer/request tags if:
    // 1. Only non-events categories are selected, OR
    // 2. Both events and non-events categories are selected
    const hasNonEventsCategories = selectedCategories.some(category => 
      category === 'goods' || 
      category === 'services' || 
      category === 'housing' || 
      category === 'tutoring'
    );
    
    // Show tags if there are non-events categories (regardless of whether events is also selected)
    return hasNonEventsCategories;
  };

  // Handle main category changes while preserving Offer/Request tags
  const handleCategoryChange = (newActiveFilter: string[]) => {
    const previousCategories = prevActiveFilterRef.current.filter(f => f !== 'all');
    const newCategories = newActiveFilter.filter(f => f !== 'all');
    
    // Check if Events is being added
    const hasEvents = newCategories.includes('events');
    const hadEvents = previousCategories.includes('events');
    
    if (hasEvents && !hadEvents) {
      // Events was added - only clear Offer/Request tags if Events is the only category selected
      // If other categories are also selected, preserve the tags for those categories
      const hasOtherCategories = newCategories.some(cat => 
        cat === 'goods' || cat === 'services' || cat === 'housing' || cat === 'tutoring'
      );
      
      if (!hasOtherCategories) {
        // Only Events selected - clear all Offer/Request tags
        setOfferRequestTags({
          goods: [],
          services: [],
          housing: [],
          tutoring: []
        });
      }
      // If Events + other categories are selected, preserve existing tags for non-events categories
    } else {
      // Handle category additions and removals for Offer/Request tags
      const addedCategories = newCategories.filter(cat => !previousCategories.includes(cat));
      const removedCategories = previousCategories.filter(cat => !newCategories.includes(cat));
      
      if (addedCategories.length > 0 || removedCategories.length > 0) {
        setOfferRequestTags(prev => {
          const newState = { ...prev };
          
          // For added categories, apply existing Offer/Request tags if they were selected for other categories
          addedCategories.forEach(category => {
            if (category in newState) {
              const existingTags: string[] = [];
              Object.entries(prev).forEach(([cat, tags]) => {
                if (cat !== category && tags.length > 0) {
                  existingTags.push(...tags);
                }
              });
              // Apply unique existing tags to the new category
              newState[category as keyof typeof newState] = [...new Set(existingTags)];
            }
          });
          
          // For removed categories, clear their Offer/Request tags
          removedCategories.forEach(category => {
            if (category in newState) {
              newState[category as keyof typeof newState] = [];
            }
          });
          
          return newState;
        });
      }
    }
    
    // Update active filter
    setActiveFilter(newActiveFilter);
    
    // Apply filters without affecting tags
    if (newCategories.length > 0) {
      setFilters({ postType: newCategories[0] });
    }
    
    // Update ref
    prevActiveFilterRef.current = newActiveFilter;
  };

  // Define main tags and their corresponding sub-tags
  const mainTags = [
    { id: 'all', label: 'All', count: getFilteredPostsBySubtags().length },
    { id: 'goods', label: 'Goods', count: getFilteredPostsBySubtags().filter(p => p.postType === 'goods').length },
    { id: 'services', label: 'Services', count: getFilteredPostsBySubtags().filter(p => p.postType === 'services').length },
    { id: 'events', label: 'Events', count: getFilteredPostsBySubtags().filter(p => p.postType === 'events').length },
  ];

  // Define sub-tags for each main category
  const subTags = {
    goods: [
      'Textbooks', 'Electronics', 'Furniture', 'Clothing', 'Sports Equipment', 
      'Books', 'Musical Instruments', 'Art Supplies', 'Kitchen Items', 'Garden Tools',
      'Automotive', 'Baby Items', 'Pet Supplies', 'Collectibles', 'Other'
    ],
    services: [
      'Tutoring', 'Transportation', 'Cleaning', 'Photography', 'Graphic Design',
      'Web Development', 'Writing & Editing', 'Translation', 'Music Lessons',
      'Fitness Training', 'Pet Sitting', 'House Sitting', 'Tech Support', 'Event Planning',
      'Cooking Classes', 'Other'
    ],
    events: [
      'Parties', 'Study Groups', 'Sports Events', 'Cultural Events', 'Academic Seminars',
      'Workshops', 'Conferences', 'Meetups', 'Game Nights', 'Movie Nights',
      'Concert Outings', 'Hiking Trips', 'Volunteer Events', 'Career Fairs', 'Other'
    ],
    housing: [
      'Room for Rent', 'Apartment Share', 'House Share', 'Sublet', 'Short-term Rental',
      'Roommate Search', 'Moving Help', 'Storage Space', 'Parking Space', 'Other'
    ],
    tutoring: [
      'Math', 'Science', 'Language', 'Computer Science', 'History', 'Literature',
      'Test Prep', 'Music', 'Art', 'Writing', 'Public Speaking', 'Study Skills', 'Other'
    ]
  };

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      searchPosts(query);
    } else {
      clearFilters();
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchPosts();
    }
  };

  const handleTagSelect = (tag: string) => {
    if (tag === 'Offer' || tag === 'Request') {
      // Handle Offer/Request tags separately - they are context-specific
      const selectedCategories = activeFilter.filter(f => f !== 'all');
      
      // For Offer/Request tags, we need to know which category they're being selected for
      // Since these buttons are global, we'll apply the tag to all currently selected categories
      if (selectedCategories.length > 0) {
        setOfferRequestTags(prev => {
          const newState = { ...prev };
          selectedCategories.forEach(category => {
            if (category in newState) {
              if (newState[category as keyof typeof newState].includes(tag)) {
                // Remove tag from this category
                newState[category as keyof typeof newState] = newState[category as keyof typeof newState].filter(t => t !== tag);
              } else {
                // Add tag to this category
                newState[category as keyof typeof newState] = [...newState[category as keyof typeof newState], tag];
              }
            }
          });
          return newState;
        });
      }
    } else {
      // Handle other tags normally
      setSelectedTags(prev => 
        prev.includes(tag) 
          ? prev.filter(t => t !== tag)
          : [...prev, tag]
      );
    }
  };

  const handleTagClear = () => {
    setSelectedTags([]);
    setOfferRequestTags({
      goods: [],
      services: [],
      housing: [],
      tutoring: []
    });
    clearFilters();
  };

  return (
    <div style={{ backgroundColor: '#f8f9f6' }}>
      {/* Search and Filter Header */}
      <div className="sticky top-16 bg-white border-b border-[#708d81] px-4 py-4 z-30">
        <div className="flex items-center justify-center space-x-3 relative">
          {/* Search Bar - Centered */}
          <div className="relative" style={{ width: '400px' }}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#708d81] opacity-60" size={20} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
            />
          </div>

          {/* Filter Button - Positioned absolutely on the right */}
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="absolute right-0 p-2 text-[#708d81] hover:text-[#5a7268] rounded-lg transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f2f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Filter size={20} />
          </button>
        </div>

        {/* All Tag - Top Row */}
        <div className="flex justify-center" style={{ marginTop: '16px' }}>
          {/* Offer Tag - Only visible when Goods or Services is selected */}
          {areOfferRequestTagsAvailable() && (
            <button
              onClick={() => handleTagSelect('Offer')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                offerRequestTags.goods.includes('Offer') || offerRequestTags.services.includes('Offer')
                  ? 'text-white shadow-sm'
                  : 'text-[#708d81] hover:text-[#5a7268]'
              }`}
              style={{
                backgroundColor: (offerRequestTags.goods.includes('Offer') || offerRequestTags.services.includes('Offer')) ? '#708d81' : '#f0f2f0',
                width: '100px'
              }}
              onMouseEnter={(e) => {
                if (!(offerRequestTags.goods.includes('Offer') || offerRequestTags.services.includes('Offer'))) {
                  e.currentTarget.style.backgroundColor = '#e8ebe8';
                }
              }}
              onMouseLeave={(e) => {
                if (!(offerRequestTags.goods.includes('Offer') || offerRequestTags.services.includes('Offer'))) {
                  e.currentTarget.style.backgroundColor = '#f0f2f0';
                }
              }}
            >
              Offer
            </button>
          )}

          {/* All Tag - Always visible */}
          <button
            onClick={() => handleCategoryChange(['all'])}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              activeFilter.length === 1 && activeFilter[0] === 'all'
                ? 'text-white shadow-sm'
                : 'text-[#708d81] hover:text-[#5a7268]'
            }`}
            style={{
              backgroundColor: activeFilter.length === 1 && activeFilter[0] === 'all' ? '#708d81' : '#f0f2f0',
              width: '100px',
              marginLeft: '24px'
            }}
            onMouseEnter={(e) => {
              if (activeFilter.length > 1) {
                e.currentTarget.style.backgroundColor = '#e8ebe8';
              }
            }}
            onMouseLeave={(e) => {
              if (activeFilter.length > 1) {
                e.currentTarget.style.backgroundColor = '#f0f2f0';
              }
            }}
          >
            All ({getFilteredPostsBySubtags().length})
          </button>

          {/* Request Tag - Only visible when Goods or Services is selected */}
          {areOfferRequestTagsAvailable() && (
            <button
              onClick={() => handleTagSelect('Request')}
              className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                offerRequestTags.goods.includes('Request') || offerRequestTags.services.includes('Request')
                  ? 'text-white shadow-sm'
                  : 'text-[#708d81] hover:text-[#5a7268]'
              }`}
              style={{
                backgroundColor: (offerRequestTags.goods.includes('Request') || offerRequestTags.services.includes('Request')) ? '#708d81' : '#f0f2f0',
                width: '100px',
                marginLeft: '24px'
              }}
              onMouseEnter={(e) => {
                if (!(offerRequestTags.goods.includes('Request') || offerRequestTags.services.includes('Request'))) {
                  e.currentTarget.style.backgroundColor = '#e8ebe8';
                }
              }}
              onMouseLeave={(e) => {
                if (!(offerRequestTags.goods.includes('Request') || offerRequestTags.services.includes('Request'))) {
                  e.currentTarget.style.backgroundColor = '#f0f2f0';
                }
              }}
            >
              Request
            </button>
          )}
        </div>

        {/* Offer/Request Status Indicator */}
        {areOfferRequestTagsAvailable() && (
          <div className="text-center mt-2">
            <span className="text-xs text-[#708d81] opacity-70">
              {(offerRequestTags.goods.includes('Offer') || offerRequestTags.services.includes('Offer') || offerRequestTags.housing.includes('Offer') || offerRequestTags.tutoring.includes('Offer')) &&
               (offerRequestTags.goods.includes('Request') || offerRequestTags.services.includes('Request') || offerRequestTags.housing.includes('Request') || offerRequestTags.tutoring.includes('Request'))
                ? 'Showing both Offers and Requests'
                : offerRequestTags.goods.includes('Offer') || offerRequestTags.services.includes('Offer') || offerRequestTags.housing.includes('Offer') || offerRequestTags.tutoring.includes('Offer')
                  ? 'Showing Offers only'
                  : offerRequestTags.goods.includes('Request') || offerRequestTags.services.includes('Request') || offerRequestTags.housing.includes('Request') || offerRequestTags.tutoring.includes('Request')
                    ? 'Showing Requests only'
                    : 'Showing both Offers and Requests'
              }
            </span>
          </div>
        )}

        {/* Events Warning - Show when only Events is selected */}
        {activeFilter.includes('events') && !areOfferRequestTagsAvailable() && (
          <div className="text-center mt-2">
            <span className="text-xs text-[#708d81] opacity-70">
              Note: Offer/Request tags are not available for Events only
            </span>
          </div>
        )}

        {/* Main Category Tags - Second Row */}
        <div className="flex justify-center" style={{ marginTop: '16px' }}>
          {mainTags.filter(tag => tag.id !== 'all').map((tag, index) => {
            const selectedSubtagsCount = getSelectedSubtagsByCategory()[tag.id] || 0;
            return (
              <button
                key={tag.id}
                onClick={() => {
                  const newFilter = activeFilter.includes(tag.id) 
                    ? activeFilter.filter(f => f !== tag.id) 
                    : [...activeFilter, tag.id];
                  handleCategoryChange(newFilter);
                }}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter.includes(tag.id)
                    ? 'text-white shadow-sm'
                    : 'text-[#708d81] hover:text-[#5a7268]'
                }`}
                style={{
                  backgroundColor: activeFilter.includes(tag.id) ? '#708d81' : '#f0f2f0',
                  width: '120px',
                  marginLeft: index > 0 ? '24px' : '0'
                }}
                onMouseEnter={(e) => {
                  if (!activeFilter.includes(tag.id)) {
                    e.currentTarget.style.backgroundColor = '#e8ebe8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!activeFilter.includes(tag.id)) {
                    e.currentTarget.style.backgroundColor = '#f0f2f0';
                  }
                }}
              >
                <div className="flex flex-col items-center">
                  <span>{tag.label} ({tag.count})</span>
                  {selectedSubtagsCount > 0 && (
                    <span className="text-xs opacity-80 mt-1">
                      {selectedSubtagsCount} subtag{selectedSubtagsCount !== 1 ? 's' : ''} selected
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sub-Tags (appear when a main tag is selected) */}
        {getAvailableSubtags().length > 0 && (
          <div className="flex flex-wrap justify-center" style={{ marginTop: '16px' }}>
            <div className="w-full text-center mb-3">
              <span className="text-sm font-medium text-[#708d81] opacity-80">
                {activeFilter.filter(f => f !== 'all').length === 1 
                  ? `Available Categories for ${activeFilter.filter(f => f !== 'all')[0].charAt(0).toUpperCase() + activeFilter.filter(f => f !== 'all')[0].slice(1)}`
                  : `Available Categories for ${activeFilter.filter(f => f !== 'all').map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(' & ')}`
                }
              </span>
              {selectedTags.length > 0 && (
                <div className="mt-2 text-xs text-[#708d81] opacity-70">
                  Selected: {selectedTags.length} subtag{selectedTags.length !== 1 ? 's' : ''}
                  {Object.entries(getSelectedSubtagsByCategory()).map(([category, count]) => count > 0 && (
                    <span key={category} className="ml-2">
                      • {category.charAt(0).toUpperCase() + category.slice(1)}: {count}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Show subtags organized by category */}
            {Object.entries(getSubtagsByCategory()).map(([category, categorySubtags]) => (
              <div key={category} className="w-full mb-3">
                <div className="text-center mb-2">
                  <span className="text-xs font-medium text-[#708d81] opacity-80 uppercase tracking-wide">
                    {category} Categories
                  </span>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {categorySubtags.map((subTag) => (
                    <button
                      key={subTag}
                      onClick={() => handleTagSelect(subTag)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        selectedTags.includes(subTag)
                          ? 'text-white shadow-sm'
                          : 'text-[#708d81] hover:text-[#5a7268]'
                      }`}
                      style={{
                        backgroundColor: selectedTags.includes(subTag) ? '#708d81' : '#f0f2f0',
                        width: 'auto',
                        minWidth: '100px'
                      }}
                      onMouseEnter={(e) => {
                        if (!selectedTags.includes(subTag)) {
                          e.currentTarget.style.backgroundColor = '#e8ebe8';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!selectedTags.includes(subTag)) {
                          e.currentTarget.style.backgroundColor = '#f0f2f0';
                        }
                      }}
                    >
                      {subTag}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Clear selected subtags button */}
            {selectedTags.length > 0 && (
              <div className="w-full text-center mt-3">
                <button
                  onClick={handleTagClear}
                  className="px-4 py-2 text-sm text-[#708d81] bg-[#f0f2f0] rounded-lg hover:bg-[#e8ebe8] transition-colors"
                >
                  Clear All Subtags ({selectedTags.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left Panel - Filters */}
        {showLeftPanel && (
          <div className="w-60 bg-white border-r border-[#708d81] p-4 mr-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#708d81]">Filters</h3>
              <button
                onClick={() => setShowLeftPanel(false)}
                className="p-1 text-[#708d81] opacity-60 rounded-lg transition-colors"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f0f2f0';
                  e.currentTarget.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.opacity = '0.6';
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Tags Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-[#708d81] mb-3">Popular Tags</h4>
              <TagSelector
                selectedTags={selectedTags}
                onTagSelect={handleTagSelect}
                onClearAll={handleTagClear}
              />
            </div>

            {/* Clear All Filters */}
            <button
              onClick={clearFilters}
              className="w-full py-2 px-4 text-[#708d81] rounded-lg transition-colors"
              style={{ backgroundColor: '#f0f2f0' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e8ebe8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f2f0';
              }}
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Center - Posts Feed */}
        <div className="flex-1">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {isLoading && getFilteredPostsBySubtags().length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#708d81]"></div>
            </div>
          ) : getFilteredPostsBySubtags().length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#708d81] text-lg">No posts found</p>
              <p className="text-[#708d81] text-sm mt-2">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getFilteredPostsBySubtags().map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              
              {hasMore && (
                <div className="text-center py-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    style={{ backgroundColor: '#708d81' }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#5a7268';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#708d81';
                      }
                    }}
                  >
                    {isLoading ? 'Loading...' : 'Load More Posts'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeTab; 