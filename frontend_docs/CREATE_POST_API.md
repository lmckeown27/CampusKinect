# 🚀 Create Post API Documentation

## Overview

The Create Post API provides a comprehensive system for users to create posts with an enhanced tag system, draft functionality, and real-time validation. The system supports two main post types: Goods/Services and Events, each with their own tag structure and validation rules.

## 🔐 Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

## 📝 Endpoints

### 1. Get Create Post Template
**GET** `/api/v1/posts/create-template`

Returns the complete template structure for the create post interface, including available post types, tags, and validation rules.

**Response:**
```json
{
  "success": true,
  "data": {
    "postTypes": [
      {
        "id": "goods-services",
        "name": "Goods/Services",
        "description": "Buy, sell, trade, or request goods and services",
        "icon": "🛍️",
        "primaryTags": [...],
        "secondaryTags": [...]
      },
      {
        "id": "events",
        "name": "Events",
        "description": "Create or promote events and activities",
        "icon": "📅",
        "primaryTags": [...],
        "secondaryTags": []
      }
    ],
    "validation": {...},
    "ui": {...}
  }
}
```

### 2. Get Available Tags
**GET** `/api/v1/posts/create-tags?postType=<type>`

Returns available tags for a specific post type (goods-services or events).

**Query Parameters:**
- `postType` (required): Either "goods-services" or "events"

**Response:**
```json
{
  "success": true,
  "data": {
    "postType": "goods-services",
    "availableTags": {
      "primary": [...],
      "secondary": [...]
    },
    "validation": {...}
  }
}
```

### 3. Validate Post Data
**POST** `/api/v1/posts/validate`

Validates post creation data before submission and provides real-time feedback.

**Request Body:**
```json
{
  "content": "Post content here...",
  "postType": "goods-services",
  "primaryTags": ["offer"],
  "secondaryTags": ["books", "tutoring"],
  "images": ["url1", "url2"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "validation": {
      "isValid": true,
      "errors": [],
      "warnings": [],
      "suggestions": [...]
    },
    "postData": {...}
  }
}
```

### 4. Create Post
**POST** `/api/v1/posts/create`

Creates a new post with the enhanced tag system.

**Request Body:**
```json
{
  "content": "Post content here...",
  "postType": "goods-services",
  "primaryTags": ["offer"],
  "secondaryTags": ["books", "tutoring"],
  "images": ["url1", "url2"],
  "eventDetails": {
    "startDate": "2024-01-15T10:00:00Z",
    "endDate": "2024-01-15T12:00:00Z"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "post": {
      "id": 123,
      "title": "goods-services - offer",
      "description": "Post content here...",
      "postType": "offer",
      "tags": ["offer", "books", "tutoring"],
      "images": ["url1", "url2"],
      "metadata": {
        "postType": "goods-services",
        "primaryTags": ["offer"],
        "secondaryTags": ["books", "tutoring"]
      }
    }
  }
}
```

### 5. Save Draft
**POST** `/api/v1/posts/draft`

Saves or updates a draft post for later completion.

**Request Body:**
```json
{
  "content": "Partial content...",
  "postType": "goods-services",
  "primaryTags": ["offer"],
  "secondaryTags": [],
  "images": [],
  "eventDetails": {}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Draft saved successfully",
  "data": {
    "draftId": 456,
    "savedAt": "2024-01-15T10:00:00Z"
  }
}
```

### 6. Get Draft
**GET** `/api/v1/posts/draft`

Retrieves the user's saved draft post.

**Response:**
```json
{
  "success": true,
  "data": {
    "hasDraft": true,
    "draft": {
      "id": 456,
      "content": "Partial content...",
      "postType": "goods-services",
      "primaryTags": ["offer"],
      "secondaryTags": [],
      "images": [],
      "eventDetails": {},
      "createdAt": "2024-01-15T09:00:00Z",
      "updatedAt": "2024-01-15T10:00:00Z"
    }
  }
}
```

### 7. Delete Draft
**DELETE** `/api/v1/posts/draft`

Deletes the user's saved draft post.

**Response:**
```json
{
  "success": true,
  "message": "Draft deleted successfully"
}
```

### 8. Get Post Statistics
**GET** `/api/v1/posts/create-stats`

