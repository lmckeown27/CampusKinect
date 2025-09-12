# 📱 CampusKinect Mobile Backend API Documentation

## Overview

This document outlines all mobile-specific backend endpoints and services designed to support iOS and Android applications. The mobile backend extends the existing web API with optimized endpoints for mobile devices, push notifications, offline synchronization, and camera integration.

## 🔧 Setup & Configuration

### Environment Variables

Add these variables to your `.env` or `.env.production` file:

```bash
# Apple Push Notification Service (APNs)
APN_KEY_ID=your_apn_key_id
APN_TEAM_ID=your_apn_team_id
APN_PRIVATE_KEY=./certs/AuthKey.p8
APN_BUNDLE_ID=com.campuskinect.app

# Firebase Cloud Messaging (FCM)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"your-project"}

# Mobile Configuration
MOBILE_IMAGE_MAX_SIZE=52428800
MOBILE_IMAGE_COMPRESSION_QUALITY=80
MOBILE_OFFLINE_SYNC_LIMIT=1000
MOBILE_CACHE_TTL=300
CAMERA_UPLOAD_PATH=./uploads/camera
THUMBNAIL_SIZE=300
MAX_IMAGE_DIMENSION=2048
MOBILE_ANALYTICS_ENABLED=true
MOBILE_ANALYTICS_BATCH_SIZE=100
```

### Dependencies Installation

```bash
npm install apn firebase-admin
```

## 📱 Mobile API Endpoints

All mobile endpoints are prefixed with `/api/v1/mobile/`

### Device Registration

#### Register Device for Push Notifications
```http
POST /api/v1/mobile/register-device
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "deviceToken": "device_push_token_here",
  "platform": "ios", // or "android"
  "appVersion": "1.0.0",
  "osVersion": "17.0",
  "deviceModel": "iPhone 15 Pro"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device registered successfully"
}
```

#### Unregister Device
```http
DELETE /api/v1/mobile/unregister-device
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "deviceToken": "device_push_token_here"
}
```

### Camera & Image Upload

#### Upload Camera Images
```http
POST /api/v1/mobile/upload-camera-image
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- images: File[] (up to 10 images)
- location: string (optional)
- suggestedCategory: string (optional)
- description: string (optional)
- compressionLevel: "low" | "medium" | "high" (default: "medium")
```

**Response:**
```json
{
  "success": true,
  "data": {
    "images": [
      {
        "id": "uuid",
        "url": "/uploads/filename.jpeg",
        "thumbnailUrl": "/uploads/thumb-filename.jpeg",
        "originalSize": 2048000,
        "processedSize": 512000,
        "compressionRatio": 75,
        "metadata": {
          "width": 1920,
          "height": 1080,
          "format": "jpeg",
          "location": "Campus Library",
          "suggestedCategory": "goods"
        }
      }
    ],
    "message": "1 image(s) uploaded successfully"
  }
}
```

### Mobile-Optimized Feed

#### Get Mobile Feed
```http
GET /api/v1/mobile/posts/feed?page=1&limit=20&lastPostId=123&includeImages=true&compressionLevel=medium
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 123,
        "content": "Post content",
        "location": "Campus Center",
        "duration_type": "1 week",
        "created_at": "2025-01-01T12:00:00Z",
        "engagement_score": 85.5,
        "poster_id": 456,
        "first_name": "John",
        "last_name": "Doe",
        "username": "johndoe",
        "profile_picture": "/uploads/profile.jpg",
        "university_name": "Cal Poly",
        "tags": ["textbooks", "engineering"],
        "images": [
          {
            "url": "/uploads/image.jpg",
            "thumbnailUrl": "/uploads/thumb-image.jpg",
            "order": 0
          }
        ],
        "like_count": 15,
        "bookmark_count": 5,
        "repost_count": 2,
        "isLiked": false,
        "isBookmarked": false,
        "isReposted": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "hasMore": true,
      "lastPostId": 123
    }
  }
}
```

### Mobile Post Creation

