'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePostsStore } from '../../stores/postsStore';
import { apiService } from '../../services/api';
import TagSelector from '../ui/TagSelector';
import { ImageIcon, X, Tag, Calendar, Repeat, Clock, Hash, ShoppingBag, Wrench, Home } from 'lucide-react';

interface FormData {
  title: string;
  description: string;
  postType: 'goods' | 'services' | 'events' | 'housing';
  tags: string[];
  location: string;
  duration: string;
}

interface ValidationErrors {
  title?: string;
  description?: string;
  tags?: string;
  postType?: string;
  location?: string;
  duration?: string;
}

const CreatePostTab: React.FC = () => {
  const { createPost } = usePostsStore();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    postType: 'goods',
    tags: [],
    location: '',
    duration: 'ongoing', // Set default duration to ongoing
  });

  // Load saved post type from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPostType = localStorage.getItem('campusConnect_createPostType');
      if (savedPostType && ['goods', 'services', 'events', 'housing'].includes(savedPostType)) {
        setFormData(prev => ({ ...prev, postType: savedPostType as 'goods' | 'services' | 'events' | 'housing' }));
      }
    }
  }, []);

  // Save post type to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('campusConnect_createPostType', formData.postType);
    }
  }, [formData.postType]);

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);




  // Cleanup image URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreview.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreview]);
  const [offerRequestTags, setOfferRequestTags] = useState({
    goods: [] as string[],
    services: [] as string[],
    housing: [] as string[],
    events: [] as string[],
  });
  const [openCategoryBoxes, setOpenCategoryBoxes] = useState({
    goods: false,
    services: false,
    housing: false,
  });
  const [showTagSelector, setShowTagSelector] = useState(false);

  // Define sub-tags for each post type (same as Home tab)
  const subTags = {
    goods: [
      'Clothing', 'Parking Permits', 'Household Appliances', 'Electronics', 'Furniture', 'Concert Tickets', 'Kitchen Items', 'School Supplies', 'Sports Equipment', 
      'Automotive', 'Pets', 'Pet Supplies', 'Other'
    ],
    services: [
      'Transportation', 'Tutoring', 'Fitness Training', 'Meal Delivery', 'Cleaning', 'Photography', 'Graphic Design',
      'Tech Support', 'Web Development', 'Writing & Editing', 'Translation', 'Towing',
      'Other'
    ],
    events: [
      'Sports Events', 'Study Groups', 'Rush', 'Pickup Basketball', 'Philanthropy', 'Cultural Events',
      'Workshops', 'Conferences', 'Meetups', 'Game Nights', 'Movie Nights',
      'Hiking Trips', 'Volunteer Events', 'Career Fairs', 'Other'
    ],
    housing: [
      'Leasing', 'Subleasing', 'Roommate Search', 'Storage Space', 'Other'
    ]
  };

  // Function to get sub-tags for a specific post type
  const getSubTagsForPostType = (postType: string): string[] => {
    return subTags[postType as keyof typeof subTags] || [];
  };

  const postTypes = [
    { value: 'goods', label: 'Good', Icon: ShoppingBag },
    { value: 'services', label: 'Service', Icon: Wrench },
    { value: 'housing', label: 'Housing', Icon: Home },
    { value: 'events', label: 'Event', Icon: Calendar },
  ];



  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTags = localStorage.getItem('campusConnect_offerRequestTags');
      if (savedTags) {
        setOfferRequestTags(JSON.parse(savedTags));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('campusConnect_offerRequestTags', JSON.stringify(offerRequestTags));
    }
  }, [offerRequestTags]);

  // Load saved tags from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTags = localStorage.getItem('campusConnect_createPostTags');
      if (savedTags) {
        try {
          setFormData(prev => ({ ...prev, tags: JSON.parse(savedTags) }));
        } catch (error) {
          console.error('Failed to parse saved tags:', error);
        }
      }
    }
  }, []);

  // Save tags to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('campusConnect_createPostTags', JSON.stringify(formData.tags));
    }
  }, [formData.tags]);

  useEffect(() => {
    if (formData.postType) {
      setOpenCategoryBoxes(prev => ({
        ...prev,
        [formData.postType]: true
      }));
    }
  }, [formData.postType]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'postType') {
      setOfferRequestTags(prev => ({
        goods: [],
        services: [],
        housing: [],
        events: [],
      }));
    }
    
    // Clear validation errors
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleOfferRequestTagSelect = (tag: string) => {
    setOfferRequestTags(prev => ({
      ...prev,
      [formData.postType]: prev[formData.postType].includes(tag)
        ? prev[formData.postType].filter(t => t !== tag) // Deselect if already selected
        : [tag] // Select only this tag (deselect the other)
    }));
  };

  const handleTagSelect = (tagId: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(id => id !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const handleClearAllTags = () => {
    setFormData(prev => ({ ...prev, tags: [] }));
  };

  // File validation helper
  const validateImageFile = (file: File): string | null => {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return 'Image must be less than 10MB';
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select a valid image file';
    }
    
    return null;
  };

  // Convert data URL to File for upload (same as profile picture logic)
  const dataURLtoFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

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
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
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

  const removeImage = (index: number) => {
    setImagePreview(prev => {
      const imageToRemove = prev[index];
      // Clean up object URL if it's a blob URL to prevent memory leaks
      if (imageToRemove && imageToRemove.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove);
      }
      return prev.filter((_, i) => i !== index);
    });
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const areOfferRequestTagsAvailable = () => {
    return ['goods', 'services', 'housing'].includes(formData.postType);
  };

  const canSubmitForm = () => {
    // Check basic requirements only (offer/request validation moved to popup)
    if (!formData.title.trim() || !formData.description.trim()) {
      return false;
    }

    return true;
  };

  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    // Check for regular tags (offer/request validation is handled separately with popup)
    const hasRegularTags = formData.tags.length > 0;
    const hasOfferRequestTags = offerRequestTags[formData.postType as keyof typeof offerRequestTags]?.length > 0;
    
    if (!hasRegularTags && !hasOfferRequestTags) {
      errors.tags = 'Please select at least one category tag';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Check offer/request requirement first and show popup if missing
    const requiresOfferRequest = ['goods', 'services', 'housing'].includes(formData.postType);
    const hasOfferRequestTags = offerRequestTags[formData.postType as keyof typeof offerRequestTags]?.length > 0;
    
    if (requiresOfferRequest && !hasOfferRequestTags) {
      alert(`Please select either "Offer" or "Request" for ${formData.postType} posts`);
      return;
    }
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const combinedTags = [
        ...formData.tags,
        ...offerRequestTags[formData.postType as keyof typeof offerRequestTags]
      ];

      const postData = {
        ...formData,
        tags: combinedTags,
        images: imageFiles, // Include the actual image files
      };

      console.log('🚀 CreatePostTab sending to store:', {
        ...postData,
        images: imageFiles.map((file, i) => ({
          index: i,
          name: file.name,
          size: file.size,
          type: file.type,
          isFile: file instanceof File
        }))
      });
      
      console.log('🎯 About to call createPost store action...');
      await createPost(postData);
      console.log('✅ createPost store action completed');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        postType: 'goods',
        tags: [],
        location: '',
        duration: 'ongoing', // Reset to default duration
      });
      setOfferRequestTags({
        goods: [],
        services: [],
        housing: [],
        events: [],
      });
      
      // Clean up image URLs before clearing
      imagePreview.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
      setImagePreview([]);
      setImageFiles([]);
      setValidationErrors({});
      
      // Show success message or redirect
      alert('Post created successfully!');
      
      // Refresh user posts in profile if the function is available
      if (typeof (window as any).refreshUserPosts === 'function') {
        (window as any).refreshUserPosts();
      }
      
    } catch (error: any) {
      console.error('Error creating post:', error);
      
      // Show detailed validation errors if available
      if (error.isValidationError && error.details) {
        const errorMessages = error.details.map((detail: any) => 
          `${detail.field}: ${detail.message}`
        ).join('\n');
        
        alert(`Post Creation Failed - Validation Errors:\n\n${errorMessages}\n\nPlease fix these issues and try again.`);
      } else {
        // Show generic error for non-validation issues
        alert(`Failed to create post: ${error.message || 'Please try again.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-grey-medium">
      <div className="max-w-6xl mx-auto">
        {/* Post Type Buttons - Same row space as Search bar */}
        <div className="sticky top-0 bg-grey-medium border-b border-[#708d81] pr-8 pl-0 py-4 z-30">
          <div className="flex justify-start">
                                  <div className="flex gap-6" style={{ marginLeft: '16px' }}>
              {postTypes.map((type, index) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('postType', type.value)}
                  className={`w-20 h-20 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    formData.postType === type.value
                      ? 'text-white'
                      : 'text-[#708d81] hover:text-[#5a7268]'
                  } ${index > 0 ? 'ml-12' : ''} mx-3`}
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
                  <div className="text-center">
                    <div className="mb-1 flex justify-center">
                      <type.Icon size={28} strokeWidth={2} />
                    </div>
                    <div className="text-sm font-medium">{type.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
          </div>

        <div className="px-4 -mt-2">
          <form onSubmit={handleSubmit} className="space-y-1">
            {/* Main Description Box Container */}
            <div className="bg-grey-light rounded-lg border-2 border-gray-200 pr-4 pt-4 pb-4 relative">
                            {/* Top Section: Title, Icons, Offer/Request, and Location */}
              <div className="flex items-start gap-6 mb-6">
                {/* Title Section */}
                <div className="flex-1">
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 text-xl font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent text-gray-900"
                    placeholder="Give your post a clear title"
            />
            {validationErrors.title && (
                    <p className="mt-2 text-sm text-red-600">{validationErrors.title}</p>
            )}
          </div>


                
                                {/* Spacer */}
                <div className="w-3"></div>

                {/* Offer/Request Buttons */}
                {areOfferRequestTagsAvailable() && (
                  <div className="flex gap-3">
                    <button
                              type="button"
                              onClick={() => handleOfferRequestTagSelect('offer')}
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                                                  offerRequestTags[formData.postType].includes('offer')
                                  ? 'text-white'
                                  : 'text-[#708d81] hover:text-[#5a7268]'
                              }`}
                              style={{
                                                  backgroundColor: offerRequestTags[formData.postType].includes('offer') ? '#708d81' : '#f0f2f0',
                  color: offerRequestTags[formData.postType].includes('offer') ? 'white' : '#708d81',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                if (!offerRequestTags[formData.postType].includes('offer')) {
                                  e.currentTarget.style.backgroundColor = '#e8ebe8';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!offerRequestTags[formData.postType].includes('offer')) {
                                  e.currentTarget.style.backgroundColor = '#f0f2f0';
                                }
                              }}
                            >
                              Offer
                            </button>
                            
                            {/* Spacer */}
                            <div className="w-3"></div>
                            
                            <button
                              type="button"
                              onClick={() => handleOfferRequestTagSelect('request')}
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                                                  offerRequestTags[formData.postType].includes('request')
                                  ? 'text-white'
                                  : 'text-[#708d81] hover:text-[#5a7268]'
                              }`}
                              style={{
                                                  backgroundColor: offerRequestTags[formData.postType].includes('request') ? '#708d81' : '#f0f2f0',
                  color: offerRequestTags[formData.postType].includes('request') ? 'white' : '#708d81',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                if (!offerRequestTags[formData.postType].includes('request')) {
                                  e.currentTarget.style.backgroundColor = '#e8ebe8';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!offerRequestTags[formData.postType].includes('request')) {
                                  e.currentTarget.style.backgroundColor = '#f0f2f0';
                                }
                              }}
                            >
                              Request
                            </button>
                  </div>
                )}



                {/* Spacer */}
                <div className="w-3"></div>

                {/* Location Input and Image Icon */}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent text-sm text-gray-900"
                    placeholder="Location (optional)"
                  />
                  
                  {/* Image Upload Icon */}
                  <div className="text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload-top"
                    />
                    <label 
                      htmlFor="image-upload-top"
                      className={`relative p-3 hover:bg-grey-medium rounded-lg transition-all duration-200 inline-block ${
                        isUploadingImages ? 'cursor-wait opacity-50' : 'cursor-pointer hover:shadow-md'
                      }`}
                      title={isUploadingImages ? "Processing images..." : `Upload images (${imageFiles.length}/4)`}
                      style={{ cursor: isUploadingImages ? 'wait' : 'pointer' }}
                      onMouseEnter={(e) => {
                        if (!isUploadingImages) {
                          e.currentTarget.style.cursor = 'pointer';
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isUploadingImages) {
                          e.currentTarget.style.backgroundColor = '';
                        }
                      }}
                    >
                      <ImageIcon className="h-6 w-6 text-gray-600 hover:text-[#708d81] transition-colors" />
                      {isUploadingImages && (
                        <div className="absolute -top-1 -right-1 w-3 h-3">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#708d81]"></div>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Spacer */}
              <div className="h-6"></div>

              {/* Main Description Area */}
              <div className="mb-2">
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={8}
                            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent resize-none text-gray-900"
                            placeholder="Describe what you're offering or looking for..."
            />
            
            {/* Image Preview Inside Description Box */}
            {imagePreview.length > 0 && (
              <div className="mt-3 px-4 pb-3">
                <p className="text-xs text-gray-500 mb-2">
                  {imagePreview.length} image{imagePreview.length === 1 ? '' : 's'} selected (max 4)
                </p>
                <div className="flex flex-wrap gap-3">
                  {imagePreview.map((preview, index) => (
                    <div key={index} className="relative rounded-lg overflow-hidden bg-gray-100 shadow-sm">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="max-w-full h-auto"
                        style={{ 
                          maxHeight: '200px',
                          minWidth: '120px',
                          maxWidth: '250px'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 text-white rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md"
                        style={{ 
                          backgroundColor: 'var(--color-error)',
                          cursor: 'pointer',
                          border: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--color-error)';
                          e.currentTarget.style.transform = 'translateY(0px)';
                        }}
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {validationErrors.description && (
                            <p className="mt-2 text-sm text-red-600">{validationErrors.description}</p>
            )}
                          <p className="mt-2 text-xs text-gray-500 text-right">
              {formData.description.length}/500 characters
            </p>
          </div>

              {/* Bottom Section: Category Tags and Post Button */}
              <div className="flex items-start justify-between mt-8">
                {/* Category Tags Section - Expanded Width */}
                <div className="flex-1 p-4 bg-grey-medium rounded-lg border mr-6">

                  
                  {/* Category Box for selected Post Type */}
                  {formData.postType && (
                    <div className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden" style={{ width: '100%', height: '200px' }}>
                      {/* Header */}
                      <div className="flex items-center justify-center p-3 border-b border-gray-200">
                        <h3 className="text-base font-semibold text-[#708d81]">
                          {formData.postType ? formData.postType.charAt(0).toUpperCase() + formData.postType.slice(1) : 'Select Category'} Tags
                        </h3>
                      </div>

                      {/* Vertical scrollable category buttons for this post type */}
                      <div className="category-buttons-container p-4">
                        {getSubTagsForPostType(formData.postType).map((subTag) => (
                          <button
                            key={subTag}
                            type="button"
                            onClick={() => handleTagSelect(subTag)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                              formData.tags.includes(subTag)
                                ? 'text-white shadow-sm'
                                : 'text-[#708d81] hover:text-[#5a7268]'
                            }`}
                            style={{
                              backgroundColor: formData.tags.includes(subTag) ? '#708d81' : '#f0f2f0',
                              color: formData.tags.includes(subTag) ? 'white' : '#708d81',
                              cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => {
                              if (!formData.tags.includes(subTag)) {
                                e.currentTarget.style.backgroundColor = '#e8ebe8';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = formData.tags.includes(subTag) ? '#708d81' : '#f0f2f0';
                            }}
                          >
                            {subTag}
                          </button>
                        ))}
                      </div>

                      {/* Footer with actions for this post type - only show when there are tags */}
                      {formData.tags.filter(tag => getSubTagsForPostType(formData.postType).includes(tag)).length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-grey-medium">
                          <div className="flex justify-center space-x-2">
                            <button
                              onClick={() => {
                                // Clear tags for this specific post type only
                                const tagsToRemove = getSubTagsForPostType(formData.postType);
                                setFormData(prev => ({
                                  ...prev,
                                  tags: prev.tags.filter(tag => !tagsToRemove.includes(tag))
                                }));
                              }}
                              className="px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer"
                              style={{ backgroundColor: '#f0f2f0', color: '#708d81', cursor: 'pointer' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#e8ebe8';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#f0f2f0';
                              }}
                            >
                              Clear All ({formData.tags.filter(tag => getSubTagsForPostType(formData.postType).includes(tag)).length})
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {validationErrors.tags && (
                    <p className="mt-2 text-sm text-red-600">{validationErrors.tags}</p>
                  )}
                </div>



                {/* Post Button - Bottom Right */}
                <div className="w-fit">
                  <button
                    type="submit"
                    disabled={isLoading || !canSubmitForm()}
                    className="py-4 px-8 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-lg"
                    style={{ backgroundColor: '#708d81', color: 'white', cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      if (!isLoading && canSubmitForm()) {
                        e.currentTarget.style.backgroundColor = '#5a7268';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading && canSubmitForm()) {
                        e.currentTarget.style.backgroundColor = '#708d81';
                      }
                    }}
                  >
                    {isLoading ? 'Creating Post...' : 'Post'}
                  </button>
                </div>
              </div>

          </div>





            </form>
          </div>
        </div>



        
    </div>
  );
};

export default CreatePostTab; 