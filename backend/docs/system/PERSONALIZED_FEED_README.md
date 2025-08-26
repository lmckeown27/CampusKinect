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
- **Tab-Specific**: Works with all 3 main tabs (Goods/Services, All, Events)
- **Sub-Tab Support**: Respects category-specific filters
- **Offer/Request Filtering**: Maintains existing marketplace functionality

## 🏗️ Architecture

### **Feed Positioning Algorithm**

#### **Technical Implementation**
The feed positioning system is implemented in the `PersonalizedFeedService` with the following SQL ordering:

```sql
ORDER BY 
  -- Tier 1: Fresh content priority (posts user hasn't seen)
  CASE WHEN ui.post_id IS NULL THEN 0 ELSE 1 END,
  
  -- Tier 2: New post boost (first 24 hours)
  CASE WHEN p.created_at >= NOW() - INTERVAL '24 hours' THEN 0 ELSE 1 END,
  
  -- Tier 3: Relative grade ranking (A > B > C > D within market)
  p.relative_grade ASC, -- A=1, B=2, C=3, D=4
  
  -- Tier 4: Post score within grade (higher scores first)
  p.final_score DESC,
  
  -- Tier 5: Creation date fallback
  p.created_at DESC
```

#### **Priority Weighting**
- **Fresh Content**: Binary priority (0 = top, 1 = lower)
- **New Post Boost**: Binary priority (0 = boosted, 1 = normal)
- **Relative Grade**: Discrete ranking (A=1, B=2, C=3, D=4) within market
- **Post Score**: Continuous ranking within same grade (45.0 > 35.0 > 25.0)
- **Creation Date**: Timestamp ordering (newer > older)

#### **Score Calculation Impact**
The personalized score calculation directly affects feed position:

```javascript
// Fresh content gets 30% boost
if (freshContentBoost) {
  personalizedScore *= 1.3;
}

// New posts get 20% boost
if (postAge <= 1) {
  personalizedScore *= 1.2;
}

// Final ranking: personalizedScore DESC
```

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

