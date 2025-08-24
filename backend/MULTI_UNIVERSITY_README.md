# Multi-University Post System

## Overview

The Multi-University Post System solves a critical fairness issue in content scoring: **posts targeting multiple universities automatically get larger sample sizes (more potential users), which could unfairly inflate their engagement metrics and scores.**

## The Problem

### Before: Unfair Competition
- **Single University Posts**: Limited to users at one university (e.g., 32,000 students at Harvard)
- **Multi-University Posts**: Automatically reach multiple universities (e.g., 125,000+ students across Boston area)
- **Result**: Multi-university posts get higher interaction counts simply due to larger reach, not necessarily better content quality

### Example Scenario
```
Post A (Single University - Harvard):
- Target: 32,000 students
- Engagement: 15 messages, 8 reposts, 12 shares, 20 bookmarks
- Raw Score: 165 points

Post B (Multi-University - Boston Area):
- Target: 125,000 students (4x larger sample)
- Engagement: 45 messages, 25 reposts, 35 shares, 60 bookmarks
- Raw Score: 495 points (3x higher due to sample size advantage)
```

## The Solution: Fair Scoring with Normalization

### Core Principles
1. **Normalize by Target Scope**: Apply penalties based on the number of universities targeted
2. **Higher Engagement Thresholds**: Multi-university posts must meet higher quality standards
3. **Maintain Fair Competition**: Same engagement quality should produce similar final scores

### Normalization Factors
```javascript
const normalizationFactors = {
  single: 1.0,      // No normalization needed
  multi: 0.7,       // 30% penalty for multi-university posts
  cluster: 0.6      // 40% penalty for cluster-wide posts
};
```

### Engagement Thresholds
```javascript
const engagementThresholds = {
  single: 1.0,      // Standard threshold
  multi: 1.5,       // Higher expectations for multi-university
  cluster: 2.0      // Even higher expectations for cluster-wide
};
```

## How It Works

### 1. Post Scope Detection
The system automatically detects the target scope of each post:
- **Single**: 1 university
- **Multi**: 2-5 universities  
- **Cluster**: 6+ universities

### 2. Engagement Normalization
```javascript
// Raw engagement impact
const rawImpact = (messages * 4) + (reposts * 3) + (shares * 2) + (bookmarks * 1);

// Apply scope-based normalization
const normalizedImpact = rawImpact * normalizationFactor;

// Apply engagement threshold adjustment
const finalScore = Math.min(50, normalizedImpact / engagementThreshold);
```

### 3. Fair Score Calculation
Using the example above:
```
Post A (Single University):
- Raw Impact: 165 points
- Normalization: 165 × 1.0 = 165 points
- Threshold: 165 ÷ 1.0 = 165
- Final Score: 50.0 (capped at maximum)

Post B (Multi-University):
- Raw Impact: 495 points
- Normalization: 495 × 0.7 = 346.5 points
- Threshold: 346.5 ÷ 1.5 = 231
- Final Score: 50.0 (capped at maximum)
```

**Result**: Both posts achieve the same maximum score, ensuring fair competition!

## Database Schema

### New Tables
```sql
-- Post universities junction table
CREATE TABLE post_universities (
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  university_id INTEGER REFERENCES universities(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, university_id)
);

-- New field in posts table
ALTER TABLE posts ADD COLUMN target_scope VARCHAR(20) DEFAULT 'single' 
  CHECK (target_scope IN ('single', 'multi'));
```

### Indexes
```sql
CREATE INDEX idx_posts_target_scope ON posts(target_scope);
CREATE INDEX idx_post_universities_post_id ON post_universities(post_id);
CREATE INDEX idx_post_universities_university_id ON post_universities(university_id);
```

## API Endpoints

### Create Multi-University Post
```http
POST /api/posts/multi-university
Content-Type: application/json

{
  "title": "Boston Area Study Group",
  "description": "Looking for study partners across Boston universities",
  "postType": "request",
  "durationType": "recurring",
  "universityIds": [1, 2, 3, 4],
  "tags": ["study group", "academic"],
  "expiresAt": "2024-06-01T00:00:00Z"
}
```

### Update Post Universities
```http
PUT /api/posts/:id/universities
Content-Type: application/json

{
  "universityIds": [1, 2, 3, 4, 5]
}
```

### Get Post Universities
```http
GET /api/posts/:id/universities
```

