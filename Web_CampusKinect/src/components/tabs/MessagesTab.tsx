'use client';

import React, { useState, useEffect } from 'react';
import { Send, User, MoreHorizontal, Plus, X, Trash2, Package, Wrench, Home, Calendar, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMessagesStore } from '../../stores/messagesStore';
import { useAuthStore } from '../../stores/authStore';
import { Conversation, User as UserType } from '../../types';
import apiService from '../../services/api';

// Simple Conversation Item Component for Web
interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  activeTab: string;
  onSelect: (conversation: Conversation) => void;
  onDelete: (conversationId: string) => void;
  index: number;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  activeTab,
  onSelect,
  onDelete,
  index
}) => {
  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete this conversation about "${conversation.post.title}" with ${conversation.otherUser.displayName}?`)) {
      await onDelete(conversation.id.toString());
    }
  };

  const truncateMessage = (message: string, wordLimit: number) => {
    const words = message.split(' ');
    if (words.length <= wordLimit) return message;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  return (
    <div className="relative" style={{ width: '95%', margin: index === 0 ? '0 auto' : '16px auto 0 auto' }}>
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
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {/* POST ICON (PRIMARY) */}
            <div className="w-12 h-12 flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center" style={{ border: '2px solid #708d81' }}>
                {conversation.post.type === 'goods' && <Package size={20} className="text-blue-600" />}
                {conversation.post.type === 'services' && <Wrench size={20} className="text-green-600" />}
                {conversation.post.type === 'housing' && <Home size={20} className="text-orange-600" />}
                {conversation.post.type === 'events' && <Calendar size={20} className="text-purple-600" />}
                {!['goods', 'services', 'housing', 'events'].includes(conversation.post.type) && <FileText size={20} className="text-gray-600" />}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              {/* POST TITLE (PRIMARY) */}
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold text-black truncate">
                  {conversation.post.title}
                </p>
                {conversation.unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                  </span>
                )}
              </div>
              {/* Message preview */}
              {/* USER INFO (SECONDARY) */}
              <p className="text-sm text-gray-600 truncate">
                with {conversation.otherUser.displayName}
              </p>
              
              {/* LAST MESSAGE (TERTIARY) */}
              {conversation.lastMessage && (
                <p 
                  className="text-base mt-1 truncate" 
                  style={{ 
                    color: activeTab === 'primary' ? '#4b5563' : 'white'
                  }}
                >
                  {activeTab === 'primary' 
                    ? `You: ${truncateMessage(conversation.lastMessage, 8)}`
                    : truncateMessage(conversation.lastMessage, 10)
                  }
                </p>
              )}
            </div>
          </div>
          
          {/* Delete Button - Only visible on hover */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 rounded-lg hover:bg-red-500 ml-2 cursor-pointer"
            style={{ color: '#ef4444', cursor: 'pointer' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ef4444';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.cursor = 'pointer';
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const MessagesTab: React.FC = () => {
  const router = useRouter();
  const { 
    messages, 
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
  const [activeTab, setActiveTab] = useState<'unread' | 'primary'>('primary');
  
  // New Message Modal state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isSearching, setIsSearching] = useState(false);

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
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    console.log('🖱️ CONVERSATION CLICKED');
    console.log('Active tab:', activeTab);
    console.log('Conversation:', conversation);
    console.log('Current user:', currentUser);
    console.log('Participants:', conversation.participants);
    
    // For both Primary and Unread tabs, navigate to chat page
    if (activeTab === 'primary' || activeTab === 'unread') {
      console.log('💬 CONVERSATION CLICKED - NAVIGATING TO CHAT');
      
      // Find other user, or use the same user for self-conversations
      let targetUser = conversation.participants?.find(p => p.id !== currentUser?.id);
      
      // If no other user found (self-conversation), use the current user
      if (!targetUser && conversation.participants && conversation.participants.length > 0) {
        targetUser = conversation.participants[0];
        console.log('🔄 Self-conversation detected, using same user');
      }
      
      console.log('Target user for navigation:', targetUser);
      
      if (targetUser) {
        const chatUrl = `/chat/${targetUser.id}`;
        console.log('✅ Navigating to:', chatUrl);
        router.push(chatUrl);
      } else {
        console.error('❌ No user found in conversation participants');
        console.error('Conversation structure:', JSON.stringify(conversation, null, 2));
      }
    } else {
      // For other tabs, just select the conversation
      console.log('📩 CONVERSATION CLICKED - SELECTING CONVERSATION');
      setCurrentConversation(conversation);
    }
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
    const matchesSearch = conv.participants?.some(user => 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (activeTab === 'unread') {
      // Unread: Show conversations where the last message was sent TO the current user (incoming)
      const isIncomingMessage = conv.lastMessage && conv.lastMessage.senderId !== currentUser?.id.toString();
      const result = matchesSearch && isIncomingMessage;
      console.log(`🔍 UNREAD FILTER: Conv ${conv.id}, lastSenderId: ${conv.lastMessage?.senderId}, currentUserId: ${currentUser?.id}, isIncoming: ${isIncomingMessage}, result: ${result}`);
      return result;
    } else if (activeTab === 'primary') {
      // Primary: Show conversations where the last message was sent BY the current user (outgoing)
      const isOutgoingMessage = conv.lastMessage && conv.lastMessage.senderId === currentUser?.id.toString();
      const result = matchesSearch && isOutgoingMessage;
      console.log(`🔍 PRIMARY FILTER: Conv ${conv.id}, lastSenderId: ${conv.lastMessage?.senderId}, currentUserId: ${currentUser?.id}, isOutgoing: ${isOutgoingMessage}, result: ${result}`);
      return result;
    }
    return matchesSearch;
  });

  // Debug: Log all conversations and their unread counts
  console.log('📊 ALL CONVERSATIONS:', conversations.map(c => ({
    id: c.id,
    unreadCount: c.unreadCount,
    lastMessage: c.lastMessage,
    participants: c.participants?.map(p => `${p.firstName} ${p.lastName}`)
  })));
  
  console.log('📊 FILTERED CONVERSATIONS FOR', activeTab, 'TAB:', filteredConversations.length);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#525252' }}>
      <div className="flex min-h-screen">
        {/* Left Sidebar - Conversations */}
        <div className="w-full sm:w-64 border-r border-[#708d81] flex flex-col rounded-lg overflow-hidden" style={{ backgroundColor: '#737373' }}>
          {/* Header */}
          <div className="p-4 border-b border-[#708d81] rounded-t-lg">
            {/* Search and Plus Button */}
            <div className="mt-4 flex justify-center">
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
                  className="px-4 py-2 text-sm border border-[#708d81] rounded-md focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
                  style={{ width: '768px' }}
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
              <div className="relative bg-[#708d81] rounded-lg p-0 w-80" style={{ backgroundColor: '#708d81' }}>
                <div className="flex relative w-full">
                  <button
                    onClick={() => setActiveTab('unread')}
                    className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors rounded-md cursor-pointer`}
                    style={{
                      backgroundColor: activeTab === 'unread' ? '#737373' : '#708d81',
                      color: activeTab === 'unread' ? '#708d81' : 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Incoming
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('primary')}
                    className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors rounded-md cursor-pointer`}
                    style={{
                      backgroundColor: activeTab === 'primary' ? '#737373' : '#708d81',
                      color: activeTab === 'primary' ? '#708d81' : 'white',
                      cursor: 'pointer'
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
          <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#525252' }}>
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
                    ? 'You&apos;re all caught up with your messages!' 
                    : 'Start a conversation to connect with other students'
                  }
                </p>
              </div>
            ) : (
              // Show conversations
              <div className="px-2">
                {filteredConversations.map((conversation, index) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={currentConversation?.id === conversation.id}
                    activeTab={activeTab}
                    onSelect={handleConversationSelect}
                    onDelete={handleDeleteConversation}
                    index={index}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Chat */}
        <div className="flex-1 flex flex-col">
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-[#708d81]" style={{ backgroundColor: '#737373' }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {/* Profile Picture */}
                    <div className="w-10 h-10 flex-shrink-0">
                      {currentConversation.participants && currentConversation.participants[0]?.profilePicture ? (
                        <img
                          src={currentConversation.participants[0].profilePicture}
                          alt={`${currentConversation.participants[0].firstName} ${currentConversation.participants[0].lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                          style={{ border: '2px solid #708d81' }}
                        />
                      ) : (
                        <div className="w-10 h-10 bg-[#708d81] rounded-full flex items-center justify-center" style={{ border: '2px solid #708d81' }}>
                          <span className="text-white text-xs font-bold">
                            {currentConversation.participants && currentConversation.participants[0] 
                              ? `${currentConversation.participants[0].firstName?.charAt(0) || '?'}${currentConversation.participants[0].lastName?.charAt(0) || '?'}`
                              : <User size={20} className="text-white" />
                            }
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-[#708d81]">
                        {currentConversation.participants && currentConversation.participants[0] ? `${currentConversation.participants[0].firstName} ${currentConversation.participants[0].lastName}` : 'Unknown User'}
                      </h3>
                      <p className="text-sm text-[#708d81] opacity-70">
                        Online
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-[#708d81] hover:text-[#5a7268] hover:bg-[#525252] rounded-lg transition-colors cursor-pointer">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-8">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'} mb-4`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                        message.senderId === 'current-user' 
                          ? 'bg-[#708d81] text-white'
                          : 'bg-[#f0f2f0] text-[#708d81]'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.senderId === 'current-user' ? 'text-white opacity-80' : 'text-[#708d81] opacity-50'
                      }`}>
                        {new Date(message.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
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
                    className="flex-1 px-4 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesTab; 