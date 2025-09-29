'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Send, ArrowLeft, User, Trash2, Package, Wrench, Home, Calendar, FileText, Image as ImageIcon } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useMessagesStore } from '../../stores/messagesStore';
import apiService from '../../services/api';
import { User as UserType, Message, Conversation, StartConversationRequest } from '../../types';

interface ChatPageProps {
  userId: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ userId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuthStore();
  const { messages, isLoading, sendMessage } = useMessagesStore();
  
  const [newMessage, setNewMessage] = useState('');
  const [chatUser, setChatUser] = useState<UserType | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // POST-CENTRIC: Extract post context from URL
  const postId = searchParams.get('postId');
  const postTitle = searchParams.get('postTitle');

  // Ensure component is mounted before running client-side code
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Load chat user info
  useEffect(() => {
    if (!isMounted) return;

    const loadChatUser = async () => {
      try {
        const user = await apiService.getUserById(userId);
        setChatUser(user);
      } catch (error) {
        console.error('Failed to load user:', error);
        if (typeof window !== 'undefined') {
          router.push('/messages');
        }
      }
    };

    if (userId) {
      loadChatUser();
    }
  }, [userId, router, isMounted]);

  // Load existing conversation if it exists (lazy loading - don't create until first message)
  useEffect(() => {
    if (!isMounted) return;

    const loadConversation = async () => {
      if (!currentUser || !chatUser) return;
      
      try {
        // Clear any existing conversation state first
        setConversation(null);
        setChatMessages([]);
        
        // Try to find existing conversation between these users
        console.log('🔍 Loading conversations for user:', currentUser?.id, 'chatting with:', chatUser.id);
        console.log('🔍 Current user object:', currentUser);
        console.log('🔍 Chat user object:', chatUser);
        
        const conversations = await apiService.getConversations();
        console.log('📋 All conversations from API:', conversations);
        console.log('📋 Number of conversations:', conversations.length);
        
        const existingConversation = conversations.find(conv => {
          console.log('🔍 Checking POST-CENTRIC conversation:', conv);
          console.log('🔍 Conversation other user:', conv.otherUser);
          console.log('🔍 Conversation post:', { postId: conv.postId, postTitle: conv.postTitle });
          
          // POST-CENTRIC: Match by other user AND post (if specified)
          const hasTargetUser = conv.otherUser.id === chatUser.id;
          const hasTargetPost = postId ? conv.postId === postId : true;
          return hasTargetUser && hasTargetPost;
        });
        console.log('🎯 Found existing conversation:', existingConversation);
        
        if (existingConversation) {
          setConversation(existingConversation);
          console.log('💾 Set conversation state to:', existingConversation);
          
          // Load messages for this conversation
          try {
            console.log('📬 Loading messages for conversation ID:', existingConversation.id);
            const messagesData = await apiService.getMessages(existingConversation.id);
            setChatMessages(messagesData.data || []);
            console.log('✅ Loaded messages:', messagesData.data?.length || 0);
          } catch (error) {
            console.error('❌ Failed to load messages:', error);
            setChatMessages([]);
          }
        } else {
          // No existing conversation - will be created when user sends first message
          setConversation(null);
          setChatMessages([]);
          console.log('💭 No existing conversation found - will create when first message is sent');
        }
        
      } catch (error) {
        console.error('Failed to load conversation:', error);
        // If there's an error, assume no existing conversation
        setConversation(null);
        setChatMessages([]);
      }
    };

    loadConversation();
  }, [currentUser, chatUser, isMounted]);

  // Real-time message polling for live updates
  useEffect(() => {
    if (!conversation || !isMounted) return;

    const pollMessages = async () => {
      try {
        const messagesData = await apiService.getMessages(conversation.id);
        const newMessages = messagesData.data || [];
        
        // Only update if we have more messages than before
        if (newMessages.length > chatMessages.length) {
          console.log('📨 New messages detected:', newMessages.length - chatMessages.length);
          setChatMessages(newMessages);
        }
      } catch (error) {
        console.error('Failed to poll messages:', error);
      }
    };

    // Poll every 2 seconds for new messages
    const pollInterval = setInterval(pollMessages, 2000);

    // Cleanup interval on unmount or conversation change
    return () => clearInterval(pollInterval);
  }, [conversation, chatMessages.length, isMounted]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !chatUser) return;

