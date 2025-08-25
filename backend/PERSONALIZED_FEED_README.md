# 🎯 Personalized Feed System

## Overview

The Personalized Feed System transforms CampusConnect from a generic social media platform into a **content discovery marketplace** that adapts to each user's preferences and interaction history. This system ensures users see fresh, relevant content while avoiding repetitive posts they've already bookmarked.

## 🚀 Core Features

### **1. Bookmark Exclusion**
- **Complete Removal**: Once a user bookmarks a post, it's **permanently excluded** from their feed
- **No Repetition**: Users never see bookmarked content again in any feed type
- **Clean Experience**: Eliminates content clutter and repetitive posts

### **2. Fresh Content Prioritization**
- **30% Score Boost**: Posts user hasn't interacted with get significant priority
- **20% New Post Boost**: Posts created within 24 hours get additional boost
- **Discovery Focus**: Encourages exploration of new, relevant content

### **3. Smart Personalization**
- **Interaction History Tracking**: Monitors user engagement patterns
- **Recency Bonuses**: Recent interactions get small score bonuses
- **Quality + Freshness Balance**: Combines content quality with discovery

### **4. Advanced Filtering**
- **Tab-Specific**: Works with all 4 main tabs (Goods/Services, Events, Combined, Organized)
- **Sub-Tab Support**: Respects category-specific filters
- **Offer/Request Filtering**: Maintains existing marketplace functionality

## 🏗️ Architecture

### **Database Schema**

#### **`post_interactions` Table**
```sql
CREATE TABLE IF NOT EXISTS post_interactions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  interaction_type VARCHAR(20) NOT NULL CHECK (interaction_type IN ('message', 'share', 'bookmark', 'repost')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id, interaction_type)
);
```

#### **Indexes**
- `idx_post_interactions_post_id` - Fast post lookups
- `idx_post_interactions_user_id` - Fast user interaction queries
- `idx_post_interactions_type` - Fast interaction type filtering
- `idx_post_interactions_created_at` - Fast recency queries

### **Service Layer**

#### **`PersonalizedFeedService`**
- **Core Logic**: Handles all personalization algorithms
- **Query Building**: Constructs optimized database queries
- **Score Calculation**: Applies personalization bonuses
- **Filtering**: Implements bookmark exclusion and content filtering

#### **Key Methods**
- `getPersonalizedFeed()` - Main feed retrieval with personalization
- `getUserBookmarkedPosts()` - Retrieves user's bookmarked posts
- `getUserInteractionHistory()` - Gets user's interaction patterns
- `applyPersonalizedScoring()` - Applies personalization algorithms

## 📊 Personalization Algorithm

### **Score Calculation Formula**
```
Personalized Score = Base Score × Fresh Content Boost × New Post Boost + Interaction Recency Bonus
```

#### **Fresh Content Boost**
- **30% increase** for posts user hasn't interacted with
- **0% increase** for posts user has seen/interacted with

#### **New Post Boost**
- **20% increase** for posts created within 24 hours
- **0% increase** for older posts

#### **Interaction Recency Bonus**
- **10% bonus** for interactions within 1 day
- **5% bonus** for interactions within 7 days
- **2% bonus** for interactions within 30 days
- **0% bonus** for older interactions