### Get Posts by Scope
```http
GET /api/posts/scope/single?page=1&limit=20
GET /api/posts/scope/multi?page=1&limit=20
GET /api/posts/scope/cluster?page=1&limit=20
```

## Usage Examples

### Creating a Multi-University Post
```javascript
const response = await fetch('/api/posts/multi-university', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Cross-University Hackathon',
    description: 'Join students from MIT, Harvard, and BU for a weekend hackathon!',
    postType: 'event',
    durationType: 'one-time',
    universityIds: [1, 2, 3], // MIT, Harvard, BU
    tags: ['hackathon', 'technology', 'networking'],
    eventStart: '2024-05-15T09:00:00Z',
    eventEnd: '2024-05-17T18:00:00Z'
  })
});

const result = await response.json();
console.log('Post created:', result.post);
```

### Checking Post Scope
```javascript
const response = await fetch(`/api/posts/${postId}/universities`);
const postInfo = await response.json();

console.log('Post Scope:', postInfo.scope.scope);
console.log('Target Universities:', postInfo.targetedUniversities.length);
console.log('Normalization Factor:', postInfo.scope.normalizationFactor);
```

## Benefits

### 1. Fair Competition
- Single and multi-university posts compete on equal footing
- Content quality matters more than reach advantage
- No automatic penalties for smaller communities

### 2. Quality Standards
- Higher engagement thresholds for larger reach
- Multi-university posts must prove exceptional quality
- Prevents gaming the system through broader targeting

### 3. Scalable System
- Works for any number of universities
- Automatically adjusts based on target scope
- Maintains consistency across different community sizes

### 4. User Experience
- Users can target relevant communities across universities
- Content discovery across geographic clusters
- Maintains engagement quality standards

## Testing

### Run the Demo
```bash
cd backend
node demo-fair-scoring.js
```

### Test API Endpoints
```bash
# Create a multi-university post
curl -X POST http://localhost:3000/api/posts/multi-university \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Multi-University Post",
    "description": "Testing the new system",
    "postType": "offer",
    "durationType": "one-time",
    "universityIds": [1, 2]
  }'

# Check post scope
curl http://localhost:3000/api/posts/1/universities
```

## Monitoring and Adjustments

### Key Metrics to Watch
1. **Engagement Ratios**: Compare engagement per user across different scopes
2. **Score Distribution**: Ensure fair score distribution across post types
3. **User Behavior**: Monitor if users are gaming the system

### Adjusting Normalization Factors
If you find the current factors are too aggressive or lenient:

```javascript
// In multiUniversityScoringService.js
this.normalizationFactors = {
  single: 1.0,      // Keep single university unchanged
  multi: 0.8,       // Adjust from 0.7 to 0.8 (less penalty)
  cluster: 0.7      // Adjust from 0.6 to 0.7 (less penalty)
};
```

## Migration Guide

### For Existing Posts
1. **Automatic Detection**: Existing posts are automatically marked as 'single' scope
2. **No Breaking Changes**: All existing functionality continues to work
3. **Gradual Adoption**: Users can gradually adopt multi-university posts

### Database Migration
```sql
-- Update existing posts to have target_scope
UPDATE posts SET target_scope = 'single' WHERE target_scope IS NULL;

-- Ensure all posts have a primary university association
INSERT INTO post_universities (post_id, university_id, is_primary)
SELECT id, university_id, true FROM posts 
WHERE id NOT IN (SELECT post_id FROM post_universities);
```

## Future Enhancements

### Potential Improvements
1. **Dynamic Normalization**: Adjust factors based on actual engagement patterns
2. **Geographic Weighting**: Consider distance between universities
3. **Content Type Adjustments**: Different normalization for events vs. offers
4. **User Feedback**: Incorporate user ratings into scoring

### Analytics Dashboard
- Post scope distribution
- Engagement patterns by scope
- Fair scoring effectiveness metrics
- User behavior analysis

## Conclusion

The Multi-University Post System successfully addresses the fairness issue while maintaining the integrity of the content quality scoring system. By normalizing engagement metrics based on target scope and applying appropriate thresholds, it ensures that:

- **Quality content wins**, regardless of target scope
- **Fair competition** exists between all post types
- **Users can reach broader audiences** without gaming the system
- **The scoring system remains credible** and meaningful

This system enables CampusConnect to support cross-university collaboration while maintaining the quality standards that make the platform valuable for all users. 