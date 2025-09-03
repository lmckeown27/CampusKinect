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
  User
} from 'lucide-react';

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
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleMessage = () => {
    // Navigate to messages or open message modal
    console.log('Message user:', post.userId);
  };

  const handleShare = () => {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.description,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${post.title}\n${post.description}`);
    }
  };

  const handleRepost = () => {
    // Implement repost functionality
    console.log('Repost:', post.id);
    // This would typically create a new post that references the original
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-300 overflow-hidden hover:shadow-xl hover:border-[#708d81] hover:scale-[1.02] transition-all duration-200 mb-6">
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
            className="min-w-0 flex items-start space-x-3"
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
              flexShrink: 0
            }}
          >
            {/* Profile Picture */}
            {post.user?.profileImage ? (
              <img
                src={post.user.profileImage}
                alt={post.user.firstName}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                style={{ border: '2px solid #708d81' }}
              />
            ) : (
              <div 
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: '2px solid #708d81' }}
              >
                <User size={20} className="text-white" />
              </div>
            )}

            {/* User Text Info */}
            <div className="flex-1 min-w-0">
            {/* Display Name - Large and Bold */}
            <div className="flex items-center space-x-2 mb-0">
              <p 
                className="font-bold text-gray-900 truncate"
                style={{ fontSize: '18px', lineHeight: '20px' }}
              >
                {post.user?.firstName && post.user?.lastName 
                  ? `${post.user.firstName} ${post.user.lastName}`
                  : post.user?.displayName || post.user?.username || 'Unknown User'
                }
              </p>
            </div>
            
            {/* Username - Small and Separate */}
            {post.user?.username && post.user?.firstName && (
              <p 
                className="text-gray-400 truncate"
                style={{ fontSize: '10px', lineHeight: '12px', marginTop: '-2px' }}
              >
                @{post.user.username}
              </p>
            )}
            
            {/* Major and Year */}
            {post.user?.major && (
              <p className="text-xs text-gray-500 truncate">
                {post.user.major} • {post.user.year ? getYearLabel(post.user.year) : 'Not specified'}
              </p>
            )}
            </div>
          </div>

          {/* Post Title - To the right of user info */}
          <div className="flex-1 min-w-0">
            <h3 
              className="text-xl font-bold text-gray-900 line-clamp-2"
              style={{ fontSize: '26px', lineHeight: '32px' }}
            >
              {post.title}
            </h3>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-4 pt-2">
        <p className="text-gray-700 mb-4 line-clamp-3">
          {post.description}
        </p>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
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
          {post.location && (
            <div className="flex items-center space-x-1">
              <MapPin size={16} />
              <span>{post.location}</span>
            </div>
          )}

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

          {/* Repost and Bookmark - Bottom Right */}
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
                backgroundColor: isBookmarked ? '#a8c4a2' : '#708d81', 
                color: 'white', 
                border: isBookmarked ? '2px solid #a8c4a2' : '2px solid #708d81', 
                cursor: 'pointer' 
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.backgroundColor = '#a8c4a2'; 
                e.currentTarget.style.border = '2px solid #a8c4a2'; 
                e.currentTarget.style.cursor = 'pointer'; 
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.backgroundColor = isBookmarked ? '#a8c4a2' : '#708d81'; 
                e.currentTarget.style.border = isBookmarked ? '2px solid #a8c4a2' : '2px solid #708d81'; 
                e.currentTarget.style.cursor = 'pointer'; 
              }}
            >
              <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
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


    </div>
  );
};

export default PostCard; 