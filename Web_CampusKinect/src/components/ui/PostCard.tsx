'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Post } from '../../types';
import { 
  formatDate, 
  getPostTypeColor, 
  getPostTypeIcon
} from '../../utils';
import { 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Repeat,
  MoreHorizontal,
  MapPin,
  User,
  Trash2,
  Edit2,
  X,
  Upload,
  Flag
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/authStore';
import { apiService } from '../../services/api';
import TagSelector from './TagSelector';

// Helper function to convert year number to descriptive name
const getYearLabel = (year: number): string => {
  const yearLabels: { [key: number]: string } = {
    1: 'Freshman',
    2: 'Sophomore', 
    3: 'Junior',
    4: 'Senior',
    5: 'Super Senior'
  };
  return yearLabels[year] || `Year ${year}`;
};

interface PostCardProps {
  post: Post;
  showDeleteButton?: boolean;
  onDelete?: (postId: string) => void;
  showEditButton?: boolean;
  onEdit?: (postId: string, currentData: Post) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, showDeleteButton = false, onDelete, showEditButton = false, onEdit }) => {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Inline editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: post.title,
    description: post.description,
    location: post.location || '',
    images: post.images || [],
    postType: post.postType,
    tags: post.tags || []
  });
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for offer/request tags (same as CreatePost and EditPostModal)
  const [offerRequestTags, setOfferRequestTags] = useState({
    goods: [] as string[],
    services: [] as string[],
    housing: [] as string[],
    events: [] as string[],
  });

  // Post type options (same as CreatePost and EditPostModal)
  const postTypes = [
    { value: 'goods', label: 'Good', icon: '🛍️' },
    { value: 'services', label: 'Service', icon: '🔧' },
    { value: 'housing', label: 'Housing', icon: '🏠' },
    { value: 'events', label: 'Event', icon: '📅' },
  ];

  // Available tags (same as CreatePost)
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

  // Determine if this post belongs to the current user and get current profile picture
  const isCurrentUserPost = currentUser && post.userId === currentUser.id;
  const currentProfilePicture = isCurrentUserPost ? (currentUser.profileImage || currentUser.profilePicture) : null;



  const handleBookmark = () => {
    alert('Bookmarks are currently in development, hold on tight :)');
  };

  const handleMessage = () => {
    // Navigate directly to chat page with the post author
    router.push(`/chat/${post.userId}`);
  };

  const handleShare = () => {
    alert('Share feature is currently in development, hold on tight :)');
  };

  const handleRepost = () => {
    alert('Reposts are currently in development, hold on tight :)');
  };

  const handleDelete = () => {
    if (onDelete && confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      onDelete(post.id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowOptions(false);
    // Reset form data to current post values
    setEditFormData({
      title: post.title,
      description: post.description,
      location: post.location || '',
      images: post.images || [],
      postType: post.postType,
      tags: post.tags || []
    });
    setNewImages([]);
    setImagesToDelete([]);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({
      title: post.title,
      description: post.description,
      location: post.location || '',
      images: post.images || [],
      postType: post.postType,
      tags: post.tags || []
    });
    setNewImages([]);
    setImagesToDelete([]);
  };

  const handleSaveEdit = async () => {
    try {
      // First, delete any marked images
      if (imagesToDelete.length > 0) {
        console.log('🗑️ Deleting', imagesToDelete.length, 'images...');
        const deletePromises = imagesToDelete.map(filename => apiService.deletePostImage(filename));
        await Promise.all(deletePromises);
        console.log('✅ Images deleted successfully');
      }

      // Then, upload any new images
      if (newImages.length > 0) {
        console.log('📤 Uploading', newImages.length, 'new images...');
        const uploadedImages = await apiService.uploadPostImages(post.id, newImages);
        console.log('✅ New images uploaded:', uploadedImages);
      }

      // Update the post text content
      const updateData = {
        title: editFormData.title,
        description: editFormData.description,
        location: editFormData.location,
        // Include required fields from original post
        duration: post.duration || 'one-time'
      };

      console.log('💾 Saving post update:', updateData);
      console.log('📄 Original post data:', post);

      // Call API to update the post
      const updatedPost = await apiService.updatePost(post.id, updateData);
      
      console.log('✅ Post updated successfully:', updatedPost);

      // Call the onEdit callback if provided (for state updates)
      if (onEdit) {
        onEdit(post.id, updatedPost);
      }

      // Reset editing state
      setIsEditing(false);
      setNewImages([]);
      setImagesToDelete([]);

      // Show success message
      alert('Post updated successfully!');

      // Refresh the page to show updated images
      window.location.reload();

    } catch (error: any) {
      console.error('❌ Failed to save post:', error);
      console.error('📋 Error response:', error.response?.data);
      console.error('🔢 Error status:', error.response?.status);
      console.error('📝 Error details:', error.response?.data?.error);
      alert(`Failed to save changes: ${error.response?.data?.message || error.message || 'Please try again.'}`);
    }
  };

  // File validation helper (from CreatePostTab)
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

  // Convert data URL to File for upload (from CreatePostTab)
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
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
    const totalImages = newImages.length + fileArray.length;
    if (totalImages > 4) {
      alert(`You can only upload up to 4 images. You're trying to add ${fileArray.length} more to your existing ${newImages.length} images.`);
      return;
    }

    try {
      const processedImages: Promise<File>[] = fileArray.map(file => {
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
                  resolve(file);
                  return;
                }

                // Define consistent sizing based on aspect ratio (from CreatePostTab)
                const aspectRatio = img.width / img.height;
                let targetWidth: number;
                let targetHeight: number;

                if (aspectRatio > 1.5) {
                  // Wide image - landscape
                  targetWidth = 400;
                  targetHeight = Math.round(400 / aspectRatio);
                  if (targetHeight < 200) {
                    targetHeight = 200;
                    targetWidth = Math.round(200 * aspectRatio);
                  }
                } else if (aspectRatio < 0.7) {
                  // Tall image - portrait
                  targetHeight = 400;
                  targetWidth = Math.round(400 * aspectRatio);
                  if (targetWidth < 200) {
                    targetWidth = 200;
                    targetHeight = Math.round(200 / aspectRatio);
                  }
                } else {
                  // Square-ish image
                  targetWidth = 350;
                  targetHeight = 350;
                }

                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // Draw the resized image
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                // Convert to data URL with good quality
                const resizedImageUrl = canvas.toDataURL('image/jpeg', 0.85);
                
                // Convert back to File for backend upload
                const processedFile = dataURLtoFile(resizedImageUrl, `post-image-${Date.now()}.jpg`);
                
                resolve(processedFile);
              } catch (error) {
                console.error('Error processing image:', error);
                resolve(file); // Fallback to original file
              }
            };
            img.src = e.target?.result as string;
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      });

      const processedFiles = await Promise.all(processedImages);
      setNewImages(prev => [...prev, ...processedFiles]);

    } catch (error) {
      console.error('Error processing images:', error);
      alert('Failed to process images. Please try again.');
    }
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    // Extract filename from URL for deletion (backend expects just the filename)
    // Handle both URL formats: "/uploads/filename.jpg" and "filename.jpg"
    const filename = imageUrl.startsWith('/uploads/') 
      ? imageUrl.replace('/uploads/', '') 
      : imageUrl;

    setImagesToDelete(prev => [...prev, filename]);
    setEditFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img !== imageUrl)
    }));
  };

  // Fixed text sizing - no dynamic sizing based on content length

  const handleReport = async () => {
    try {
      // Search for liam_mckeown38 user
      const users = await apiService.searchUsers('liam_mckeown38');
      const liamUser = users.find(user => user.username === 'liam_mckeown38');
      
      if (!liamUser) {
        alert('Unable to find admin user to report to. Please try again later.');
        return;
      }

      // Create message request to liam_mckeown38 with the reported post
      const reportMessage = `🚨 REPORTED POST\n\nUser reported the following post:\n\nTitle: ${post.title}\nDescription: ${post.description}\nAuthor: ${post.poster?.firstName} ${post.poster?.lastName} (@${post.poster?.username})\nPost ID: ${post.id}\nReported by: ${currentUser?.firstName} ${currentUser?.lastName} (@${currentUser?.username})`;
      
      await apiService.createMessageRequest(
        liamUser.id.toString(), 
        reportMessage, 
        post.id
      );
      
      alert('Post has been reported successfully. Thank you for keeping our community safe!');
    } catch (error) {
      console.error('Error reporting post:', error);
      alert('Failed to report post. Please try again later.');
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (post.userId) {
      router.push(`/user/${post.userId}`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-300 overflow-hidden hover:shadow-xl hover:border-[#708d81] hover:scale-[1.02] transition-all duration-200 mb-8" style={{ marginBottom: '2rem' }}>
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100">
        {/* Top Row: Post Type Badge (left) and Action Icons (right) */}
        <div className="flex items-center justify-between mb-3">
          {/* Left side: Post Type Badge + Timestamp */}
          <div className="flex items-center space-x-3">
            {/* Show Post Type Badge only for non-event posts */}
            {post.postType && post.postType !== 'event' && (
              <div 
                className={`px-3 py-1 rounded-full text-sm font-medium ${getPostTypeColor(post.postType)}`}
                style={{ border: '2px solid #374151', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                <span className="mr-1">{getPostTypeIcon(post.postType)}</span>
                {post.postType ? post.postType.charAt(0).toUpperCase() + post.postType.slice(1) : 'Unknown'}
              </div>
            )}

            {/* Offer/Request Badge */}
            {post.tags && (post.tags.includes('offer') || post.tags.includes('request')) && (
              <div 
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  post.tags.includes('offer') 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}
                style={{ border: '2px solid #374151', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
              >
                <span className="mr-1">
                  {post.tags.includes('offer') ? '💰' : '🔍'}
                </span>
                {post.tags.includes('offer') ? 'Offer' : 'Request'}
              </div>
            )}
            
            {/* Timestamp */}
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
            </div>
          </div>

          {/* Action Icons - Top Right */}
          <div className="flex items-center" style={{ gap: '16px' }}>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ backgroundColor: '#708d81', color: 'white', border: '2px solid #708d81', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a8c4a2'; e.currentTarget.style.border = '2px solid #a8c4a2'; e.currentTarget.style.cursor = 'pointer'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#708d81'; e.currentTarget.style.border = '2px solid #708d81'; e.currentTarget.style.cursor = 'pointer'; }}
            >
              <Share2 size={18} />
            </button>

            <div className="relative">
              <button
                ref={buttonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  
                  if (!showOptions && buttonRef.current) {
                    const rect = buttonRef.current.getBoundingClientRect();
                    setDropdownPosition({
                      top: rect.bottom + 4,
                      left: rect.right - 192 // 192px is the width of the dropdown (w-48)
                    });
                  }
                  
                  setShowOptions(!showOptions);
                }}
                className="p-2 rounded-lg transition-all duration-200"
                style={{ backgroundColor: '#708d81', color: 'white', border: '2px solid #708d81', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a8c4a2'; e.currentTarget.style.border = '2px solid #a8c4a2'; e.currentTarget.style.cursor = 'pointer'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#708d81'; e.currentTarget.style.border = '2px solid #708d81'; e.currentTarget.style.cursor = 'pointer'; }}
              >
                <MoreHorizontal size={18} />
              </button>

              {/* Dropdown menu positioned with fixed positioning */}
              {showOptions && (
                <div 
                  className="w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 flex flex-col items-center"
                  style={{ 
                    position: 'fixed',
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                    zIndex: 9999,
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
                    gap: '12px'
                  }}
                >
                  <button 
                    onClick={handleReport}
                    className="w-32 text-left px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                    style={{ backgroundColor: '#708d81', color: 'white', border: '2px solid #708d81', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a8c4a2'; e.currentTarget.style.border = '2px solid #a8c4a2'; e.currentTarget.style.cursor = 'pointer'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#708d81'; e.currentTarget.style.border = '2px solid #708d81'; e.currentTarget.style.cursor = 'pointer'; }}
                  >
                    Report Post
                  </button>
                  <button 
                    onClick={handleShare}
                    className="w-32 text-left px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                    style={{ backgroundColor: '#708d81', color: 'white', border: '2px solid #708d81', cursor: 'pointer' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a8c4a2'; e.currentTarget.style.border = '2px solid #a8c4a2'; e.currentTarget.style.cursor = 'pointer'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#708d81'; e.currentTarget.style.border = '2px solid #708d81'; e.currentTarget.style.cursor = 'pointer'; }}
                  >
                    Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: User Info and Post Title */}
        <div className="flex items-start" style={{ gap: '20px' }}>
          {/* User Info with Profile Picture Inside - Reduced Width */}
          <div 
            className="min-w-0 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            onClick={handleProfileClick}
            style={{ 
              border: '2px solid #d1d5db', 
              borderRadius: '12px', 
              paddingTop: '8px',
              paddingBottom: '12px',
              paddingLeft: '12px',
              paddingRight: '12px',
              backgroundColor: '#f9fafb',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              width: '280px',
              flexShrink: 0,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.cursor = 'pointer';
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#708d81';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.cursor = 'pointer';
              e.currentTarget.style.backgroundColor = '#f9fafb';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            {/* Profile Picture */}
            {(currentProfilePicture || post.poster?.profilePicture) ? (
              <img
                src={currentProfilePicture || post.poster?.profilePicture || ''}
                alt={post.poster?.firstName || 'User'}
                className="w-6 h-6 rounded-full object-cover flex-shrink-0 cursor-pointer"
                style={{ border: '1px solid #708d81', cursor: 'pointer' }}
              />
            ) : (
              <div 
                className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                style={{ border: '1px solid #708d81', cursor: 'pointer' }}
              >
                <User size={12} className="text-white" />
              </div>
            )}

            {/* User Text Info */}
            <div className="flex-1 min-w-0 cursor-pointer" style={{ cursor: 'pointer' }}>
            {/* Display Name - Large and Bold */}
            <div className="flex items-center space-x-2 mb-0">
              <p 
                className="font-bold text-gray-900 truncate cursor-pointer"
                style={{ fontSize: '18px', lineHeight: '20px', cursor: 'pointer' }}
              >
                {post.poster?.firstName && post.poster?.lastName 
                  ? `${post.poster.firstName} ${post.poster.lastName}`
                  : post.poster?.displayName || post.poster?.username || 'Unknown User'
                }
              </p>
            </div>
            
            {/* Username - Small and Separate */}
            {post.poster?.username && post.poster?.firstName && (
              <p 
                className="text-gray-400 truncate cursor-pointer"
                style={{ fontSize: '10px', lineHeight: '12px', marginTop: '-2px', cursor: 'pointer' }}
              >
                @{post.poster.username}
              </p>
            )}
            
            {/* Major and Year */}
            {post.poster?.major && (
              <p className="text-xs text-gray-500 truncate">
                  {post.poster?.major} • {post.poster?.year ? getYearLabel(post.poster.year) : 'Not specified'}
              </p>
            )}
            </div>
          </div>

          {/* Post Title - To the right of user info */}
          <div className="flex-1 min-w-0">
            <h3 
              className="text-xl font-bold text-gray-900 line-clamp-2"
              style={{ fontSize: '26px', lineHeight: '28px', marginBottom: '0' }}
            >
              {post.title}
            </h3>
            
            {/* Location - Underneath the title */}
            {post.location && (
              <div className="flex items-center space-x-1" style={{ marginTop: '4px' }}>
                <MapPin size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">{post.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-4 pt-2">
        <p className="text-gray-700 text-base mb-4">
          {post.description}
        </p>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className={`post-images-grid ${
            (post.images?.length || 0) === 1 ? 'single' :
            (post.images?.length || 0) === 2 ? 'double' :
            (post.images?.length || 0) === 3 ? 'triple' : 'quad'
          }`}>
            {post.images.slice(0, 4).map((image, index) => (
              <div 
                key={index} 
                className={`post-image-container ${
                  (post.images?.length || 0) === 1 ? 'single-image' : 'multi-image'
                }`}
              >
                <img
                  src={image.startsWith("/uploads/") ? 
                    `${typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://campuskinect.net'}${image}` : 
                    image
                  }
                  alt={`Post image ${index + 1}`}
                  className="post-image"
                  onLoad={() => {}}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    console.error("Image failed to load:", image, e);
                    target.style.display = "none";
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Details */}
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">

        </div>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleMessage}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
              style={{ backgroundColor: '#708d81', color: 'white', border: '2px solid #708d81', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a8c4a2'; e.currentTarget.style.border = '2px solid #a8c4a2'; e.currentTarget.style.cursor = 'pointer'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#708d81'; e.currentTarget.style.border = '2px solid #708d81'; e.currentTarget.style.cursor = 'pointer'; }}
            >
              <MessageCircle size={18} />
              <span className="text-sm font-medium">Message</span>
            </button>
          </div>

          {/* Repost, Bookmark, and Delete (conditional) - Bottom Right */}
          <div className="flex items-center" style={{ gap: '16px' }}>
            <button
              onClick={handleRepost}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ backgroundColor: '#708d81', color: 'white', border: '2px solid #708d81', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a8c4a2'; e.currentTarget.style.border = '2px solid #a8c4a2'; e.currentTarget.style.cursor = 'pointer'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#708d81'; e.currentTarget.style.border = '2px solid #708d81'; e.currentTarget.style.cursor = 'pointer'; }}
            >
              <Repeat size={18} />
            </button>
            
            <button
              onClick={handleBookmark}
              className="p-2 rounded-lg transition-all duration-200"
              style={{ 
                backgroundColor: '#708d81', 
                color: 'white', 
                border: '2px solid #708d81', 
                cursor: 'pointer' 
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.backgroundColor = '#a8c4a2'; 
                e.currentTarget.style.border = '2px solid #a8c4a2'; 
                e.currentTarget.style.cursor = 'pointer'; 
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.backgroundColor = '#708d81'; 
                e.currentTarget.style.border = '2px solid #708d81'; 
                e.currentTarget.style.cursor = 'pointer'; 
              }}
            >
              <Bookmark size={18} fill="none" />
            </button>

            {/* Edit button - only show if showEditButton is true */}
            {showEditButton && (
              <button
                onClick={handleEdit}
                className="p-2 rounded-lg transition-all duration-200"
                style={{ backgroundColor: '#708d81', color: 'white', border: '2px solid #708d81', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a8c4a2'; e.currentTarget.style.border = '2px solid #a8c4a2'; e.currentTarget.style.cursor = 'pointer'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#708d81'; e.currentTarget.style.border = '2px solid #708d81'; e.currentTarget.style.cursor = 'pointer'; }}
                title="Edit post"
              >
                <Edit2 size={18} />
              </button>
            )}

            {/* Delete button - only show if showDeleteButton is true */}
            {showDeleteButton && (
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg transition-all duration-200"
                style={{ backgroundColor: '#dc2626', color: 'white', border: '2px solid #dc2626', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.border = '2px solid #ef4444'; e.currentTarget.style.cursor = 'pointer'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dc2626'; e.currentTarget.style.border = '2px solid #dc2626'; e.currentTarget.style.cursor = 'pointer'; }}
                title="Delete post"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close options */}
      {showOptions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowOptions(false)}
        />
      )}

      {/* Inline Edit Form */}
      {isEditing && (
        <div className="mt-4 p-4 bg-gray-50 border-2 border-[#708d81] rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Post</h3>
          
          {/* Title Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={editFormData.title}
              onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
            />
          </div>

          {/* Description Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={editFormData.description}
              onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent resize-vertical"
            />
          </div>

          {/* Location Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={editFormData.location}
              onChange={(e) => setEditFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
              placeholder="Optional location"
            />
          </div>

          {/* Image Management */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
            
            {/* Existing Images */}
            {editFormData.images.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">Current images:</p>
                <div className="flex flex-wrap gap-2">
                  {editFormData.images.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl.startsWith("/uploads/") ? 
                          `${typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://campuskinect.net'}${imageUrl}` : 
                          imageUrl
                        }
                        alt={imageUrl}
                        className="w-20 h-20 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(imageUrl)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            {newImages.length > 0 && (
              <div className="mb-3">
                <p className="text-sm text-gray-600 mb-2">New images to add:</p>
                <div className="flex flex-wrap gap-2">
                  {newImages.map((file, index) => {
                    // Create data URL for preview (CSP-compliant)
                    const reader = new FileReader();
                    const [previewUrl, setPreviewUrl] = useState<string>('');
                    
                    React.useEffect(() => {
                      reader.onload = (e) => {
                        if (e.target?.result) {
                          setPreviewUrl(e.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }, [file]);

                    return (
                      <div key={index} className="relative">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt={file.name}
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 rounded-lg border flex items-center justify-center">
                            <span className="text-gray-500 text-xs">Loading...</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload New Images */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2"
                style={{ backgroundColor: '#708d81', color: 'white', border: '2px solid #708d81', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a8c4a2'; e.currentTarget.style.border = '2px solid #a8c4a2'; e.currentTarget.style.cursor = 'pointer'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#708d81'; e.currentTarget.style.border = '2px solid #708d81'; e.currentTarget.style.cursor = 'pointer'; }}
              >
                <Upload size={16} />
                Add Images
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{ backgroundColor: '#f3f4f6', color: '#374151', border: '2px solid #d1d5db', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#e5e7eb'; e.currentTarget.style.border = '2px solid #9ca3af'; e.currentTarget.style.cursor = 'pointer'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.border = '2px solid #d1d5db'; e.currentTarget.style.cursor = 'pointer'; }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{ backgroundColor: '#708d81', color: 'white', border: '2px solid #708d81', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#a8c4a2'; e.currentTarget.style.border = '2px solid #a8c4a2'; e.currentTarget.style.cursor = 'pointer'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#708d81'; e.currentTarget.style.border = '2px solid #708d81'; e.currentTarget.style.cursor = 'pointer'; }}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default PostCard; 