#### **`posts` Table (Updated for Relative Grading)**
```sql
-- Relative grade field for market-specific ranking
ALTER TABLE posts ADD COLUMN relative_grade CHAR(1) CHECK (relative_grade IN ('A', 'B', 'C', 'D'));

-- Index for efficient grade-based sorting
CREATE INDEX idx_posts_relative_grade ON posts(relative_grade);
CREATE INDEX idx_posts_market_grade ON posts(market_size, relative_grade, final_score);
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
1. **New Posts** (posts user hasn't seen) - **Absolute Priority**
2. **Relative Grade** (A > B > C > D within new posts) - **Market Quality Priority**
3. **Post Score** (higher scores within same grade) - **Score Priority**
4. **Creation Date** (recency fallback) - **Lowest Priority**

**Important**: Seen posts only appear after ALL new posts are exhausted, and only if user chooses to reshuffle.

### **Relative Grade Impact on Feed Position**

#### **Direct Relationship**
- **Higher relative grades (A > B > C > D)** = **Higher chance of appearing at top of feed**
- **Lower relative grades (D < C < B < A)** = **Lower chance of appearing at top of feed**
- **Relative grade is the primary quality-based ranking factor** after freshness considerations

#### **How It Works**
The feed system uses a **5-tier priority system**:

1. **Fresh Content Priority** (Tier 1)
   - Posts user hasn't interacted with get **absolute top priority**
   - Ensures users always see new, relevant content first

2. **New Post Boost** (Tier 2)
   - Posts created within 24 hours get **secondary priority**
   - Gives new content visibility boost regardless of grade

3. **Relative Grade Ranking** (Tier 3) ⭐ **KEY FACTOR**
   - **`p.relative_grade ASC`** - A-grade posts appear higher in feed
   - **Market-relative quality gets rewarded** with better positioning
   - **Lower grade posts naturally sink** within their market

4. **Post Score Ranking** (Tier 4) ⭐ **SECONDARY FACTOR**
   - **`p.final_score DESC`** - Higher scores within same grade get priority
   - **Fine-tuned ranking** within each grade category
   - **Fair competition** between posts of similar relative quality

5. **Recency Fallback** (Tier 5)
   - Creation date used as final tiebreaker
   - Ensures consistent ordering for posts with identical scores and grades

#### **Example Feed Order (New Post Prioritization with Grade Distribution)**
```
Position 1: Fresh post (user hasn't seen) + A-grade (top 20% in market) = TOP
Position 2: Fresh post (user hasn't seen) + A-grade (top 20% in market) = TOP
Position 3: Fresh post (user hasn't seen) + A-grade (top 20% in market) = TOP
Position 4: Fresh post (user hasn't seen) + A-grade (top 20% in market) = TOP
Position 5: Fresh post (user hasn't seen) + B-grade (next 30% in market) = HIGH
Position 6: Fresh post (user hasn't seen) + B-grade (next 30% in market) = HIGH
Position 7: Fresh post (user hasn't seen) + B-grade (next 30% in market) = HIGH
Position 8: Fresh post (user hasn't seen) + C-grade (next 30% in market) = MEDIUM
Position 9: Fresh post (user hasn't seen) + C-grade (next 30% in market) = MEDIUM
Position 10: Fresh post (user hasn't seen) + D-grade (bottom 20% in market) = LOW
```

**Feed Distribution Logic (Batch of 10 posts):**
- **20% New Posts**: 2 posts (Positions 1-2) - Always prioritized first
- **35% A-grade**: 3-4 posts (Positions 3-6) - Top performing posts
- **25% B-grade**: 2-3 posts (Positions 7-9) - Above-average posts
- **15% C-grade**: 1-2 posts (Position 10) - Below-average posts
- **5% D-grade**: 0-1 posts (Position 10) - Lowest performing posts

**Key Principles**:
1. **Every post shown is new** - user hasn't interacted with it
2. **New posts are always prioritized** over seen posts
3. **Grade distribution follows market performance** within new posts
4. **No seen posts appear** until all new posts are exhausted

#### **When New Posts Are Exhausted**

**Scenario 1: All Posts in Current Tag Seen**
```
User has seen every post in "Leasing" tag:
- Platform message: "You've seen all available leasing posts!"
- Recommendation: "Would you like to see ride posts instead?"
- Action: User can switch to "Ride" tag within same category
```

**Scenario 2: All Posts in Category Seen**
```
User has seen every post in "Offer" category:
- Platform message: "You've seen all available offers!"
- Recommendation: "Would you like to see request posts instead?"
- Action: User can switch to "Request" category within same main tab
```

**Scenario 3: All Posts in Main Tab Seen**
```
User has seen every post in "Goods/Services" tab:
- Platform message: "You've seen all available goods and services!"
- Recommendation: "Would you like to see events instead?"
- Action: User can switch to "Events" tab
```

**Reshuffle Option (All Posts Tab Only)**:
- **"Reshuffle from Top"** button appears ONLY when user reaches end of "All" posts tab
- **Resets interaction history** for ALL posts across all categories
- **Allows users to rediscover** previously seen content from beginning
- **Maintains grade distribution** within reshuffled content
- **Not available** for individual tags or categories

#### **"All" Posts Tab Behavior**

**Normal Operation**:
- Shows posts from all categories (Goods/Services + Events)
- Maintains proper grade distribution across all content
- User sees new posts until they reach the end

**When End is Reached**:
```
User has seen every post in "All" tab:
- Platform message: "You've seen all available posts!"
- Reshuffle button: "Reshuffle from Top"
- Action: User can reshuffle to see all posts again as "new"
```

**Reshuffle Process**:
1. **Complete reset** of interaction history for ALL posts
2. **All posts become "new"** again
3. **Feed starts from beginning** with proper grade distribution
4. **User experience** is like starting fresh with the platform

#### **Why This System Works**
- **New Post Discovery**: Users always see fresh, unviewed content first
- **Market-Relative Quality**: A-grade posts get better visibility within new posts
- **Natural Selection**: Lower-grade posts appear less frequently in feed
- **Fair Competition**: All posts compete fairly within their market size
- **Equal Opportunity**: Small and large markets have same grade distribution
- **User Experience**: Continuous discovery of new, quality content
- **Tag Exploration**: Encourages users to explore different categories

#### **Relative Grading Integration with Personalized Feed**

**Market-Specific Grade Distribution:**
- **Each market size** (Small, Medium, Large, Massive) has independent grade thresholds
- **Grade A (Top 20%)**: Posts with highest scores relative to other posts in same market
- **Grade B (Next 30%)**: Posts with above-average scores in same market
- **Grade C (Next 30%)**: Posts with below-average scores in same market
- **Grade D (Bottom 20%)**: Posts with lowest scores in same market

**Feed Fairness Across Markets:**
- **Small Market A-grade**: May have 30 points but ranks highest in small market feed
- **Massive Market A-grade**: May have 45 points and ranks highest in massive market feed
- **Equal Treatment**: Both get top feed positions in their respective markets
- **No Market Bias**: Small markets aren't penalized for lower absolute engagement

**Example: Dynamic Performance-Based Grading**
```
Small Market (100 posts):
- Post #1: 25 points → C-grade (below average in this market)
- Post #2: 30 points → B-grade (above average in this market)  
- Post #3: 35 points → A-grade (top 20% in this market)

Massive Market (1,000 posts):
- Post #1: 35 points → C-grade (below average in this market)
- Post #2: 40 points → B-grade (above average in this market)
- Post #3: 45 points → A-grade (top 20% in this market)

Result: Both markets have A, B, C grades distributed based on relative performance, not fixed point thresholds
```

**Key Insight**: Grades are assigned based on **relative ranking within each market**, not absolute point values. A post with 25 points could be A-grade in a low-performing market, while a post with 45 points could be C-grade in a high-performing market.

#### **Dynamic Performance-Based Grading System**

**Core Principle: No Fixed Point Thresholds**
- **Grades are purely relative** - based on how posts perform against each other
- **Point values are irrelevant** for grade assignment
- **Only ranking matters** - top 20% get A, next 30% get B, etc.
- **Grades shift constantly** as posts are added, removed, or updated

**Real-Time Grade Calculation:**
```
Market: Small (100 active posts)
Current Distribution:
- A Grade (Top 20%): 20 posts with highest scores
- B Grade (Next 30%): 30 posts with above-average scores
- C Grade (Next 30%): 30 posts with below-average scores
- D Grade (Bottom 20%): 20 posts with lowest scores

When new post arrives:
- All posts re-ranked against each other
- Grade thresholds recalculated
- New post assigned grade based on relative performance
- Existing posts may shift grades up or down
```

**Example: Grade Shifts Over Time**
```
Day 1: Small Market (3 posts)
- Post A: 25 points → A-grade (top 33%)
- Post B: 20 points → B-grade (middle 33%)
- Post C: 15 points → C-grade (bottom 33%)

Day 2: New post arrives
- Post D: 30 points → A-grade (top 25%)
- Post A: 25 points → B-grade (next 25%)
- Post B: 20 points → C-grade (next 25%)
- Post C: 15 points → D-grade (bottom 25%)

Result: Post A shifted from A to B grade due to new competition
```

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
- **Quality Content**: Higher-grade posts naturally rise to top
- **Fair Competition**: All posts compete equally regardless of creator

### **Content Creators**
- **Market-Relative Quality Rewards**: A-grade posts get better visibility within their market
- **Fair Visibility**: Content competes fairly within market size, not against all posts
- **Equal Opportunity**: Small and large markets have same grade distribution
- **Reduced Spam**: Users can't bookmark to avoid content
- **Engagement Focus**: Encourages meaningful interactions
- **Natural Selection**: Lower-grade posts naturally sink within their market

### **Platform Benefits**
- **Better Retention**: Users see fresh, quality content consistently
- **Reduced Bounce**: Less repetitive, more engaging experience
- **Scalable Architecture**: Efficient database queries and caching
- **Quality Ecosystem**: System naturally promotes better content within each market
- **Market Fairness**: All markets have equal opportunity regardless of size
- **User Satisfaction**: Mix of discovery and quality content

### **Content Creators (Legacy)**
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

## 🔧 Technical Implementation of Dynamic Grading

### **Grade Calculation Process**
```sql
-- 1. Calculate dynamic grade thresholds for each market
WITH market_percentiles AS (
  SELECT 
    market_size,
    PERCENTILE_CONT(0.8) WITHIN GROUP (ORDER BY final_score) as grade_a_threshold,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY final_score) as grade_b_threshold,
    PERCENTILE_CONT(0.2) WITHIN GROUP (ORDER BY final_score) as grade_c_threshold
  FROM posts 
  WHERE active = true -- Only consider active posts
  GROUP BY market_size
)

-- 2. Assign grades based on relative performance
UPDATE posts 
SET relative_grade = (
  SELECT 
    CASE 
      WHEN final_score >= mp.grade_a_threshold THEN 'A'
      WHEN final_score >= mp.grade_b_threshold THEN 'B'
      WHEN final_score >= mp.grade_c_threshold THEN 'C'
      ELSE 'D'
    END
  FROM market_percentiles mp
  WHERE mp.market_size = posts.market_size
)
WHERE active = true;
```

### **Real-Time Grade Updates**
- **Triggered by**: New posts, score changes, post deletions
- **Frequency**: Every 5 minutes for active markets
- **Performance**: Uses window functions for efficient calculation
- **Caching**: Grade results cached for 2 minutes

### **Database Schema Updates**
```sql
-- Add relative grade field to posts table
ALTER TABLE posts ADD COLUMN relative_grade CHAR(1) CHECK (relative_grade IN ('A', 'B', 'C', 'D'));

-- Create indexes for efficient grade-based sorting
CREATE INDEX idx_posts_relative_grade ON posts(relative_grade);
CREATE INDEX idx_posts_market_grade ON posts(market_size, relative_grade, final_score);

-- Create function to update grades for a specific market
CREATE OR REPLACE FUNCTION update_market_grades(market_size_param VARCHAR(20))
RETURNS VOID AS $$
BEGIN
  -- Update grades for specified market
  UPDATE posts 
  SET relative_grade = (
    SELECT 
      CASE 
        WHEN final_score >= PERCENTILE_CONT(0.8) WITHIN GROUP (ORDER BY final_score) OVER (PARTITION BY market_size) THEN 'A'
        WHEN final_score >= PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY final_score) OVER (PARTITION BY market_size) THEN 'B'
        WHEN final_score >= PERCENTILE_CONT(0.2) WITHIN GROUP (ORDER BY final_score) OVER (PARTITION BY market_size) THEN 'C'
        ELSE 'D'
      END
    FROM posts 
    WHERE market_size = market_size_param AND active = true
  )
  WHERE market_size = market_size_param AND active = true;
END;
$$ LANGUAGE plpgsql;
```

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
- [x] Dynamic relative grading system
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
- **Always new content** - never see posts they've already interacted with
- **Continuous discovery** of fresh, relevant content
- **Tag exploration** - encouraged to explore different categories
- **Quality distribution** - A-grade posts appear more frequently
- **Complete reshuffle option** - can rediscover ALL content when reaching end of "All" tab

### **For Content Creators**
- **Dynamic performance-based visibility** - grades shift based on relative performance
- **Fair competition** within market size - no fixed point thresholds
- **Equal opportunity** for all markets (small to massive)
- **Real-time grade updates** - posts constantly re-ranked against competition
- **Reduced spam** through bookmark filtering
- **Engagement focus** for meaningful interactions

### **For the Platform**
- **Better user retention** through fresh content
- **Reduced bounce rates** with personalized experience
- **Scalable architecture** for growth

---

**The Personalized Feed System transforms CampusConnect into a dynamic, discovery-focused platform that respects user preferences while maintaining content quality standards.** 