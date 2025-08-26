'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface TagSelectorProps {
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onClearAll: () => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagSelect,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock popular tags - in real app, these would come from the backend
  const popularTags = [
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
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          type="text"
          placeholder="Search tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Selected Tags</span>
            <button
              onClick={onClearAll}
              className="text-xs text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                <span>#{tag}</span>
                <button
                  onClick={() => onTagSelect(tag)}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Available Tags */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">Popular Tags</span>
        
        {filteredTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filteredTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        ) : searchQuery ? (
          <p className="text-sm text-gray-500">No tags found matching "{searchQuery}"</p>
        ) : (
          <p className="text-sm text-gray-500">All popular tags are selected</p>
        )}
      </div>

      {/* Quick Add Common Tags */}
      {selectedTags.length === 0 && (
        <div className="pt-2 border-t border-gray-200">
          <span className="text-sm font-medium text-gray-700 mb-2 block">Quick Add</span>
          <div className="flex flex-wrap gap-2">
            {['textbooks', 'furniture', 'tutoring'].map((tag) => (
              <button
                key={tag}
                onClick={() => handleTagSelect(tag)}
                className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full hover:bg-green-200 transition-colors"
              >
                + #{tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagSelector; 