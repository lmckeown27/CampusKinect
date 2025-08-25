# 💬 Message System API Documentation

## 📋 Overview

The CampusConnect Message System provides a complete messaging solution for direct communication between users. It includes conversation management, real-time messaging, message requests, and comprehensive user experience features.

## 🔐 Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📱 API Endpoints

### 1. Get User Conversations
**`GET /api/v1/messages/conversations`**

Retrieves all conversations for the authenticated user with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page, 1-100 (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": 123,
        "postId": 456,
        "postTitle": "Looking for study partner",
        "postType": "request",
        "otherUser": {
          "id": 789,
          "username": "sarah_j",
          "firstName": "Sarah",
          "lastName": "Johnson",
          "displayName": "Sarah Johnson",
          "profilePicture": "https://example.com/profile.jpg",
          "university": "UCLA"
        },
        "lastMessage": "Thanks for the help!",
        "lastMessageTime": "2024-01-15T10:30:00Z",
        "unreadCount": 2,
        "createdAt": "2024-01-10T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "pages": 1
    }
  }
}
```

### 2. Get Conversation Messages
**`GET /api/v1/messages/conversations/:id`**

Retrieves all messages in a specific conversation with pagination.

**Path Parameters:**
- `id`: Conversation ID

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page, 1-100 (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": 1,
        "content": "Hi! I'm interested in your study group",
        "messageType": "text",
        "mediaUrl": null,
        "isRead": true,
        "createdAt": "2024-01-10T09:00:00Z",
        "sender": {
          "id": 789,
          "username": "sarah_j",
          "firstName": "Sarah",
          "lastName": "Johnson",
          "displayName": "Sarah Johnson",
          "profilePicture": "https://example.com/profile.jpg"
        },
        "isOwn": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 15,
      "pages": 1
    }
  }
}
```

### 3. Start New Conversation
**`POST /api/v1/messages/conversations`**

Creates a new conversation between two users.

**Request Body:**
```json
{
  "otherUserId": 789,
  "postId": 456
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation started successfully",
  "data": {
    "conversation": {
      "id": 123,
      "createdAt": "2024-01-15T11:00:00Z",
      "otherUser": {
        "id": 789,
        "username": "sarah_j",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "displayName": "Sarah Johnson",
        "profilePicture": "https://example.com/profile.jpg"
      }
    }
  }
}
```

### 4. Send Message
**`POST /api/v1/messages/conversations/:id/messages`**

Sends a new message in an existing conversation.

**Path Parameters:**
- `id`: Conversation ID

**Request Body:**
```json
{
  "content": "Hello! How are you doing?",
  "messageType": "text",
  "mediaUrl": null
}
```

**Message Types:**
- `text`: Plain text message
- `image`: Image message (with mediaUrl)
- `contact`: Contact sharing
- `location`: Location sharing
- `file`: File sharing

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "message": {
      "id": 15,
      "content": "Hello! How are you doing?",
      "messageType": "text",
      "mediaUrl": null,
      "isRead": false,
      "createdAt": "2024-01-15T11:05:00Z",
      "sender": {
        "id": 123,
        "username": "john_d",
        "firstName": "John",
        "lastName": "Doe",
        "displayName": "John Doe",
        "profilePicture": "https://example.com/john.jpg"
      },
      "isOwn": true
    }
  }
}
```

### 5. Mark Conversation as Read
**`PUT /api/v1/messages/conversations/:id/read`**

Marks all unread messages in a conversation as read.

**Path Parameters:**
- `id`: Conversation ID

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "updatedCount": 3
  }
}
```

### 6. Delete Conversation
**`DELETE /api/v1/messages/conversations/:id`**

Deletes a conversation and all associated messages.

**Path Parameters:**
- `id`: Conversation ID

**Response:**
```json
{
  "success": true,
  "message": "Conversation deleted successfully"
}
```

### 7. Get Message Requests
**`GET /api/v1/messages/requests`**

