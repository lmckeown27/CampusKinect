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
  const { messages, isLoading, sendMessage } = useMessagesStore();
  
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

  // Load or create conversation
  useEffect(() => {
    if (!isMounted) return;

    const loadConversation = async () => {
      if (!currentUser || !chatUser) return;
      
      try {
        // Mock conversation for now
        const mockConversation: Conversation = {
          id: `conv_${currentUser.id}_${chatUser.id}`,
          participants: [currentUser, chatUser],
          participantIds: [currentUser.id, chatUser.id],
          lastMessage: undefined,
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          createdAt: new Date().toISOString(),
        };
        
        setConversation(mockConversation);
        setChatMessages([]); // Initialize with empty messages
        
      } catch (error) {
        console.error('Failed to load conversation:', error);
      }
    };

    loadConversation();
  }, [currentUser, chatUser, isMounted]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversation || !currentUser) return;

    try {
      // Create optimistic message
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

      // Send to backend
      await sendMessage(conversation.id, newMessage.trim());
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove optimistic message on error
      setChatMessages(prev => prev.filter(msg => !msg.id.startsWith('temp_')));
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
      router.back();
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
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-[#708d81] rounded-full flex items-center justify-center mb-4">
              <User size={32} className="text-white" />
            </div>
            <h3 className="text-lg font-medium text-[#708d81] mb-2">
              Start a conversation with {chatUser.firstName}
            </h3>
            <p className="text-gray-500 max-w-md">
              Send a message to begin your conversation. Be respectful and follow community guidelines.
            </p>
          </div>
        ) : (
          <>
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                    message.senderId === currentUser.id
                      ? 'bg-[#708d81] text-white rounded-br-md'
                      : 'bg-white text-[#708d81] border border-gray-200 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === currentUser.id 
                      ? 'text-white opacity-80' 
                      : 'text-gray-500'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-[#708d81] p-4">
        <div className="flex items-center space-x-3">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${chatUser.firstName}...`}
            className="flex-1 px-4 py-3 border border-[#708d81] rounded-2xl focus:ring-2 focus:ring-[#708d81] focus:border-transparent resize-none max-h-32"
            rows={1}
            style={{
              minHeight: '48px',
              height: Math.min(Math.max(48, newMessage.split('\n').length * 24), 128)
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
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
