'use client';

import React, { useState, useEffect } from 'react';
import { Send, User, MoreHorizontal, Plus, Search, Check, X, MoreVertical, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMessagesStore } from '../../stores/messagesStore';
import { useAuthStore } from '../../stores/authStore';
import { Conversation, User as UserType } from '../../types';
import apiService from '../../services/api';

const MessagesTab: React.FC = () => {
  const router = useRouter();
  const { 
    messages, 
    isLoading, 
    conversations, 
    messageRequests, 
    sentMessageRequests,
    sendMessage, 
    fetchConversations,
    fetchMessageRequests, 
    fetchSentMessageRequests,
    respondToMessageRequest 
  } = useMessagesStore();
  const { user: currentUser } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');

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

  const [newMessage, setNewMessage] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [activeTab, setActiveTab] = useState<'unread' | 'primary' | 'requests'>('primary');
  const [requestsSubTab, setRequestsSubTab] = useState<'incoming' | 'sent'>('incoming');
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());
  
  // New Message Modal state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Helper function to truncate message text
  const truncateMessage = (message: string, maxWords: number = 10): string => {
    const words = message.split(' ');
    if (words.length <= maxWords) {
      return message;
    }
    return words.slice(0, maxWords).join(' ') + '...';
  };

  // Load saved active tab from sessionStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedActiveTab = sessionStorage.getItem('campusConnect_messagesActiveTab');
      if (savedActiveTab && ['unread', 'primary', 'requests'].includes(savedActiveTab)) {
        setActiveTab(savedActiveTab as 'unread' | 'primary' | 'requests');
      }
    }
  }, []);

  // Save active tab to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('campusConnect_messagesActiveTab', activeTab);
    }
  }, [activeTab]);

  // Fetch data based on active tab
  useEffect(() => {
    console.log('📂 Active tab changed to:', activeTab);
    if (activeTab === 'requests') {
      fetchMessageRequests();
      fetchSentMessageRequests();
    } else if (activeTab === 'primary' || activeTab === 'unread') {
      fetchConversations();
    }
  }, [activeTab, fetchMessageRequests, fetchSentMessageRequests, fetchConversations]);

  // Initial data fetch on component mount
  useEffect(() => {
    console.log('🚀 MessagesTab mounted - fetching initial data');
    fetchConversations();
    fetchMessageRequests();
    fetchSentMessageRequests();
    }, [fetchConversations, fetchMessageRequests, fetchSentMessageRequests]);

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

  const handleAcceptRequest = async (requestId: string) => {
    if (processingRequests.has(requestId)) {
      console.log('⏳ Request already being processed, ignoring duplicate click');
      console.log('⏳ ACCEPT: Already processing this request, please wait...');
      return;
    }

    console.log('🟢 ACCEPT BUTTON CLICKED');
    console.log('Request ID:', requestId);
    console.log('Current user:', currentUser);
    console.log('Message requests before:', messageRequests);
    console.log('Conversations before:', conversations);
    
    console.log(`🟢 ACCEPT DEBUG: Starting accept process for request ${requestId}`);
    
    // Mark request as being processed
    setProcessingRequests(prev => new Set([...prev, requestId]));
    
    try {
      console.log('🔄 Calling respondToMessageRequest with action: accepted');
      await respondToMessageRequest(requestId, 'accepted');
      console.log('✅ respondToMessageRequest completed successfully');
      
      // Wait a moment for the backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔄 Refreshing message requests...');
      await fetchMessageRequests();
      console.log('✅ Message requests refreshed');
      
      console.log('🔄 Refreshing conversations...');
      await fetchConversations();
      console.log('✅ Conversations refreshed');
      
      // Force a small delay to ensure state updates
      setTimeout(() => {
        console.log('📊 ACCEPT DEBUG - Message requests after:', messageRequests.length);
        console.log('📊 ACCEPT DEBUG - Conversations after:', conversations.length);
        console.log('📊 ACCEPT DEBUG - Conversations with unread:', conversations.filter(c => c.unreadCount > 0));
        console.log('📊 ACCEPT DEBUG - All conversation details:', conversations.map(c => ({
          id: c.id,
          unreadCount: c.unreadCount,
          lastMessage: c.lastMessage,
          participants: c.participants?.map(p => `${p.firstName} ${p.lastName}`)
        })));
      }, 1000); // Increased delay to 1 second
      
      console.log('✅ ACCEPT SUCCESS: Request accepted and moved to Primary section!');
    } catch (error) {
      console.error('❌ Failed to accept request:', error);
      console.error(`❌ ACCEPT ERROR: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      // Remove from processing set
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (processingRequests.has(requestId)) {
      console.log('⏳ Request already being processed, ignoring duplicate click');
      console.log('⏳ DECLINE: Already processing this request, please wait...');
      return;
    }

    console.log('🔴 DECLINE BUTTON CLICKED');
    console.log('Request ID:', requestId);
    console.log('Current user:', currentUser);
    console.log('Message requests before:', messageRequests);
    
    console.log(`🔴 DECLINE DEBUG: Starting decline process for request ${requestId}`);
    
    // Mark request as being processed
    setProcessingRequests(prev => new Set([...prev, requestId]));
    
    try {
      console.log('🔄 Calling respondToMessageRequest with action: rejected');
      await respondToMessageRequest(requestId, 'rejected');
      console.log('✅ respondToMessageRequest completed successfully');
      
      // Wait a moment for the backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔄 Refreshing message requests...');
      await fetchMessageRequests();
      console.log('✅ Message requests refreshed');
      
      // Force a small delay to ensure state updates
      setTimeout(() => {
        console.log('Message requests after:', messageRequests);
      }, 100);
      
      console.log('✅ DECLINE SUCCESS: Request rejected and deleted from Requests section!');
    } catch (error) {
      console.error('❌ Failed to reject request:', error);
      console.error(`❌ DECLINE ERROR: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      // Remove from processing set
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
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

  const filteredRequests = messageRequests.filter(req => 
    req.fromUser.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.fromUser.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSentRequests = sentMessageRequests.filter(req => 
    req.toUser && (
      req.toUser.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.toUser.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div style={{ backgroundColor: '#f8f9f6' }}>
      <div className="flex h-full">
        {/* Left Sidebar - Conversations */}
        <div className="w-full sm:w-64 bg-white border-r border-[#708d81] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#708d81]">
            {/* Search and Plus Button */}
            <div className="mt-4 flex justify-center">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder={
                    activeTab === 'unread' ? 'Search unread messages' :
                    activeTab === 'primary' ? 'Search primary messages' :
                    activeTab === 'requests' ? 'Search message requests' :
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
                    backgroundColor: '#f8f9f6', 
                    cursor: 'pointer',
                    color: '#708d81',
                    WebkitTapHighlightColor: 'transparent',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f2f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9f6'}
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
                      backgroundColor: activeTab === 'unread' ? 'white' : '#708d81',
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
                      backgroundColor: activeTab === 'primary' ? 'white' : '#708d81',
                      color: activeTab === 'primary' ? '#708d81' : 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Sent
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors rounded-md cursor-pointer`}
                    style={{
                      backgroundColor: activeTab === 'requests' ? 'white' : '#708d81',
                      color: activeTab === 'requests' ? '#708d81' : 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Requests
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* New Message Modal - positioned right under tabs */}
          {showNewMessageModal && (
            <div className="px-4 pb-4 flex justify-center">
              <div className="bg-white rounded-lg p-4 border border-[#708d81] shadow-lg w-72">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-base font-medium text-[#708d81]">New Message</h3>
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
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#708d81] rounded-full flex items-center justify-center">
                          <User size={16} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {selectedUser.displayName || `${selectedUser.firstName} ${selectedUser.lastName}`}
                          </p>
                          <p className="text-xs text-gray-500">@{selectedUser.username}</p>
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
                          className="w-full px-4 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent text-sm"
                        />
                      </div>

                      {/* Search Results */}
                      {userSearchQuery.trim() && (
                        <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto mb-6">
                          {isSearching ? (
                            <div className="p-3 text-center text-sm text-gray-500">
                              Searching...
                            </div>
                          ) : searchResults.length > 0 ? (
                            searchResults.map((user) => (
                              <button
                                key={user.id}
                                onClick={() => handleUserSelect(user)}
                                className="w-full p-3 text-left hover:bg-gray-50 hover:shadow-soft hover-lift flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-fast rounded-lg"
                              >
                                <div className="w-8 h-8 bg-[#708d81] rounded-full flex items-center justify-center">
                                  <User size={16} className="text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {user.displayName || `${user.firstName} ${user.lastName}`}
                                  </p>
                                  <p className="text-xs text-gray-500">@{user.username}</p>
                                </div>
                              </button>
                            ))
                          ) : !isSearching ? (
                            <div className="p-3 text-center text-sm text-gray-500">
                              No other users found
                            </div>
                          ) : null}
                        </div>
                      )}
                    </>
                  )}

                  {/* Start Chat Button */}
                  <div>
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
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : activeTab === 'requests' ? (
              // Requests Tab - Show both incoming and sent requests
              <div className="flex flex-col h-full">
                {/* Requests Subtabs */}
                <div className="flex justify-center p-2 border-b border-[#708d81]">
                  <div className="relative bg-[#708d81] rounded-lg p-0 w-64">
                    <div className="flex relative w-full">
                      <button
                        onClick={() => setRequestsSubTab('incoming')}
                        className={`relative z-10 flex-1 px-3 py-1 text-xs font-medium transition-colors rounded-md cursor-pointer`}
                        style={{
                          backgroundColor: requestsSubTab === 'incoming' ? 'white' : '#708d81',
                          color: requestsSubTab === 'incoming' ? '#708d81' : 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Incoming
                      </button>
                      <button
                        onClick={() => setRequestsSubTab('sent')}
                        className={`relative z-10 flex-1 px-3 py-1 text-xs font-medium transition-colors rounded-md cursor-pointer`}
                        style={{
                          backgroundColor: requestsSubTab === 'sent' ? 'white' : '#708d81',
                          color: requestsSubTab === 'sent' ? '#708d81' : 'white',
                          cursor: 'pointer'
                        }}
                      >
                        Sent
                      </button>
                    </div>
                  </div>
                </div>

                {/* Requests Content */}
                <div className="flex-1 overflow-y-auto">
                  {requestsSubTab === 'incoming' ? (
                    // Incoming Requests
                    filteredRequests.length === 0 ? (
                      <div className="p-4 text-center text-[#708d81]">
                        <p className="text-lg font-medium">No incoming requests</p>
                        <p className="text-sm mt-2">You're all caught up!</p>
                      </div>
                    ) : (
                      <div className="px-2">
                        {filteredRequests.map((request, index) => (
                          <div key={request.id} className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-200" style={{ backgroundColor: '#708d81', border: '2px solid #000000', width: '95%', margin: index === 0 ? '0 auto' : '16px auto 0 auto', cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#5a7268';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#708d81';
                              e.currentTarget.style.transform = 'translateY(0px)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}>
                            {/* Profile Picture */}
                            <div className="w-12 h-12 flex-shrink-0">
                              {request.fromUser.profilePicture ? (
                                <img
                                  src={request.fromUser.profilePicture}
                                  alt={`${request.fromUser.firstName} ${request.fromUser.lastName}`}
                                  className="w-12 h-12 rounded-full object-cover"
                                  style={{ border: '2px solid #5a7268' }}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-[#5a7268] rounded-full flex items-center justify-center" style={{ border: '2px solid #5a7268' }}>
                                  <span className="text-white text-sm font-bold">
                                    {`${request.fromUser.firstName?.charAt(0) || '?'}${request.fromUser.lastName?.charAt(0) || '?'}`}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-semibold text-black truncate">
                                {`${request.fromUser.firstName} ${request.fromUser.lastName}`}
                              </p>
                              <p className="text-base truncate" style={{ color: 'white' }}>
                                {request.message}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleAcceptRequest(request.id)}
                                disabled={processingRequests.has(request.id)}
                                className="btn-primary btn-sm flex items-center space-x-1"
                                style={{ 
                                  backgroundColor: processingRequests.has(request.id) ? '#9ca3af' : 'var(--color-success)', 
                                  padding: '0.5rem 1rem',
                                  borderRadius: '0.5rem',
                                  color: 'white',
                                  fontWeight: '500',
                                  transition: 'all 0.2s',
                                  border: 'none',
                                  cursor: processingRequests.has(request.id) ? 'not-allowed' : 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#16a34a';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--color-success)';
                                  e.currentTarget.style.transform = 'translateY(0px)';
                                }}
                              >
                                <Check size={14} />
                                <span>Accept</span>
                              </button>
                              <button 
                                onClick={() => handleRejectRequest(request.id)}
                                disabled={processingRequests.has(request.id)}
                                className="btn-primary btn-sm flex items-center space-x-1"
                                style={{ 
                                  backgroundColor: processingRequests.has(request.id) ? '#9ca3af' : 'var(--color-error)',
                                  color: 'white',
                                  padding: '0.5rem 1rem',
                                  borderRadius: '0.5rem',
                                  fontWeight: '500',
                                  transition: 'all 0.2s',
                                  border: 'none',
                                  cursor: processingRequests.has(request.id) ? 'not-allowed' : 'pointer'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#dc2626';
                                  e.currentTarget.style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'var(--color-error)';
                                  e.currentTarget.style.transform = 'translateY(0px)';
                                }}
                              >
                                <X size={14} />
                                <span>Decline</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    // Sent Requests
                    filteredSentRequests.length === 0 ? (
                      <div className="p-4 text-center text-[#708d81]">
                        <p className="text-lg font-medium">No sent requests</p>
                        <p className="text-sm mt-2">Start a conversation to send a message!</p>
                      </div>
                    ) : (
                      <div className="px-2">
                        {filteredSentRequests.map((request, index) => (
                          <div key={request.id} className="flex items-center space-x-3 p-4 rounded-lg transition-all duration-200" style={{ backgroundColor: '#708d81', border: '2px solid #000000', width: '95%', margin: index === 0 ? '0 auto' : '16px auto 0 auto', cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#5a7268';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#708d81';
                              e.currentTarget.style.transform = 'translateY(0px)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}>
                            {/* Profile Picture */}
                            <div className="w-12 h-12 flex-shrink-0">
                              {request.toUser?.profilePicture ? (
                                <img
                                  src={request.toUser.profilePicture}
                                  alt={`${request.toUser.firstName} ${request.toUser.lastName}`}
                                  className="w-12 h-12 rounded-full object-cover"
                                  style={{ border: '2px solid #5a7268' }}
                                />
                              ) : (
                                <div className="w-12 h-12 bg-[#5a7268] rounded-full flex items-center justify-center" style={{ border: '2px solid #5a7268' }}>
                                  <span className="text-white text-sm font-bold">
                                    {request.toUser ? `${request.toUser.firstName?.charAt(0) || '?'}${request.toUser.lastName?.charAt(0) || '?'}` : '?'}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-semibold text-black truncate">
                                To: {request.toUser ? `${request.toUser.firstName} ${request.toUser.lastName}` : 'Unknown User'}
                              </p>
                              <p className="text-base truncate" style={{ color: 'white' }}>
                                {request.message}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <p className="text-xs text-gray-500">
                                  Status: 
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                  request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            ) : filteredConversations.length === 0 ? (
              // Primary/Unread Tabs - No conversations
              <div className="p-4 text-center text-[#708d81]">
                <p className="text-lg font-medium">
                  {activeTab === 'unread' ? 'No unread messages' : 'No conversations yet'}
                </p>
                <p className="text-sm mt-2">
                  {activeTab === 'unread' 
                    ? 'You\'re all caught up with your messages!' 
                    : 'Start a conversation to connect with other students'
                  }
                </p>
              </div>
            ) : (
              // Primary/Unread Tabs - Show conversations
              <div className="px-2">
                {filteredConversations.map((conversation, index) => (
                  <div
                    key={conversation.id}
                    className={`p-4 transition-all duration-200 rounded-lg ${
                      currentConversation?.id === conversation.id
                        ? 'bg-[#e8f5e8]'
                        : 'hover:bg-[#f8f9f6]'
                    }`}
                    style={{ 
                      backgroundColor: currentConversation?.id === conversation.id ? '#5a7268' : '#708d81',
                      cursor: 'pointer',
                      border: '2px solid #000000',
                      width: '95%',
                      margin: index === 0 ? '0 auto' : '16px auto 0 auto'
                    }}
                    onMouseEnter={(e) => {
                      if (currentConversation?.id !== conversation.id) {
                        e.currentTarget.style.backgroundColor = '#5a7268';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentConversation?.id !== conversation.id) {
                        e.currentTarget.style.backgroundColor = '#708d81';
                        e.currentTarget.style.transform = 'translateY(0px)';
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                    onClick={() => handleConversationSelect(conversation)}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Profile Picture */}
                      <div className="w-12 h-12 flex-shrink-0">
                        {conversation.participants && conversation.participants[0]?.profilePicture ? (
                          <img
                            src={conversation.participants[0].profilePicture}
                            alt={`${conversation.participants[0].firstName} ${conversation.participants[0].lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                            style={{ border: '2px solid #708d81' }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-[#5a7268] rounded-full flex items-center justify-center" style={{ border: '2px solid #708d81' }}>
                            <span className="text-white text-sm font-bold">
                              {conversation.participants && conversation.participants[0] 
                                ? `${conversation.participants[0].firstName?.charAt(0) || '?'}${conversation.participants[0].lastName?.charAt(0) || '?'}`
                                : <User size={24} className="text-white" />
                              }
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-semibold text-black truncate">
                            {conversation.participants && conversation.participants[0] ? `${conversation.participants[0].firstName} ${conversation.participants[0].lastName}` : 'Unknown User'}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        {/* Message preview */}
                        {conversation.lastMessage && (
                          <p 
                            className="text-base mt-1 truncate" 
                            style={{ 
                              color: activeTab === 'primary' ? '#4b5563' : 'white' // Darker grey for primary, white for unread
                            }}
                          >
                            {activeTab === 'primary' 
                              ? `You: ${truncateMessage(conversation.lastMessage.content, 8)}`
                              : truncateMessage(conversation.lastMessage.content, 10)
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
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
              <div className="p-4 border-b border-[#708d81] bg-white">
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
                  <button className="p-2 text-[#708d81] hover:text-[#5a7268] hover:bg-[#f0f2f0] rounded-lg transition-colors cursor-pointer">
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
              <div className="p-4 border-t border-[#708d81] bg-white">
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
            <div className="flex-1 flex items-center justify-center bg-gray-50">
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesTab; 