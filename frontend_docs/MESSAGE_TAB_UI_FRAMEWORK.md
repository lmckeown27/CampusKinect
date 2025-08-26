# 💬 Message Tab UI Framework

## 📋 Overview

This document defines the complete UI framework for the CampusConnect Message tab, implementing the Instagram/Tinder style conversation interface with empty state handling, real-time updates, and mobile-first responsive design.

## 🎨 Design System

### **Color Palette**
```css
:root {
  /* Primary Colors */
  --primary-blue: #007AFF;
  --primary-blue-dark: #0056CC;
  --primary-blue-light: #4DA3FF;
  
  /* Secondary Colors */
  --secondary-gray: #8E8E93;
  --secondary-gray-light: #F2F2F7;
  --secondary-gray-dark: #3A3A3C;
  
  /* Background Colors */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F2F2F7;
  --bg-tertiary: #E5E5EA;
  
  /* Text Colors */
  --text-primary: #000000;
  --text-secondary: #8E8E93;
  --text-tertiary: #C7C7CC;
  
  /* Status Colors */
  --success-green: #34C759;
  --warning-orange: #FF9500;
  --error-red: #FF3B30;
  --info-blue: #007AFF;
  
  /* Message Colors */
  --message-sent: #007AFF;
  --message-received: #F2F2F7;
  --message-text-sent: #FFFFFF;
  --message-text-received: #000000;
}
```

### **Typography**
```css
:root {
  /* Font Families */
  --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-secondary: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
  
  /* Font Sizes */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 20px;
  --text-2xl: 24px;
  --text-3xl: 30px;
  
  /* Font Weights */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 1.2;
  --leading-normal: 1.4;
  --leading-relaxed: 1.6;
}
```

### **Spacing & Layout**
```css
:root {
  /* Spacing Scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

## 🏗️ Component Architecture

### **1. MessageTab Container**
```typescript
interface MessageTabProps {
  userId: string;
  universityId: string;
}

