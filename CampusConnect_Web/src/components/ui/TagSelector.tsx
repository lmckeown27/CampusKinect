'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface TagSelectorProps {
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onClearAll: () => void;
  availableTags?: string[];
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagSelect,
  onClearAll,
  availableTags,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Use provided availableTags or fall back to default popular tags
  const popularTags = availableTags || [
    'textbooks', 'furniture', 'electronics', 'clothing', 'sports',
    'tutoring', 'study-group', 'roommate', 'sublease', 'carpool',
    'events', 'parties', 'clubs', 'volunteer', 'internship'
  ];

  const filteredTags = popularTags.filter(tag =>
    tag.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedTags.includes(tag)
  );

  const handleTagSelect = (tag: string) => {
    onTagSelect(tag);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#708d81] opacity-60" size={16} />
        <input
          type="text"
          placeholder="Search or create tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/2 pl-9 pr-4 py-2 text-sm border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
        />
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mt-4">
          <span className="text-sm font-medium text-[#708d81]">Selected Tags</span>
          <div className="flex flex-wrap mt-3">
            {selectedTags.map((tag, index) => (
              <span
                key={tag}
                className={`px-4 py-2 bg-[#708d81] text-white text-sm rounded-full flex items-center space-x-2 ${index > 0 ? 'ml-4' : ''}`}
              >
                <span>{tag}</span>
                <button
                  onClick={() => onTagSelect(tag)}
                  className="ml-2 hover:text-[#f0f2f0] transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {searchQuery && (
        <div className="mt-4">
          <span className="text-sm font-medium text-[#708d81]">Popular Tags</span>
          <div className="flex flex-wrap mt-3">
            {filteredTags.map((tag, index) => (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className={`px-4 py-2 bg-[#f0f2f0] text-[#708d81] text-sm rounded-full hover:bg-[#e8ebe8] transition-colors cursor-pointer ${index > 0 ? 'ml-4' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
          
          {filteredTags.length === 0 && (
            <div className="mt-3">
              <p className="text-sm text-[#708d81] opacity-70">No tags found matching "{searchQuery}"</p>
              <p className="text-sm text-[#708d81] opacity-70">Type "tag" to add a new tag</p>
            </div>
          )}
        </div>
      )}

      {/* Quick Add Section */}
      <div className="pt-3 border-t border-[#708d81]">
        <span className="text-sm font-medium text-[#708d81] mb-3 block">Quick Add</span>
        <div className="flex flex-wrap gap-3">
          {popularTags.slice(0, 3).map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagSelect(tag)}
              className="px-4 py-2 bg-green-100 text-green-800 text-sm rounded-full hover:bg-green-200 transition-colors cursor-pointer"
            >
              + #{tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TagSelector; 