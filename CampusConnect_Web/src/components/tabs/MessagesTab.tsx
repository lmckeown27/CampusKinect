'use client';

import React, { useState, useEffect } from 'react';
import { Send, User, MoreHorizontal, Plus, Search, Check, X, MessageCircle, MoreVertical } from 'lucide-react';
import { useMessagesStore } from '../../stores/messagesStore';
import { Conversation } from '../../types';

const MessagesTab: React.FC = () => {
  const { messages, isLoading, conversations, messageRequests, sendMessage } = useMessagesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

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

  const filteredConversations = conversations.filter(conv => 
    conv.participants?.some(user => 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

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
        <div className="w-full sm:w-80 bg-white border-r border-[#708d81] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#708d81]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#708d81]">Messages</h2>
              <button
                onClick={() => setShowNewMessageModal(true)}
                className="p-2 text-[#708d81] hover:text-[#5a7268] hover:bg-[#f0f2f0] rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#708d81] opacity-60" size={16} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
              />
            </div>
          </div>

          {/* Message Requests */}
          {messageRequests.length > 0 && (
            <div className="p-4 border-b border-[#708d81]">
              <h3 className="text-sm font-medium text-[#708d81] mb-3">Message Requests</h3>
              {messageRequests.map((request) => (
                <div key={request.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[#f0f2f0] transition-colors">
                  <div className="w-10 h-10 bg-[#708d81] rounded-full flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#708d81]">
                      {request.participants?.map(p => `${p.firstName} ${p.lastName}`).join(', ') || 'Unknown User'}
                    </p>
                    <p className="text-xs text-[#708d81] opacity-70">
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
          )}

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-[#708d81]">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">No conversations yet</p>
                <p className="text-sm mt-2">Start a conversation to connect with other students</p>
              </div>
            ) : (
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
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-center text-[#708d81]">
                  <User size={48} className="mx-auto mb-4 text-[#708d81] opacity-30" />
                  <h3 className="text-lg font-medium text-[#708d81] mb-4">Select a Conversation</h3>
                  <p className="text-sm text-[#708d81] mb-4">
                    Choose a conversation from the list to start messaging
                  </p>
                  <button
                    onClick={() => setShowNewMessageModal(true)}
                    className="px-4 py-2 text-[#708d81] hover:text-[#5a7268] transition-colors"
                  >
                    Start New Conversation
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-[#708d81] mb-4">New Message</h3>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="text-[#708d81] hover:text-[#5a7268] transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <p className="text-sm text-[#708d81] mb-4">
              Start a conversation with another student
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search for users..."
                className="w-full px-4 py-2 border border-[#708d81] rounded-lg focus:ring-2 focus:ring-[#708d81] focus:border-transparent"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowNewMessageModal(false)}
                  className="flex-1 px-4 py-2 text-[#708d81] hover:text-[#5a7268] transition-colors"
                >
                  Cancel
                </button>
                <button className="flex-1 px-4 py-2 bg-[#708d81] text-white rounded-lg hover:bg-[#5a7268] transition-colors">
                  Start Chat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesTab; 