Retrieves pending message requests from other users.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page, 1-100 (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 1,
        "message": "Hi! I saw your post about tutoring. Are you still available?",
        "status": "pending",
        "createdAt": "2024-01-15T10:00:00Z",
        "post": {
          "id": 456,
          "title": "Math Tutoring Available",
          "postType": "offer"
        },
        "fromUser": {
          "username": "alex_m",
          "firstName": "Alex",
          "lastName": "Miller",
          "displayName": "Alex Miller",
          "profilePicture": "https://example.com/alex.jpg",
          "university": "Stanford"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "pages": 1
    }
  }
}
```

### 8. Respond to Message Request
**`PUT /api/v1/messages/requests/:id/respond`**

Accepts, rejects, or ignores a message request.

**Path Parameters:**
- `id`: Request ID

**Request Body:**
```json
{
  "action": "accept",
  "message": "Yes, I'm still available! Let's set up a time."
}
```

**Actions:**
- `accept`: Accepts the request and starts a conversation
- `reject`: Rejects the request
- `ignore`: Ignores the request

**Response:**
```json
{
  "success": true,
  "message": "Message request accepted successfully"
}
```

### 9. Get Message Statistics
**`GET /api/v1/messages/stats`**

Retrieves messaging statistics for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalConversations": 8,
    "totalMessagesSent": 45,
    "totalUnread": 3,
    "pendingRequests": 2
  }
}
```

## 🔄 Real-Time Updates

The system uses Socket.io for real-time message delivery. When a new message is sent:

1. **Message is saved** to the database
2. **Real-time event** is emitted to the recipient
3. **Cache is updated** for both users
4. **Push notification** can be sent (if configured)

### Socket Events

**Join Personal Room:**
```javascript
socket.emit('join-personal', userId);
```

**Receive New Message:**
```javascript
socket.on('new-message', (data) => {
  console.log('New message:', data.message);
  // Update UI with new message
});
```

## 💾 Caching Strategy

The message system implements intelligent caching:

- **Conversation lists** are cached with medium TTL
- **Cache invalidation** occurs on message send/delete
- **User-specific caching** prevents data leakage
- **Redis integration** for high-performance caching

## 🛡️ Security Features

- **User verification required** for all endpoints
- **Conversation access control** - users can only access their conversations
- **Input validation** with express-validator
- **Rate limiting** to prevent abuse
- **SQL injection protection** via parameterized queries

## 📊 Database Schema

### Conversations Table
```sql
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_message_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user1_id, user2_id, post_id),
  CHECK (user1_id != user2_id)
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  media_url VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Message Requests Table
```sql
CREATE TABLE message_requests (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  to_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(from_user_id, to_user_id, post_id),
  CHECK (from_user_id != to_user_id)
);
```

## 🚀 Performance Features

- **Database indexing** on frequently queried fields
- **Pagination** for large datasets
- **Efficient queries** with JOINs and subqueries
- **Redis caching** for frequently accessed data
- **Connection pooling** for database efficiency

## 🔧 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Descriptive error message"
  }
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `403`: Forbidden (access denied)
- `404`: Not Found
- `500`: Internal Server Error

## 📱 Frontend Integration

### Empty State (No Conversations)
```javascript
// Show when conversations array is empty
<div className="empty-state">
  <h3>No conversations yet</h3>
  <p>When you start engaging with other users, your conversations will appear here.</p>
</div>
```

### Conversation List (Instagram/Tinder Style)
```javascript
// Map conversations to UI components
{conversations.map(conv => (
  <div key={conv.id} className="conversation-card">
    <img src={conv.otherUser.profilePicture} alt="Profile" />
    <div className="conversation-info">
      <h4>{conv.otherUser.displayName}</h4>
      <p>{conv.otherUser.university}</p>
      <p className="last-message">{conv.lastMessage}</p>
      <span className="timestamp">{formatTime(conv.lastMessageTime)}</span>
    </div>
    {conv.unreadCount > 0 && (
      <span className="unread-badge">{conv.unreadCount}</span>
    )}
  </div>
))}
```

## 🧪 Testing

Test the API endpoints using tools like Postman or curl:

```bash
# Get conversations
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/v1/messages/conversations"

# Send message
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello!","messageType":"text"}' \
  "http://localhost:5000/api/v1/messages/conversations/123/messages"
```

## 📈 Monitoring & Analytics

The system tracks:
- **Message volume** per user and university
- **Response rates** and engagement metrics
- **System performance** and error rates
- **User behavior** patterns

## 🔮 Future Enhancements

- **Message encryption** for enhanced privacy
- **File upload** support for documents
- **Message search** functionality
- **Message reactions** and emojis
- **Group messaging** (if needed)
- **Message scheduling** for future delivery

This comprehensive message system provides a robust foundation for user communication while maintaining security, performance, and scalability. 