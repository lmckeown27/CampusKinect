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
        <div style={{ marginTop: '32px' }}>
          <span className="text-sm font-medium text-[#708d81]">Selected Tags</span>
          <div className="flex flex-wrap mt-3" style={{ gap: '12px' }}>
            {selectedTags.map((tag, index) => (
              <span
                key={tag}
                className="px-4 py-2 bg-[#708d81] text-white text-sm rounded-full flex items-center"
                style={{ gap: '10px' }}
              >
                <span>{tag}</span>
                <button
                  onClick={() => onTagSelect(tag)}
                  className="p-1 rounded transition-all duration-200"
                  style={{ backgroundColor: '#a8c4a2', color: 'white', border: '1px solid #a8c4a2', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#708d81'; e.currentTarget.style.border = '1px solid #708d81'; e.currentTarget.style.cursor = 'pointer'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#a8c4a2'; e.currentTarget.style.border = '1px solid #a8c4a2'; e.currentTarget.style.cursor = 'pointer'; }}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Popular Tags - Always shown */}
      <div className="mt-4">
        <span className="text-sm font-medium text-[#708d81]">
          {searchQuery ? 'Search Results' : 'Popular Tags'}
        </span>
        <div className="flex flex-wrap gap-2 mt-3">
          {filteredTags.map((tag, index) => (
            <button
              key={tag}
              onClick={() => handleTagSelect(tag)}
              className="px-4 py-2 bg-[#f0f2f0] text-[#708d81] text-sm rounded-full hover:bg-[#e8ebe8] transition-colors cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
        
        {searchQuery && filteredTags.length === 0 && (
          <div className="mt-3">
            <p className="text-sm text-[#708d81] opacity-70">No tags found matching "{searchQuery}"</p>
            <button
              onClick={() => handleTagSelect(searchQuery)}
              className="mt-2 px-4 py-2 bg-[#708d81] text-white text-sm rounded-full hover:bg-[#5a7268] transition-colors cursor-pointer"
            >
              Add "{searchQuery}" as tag
            </button>
          </div>
        )}
      </div>


    </div>
  );
};

export default TagSelector; 