#### Create Post with Mobile Features
```http
POST /api/v1/mobile/posts/create
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

Form Data:
- content: string (1-2000 characters)
- category: string (optional)
- subcategory: string (optional)
- location: string (optional)
- duration: "1 hour" | "1 day" | "1 week" | "1 month" | "permanent"
- tags: string[] (optional)
- cameraMetadata: object (optional)
- images: File[] (up to 10 images)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "postId": 123,
    "images": [
      {
        "url": "/uploads/image.jpg",
        "thumbnailUrl": "/uploads/thumb-image.jpg",
        "order": 0
      }
    ],
    "message": "Post created successfully"
  }
}
```

### Offline Synchronization

#### Get Offline Data
```http
GET /api/v1/mobile/sync/offline-data?lastSync=2025-01-01T12:00:00Z
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "first_name": "John",
      "last_name": "Doe",
      "username": "johndoe",
      "email": "john@calpoly.edu",
      "profile_picture": "/uploads/profile.jpg",
      "university_name": "Cal Poly",
      "university_domain": "calpoly.edu"
    },
    "conversations": [
      {
        "id": 1,
        "updated_at": "2025-01-01T12:00:00Z",
        "first_name": "Jane",
        "last_name": "Smith",
        "username": "janesmith",
        "profile_picture": "/uploads/jane.jpg"
      }
    ],
    "recentMessages": [
      {
        "id": 1,
        "conversation_id": 1,
        "sender_id": 456,
        "content": "Hello!",
        "created_at": "2025-01-01T12:00:00Z",
        "is_read": true
      }
    ],
    "categories": [
      {
        "name": "goods",
        "subcategories": ["Textbooks", "Electronics", "Clothing", "Furniture", "Household Appliances"]
      }
    ],
    "syncTimestamp": "2025-01-01T12:30:00Z"
  }
}
```

#### Upload Offline Actions
```http
POST /api/v1/mobile/sync/upload-offline-actions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "actions": [
    {
      "id": "client_action_1",
      "type": "like_post",
      "postId": 123,
      "timestamp": "2025-01-01T12:00:00Z"
    },
    {
      "id": "client_action_2",
      "type": "send_message",
      "conversationId": 1,
      "content": "Hello from offline!",
      "timestamp": "2025-01-01T12:01:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "actionId": "client_action_1",
        "status": "success"
      },
      {
        "actionId": "client_action_2",
        "status": "success",
        "data": {
          "id": 789,
          "created_at": "2025-01-01T12:01:00Z"
        }
      }
    ],
    "processed": 2,
    "successful": 2
  }
}
```

### App Configuration

#### Get Mobile App Config
```http
GET /api/v1/mobile/app-config
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imageUpload": {
      "maxFileSize": 52428800,
      "maxFiles": 10,
      "supportedFormats": ["jpeg", "jpg", "png", "heic"],
      "compressionLevels": ["low", "medium", "high"],
      "defaultCompression": "medium"
    },
    "posts": {
      "maxContentLength": 2000,
      "maxImages": 10,
      "categories": ["goods", "services", "housing", "events"],
      "durations": ["1 hour", "1 day", "1 week", "1 month", "permanent"]
    },
    "messaging": {
      "maxMessageLength": 1000,
      "offlineMessageLimit": 100,
      "syncInterval": 30000
    },
    "feed": {
      "postsPerPage": 20,
      "maxCachedPages": 5,
      "refreshInterval": 300000
    },
    "notifications": {
      "types": ["message", "like", "comment", "follow", "system"],
      "defaultEnabled": ["message", "system"]
    }
  }
}
```

## 🔔 Push Notification Service

### Notification Types

The system supports various notification types:

- **message**: New direct messages
- **like**: Post likes
- **comment**: Post comments
- **follow**: New followers
- **system**: System announcements

### Sending Notifications (Server-side)

```javascript
const pushService = require('./services/pushNotificationService');

// Send message notification
await pushService.sendMessageNotification(
  recipientId, 
  senderName, 
  messagePreview
);

// Send post like notification
await pushService.sendPostLikeNotification(
  postOwnerId, 
  likerName, 
  postPreview
);

// Send system notification
await pushService.sendSystemNotification(
  userId, 
  'System Update', 
  'New features available!'
);
```

### Notification Preferences

Users can manage notification preferences:

