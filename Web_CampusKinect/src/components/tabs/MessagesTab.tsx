'use client';

import React, { useState, useEffect } from 'react';
import { Send, User, Plus, X, Trash2, Package, Wrench, Home, Calendar, FileText, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMessagesStore } from '../../stores/messagesStore';
import { useAuthStore } from '../../stores/authStore';
import { Conversation, User as UserType } from '../../types';
import apiService from '../../services/api';
import { useRealTimeMessages } from '../../hooks/useRealTimeMessages';

// Simple Conversation Item Component for Web
interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  activeTab: string;
  currentUserId: string;
  onSelect: (conversation: Conversation) => void;
  index: number;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  activeTab,
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
          // TODO: Implement delete from parent component
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

  // Determine message direction for post-centric display
  const getMessageDirection = () => {
    if (!conversation.lastMessageSenderId) {
      return "Tap to start conversation";
    }
    return conversation.lastMessageSenderId === currentUserId ? "Sent" : "Incoming";
  };

  // Get post type icon and color
  const getPostTypeIcon = () => {
    switch (conversation.postType.toLowerCase()) {
      case 'goods': return <Package size={20} className="text-blue-600" />;
      case 'services': return <Wrench size={20} className="text-green-600" />;
      case 'housing': return <Home size={20} className="text-orange-600" />;
      case 'events': return <Calendar size={20} className="text-purple-600" />;
      default: return <FileText size={20} className="text-gray-600" />;
    }
  };


  const truncateMessage = (message: string, charLimit: number) => {
    if (message.length <= charLimit) return message;
    return message.slice(0, charLimit).trim() + '...';
  };

  return (
    <div className="relative" style={{ width: '100%', margin: index === 0 ? '0 auto' : '16px auto 0 auto' }}>
      <div
        className={`p-4 transition-all duration-200 rounded-lg group ${
          isSelected ? 'bg-[#e8f5e8]' : 'hover:bg-[#525252]'
        }`}
        style={{ 
          backgroundColor: isSelected ? '#5a7268' : '#708d81',
          cursor: 'pointer',
          border: '2px solid #000000'
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
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* POST ICON (PRIMARY) */}
            <div className="w-12 h-12 flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center" style={{ border: '2px solid #708d81' }}>
                {getPostTypeIcon()}
              </div>
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              {/* POST TITLE (PRIMARY) */}
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-black truncate">
                  {conversation.postTitle}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </span>
                )}
              </div>
              {/* MESSAGE DIRECTION (SECONDARY) */}
              <p className="text-sm text-gray-600 truncate font-medium">
                {getMessageDirection()}
              </p>
              
              {/* LAST MESSAGE (TERTIARY) */}
              {conversation.lastMessage && (
                <p 
                  className="text-base mt-1 truncate max-w-full" 
                  style={{ 
                    color: activeTab === 'primary' ? '#4b5563' : 'white',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {activeTab === 'primary' 
                    ? `You: ${truncateMessage(conversation.lastMessage, 25)}`
                    : truncateMessage(conversation.lastMessage, 35)
                  }
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
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeTab, setActiveTab] = useState<'unread' | 'primary'>('primary');
  
  // New Message Modal state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize real-time messaging
  const { isConnected } = useRealTimeMessages(currentConversation?.id || null);

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

  // Load saved active tab from sessionStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedActiveTab = sessionStorage.getItem('campusConnect_messagesActiveTab');
      if (savedActiveTab && ['unread', 'primary'].includes(savedActiveTab)) {
        setActiveTab(savedActiveTab as 'unread' | 'primary');
      }
    }
  }, []);

  // Save active tab to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('campusConnect_messagesActiveTab', activeTab);
    }
  }, [activeTab]);

  // Fetch conversations on component mount and tab change
  useEffect(() => {
    console.log('📂 Active tab changed to:', activeTab);
    fetchConversations();
  }, [activeTab, fetchConversations]);

  // Initial data fetch on component mount
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

  // Search users with debouncing
  useEffect(() => {
    if (!userSearchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        const users = await apiService.searchUsers(userSearchQuery);
        // Filter out the current user from search results
        const filteredUsers = users.filter(user => currentUser && user.id !== currentUser.id);
        setSearchResults(filteredUsers);
      } catch (error) {
        console.error('Failed to search users:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 150); // 150ms debounce

    return () => clearTimeout(timeoutId);
  }, [userSearchQuery, currentUser]);

  const handleUserSelect = (user: UserType) => {
    // Prevent selecting self
    if (currentUser && user.id === currentUser.id) {
      return;
    }
    
    setSelectedUser(user);
    setUserSearchQuery('');
    setSearchResults([]);
  };

  const handleStartChat = async () => {
    if (!selectedUser || !currentUser) return;
    
    // Double-check to prevent self-messaging
    if (selectedUser.id === currentUser.id) {
      console.warn('Cannot start a chat with yourself');
      return;
    }
    
    try {
      // Navigate to the universal messaging page
      router.push(`/chat/${selectedUser.id}`);
      
      // Reset modal state
      setShowNewMessageModal(false);
      setSelectedUser(null);
      setUserSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const handleCloseNewMessageModal = () => {
    setShowNewMessageModal(false);
    setSelectedUser(null);
    setUserSearchQuery('');
    setSearchResults([]);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentConversation) return;

    try {
      await sendMessage(currentConversation.id, newMessage.trim());
      setNewMessage('');
      
      // Reload messages for the current conversation
      const messagesData = await apiService.getMessages(currentConversation.id);
      setConversationMessages(messagesData.data || []);
    } catch (error) {
      console.error('Failed to send message:', error);
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

  const filteredConversations = conversations.filter(conv => {
    // POST-CENTRIC SEARCH: Search post title, description, and user name
    const matchesSearch = searchQuery === '' || 
      conv.postTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
              conv.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'unread') {
      // Unread: Show conversations where the last message was sent TO the current user (incoming)
      const isIncomingMessage = conv.lastMessage && conv.lastMessageSenderId !== currentUser?.id.toString();
      const result = matchesSearch && isIncomingMessage;
      console.log(`🔍 UNREAD FILTER: Conv ${conv.id}, lastSenderId: ${conv.lastMessageSenderId}, currentUserId: ${currentUser?.id}, isIncoming: ${isIncomingMessage}, result: ${result}`);
      return result;
    } else if (activeTab === 'primary') {
      // Primary: Show conversations where the last message was sent BY the current user (outgoing)
      const isOutgoingMessage = conv.lastMessage && conv.lastMessageSenderId === currentUser?.id.toString();
      const result = matchesSearch && isOutgoingMessage;
      console.log(`🔍 PRIMARY FILTER: Conv ${conv.id}, lastSenderId: ${conv.lastMessageSenderId}, currentUserId: ${currentUser?.id}, isOutgoing: ${isOutgoingMessage}, result: ${result}`);
      return result;
    }
    return matchesSearch;
  });

  // Debug: Log all POST-CENTRIC conversations and their unread counts
  console.log('📊 ALL POST-CENTRIC CONVERSATIONS:', conversations.map(c => ({
    id: c.id,
    unreadCount: c.unreadCount,
    lastMessage: c.lastMessage,
    postTitle: c.postTitle,
    otherUser: c.otherUser.displayName
  })));
  
  console.log('📊 FILTERED CONVERSATIONS FOR', activeTab, 'TAB:', filteredConversations.length);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#525252' }}>
      <div className="flex min-h-screen">
        {/* Left Sidebar - Conversations */}
        <div className="w-full sm:w-80 lg:w-96 xl:w-80 border-r border-[#708d81] flex flex-col rounded-lg overflow-y-hidden" style={{ backgroundColor: '#737373' }}>
          {/* Header */}
          <div className="p-4 border-b border-[#708d81] rounded-t-lg">
            {/* Search and Plus Button */}
            <div className="mt-4 px-2">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={
                    activeTab === 'unread' ? 'Search unread messages' :
                    activeTab === 'primary' ? 'Search primary messages' :
                    'Search conversations...'
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 text-sm border border-[#708d81] rounded-md focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
                />
                <button
                  onClick={() => setShowNewMessageModal(true)}
                  className="px-4 py-2 text-[#708d81] border border-[#708d81] rounded-md transition-colors cursor-pointer"
                  style={{ 
                    backgroundColor: '#525252', 
                    cursor: 'pointer',
                    color: '#708d81',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#525252'}
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex justify-center" style={{ marginTop: '32px' }}>
              <div className="relative bg-[#708d81] rounded-lg p-1 w-80" style={{ backgroundColor: '#708d81' }}>
                <div className="flex relative w-full gap-1">
                  <button
                    onClick={() => setActiveTab('unread')}
                    className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md cursor-pointer shadow-md hover:shadow-lg`}
                    style={{
                      backgroundColor: activeTab === 'unread' ? '#f0f2f0' : '#708d81',
                      color: activeTab === 'unread' ? '#708d81' : 'white',
                      cursor: 'pointer',
                      border: activeTab === 'unread' ? '2px solid #708d81' : '2px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== 'unread') {
                        e.currentTarget.style.backgroundColor = '#5a7268';
                      } else {
                        e.currentTarget.style.backgroundColor = '#e8ebe8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'unread') {
                        e.currentTarget.style.backgroundColor = '#708d81';
                      } else {
                        e.currentTarget.style.backgroundColor = '#f0f2f0';
                      }
                    }}
                  >
                    Incoming
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('primary')}
                    className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-md cursor-pointer shadow-md hover:shadow-lg`}
                    style={{
                      backgroundColor: activeTab === 'primary' ? '#f0f2f0' : '#708d81',
                      color: activeTab === 'primary' ? '#708d81' : 'white',
                      cursor: 'pointer',
                      border: activeTab === 'primary' ? '2px solid #708d81' : '2px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (activeTab !== 'primary') {
                        e.currentTarget.style.backgroundColor = '#5a7268';
                      } else {
                        e.currentTarget.style.backgroundColor = '#e8ebe8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeTab !== 'primary') {
                        e.currentTarget.style.backgroundColor = '#708d81';
                      } else {
                        e.currentTarget.style.backgroundColor = '#f0f2f0';
                      }
                    }}
                  >
                    Sent
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* New Message Modal - positioned right under tabs */}
          {showNewMessageModal && (
            <div className="px-4 pb-4 flex justify-center">
              <div className="rounded-lg p-4 border-2 border-[#708d81] shadow-lg w-72" style={{ backgroundColor: '#525252' }}>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#708d81]">New Message</h3>
                  <button
                    onClick={handleCloseNewMessageModal}
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
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Selected User Display */}
                  {selectedUser ? (
                    <div className="flex items-center justify-between py-2 px-3 rounded-lg border-2" style={{ backgroundColor: '#525252', borderColor: '#708d81' }}>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#708d81] rounded-full flex items-center justify-center">
                          {selectedUser.profilePicture ? (
                            <img 
                              src={selectedUser.profilePicture} 
                              alt={selectedUser.firstName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <User size={16} className="text-white" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: '#708d81' }}>
                            {selectedUser.displayName || `${selectedUser.firstName} ${selectedUser.lastName}`}
                          </p>
                          <p className="text-xs" style={{ color: '#5a7268' }}>@{selectedUser.username}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="p-1 rounded-lg transition-all duration-200"
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
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Search Input */}
                      <div className="mb-6">
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={userSearchQuery}
                          onChange={(e) => setUserSearchQuery(e.target.value)}
                          autoFocus
                          className="w-full px-4 py-3 border-2 border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-[#708d81] text-sm transition-all duration-200"
                          style={{ 
                            backgroundColor: '#525252',
                            color: '#708d81'
                          }}
                        />
                      </div>

                      {/* Search Results */}
                      {userSearchQuery.trim() && (
                        <div 
                          className="border border-[#708d81] rounded-lg mb-6" 
                          style={{ 
                            backgroundColor: '#525252',
                            maxHeight: searchResults.length > 3 ? '210px' : 'auto',
                            overflowY: searchResults.length > 3 ? 'auto' : 'visible'
                          }}
                        >
                          {isSearching ? (
                            <div className="p-3 text-center text-sm text-[#708d81]">
                              Searching...
                            </div>
                          ) : searchResults.length > 0 ? (
                            <div className="p-2">
                              {searchResults.map((user, index) => (
                                <button
                                  key={user.id}
                                  onClick={() => handleUserSelect(user)}
                                  className="w-full py-2 px-3 text-left flex items-center space-x-3 rounded-lg transition-all duration-200"
                                  style={{ 
                                    backgroundColor: '#737373',
                                    border: '1px solid #e5e7eb',
                                    cursor: 'pointer',
                                    marginBottom: index === searchResults.length - 1 ? '0' : '16px'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#708d81';
                                    e.currentTarget.style.borderColor = '#708d81';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(112, 141, 129, 0.3)';
                                    e.currentTarget.style.cursor = 'pointer';
                                    // Change text colors on hover
                                    const nameEl = e.currentTarget.querySelector('.user-name') as HTMLElement;
                                    const usernameEl = e.currentTarget.querySelector('.user-username') as HTMLElement;
                                    if (nameEl) nameEl.style.color = 'white';
                                    if (usernameEl) usernameEl.style.color = '#f3f4f6';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.borderColor = '#e5e7eb';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                    e.currentTarget.style.cursor = 'pointer';
                                    // Reset text colors
                                    const nameEl = e.currentTarget.querySelector('.user-name') as HTMLElement;
                                    const usernameEl = e.currentTarget.querySelector('.user-username') as HTMLElement;
                                    if (nameEl) nameEl.style.color = '#111827';
                                    if (usernameEl) usernameEl.style.color = '#6b7280';
                                  }}
                                >
                                  <div className="w-8 h-8 bg-[#708d81] rounded-full flex items-center justify-center">
                                    {user.profilePicture ? (
                                      <img 
                                        src={user.profilePicture} 
                                        alt={user.firstName}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <User size={16} className="text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium user-name" style={{ color: '#111827' }}>
                                      {user.displayName || `${user.firstName} ${user.lastName}`}
                                    </p>
                                    <p className="text-xs user-username" style={{ color: '#6b7280' }}>@{user.username}</p>
                                  </div>
                                </button>
                              ))}
                              {searchResults.length > 3 && (
                                <div className="mt-2 py-2 text-center border-t border-[#708d81] bg-[#525252]">
                                  <p className="text-xs text-[#5a7268] font-medium">
                                    ↓ Scroll to see all {searchResults.length} users ↓
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : !isSearching ? (
                            <div className="p-3 text-center text-sm text-[#708d81]">
                              No other users found
                            </div>
                          ) : null}
                        </div>
                      )}
                    </>
                  )}

                  {/* Start Chat Button */}
                  <div className="mt-16">
                    <button 
                      onClick={handleStartChat}
                      disabled={!selectedUser}
                      className="w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200"
                      style={{ 
                        backgroundColor: selectedUser ? '#708d81' : '#d1d5db',
                        color: 'white',
                        border: selectedUser ? '2px solid #708d81' : '2px solid #d1d5db',
                        cursor: selectedUser ? 'pointer' : 'not-allowed'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedUser) {
                          e.currentTarget.style.backgroundColor = '#a8c4a2';
                          e.currentTarget.style.border = '2px solid #a8c4a2';
                          e.currentTarget.style.cursor = 'pointer';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedUser) {
                          e.currentTarget.style.backgroundColor = '#708d81';
                          e.currentTarget.style.border = '2px solid #708d81';
                          e.currentTarget.style.cursor = 'pointer';
                        }
                      }}
                    >
                      Start Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto overflow-x-visible" style={{ backgroundColor: '#525252' }}>
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              // No conversations
              <div className="p-4 text-center text-[#708d81]">
                <p className="text-lg font-medium">
                  {activeTab === 'unread' ? 'No unread messages' : 'No conversations yet'}
                </p>
                <p className="text-sm mt-2">
                  {activeTab === 'unread' 
                    ? "You&apos;re all caught up with your messages!" 
                    : 'Start a conversation to connect with other students'
                  }
                </p>
              </div>
            ) : (
              // Show conversations
              <div className="px-2 pr-4">
                {filteredConversations.map((conversation, index) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={currentConversation?.id === conversation.id}
                    activeTab={activeTab}
                    currentUserId={currentUser?.id || ''}
                    onSelect={handleConversationSelect}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
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
                        {currentConversation.postType === 'goods' && <Package size={16} className="text-blue-600" />}
                        {currentConversation.postType === 'services' && <Wrench size={16} className="text-green-600" />}
                        {currentConversation.postType === 'housing' && <Home size={16} className="text-orange-600" />}
                        {currentConversation.postType === 'events' && <Calendar size={16} className="text-purple-600" />}
                        {!['goods', 'services', 'housing', 'events'].includes(currentConversation.postType) && <FileText size={16} className="text-gray-600" />}
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
                        with {currentConversation.otherUser.displayName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Report User Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Report ${currentConversation.otherUser.displayName} for inappropriate behavior?`)) {
                          // TODO: Implement report user functionality
                          alert('Report functionality will be implemented soon.');
                        }
                      }}
                      className="p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                      title="Report User"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                        <line x1="4" y1="22" x2="4" y2="15"/>
                      </svg>
                    </button>
                    
                    {/* Block User Button */}
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Block ${currentConversation.otherUser.displayName}? This will prevent them from messaging you.`)) {
                          // TODO: Implement block user functionality
                          alert('Block functionality will be implemented soon.');
                        }
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
                        if (confirm(`Are you sure you want to delete this conversation about &quot;${currentConversation.postTitle}&quot; with ${currentConversation.otherUser.displayName}?`)) {
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

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-8" style={{ backgroundColor: '#737373' }}>
                {(() => {
                  console.log('🎨 Rendering messages area. conversationMessages:', conversationMessages, 'length:', conversationMessages.length);
                  return null;
                })()}
                {conversationMessages.length === 0 && !loadingMessages ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 bg-[#708d81] rounded-full flex items-center justify-center mb-6">
                      <User size={40} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Start the conversation
                    </h3>
                    <p className="text-white opacity-70 max-w-md mb-4">
                      Send the first message to start chatting about &quot;{currentConversation?.postTitle}&quot;
                    </p>
                  </div>
                ) : (
                  conversationMessages.map((message) => {
                    const isCurrentUser = message.senderId === currentUser?.id?.toString();
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                            isCurrentUser 
                              ? 'bg-[#708d81] text-white'
                              : 'bg-[#f0f2f0] text-[#708d81]'
                          }`}
                        >
                          {/* Display sender name for non-current users */}
                          {!isCurrentUser && (
                            <p className="text-xs font-semibold mb-1 text-[#708d81] opacity-70">
                              {message.sender?.displayName || currentConversation?.otherUser.displayName}
                            </p>
                          )}
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            isCurrentUser ? 'text-white opacity-80' : 'text-[#708d81] opacity-50'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
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
                  <input
                    type="text"
                    placeholder="Type a message..."
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
                  Select a Post Conversation
                </h3>
                <p className="text-white opacity-70 max-w-sm">
                  Choose a conversation from the left to start messaging about a specific post
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesTab; 