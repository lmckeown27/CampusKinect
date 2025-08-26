# Review System for Recurring Posts

## Overview

The Review System is a comprehensive feature designed specifically for recurring posts on CampusConnect. It allows customers, attendees, and users to leave reviews for services like tutoring, coaching, training sessions, and other repeatable offerings. This system adds a trust layer and helps users make informed decisions about service quality.

## Key Features

### 🎯 **Recurring Post Focus**
- **Eligibility**: Only posts with `duration_type = 'recurring'` can receive reviews
- **Purpose**: Designed for services that predict repeat customers
- **Examples**: Tutoring, coaching, training, workshops, recurring events

### ⭐ **5-Star Rating System**
- **Scale**: 1-5 stars with decimal precision
- **Validation**: Ensures ratings are within valid range
- **Anonymous Option**: Users can choose to remain anonymous

### 🔒 **Trust & Verification**
- **Verified Customer Status**: Post owners can mark reviews as verified
- **Conversation History**: System checks if reviewer had prior interaction
- **Anti-Abuse**: Prevents self-reviews and duplicate reviews
- **Deletion Tracking**: Post owners must provide reasons when deleting reviews
- **Accountability System**: Transparent tracking of all deleted reviews

### 💬 **Two-Way Communication**
- **Review Responses**: Post owners can respond to reviews
- **Professional Engagement**: Builds trust through active communication
- **Conflict Resolution**: Provides platform for addressing concerns
- **Deletion Transparency**: Users can see why reviews were deleted

## Database Schema

### Reviews Table
```sql
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(200),
  content TEXT NOT NULL,
  is_verified_customer BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, reviewer_id)
);
```

