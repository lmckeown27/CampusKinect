'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Image } from 'lucide-react';
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

  // Image handling state (same as CreatePost)
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for offer/request tags (same as CreatePost)
  const [offerRequestTags, setOfferRequestTags] = useState({
    goods: [] as string[],
    services: [] as string[],
    housing: [] as string[],
    events: [] as string[],
  });

  // Post type options (same as CreatePost)
  const postTypes = [
    { value: 'goods', label: 'Good', icon: '🛍️' },
    { value: 'services', label: 'Service', icon: '🔧' },
    { value: 'housing', label: 'Housing', icon: '🏠' },
    { value: 'events', label: 'Event', icon: '📅' },
  ];

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

      // Initialize offer/request tags based on existing post tags
      const newOfferRequestTags = {
        goods: [] as string[],
        services: [] as string[],
        housing: [] as string[],
        events: [] as string[],
      };

      if (post.tags) {
        const postType = post.postType as keyof typeof newOfferRequestTags;
        if (postType in newOfferRequestTags) {
          if (post.tags.includes('offer')) {
            newOfferRequestTags[postType].push('offer');
          }
          if (post.tags.includes('request')) {
            newOfferRequestTags[postType].push('request');
          }
        }
      }

      setOfferRequestTags(newOfferRequestTags);
    }
  }, [post]);

  // Cleanup image previews when modal closes
  useEffect(() => {
    if (!isOpen) {
      setImagePreview([]);
      setImageFiles([]);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Include images in the form data
    const submitData = {
      ...formData,
      images: imageFiles.length > 0 ? imageFiles : undefined
    };
    
    onSave(post.id, submitData);
    onClose();
  };

  const handleInputChange = (field: keyof CreatePostForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear offer/request tags when changing post type
    if (field === 'postType') {
      setOfferRequestTags({
        goods: [],
        services: [],
        housing: [],
        events: [],
      });
    }
  };

  const handleOfferRequestTagSelect = (tag: string) => {
    const postType = formData.postType as keyof typeof offerRequestTags;
    if (!postType || postType === 'events') return; // Events don't have offer/request

    setOfferRequestTags(prev => ({
      ...prev,
      [postType]: prev[postType].includes(tag)
        ? prev[postType].filter(t => t !== tag) // Deselect if already selected
        : [tag] // Select only this tag (deselect the other)
    }));

    // Update formData tags to include/exclude offer/request
    const currentTags = formData.tags || [];
    const otherOfferRequestTag = tag === 'offer' ? 'request' : 'offer';
    
    let updatedTags = currentTags.filter(t => t !== 'offer' && t !== 'request');
    if (!offerRequestTags[postType].includes(tag)) {
      updatedTags.push(tag);
    }

    setFormData(prev => ({
      ...prev,
      tags: updatedTags
    }));
  };

  // Image handling functions (same as CreatePost)
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Check total image limit (4 images max)
    const totalImages = imageFiles.length + fileArray.length;
    if (totalImages > 4) {
      alert(`You can only upload up to 4 images. You're trying to add ${fileArray.length} more to your existing ${imageFiles.length} images.`);
      return;
    }

    try {
      // Process all files with Promise.all to avoid race conditions
      const processedImages = await Promise.all(
        fileArray.map(file => {
          return new Promise<{ preview: string; file: File }>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const imageUrl = e.target?.result as string;
              resolve({ preview: imageUrl, file });
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
          });
        })
      );

      // Update state once with all processed images
      const previews = processedImages.map(img => img.preview);
      const files = processedImages.map(img => img.file);
      
      setImagePreview(prev => [...prev, ...previews]);
      setImageFiles(prev => [...prev, ...files]);

    } catch (error) {
      console.error('Error processing images:', error);
      alert('Failed to process one or more images. Please try again.');
    }

    // Clear the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    // Clean up the blob URL to prevent memory leaks
    const previewUrl = imagePreview[index];
    if (previewUrl && previewUrl.startsWith('data:')) {
      // For data URLs from FileReader, no cleanup needed
    }
    
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
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
          {/* Post Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Post Type *
            </label>
            <div className="flex gap-4">
              {postTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('postType', type.value)}
                  className={`flex flex-col items-center justify-center w-20 h-20 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    formData.postType === type.value
                      ? 'text-white'
                      : 'text-[#708d81] hover:text-[#5a7268]'
                  }`}
                  style={{
                    backgroundColor: formData.postType === type.value ? '#708d81' : '#f0f2f0',
                    color: formData.postType === type.value ? 'white' : '#708d81',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.postType !== type.value) {
                      e.currentTarget.style.backgroundColor = '#e8ebe8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.postType !== type.value) {
                      e.currentTarget.style.backgroundColor = '#f0f2f0';
                    }
                  }}
                >
                  <span className="text-2xl mb-1">{type.icon}</span>
                  <span className="text-xs">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Offer/Request Tags (for goods, services, housing only) */}
          {formData.postType && formData.postType !== 'events' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type of {formData.postType?.charAt(0).toUpperCase() + formData.postType?.slice(1)}
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleOfferRequestTagSelect('offer')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    offerRequestTags[formData.postType as keyof typeof offerRequestTags]?.includes('offer')
                      ? 'text-white'
                      : 'text-[#708d81] hover:text-[#5a7268]'
                  }`}
                  style={{
                    backgroundColor: offerRequestTags[formData.postType as keyof typeof offerRequestTags]?.includes('offer') ? '#708d81' : '#f0f2f0',
                    color: offerRequestTags[formData.postType as keyof typeof offerRequestTags]?.includes('offer') ? 'white' : '#708d81',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!offerRequestTags[formData.postType as keyof typeof offerRequestTags]?.includes('offer')) {
                      e.currentTarget.style.backgroundColor = '#e8ebe8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!offerRequestTags[formData.postType as keyof typeof offerRequestTags]?.includes('offer')) {
                      e.currentTarget.style.backgroundColor = '#f0f2f0';
                    }
                  }}
                >
                  Offer
                </button>
                <button
                  type="button"
                  onClick={() => handleOfferRequestTagSelect('request')}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    offerRequestTags[formData.postType as keyof typeof offerRequestTags]?.includes('request')
                      ? 'text-white'
                      : 'text-[#708d81] hover:text-[#5a7268]'
                  }`}
                  style={{
                    backgroundColor: offerRequestTags[formData.postType as keyof typeof offerRequestTags]?.includes('request') ? '#708d81' : '#f0f2f0',
                    color: offerRequestTags[formData.postType as keyof typeof offerRequestTags]?.includes('request') ? 'white' : '#708d81',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!offerRequestTags[formData.postType as keyof typeof offerRequestTags]?.includes('request')) {
                      e.currentTarget.style.backgroundColor = '#e8ebe8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!offerRequestTags[formData.postType as keyof typeof offerRequestTags]?.includes('request')) {
                      e.currentTarget.style.backgroundColor = '#f0f2f0';
                    }
                  }}
                >
                  Request
                </button>
              </div>
            </div>
          )}

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

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (Optional)
            </label>
            
            {/* Image Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#708d81] transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Image 
                    className="h-12 w-12 text-gray-400 cursor-pointer hover:text-[#708d81] transition-colors" 
                    onClick={handleImageClick}
                  />
                </div>
                <div>
                  <button
                    type="button"
                    onClick={handleImageClick}
                    className="text-[#708d81] hover:text-[#5a7268] font-medium transition-colors"
                  >
                    Click to upload images
                  </button>
                  <p className="text-sm text-gray-500 mt-1">
                    Up to 4 images, 10MB each
                  </p>
                </div>
              </div>
            </div>

            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {imagePreview.map((src, index) => (
                  <div key={index} className="relative">
                    <img
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
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