'use client';

import React, { useState, useEffect } from 'react';
import { Send, User, MoreHorizontal, Plus, Search, Check, X, MoreVertical, MessageCircle } from 'lucide-react';
import { useMessagesStore } from '../../stores/messagesStore';
import { Conversation } from '../../types';

const MessagesTab: React.FC = () => {
  const { messages, isLoading, conversations, messageRequests, sendMessage } = useMessagesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [activeTab, setActiveTab] = useState<'unread' | 'primary' | 'requests'>('primary');

  useEffect(() => {
    // fetchConversations(); // This line was removed as per the edit hint
  }, []); // Removed fetchConversations from dependency array

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
                  className="px-4 py-2 text-[#708d81] border border-[#708d81] rounded-md transition-colors"
                  style={{ backgroundColor: '#f8f9f6' }}
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
                    className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors rounded-md`}
                    style={{
                      backgroundColor: activeTab === 'unread' ? 'white' : '#708d81',
                      color: activeTab === 'unread' ? '#708d81' : 'white'
                    }}
                  >
                    Unread
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('primary')}
                    className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors rounded-md`}
                    style={{
                      backgroundColor: activeTab === 'primary' ? 'white' : '#708d81',
                      color: activeTab === 'primary' ? '#708d81' : 'white'
                    }}
                  >
                    General
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`relative z-10 flex-1 px-4 py-2 text-sm font-medium transition-colors rounded-md`}
                    style={{
                      backgroundColor: activeTab === 'requests' ? 'white' : '#708d81',
                      color: activeTab === 'requests' ? '#708d81' : 'white'
                    }}
                  >
                    Requests
                  </button>
                </div>
              </div>
            </div>
          </div>



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
                    <div key={request.id} className="flex items-center space-x-3 p-4 rounded-lg hover:bg-[#f8f9f6] transition-colors">
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
                        <button className="p-1 text-[#708d81] hover:text-[#5a7268] hover:bg-[#f0f2f0] rounded transition-colors">
                          <Check size={16} />
                        </button>
                        <button className="p-1 text-[#708d81] hover:text-[#5a7268] hover:bg-[#f0f2f0] rounded transition-colors">
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
                  <button className="p-2 text-[#708d81] hover:text-[#5a7268] hover:bg-[#f0f2f0] rounded-lg transition-colors">
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
                    className="p-2 bg-[#708d81] text-white rounded-lg hover:bg-[#5a7268] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : showNewMessageModal ? (
            <div className="flex-1 relative">
              <div className="absolute top-4 right-4 bg-white rounded-lg p-8 w-96 border border-[#708d81] shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-base font-medium text-[#708d81]">New Message</h3>
                  <button
                    onClick={() => setShowNewMessageModal(false)}
                    className="px-2 py-1 text-[#708d81] rounded transition-colors"
                    style={{ backgroundColor: '#f0f2f0' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e8ebe8'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f0f2f0'}
                  >
                    <X size={16} />
                  </button>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Users"
                    className="w-full px-4 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent text-sm"
                  />
                  <div className="flex justify-end" style={{ marginTop: '10px' }}>
                    <button 
                      className="w-full px-4 py-2 text-white rounded-lg transition-colors text-sm"
                      style={{ backgroundColor: '#708d81' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#5a7268'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#708d81'}
                    >
                      Start Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>


    </div>
  );
};

export default MessagesTab; 