Returns user's post creation statistics and university-wide analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "user": {...},
      "university": {...},
      "userTags": [...]
    },
    "insights": [...],
    "recommendations": {...}
  }
}
```

### 9. Get Creation Tips
**GET** `/api/v1/posts/create-tips?postType=<type>`

Returns post creation tips and best practices.

**Query Parameters:**
- `postType` (optional): "goods-services" or "events"

**Response:**
```json
{
  "success": true,
  "data": {
    "tips": {
      "general": [...],
      "goods-services": [...],
      "events": [...],
      "personalized": [...],
      "current": [...]
    },
    "summary": {...}
  }
}
```

## 🏷️ Tag System

### Goods/Services Posts

**Primary Tags (Required, Select 1):**
- `offer` - I have something to provide
- `request` - I need something

**Secondary Tags (Optional, Select up to 5):**
- `leasing` - Housing and apartments
- `tutoring` - Academic help and services
- `books` - Textbooks and materials
- `rides` - Transportation and carpooling
- `food` - Food sharing and dining
- `electronics` - Tech devices and accessories
- `clothing` - Apparel and fashion items
- `other` - Miscellaneous services

### Event Posts

**Primary Tags (Required, Select 1):**
- `sport` - Athletic and fitness events
- `rush` - Greek life and recruitment
- `philanthropy` - Charity and community service
- `academic` - Educational and learning events
- `social` - Social and entertainment events
- `cultural` - Diversity and heritage events
- `career` - Professional development and networking

**Secondary Tags:** Not used for event posts

## ✅ Validation Rules

### Content
- **Minimum Length:** 10 characters
- **Maximum Length:** 5000 characters
- **Required:** Yes

### Images
- **Maximum Count:** 10
- **Required:** No (but encouraged)
- **Supported Formats:** jpg, jpeg, png, gif, webp
- **Maximum Size:** 5MB per image

### Tags
- **Primary Tags:** Exactly 1 required
- **Secondary Tags:** 0-5 allowed (goods/services only)
- **Tag Validation:** Must be from approved list for post type

## 🔄 Draft System

- Users can save drafts at any time during post creation
- Only one draft per user per university
- Drafts are automatically updated when saved
- Drafts can be retrieved, updated, or deleted
- Drafts include all post data: content, tags, images, and event details

## 📊 Analytics & Insights

### User Statistics
- Total posts created
- Posts by type (offer, request, event)
- Average views and engagement scores
- Best performing post types

### University Analytics
- Most successful post types
- Popular tags and their performance
- Best posting times for engagement
- Overall post performance trends

### Personalized Recommendations
- Tag usage suggestions
- Content improvement tips
- Posting time recommendations
- Engagement optimization advice

## 🚨 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "details": "Technical error details"
  }
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created (for new posts)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `500` - Internal Server Error

## 🔧 Database Schema

### New Tables

**post_drafts**
```sql
CREATE TABLE post_drafts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  post_type VARCHAR(20),
  primary_tags TEXT[] DEFAULT '{}',
  secondary_tags TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  event_details JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, university_id)
);
```

### Enhanced Tags Table
The existing tags table now supports categories:
- `primary` - Primary post type tags
- `secondary` - Secondary category tags
- `event` - Event category tags

## 🚀 Usage Examples

### Creating a Goods/Services Post
```javascript
// 1. Get template
const template = await fetch('/api/v1/posts/create-template');

// 2. Validate data
const validation = await fetch('/api/v1/posts/validate', {
  method: 'POST',
  body: JSON.stringify({
    content: "Selling Calculus textbook, excellent condition...",
    postType: "goods-services",
    primaryTags: ["offer"],
    secondaryTags: ["books", "tutoring"]
  })
});

// 3. Create post
const post = await fetch('/api/v1/posts/create', {
  method: 'POST',
  body: JSON.stringify({
    content: "Selling Calculus textbook, excellent condition...",
    postType: "goods-services",
    primaryTags: ["offer"],
    secondaryTags: ["books", "tutoring"],
    images: ["image1.jpg", "image2.jpg"]
  })
});
```

### Creating an Event Post
```javascript
// 1. Get available tags
const tags = await fetch('/api/v1/posts/create-tags?postType=events');

// 2. Create event post
const event = await fetch('/api/v1/posts/create', {
  method: 'POST',
  body: JSON.stringify({
    content: "Join us for the annual charity fundraiser...",
    postType: "events",
    primaryTags: ["philanthropy"],
    secondaryTags: [], // Not used for events
    eventDetails: {
      startDate: "2024-02-15T18:00:00Z",
      endDate: "2024-02-15T22:00:00Z"
    }
  })
});
```

## 📱 Frontend Integration

The API is designed to work seamlessly with modern frontend frameworks:

- **Real-time validation** for immediate user feedback
- **Draft system** for saving work in progress
- **Comprehensive templates** for UI construction
- **Analytics integration** for user insights
- **Error handling** for robust user experience

## 🔮 Future Enhancements

- **AI-powered content suggestions**
- **Advanced image processing**
- **Post scheduling**
- **Multi-language support**
- **Advanced analytics dashboard**
- **Post templates library**
- **Collaborative post creation**
- **Integration with external platforms** 