### Review Responses Table
```sql
CREATE TABLE review_responses (
  id SERIAL PRIMARY KEY,
  review_id INTEGER REFERENCES reviews(id) ON DELETE CASCADE,
  responder_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Deleted Reviews Table
```sql
CREATE TABLE deleted_reviews (
  id SERIAL PRIMARY KEY,
  original_review_id INTEGER, -- Keep reference to original review ID
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL,
  title VARCHAR(200),
  content TEXT NOT NULL,
  is_verified_customer BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Post owner who deleted it
  deletion_reason TEXT NOT NULL, -- Required reason for deletion
  deletion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  original_created_at TIMESTAMP, -- When the review was originally created
  original_updated_at TIMESTAMP -- When the review was last updated
);
```

### Enhanced Posts Table
```sql
-- Review-related fields added to posts table
ALTER TABLE posts ADD COLUMN review_count INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN average_rating DECIMAL(3, 2) DEFAULT 0.00;
ALTER TABLE posts ADD COLUMN review_score_bonus DECIMAL(10, 2) DEFAULT 0.00;
```

### Post Response Format
When fetching posts, review information is included:
```json
{
  "reviews": {
    "count": 15,
    "averageRating": 4.2,
    "scoreBonus": 7.5,
    "deletedCount": 2
  }
}
```

### Deleted Reviews Tab
Each post includes a count of deleted reviews, which users can explore to see:
- **Deleted Review Content**: Original review text and rating
- **Deletion Reason**: Why the post owner removed the review
- **Timeline**: When the review was created and deleted
- **Accountability**: Who deleted the review and when

## API Endpoints

### 📝 **Review Management**

#### Create Review
```http
POST /api/v1/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "postId": 123,
  "rating": 5,
  "title": "Excellent tutoring session!",
  "content": "The tutor was very knowledgeable and patient...",
  "isAnonymous": false
}
```

#### Get Post Reviews
```http
GET /api/v1/reviews/post/123?page=1&limit=10&sortBy=rating&sortOrder=desc
Authorization: Bearer <token>
```

#### Get Review Summary
```http
GET /api/v1/reviews/post/123/summary
Authorization: Bearer <token>
```

#### Update Review
```http
PUT /api/v1/reviews/456
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "content": "Updated review content..."
}
```

#### Delete Review
```http
DELETE /api/v1/reviews/456
Authorization: Bearer <token>
```

#### Delete Review by Post Owner (with reason tracking)
```http
DELETE /api/v1/reviews/456/owner-delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "deletionReason": "This review contains false information about our service quality and pricing. We have documentation proving the claims are incorrect."
}
```

#### Get Deleted Reviews for a Post
```http
GET /api/v1/reviews/post/123/deleted?page=1&limit=10
Authorization: Bearer <token>
```

#### Get Deleted Reviews Summary
```http
GET /api/v1/reviews/post/123/deleted-summary
Authorization: Bearer <token>
```

### 💬 **Review Responses**

#### Add Response
```http
POST /api/v1/reviews/456/response
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Thank you for your feedback! We're glad you had a great experience."
}
```

#### Update Response
```http
PUT /api/v1/reviews/response/789
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Updated response content..."
}
```

### ✅ **Verification & Management**

#### Mark as Verified Customer
```http
POST /api/v1/reviews/456/verify
Authorization: Bearer <token>
```

#### Get User's Reviews
```http
GET /api/v1/reviews/my-reviews?page=1&limit=10
Authorization: Bearer <token>
```

## Scoring Integration

### 🎯 **Review Score Bonus**
- **Calculation**: `review_count * 0.5` (0.5 points per review)
- **Maximum**: Capped at 5.0 points for scoring fairness
- **Eligibility**: Only applies to recurring posts
- **Formula**: `finalScore = baseScore + engagementImpact + reviewScoreBonus`

### 📊 **Impact on Feed Positioning**
- **Higher Visibility**: Well-reviewed recurring posts get better positioning
- **Trust Signals**: Review count and ratings influence user decisions
- **Quality Indicators**: Average rating helps identify top-tier services

## Business Logic

### 🚫 **Prevention Mechanisms**
1. **Self-Review Prevention**: Users cannot review their own posts
2. **Duplicate Prevention**: One review per user per post
3. **Eligibility Check**: Only recurring posts can receive reviews
4. **Ownership Verification**: Post owners can only respond to their own posts

### ✅ **Verification Process**
1. **Conversation Check**: System verifies if reviewer had prior interaction
2. **Owner Verification**: Post owners can mark reviews as verified
3. **Trust Building**: Verified reviews carry more weight

### 🔄 **Review Lifecycle**
1. **Creation**: User creates review for eligible recurring post
2. **Moderation**: System validates review data and permissions
3. **Publication**: Review becomes visible to all users
4. **Response**: Post owner can respond (optional)
5. **Verification**: Owner can mark as verified customer
6. **Updates**: Reviewers can edit their reviews
7. **Deletion**: Reviewers can remove their reviews

### 🛡️ **Accountability System**
1. **Owner Deletion Tracking**: Post owners must provide reasons when deleting reviews
2. **Transparency**: All deleted reviews are preserved with deletion reasons
3. **Audit Trail**: Complete history of review deletions for accountability
4. **Reason Validation**: Deletion reasons must be substantial (10-500 characters)
5. **Public Visibility**: Users can see deleted reviews and why they were removed

### 📊 **Deletion Tracking Features**
- **Reason Requirement**: Post owners must explain why a review was deleted
- **Historical Preservation**: Original review content is preserved
- **Timeline Tracking**: When reviews were created, updated, and deleted
- **Owner Attribution**: Clear identification of who deleted each review
- **Statistical Analysis**: Summary of deleted reviews with rating distributions

## Benefits of the Accountability System

### 🎯 **For Post Owners**
- **Justified Actions**: Must provide legitimate reasons for review deletions
- **Professional Image**: Shows responsible management of feedback
- **Conflict Resolution**: Addresses concerns transparently
- **Quality Control**: Removes inappropriate or false reviews with explanation

### 👥 **For Reviewers**
- **Transparency**: Can see why their reviews were removed
- **Fair Treatment**: Understand the reasoning behind deletions
- **Appeal Process**: Can address concerns raised in deletion reasons
- **Accountability**: Post owners must justify their actions

### 🏛️ **For the Platform**
- **Trust Building**: Transparent system builds user confidence
- **Abuse Prevention**: Prevents arbitrary deletion of negative reviews
- **Data Integrity**: Maintains complete review history
- **Community Standards**: Establishes expectations for responsible behavior

### 🔍 **For Users**
- **Informed Decisions**: Can see both active and deleted reviews
- **Pattern Recognition**: Identify posts with frequent review deletions
- **Quality Assessment**: Better understanding of service reliability
- **Transparency**: Complete picture of review history

## Implementation Details

### 🗄️ **Data Preservation Strategy**
- **Soft Deletion**: Reviews are moved to deleted_reviews table
- **Complete History**: All original data is preserved
- **Audit Trail**: Full timeline of review lifecycle
- **Performance**: Efficient queries with proper indexing

### 🔐 **Access Control**
- **Public Visibility**: Deleted reviews are visible to all users
- **Owner Attribution**: Clear identification of who deleted reviews
- **Reason Validation**: Substantial explanations required
- **Rate Limiting**: Prevents abuse of deletion system

## Use Cases

### 🎓 **Academic Services**
- **Tutoring**: Math, science, language tutoring reviews
- **Study Groups**: Effectiveness of study sessions
- **Academic Coaching**: College application guidance

### 🏠 **Housing & Services**
- **Roommate Matching**: Compatibility and reliability
- **Housing Services**: Maintenance and management quality
- **Cleaning Services**: Regular cleaning service quality

### 🎯 **Professional Development**
- **Career Coaching**: Job search and interview preparation
- **Skill Training**: Workshops and certification programs
- **Mentorship**: Professional guidance and networking

### 🎉 **Events & Activities**
- **Recurring Events**: Weekly meetups and activities
- **Sports Training**: Regular fitness and sports coaching
- **Creative Workshops**: Art, music, and craft classes

## Data Flow

### 📊 **Review Creation Flow**
```
User → Create Review → Validation → Database → Update Post Stats → Clear Cache → Return Success
```

### 🔄 **Review Update Flow**
```
User → Update Review → Ownership Check → Database Update → Update Post Stats → Clear Cache → Return Success
```

### 📈 **Statistics Update Flow**
```
Review Change → Calculate New Stats → Update Post Table → Trigger Score Recalculation → Update Feed Position
```

## Performance Considerations

### 🚀 **Optimization Strategies**
- **Indexing**: Comprehensive database indexes for fast queries
- **Caching**: Redis cache for frequently accessed review data
- **Pagination**: Efficient pagination for large review lists
- **Batch Updates**: Optimized database operations

### 📊 **Scalability Features**
- **Efficient Queries**: Optimized SQL with proper JOINs
- **Connection Pooling**: Database connection management
- **Rate Limiting**: API endpoint protection
- **Error Handling**: Comprehensive error management

## Security Features

### 🔐 **Authentication & Authorization**
- **JWT Tokens**: Secure user authentication
- **Ownership Verification**: Users can only modify their own reviews
- **Post Owner Rights**: Special permissions for post owners
- **Rate Limiting**: Protection against abuse

### 🛡️ **Data Validation**
- **Input Sanitization**: XSS and injection prevention
- **Content Length Limits**: Reasonable content boundaries
- **Rating Validation**: Ensures valid rating ranges
- **SQL Injection Protection**: Parameterized queries

## Future Enhancements

### 🔮 **Planned Features**
- **Review Moderation**: Admin review approval system
- **Review Analytics**: Detailed insights and trends
- **Review Templates**: Structured review formats
- **Review Incentives**: Gamification and rewards
- **Review Export**: Data export capabilities

### 🌐 **Integration Opportunities**
- **Notification System**: Real-time review alerts
- **Analytics Dashboard**: Review performance metrics
- **Mobile App**: Native review functionality
- **Social Sharing**: Review sharing capabilities

## Testing & Quality Assurance

### 🧪 **Test Coverage**
- **Unit Tests**: Individual function testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Schema and query validation
- **Security Tests**: Authentication and authorization

### 📋 **Quality Metrics**
- **Response Time**: API performance benchmarks
- **Error Rates**: System reliability metrics
- **User Satisfaction**: Review system effectiveness
- **Data Integrity**: Database consistency checks

## Conclusion

The Review System for recurring posts transforms CampusConnect from a simple marketplace into a trusted platform where quality services can be identified and verified. By providing authentic feedback from real customers, the system creates transparency and builds trust between service providers and potential customers.

This system is particularly valuable for:
- **Students**: Making informed decisions about academic services
- **Service Providers**: Building reputation and credibility
- **Platform**: Increasing user engagement and retention
- **Community**: Fostering quality standards and accountability

The review system is designed to be fair, secure, and scalable, ensuring that it can grow with the platform while maintaining the integrity and trust that users expect. 