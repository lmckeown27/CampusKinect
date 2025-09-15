'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, User, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useMessagesStore } from '../../stores/messagesStore';
import apiService from '../../services/api';
import { User as UserType, Message, Conversation } from '../../types';

interface ChatPageProps {
  userId: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ userId }) => {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const { messages, isLoading, sendMessage, createMessageRequest } = useMessagesStore();
  
  const [newMessage, setNewMessage] = useState('');
  const [chatUser, setChatUser] = useState<UserType | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Load existing conversation if it exists
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
          console.log('🔍 Checking conversation:', conv);
          console.log('🔍 Conversation participants:', conv.participants);
          
          const hasTargetUser = conv.participants?.some(p => {
            console.log('🔍 Comparing participant ID:', p.id, 'with chat user ID:', chatUser.id);
            return p.id === chatUser.id;
          });
          return hasTargetUser;
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
          // No existing conversation - this will be a new message request
          setConversation(null);
          setChatMessages([]);
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
    if (!newMessage.trim() || !currentUser || !chatUser) return;

    try {
      // Attempting to send message
      
      if (conversation) {
        // Using existing conversation
        
        // Existing conversation - send message normally
        const optimisticMessage: Message = {
          id: `temp_${Date.now()}`,
          conversationId: conversation.id,
          senderId: currentUser.id.toString(), // Convert to string to match backend and alignment logic
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
        // No existing conversation - create message request
        await createMessageRequest(chatUser.id, newMessage.trim());
        setNewMessage('');
        
        // Show success message and navigate back
        alert('Message request sent! The user will see your message in their requests.');
        router.push('/messages');
      }
      
    } catch (error: any) {
      // Remove optimistic message on error if it was a regular message
      if (conversation) {
        setChatMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
      }
      
      // Handle specific error cases with user-friendly messages
      if (error.response?.status === 409) {
        // 409 means there's already a pending message request
        // Try to get the specific error message from the backend
        const backendMessage = error.response?.data?.error?.message || 
                              error.response?.data?.message ||
                              'You already have a pending message request with this user. Please wait for them to respond.';
        
        alert(`${backendMessage}\n\nYou can check your sent requests in the messages tab.`);
        router.push('/messages');
      } else if (error.message?.includes('already sent') || 
                 error.message?.includes('already exists') || 
                 error.message?.includes('already have a pending')) {
        alert('You already have a pending message request with this user. Check the messages tab to see your sent requests.');
        router.push('/messages');
      } else {
        // Show generic error for other cases
        const errorMessage = error.response?.data?.error?.message || 
                            error.response?.data?.message || 
                            error.message || 
                            'Failed to send message. Please try again.';
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
        
        {/* Centered Profile Section - Clickable */}
        <div 
          className="flex flex-col items-center space-y-3 p-3 rounded-lg transition-all duration-200 cursor-pointer hover:bg-gray-50"
          onClick={() => router.push(`/user/${chatUser?.id}`)}
          style={{ 
            border: '2px solid transparent',
            minWidth: '150px'
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
          <div className="w-16 h-16 flex-shrink-0">
            {chatUser?.profilePicture ? (
              <img
                src={chatUser.profilePicture}
                alt={`${chatUser.firstName} ${chatUser.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
                style={{ border: '3px solid #708d81' }}
              />
            ) : (
              <div className="w-16 h-16 bg-[#708d81] rounded-full flex items-center justify-center" style={{ border: '3px solid #708d81' }}>
                <span className="text-white text-lg font-bold">
                  {chatUser ? `${chatUser.firstName?.charAt(0) || '?'}${chatUser.lastName?.charAt(0) || '?'}` : '?'}
                </span>
              </div>
            )}
          </div>
          <div className="text-center">
            <h1 className="font-semibold text-[#708d81] text-lg">
              {chatUser?.displayName || `${chatUser?.firstName} ${chatUser?.lastName}`}
            </h1>
            <p className="text-sm text-gray-500">@{chatUser?.username}</p>
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
            <div className="w-16 h-16 bg-[#708d81] rounded-full flex items-center justify-center mb-4">
              <User size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-medium text-[#708d81] mb-2">
              {conversation ? 
                `Start a conversation with ${chatUser.firstName}` :
                `Send a message request to ${chatUser.firstName}`
              }
            </h3>
            <p className="text-gray-500 max-w-md">
              {conversation ? 
                'Send a message to begin your conversation. Be respectful and follow community guidelines.' :
                'Your message will be sent as a request. They can choose to accept or decline it.'
              }
            </p>
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
                        <p className="text-base leading-relaxed whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
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
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={conversation ? `Message ${chatUser.firstName}...` : `Send a message request to ${chatUser.firstName}...`}
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
