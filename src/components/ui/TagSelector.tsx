'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Check } from 'lucide-react';

interface TagSelectorProps {
  selectedTags: string[];
  onTagSelect: (tags: string[]) => void;
  excludeTags?: string[];
  placeholder?: string;
  maxTags?: number;
}

// Mock tags data - in real app this would come from API
const AVAILABLE_TAGS = [
  // Housing
  'sublease', 'roommate', 'apartment', 'house', 'dorm', 'off-campus',
  // Transportation
  'ride-share', 'carpool', 'bike', 'scooter', 'parking',
  // Academic
  'tutoring', 'study-group', 'textbook', 'notes', 'exam-prep', 'homework-help',
  // Events
  'party', 'concert', 'sports', 'club-meeting', 'workshop', 'seminar',
  // Services
  'cleaning', 'laundry', 'cooking', 'pet-sitting', 'tech-support',
  // Goods
  'furniture', 'electronics', 'clothing', 'books', 'kitchen-items',
  // Food
  'meal-plan', 'groceries', 'restaurant', 'catering', 'snacks'
];

export default function TagSelector({ 
  selectedTags, 
  onTagSelect, 
  excludeTags = [], 
  placeholder = "Search tags...",
  maxTags = 10
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Filter available tags based on excludeTags and search query
  const availableTags = useMemo(() => {
    return AVAILABLE_TAGS
      .filter(tag => !excludeTags.includes(tag))
      .filter(tag => 
        tag.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !selectedTags.includes(tag)
      )
      .slice(0, 20); // Limit results for performance
  }, [excludeTags, searchQuery, selectedTags]);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagSelect(selectedTags.filter(t => t !== tag));
    } else if (selectedTags.length < maxTags) {
      onTagSelect([...selectedTags, tag]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagSelect(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleClearAll = () => {
    onTagSelect([]);
  };

  return (
    <div className="relative">
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Selected Tags ({selectedTags.length}/{maxTags})
            </span>
            {selectedTags.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-red-600 hover:text-red-700"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tag Selection Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Tag Suggestions Dropdown */}
        {isOpen && availableTags.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            <div className="p-2">
              {availableTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => {
                    handleTagToggle(tag);
                    setSearchQuery('');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center justify-between"
                >
                  <span>{tag}</span>
                  <Check className="w-4 h-4 text-blue-600" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Popular Tags Suggestion */}
      {selectedTags.length === 0 && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Popular tags:</p>
          <div className="flex flex-wrap gap-1">
            {AVAILABLE_TAGS.slice(0, 8).map(tag => (
              <button
                key={tag}
                onClick={() => handleTagToggle(tag)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Max Tags Warning */}
      {selectedTags.length >= maxTags && (
        <p className="mt-2 text-xs text-amber-600">
          Maximum {maxTags} tags allowed
        </p>
      )}

      {/* Click outside to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
} 