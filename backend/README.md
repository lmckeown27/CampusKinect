# CampusConnect Backend API

A robust, scalable backend API for the University Bulletin Board application built with Node.js, Express, PostgreSQL, and Redis.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens and .edu email verification
- **Real-time Communication**: WebSocket support for live chat and notifications
- **Advanced Search**: Full-text search with filtering and geographic clustering
- **Image Management**: Image upload, processing, and optimization
- **Caching**: Redis-based caching for improved performance
- **Security**: Rate limiting, input validation, and security headers
- **Database**: PostgreSQL with optimized queries and indexing

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Express)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Routes    │ │ Middleware  │ │ Validation  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   Auth      │ │   Email     │ │   Image     │          │
│  │  Service    │ │  Service    │ │  Service    │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ PostgreSQL  │ │    Redis    │ │ File Storage│          │
│  │  Database   │ │    Cache    │ │   (Images)  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Redis 6+
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb campus_connect
   
   # Run database migrations
   npm run migrate
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## ⚙️ Configuration

### Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/campus_connect
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-here
JWT_REFRESH_EXPIRES_IN=30d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
```

## 🗄️ Database Schema

### Core Tables

- **users**: User accounts and profiles
- **universities**: University information and clustering
- **posts**: Bulletin board posts (offers, requests, events)
- **tags**: Post categorization and filtering
- **conversations**: Chat conversations between users
- **messages**: Individual chat messages
- **post_images**: Image attachments for posts

### Key Relationships

- Users belong to universities
- Universities can be grouped into geographic clusters
- Posts are created by users and tagged with categories
- Conversations link users and optionally posts
- Messages belong to conversations

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/verify-email` - Email verification
- `POST /api/v1/auth/logout` - User logout

### Posts
- `GET /api/v1/posts` - Get posts with filtering
- `GET /api/v1/posts/:id` - Get single post
- `POST /api/v1/posts` - Create new post
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Mark post as fulfilled

### Users
- `GET /api/v1/users/profile` - Get current user profile
- `PUT /api/v1/users/profile` - Update profile
- `GET /api/v1/users/:id` - Get public user profile
- `GET /api/v1/users/:id/posts` - Get user's posts

### Messages
- `GET /api/v1/messages/conversations` - Get user conversations
- `GET /api/v1/messages/conversations/:id` - Get conversation messages
- `POST /api/v1/messages/conversations` - Start new conversation
- `POST /api/v1/messages/conversations/:id/messages` - Send message

### Search
- `GET /api/v1/search/posts` - Search posts
- `GET /api/v1/search/users` - Search users
- `GET /api/v1/search/tags` - Search tags
- `GET /api/v1/search/universities` - Search universities

### Upload
- `POST /api/v1/upload/image` - Upload single image
- `POST /api/v1/upload/images` - Upload multiple images
- `POST /api/v1/upload/post-images/:postId` - Upload post images

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive request validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Configurable cross-origin requests
- **Security Headers**: Helmet.js security middleware

## 📊 Performance Features

- **Redis Caching**: Intelligent caching for frequently accessed data
- **Database Indexing**: Optimized database queries with proper indexes
- **Image Optimization**: Automatic image resizing and compression
- **Pagination**: Efficient data pagination for large datasets
- **Connection Pooling**: Database connection management

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test files
npm test -- --testPathPattern=auth
```

## 📝 API Documentation

### Request/Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Handling

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "details": [
      {
        "field": "fieldName",
        "message": "Validation error",
        "value": "invalidValue"
      }
    ]
  }
}
```

### Authentication

Protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set all production environment variables
2. **Database**: Use production PostgreSQL instance
3. **Redis**: Configure production Redis cluster
4. **File Storage**: Use cloud storage (AWS S3, Google Cloud Storage)
5. **SSL**: Enable HTTPS with valid SSL certificates
6. **Monitoring**: Implement logging and monitoring
7. **Backup**: Regular database backups

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Development

### Code Style

- ESLint configuration for code quality
- Prettier for code formatting
- Consistent error handling patterns
- Comprehensive input validation

### Database Migrations

```bash
# Create new migration
npm run migrate:create -- --name migration_name

# Run migrations
npm run migrate

# Rollback migrations
npm run migrate:rollback
```

### Logging

- Structured logging with timestamps
- Error tracking and debugging information
- Request/response logging for development

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the error logs

## 🔮 Future Enhancements

- **Push Notifications**: APNs and FCM integration
- **Analytics**: User behavior and post analytics
- **Moderation**: Content moderation and reporting
- **API Versioning**: Backward compatibility management
- **Microservices**: Service decomposition for scalability
- **GraphQL**: Alternative to REST API
- **Webhooks**: External service integrations 