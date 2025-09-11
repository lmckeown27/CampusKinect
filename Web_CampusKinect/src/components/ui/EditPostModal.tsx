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
    'Clothing', 'Parking Permits', 'Household Appliances', 'Electronics', 'Furniture', 'Concert Tickets', 'Kitchen Items', 'School Supplies', 'Sports Equipment', 
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

  // File validation helper (copied from CreatePostTab)
  const validateImageFile = (file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'Please select only image files.';
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return 'Image size must be less than 10MB.';
    }
    return null;
  };

  // Convert data URL to File (copied from CreatePostTab)
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Image handling functions (copied exactly from CreatePostTab)
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate each file before processing
    for (const file of fileArray) {
      const validationError = validateImageFile(file);
      if (validationError) {
        alert(validationError);
        return;
      }
    }

    // Check total image limit (4 images max)
    const totalImages = imageFiles.length + fileArray.length;
    if (totalImages > 4) {
      alert(`You can only upload up to 4 images. You're trying to add ${fileArray.length} more to your existing ${imageFiles.length} images.`);
      return;
    }

    setIsUploadingImages(true);
    try {
      const processedImages: Promise<{ preview: string; file: File }>[] = fileArray.map(file => {
        return new Promise<{ preview: string; file: File }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = document.createElement('img');
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                  // Fallback: use original file if canvas fails
                  console.log('⚠️ Canvas context failed, using original file:', {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    isFile: file instanceof File
                  });
                  resolve({ preview: URL.createObjectURL(file), file });
                  return;
                }

                // Preserve aspect ratio - resize to fit within max dimensions
                const aspectRatio = img.width / img.height;
                const maxDimension = 600; // Maximum width or height
                let targetWidth: number;
                let targetHeight: number;

                // Calculate dimensions while preserving aspect ratio
                if (img.width > img.height) {
                  // Landscape: limit width, calculate height
                  targetWidth = Math.min(img.width, maxDimension);
                  targetHeight = Math.round(targetWidth / aspectRatio);
                } else {
                  // Portrait or square: limit height, calculate width
                  targetHeight = Math.min(img.height, maxDimension);
                  targetWidth = Math.round(targetHeight * aspectRatio);
                }

                // Ensure minimum dimensions for very small images
                const minDimension = 150;
                if (targetWidth < minDimension && targetHeight < minDimension) {
                  if (aspectRatio > 1) {
                    targetWidth = minDimension;
                    targetHeight = Math.round(minDimension / aspectRatio);
                  } else {
                    targetHeight = minDimension;
                    targetWidth = Math.round(minDimension * aspectRatio);
                  }
                }

                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // Draw the resized image maintaining aspect ratio
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                // Convert to data URL with good quality
                const resizedImageUrl = canvas.toDataURL('image/jpeg', 0.85);
                
                // Convert back to File for backend upload
                const processedFile = dataURLtoFile(resizedImageUrl, `post-image-${Date.now()}.jpg`);
                
                console.log('📸 Processed image file:', {
                  name: processedFile.name,
                  size: processedFile.size,
                  type: processedFile.type,
                  isFile: processedFile instanceof File
                });
                
                resolve({ preview: resizedImageUrl, file: processedFile });
              } catch (error) {
                console.error('Image processing error:', error);
                // Fallback: use original file
                console.log('🔄 Using original file as fallback:', {
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  isFile: file instanceof File
                });
                resolve({ preview: URL.createObjectURL(file), file });
              }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      });

      // Process all images
      const processedResults = await Promise.all(processedImages);
      
      // Update preview and file arrays
      setImagePreview(prev => [...prev, ...processedResults.map(r => r.preview)].slice(0, 4));
      setImageFiles(prev => [...prev, ...processedResults.map(r => r.file)].slice(0, 4));
      
      console.log(`Successfully processed ${processedResults.length} images for upload`);
      
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Failed to process one or more images. Please try again with different images.');
    } finally {
      setIsUploadingImages(false);
    }
    
    // Clear the input so the same file can be selected again if needed
    event.target.value = '';
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