'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePostsStore } from '@/stores/postsStore';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  X, 
  Calendar,
  Clock,
  Check
} from 'lucide-react';
import TagSelector from '../ui/TagSelector';
import DurationSelector from '../ui/DurationSelector';

export default function CreatePostTab() {
  const router = useRouter();
  const { addPost } = usePostsStore();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    postType: 'offer' as 'offer' | 'request' | 'event',
    durationType: 'one-time' as 'one-time' | 'recurring' | 'event',
    duration: 1,
    tags: [] as string[],
    images: [] as File[],
    eventStart: '',
    eventEnd: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024; // 5MB limit
      if (!isValid) {
        setErrors(prev => ({ ...prev, images: 'Please select valid image files (max 5MB each)' }));
      }
      return isValid;
    });

    if (validFiles.length + formData.images.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Maximum 5 images allowed' }));
      return;
    }

    setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));
    setErrors(prev => ({ ...prev, images: '' }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index) 
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.description.length > 5000) {
      newErrors.description = 'Description must be 5000 characters or less';
    }
    if (formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }
    if (formData.postType === 'event' && !formData.eventStart) {
      newErrors.eventStart = 'Event start date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // In a real app, this would call the API
      const newPost = {
        id: Date.now(), // Temporary ID
        title: formData.title,
        description: formData.description,
        postType: formData.postType,
        durationType: formData.durationType,
        duration: formData.duration,
        tags: formData.tags,
        images: formData.images.map(file => URL.createObjectURL(file)),
        eventStart: formData.eventStart,
        eventEnd: formData.eventEnd,
        // Mock other required fields
        userId: 1,
        universityId: 1,
        isFulfilled: false,
        isActive: true,
        viewCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: { id: 1, displayName: 'Current User' } as any,
        university: { name: 'University' } as any,
        engagementScore: 0,
        finalScore: 25,
        relativeGrade: 'C' as any,
      };

      addPost(newPost);
      router.push('/home');
    } catch (error) {
      console.error('Error creating post:', error);
      setErrors(prev => ({ ...prev, general: 'Failed to create post. Please try again.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">Create Post</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {errors.general}
          </div>
        )}

        {/* Post Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What are you posting?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'offer', label: 'Offer', icon: '🎁' },
              { value: 'request', label: 'Request', icon: '🙏' },
              { value: 'event', label: 'Event', icon: '🎉' }
            ].map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleInputChange('postType', type.value)}
                className={`p-3 border-2 rounded-lg text-center transition-colors ${
                  formData.postType === type.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-sm font-medium">{type.label}</div>
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
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Give your post a clear title..."
            maxLength={100}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
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
            rows={6}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Describe what you're offering, requesting, or the event details..."
            maxLength={5000}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description}</p>
            )}
            <span className="text-sm text-gray-500 ml-auto">
              {formData.description.length}/5000
            </span>
          </div>
        </div>

        {/* Post Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How long should this post be active?
          </label>
          <DurationSelector
            durationType={formData.durationType}
            duration={formData.duration}
            eventStart={formData.eventStart}
            eventEnd={formData.eventEnd}
            onDurationChange={(field, value) => handleInputChange(field, value)}
            errors={errors}
          />
        </div>

        {/* Tag Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tags *
          </label>
          
          {/* Show Offer/Request for Goods/Services */}
          {formData.postType !== 'event' && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Post Type</h4>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    const newTags = formData.tags.filter(tag => tag !== 'request');
                    handleInputChange('tags', [...newTags, 'offer']);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.tags.includes('offer')
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Offer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newTags = formData.tags.filter(tag => tag !== 'offer');
                    handleInputChange('tags', [...newTags, 'request']);
                  }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.tags.includes('request')
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Request
                </button>
              </div>
            </div>
          )}

          {/* Other Tags */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {formData.postType === 'event' ? 'Event Tags' : 'Other Tags'}
            </h4>
            <TagSelector
              selectedTags={formData.tags.filter(tag => !['offer', 'request'].includes(tag))}
              onTagSelect={(tags) => {
                const typeTags = formData.tags.filter(tag => ['offer', 'request'].includes(tag));
                handleInputChange('tags', [...typeTags, ...tags]);
              }}
              excludeTags={formData.postType === 'event' ? ['offer', 'request'] : []}
              placeholder="Search for tags..."
              maxTags={8}
            />
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600">{errors.tags}</p>
            )}
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Images (Optional)
          </label>
          <div className="space-y-3">
            {/* Image Upload Button */}
            <label className="block">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-400 transition-colors cursor-pointer">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload images or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, WEBP up to 5MB each (max 5 images)
                </p>
              </div>
            </label>

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.images && (
              <p className="text-sm text-red-600">{errors.images}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating Post...' : 'Create Post'}
          </button>
        </div>
      </form>
    </div>
  );
} 