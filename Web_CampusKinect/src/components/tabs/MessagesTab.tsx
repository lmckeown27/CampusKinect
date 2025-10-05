'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Trash2, ShoppingBag, Wrench, Home, Calendar, FileText, MessageCircle, Image as ImageIcon, Flag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMessagesStore } from '../../stores/messagesStore';
import { useAuthStore } from '../../stores/authStore';
import { Conversation, User as UserType } from '../../types';
import apiService from '../../services/api';
import { useRealTimeMessages } from '../../hooks/useRealTimeMessages';
import ReportModal from '../ui/ReportModal';
import BlockUserModal from '../ui/BlockUserModal';

// Simple Conversation Item Component for Web - Comment Style
interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  currentUserId: string;
  onSelect: (conversation: Conversation) => void;
  index: number;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  currentUserId,
  onSelect,
  index
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  const handleContextMenuAction = (action: string) => {
    setShowContextMenu(false);
    
    switch (action) {
      case 'delete':
        if (confirm(`Delete conversation about "${conversation.postTitle}"?`)) {
          console.log('Delete conversation:', conversation.id);
        }
        break;
      case 'report':
        if (confirm(`Report ${conversation.otherUser.displayName}?`)) {
          alert('Report functionality will be implemented soon.');
        }
        break;
      case 'block':
        if (confirm(`Block ${conversation.otherUser.displayName}?`)) {
          alert('Block functionality will be implemented soon.');
        }
        break;
    }
  };

  // Close context menu when clicking elsewhere
  React.useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);

  // Get post type icon and color - matching Home page exactly
  const getPostTypeIcon = () => {
    switch (conversation.postType.toLowerCase()) {
      case 'goods': return <ShoppingBag size={20} style={{ color: '#10B981' }} />;
      case 'services': return <Wrench size={20} style={{ color: '#F59E0B' }} />;
      case 'housing': return <Home size={20} style={{ color: '#3B82F6' }} />;
      case 'events': return <Calendar size={20} style={{ color: '#8B5CF6' }} />;
      default: return <FileText size={20} style={{ color: '#708d81' }} />;
    }
  };

  const truncateMessage = (message: string, charLimit: number) => {
    if (message.length <= charLimit) return message;
    return message.slice(0, charLimit).trim() + '...';
  };

  const formatTimeAgo = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  };

  return (
    <div className="relative" style={{ width: 'fit-content', maxWidth: '100%', marginLeft: '16px', marginRight: '0', marginTop: index === 0 ? '0' : '16px' }}>
      <div
        className={`p-4 transition-all duration-200 rounded-lg group ${
          isSelected ? 'bg-[#e8f5e8]' : 'hover:bg-[#525252]'
        }`}
        style={{ 
          backgroundColor: isSelected ? '#5a7268' : '#708d81',
          cursor: 'pointer',
          border: '2px solid #000000',
          width: 'fit-content',
          minWidth: '280px',
          maxWidth: '100%'
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = '#5a7268';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = '#708d81';
            e.currentTarget.style.transform = 'translateY(0px)';
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
        onClick={() => onSelect(conversation)}
        onContextMenu={handleRightClick}
      >
        {/* Context Menu */}
        {showContextMenu && (
          <div 
            className="fixed bg-white border border-gray-300 rounded-lg shadow-lg py-2 z-50"
            style={{ 
              left: contextMenuPosition.x, 
              top: contextMenuPosition.y,
              minWidth: '150px'
            }}
          >
            <button
              onClick={() => handleContextMenuAction('delete')}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} className="inline mr-2" />
              Delete
            </button>
            <button
              onClick={() => handleContextMenuAction('report')}
              className="w-full px-4 py-2 text-left text-orange-600 hover:bg-orange-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
              Report
            </button>
            <button
              onClick={() => handleContextMenuAction('block')}
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline mr-2">
                <circle cx="12" cy="12" r="10"/>
                <path d="m4.9 4.9 14.2 14.2"/>
              </svg>
              Block User
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-between" style={{ minWidth: '0' }}>
          <div className="flex items-center space-x-3" style={{ flex: '1 1 auto', minWidth: '0' }}>
            {/* POST ICON (PRIMARY) */}
            <div className="w-12 h-12 flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center" style={{ border: '2px solid #708d81' }}>
                {getPostTypeIcon()}
              </div>
            </div>
            <div style={{ flex: '1 1 auto', minWidth: '0' }}>
              {/* POST TITLE (PRIMARY) */}
              <div className="flex items-center space-x-2">
                <p className="text-lg font-semibold text-black truncate" style={{ flex: '1 1 auto', minWidth: '0' }}>
                  {conversation.postTitle}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="flex-shrink-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </span>
                )}
              </div>
              {/* WITH USER (SECONDARY) */}
              <p className="text-sm text-gray-700 truncate font-medium">
                with @{conversation.otherUser.displayName}
              </p>
              
              {/* LAST MESSAGE (TERTIARY) */}
              {conversation.lastMessage && (
                <p 
                  className="text-base mt-1 truncate" 
                  style={{ 
                    color: '#e5e7eb',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  "{conversation.lastMessage}"
                </p>
              )}
              {/* TIME AGO */}
              {conversation.lastMessageAt && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimeAgo(conversation.lastMessageAt)}
                </p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const MessagesTab: React.FC = () => {
  const router = useRouter();
  const { 
    isLoading, 
    conversations, 
    sendMessage, 
    fetchConversations,
    deleteConversation
  } = useMessagesStore();
  const { user: currentUser } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Resizable panel state
  const [leftPanelWidth, setLeftPanelWidth] = useState(320); // Default 320px (20rem)
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Report and Block modals state
  const [showReportUserModal, setShowReportUserModal] = useState(false);
  const [showBlockUserModal, setShowBlockUserModal] = useState(false);
  const [reportingMessageId, setReportingMessageId] = useState<string | null>(null);
  
  // Message menu state (moved out of map to fix hooks error)
  const [openMessageMenuId, setOpenMessageMenuId] = useState<string | null>(null);
  const [messageMenuPosition, setMessageMenuPosition] = useState({ x: 0, y: 0 });

  // Initialize real-time messaging
  const { isConnected, newMessageReceived, clearNewMessage } = useRealTimeMessages(currentConversation?.id || null);
  
  // Append new real-time messages to conversation
  useEffect(() => {
    if (newMessageReceived && currentConversation) {
      console.log('✅ Appending real-time message to conversation:', newMessageReceived);
      setConversationMessages(prev => [...prev, newMessageReceived]);
      clearNewMessage();
    }
  }, [newMessageReceived, currentConversation, clearNewMessage]);

  // Load saved search query from sessionStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSearchQuery = sessionStorage.getItem('campusConnect_messagesSearchQuery');
      if (savedSearchQuery) {
        setSearchQuery(savedSearchQuery);
      }
    }
  }, []);

  // Save search query to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('campusConnect_messagesSearchQuery', searchQuery);
    }
  }, [searchQuery]);

  // Fetch conversations on component mount
  useEffect(() => {
    console.log('🚀 MessagesTab mounted - fetching initial data');
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when currentConversation changes
  useEffect(() => {
    const loadConversationMessages = async () => {
      if (!currentConversation) {
        setConversationMessages([]);
        return;
      }

      setLoadingMessages(true);
      try {
        console.log('📬 Loading messages for conversation ID:', currentConversation.id);
        const messagesData = await apiService.getMessages(currentConversation.id);
        console.log('🔍 Raw messages response:', messagesData);
        console.log('🔍 Messages data:', messagesData.data);
        console.log('🔍 Messages array length:', messagesData.data?.length);
        setConversationMessages(messagesData.data || []);
        console.log('✅ Set conversationMessages state to:', messagesData.data || []);
        
      } catch (error) {
        console.error('❌ Failed to load messages:', error);
        setConversationMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadConversationMessages();
  }, [currentConversation]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current && conversationMessages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation || !currentUser) return;

    const messageContent = newMessage.trim();
    const tempMessageId = `temp-${Date.now()}`;
    
    // Optimistic update - add message to UI immediately
    const optimisticMessage = {
      id: tempMessageId,
      content: messageContent,
      senderId: currentUser.id.toString(),
      conversationId: currentConversation.id,
      isRead: false,
      createdAt: new Date().toISOString(),
      messageType: 'text' as const,
      sender: {
        id: currentUser.id.toString(),
        username: currentUser.username,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        displayName: currentUser.displayName || `${currentUser.firstName} ${currentUser.lastName}`,
        profilePicture: currentUser.profilePicture,
        email: currentUser.email,
        universityId: currentUser.universityId,
        createdAt: currentUser.createdAt,
        updatedAt: currentUser.updatedAt
      }
    };
    
    setConversationMessages(prev => [...prev, optimisticMessage]);
    setNewMessage('');

    try {
      // Send message to backend
      const sentMessage = await apiService.sendMessage(currentConversation.id, messageContent);
      
      // Replace temporary message with real message from server
      setConversationMessages(prev => 
        prev.map(msg => msg.id === tempMessageId ? sentMessage : msg)
      );
      
      console.log('✅ Message sent successfully:', sentMessage);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Remove optimistic message on error
      setConversationMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      // Restore message text so user can retry
      setNewMessage(messageContent);
      alert('Failed to send message. Please try again.');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('Image must be less than 10MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      setSelectedImage(file);
      handleUploadImage(file);
    }
  };

  const handleUploadImage = async (file: File) => {
    if (!currentConversation || !currentUser) return;

    setUploadingImage(true);

    const tempMessageId = `temp-img-${Date.now()}`;
    
    // Create temporary image message for optimistic update
    const optimisticMessage = {
      id: tempMessageId,
      content: '',
      senderId: currentUser.id.toString(),
      conversationId: currentConversation.id,
      isRead: false,
      createdAt: new Date().toISOString(),
      messageType: 'image' as const,
      mediaUrl: URL.createObjectURL(file), // Temporary local URL
      sender: {
        id: currentUser.id.toString(),
        username: currentUser.username,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        displayName: currentUser.displayName || `${currentUser.firstName} ${currentUser.lastName}`,
        profilePicture: currentUser.profilePicture,
        email: currentUser.email,
        universityId: currentUser.universityId,
        createdAt: currentUser.createdAt,
        updatedAt: currentUser.updatedAt
      }
    };
    
    setConversationMessages(prev => [...prev, optimisticMessage]);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiService.uploadConversationImage(currentConversation.id, formData);
      
      // Replace temporary message with real message from server
      setConversationMessages(prev => 
        prev.map(msg => msg.id === tempMessageId ? response.message : msg)
      );
      
      console.log('✅ Image uploaded successfully:', response);
    } catch (error) {
      console.error('❌ Failed to upload image:', error);
      // Remove optimistic message on error
      setConversationMessages(prev => prev.filter(msg => msg.id !== tempMessageId));
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
      setSelectedImage(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    console.log('🖱️ POST-CENTRIC CONVERSATION CLICKED - OPENING INLINE CHAT');
    console.log('Conversation:', conversation);
    console.log('Post context:', { postId: conversation.postId, postTitle: conversation.postTitle, postType: conversation.postType });
    console.log('Other user:', conversation.otherUser);
    
    // FIXED: Always open chat inline instead of navigating to separate page
    setCurrentConversation(conversation);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation(conversationId);
      // If the deleted conversation was selected, clear the current conversation
      if (currentConversation?.id.toString() === conversationId) {
        setCurrentConversation(null);
      }
      // Refresh conversations
      await fetchConversations();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation. Please try again.');
    }
  };

  // Simple filtering - all active conversations
  const filteredConversations = conversations.filter(conv => {
    // Search post title and user name
    const matchesSearch = searchQuery === '' || 
      conv.postTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  console.log('📊 ALL ACTIVE DISCUSSIONS:', filteredConversations.length);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  };

  // Handle resizing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    
    // Set min and max widths (200px to 600px)
    const clampedWidth = Math.min(Math.max(newWidth, 200), 600);
    setLeftPanelWidth(clampedWidth);
  }, [isDragging]);

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#525252' }}>
      <div ref={containerRef} className="flex min-h-screen">
        {/* Left Sidebar - Conversations */}
        <div 
          className="border-r border-[#708d81] flex flex-col rounded-lg overflow-y-hidden" 
          style={{ 
            backgroundColor: '#737373',
            width: `${leftPanelWidth}px`,
            minWidth: '200px',
            maxWidth: '600px',
            flexShrink: 0
          }}
        >
          {/* Header */}
          <div className="p-4 border-b border-[#708d81] rounded-t-lg">
            <h2 className="text-xl font-bold text-[#708d81] mb-4">Active Discussions</h2>
            
            {/* Search */}
            <div className="mt-4 px-2">
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-[#708d81] rounded-md focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto overflow-x-visible" style={{ backgroundColor: '#525252' }}>
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-[#708d81]">
                <p className="text-lg font-medium">No conversations yet</p>
                <p className="text-sm mt-2">Start a conversation to connect with other students</p>
              </div>
            ) : (
              <div className="px-2 pr-4">
                {filteredConversations.map((conversation, index) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={currentConversation?.id === conversation.id}
                    currentUserId={currentUser?.id || ''}
                    onSelect={handleConversationSelect}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Resizable Divider */}
        <div
          onMouseDown={handleMouseDown}
          className="w-1 hover:w-2 transition-all cursor-col-resize flex-shrink-0 relative group"
          style={{
            backgroundColor: isDragging ? '#708d81' : '#525252',
            cursor: 'col-resize'
          }}
        >
          {/* Visual indicator */}
          <div 
            className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ backgroundColor: '#708d81' }}
          />
        </div>

        {/* Right Side - Chat */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: '#737373' }}>
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#708d81]" style={{ backgroundColor: '#737373' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* POST ICON (PRIMARY) */}
                    <div className="w-10 h-10 flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center" style={{ border: '2px solid #708d81' }}>
                        {currentConversation.postType === 'goods' && <ShoppingBag size={16} style={{ color: '#10B981' }} />}
                        {currentConversation.postType === 'services' && <Wrench size={16} style={{ color: '#F59E0B' }} />}
                        {currentConversation.postType === 'housing' && <Home size={16} style={{ color: '#3B82F6' }} />}
                        {currentConversation.postType === 'events' && <Calendar size={16} style={{ color: '#8B5CF6' }} />}
                        {!['goods', 'services', 'housing', 'events'].includes(currentConversation.postType) && <FileText size={16} style={{ color: '#708d81' }} />}
                      </div>
                    </div>
                    <div>
                      {/* POST TITLE (PRIMARY) */}
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-[#708d81]">
                          {currentConversation.postTitle}
                        </h3>
                        {/* Real-time indicator */}
                        {isConnected && (
                          <span className="flex items-center space-x-1" title="Real-time messaging active">
                            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></span>
                          </span>
                        )}
                      </div>
                      {/* USER INFO (SECONDARY) */}
                      <p className="text-sm text-[#708d81] opacity-70">
                        Discussion with @{currentConversation.otherUser.displayName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Report User Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setReportingMessageId(null); // Report user, not specific message
                        setShowReportUserModal(true);
                      }}
                      className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      title="Report User"
                    >
                      <Flag size={20} />
                    </button>
                    
                    {/* Block User Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBlockUserModal(true);
                      }}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Block User"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m4.9 4.9 14.2 14.2"/>
                      </svg>
                    </button>
                    
                    {/* Delete Conversation Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete this conversation about "${currentConversation.postTitle}" with ${currentConversation.otherUser.displayName}?`)) {
                          handleDeleteConversation(currentConversation.id.toString());
                        }
                      }}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Conversation"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages - Comment Style */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ backgroundColor: '#737373' }}>
                {conversationMessages.length === 0 && !loadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 bg-[#708d81] rounded-full flex items-center justify-center mb-6">
                      <User size={40} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Start the conversation
                    </h3>
                    <p className="text-white opacity-70 max-w-md mb-4">
                      Send the first message to start discussing "{currentConversation?.postTitle}"
                    </p>
                  </div>
                ) : (
                  <>
                    {conversationMessages.map((message) => {
                      const isCurrentUser = message.senderId === currentUser?.id?.toString();
                      const showMessageMenu = openMessageMenuId === message.id;
                      
                      return (
                        <div 
                          key={message.id} 
                          className="comment-message py-2 relative"
                          onContextMenu={(e) => {
                            // Only allow reporting other user's messages
                            if (!isCurrentUser) {
                              e.preventDefault();
                              setMessageMenuPosition({ x: e.clientX, y: e.clientY });
                              setOpenMessageMenuId(message.id);
                            }
                          }}
                        >
                          {/* Comment Header */}
                          <div className="flex items-baseline space-x-2 mb-1">
                            <span className="font-semibold text-sm" style={{ color: isCurrentUser ? '#a8c4a2' : '#708d81' }}>
                              @{isCurrentUser ? 'you' : (message.sender?.displayName || currentConversation?.otherUser.displayName)}
                            </span>
                            <span className="text-xs opacity-60" style={{ color: '#e5e7eb' }}>
                              {formatTimeAgo(message.createdAt)}
                            </span>
                          </div>
                          {/* Comment Content */}
                          <div className="comment-content pl-2 border-l-2 border-[#708d81]">
                            {message.content && <p className="text-base text-white">{message.content}</p>}
                            {message.mediaUrl && (
                              <img 
                                src={message.mediaUrl.startsWith('http') ? message.mediaUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://campuskinect.net'}${message.mediaUrl}`}
                                alt="Shared media" 
                                className="mt-2 rounded-lg max-w-xs cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(message.mediaUrl.startsWith('http') ? message.mediaUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://campuskinect.net'}${message.mediaUrl}`, '_blank')}
                              />
                            )}
                          </div>
                          
                          {/* Context Menu for Message */}
                          {showMessageMenu && (
                            <>
                              <div 
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenMessageMenuId(null)}
                              />
                              <div 
                                className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                                style={{ 
                                  top: `${messageMenuPosition.y}px`,
                                  left: `${messageMenuPosition.x}px`
                                }}
                              >
                                <button
                                  onClick={() => {
                                    setOpenMessageMenuId(null);
                                    setReportingMessageId(message.id);
                                    setShowReportUserModal(true);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
                                >
                                  <Flag size={16} className="text-red-500" />
                                  <span>Report Message</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                    {/* Auto-scroll anchor */}
                    <div ref={messagesEndRef} />
                  </>
                )}
                
                {loadingMessages && (
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-[#708d81]" style={{ backgroundColor: '#737373' }}>
                <div className="flex items-center space-x-3">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  
                  {/* Image upload button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="p-2 bg-[#708d81] text-white rounded-lg hover:bg-[#5a7268] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Upload image"
                  >
                    <ImageIcon size={18} />
                  </button>
                  
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent text-black placeholder-gray-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-[#708d81] text-white rounded-lg hover:bg-[#5a7268] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center" style={{ backgroundColor: '#737373' }}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-[#708d81] rounded-full flex items-center justify-center">
                  <MessageCircle size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Select a Discussion
                </h3>
                <p className="text-white opacity-70 max-w-sm">
                  Choose a conversation from the left to start messaging about a specific post
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Report and Block Modals */}
      {currentConversation && (
        <>
          <ReportModal
            isOpen={showReportUserModal}
            onClose={() => {
              setShowReportUserModal(false);
              setReportingMessageId(null);
            }}
            contentId={reportingMessageId || currentConversation.otherUser.id.toString()}
            contentType={reportingMessageId ? 'message' : 'user'}
            contentTitle={reportingMessageId ? 'Message' : currentConversation.otherUser.displayName || 'User'}
            onReportSubmitted={() => {
              console.log('Report submitted successfully');
              setShowReportUserModal(false);
              setReportingMessageId(null);
            }}
          />
          
          <BlockUserModal
            isOpen={showBlockUserModal}
            onClose={() => setShowBlockUserModal(false)}
            user={{
              id: currentConversation.otherUser.id.toString(),
              username: currentConversation.otherUser.id.toString(), // Use ID as fallback
              email: '',
              firstName: '',
              lastName: '',
              displayName: currentConversation.otherUser.displayName || `User ${currentConversation.otherUser.id}`,
              profilePicture: undefined,
              universityId: '',
              createdAt: '',
              updatedAt: ''
            }}
            onUserBlocked={() => {
              console.log('User blocked successfully');
              setShowBlockUserModal(false);
              // Optionally refresh conversations to hide blocked user
              fetchConversations();
            }}
          />
        </>
      )}
    </div>
  );
};

export default MessagesTab; 