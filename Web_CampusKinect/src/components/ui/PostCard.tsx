"use client";

import React, { useState, useRef, useEffect } from "react";
import { Post, User as UserType } from "../../types";
import { formatDate, getPostTypeColor, getPostTypeIcon } from "../../utils";
import { 
  MessageCircle, 
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
import { useAuthStore } from "../../stores/authStore";

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
  const user = useAuthStore(state => state.user);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Content moderation states
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [isUserBlocked, setIsUserBlocked] = useState(false);
  const [isLoadingBlockStatus, setIsLoadingBlockStatus] = useState(false);
  
  // Check if this is the user's own post
  const isOwnPost = user && post.userId === String(user.id);
  
  // Check if user is admin
  const isAdmin = user && (user.email === 'lmckeown@calpoly.edu' || user.username === 'liam_mckeown38');

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsideButton = buttonRef.current && !buttonRef.current.contains(target);
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(target);
      
      if (isOutsideButton && isOutsideDropdown) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
  };

  const handleMessage = () => {
    // POST-CENTRIC MESSAGING: Navigate with post context
    console.log("Message about POST:", post.title, "with user:", post.userId);
    
    // Navigate to post-centric chat
    router.push(`/chat/${post.userId}?postId=${post.id}&postTitle=${encodeURIComponent(post.title)}`);
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

  // TEMPORARILY DISABLED: User profile viewing functionality
  // TODO: Re-enable when ready to allow users to view other profiles
  // const handleProfileClick = (e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   e.preventDefault();
  //   
  //   if (post.userId) {
  //     router.push(`/user/${post.userId}`);
  //   }
  // };

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

  // Admin actions
  const handleAdminDeletePost = async () => {
    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return;
    }
    
    try {
      await apiService.adminDeletePost(post.id);
      setShowOptions(false);
      alert("Post deleted successfully");
      // Refresh the page or notify parent to refresh
      window.location.reload();
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const handleAdminBanUser = async () => {
    if (!confirm(`Are you sure you want to ban ${post.poster?.displayName || post.poster?.firstName}? They will be unable to access the platform.`)) {
      return;
    }
    
    try {
      await apiService.adminBanUser(post.userId, "Banned by admin from post");
      setShowOptions(false);
      alert("User banned successfully");
      // Refresh the page or notify parent to refresh
      window.location.reload();
    } catch (error) {
      console.error("Failed to ban user:", error);
      alert("Failed to ban user. Please try again.");
    }
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

  // Determine main badge to display (Offer, Request, or Event)
  const getMainBadge = () => {
    // Priority: Offer > Request > Event
    // Make tag checks case-insensitive
    const lowerCaseTags = post.tags?.map(tag => tag.toLowerCase()) || [];
    
    if (lowerCaseTags.includes("offer")) {
      return "Offer";
    } else if (lowerCaseTags.includes("request")) {
      return "Request";
    } else if (post.postType === "events" || post.postType === "event") {
      return "Event";
    }
    // If no offer/request/event, return null (no badge needed for regular category posts)
    return null;
  };

  const mainBadge = getMainBadge();

  return (
    <div
              className="rounded-xl shadow-lg border-2 overflow-hidden hover:shadow-xl hover:border-[#708d81] hover:scale-[1.02] transition-all duration-200 mb-8 max-w-2xl mx-auto"
      style={{ backgroundColor: '#737373', borderColor: '#525252', marginBottom: "2rem" }}
    >
      {/* Post Header */}
      <div className="p-4 border-b" style={{ borderColor: '#525252' }}>
        {/* Top Row: Main Badge (left) and Action Icons (right) */}
        <div className="flex items-center justify-between mb-3">
          {/* Left side: Main Badge + Timestamp */}
          <div className="flex items-center space-x-3">
            {/* Main Badge - Show Offer, Request, or Event */}
            {mainBadge && (
              <div 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: "#708d81",
                  color: "white",
                  border: "2px solid #708d81",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {mainBadge}
              </div>
            )}
            
            {/* Timestamp */}
            <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-300">•</span>
                    <span className="text-xs text-gray-300">
                {formatDate(post.createdAt)}
              </span>
            </div>
          </div>

          {/* Action Icons - Top Right */}
          <div className="flex items-center" style={{ gap: "16px" }}>
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
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

              {/* Dropdown menu positioned relative to button */}
              {showOptions && (
                <div 
                  ref={dropdownRef}
                  className="absolute right-0 top-full mt-2 w-52 bg-gray-800 rounded-lg shadow-lg border border-gray-600 py-2 flex flex-col items-center"
                  style={{ 
                    zIndex: 50,
                    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
                    gap: "8px",
                  }}
                >
                  {/* Show Admin actions first (only for admin users) */}
                  {isAdmin && (
                    <>
                      <button 
                        onClick={handleAdminDeletePost}
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
                        <span>🗑️ Admin: Delete Post</span>
                      </button>

                      {/* Only show Ban User if NOT own post (admin can't ban themselves) */}
                      {!isOwnPost && (
                        <button 
                          onClick={handleAdminBanUser}
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
                          <span>🚫 Admin: Ban User</span>
                        </button>
                      )}
                    </>
                  )}

                  {/* Show Edit/Delete if user owns the post */}
                  {isOwnPost && onEdit && (
                    <button 
                      onClick={() => {
                        setShowOptions(false);
                        onEdit(String(post.id), post);
                      }}
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
                      <span>Edit Post</span>
                    </button>
                  )}
                  
                  {isOwnPost && onDelete && (
                    <button 
                      onClick={() => {
                        setShowOptions(false);
                        handleDelete();
                      }}
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
                      <span>Delete Post</span>
                    </button>
                  )}

                  {/* Only show Report/Block buttons if not own post */}
                  {!isOwnPost && (
                    <>
                      <button 
                        onClick={handleReportPost}
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
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: User Info and Post Title */}
        <div className="flex items-start" style={{ gap: "20px" }}>
          {/* User Info with Profile Picture Inside - Reduced Width */}
          {/* PROFILE CLICK TEMPORARILY DISABLED - Re-enable onClick={handleProfileClick} when ready */}
          <div 
            className="min-w-0 flex items-start space-x-3"
            // onClick={handleProfileClick}  // TEMPORARILY DISABLED
            style={{ 
              border: "2px solid #525252",
              borderRadius: "12px",
              paddingTop: "8px",
              paddingBottom: "12px",
              paddingLeft: "12px",
              paddingRight: "12px",
              backgroundColor: "transparent",
              width: "280px",
              flexShrink: 0,
              // cursor: "pointer",  // TEMPORARILY DISABLED
            }}
            // HOVER EFFECTS TEMPORARILY DISABLED
            // onMouseEnter={(e) => {
            //   e.currentTarget.style.cursor = "pointer";
            //   e.currentTarget.style.backgroundColor = "#f3f4f6";
            //   e.currentTarget.style.borderColor = "#708d81";
            // }}
            // onMouseLeave={(e) => {
            //   e.currentTarget.style.cursor = "pointer";
            //   e.currentTarget.style.backgroundColor = "#f9fafb";
            //   e.currentTarget.style.borderColor = "#d1d5db";
            // }}
          >
            {/* Profile Picture */}
            {post.poster?.profilePicture ? (
              <img
                src={post.poster.profilePicture}
                alt={post.poster?.firstName || "User"}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                style={{ border: "2px solid #708d81" }}
              />
            ) : (
              <div 
                className="w-10 h-10 bg-[#708d81] rounded-full flex items-center justify-center flex-shrink-0"
                style={{ border: "2px solid #708d81" }}
              >
                <User size={20} className="text-white" />
              </div>
            )}

            {/* User Text Info */}
            <div className="flex-1 min-w-0">
            {/* Display Name - Large and Bold */}
            <div className="flex items-center space-x-2 mb-0">
              <p 
                className="font-bold truncate"
                  style={{
                    fontSize: "18px",
                    lineHeight: "20px",
                    color: "white",
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
                className="truncate"
                  style={{
                    fontSize: "10px",
                    lineHeight: "12px",
                    marginTop: "-2px",
                    color: "#9ca3af",
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
              className="text-xl font-bold text-white line-clamp-2"
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
                <MapPin size={16} className="text-gray-300" />
                <span className="text-sm text-gray-200">{post.location}</span>
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
                    <p className="text-gray-200 mb-4 line-clamp-3">{post.description}</p>

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
            {post.tags
              .filter(tag => {
                const lowerTag = tag.toLowerCase();
                return lowerTag !== 'offer' && lowerTag !== 'request' && lowerTag !== 'event';
              })
              .map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: "#708d81",
                    color: "white"
                  }}
                >
                  {tag}
                </span>
              ))}
          </div>
        )}

        {/* Post Details */}
                  <div className="flex items-center space-x-4 text-sm text-gray-300 mb-4"></div>
      </div>

      {/* Post Actions */}
      <div className="px-4 py-3 bg-gray-800 border-t border-gray-600">
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
