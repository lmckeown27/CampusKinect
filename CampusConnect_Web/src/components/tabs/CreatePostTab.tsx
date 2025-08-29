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

  const postTypes = [
    { value: 'goods', label: 'Good', icon: '🛍️' },
    { value: 'services', label: 'Service', icon: '🔧' },
    { value: 'events', label: 'Event', icon: '📅' },
    { value: 'housing', label: 'Housing', icon: '🏠' },
  ];

  const mainTags = [
    { id: 'books', label: 'Books', category: 'goods' },
    { id: 'electronics', label: 'Electronics', category: 'goods' },
    { id: 'clothing', label: 'Clothing', category: 'goods' },
    { id: 'furniture', label: 'Furniture', category: 'goods' },
    { id: 'housing', label: 'Housing', category: 'goods' },
    { id: 'tutoring', label: 'Tutoring', category: 'services' },
    { id: 'transportation', label: 'Transportation', category: 'services' },
    { id: 'cleaning', label: 'Cleaning', category: 'services' },
    { id: 'catering', label: 'Catering', category: 'services' },
    { id: 'parties', label: 'Parties', category: 'events' },
    { id: 'meetups', label: 'Meetups', category: 'events' },
    { id: 'workshops', label: 'Workshops', category: 'events' },
  ];

  useEffect(() => {
    const savedTags = localStorage.getItem('offerRequestTags');
    if (savedTags) {
      setOfferRequestTags(JSON.parse(savedTags));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('offerRequestTags', JSON.stringify(offerRequestTags));
  }, [offerRequestTags]);

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
                  <label htmlFor="image-upload-top" className="cursor-pointer">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <ImageIcon className="h-6 w-6 text-gray-600" />
                    </div>
                  </label>
                </div>
                
                {/* Offer/Request Buttons */}
                {areOfferRequestTagsAvailable() && (
                                              <div className="flex gap-6">
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

                {/* Location Input and Tags Button */}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="px-6 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent text-sm"
                    placeholder="Location (optional)"
                  />
                  
                  {/* Tags Button */}
                  <button
                    type="button"
                    onClick={() => setShowTagSelector(!showTagSelector)}
                    className="px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    style={{ backgroundColor: '#f0f2f0' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e8ebe8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f2f0';
                    }}
                  >
                    Tags
                  </button>
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

              {/* Duration row */}
              <div className="flex items-start justify-between -mt-4">
                {/* Left side: Duration Selector */}
                <div className="w-fit">
                  <DurationSelector
                    value={formData.duration}
                    onChange={(duration: string) => handleInputChange('duration', duration)}
                  />
                </div>

                {/* Center: Duration Details Display */}
                {formData.duration && (
                  <div className="bg-[#f8f9f6] border border-[#708d81] rounded-lg p-4 max-w-md">
                    {formData.duration === 'one-time' && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Calendar size={20} className="text-[#708d81]" />
                          <span className="text-sm font-medium text-[#708d81]">Event Date</span>
                        </div>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    )}
                    
                    {formData.duration === 'recurring' && (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Repeat size={20} className="text-[#708d81]" />
                          <span className="text-sm font-medium text-[#708d81]">Recurring Pattern</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <select className="px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                          <select className="px-3 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent">
                            <option value="1">Every 1</option>
                            <option value="2">Every 2</option>
                            <option value="3">Every 3</option>
                          </select>
                        </div>
                      </div>
                    )}
                    
                    {formData.duration === 'indefinite' && (
                      <div className="flex items-center space-x-2">
                        <Calendar size={20} className="text-[#708d81]" />
                        <span className="text-sm font-medium text-[#708d81]">Ongoing - No end date</span>
                      </div>
                    )}
                    
                    {formData.duration && !['one-time', 'recurring', 'indefinite'].includes(formData.duration) && (
                      <div className="flex items-center space-x-2">
                        <Clock size={20} className="text-[#708d81]" />
                        <span className="text-sm font-medium text-[#708d81]">Custom: {formData.duration}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Right side: Post Button */}
                <div className="w-fit">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-4 px-8 text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-lg"
                    style={{ backgroundColor: '#708d81' }}
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
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
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

        {/* Tag Selector Popup - Completely independent overlay */}
        {showTagSelector && (
          <>
            {/* Dark overlay background */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999]" onClick={() => setShowTagSelector(false)} />
            
            {/* Popup content */}
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] max-h-[80vh] bg-white rounded-lg border shadow-2xl z-[10000] p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-medium text-gray-700">Select Category Tags</h3>
                <button
                  type="button"
                  onClick={() => setShowTagSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
              <TagSelector
                selectedTags={formData.tags}
                onTagSelect={handleTagSelect}
                onClearAll={handleClearAllTags}
              />
              {validationErrors.tags && (
                <p className="mt-2 text-sm text-red-600">{validationErrors.tags}</p>
              )}
            </div>
          </>
        )}
      </div>
  );
};

export default CreatePostTab; 