const MessageTab: React.FC<MessageTabProps> = ({ userId, universityId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  
  // Search functionality
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredConversations(conversations);
      return;
    }
    
    const filtered = conversations.filter(conversation => 
      conversation.otherUser.displayName.toLowerCase().includes(query.toLowerCase()) ||
      conversation.lastMessage?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [conversations]);
  
  // New message functionality
  const handleNewMessage = useCallback(() => {
    // Open user discovery modal for new conversations
    // This would integrate with the user search/discovery system
    console.log('Opening new message modal');
  }, []);
  
  // Component logic here
  
  return (
    <div className="message-tab">
      {loading ? (
        <div className="loading-state">Loading conversations...</div>
      ) : error ? (
        <div className="error-state">{error}</div>
      ) : conversations.length === 0 ? (
        <EmptyState onStartEngaging={() => console.log('Navigate to posts')} />
      ) : (
        <>
          {/* Search Bar and New Message Icon */}
          <div className="search-bar-container">
            <SearchBar onSearch={handleSearch} />
            <NewMessageIcon onNewMessage={handleNewMessage} />
          </div>
          
          {/* Conversation List */}
          <ConversationList
            conversations={filteredConversations}
            onConversationSelect={setSelectedConversation}
            onConversationDelete={(id) => {
              setConversations(prev => prev.filter(c => c.id !== id));
              setFilteredConversations(prev => prev.filter(c => c.id !== id));
            }}
          />
          
          {/* Chat Interface */}
          {selectedConversation && (
            <ChatInterface
              conversation={selectedConversation}
              onBack={() => setSelectedConversation(null)}
              onSendMessage={(content, type) => {
                // Handle sending message
                console.log('Sending message:', content, type);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
```

### **2. Empty State Component**
```typescript
interface EmptyStateProps {
  onStartEngaging: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onStartEngaging }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📱</div>
      <h3 className="empty-state-title">No conversations yet</h3>
      <p className="empty-state-description">
        When you start engaging with other users, your conversations will appear here in the Messages tab.
      </p>
      <div className="empty-state-tips">
        <div className="tip-item">
          <span className="tip-icon">💡</span>
          <span className="tip-text">Start by commenting on posts or responding to messages</span>
        </div>
        <div className="tip-item">
          <span className="tip-icon">🔍</span>
          <span className="tip-text">Browse posts and reach out to users with similar interests</span>
        </div>
        <div className="tip-item">
          <span className="tip-icon">📝</span>
          <span className="tip-text">Create posts to attract others to message you</span>
        </div>
      </div>
      <button className="btn-primary" onClick={onStartEngaging}>
        Explore Posts
      </button>
    </div>
  );
};
```

### **3. Conversation List Component**
```typescript
interface ConversationListProps {
  conversations: Conversation[];
  onConversationSelect: (conversationId: string) => void;
  onConversationDelete: (conversationId: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  onConversationSelect,
  onConversationDelete
}) => {
  return (
    <div className="conversation-list">
      {conversations.map(conversation => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
          onSelect={() => onConversationSelect(conversation.id)}
          onDelete={() => onConversationDelete(conversation.id)}
        />
      ))}
    </div>
  );
};
```

### **4. Conversation Card Component**
```typescript
interface ConversationCardProps {
  conversation: Conversation;
  onSelect: () => void;
  onDelete: () => void;
}

const ConversationCard: React.FC<ConversationCardProps> = ({
  conversation,
  onSelect,
  onDelete
}) => {
  const [showActions, setShowActions] = useState(false);
  
  return (
    <div className="conversation-card" onClick={onSelect}>
      <div className="conversation-avatar">
        <img 
          src={conversation.otherUser.profilePicture || '/default-avatar.png'} 
          alt={`${conversation.otherUser.displayName}'s profile`}
          className="avatar-image"
        />
        <div className="online-indicator" />
      </div>
      
      <div className="conversation-content">
        <div className="conversation-header">
          <h4 className="conversation-name">
            {conversation.otherUser.displayName}
          </h4>
          <span className="conversation-time">
            {formatRelativeTime(conversation.lastMessageTime)}
          </span>
        </div>
        
        <div className="conversation-details">
          <span className="conversation-university">
            {conversation.otherUser.university}
          </span>
          {conversation.postTitle && (
            <span className="conversation-post">
              • {conversation.postTitle}
            </span>
          )}
        </div>
        
        <div className="conversation-message">
          <p className="message-preview">
            {conversation.lastMessage || 'No messages yet'}
          </p>
        </div>
      </div>
      
      <div className="conversation-actions">
        {conversation.unreadCount > 0 && (
          <span className="unread-badge">
            {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
          </span>
        )}
        
        <button 
          className="action-button"
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
        >
          ⋯
        </button>
        
        {showActions && (
          <div className="action-menu">
            <button onClick={onDelete} className="action-item delete">
              Delete Conversation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
```

### **5. Search Bar Component**
```typescript
interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search conversations...", 
  debounceMs = 300 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        onSearch(searchQuery.trim());
        setIsSearching(false);
      }
    }, debounceMs);
    
    return () => clearTimeout(timer);
  }, [searchQuery, onSearch, debounceMs]);
  
  return (
    <div className="search-bar-container">
      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="search-input"
        />
        {isSearching && <span className="search-spinner">⏳</span>}
      </div>
    </div>
  );
};
```

### **6. New Message Icon Component**
```typescript
interface NewMessageIconProps {
  onNewMessage: () => void;
  isVisible?: boolean;
}

const NewMessageIcon: React.FC<NewMessageIconProps> = ({ 
  onNewMessage, 
  isVisible = true 
}) => {
  if (!isVisible) return null;
  
  return (
    <button 
      className="new-message-icon"
      onClick={onNewMessage}
      aria-label="Start new conversation"
      title="Start new conversation"
    >
      <span className="icon">✏️</span>
      <span className="label">New Message</span>
    </button>
  );
};
```

### **7. Chat Interface Component**
```typescript
interface ChatInterfaceProps {
  conversation: Conversation;
  onBack: () => void;
  onSendMessage: (content: string, messageType: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  onBack,
  onSendMessage
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Navigate to user's public profile
  const navigateToProfile = (userId: string) => {
    // This would integrate with the app's routing system
    console.log('Navigating to user profile:', userId);
    // Example: router.push(`/profile/${userId}`);
  };
  
  return (
    <div className="chat-interface">
      <div className="chat-header">
        <button className="back-button" onClick={onBack}>
          ←
        </button>
        <div className="chat-user-info" onClick={() => navigateToProfile(conversation.otherUser.id)}>
          <img 
            src={conversation.otherUser.profilePicture} 
            alt="Profile" 
            className="chat-avatar"
          />
          <div className="user-details">
            <h3 className="user-name">{conversation.otherUser.displayName}</h3>
            {/* Removed university info as per user requirements */}
          </div>
        </div>
        <button className="more-options">⋯</button>
      </div>
      
      <div className="chat-messages">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
      </div>
      
      <div className="chat-input">
        <div className="input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="message-input"
          />
          <button 
            className="send-button"
            onClick={() => {
              if (newMessage.trim()) {
                onSendMessage(newMessage, 'text');
                setNewMessage('');
              }
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
```

### **6. Message Bubble Component**
```typescript
interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div className={`message-bubble ${message.isOwn ? 'sent' : 'received'}`}>
      <div className="message-content">
        {message.messageType === 'text' && (
          <p className="message-text">{message.content}</p>
        )}
        {message.messageType === 'image' && (
          <img src={message.mediaUrl} alt="Shared image" className="message-image" />
        )}
        {message.messageType === 'contact' && (
          <div className="message-contact">
            <span className="contact-icon">👤</span>
            <span className="contact-text">Contact shared</span>
          </div>
        )}
      </div>
      <div className="message-meta">
        <span className="message-time">
          {formatTime(message.createdAt)}
        </span>
        {message.isOwn && (
          <span className="message-status">
            {message.isRead ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  );
};
```

## 🎨 CSS Implementation

### **Empty State Styles**
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  text-align: center;
  min-height: 400px;
}

.empty-state-icon {
  font-size: 64px;
  margin-bottom: var(--space-6);
  opacity: 0.6;
}

.empty-state-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin-bottom: var(--space-3);
}

.empty-state-description {
  font-size: var(--text-base);
  color: var(--text-secondary);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-8);
  max-width: 400px;
}

.empty-state-tips {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-bottom: var(--space-8);
}

.tip-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.tip-icon {
  font-size: var(--text-lg);
}
```

### **Search Bar & New Message Icon Styles**
```css
.search-bar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--bg-tertiary);
  background-color: var(--bg-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: var(--text-lg);
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-3) var(--space-3) var(--space-10);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  background-color: var(--bg-secondary);
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-blue);
  background-color: var(--bg-primary);
}

.search-spinner {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

.new-message-icon {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background-color: var(--primary-blue);
  color: var(--bg-primary);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.new-message-icon:hover {
  background-color: var(--primary-blue-dark);
}

.new-message-icon .icon {
  font-size: var(--text-lg);
}

.new-message-icon .label {
  display: none;
}

@media (min-width: 768px) {
  .new-message-icon .label {
    display: inline;
  }
}
```

### **Conversation Card Styles**
```css
.conversation-card {
  display: flex;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--bg-tertiary);
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.conversation-card:hover {
  background-color: var(--bg-secondary);
}

.conversation-avatar {
  position: relative;
  margin-right: var(--space-4);
}

.avatar-image {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background-color: var(--success-green);
  border: 2px solid var(--bg-primary);
  border-radius: var(--radius-full);
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-1);
}

.conversation-name {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  margin: 0;
}

.conversation-time {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.conversation-details {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.conversation-university {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.conversation-post {
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.message-preview {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.unread-badge {
  background-color: var(--primary-blue);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  min-width: 20px;
  text-align: center;
}

.action-button {
  background: none;
  border: none;
  font-size: var(--text-xl);
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
}

.action-button:hover {
  background-color: var(--bg-secondary);
}
```

### **Chat Interface Styles**
```css
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
}

.chat-header {
  display: flex;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--bg-tertiary);
  background-color: var(--bg-primary);
}

.back-button {
  background: none;
  border: none;
  font-size: var(--text-xl);
  color: var(--primary-blue);
  cursor: pointer;
  padding: var(--space-2);
  margin-right: var(--space-3);
}

.chat-user-info {
  display: flex;
  align-items: center;
  flex: 1;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-md);
  transition: background-color 0.2s ease;
}

.chat-user-info:hover {
  background-color: var(--bg-secondary);
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  margin-right: var(--space-3);
}

.user-name {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0;
}

.user-university {
  font-size: var(--text-sm);
  color: var(--text-secondary);
  margin: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
  background-color: var(--bg-secondary);
}

.chat-input {
  padding: var(--space-4);
  border-top: 1px solid var(--bg-tertiary);
  background-color: var(--bg-primary);
}

.input-container {
  display: flex;
  gap: var(--space-3);
}

.message-input {
  flex: 1;
  padding: var(--space-3);
  border: 1px solid var(--bg-tertiary);
  border-radius: var(--radius-lg);
  font-size: var(--text-base);
  outline: none;
}

.message-input:focus {
  border-color: var(--primary-blue);
}

.send-button {
  background-color: var(--primary-blue);
  color: white;
  border: none;
  padding: var(--space-3) var(--space-5);
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  cursor: pointer;
}

.send-button:hover {
  background-color: var(--primary-blue-dark);
}
```

### **Message Bubble Styles**
```css
.message-bubble {
  margin-bottom: var(--space-3);
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-bubble.sent {
  align-self: flex-end;
  margin-left: auto;
  align-items: flex-end;
}

.message-bubble.received {
  align-self: flex-start;
  margin-right: auto;
  align-items: flex-start;
}

.message-content {
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  position: relative;
}

.message-bubble.sent .message-content {
  background-color: var(--message-sent);
  color: var(--message-text-sent);
}

.message-bubble.received .message-content {
  background-color: var(--message-received);
  color: var(--message-text-received);
}

.message-text {
  margin: 0;
  line-height: var(--leading-normal);
}

.message-image {
  max-width: 100%;
  border-radius: var(--radius-md);
}

.message-contact {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.message-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-1);
  padding: 0 var(--space-4);
}

.message-time {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.message-status {
  font-size: var(--text-xs);
  color: var(--text-secondary);
}
```

## 📱 Responsive Design

### **Mobile-First Approach**
```css
/* Base styles for mobile */
.conversation-card {
  padding: var(--space-3);
}

.conversation-avatar .avatar-image {
  width: 48px;
  height: 48px;
}

/* Tablet styles */
@media (min-width: 768px) {
  .conversation-card {
    padding: var(--space-4);
  }
  
  .conversation-avatar .avatar-image {
    width: 56px;
    height: 56px;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .conversation-list {
    max-width: 400px;
  }
  
  .chat-interface {
    height: calc(100vh - 64px);
  }
}
```

## 🔄 State Management

### **Message Tab State**
```typescript
interface MessageTabState {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  loading: boolean;
  error: string | null;
  messageRequests: MessageRequest[];
  unreadCount: number;
}

const useMessageTab = () => {
  const [state, setState] = useState<MessageTabState>({
    conversations: [],
    selectedConversation: null,
    loading: true,
    error: null,
    messageRequests: [],
    unreadCount: 0
  });
  
  // State management logic
};
```

### **Real-Time Updates**
```typescript
useEffect(() => {
  const socket = io();
  
  socket.emit('join-personal', userId);
  
  socket.on('new-message', (data) => {
    setState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv => 
        conv.id === data.conversationId 
          ? { ...conv, unreadCount: conv.unreadCount + 1 }
          : conv
      )
    }));
  });
  
  return () => socket.disconnect();
}, [userId]);
```

## 🧪 Testing Guidelines

### **Component Testing**
```typescript
describe('MessageTab', () => {
  it('should display empty state when no conversations', () => {
    render(<MessageTab userId="123" universityId="456" />);
    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
  });
  
  it('should display conversation list when conversations exist', () => {
    // Test implementation
  });
});
```

### **Integration Testing**
```typescript
describe('Message System Integration', () => {
  it('should handle real-time message updates', () => {
    // Test Socket.io integration
  });
  
  it('should mark messages as read when conversation is opened', () => {
    // Test API integration
  });
});
```

## 🚀 Performance Optimization

### **Virtual Scrolling**
```typescript
import { FixedSizeList as List } from 'react-window';

const VirtualizedConversationList = ({ conversations }) => (
  <List
    height={600}
    itemCount={conversations.length}
    itemSize={80}
    itemData={conversations}
  >
    {({ index, style, data }) => (
      <ConversationCard
        conversation={data[index]}
        style={style}
      />
    )}
  </List>
);
```

### **Image Optimization**
```typescript
const OptimizedAvatar = ({ src, alt, size = 56 }) => (
  <img
    src={src}
    alt={alt}
    width={size}
    height={size}
    loading="lazy"
    className="avatar-image"
  />
);
```

## 📋 Implementation Checklist

- [ ] **Empty State Component** - No conversations message
- [ ] **Conversation List** - Instagram/Tinder style cards
- [ ] **Conversation Card** - Profile, name, university, last message
- [ ] **Chat Interface** - Full conversation view
- [ ] **Message Bubbles** - Sent/received styling
- [ ] **Real-Time Updates** - Socket.io integration
- [ ] **Responsive Design** - Mobile-first approach
- [ ] **State Management** - React hooks and context
- [ ] **Error Handling** - Loading states and error messages
- [ ] **Performance** - Virtual scrolling and optimization

This UI framework provides everything needed to build a professional, Instagram/Tinder style messaging interface that integrates seamlessly with the completed backend message system. 