'use client';

import React, { useState } from 'react';
import { usePostsStore } from '../../stores/postsStore';
import { CreatePostForm } from '../../types';
import TagSelector from '../ui/TagSelector';
import DurationSelector from '../ui/DurationSelector';
import { Plus, X, Calendar, MapPin, Tag, Clock, Image as ImageIcon, AlertCircle } from 'lucide-react';

const CreatePostTab: React.FC = () => {
  const { createPost, isLoading, error } = usePostsStore();
  
  const [formData, setFormData] = useState<CreatePostForm>({
    title: '',
    description: '',
    postType: 'goods',
    duration: 'one-time',
    location: '',
    tags: [],
    images: [],
  });

  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: keyof CreatePostForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size must be less than 5MB');
        return false;
      }
      if (!file.type.startsWith('image/')) {
        alert('Please select only image files');
        return false;
      }
      return true;
    });

    if (validFiles.length + (formData.images?.length || 0) > 4) {
      alert('Maximum 4 images allowed');
      return;
    }

    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...validFiles]
    }));

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    if (formData.description.length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    if (formData.tags.length === 0) {
      errors.tags = 'At least one tag is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createPost(formData);
      // Reset form after successful creation
      setFormData({
        title: '',
        description: '',
        postType: 'goods',
        duration: 'one-time',
        location: '',
        tags: [],
        images: [],
      });
      setImagePreview([]);
      setValidationErrors({});
      alert('Post created successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  const postTypes = [
    { value: 'goods', label: 'Goods', icon: '📦' },
    { value: 'services', label: 'Services', icon: '🔧' },
    { value: 'events', label: 'Events', icon: '��' },
    { value: 'housing', label: 'Housing', icon: '🏠' },
    { value: 'tutoring', label: 'Tutoring', icon: '📚' },
  ];

  return (
    <div className="py-6" style={{ backgroundColor: '#f8f9f6' }}>
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#708d81]">Create New Post</h1>
          <p className="text-[#708d81] opacity-70">What&apos;s on your mind?</p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="text-red-500" size={20} />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Create Post Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Post Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('postType', type.value)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    formData.postType === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-xs font-medium">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter a descriptive title for your post"
            />
            {validationErrors.title && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.title}</p>
            )}
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                validationErrors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Provide detailed information about your post..."
            />
            {validationErrors.description && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <DurationSelector
              value={formData.duration}
              onChange={(duration: string) => handleInputChange('duration', duration)}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Campus Library, Student Center"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags *
            </label>
            <TagSelector
              selectedTags={formData.tags}
              onTagSelect={(tag: string) => {
                if (!formData.tags.includes(tag)) {
                  handleInputChange('tags', [...formData.tags, tag]);
                }
              }}
              onClearAll={() => handleInputChange('tags', [])}
            />
            {validationErrors.tags && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.tags}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (Optional)
            </label>
            
            {/* Image Preview Grid */}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {imagePreview.length < 4 && (
              <label className="block w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="space-y-2">
                  <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-500">
                      Click to upload
                    </span>{' '}
                    or drag and drop
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB each (max 4 images)
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating Post...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostTab; 