```javascript
// Get preferences
const preferences = await pushService.getNotificationPreferences(userId);

// Update preferences
await pushService.updateNotificationPreferences(userId, {
  messages: true,
  likes: false,
  comments: true,
  follows: true,
  system: true,
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00'
  }
});
```

## 📊 Mobile Analytics Service

### Event Tracking

The analytics service automatically tracks various mobile events:

```javascript
const analyticsService = require('./services/mobileAnalyticsService');

// Track app launch
await analyticsService.trackAppLaunch(userId, platform, appVersion, deviceInfo);

// Track post creation
await analyticsService.trackPostCreate(userId, postId, category, hasImages, platform, appVersion);

// Track errors
await analyticsService.trackError(userId, errorType, errorMessage, stackTrace, platform, appVersion);
```

### Available Analytics

- **App Usage**: Launch, background, session duration
- **User Engagement**: Screen views, interactions, time spent
- **Content**: Post creation, views, interactions
- **Performance**: Load times, API response times
- **Errors**: Crashes, API errors, user-reported issues
- **Camera Usage**: Photo capture, upload statistics

## 🗄️ Database Schema

### New Mobile Tables

#### mobile_devices
```sql
CREATE TABLE mobile_devices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android')),
  app_version VARCHAR(20),
  os_version VARCHAR(20),
  device_model VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, device_token)
);
```

#### notification_logs
```sql
CREATE TABLE notification_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  results JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### mobile_analytics
```sql
CREATE TABLE mobile_analytics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  platform VARCHAR(10) NOT NULL,
  app_version VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### camera_uploads
```sql
CREATE TABLE camera_uploads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  camera_metadata JSONB DEFAULT '{}',
  location_data JSONB DEFAULT '{}',
  processing_data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 Security Considerations

### Authentication
- All mobile endpoints require JWT authentication
- Device tokens are encrypted and stored securely
- Push notification certificates should be kept secure

### Data Privacy
- User analytics are anonymized where possible
- Sensitive data is not logged in analytics
- Camera metadata respects user privacy settings

### Rate Limiting
- Mobile endpoints have appropriate rate limits
- Bulk operations are batched to prevent abuse
- Image uploads have size and count restrictions

## 🚀 Deployment

### Production Setup

1. **Install Dependencies**:
   ```bash
   npm install apn firebase-admin
   ```

2. **Configure Environment Variables**:
   - Set up APNs certificates and keys
   - Configure Firebase service account
   - Set mobile-specific limits and paths

3. **Database Migration**:
   ```bash
   node -e "require('./src/config/database').initializeDatabase()"
   ```

4. **Start Services**:
   ```bash
   pm2 start ecosystem.config.js --env production
   ```

### iOS App Integration

```swift
// Register for push notifications
UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
    if granted {
        DispatchQueue.main.async {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }
}

// Send device token to backend
func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
    let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
    
    // Send to your backend
    APIService.registerDevice(token: tokenString, platform: "ios")
}
```

### Camera Integration

```swift
// Camera capture with metadata
func captureImage() {
    let picker = UIImagePickerController()
    picker.sourceType = .camera
    picker.delegate = self
    present(picker, animated: true)
}

func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
    if let image = info[.originalImage] as? UIImage {
        // Compress and upload
        APIService.uploadCameraImage(image: image, compressionLevel: .medium)
    }
}
```

## 📈 Performance Optimization

### Image Processing
- Automatic compression based on device capabilities
- Progressive JPEG for faster loading
- Thumbnail generation for quick previews
- Batch processing for multiple images

### Caching Strategy
- Redis caching for frequently accessed data
- Client-side caching for offline support
- Image caching with expiration policies

### Network Optimization
- Pagination for large data sets
- Compression for API responses
- Retry logic for failed requests
- Background sync for offline actions

## 🐛 Error Handling

### Common Error Codes

- **400**: Invalid request data
- **401**: Authentication required
- **403**: Insufficient permissions
- **413**: File too large
- **429**: Rate limit exceeded
- **500**: Server error

### Error Response Format

```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "details": {
      "field": "specific field error"
    }
  }
}
```

This mobile backend provides a comprehensive foundation for building iOS and Android applications with full feature parity to the web platform, plus mobile-specific enhancements for camera integration, push notifications, and offline functionality. 