### **Feed Ranking Priority**
1. **Fresh Content** (posts user hasn't seen)
2. **New Posts** (created within 24 hours)
3. **Final Score** (quality-based ranking)
4. **Creation Date** (recency fallback)

## 🔌 API Integration

### **Endpoint**
```
GET /api/v1/posts/personalized-feed
```

### **Query Parameters**
- `limit` (1-100): Number of posts to return
- `offset` (0+): Pagination offset
- `mainTab`: Main tab filter ('goods-services', 'events', 'combined')
- `subTab`: Sub-tab filter (category-specific)
- `offers`: Boolean filter for offer posts
- `requests`: Boolean filter for request posts

### **Authentication Required**
- **User ID**: Must be authenticated to access personalized feed
- **Fallback**: Unauthenticated users get regular feeds
- **Security**: User can only access their own personalization data

### **Response Format**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "Post Title",
        "personalization": {
          "isBookmarked": false,
          "hasInteracted": false,
          "freshContentBoost": true,
          "interactionRecencyBonus": 0.1,
          "personalizedScore": 42.5
        }
      }
    ],
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 150,
      "hasMore": true
    },
    "personalization": {
      "bookmarkedPostsExcluded": 5,
      "freshContentBoosted": 15,
      "userInteractionCount": 25
    }
  }
}
```

## 🎯 Use Cases

### **Student Users**
- **Fresh Discovery**: Always see new, relevant content
- **No Repetition**: Bookmarked posts stay bookmarked
- **Personalized Experience**: Feed adapts to individual preferences

### **Content Creators**
- **Fair Visibility**: Quality content still gets discovered
- **Reduced Spam**: Users can't bookmark to avoid content
- **Engagement Focus**: Encourages meaningful interactions

### **Platform Benefits**
- **Better Retention**: Users see fresh content consistently
- **Reduced Bounce**: Less repetitive, more engaging experience
- **Scalable Architecture**: Efficient database queries and caching

## 🔄 Data Flow

### **1. User Request**
```
User → API → PersonalizedFeedService → Database
```

### **2. Data Retrieval**
```
1. Get user's bookmarked posts
2. Get user's interaction history
3. Query available posts (excluding bookmarked)
4. Apply personalization algorithms
5. Sort by personalized score
6. Return formatted results
```

### **3. Caching Strategy**
- **User Interactions**: Cache for 5 minutes
- **Bookmarked Posts**: Cache for 10 minutes
- **Feed Results**: Cache for 2 minutes
- **Invalidation**: On new interactions/bookmarks

## 🚀 Performance Optimizations

### **Database Queries**
- **Single Query**: Combines post data with interaction status
- **Efficient Joins**: Uses LEFT JOINs for optional data
- **Indexed Fields**: All frequently queried fields are indexed
- **Parameterized Queries**: Prevents SQL injection and optimizes execution

### **Caching Strategy**
- **Redis Integration**: Fast access to user interaction data
- **Smart Invalidation**: Updates cache only when necessary
- **Batch Operations**: Reduces database round trips

### **Pagination**
- **Efficient Counting**: Separate count queries for pagination
- **Cursor-Based**: Optional cursor-based pagination for large datasets
- **Limit Enforcement**: Prevents excessive data retrieval

## 🧪 Testing & Validation

### **Unit Tests**
- **Bookmark Exclusion**: Verifies bookmarked posts are filtered out
- **Fresh Content Boost**: Tests score calculation algorithms
- **Interaction Recency**: Validates bonus calculation logic
- **Complete Flow**: End-to-end personalization testing

### **Integration Tests**
- **API Endpoints**: Tests complete request/response cycle
- **Database Integration**: Verifies query performance and accuracy
- **Authentication**: Ensures proper user isolation

### **Performance Tests**
- **Query Performance**: Measures database query execution time
- **Memory Usage**: Monitors service memory consumption
- **Response Time**: Tracks API endpoint response times

## 🔮 Future Enhancements

### **Machine Learning Integration**
- **Content Recommendations**: AI-powered content suggestions
- **User Behavior Analysis**: Predictive personalization
- **A/B Testing**: Optimize personalization algorithms

### **Advanced Filtering**
- **Content Preferences**: Learn user content type preferences
- **Time-Based**: Adapt to user activity patterns
- **Location-Based**: Consider geographic preferences

### **Social Features**
- **Friend Recommendations**: Suggest content from connections
- **Collaborative Filtering**: Learn from similar users
- **Social Signals**: Consider social proof in ranking

## 📋 Implementation Checklist

### **✅ Completed**
- [x] Database schema for post interactions
- [x] Personalized feed service implementation
- [x] API endpoint integration
- [x] Bookmark exclusion logic
- [x] Fresh content prioritization
- [x] Interaction history tracking
- [x] Personalization algorithms
- [x] Advanced filtering support
- [x] Comprehensive testing
- [x] Performance optimizations

### **🔄 Next Steps**
- [ ] Database setup and migration
- [ ] Production deployment
- [ ] User acceptance testing
- [ ] Performance monitoring
- [ ] A/B testing framework
- [ ] Analytics integration

## 🎉 Benefits Summary

### **For Users**
- **No repetitive content** from bookmarked posts
- **Fresh discovery** of new, relevant content
- **Personalized experience** that adapts to preferences

### **For Content Creators**
- **Fair visibility** for quality content
- **Reduced spam** through bookmark filtering
- **Engagement focus** for meaningful interactions

### **For the Platform**
- **Better user retention** through fresh content
- **Reduced bounce rates** with personalized experience
- **Scalable architecture** for growth

---

**The Personalized Feed System transforms CampusConnect into a dynamic, discovery-focused platform that respects user preferences while maintaining content quality standards.** 