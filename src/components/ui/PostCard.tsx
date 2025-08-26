'use client';

import React from 'react';
import { Post } from '@/types';
import { 
  Clock, 
  MapPin, 
  User, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreVertical,
  Star
} from 'lucide-react';
import { formatDate, getPostTypeLabel, getPostTypeColor, getGradeColor } from '@/utils';

interface PostCardProps {
  post: Post;
  onBookmark?: (postId: number) => void;
  onShare?: (post: Post) => void;
  onMessage?: (post: Post) => void;
  onViewProfile?: (userId: number) => void;
}

export default function PostCard({ 
  post, 
  onBookmark, 
  onShare, 
  onMessage, 
  onViewProfile 
}: PostCardProps) {
  const handleBookmark = () => {
    onBookmark?.(post.id);
  };

  const handleShare = () => {
    onShare?.(post);
  };

  const handleMessage = () => {
    onMessage?.(post);
  };

  const handleViewProfile = () => {
    onViewProfile?.(post.user.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <button
              onClick={handleViewProfile}
              className="flex-shrink-0"
            >
              {post.user.profilePicture ? (
                <img
                  src={post.user.profilePicture}
                  alt={post.user.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              )}
            </button>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <button
                onClick={handleViewProfile}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
              >
                {post.user.displayName}
              </button>
              <p className="text-xs text-gray-500">{post.universityName}</p>
            </div>
          </div>

          {/* Post Type Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPostTypeColor(post.postType)}`}>
            {getPostTypeLabel(post.postType)}
          </span>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4">
          {post.description}
        </p>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
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

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Details */}
        <div className="space-y-2 text-sm text-gray-500">
          {/* Duration */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>
              {post.durationType === 'one-time' 
                ? `Expires ${formatDate(post.expiresAt || '')}`
                : post.durationType === 'recurring'
                ? 'Recurring'
                : post.durationType === 'event' && post.eventStart
                ? `Event: ${formatDate(post.eventStart)}`
                : 'Duration not specified'
              }
            </span>
          </div>

          {/* Location */}
          {post.user.hometown && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{post.user.hometown}</span>
            </div>
          )}

          {/* Grade */}
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(post.relativeGrade)}`}>
              Grade: {post.relativeGrade}
            </span>
          </div>
        </div>
      </div>

      {/* Post Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          {/* Left side - Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{formatDate(post.createdAt)}</span>
            <span>•</span>
            <span>{post.viewCount} views</span>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            {/* Message Button */}
            <button
              onClick={handleMessage}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Send message"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
              title="Share post"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full transition-colors ${
                post.isBookmarked
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title={post.isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
            >
              <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* More Options */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 

import React from 'react';
import { Post } from '@/types';
import { 
  Clock, 
  MapPin, 
  User, 
  MessageCircle, 
  Share2, 
  Bookmark,
  MoreVertical,
  Star
} from 'lucide-react';
import { formatDate, getPostTypeLabel, getPostTypeColor, getGradeColor } from '@/utils';

interface PostCardProps {
  post: Post;
  onBookmark?: (postId: number) => void;
  onShare?: (post: Post) => void;
  onMessage?: (post: Post) => void;
  onViewProfile?: (userId: number) => void;
}

export default function PostCard({ 
  post, 
  onBookmark, 
  onShare, 
  onMessage, 
  onViewProfile 
}: PostCardProps) {
  const handleBookmark = () => {
    onBookmark?.(post.id);
  };

  const handleShare = () => {
    onShare?.(post);
  };

  const handleMessage = () => {
    onMessage?.(post);
  };

  const handleViewProfile = () => {
    onViewProfile?.(post.user.id);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <button
              onClick={handleViewProfile}
              className="flex-shrink-0"
            >
              {post.user.profilePicture ? (
                <img
                  src={post.user.profilePicture}
                  alt={post.user.displayName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              )}
            </button>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <button
                onClick={handleViewProfile}
                className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors"
              >
                {post.user.displayName}
              </button>
              <p className="text-xs text-gray-500">{post.universityName}</p>
            </div>
          </div>

          {/* Post Type Badge */}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPostTypeColor(post.postType)}`}>
            {getPostTypeLabel(post.postType)}
          </span>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {post.title}
        </h3>

        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed mb-4">
          {post.description}
        </p>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {post.images.slice(0, 4).map((image, index) => (
                <div key={index} className="aspect-square rounded-lg overflow-hidden">
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

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Details */}
        <div className="space-y-2 text-sm text-gray-500">
          {/* Duration */}
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>
              {post.durationType === 'one-time' 
                ? `Expires ${formatDate(post.expiresAt || '')}`
                : post.durationType === 'recurring'
                ? 'Recurring'
                : post.durationType === 'event' && post.eventStart
                ? `Event: ${formatDate(post.eventStart)}`
                : 'Duration not specified'
              }
            </span>
          </div>

          {/* Location */}
          {post.user.hometown && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>{post.user.hometown}</span>
            </div>
          )}

          {/* Grade */}
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4" />
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(post.relativeGrade)}`}>
              Grade: {post.relativeGrade}
            </span>
          </div>
        </div>
      </div>

      {/* Post Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          {/* Left side - Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{formatDate(post.createdAt)}</span>
            <span>•</span>
            <span>{post.viewCount} views</span>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-2">
            {/* Message Button */}
            <button
              onClick={handleMessage}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Send message"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
              title="Share post"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full transition-colors ${
                post.isBookmarked
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
              title={post.isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
            >
              <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current' : ''}`} />
            </button>

            {/* More Options */}
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 