    try {
      if (conversation) {
        // Existing conversation - send message normally
        const optimisticMessage: Message = {
          id: `temp_${Date.now()}`, // Temporary ID for optimistic UI
          conversationId: conversation.id,
          senderId: currentUser?.id || '', // Convert to string to match backend and alignment logic
          content: newMessage.trim(),
          createdAt: new Date().toISOString(),
          isRead: true // Mark sent messages as read immediately
        };

        setChatMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');

        // Send to backend using API service directly
        
        const sentMessage = await apiService.sendMessage(conversation.id, newMessage.trim());
        
        // Replace optimistic message with real message
        setChatMessages(prev => prev.map(msg => 
          msg.id === optimisticMessage.id ? sentMessage : msg
        ));
      } else {
        // No existing conversation - create POST-CENTRIC conversation with initial message
        try {
          if (!postId) {
            alert('Post context is required for messaging. Please navigate from a specific post.');
            return;
          }
          
          const request: StartConversationRequest = {
            otherUserId: chatUser.id,
            postId: postId,
            initialMessage: newMessage.trim()
          };
          
          const response = await apiService.startConversation(request);
          console.log('🚀 POST-CENTRIC conversation started:', response);
          
          // TODO: Handle the new conversation response structure
          // For now, refresh the page to load the new conversation
          setNewMessage('');
          alert('Conversation started! Your message has been sent.');
          window.location.reload();
        } catch (createError: any) {
          // Handle conversation creation errors
          const errorMessage = createError.response?.data?.error?.message || 
                              createError.response?.data?.message || 
                              createError.message || 
                              'Failed to start conversation. Please try again.';
          alert(`Error: ${errorMessage}`);
        }
      }
      
    } catch (error: any) {
      // Remove optimistic message on error if it was a regular message
      if (conversation) {
        setChatMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
      }
      
      // Show generic error for other cases
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to send message. Please try again.';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser || !chatUser) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setIsUploadingImage(true);

    try {
      let activeConversation = conversation;

      // If no conversation exists, create one first (LAZY CREATION)
      if (!activeConversation && postId) {
        console.log('🔄 Creating new conversation for post:', postId);
        
        const request: StartConversationRequest = {
          otherUserId: chatUser.id,
          postId: postId,
          initialMessage: 'Image' // Placeholder for image message
        };

        const response = await apiService.startConversation(request);
        activeConversation = response.data.conversation;
        setConversation(activeConversation);
        
        console.log('✅ New conversation created:', activeConversation?.id);
      }

      if (!activeConversation) {
        console.error('❌ No conversation available to send image');
        alert('Unable to send image. Please try sending a text message first.');
        return;
      }

      // Upload image to conversation
      const imageMessage = await apiService.uploadImageToConversation(
        (activeConversation as Conversation).id.toString(),
        file
      );

      // Add image message to local state
      setChatMessages(prev => [...prev, imageMessage]);
      
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleBackClick = () => {
    if (typeof window !== 'undefined') {
      router.push('/messages');
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversation) return;
    
    const confirmDelete = confirm('Are you sure you want to delete this conversation? This action cannot be undone.');
    if (!confirmDelete) return;

    try {
      // Use the messages store to delete the conversation
      const { deleteConversation } = useMessagesStore.getState();
      await deleteConversation(conversation.id);
      
      // Navigate back to messages after successful deletion
      router.push('/messages');
    } catch (error: any) {
      console.error('Failed to delete conversation:', error);
      alert(error.message || 'Failed to delete conversation. Please try again.');
    }
  };

  // Show loading state until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#525252] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#708d81]"></div>
      </div>
    );
  }

  if (!currentUser) {
    if (typeof window !== 'undefined') {
      router.push('/auth/login');
    }
    return null;
  }

