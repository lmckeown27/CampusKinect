'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Send, ArrowLeft, User, MoreVertical } from 'lucide-react';
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !chatUser) return;

    try {
      console.log('📤 SEND MESSAGE ATTEMPT');
      console.log('📤 Current conversation state:', conversation);
      console.log('📤 Message to send:', newMessage.trim());
      console.log('📤 Current user:', currentUser);
      console.log('📤 Chat user:', chatUser);
      
      if (conversation) {
        console.log('✅ Using existing conversation');
        console.log('✅ Conversation object:', JSON.stringify(conversation, null, 2));
        
        // Existing conversation - send message normally
        const optimisticMessage: Message = {
          id: `temp_${Date.now()}`,
          conversationId: conversation.id,
          senderId: currentUser.id,
          content: newMessage.trim(),
          createdAt: new Date().toISOString(),
          isRead: false
        };

        setChatMessages(prev => [...prev, optimisticMessage]);
        setNewMessage('');

        // Send to backend using API service directly
        console.log('💬 Sending message to conversation:', conversation);
        console.log('📝 Message content:', newMessage.trim());
        console.log('🔢 Conversation ID:', conversation.id, 'Type:', typeof conversation.id);
        
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
      console.error('Failed to send message:', error);
      console.error('Error details:', error.message);
      
      // Remove optimistic message on error if it was a regular message
      if (conversation) {
        setChatMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
      }
      
      // Handle specific error cases with user-friendly messages
      if (error.response?.status === 409) {
        // 409 means there's already a pending message request
        alert('You already have a pending message request with this user. Please wait for them to respond or check your sent requests in the messages tab.');
        router.push('/messages');
      } else if (error.message?.includes('already sent') || error.message?.includes('already exists')) {
        alert('You already have a pending message request with this user. Check the messages tab to see your sent requests.');
        router.push('/messages');
      } else {
        // Show generic error for other cases
        const errorMessage = error.message || 'Failed to send message. Please try again.';
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

  // Show loading state until mounted
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-[#f8f9f6] flex items-center justify-center">
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
      <div className="min-h-screen bg-[#f8f9f6] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#708d81]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9f6] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-[#708d81] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
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
            <ArrowLeft size={20} />
          </button>
          
          <div className="w-10 h-10 bg-[#708d81] rounded-full flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
          
          <div>
            <h1 className="font-semibold text-[#708d81] text-lg">
              {chatUser.displayName || `${chatUser.firstName} ${chatUser.lastName}`}
            </h1>
            <p className="text-sm text-gray-500">@{chatUser.username}</p>
          </div>
        </div>

        <button 
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
          <MoreVertical size={20} />
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
              const isCurrentUser = message.senderId === currentUser.id;
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
                    <div className={`max-w-xs lg:max-w-md ${isCurrentUser ? 'ml-12' : 'mr-12'}`}>
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          isCurrentUser
                            ? 'bg-[#708d81] text-white rounded-br-md shadow-sm'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
                        }`}
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
      <div className="bg-white border-t border-[#708d81] p-4">
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
