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
  const { messages, isLoading, conversations, messageRequests, sendMessage } = useMessagesStore();
  const { user: currentUser } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Load saved search query from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedSearchQuery = localStorage.getItem('campusConnect_messagesSearchQuery');
      if (savedSearchQuery) {
        setSearchQuery(savedSearchQuery);
      }
    }
  }, []);

  // Save search query to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('campusConnect_messagesSearchQuery', searchQuery);
    }
  }, [searchQuery]);

  const [newMessage, setNewMessage] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [activeTab, setActiveTab] = useState<'unread' | 'primary' | 'requests'>('primary');
  
  // New Message Modal state
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Load saved active tab from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedActiveTab = localStorage.getItem('campusConnect_messagesActiveTab');
      if (savedActiveTab && ['unread', 'primary', 'requests'].includes(savedActiveTab)) {
        setActiveTab(savedActiveTab as 'unread' | 'primary' | 'requests');
      }
    }
  }, []);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('campusConnect_messagesActiveTab', activeTab);
    }
  }, [activeTab]);

  useEffect(() => {
    // fetchConversations(); // This line was removed as per the edit hint
  }, []); // Removed fetchConversations from dependency array

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
        // Filter out the current user from search results (DISABLED FOR TESTING)
        // const filteredUsers = users.filter(user => currentUser && user.id !== currentUser.id);
        // setSearchResults(filteredUsers);
        setSearchResults(users); // Show all users including self for testing
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
    // Prevent selecting self (DISABLED FOR TESTING)
    // if (currentUser && user.id === currentUser.id) {
    //   return;
    // }
    
    setSelectedUser(user);
    setUserSearchQuery('');
    setSearchResults([]);
  };

  const handleStartChat = async () => {
    if (!selectedUser || !currentUser) return;
    
    // Double-check to prevent self-messaging (DISABLED FOR TESTING)
    // if (selectedUser.id === currentUser.id) {
    //   console.warn('Cannot start a chat with yourself');
    //   return;
    // }
    
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
    setCurrentConversation(conversation);
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participants?.some(user => 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (activeTab === 'unread') {
      return matchesSearch && conv.unreadCount > 0;
    }
    return matchesSearch;
  });

  const filteredRequests = messageRequests.filter(req => 
    req.participants?.some(user => 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
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
                    activeTab === 'primary' ? 'Search general messages' :
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
                  style={{ backgroundColor: '#f8f9f6', cursor: 'pointer' }}
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
                    Unread
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
                    General
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
              // Requests Tab
              filteredRequests.length === 0 ? (
                <div className="p-4 text-center text-[#708d81]">
                  <p className="text-lg font-medium">No message requests</p>
                  <p className="text-sm mt-2">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-[#f8f9f6] transition-colors" style={{ cursor: 'pointer' }}>
                      <div className="w-12 h-12 bg-[#708d81] rounded-full flex items-center justify-center">
                        <User size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#708d81] truncate">
                          {request.participants?.map(p => `${p.firstName} ${p.lastName}`).join(', ') || 'Unknown User'}
                        </p>
                        <p className="text-xs text-[#708d81] opacity-70 truncate">
                          {request.lastMessage?.content || 'No message content'}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 text-[#708d81] hover:text-[#5a7268] hover:bg-[#f0f2f0] rounded transition-colors cursor-pointer" style={{ cursor: 'pointer' }}>
                          <Check size={16} />
                        </button>
                        <button className="p-1 text-[#708d81] hover:text-[#5a7268] hover:bg-[#f0f2f0] rounded transition-colors cursor-pointer" style={{ cursor: 'pointer' }}>
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
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
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`p-4 cursor-pointer transition-colors ${
                      currentConversation?.id === conversation.id
                        ? 'bg-[#f0f2f0]'
                        : 'hover:bg-[#f8f9f6]'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-[#708d81] rounded-full flex items-center justify-center">
                        <User size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#708d81] truncate">
                          {conversation.participants?.map(u => `${u.firstName} ${u.lastName}`).join(', ') || 'Unknown User'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                          </span>
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
                    <div className="w-10 h-10 bg-[#708d81] rounded-full flex items-center justify-center">
                      <User size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-[#708d81]">
                        {currentConversation.participants?.map(u => `${u.firstName} ${u.lastName}`).join(', ') || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-[#708d81] opacity-70">
                        {currentConversation.participants?.length || 0} participant(s)
                      </p>
                    </div>
                  </div>
                  <button className="p-2 text-[#708d81] hover:text-[#5a7268] hover:bg-[#f0f2f0] rounded-lg transition-colors cursor-pointer">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
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