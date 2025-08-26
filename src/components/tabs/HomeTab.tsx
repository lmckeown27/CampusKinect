'use client';

import React, { useState, useEffect } from 'react';
import { usePostsStore } from '@/stores/postsStore';
import { Post, HomeTab as HomeTabType } from '@/types';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import PostCard from '../ui/PostCard';
import TagSelector from '../ui/TagSelector';

export default function HomeTab() {
  const { 
    posts, 
    filters, 
    isLoading, 
    error, 
    hasMore,
    fetchPosts, 
    setMainTab, 
    setSubTab,
    setTags,
    setSearch 
  } = usePostsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    // Update store filters when local state changes
    if (searchQuery !== filters.search) {
      setSearch(searchQuery);
    }
    if (JSON.stringify(selectedTags) !== JSON.stringify(filters.tags)) {
      setTags(selectedTags);
    }
  }, [searchQuery, selectedTags, filters.search, filters.tags, setSearch, setTags]);

  const handleMainTabChange = (tab: HomeTabType) => {
    setMainTab(tab);
    setSelectedTags([]);
    
    // Show appropriate side panel
    if (tab === 'goods-services') {
      setShowLeftPanel(true);
      setShowRightPanel(false);
    } else if (tab === 'events') {
      setShowLeftPanel(false);
      setShowRightPanel(true);
    } else {
      setShowLeftPanel(false);
      setShowRightPanel(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchPosts(filters, true);
    }
  };

  const handleTagSelect = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const renderSidePanel = () => {
    if (filters.mainTab === 'goods-services' && showLeftPanel) {
      return (
        <div className="fixed left-0 top-16 bottom-20 w-80 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Filter by Tags</h3>
            
            {/* Offer/Request Section */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Post Type</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setSubTab('offer')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filters.subTab === 'offer' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Offer
                </button>
                <button
                  onClick={() => setSubTab('request')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filters.subTab === 'request' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Request
                </button>
              </div>
            </div>

            {/* Other Tags Section */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Other Tags</h4>
              <TagSelector
                selectedTags={selectedTags}
                onTagSelect={handleTagSelect}
                excludeTags={['offer', 'request']}
              />
            </div>
          </div>
        </div>
      );
    }

    if (filters.mainTab === 'events' && showRightPanel) {
      return (
        <div className="fixed right-0 top-16 bottom-20 w-80 bg-white border-l border-gray-200 z-40 transform transition-transform duration-300 ease-in-out">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Event Tags</h3>
            <TagSelector
              selectedTags={selectedTags}
              onTagSelect={handleTagSelect}
              excludeTags={['offer', 'request']}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="flex justify-center">
          <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => handleMainTabChange('goods-services')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.mainTab === 'goods-services'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Goods/Services
            </button>
            <button
              onClick={() => handleMainTabChange('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.mainTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleMainTabChange('events')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.mainTab === 'events'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Events
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Side Panel Toggle Buttons */}
      <div className="fixed top-20 left-4 z-50">
        {filters.mainTab === 'goods-services' && (
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="bg-white p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {showLeftPanel ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        )}
      </div>

      <div className="fixed top-20 right-4 z-50">
        {filters.mainTab === 'events' && (
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="bg-white p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {showRightPanel ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Side Panels */}
      {renderSidePanel()}

      {/* Posts Content */}
      <div className={`px-4 py-6 ${showLeftPanel || showRightPanel ? 'mx-80' : ''}`}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {isLoading && posts.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 

import React, { useState, useEffect } from 'react';
import { usePostsStore } from '@/stores/postsStore';
import { Post, HomeTab as HomeTabType } from '@/types';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import PostCard from '../ui/PostCard';
import TagSelector from '../ui/TagSelector';

export default function HomeTab() {
  const { 
    posts, 
    filters, 
    isLoading, 
    error, 
    hasMore,
    fetchPosts, 
    setMainTab, 
    setSubTab,
    setTags,
    setSearch 
  } = usePostsStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showLeftPanel, setShowLeftPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    // Update store filters when local state changes
    if (searchQuery !== filters.search) {
      setSearch(searchQuery);
    }
    if (JSON.stringify(selectedTags) !== JSON.stringify(filters.tags)) {
      setTags(selectedTags);
    }
  }, [searchQuery, selectedTags, filters.search, filters.tags, setSearch, setTags]);

  const handleMainTabChange = (tab: HomeTabType) => {
    setMainTab(tab);
    setSelectedTags([]);
    
    // Show appropriate side panel
    if (tab === 'goods-services') {
      setShowLeftPanel(true);
      setShowRightPanel(false);
    } else if (tab === 'events') {
      setShowLeftPanel(false);
      setShowRightPanel(true);
    } else {
      setShowLeftPanel(false);
      setShowRightPanel(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchPosts(filters, true);
    }
  };

  const handleTagSelect = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const renderSidePanel = () => {
    if (filters.mainTab === 'goods-services' && showLeftPanel) {
      return (
        <div className="fixed left-0 top-16 bottom-20 w-80 bg-white border-r border-gray-200 z-40 transform transition-transform duration-300 ease-in-out">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Filter by Tags</h3>
            
            {/* Offer/Request Section */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Post Type</h4>
              <div className="space-y-2">
                <button
                  onClick={() => setSubTab('offer')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filters.subTab === 'offer' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Offer
                </button>
                <button
                  onClick={() => setSubTab('request')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    filters.subTab === 'request' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  Request
                </button>
              </div>
            </div>

            {/* Other Tags Section */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Other Tags</h4>
              <TagSelector
                selectedTags={selectedTags}
                onTagSelect={handleTagSelect}
                excludeTags={['offer', 'request']}
              />
            </div>
          </div>
        </div>
      );
    }

    if (filters.mainTab === 'events' && showRightPanel) {
      return (
        <div className="fixed right-0 top-16 bottom-20 w-80 bg-white border-l border-gray-200 z-40 transform transition-transform duration-300 ease-in-out">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Event Tags</h3>
            <TagSelector
              selectedTags={selectedTags}
              onTagSelect={handleTagSelect}
              excludeTags={['offer', 'request']}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="flex justify-center">
          <div className="flex space-x-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => handleMainTabChange('goods-services')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.mainTab === 'goods-services'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Goods/Services
            </button>
            <button
              onClick={() => handleMainTabChange('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.mainTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleMainTabChange('events')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.mainTab === 'events'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Events
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Side Panel Toggle Buttons */}
      <div className="fixed top-20 left-4 z-50">
        {filters.mainTab === 'goods-services' && (
          <button
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="bg-white p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {showLeftPanel ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        )}
      </div>

      <div className="fixed top-20 right-4 z-50">
        {filters.mainTab === 'events' && (
          <button
            onClick={() => setShowRightPanel(!showRightPanel)}
            className="bg-white p-2 rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            {showRightPanel ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Side Panels */}
      {renderSidePanel()}

      {/* Posts Content */}
      <div className={`px-4 py-6 ${showLeftPanel || showRightPanel ? 'mx-80' : ''}`}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {isLoading && posts.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
            
            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 