  if (!chatUser) {
    return (
      <div className="min-h-screen bg-[#525252] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#708d81]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#525252] flex flex-col">
      {/* Header */}
      <div className="bg-grey-medium border-b border-[#708d81] px-4 py-3 flex items-center justify-between">
        <button
          onClick={handleBackClick}
          className="p-2 rounded-lg transition-all duration-200"
          style={{ 
            backgroundColor: '#708d81', 
            color: 'white', 
            border: '2px solid #708d81', 
            cursor: 'pointer' 
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.backgroundColor = '#5a7268'; 
            e.currentTarget.style.border = '2px solid #5a7268'; 
            e.currentTarget.style.cursor = 'pointer'; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.backgroundColor = '#708d81'; 
            e.currentTarget.style.border = '2px solid #708d81'; 
            e.currentTarget.style.cursor = 'pointer'; 
          }}
        >
          <ArrowLeft size={20} />
        </button>
        
        {/* Post-Centric Header Section */}
        <div className="flex flex-col items-center space-y-3 p-3 rounded-lg">
          {/* Post Title (Primary) */}
          <div className="text-center">
            <h1 className="font-bold text-[#708d81] text-xl mb-1">
              {postTitle || conversation?.postTitle || 'Post Conversation'}
            </h1>
            <div className="flex items-center justify-center space-x-2">
              {/* Post Type Icon */}
              <div className="w-6 h-6 flex items-center justify-center">
                {conversation?.postType === 'goods' && <Package size={16} className="text-blue-600" />}
                {conversation?.postType === 'services' && <Wrench size={16} className="text-green-600" />}
                {conversation?.postType === 'housing' && <Home size={16} className="text-orange-600" />}
                {conversation?.postType === 'events' && <Calendar size={16} className="text-purple-600" />}
                {!conversation?.postType && <FileText size={16} className="text-gray-600" />}
              </div>
              <span className="text-sm text-gray-600 capitalize">
                {conversation?.postType || 'Post'} • Conversation with {chatUser?.firstName}
              </span>
            </div>
          </div>
          
          {/* User Profile (Secondary) */}
          <div 
            className="flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 cursor-pointer hover:bg-gray-50"
            onClick={() => router.push(`/user/${chatUser?.id}`)}
            style={{ 
              border: '2px solid transparent',
              minWidth: '200px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#525252';
              e.currentTarget.style.border = '2px solid #708d81';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.border = '2px solid transparent';
              e.currentTarget.style.transform = 'translateY(0px)';
            }}
          >
            <div className="w-12 h-12 flex-shrink-0">
              {chatUser?.profilePicture ? (
                <img
                  src={chatUser.profilePicture}
                  alt={`${chatUser.firstName} ${chatUser.lastName}`}
                  className="w-12 h-12 rounded-full object-cover"
                  style={{ border: '2px solid #708d81' }}
                />
              ) : (
                <div className="w-12 h-12 bg-[#708d81] rounded-full flex items-center justify-center" style={{ border: '2px solid #708d81' }}>
                  <span className="text-white text-sm font-bold">
                    {chatUser ? `${chatUser.firstName?.charAt(0) || '?'}${chatUser.lastName?.charAt(0) || '?'}` : '?'}
                  </span>
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="font-medium text-[#708d81] text-sm">
                {chatUser?.displayName || `${chatUser?.firstName} ${chatUser?.lastName}`}
              </p>
              <p className="text-xs text-gray-500">@{chatUser?.username}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleDeleteConversation}
          className="p-2 rounded-lg transition-all duration-200"
          style={{ 
            backgroundColor: '#ef4444', 
            color: 'white', 
            border: '2px solid #ef4444', 
            cursor: 'pointer' 
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.backgroundColor = '#dc2626'; 
            e.currentTarget.style.border = '2px solid #dc2626'; 
            e.currentTarget.style.cursor = 'pointer'; 
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.backgroundColor = '#ef4444'; 
            e.currentTarget.style.border = '2px solid #ef4444'; 
            e.currentTarget.style.cursor = 'pointer'; 
          }}
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-[#708d81] rounded-full flex items-center justify-center mb-6">
              {conversation ? (
                <User size={40} className="text-white" />
              ) : (
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold text-[#708d81] mb-2">
              {conversation ? 
                `Continue your conversation` :
                `Start the conversation`
              }
            </h3>
            <p className="text-gray-600 max-w-md mb-4">
              {conversation ? 
                `Send a message to continue chatting about "${conversation.postTitle}"` :
                `Send the first message to start chatting about "${postTitle || 'this post'}"`
              }
            </p>
            {!conversation && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Your conversation will be created when you send your first message. 
                  If you leave without sending a message, no conversation will be saved.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {chatMessages.map((message, index) => {
              const isCurrentUser = message.senderId === currentUser.id.toString();
              
              // Debug alignment issue
              if (message.content.includes('test') || message.id.includes('temp_')) {
                console.log('🔍 ALIGNMENT DEBUG:', {
                  messageId: message.id,
                  content: message.content.substring(0, 30),
                  messageSenderId: message.senderId,
                  messageSenderIdType: typeof message.senderId,
                  currentUserId: currentUser.id,
                  currentUserIdString: currentUser.id.toString(),
                  isCurrentUser,
                  shouldBeRight: message.senderId === currentUser.id.toString()
                });
              }
              const showTime = index === 0 || 
                Math.abs(new Date(message.createdAt).getTime() - new Date(chatMessages[index - 1].createdAt).getTime()) > 300000; // 5 minutes
              
              return (
                <div key={message.id}>
                  {showTime && (
                    <div className="flex justify-center mb-2">
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                        {new Date(message.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-sm ${isCurrentUser ? 'ml-8' : 'mr-8'}`}>
                      <div
                        style={{
                          backgroundColor: isCurrentUser ? '#22c55e' : '#4b5563',
                          color: 'white',
                          padding: '12px 16px',
                          borderRadius: '16px',
                          borderBottomRightRadius: isCurrentUser ? '4px' : '16px',
                          borderBottomLeftRadius: isCurrentUser ? '16px' : '4px',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {message.messageType === 'image' && message.mediaUrl ? (
                          <div className="relative">
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${message.mediaUrl}`}
                              alt="Shared image"
                              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                              style={{ maxWidth: '200px', maxHeight: '200px' }}
                              onClick={() => {
                                // Open image in new tab for full view
                                window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${message.mediaUrl}`, '_blank');
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                      </div>
                      {/* Individual message timestamp (shown on hover or for latest message) */}
                      <div className={`text-xs text-gray-400 mt-1 ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                        {index === chatMessages.length - 1 && (
                          <span>
                            {new Date(message.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input - Centered and Reduced Width */}
              <div className="bg-grey-medium border-t border-[#708d81] p-4">
        <div className="max-w-sm mx-auto flex items-end space-x-3">
          {/* Image Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingImage}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0"
            style={{ 
              backgroundColor: isUploadingImage ? '#d1d5db' : '#708d81',
              color: 'white',
              border: isUploadingImage ? '2px solid #d1d5db' : '2px solid #708d81',
              cursor: isUploadingImage ? 'not-allowed' : 'pointer'
            }}
            title="Upload Image"
          >
            {isUploadingImage ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <ImageIcon size={20} />
            )}
          </button>
          
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={conversation ? `Add a message...` : `Send the first message...`}
            className="flex-1 px-4 py-3 border border-[#708d81] rounded-2xl focus:ring-2 focus:ring-[#708d81] focus:border-transparent resize-none max-h-32 text-base"
            rows={1}
            style={{
              minHeight: '52px',
              fontSize: '16px',
              lineHeight: '1.5',
              height: Math.min(Math.max(52, newMessage.split('\n').length * 24 + 28), 128)
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0"
            style={{ 
              backgroundColor: !newMessage.trim() || isLoading ? '#d1d5db' : '#708d81',
              color: 'white',
              border: !newMessage.trim() || isLoading ? '2px solid #d1d5db' : '2px solid #708d81',
              cursor: !newMessage.trim() || isLoading ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!(!newMessage.trim() || isLoading)) {
                e.currentTarget.style.backgroundColor = '#a8c4a2';
                e.currentTarget.style.border = '2px solid #a8c4a2';
                e.currentTarget.style.cursor = 'pointer';
              }
            }}
            onMouseLeave={(e) => {
              if (!(!newMessage.trim() || isLoading)) {
                e.currentTarget.style.backgroundColor = '#708d81';
                e.currentTarget.style.border = '2px solid #708d81';
                e.currentTarget.style.cursor = 'pointer';
              }
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
