'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePostsStore } from '../../stores/postsStore';
import { apiService } from '../../services/api';
import TagSelector from '../ui/TagSelector';
import DurationSelector from '../ui/DurationSelector';
import { ImageIcon, X, Tag, Calendar, Repeat, Clock, Hash } from 'lucide-react';

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
    duration: '',
  });

  // Load saved post type from localStorage on component mount
  useEffect(() => {
    const savedPostType = localStorage.getItem('campusConnect_createPostType');
    if (savedPostType && ['goods', 'services', 'events', 'housing'].includes(savedPostType)) {
      setFormData(prev => ({ ...prev, postType: savedPostType as 'goods' | 'services' | 'events' | 'housing' }));
    }
  }, []);

  // Save post type to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('campusConnect_createPostType', formData.postType);
  }, [formData.postType]);

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
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
      'Clothing', 'Parking Permits', 'Electronics', 'Furniture', 'Kitchen Items', 'School Supplies', 'Sports Equipment', 
      'Automotive', 'Pets', 'Pet Supplies', 'Other'
    ],
    services: [
      'Transportation', 'Tutoring', 'Fitness Training', 'Meal Delivery', 'Cleaning', 'Photography', 'Graphic Design',
      'Tech Support', 'Web Development', 'Writing & Editing', 'Translation', 'Towing',
      'Other'
    ],
    events: [
      'Sports Events', 'Study Groups', 'Rush', 'Philanthropy', 'Cultural Events',
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
    { value: 'goods', label: 'Good', icon: '🛍️' },
    { value: 'services', label: 'Service', icon: '🔧' },
    { value: 'housing', label: 'Housing', icon: '🏠' },
    { value: 'events', label: 'Event', icon: '📅' },
  ];



  useEffect(() => {
    const savedTags = localStorage.getItem('campusConnect_offerRequestTags');
    if (savedTags) {
      setOfferRequestTags(JSON.parse(savedTags));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('campusConnect_offerRequestTags', JSON.stringify(offerRequestTags));
  }, [offerRequestTags]);

  // Load saved tags from localStorage on component mount
  useEffect(() => {
    const savedTags = localStorage.getItem('campusConnect_createPostTags');
    if (savedTags) {
      try {
        setFormData(prev => ({ ...prev, tags: JSON.parse(savedTags) }));
      } catch (error) {
        console.error('Failed to parse saved tags:', error);
      }
    }
  }, []);

  // Save tags to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('campusConnect_createPostTags', JSON.stringify(formData.tags));
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPreviews = Array.from(files).map(file => URL.createObjectURL(file));
      setImagePreview(prev => [...prev, ...newPreviews].slice(0, 4));
    }
  };

  const removeImage = (index: number) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const areOfferRequestTagsAvailable = () => {
    return ['goods', 'services', 'housing'].includes(formData.postType);
  };

  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    const hasRegularTags = formData.tags.length > 0;
    const hasOfferRequestTags = offerRequestTags[formData.postType as keyof typeof offerRequestTags]?.length > 0;
    
    if (!hasRegularTags && !hasOfferRequestTags) {
      errors.tags = 'Please select at least one category or offer/request tag';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
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
      };

      await createPost(postData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        postType: 'goods',
        tags: [],
        location: '',
        duration: '',
      });
      setOfferRequestTags({
        goods: [],
        services: [],
        housing: [],
        events: [],
      });
      setImagePreview([]);
      setValidationErrors({});
      
      // Show success message or redirect
      alert('Post created successfully!');
      
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Post Type Buttons - Same row space as Search bar */}
        <div className="sticky top-0 bg-white border-b border-[#708d81] pr-8 pl-0 py-4 z-30">
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
                    <div className="text-2xl mb-1">{type.icon}</div>
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
            <div className="bg-white rounded-lg border-2 border-gray-200 pr-4 pt-4 pb-4 relative">
                            {/* Top Section: Title, Icons, Offer/Request, and Location */}
              <div className="flex items-start gap-6 mb-6">
                {/* Title Section */}
                <div className="flex-1">
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 text-xl font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
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
                              onClick={() => handleOfferRequestTagSelect('Offer')}
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                offerRequestTags[formData.postType].includes('Offer')
                                  ? 'text-white'
                                  : 'text-[#708d81] hover:text-[#5a7268]'
                              }`}
                              style={{
                                backgroundColor: offerRequestTags[formData.postType].includes('Offer') ? '#708d81' : '#f0f2f0',
                                color: offerRequestTags[formData.postType].includes('Offer') ? 'white' : '#708d81',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                if (!offerRequestTags[formData.postType].includes('Offer')) {
                                  e.currentTarget.style.backgroundColor = '#e8ebe8';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!offerRequestTags[formData.postType].includes('Offer')) {
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
                              onClick={() => handleOfferRequestTagSelect('Request')}
                              className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                                offerRequestTags[formData.postType].includes('Request')
                                  ? 'text-white'
                                  : 'text-[#708d81] hover:text-[#5a7268]'
                              }`}
                              style={{
                                backgroundColor: offerRequestTags[formData.postType].includes('Request') ? '#708d81' : '#f0f2f0',
                                color: offerRequestTags[formData.postType].includes('Request') ? 'white' : '#708d81',
                                cursor: 'pointer'
                              }}
                              onMouseEnter={(e) => {
                                if (!offerRequestTags[formData.postType].includes('Request')) {
                                  e.currentTarget.style.backgroundColor = '#e8ebe8';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!offerRequestTags[formData.postType].includes('Request')) {
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
                    className="px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent text-sm"
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
                    <label htmlFor="image-upload-top" className="cursor-pointer" style={{ cursor: 'pointer' }}>
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors" style={{ cursor: 'pointer' }}>
                        <ImageIcon className="h-6 w-6 text-gray-600" />
                      </div>
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
                            className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent resize-none"
                            placeholder="Describe what you're offering or looking for..."
            />
            {validationErrors.description && (
                            <p className="mt-2 text-sm text-red-600">{validationErrors.description}</p>
            )}
                          <p className="mt-2 text-xs text-gray-500 text-right">
              {formData.description.length}/500 characters
            </p>
          </div>

              {/* Bottom Section: Category Tags, Duration, and Post Button */}
              <div className="flex items-start justify-between mt-8">
                {/* Category Tags Section - Bottom Left */}
                <div className="w-80 p-4 bg-gray-50 rounded-lg border">

                  
                  {/* Category Box for selected Post Type */}
                  {formData.postType && (
                    <div className="bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden" style={{ width: '300px', height: '400px' }}>
                      {/* Header */}
                      <div className="flex items-center justify-center p-3 border-b border-gray-200">
                        <h3 className="text-base font-semibold text-[#708d81]">
                          {formData.postType.charAt(0).toUpperCase() + formData.postType.slice(1)} Tags
                        </h3>
                      </div>

                      {/* Scrollable category buttons for this post type */}
                      <div className="category-buttons-container p-4">
                        {getSubTagsForPostType(formData.postType).map((subTag) => (
                          <button
                            key={subTag}
                            type="button"
                            onClick={() => handleTagSelect(subTag)}
                            className={`py-2 px-4 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
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

                      {/* Footer with actions for this post type */}
                      <div className="p-3 border-t border-gray-200 bg-gray-50">
                        <div className="flex justify-center space-x-2">
                          {formData.tags.filter(tag => getSubTagsForPostType(formData.postType).includes(tag)).length > 0 && (
                            <>

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
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {validationErrors.tags && (
                    <p className="mt-2 text-sm text-red-600">{validationErrors.tags}</p>
                  )}
                </div>

                {/* Duration Section - Bottom Center */}
                <div className="w-fit">
            <DurationSelector
              value={formData.duration}
              onChange={(duration: string) => handleInputChange('duration', duration)}
            />
          </div>

                {/* Post Button - Bottom Right */}
                <div className="w-fit">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-4 px-8 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-lg"
                    style={{ backgroundColor: '#708d81', color: 'white', cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#5a7268';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.currentTarget.style.backgroundColor = '#708d81';
                      }
                    }}
                  >
                    {isLoading ? 'Creating Post...' : 'Post'}
                  </button>
                </div>
              </div>

          </div>


            
            {/* Image Preview Grid */}
            {imagePreview.length > 0 && (
                <div className="mt-6">
                  <div className="grid grid-cols-4 gap-3">
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
                      className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
                </div>
            )}


            </form>
          </div>
        </div>

        
    </div>
  );
};

export default CreatePostTab; 