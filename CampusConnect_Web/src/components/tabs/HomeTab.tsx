'use client';

import React, { useState, useEffect } from 'react';
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'goods' | 'services' | 'events' | 'housing' | 'tutoring'>('all');
  const [showNewPostModal, setShowNewPostModal] = useState(false);

  useEffect(() => {
    fetchPosts(1, true);
  }, [fetchPosts]);

  useEffect(() => {
    if (activeFilter !== 'all') {
      setFilters({ postType: activeFilter });
    } else {
      clearFilters();
    }
  }, [activeFilter, setFilters, clearFilters]);

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
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleTagClear = () => {
    setSelectedTags([]);
    clearFilters();
  };

  const filterTabs = [
    { id: 'all', label: 'All', count: filteredPosts.length },
    { id: 'goods', label: 'Goods', count: filteredPosts.filter(p => p.postType === 'goods').length },
    { id: 'services', label: 'Services', count: filteredPosts.filter(p => p.postType === 'services').length },
    { id: 'events', label: 'Events', count: filteredPosts.filter(p => p.postType === 'events').length },
    { id: 'housing', label: 'Housing', count: filteredPosts.filter(p => p.postType === 'housing').length },
    { id: 'tutoring', label: 'Tutoring', count: filteredPosts.filter(p => p.postType === 'tutoring').length },
  ];

  return (
    <div style={{ backgroundColor: '#f8f9f6' }}>
      {/* Search and Filter Header */}
      <div className="sticky top-16 bg-white border-b border-[#708d81] px-4 py-4 z-30">
        <div className="flex items-center space-x-3">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#708d81] opacity-60" size={20} />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="p-2 text-[#708d81] hover:text-[#5a7268] hover:bg-[#f0f2f0] rounded-lg transition-colors"
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-4">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === tab.id
                  ? 'bg-[#708d81] text-white'
                  : 'text-[#708d81] hover:bg-[#f0f2f0]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left Panel - Filters */}
        {showLeftPanel && (
          <div className="w-64 bg-white border-r border-[#708d81] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#708d81]">Filters</h3>
              <button
                onClick={() => setShowLeftPanel(false)}
                className="p-1 text-[#708d81] opacity-60 hover:opacity-100"
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
              className="w-full py-2 px-4 bg-[#f0f2f0] text-[#708d81] rounded-lg hover:bg-[#e8ebe8] transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Center - Posts Feed */}
        <div className="flex-1 px-4 py-4">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {isLoading && filteredPosts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#708d81]"></div>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#708d81] text-lg">No posts found</p>
              <p className="text-[#708d81] text-sm mt-2">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
              
              {hasMore && (
                <div className="text-center py-6">
                  <button
                    onClick={handleLoadMore}
                    disabled={isLoading}
                    className="px-6 py-2 bg-[#708d81] text-white rounded-lg hover:bg-[#5a7268] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Loading...' : 'Load More Posts'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Trending/Suggestions */}
        {showRightPanel && (
          <div className="w-80 bg-white border-l border-[#708d81] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#708d81]">Trending</h3>
              <button
                onClick={() => setShowRightPanel(false)}
                className="p-1 text-[#708d81] opacity-60 hover:opacity-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Trending Content */}
            <div className="space-y-4">
              <div className="p-3 bg-[#708d81] rounded-lg">
                <h4 className="text-white font-medium mb-2">Trending Posts</h4>
                <p className="text-white text-sm opacity-90">Popular content will appear here</p>
              </div>
              
              <div className="p-3 bg-[#708d81] rounded-lg">
                <h4 className="text-white font-medium mb-2">Suggestions</h4>
                <p className="text-white text-sm opacity-90">Personalized recommendations</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowNewPostModal(true)}
        className="fixed right-4 bottom-24 w-12 h-12 bg-[#708d81] text-white rounded-full shadow-lg hover:bg-[#5a7268] transition-colors flex items-center justify-center"
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default HomeTab; 