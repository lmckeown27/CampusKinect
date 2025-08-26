'use client';

import React, { useState } from 'react';
import { Post } from '../../types';
import { 
  formatDate, 
  getPostTypeColor, 
  getPostTypeIcon, 
  getGradeColor, 
  getGradeLabel 
} from '../../utils';
import { 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  MapPin,
  Clock,
  User
} from 'lucide-react';

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {post.user?.profileImage ? (
              <img
                src={post.user.profileImage}
                alt={post.user.firstName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {post.user?.firstName} {post.user?.lastName}
                </p>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">{formatDate(post.createdAt)}</span>
              </div>
              
              {post.user?.major && (
                <p className="text-xs text-gray-500 truncate">
                  {post.user.major} • Year {post.user.year}
                </p>
              )}
            </div>
          </div>

          {/* Post Type Badge */}
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.postType)}`}>
            <span className="mr-1">{getPostTypeIcon(post.postType)}</span>
            {post.postType.charAt(0).toUpperCase() + post.postType.slice(1)}
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {post.title}
        </h3>
        
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
          
          <div className="flex items-center space-x-1">
            <Clock size={16} />
            <span>{post.duration}</span>
          </div>
        </div>

        {/* Grade Display */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Grade:</span>
            <span className={`text-lg font-bold ${getGradeColor(post.grade)}`}>
              {getGradeLabel(post.grade)}
            </span>
            <span className={`text-sm ${getGradeColor(post.grade)}`}>
              ({post.grade}%)
            </span>
          </div>
        </div>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleMessage}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <MessageCircle size={18} />
              <span className="text-sm font-medium">Message</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <Share2 size={18} />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreHorizontal size={18} />
              </button>

              {/* Options Dropdown */}
              {showOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    Report Post
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    Block User
                  </button>
                </div>
              )}
            </div>
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