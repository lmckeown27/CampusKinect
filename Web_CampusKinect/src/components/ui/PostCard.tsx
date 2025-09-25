"use client";

import React, { useState, useRef, useEffect } from "react";
import { Post, User as UserType } from "../../types";
import { formatDate, getPostTypeColor, getPostTypeIcon } from "../../utils";
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
  Flag,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ReportModal from "./ReportModal";
import BlockUserModal from "./BlockUserModal";
import { apiService } from "../../services/api";

// Helper function to convert year number to descriptive name
const getYearLabel = (year: number): string => {
  const yearLabels: { [key: number]: string } = {
    1: "Freshman",
    2: "Sophomore",
    3: "Junior",
    4: "Senior",
    5: "Super Senior",
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

const PostCard: React.FC<PostCardProps> = ({
  post,
  showDeleteButton = false,
  onDelete,
  showEditButton = false,
  onEdit,
}) => {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Content moderation states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [isLoadingBlockStatus, setIsLoadingBlockStatus] = useState(false);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleMessage = () => {
    // Navigate to messages or open message modal
    console.log("Message user:", post.userId);
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
    console.log("Repost:", post.id);
    // This would typically create a new post that references the original
  };

  const handleDelete = () => {
    if (
      onDelete &&
      confirm(
        "Are you sure you want to delete this post? This action cannot be undone.",
      )
    ) {
      onDelete(post.id);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(post.id, post);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (post.userId) {
      router.push(`/user/${post.userId}`);
    }
  };

  // Content moderation functions
  const handleReportPost = () => {
    setShowOptions(false);
    setShowReportModal(true);
  };

  const handleBlockUser = () => {
    setShowOptions(false);
    setShowBlockModal(true);
  };

  const handleReportSubmitted = () => {
    // Could show a toast notification here
    console.log("Report submitted successfully");
  };

  const handleUserBlocked = () => {
    setIsUserBlocked(true);
    // Could show a toast notification here
    console.log("User blocked successfully");
  };

  // Check if user is blocked on component mount
  useEffect(() => {
    const checkBlockStatus = async () => {
      if (post.userId) {
        setIsLoadingBlockStatus(true);
        try {
          const blocked = await apiService.isUserBlocked(post.userId);
          setIsUserBlocked(blocked);
        } catch (error) {
          console.error("Failed to check block status:", error);
        } finally {
          setIsLoadingBlockStatus(false);
        }
      }
    };

    checkBlockStatus();
  }, [post.userId]);

  return (
    <div
      className="bg-white rounded-xl shadow-lg border-2 border-gray-300 overflow-hidden hover:shadow-xl hover:border-[#708d81] hover:scale-[1.02] transition-all duration-200 mb-8"
      style={{ marginBottom: "2rem" }}
    >
      {/* Post Header */}
      <div className="p-4 border-b border-gray-100">
        {/* Top Row: Post Type Badge (left) and Action Icons (right) */}
        <div className="flex items-center justify-between mb-3">
          {/* Left side: Post Type Badge + Timestamp */}
          <div className="flex items-center space-x-3">
            {/* Show Post Type Badge only for non-event posts */}
            {post.postType && post.postType !== "event" && (
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${getPostTypeColor(post.postType)}`}
                style={{
                  border: "2px solid #374151",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <span className="mr-1">{getPostTypeIcon(post.postType)}</span>
                {post.postType
                  ? post.postType.charAt(0).toUpperCase() +
                    post.postType.slice(1)
                  : "Unknown"}
              </div>
            )}

            {/* Offer/Request Badge */}
            {post.tags &&
              (post.tags.includes("offer") ||
                post.tags.includes("request")) && (
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    post.tags.includes("offer")
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                  style={{
                    border: "2px solid #374151",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <span className="mr-1">
                    {post.tags.includes("offer") ? "💰" : "🔍"}
                  </span>
                  {post.tags.includes("offer") ? "Offer" : "Request"}
                </div>
              )}

            {/* Timestamp */}
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-gray-500">
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>

          {/* Action Icons - Top Right */}
          <div className="flex items-center" style={{ gap: "16px" }}>
            <button
              onClick={handleShare}
              className="p-2 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: "#708d81",
                color: "white",
                border: "2px solid #708d81",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#a8c4a2";
                e.currentTarget.style.border = "2px solid #a8c4a2";
                e.currentTarget.style.cursor = "pointer";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#708d81";
                e.currentTarget.style.border = "2px solid #708d81";
                e.currentTarget.style.cursor = "pointer";
              }}
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
                      left: rect.right - 208, // 208px is the width of the dropdown (w-52)
                    });
                  }

                  setShowOptions(!showOptions);
                }}
                className="p-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: "#708d81",
                  color: "white",
                  border: "2px solid #708d81",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#a8c4a2";
                  e.currentTarget.style.border = "2px solid #a8c4a2";
                  e.currentTarget.style.cursor = "pointer";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#708d81";
                  e.currentTarget.style.border = "2px solid #708d81";
                  e.currentTarget.style.cursor = "pointer";
                }}
              >
                <MoreHorizontal size={18} />
              </button>

              {/* Dropdown menu positioned with fixed positioning */}
              {showOptions && (
                <div
                  className="w-52 bg-white rounded-lg shadow-lg border border-gray-200 py-2 flex flex-col items-center"
                  style={{
                    position: "fixed",
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                    zIndex: 9999,
                    boxShadow:
                      "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
                    gap: "8px",
                  }}
                >
                  <button
                    onClick={handleReportPost}
                    className="w-44 flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover:bg-red-50"
                    style={{
                      backgroundColor: "#dc2626",
                      color: "white",
                      border: "2px solid #dc2626",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#ef4444";
                      e.currentTarget.style.border = "2px solid #ef4444";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#dc2626";
                      e.currentTarget.style.border = "2px solid #dc2626";
                    }}
                  >
                    <Flag size={16} />
                    <span>Report Post</span>
                  </button>

                  {post.poster && (
                    <button
                      onClick={handleBlockUser}
                      className="w-44 flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                      style={{
                        backgroundColor: "#dc2626",
                        color: "white",
                        border: "2px solid #dc2626",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#ef4444";
                        e.currentTarget.style.border = "2px solid #ef4444";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "#dc2626";
                        e.currentTarget.style.border = "2px solid #dc2626";
                      }}
                    >
                      <Shield size={16} />
                      <span>Block User</span>
                    </button>
                  )}

                  <div className="w-44 h-px bg-gray-200 my-1" />

                  <button
                    onClick={handleShare}
                    className="w-44 flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                    style={{
                      backgroundColor: "#708d81",
                      color: "white",
                      border: "2px solid #708d81",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#a8c4a2";
                      e.currentTarget.style.border = "2px solid #a8c4a2";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#708d81";
                      e.currentTarget.style.border = "2px solid #708d81";
                    }}
                  >
                    <Share2 size={16} />
                    <span>Copy Link</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: User Info and Post Title */}
        <div className="flex items-start" style={{ gap: "20px" }}>
          {/* User Info with Profile Picture Inside - Reduced Width */}
          <div
            className="min-w-0 flex items-start space-x-3 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            onClick={handleProfileClick}
            style={{
              border: "2px solid #d1d5db",
              borderRadius: "12px",
              paddingTop: "8px",
              paddingBottom: "12px",
              paddingLeft: "12px",
              paddingRight: "12px",
              backgroundColor: "#f9fafb",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
              width: "280px",
              flexShrink: 0,
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.cursor = "pointer";
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.borderColor = "#708d81";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.cursor = "pointer";
              e.currentTarget.style.backgroundColor = "#f9fafb";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
          >
            {/* Profile Picture */}
            {post.poster?.profilePicture ? (
              <img
                src={post.poster.profilePicture}
                alt={post.poster?.firstName || "User"}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0 cursor-pointer"
                style={{ border: "2px solid #708d81", cursor: "pointer" }}
              />
            ) : (
              <div
                className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer"
                style={{ border: "2px solid #708d81", cursor: "pointer" }}
              >
                <User size={20} className="text-white" />
              </div>
            )}

            {/* User Text Info */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              style={{ cursor: "pointer" }}
            >
              {/* Display Name - Large and Bold */}
              <div className="flex items-center space-x-2 mb-0">
                <p
                  className="font-bold text-gray-900 truncate cursor-pointer"
                  style={{
                    fontSize: "18px",
                    lineHeight: "20px",
                    cursor: "pointer",
                  }}
                >
                  {post.poster?.firstName && post.poster?.lastName
                    ? `${post.poster.firstName} ${post.poster.lastName}`
                    : post.poster?.displayName ||
                      post.poster?.username ||
                      "Unknown User"}
                </p>
              </div>

              {/* Username - Small and Separate */}
              {post.poster?.username && post.poster?.firstName && (
                <p
                  className="text-gray-400 truncate cursor-pointer"
                  style={{
                    fontSize: "10px",
                    lineHeight: "12px",
                    marginTop: "-2px",
                    cursor: "pointer",
                  }}
                >
                  @{post.poster.username}
                </p>
              )}

              {/* Major and Year */}
              {post.poster?.major && (
                <p className="text-xs text-gray-500 truncate">
                  {post.poster?.major} •{" "}
                  {post.poster?.year
                    ? getYearLabel(post.poster.year)
                    : "Not specified"}
                </p>
              )}
            </div>
          </div>

          {/* Post Title - To the right of user info */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-xl font-bold text-gray-900 line-clamp-2"
              style={{
                fontSize: "26px",
                lineHeight: "28px",
                marginBottom: "0",
              }}
            >
              {post.title}
            </h3>

            {/* Location - Underneath the title */}
            {post.location && (
              <div
                className="flex items-center space-x-1"
                style={{ marginTop: "4px" }}
              >
                <MapPin size={16} className="text-gray-500" />
                <span className="text-sm text-gray-600">{post.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Safety Warning */}
      {post.isFlagged && (
        <div className="mx-4 mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle
              size={16}
              className="text-yellow-600 flex-shrink-0"
            />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Content Under Review
              </p>
              <p className="text-xs text-yellow-700">
                This post has been flagged and is being reviewed by our
                moderation team.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Blocked User Warning */}
      {isUserBlocked && (
        <div className="mx-4 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <Shield size={16} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Blocked User</p>
              <p className="text-xs text-red-700">
                You have blocked this user. You can unblock them in your
                settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Post Content */}
      <div className="px-4 pb-4 pt-2">
        <p className="text-gray-700 mb-4 line-clamp-3">{post.description}</p>

        {/* Post Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <div className="grid grid-cols-2 gap-2">
              {post.images.slice(0, 4).map((image, index) => (
                <div
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                >
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
        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4"></div>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleMessage}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: "#708d81",
                color: "white",
                border: "2px solid #708d81",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#a8c4a2";
                e.currentTarget.style.border = "2px solid #a8c4a2";
                e.currentTarget.style.cursor = "pointer";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#708d81";
                e.currentTarget.style.border = "2px solid #708d81";
                e.currentTarget.style.cursor = "pointer";
              }}
            >
              <MessageCircle size={18} />
              <span className="text-sm font-medium">Message</span>
            </button>
          </div>

          {/* Repost, Bookmark, and Delete (conditional) - Bottom Right */}
          <div className="flex items-center" style={{ gap: "16px" }}>
            <button
              onClick={handleRepost}
              className="p-2 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: "#708d81",
                color: "white",
                border: "2px solid #708d81",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#a8c4a2";
                e.currentTarget.style.border = "2px solid #a8c4a2";
                e.currentTarget.style.cursor = "pointer";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#708d81";
                e.currentTarget.style.border = "2px solid #708d81";
                e.currentTarget.style.cursor = "pointer";
              }}
            >
              <Repeat size={18} />
            </button>

            <button
              onClick={handleBookmark}
              className="p-2 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: isBookmarked ? "#a8c4a2" : "#708d81",
                color: "white",
                border: isBookmarked
                  ? "2px solid #a8c4a2"
                  : "2px solid #708d81",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#a8c4a2";
                e.currentTarget.style.border = "2px solid #a8c4a2";
                e.currentTarget.style.cursor = "pointer";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isBookmarked
                  ? "#a8c4a2"
                  : "#708d81";
                e.currentTarget.style.border = isBookmarked
                  ? "2px solid #a8c4a2"
                  : "2px solid #708d81";
                e.currentTarget.style.cursor = "pointer";
              }}
            >
              <Bookmark
                size={18}
                fill={isBookmarked ? "currentColor" : "none"}
              />
            </button>

            {/* Edit button - only show if showEditButton is true */}
            {showEditButton && (
              <button
                onClick={handleEdit}
                className="p-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: "#708d81",
                  color: "white",
                  border: "2px solid #708d81",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#a8c4a2";
                  e.currentTarget.style.border = "2px solid #a8c4a2";
                  e.currentTarget.style.cursor = "pointer";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#708d81";
                  e.currentTarget.style.border = "2px solid #708d81";
                  e.currentTarget.style.cursor = "pointer";
                }}
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
                style={{
                  backgroundColor: "#dc2626",
                  color: "white",
                  border: "2px solid #dc2626",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#ef4444";
                  e.currentTarget.style.border = "2px solid #ef4444";
                  e.currentTarget.style.cursor = "pointer";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#dc2626";
                  e.currentTarget.style.border = "2px solid #dc2626";
                  e.currentTarget.style.cursor = "pointer";
                }}
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

      {/* Content Moderation Modals */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        contentId={post.id}
        contentType="post"
        contentTitle={post.title}
        onReportSubmitted={handleReportSubmitted}
      />

      {post.poster && (
        <BlockUserModal
          isOpen={showBlockModal}
          onClose={() => setShowBlockModal(false)}
          user={post.poster as UserType}
          onUserBlocked={handleUserBlocked}
        />
      )}
    </div>
  );
};

export default PostCard;
