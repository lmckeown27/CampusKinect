'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Post, CreatePostForm } from '../../types';
import DurationSelector from './DurationSelector';
import TagSelector from './TagSelector';

interface EditPostModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onSave: (postId: string, formData: Partial<CreatePostForm>) => void;
}

const EditPostModal: React.FC<EditPostModalProps> = ({ post, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<CreatePostForm>>({
    title: '',
    description: '',
    postType: 'goods',
    duration: 'one-time',
    location: '',
    tags: []
  });

  // Define all available tags from different categories (same as Create Post)
  const allAvailableTags = [
    // Goods
    'Clothing', 'Parking Permits', 'Electronics', 'Furniture', 'Concert Tickets', 'Kitchen Items', 'School Supplies', 'Sports Equipment', 
    'Automotive', 'Pets', 'Pet Supplies',
    // Services
    'Transportation', 'Tutoring', 'Fitness Training', 'Meal Delivery', 'Cleaning', 'Photography', 'Graphic Design',
    'Tech Support', 'Web Development', 'Writing & Editing', 'Translation', 'Towing',
    // Events
    'Sports Events', 'Study Groups', 'Rush', 'Pickup Basketball', 'Philanthropy', 'Cultural Events',
    'Workshops', 'Conferences', 'Meetups', 'Game Nights', 'Movie Nights',
    'Hiking Trips', 'Volunteer Events', 'Career Fairs',
    // Housing
    'Leasing', 'Subleasing', 'Roommate Search', 'Storage Space',
    // General
    'Other'
  ];

  // Initialize form data when post changes
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        description: post.description,
        postType: post.postType as any, // Handle type conversion
        duration: post.duration || 'one-time',
        location: post.location || '',
        tags: post.tags || []
      });
    }
  }, [post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(post.id, formData);
    onClose();
  };

  const handleInputChange = (field: keyof CreatePostForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Post</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200"
            style={{ backgroundColor: '#708d81', color: 'white', border: '2px solid #708d81', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a8c4a2'; e.currentTarget.style.border = '2px solid #a8c4a2'; e.currentTarget.style.cursor = 'pointer'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#708d81'; e.currentTarget.style.border = '2px solid #708d81'; e.currentTarget.style.cursor = 'pointer'; }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
              placeholder="What are you posting about?"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent resize-none"
              placeholder="Provide more details about your post..."
              required
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
              placeholder="Where is this happening?"
            />
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration *
            </label>
            <DurationSelector
              value={formData.duration || 'one-time'}
              onChange={(duration: string) => handleInputChange('duration', duration)}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <TagSelector
              selectedTags={formData.tags || []}
              onTagSelect={(tag: string) => {
                const currentTags = formData.tags || [];
                if (currentTags.includes(tag)) {
                  handleInputChange('tags', currentTags.filter(t => t !== tag));
                } else {
                  handleInputChange('tags', [...currentTags, tag]);
                }
              }}
              onClearAll={() => handleInputChange('tags', [])}
              availableTags={allAvailableTags}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end pt-4 border-t border-gray-200" style={{ gap: '20px' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg transition-all duration-200"
              style={{ backgroundColor: '#708d81', color: 'white', border: '2px solid #708d81', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a8c4a2'; e.currentTarget.style.border = '2px solid #a8c4a2'; e.currentTarget.style.cursor = 'pointer'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#708d81'; e.currentTarget.style.border = '2px solid #708d81'; e.currentTarget.style.cursor = 'pointer'; }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg transition-all duration-200"
              style={{ backgroundColor: '#708d81', color: 'white', border: '2px solid #708d81', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a8c4a2'; e.currentTarget.style.border = '2px solid #a8c4a2'; e.currentTarget.style.cursor = 'pointer'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#708d81'; e.currentTarget.style.border = '2px solid #708d81'; e.currentTarget.style.cursor = 'pointer'; }}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal; 