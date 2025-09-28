'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, MapPin, Calendar, Tag, X, Plus, ChevronUp, ChevronDown } from 'lucide-react';
import { usePostsStore } from '../../stores/postsStore';
import { PostCard, TagSelector } from '../ui';

const HomeTab: React.FC = () => {
  const { 
    filteredPosts, 
    isLoading, 
    error, 
    hasMore, 
    fetchPosts, 
    searchPosts, 
    setFilters,
    clearFilters,
    filters 
  } = usePostsStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Load saved search query from localStorage on component mount
  useEffect(() => {
    const savedSearchQuery = localStorage.getItem('campusConnect_homeSearchQuery');
    if (savedSearchQuery) {
      setSearchQuery(savedSearchQuery);
    }
  }, []);

  // Save search query to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('campusConnect_homeSearchQuery', searchQuery);
  }, [searchQuery]);

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts(1, true); // Fetch first page, reset the list
  }, [fetchPosts]);

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
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [confirmedTags, setConfirmedTags] = useState<string[]>([]); // Track confirmed tags separately
  const [activeFilter, setActiveFilter] = useState<string[]>([]);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(0);
  const [isClearing, setIsClearing] = useState(false);
  
  // Bottom sheet state for iOS-style category selection
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [bottomSheetHeight, setBottomSheetHeight] = useState(300); // Default collapsed height
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  
  // Separate state for Offer/Request tags to ensure complete isolation
  // Each category has its own Offer/Request state
  const [offerRequestTags, setOfferRequestTags] = useState<{[key: string]: string[]}>({
    goods: [],
    services: [],
    housing: []
  });

  // State to track which category boxes are open
  const [openCategoryBoxes, setOpenCategoryBoxes] = useState<string[]>([]);
  
  // Load saved state from localStorage on component mount
  useEffect(() => {
    // Load selectedTags
    const savedSelectedTags = localStorage.getItem('campusConnect_selectedTags');
    if (savedSelectedTags) {
      try {
        setSelectedTags(JSON.parse(savedSelectedTags));
      } catch (error) {
        console.error('Failed to parse saved selectedTags:', error);
      }
    }

    // Load confirmedTags
    const savedConfirmedTags = localStorage.getItem('campusConnect_confirmedTags');
    if (savedConfirmedTags) {
      try {
        setConfirmedTags(JSON.parse(savedConfirmedTags));
      } catch (error) {
        console.error('Failed to parse saved confirmedTags:', error);
      }
    }

    // Load activeFilter - ensure 'all' is always selected by default
    const savedActiveFilter = localStorage.getItem('campusConnect_activeFilter');
    if (savedActiveFilter) {
      try {
        const parsedActiveFilter = JSON.parse(savedActiveFilter);
        // Ensure 'all' is always included if no specific categories are selected
        if (parsedActiveFilter.length === 0 || (parsedActiveFilter.length === 1 && parsedActiveFilter[0] === 'all')) {
          setActiveFilter(['all']);
        } else {
          setActiveFilter(parsedActiveFilter);
        }
      } catch (error) {
        console.error('Failed to parse saved activeFilter:', error);
        // If parsing fails, default to 'all'
        setActiveFilter(['all']);
      }
    } else {
      // If no saved activeFilter, default to 'all'
      setActiveFilter(['all']);
    }

    // Load offerRequestTags
    const savedOfferRequestTags = localStorage.getItem('campusConnect_offerRequestTags');
    if (savedOfferRequestTags) {
      try {
        setOfferRequestTags(JSON.parse(savedOfferRequestTags));
      } catch (error) {
        console.error('Failed to parse saved offerRequestTags:', error);
      }
    }
  }, []);

  // Save selectedTags to localStorage whenever it changes
  useEffect(() => {
    if (!isClearing) {
      localStorage.setItem('campusConnect_selectedTags', JSON.stringify(selectedTags));
    }
  }, [selectedTags, isClearing]);

  // Save confirmedTags to localStorage whenever it changes
  useEffect(() => {
    if (!isClearing) {
      localStorage.setItem('campusConnect_confirmedTags', JSON.stringify(confirmedTags));
    }
  }, [confirmedTags, isClearing]);

  // Save activeFilter to localStorage whenever it changes
  useEffect(() => {
    if (!isClearing) {
      localStorage.setItem('campusConnect_activeFilter', JSON.stringify(activeFilter));
    }
  }, [activeFilter, isClearing]);

  // Save offerRequestTags to localStorage whenever it changes
  useEffect(() => {
    if (!isClearing) {
      localStorage.setItem('campusConnect_offerRequestTags', JSON.stringify(offerRequestTags));
    }
  }, [offerRequestTags, isClearing]);

  // Validation effect: Clear tags if activeFilter is 'all' to ensure consistency
  useEffect(() => {
    // Don't interfere if we're in the middle of clearing
    if (isClearing) return;
    
    if (activeFilter.length === 1 && activeFilter[0] === 'all') {
      // If we're showing "All" posts but have selected tags, clear them
      const hasSelectedTags = selectedTags.length > 0;
      const hasConfirmedTags = confirmedTags.length > 0;
      const hasOfferRequestTags = Object.values(offerRequestTags).some(tags => tags.length > 0);
      
      if (hasSelectedTags || hasConfirmedTags || hasOfferRequestTags) {
        setSelectedTags([]);
        setConfirmedTags([]);
        setOfferRequestTags({
          goods: [],
          services: [],
          housing: []
        });
        // Also clear any backend tag filters
        clearFilters();
      }
    }
  }, [activeFilter, selectedTags, confirmedTags, offerRequestTags, clearFilters, isClearing]);

  // Refetch posts when returning to "All" filter or when clearing tags
  useEffect(() => {
    // Don't interfere if we're in the middle of clearing
    if (isClearing) return;
    
    if (activeFilter.includes('all') && selectedTags.length === 0) {
      // Only refetch if we don't already have posts loaded
      if (filteredPosts.length === 0) {
        fetchPosts(1, true);
      }
    }
  }, [activeFilter, selectedTags, filteredPosts.length, fetchPosts, isClearing]);
  
  // Category boxes are now only controlled by direct user interaction
  // No automatic synchronization with activeFilter

  // Track when category boxes are closed and unselect unconfirmed categories
  useEffect(() => {
    // Only run this effect if we have a previous state to compare against
    // This prevents the effect from running on initial mount when prevActiveFilterRef.current is ['all']
    if (prevActiveFilterRef.current.length > 1 || (prevActiveFilterRef.current.length === 1 && prevActiveFilterRef.current[0] !== 'all')) {
      // When a category box is closed, unselect any tags that weren't confirmed
      const closedCategories = prevActiveFilterRef.current.filter(f => f !== 'all').filter(cat => 
        !openCategoryBoxes.includes(cat)
      );
      
      if (closedCategories.length > 0) {
        // Unselect only unconfirmed tags for closed boxes
        closedCategories.forEach(category => {
          const categorySubtags = subTags[category as keyof typeof subTags] || [];
          setSelectedTags(prev => prev.filter(tag => 
            // Keep tags that are confirmed OR not from this category
            confirmedTags.includes(tag) || !categorySubtags.includes(tag)
          ));
        });
      }
    }
    
    // Update the ref to track current state
    prevActiveFilterRef.current = activeFilter;
  }, [openCategoryBoxes, activeFilter, confirmedTags]);

  // Track previous activeFilter to detect changes
  const prevActiveFilterRef = useRef<string[]>(['all']);

  // Initialize the prevActiveFilterRef after activeFilter is loaded
  useEffect(() => {
    if (activeFilter.length > 0) {
      prevActiveFilterRef.current = activeFilter;
    }
  }, [activeFilter]);



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
    // Safety check: ensure filteredPosts is an array
    if (!filteredPosts || !Array.isArray(filteredPosts)) {
      return [];
    }
    
    // If we're in the middle of clearing, don't apply tag filtering
    if (isClearing) {
      return filteredPosts;
    }
    
    // If "All" is selected, don't apply any tag filtering
    if (activeFilter.length === 1 && activeFilter[0] === 'all') {
      return filteredPosts;
    }
    
    // Combine regular tags, confirmed tags, and offer/request tags
    const allSelectedTags = [...selectedTags, ...confirmedTags, ...Object.values(offerRequestTags).flat()];
    
    // Remove duplicates and empty strings
    const uniqueTags = [...new Set(allSelectedTags.filter(tag => tag && tag.trim() !== ''))];
    
    if (uniqueTags.length === 0) {
      return filteredPosts;
    }
    
    return filteredPosts.filter(post => {
      // Check if post has any of the selected subtags
      return uniqueTags.some(tag => 
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
    // This includes goods, services, housing - anything except events
    return selectedCategories.some(category => 
      category === 'goods' || 
      category === 'services' || 
      category === 'housing'
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
      category === 'housing'
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
        cat === 'goods' || cat === 'services' || cat === 'housing'
      );
      
      if (!hasOtherCategories) {
        // Only Events selected - clear all Offer/Request tags
        setOfferRequestTags({
          goods: [],
          services: [],
          housing: []
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
    
    // Category boxes are now only controlled by direct user interaction
    // No automatic opening/closing based on filter changes
    
    // Apply filters without affecting tags
    if (newCategories.length > 0 && newCategories[0] !== 'all') {
      // Send all selected categories to backend
      if (newCategories.length === 1) {
        // Single category - clear postTypes and set postType
        const currentFilters = { ...filters };
        delete currentFilters.postTypes; // Clear multiple selection
        setFilters({ ...currentFilters, postType: newCategories[0] });
      } else {
        // Multiple categories selected - clear postType and set postTypes
        const currentFilters = { ...filters };
        delete currentFilters.postType; // Clear single selection
        setFilters({ ...currentFilters, postTypes: newCategories });
      }
    } else if (newActiveFilter.includes('all') || newActiveFilter.length === 0) {
      // When "All" is selected OR when no categories are selected, clear filters to get all posts
      clearFilters();
      
      // Clear all local tag states as well
      setSelectedTags([]);
      setConfirmedTags([]);
      setOfferRequestTags({
        goods: [],
        services: [],
        housing: []
      });
      
      // If no categories are selected, automatically select "All"
      if (newActiveFilter.length === 0) {
        setActiveFilter(['all']);
        return; // Exit early to prevent updating the ref with empty array
      }
    }
    
    // Update ref
    prevActiveFilterRef.current = newActiveFilter;
  };

  // Define main tags and their corresponding sub-tags
  const mainTags = [
    { id: 'all', label: 'All', count: getFilteredPostsBySubtags().length },
    { id: 'goods', label: 'Goods', count: getFilteredPostsBySubtags().filter(p => p.postType === 'goods' || p.postType === 'offer').length },
    { id: 'services', label: 'Services', count: getFilteredPostsBySubtags().filter(p => p.postType === 'services' || p.postType === 'request').length },
    { id: 'housing', label: 'Housing', count: getFilteredPostsBySubtags().filter(p => p.postType === 'housing').length },
    { id: 'events', label: 'Events', count: getFilteredPostsBySubtags().filter(p => p.postType === 'events' || p.postType === 'event').length },
  ];

  // Define sub-tags for each main category
  const subTags = {
    goods: [
      'Clothing', 'Parking Permits', 'Household Appliances', 'Electronics', 'Furniture', 'Concert Tickets', 'Kitchen Items', 'School Supplies', 'Sports Equipment', 
      'Automotive', 'Pets', 'Pet Supplies', 'Other'
    ],
    services: [
      'Transportation', 'Tutoring', 'Fitness Training', 'Meal Delivery', 'Cleaning', 'Photography', 'Graphic Design',
      'Tech Support', 'Web Development', 'Writing & Editing', 'Translation', 'Towing',
      'Other'
    ],
    events: [
      'Sports Events', 'Study Groups', 'Rush', 'Pickup Basketball', 'Philanthropy', 'Cultural Events',
      'Workshops', 'Conferences', 'Meetups', 'Game Nights', 'Movie Nights',
      'Hiking Trips', 'Volunteer Events', 'Career Fairs', 'Other'
    ],
    housing: [
      'Leasing', 'Subleasing', 'Roommate Search', 'Storage Space', 'Other'
    ]
  };

  // Helper function to find the main category for a given subcategory tag
  const findMainCategoryForTag = (tag: string): string | null => {
    for (const [mainCategory, tags] of Object.entries(subTags)) {
      if (tags.includes(tag)) {
        return mainCategory;
      }
    }
    return null;
  };

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);



  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchPosts();
    }
  };

  const handleTagSelect = (tag: string) => {
    if (tag === 'offer' || tag === 'request') {
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
          
          // Send updated tags to backend for filtering
          const allSelectedTags = [...selectedTags, ...confirmedTags, ...Object.values(newState).flat()];
          if (allSelectedTags.length > 0) {
            // Clean up conflicting category parameters
            const cleanFilters = { ...filters };
            if (cleanFilters.postType && cleanFilters.postTypes) {
              delete cleanFilters.postTypes; // Prefer single postType
            }
            setFilters({ ...cleanFilters, tags: allSelectedTags });
          } else {
            // If no tags selected, clear tag filters but keep category filters
            const currentFilters = { ...filters };
            delete currentFilters.tags;
            // Clean up conflicting category parameters
            if (currentFilters.postType && currentFilters.postTypes) {
              delete currentFilters.postTypes; // Prefer single postType
            }
            setFilters(currentFilters);
          }
          
          return newState;
        });
      }
    } else {
      // Handle other tags normally
      setSelectedTags(prev => {
        const newTags = prev.includes(tag) 
          ? prev.filter(t => t !== tag) 
          : [...prev, tag];
        
        // When selecting subcategory tags, automatically ensure appropriate main categories are selected
        const mainCategoriesToSelect = new Set<string>();
        newTags.forEach(selectedTag => {
          const mainCategory = findMainCategoryForTag(selectedTag);
          if (mainCategory) {
            mainCategoriesToSelect.add(mainCategory);
          }
        });
        
        // Update active filter to include necessary main categories
        const currentActiveFilter = activeFilter.filter(f => f !== 'all');
        let needsFilterUpdate = false;
        mainCategoriesToSelect.forEach(mainCategory => {
          if (!currentActiveFilter.includes(mainCategory)) {
            currentActiveFilter.push(mainCategory);
            needsFilterUpdate = true;
          }
        });
        
        if (needsFilterUpdate && currentActiveFilter.length > 0) {
          // Update activeFilter without calling handleCategoryChange to avoid conflicts
          setActiveFilter(currentActiveFilter);
        }
        
        // Send updated tags to backend for filtering
        const allSelectedTags = [...newTags, ...confirmedTags, ...Object.values(offerRequestTags).flat()];
        if (allSelectedTags.length > 0) {
          // Clean up conflicting category parameters
          const cleanFilters = { ...filters };
          if (cleanFilters.postType && cleanFilters.postTypes) {
            delete cleanFilters.postTypes; // Prefer single postType
          }
          
          // Ensure we have the right category filters
          if (currentActiveFilter.length === 1) {
            setFilters({ ...cleanFilters, postType: currentActiveFilter[0], tags: allSelectedTags });
          } else if (currentActiveFilter.length > 1) {
            delete cleanFilters.postType;
            setFilters({ ...cleanFilters, postTypes: currentActiveFilter, tags: allSelectedTags });
          } else {
            setFilters({ ...cleanFilters, tags: allSelectedTags });
          }
        } else {
          // If no tags selected, clear tag filters but keep category filters
          const currentFilters = { ...filters };
          delete currentFilters.tags;
          // Clean up conflicting category parameters
          if (currentFilters.postType && currentFilters.postTypes) {
            delete currentFilters.postTypes; // Prefer single postType
          }
          setFilters(currentFilters);
        }
        
        if (prev.includes(tag)) {
          // Also remove from confirmed tags if it was confirmed
          setConfirmedTags(confirmed => confirmed.filter(t => t !== tag));
        }
        
        return newTags;
      });
    }
  };

  const handleTagClear = async () => {
    // Set clearing flag to prevent useEffect interference
    setIsClearing(true);
    
    try {
      // Clear all tag states immediately and force synchronous updates
      setSelectedTags([]);
      setConfirmedTags([]);
      setOfferRequestTags({
        goods: [],
        services: [],
        housing: []
      });
      
      // Also clear localStorage to prevent tags from being reloaded
      localStorage.setItem('campusConnect_selectedTags', JSON.stringify([]));
      localStorage.setItem('campusConnect_confirmedTags', JSON.stringify([]));
      localStorage.setItem('campusConnect_offerRequestTags', JSON.stringify({
        goods: [],
        services: [],
        housing: []
      }));
      
      // Clear tag filters but preserve ALL selected main category filters
      const currentFilters = { ...filters };
      
      // CRITICAL FIX: Explicitly set tags to undefined to remove them from the store
      currentFilters.tags = undefined;
      
      // Handle conflicting category parameters - preserve the multiple selection if it exists
      if (currentFilters.postType && currentFilters.postTypes) {
        // If both exist, prefer postTypes (multiple selection) to preserve all selected categories
        delete currentFilters.postType;
      }
      
      // Apply the updated filters immediately (this will refetch posts with all selected main categories)
      setFilters(currentFilters);
      
      // Force a posts refetch to ensure fresh data with a longer delay
      setTimeout(() => {
        fetchPosts(1, true);
        setForceRefresh(prev => prev + 1);
        // Reset clearing flag after everything is done
        setIsClearing(false);
      }, 200);
      
      // If no category filters remain, clear all filters
      if (!currentFilters.postType && !currentFilters.postTypes) {
        clearFilters();
      }
    } catch (error) {
      console.error('Error in handleTagClear:', error);
      // Make sure to reset the clearing flag even if there's an error
      setIsClearing(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#525252' }}>
      {/* Clear All button - positioned above Search bar */}
      {(() => {
        const hasSelectedTags = selectedTags.length > 0;
        const hasOfferRequestTags = Object.values(offerRequestTags).some(tags => tags.length > 0);
        const totalTagsCount = selectedTags.length + Object.values(offerRequestTags).flat().length;
        
        return (hasSelectedTags || hasOfferRequestTags) && (
          <div className="flex justify-center pt-4">
            <button
              onClick={handleTagClear}
              className="py-1 px-4 rounded-lg text-xs font-medium transition-colors cursor-pointer text-[#708d81] hover:text-[#5a7268]"
              style={{ backgroundColor: '#f0f2f0', cursor: 'pointer' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e8ebe8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f2f0';
              }}
            >
              Clear All Tags ({totalTagsCount})
            </button>
          </div>
        );
      })()}

      {/* Search and Filter Header */}
              <div className="sticky top-16 bg-grey-medium border-b border-[#708d81] px-4 py-4 z-30">
        <div className="flex items-center justify-center space-x-3 relative">
          {/* Search Bar - COMMENTED OUT - User will fix locally */}
          {/* 
          <div className="relative" style={{ width: '400px' }}>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 border border-[#708d81] rounded-full focus:ring-2 focus:ring-[#708d81] focus:border-transparent text-lg"
            />
          </div>
          */}
        </div>

        {/* All Tag - Top Row */}
        <div className="flex justify-center" style={{ marginTop: '16px' }}>
          {/* Offer Tag - Always reserve space, conditionally show content */}
          <div className="w-[100px] flex justify-center">
            {areOfferRequestTagsAvailable() && (
              <button
                onClick={() => handleTagSelect('offer')}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                      offerRequestTags.goods.includes('offer') || offerRequestTags.services.includes('offer') || offerRequestTags.housing.includes('offer')
                    ? 'text-white'
                    : 'text-[#708d81] hover:text-[#5a7268]'
                }`}
                style={{
                                      backgroundColor: (offerRequestTags.goods.includes('offer') || offerRequestTags.services.includes('offer') || offerRequestTags.housing.includes('offer')) ? '#708d81' : '#f0f2f0',
                    color: (offerRequestTags.goods.includes('offer') || offerRequestTags.services.includes('offer') || offerRequestTags.housing.includes('offer')) ? 'white' : '#708d81',
                  width: '100px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!(offerRequestTags.goods.includes('offer') || offerRequestTags.services.includes('offer') || offerRequestTags.housing.includes('offer'))) {
                    e.currentTarget.style.backgroundColor = '#e8ebe8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(offerRequestTags.goods.includes('offer') || offerRequestTags.services.includes('offer') || offerRequestTags.housing.includes('offer'))) {
                    e.currentTarget.style.backgroundColor = '#f0f2f0';
                  }
                }}
              >
                Offer
              </button>
            )}
          </div>

          {/* All Tag - Always visible in fixed position */}
          <button
            onClick={() => handleCategoryChange(['all'])}
            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeFilter.length === 1 && activeFilter[0] === 'all'
                ? 'text-white'
                : 'text-[#708d81] hover:text-[#5a7268]'
            }`}
            style={{
              backgroundColor: activeFilter.length === 1 && activeFilter[0] === 'all' ? '#708d81' : '#f0f2f0',
              color: activeFilter.length === 1 && activeFilter[0] === 'all' ? 'white' : '#708d81',
              width: '100px',
              marginLeft: '24px',
              boxShadow: activeFilter.length === 1 && activeFilter[0] === 'all' ? '0 1px 2px rgba(0, 0, 0, 0.05)' : 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!(activeFilter.length === 1 && activeFilter[0] === 'all')) {
                e.currentTarget.style.backgroundColor = '#e8ebe8';
              }
            }}
            onMouseLeave={(e) => {
              if (!(activeFilter.length === 1 && activeFilter[0] === 'all')) {
                e.currentTarget.style.backgroundColor = '#f0f2f0';
              }
            }}
          >
            All
          </button>

          {/* Request Tag - Always reserve space, conditionally show content */}
          <div className="w-[100px] flex justify-center" style={{ marginLeft: '24px' }}>
            {areOfferRequestTagsAvailable() && (
              <button
                onClick={() => handleTagSelect('request')}
                className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  offerRequestTags.goods.includes('request') || offerRequestTags.services.includes('request') || offerRequestTags.housing.includes('request')
                    ? 'text-white'
                    : 'text-[#708d81] hover:text-[#5a7268]'
                }`}
                style={{
                  backgroundColor: (offerRequestTags.goods.includes('request') || offerRequestTags.services.includes('request') || offerRequestTags.housing.includes('request')) ? '#708d81' : '#f0f2f0',
                  color: (offerRequestTags.goods.includes('request') || offerRequestTags.services.includes('request') || offerRequestTags.housing.includes('request')) ? 'white' : '#708d81',
                  width: '100px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!(offerRequestTags.goods.includes('request') || offerRequestTags.services.includes('request') || offerRequestTags.housing.includes('request'))) {
                    e.currentTarget.style.backgroundColor = '#e8ebe8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(offerRequestTags.goods.includes('request') || offerRequestTags.services.includes('request') || offerRequestTags.housing.includes('request'))) {
                    e.currentTarget.style.backgroundColor = '#f0f2f0';
                  }
                }}
              >
                Request
              </button>
            )}
          </div>
        </div>

        {/* Main Category Tags - Second Row */}
        <div className="flex flex-col items-center relative" style={{ marginTop: '16px' }}>
          {/* Subtag buttons row */}
          <div className="flex justify-center">
            {mainTags.filter(tag => tag.id !== 'all').map((tag, index) => {
              return (
                <button
                  key={tag.id}
                  onClick={() => {
                    let newFilter: string[];
                    
                    if (activeFilter.includes(tag.id)) {
                      // Deselecting this category
                      newFilter = activeFilter.filter(f => f !== tag.id);
                      
                      // If deselecting a subtag, also deselect all its associated categories
                      const categoriesToRemove = subTags[tag.id as keyof typeof subTags] || [];
                      setSelectedTags(prev => prev.filter(category => !categoriesToRemove.includes(category)));
                    } else {
                      // Selecting this category
                      // Remove "all" if it's currently selected and add the new category
                      const filteredActiveFilter = activeFilter.filter(f => f !== 'all');
                      newFilter = [...filteredActiveFilter, tag.id];
                    }
                    
                    handleCategoryChange(newFilter);
                  }}
                  className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeFilter.includes(tag.id)
                      ? 'text-white shadow-sm'
                      : 'text-[#708d81] hover:text-[#5a7268]'
                  }`}
                  style={{
                    backgroundColor: activeFilter.includes(tag.id) ? '#708d81' : '#f0f2f0',
                    color: activeFilter.includes(tag.id) ? 'white' : '#708d81',
                    width: '120px',
                    marginLeft: index > 0 ? '24px' : '0',
                    cursor: 'pointer'
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
                  {tag.label}
                </button>
              );
            })}
          </div>
          
          {/* Categories buttons row - stacked vertically under subtags */}
          {/* Clicking an open category button closes it (same effect as X button) */}
          <div className="flex justify-center" style={{ marginTop: '16px' }}>
            {mainTags.filter(tag => tag.id !== 'all').map((tag, index) => {
              // Count categories for this specific subtag from selectedTags
              const selectedSubtagsCount = selectedTags.filter(tagName => 
                subTags[tag.id as keyof typeof subTags]?.includes(tagName)
              ).length;
              const isCategoryBoxOpen = openCategoryBoxes.includes(tag.id);
              
              return (
                <button
                  key={tag.id}
                  onClick={() => {
                    // Open bottom sheet for this category
                    setCurrentCategory(tag.id);
                    setShowBottomSheet(true);
                    setIsBottomSheetExpanded(false);
                    setBottomSheetHeight(300);
                  }}
                  className={`py-1 px-3 rounded-lg text-xs font-medium transition-colors cursor-pointer shadow-sm ${
                    isCategoryBoxOpen 
                      ? 'text-white' 
                      : 'text-[#708d81] hover:text-[#5a7268]'
                  }`}
                  style={{
                    backgroundColor: isCategoryBoxOpen ? '#708d81' : '#f0f2f0',
                    color: isCategoryBoxOpen ? 'white' : '#708d81',
                    marginLeft: index > 0 ? '24px' : '0',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isCategoryBoxOpen) {
                      e.currentTarget.style.backgroundColor = '#e8ebe8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isCategoryBoxOpen) {
                      e.currentTarget.style.backgroundColor = '#f0f2f0';
                    }
                  }}
                >
{tag.label} ({selectedSubtagsCount})
                </button>
              );
            })}
          </div>
          
          {/* Clear All button - positioned underneath Categories buttons and above Category boxes */}
          {/* This button is now moved above the Search bar */}
        </div>

        {/* iOS-Style Bottom Sheet for Category Selection */}
        {showBottomSheet && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowBottomSheet(false)}>
            {/* Category buttons spread across the dark overlay */}
            <div 
              className="absolute inset-0 p-8 pt-20 overflow-y-auto"
              style={{ 
                paddingBottom: `${bottomSheetHeight + 32}px`, // Add padding to avoid overlap with bottom sheet
                minHeight: '100vh', // Ensure full viewport height
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div 
                className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 flex-1"
                style={{
                  minHeight: 'fit-content',
                  width: '100%',
                  gridAutoRows: 'min-content'
                }}
              >
                {(() => {
                  const currentSubTags = subTags[currentCategory as keyof typeof subTags] || [];
                  console.log(`HomeTab: Rendering ${currentSubTags.length} subtags for category "${currentCategory}":`, currentSubTags);
                  return currentSubTags.map((subTag, index) => (
                    <button
                      key={subTag}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTagSelect(subTag);
                      }}
                      className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer text-center shadow-lg ${
                        selectedTags.includes(subTag)
                          ? 'text-white shadow-xl scale-105'
                          : 'text-[#708d81] hover:text-[#5a7268] hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: selectedTags.includes(subTag) ? '#708d81' : 'rgba(240, 242, 240, 0.95)',
                        color: selectedTags.includes(subTag) ? 'white' : '#708d81',
                        cursor: 'pointer',
                        backdropFilter: 'blur(10px)',
                        minHeight: '48px',
                        border: '1px solid rgba(112, 141, 129, 0.2)', // Debug border to see all buttons
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      {subTag}
                      {/* Debug indicator */}
                      <span style={{ 
                        position: 'absolute', 
                        top: '2px', 
                        right: '2px', 
                        fontSize: '8px', 
                        opacity: 0.5 
                      }}>
                        {index + 1}
                      </span>
                    </button>
                  ));
                })()}
              </div>
            </div>

            {/* Bottom Sheet */}
            <div 
              className="absolute bottom-0 left-0 right-0 bg-grey-light rounded-t-3xl shadow-2xl transition-all duration-300 ease-out"
              style={{ 
                height: `${bottomSheetHeight}px`,
                transform: isBottomSheetExpanded ? 'translateY(0)' : 'translateY(0)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle bar */}
              <div className="flex justify-center pt-4 pb-2">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>

              {/* Header with expand/collapse button */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-[#708d81]">
                  {currentCategory.charAt(0).toUpperCase() + currentCategory.slice(1)} Tags
                </h3>
                <button
                  onClick={() => {
                    setIsBottomSheetExpanded(!isBottomSheetExpanded);
                    setBottomSheetHeight(isBottomSheetExpanded ? 300 : 600);
                  }}
                  className="p-2 rounded-full bg-[#708d81] text-white hover:bg-[#5a7268] transition-colors"
                >
                  {isBottomSheetExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
              </div>

              {/* Selected tags display */}
              <div className="px-6 py-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedTags.filter(tag => subTags[currentCategory as keyof typeof subTags]?.includes(tag)).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#708d81] text-white text-sm rounded-full flex items-center gap-2"
                    >
                      {tag}
                      <button
                        onClick={() => handleTagSelect(tag)}
                        className="hover:bg-[#5a7268] rounded-full p-1"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      // Confirm selected tags
                      const categorySubtags = subTags[currentCategory as keyof typeof subTags] || [];
                      const tagsToConfirm = selectedTags.filter(tag => categorySubtags.includes(tag));
                      
                      setConfirmedTags(prev => [...new Set([...prev, ...tagsToConfirm])]);
                      
                      const mainCategoriesToSelect = new Set<string>();
                      tagsToConfirm.forEach(tag => {
                        const mainCategory = findMainCategoryForTag(tag);
                        if (mainCategory) {
                          mainCategoriesToSelect.add(mainCategory);
                        }
                      });
                      
                      const newActiveFilter = activeFilter.filter(f => f !== 'all');
                      mainCategoriesToSelect.forEach(mainCategory => {
                        if (!newActiveFilter.includes(mainCategory)) {
                          newActiveFilter.push(mainCategory);
                        }
                      });
                      
                      if (newActiveFilter.length > 0) {
                        handleCategoryChange(newActiveFilter);
                      }
                      
                      setShowBottomSheet(false);
                    }}
                    className="flex-1 py-3 bg-[#708d81] text-white rounded-xl font-medium hover:bg-[#5a7268] transition-colors"
                  >
                    Apply Filters ({selectedTags.filter(tag => subTags[currentCategory as keyof typeof subTags]?.includes(tag)).length})
                  </button>
                  <button
                    onClick={() => {
                      const tagsToRemove = subTags[currentCategory as keyof typeof subTags] || [];
                      setSelectedTags(prev => prev.filter(tag => !tagsToRemove.includes(tag)));
                      setConfirmedTags(prev => prev.filter(tag => !tagsToRemove.includes(tag)));
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex mt-4">
          {/* Left Panel - Filters */}
          {showLeftPanel && (
            <div className="w-60 bg-grey-light border-r border-[#708d81] p-4 mr-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#708d81]">Filters</h3>
                <button
                  onClick={() => setShowLeftPanel(false)}
                  className="p-1 text-[#708d81] opacity-60 rounded-lg transition-colors cursor-pointer"
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
                className="w-full py-2 px-4 text-[#708d81] rounded-lg transition-colors cursor-pointer"
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
          <div className="flex-1 mt-8">
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
                {getFilteredPostsBySubtags().map((post, index) => (
                  <div key={post.id} className={index === 0 ? 'mt-4' : ''}>
                    <PostCard post={post} />
                  </div>
                ))}
                
                {hasMore && (
                  <div className="text-center py-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className="px-6 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
    </div>
  );
};

export default HomeTab; 