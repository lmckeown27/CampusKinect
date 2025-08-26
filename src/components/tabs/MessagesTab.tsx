'use client';

import React, { useState, useEffect } from 'react';
import { useMessagesStore } from '@/stores/messagesStore';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  User, 
  MessageCircle, 
  Check, 
  X,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { formatRelativeTime } from '@/utils';

export default function MessagesTab() {
  const router = useRouter();
  const { 
    conversations, 
    messageRequests, 
    isLoading, 
    error,
    fetchConversations, 
    fetchMessageRequests,
    respondToMessageRequest,
    setCurrentConversation
  } = useMessagesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  useEffect(() => {
    fetchConversations();
    fetchMessageRequests();
  }, [fetchConversations, fetchMessageRequests]);

  const handleConversationSelect = (conversationId: number) => {
    setSelectedConversation(conversationId);
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      router.push(`/messages/${conversationId}`);
    }
  };

  const handleMessageRequestResponse = async (requestId: number, action: 'accept' | 'reject') => {
    await respondToMessageRequest(requestId, action);
  };

  const filteredConversations = conversations.filter(conv => 
    conv.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessageRequests = messageRequests.filter(req => 
    req.fromUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (conversations.length === 0 && messageRequests.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <MessageCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500 mb-6">
            When you start engaging with other users, your conversations will appear here.
          </p>
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send your first message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
        <button
          onClick={() => setShowNewMessageModal(true)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="New message"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Message Requests */}
        {messageRequests.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Message Requests</h2>
            <div className="space-y-2">
              {filteredMessageRequests.map(request => (
                <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {request.fromUser.profilePicture ? (
                        <img
                          src={request.fromUser.profilePicture}
                          alt={request.fromUser.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Request Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {request.fromUser.displayName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(request.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{request.message}</p>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMessageRequestResponse(request.id, 'accept')}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleMessageRequestResponse(request.id, 'reject')}
                          className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors flex items-center justify-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversations */}
        {conversations.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Conversations</h2>
            <div className="space-y-2">
              {filteredConversations.map(conversation => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation.id)}
                  className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedConversation === conversation.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* User Avatar */}
                    <div className="flex-shrink-0 relative">
                      {conversation.otherUser.profilePicture ? (
                        <img
                          src={conversation.otherUser.profilePicture}
                          alt={conversation.otherUser.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      
                      {/* Unread indicator */}
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Conversation Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {conversation.otherUser.displayName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      
                      {conversation.lastMessage ? (
                        <p className={`text-sm truncate ${
                          conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {conversation.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No messages yet</p>
                      )}
                    </div>

                    {/* More Options */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Show conversation options (delete, mute, etc.)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredConversations.length === 0 && filteredMessageRequests.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <p className="text-gray-500">No conversations found for "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* New Message Modal - TODO: Implement */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Message</h3>
            <p className="text-gray-500 mb-4">
              This feature will allow you to send messages to users you haven't messaged before.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 

import React, { useState, useEffect } from 'react';
import { useMessagesStore } from '@/stores/messagesStore';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Plus, 
  User, 
  MessageCircle, 
  Check, 
  X,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { formatRelativeTime } from '@/utils';

export default function MessagesTab() {
  const router = useRouter();
  const { 
    conversations, 
    messageRequests, 
    isLoading, 
    error,
    fetchConversations, 
    fetchMessageRequests,
    respondToMessageRequest,
    setCurrentConversation
  } = useMessagesStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  useEffect(() => {
    fetchConversations();
    fetchMessageRequests();
  }, [fetchConversations, fetchMessageRequests]);

  const handleConversationSelect = (conversationId: number) => {
    setSelectedConversation(conversationId);
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversation(conversation);
      router.push(`/messages/${conversationId}`);
    }
  };

  const handleMessageRequestResponse = async (requestId: number, action: 'accept' | 'reject') => {
    await respondToMessageRequest(requestId, action);
  };

  const filteredConversations = conversations.filter(conv => 
    conv.otherUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.lastMessage?.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessageRequests = messageRequests.filter(req => 
    req.fromUser.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (conversations.length === 0 && messageRequests.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <MessageCircle className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-gray-500 mb-6">
            When you start engaging with other users, your conversations will appear here.
          </p>
          <button
            onClick={() => setShowNewMessageModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send your first message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Messages</h1>
        <button
          onClick={() => setShowNewMessageModal(true)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
          title="New message"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 p-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Message Requests */}
        {messageRequests.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Message Requests</h2>
            <div className="space-y-2">
              {filteredMessageRequests.map(request => (
                <div key={request.id} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start space-x-3">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {request.fromUser.profilePicture ? (
                        <img
                          src={request.fromUser.profilePicture}
                          alt={request.fromUser.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                    </div>

                    {/* Request Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {request.fromUser.displayName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(request.createdAt)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{request.message}</p>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleMessageRequestResponse(request.id, 'accept')}
                          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                        >
                          <Check className="w-4 h-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleMessageRequestResponse(request.id, 'reject')}
                          className="flex-1 bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors flex items-center justify-center space-x-1"
                        >
                          <X className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversations */}
        {conversations.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-700 mb-3">Conversations</h2>
            <div className="space-y-2">
              {filteredConversations.map(conversation => (
                <div
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation.id)}
                  className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                    selectedConversation === conversation.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* User Avatar */}
                    <div className="flex-shrink-0 relative">
                      {conversation.otherUser.profilePicture ? (
                        <img
                          src={conversation.otherUser.profilePicture}
                          alt={conversation.otherUser.displayName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                      )}
                      
                      {/* Unread indicator */}
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                        </div>
                      )}
                    </div>

                    {/* Conversation Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {conversation.otherUser.displayName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      
                      {conversation.lastMessage ? (
                        <p className={`text-sm truncate ${
                          conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}>
                          {conversation.lastMessage.content}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No messages yet</p>
                      )}
                    </div>

                    {/* More Options */}
                    <div className="flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Show conversation options (delete, mute, etc.)
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredConversations.length === 0 && filteredMessageRequests.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <p className="text-gray-500">No conversations found for "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* New Message Modal - TODO: Implement */}
      {showNewMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Message</h3>
            <p className="text-gray-500 mb-4">
              This feature will allow you to send messages to users you haven't messaged before.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => setShowNewMessageModal(false)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 