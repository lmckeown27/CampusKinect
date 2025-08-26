# Post Scoring System Documentation

## Overview

The Post Scoring System is the core algorithm that determines how posts are ranked and positioned in CampusConnect's personalized feed. This system ensures fair competition, rewards quality content, and provides users with the most relevant and engaging posts.

## 🎯 **Core Scoring Philosophy**

### **Marketplace-Focused Design**
- **Content Quality Over Popularity**: Rewards posts that consistently engage users, not user popularity
- **Fair Competition**: Same engagement quality produces similar scores regardless of user history
- **Sustained Value**: Quality content remains discoverable until fulfilled
- **No Gaming**: Prevents manipulation through bookmarking or artificial engagement

### **Score Scale**
- **Base Score**: 25.0 points (all posts start here)
- **Maximum Score**: 50.0 points (hard cap for fairness)
- **Engagement Range**: 0-25 additional points (100% of base score)

## 📊 **Score Calculation Formula**

### **Primary Formula**
```
Final Score = Base Score + Engagement Impact + Review Score Bonus
```

### **Detailed Breakdown**
```
Final Score = 25.0 + (Engagement Points × Time Weight) + Review Bonus
```

Where:
- **Base Score**: Always 25.0 points
- **Engagement Points**: Raw engagement score (0-25 points)
- **Time Weight**: Multiplier based on post age (0.4-1.0)
- **Review Bonus**: Additional points for recurring posts (0-5.0)

## 🚀 **Base Score System**

### **Universal Starting Point**
```javascript
const BASE_SCORES = {
  ONE_TIME: 25.0,    // One-time offers/requests
  EVENT: 25.0,       // Events and meetups
  RECURRING: 25.0    // Recurring services
};
```

**Key Points:**
- **All posts start equal**: No advantage for post type
- **Fair foundation**: Every user has the same starting opportunity
- **Consistent baseline**: Predictable scoring for content creators

## ⏰ **Time Weighting System**

### **Progressive Decay Schedule**
```javascript
if (daysSinceCreation <= 1) {
  baseWeight = 1.0;        // 100% weight - NEW POST BOOST
} else if (daysSinceCreation <= 7) {
  baseWeight = 0.9;        // 90% weight - GRACE PERIOD
} else if (daysSinceCreation <= 30) {
  baseWeight = 0.8;        // 80% weight - MUST MAINTAIN ENGAGEMENT
} else if (daysSinceCreation <= 90) {
  baseWeight = 0.7;        // 70% weight - HIGHER ENGAGEMENT REQUIREMENTS
} else if (daysSinceCreation <= 180) {
  baseWeight = 0.6;        // 60% weight - VERY HIGH ENGAGEMENT REQUIREMENTS
} else if (daysSinceCreation <= 365) {
  baseWeight = 0.5;        // 50% weight - EXCEPTIONAL ENGAGEMENT REQUIRED
} else {
  baseWeight = 0.4;        // 40% weight - ONLY TOP PERFORMERS
}
```

### **Time Weight Logic**
- **Day 1**: Full weight (100%) - New posts get maximum visibility
- **Days 2-7**: 90% weight - Grace period for initial engagement
- **Days 8-30**: 80% weight - Must maintain engagement to stay visible
- **Days 31-90**: 70% weight - Higher engagement requirements
- **Days 91-180**: 60% weight - Very high engagement requirements
- **Days 181-365**: 50% weight - Exceptional engagement required
- **Days 365+**: 40% weight - Only top performers remain visible

## 💫 **Engagement Impact System**

### **Engagement Scoring**
```javascript
// Engagement can add up to 100% of base score (25 points = 100% of 25 base)
const maxEngagementPercentage = 1.0; // 100%

// Calculate engagement as a percentage of base score
let engagementPercentage = Math.min(engagementScore / baseScore, maxEngagementPercentage);
engagementPercentage *= timeWeight;

// Convert percentage to points (25 base × percentage)
const engagementImpact = baseScore * engagementPercentage;
```

### **Interaction Types & Scoring Impact**

#### **Primary Interactions (High Impact)**
- **Messages**: **+8.0 points** - Direct user engagement, highest value
- **Shares**: **+6.0 points** - Content amplification, high value
- **Bookmarks**: **+4.0 points** - User interest indication, medium-high value
- **Reposts**: **+3.0 points** - Content redistribution, medium value

#### **Secondary Interactions (Medium Impact)**
- **Profile Views**: **+2.0 points** - User curiosity, medium value
- **Post Views**: **+1.0 points** - Basic visibility, low value

#### **Exponential Decay System**
Each subsequent interaction of the same type follows exponential decay, creating steeper point reduction as interactions increase:
- **Messages**: 8.0 → 4.0 → 2.0 → 1.0 → 0.5... (50% reduction per interaction)
- **Shares**: 6.0 → 3.0 → 1.5 → 0.75 → 0.375... (50% reduction per interaction)
- **Bookmarks**: 4.0 → 2.0 → 1.0 → 0.5 → 0.25... (50% reduction per interaction)
- **Reposts**: 3.0 → 1.5 → 0.75 → 0.375 → 0.1875... (50% reduction per interaction)
- **Profile Views**: 2.0 → 1.0 → 0.5 → 0.25 → 0.125... (50% reduction per interaction)
- **Post Views**: 1.0 → 0.5 → 0.25 → 0.125 → 0.0625... (50% reduction per interaction)

#### **Interaction Weighting System with Natural 25-Point Limit**
```javascript
const INTERACTION_WEIGHTS = {
  MESSAGE: {
    basePoints: 4.16,          // Scaled down from 8.0 to ensure total ≤ 25
    decayFactor: 0.5,          // 50% reduction per subsequent interaction
    description: 'Direct engagement - highest value',
    maxPossiblePoints: 8.32    // Theoretical maximum with infinite interactions
  },
  SHARE: {
    basePoints: 3.12,          // Scaled down from 6.0 to ensure total ≤ 25
    decayFactor: 0.5,          // 50% reduction per subsequent interaction
    description: 'Content amplification - high value',
    maxPossiblePoints: 6.24    // Theoretical maximum with infinite interactions
  },
  BOOKMARK: {
    basePoints: 2.08,          // Scaled down from 4.0 to ensure total ≤ 25
    decayFactor: 0.5,          // 50% reduction per subsequent interaction
    description: 'User interest indication - medium-high value',
    maxPossiblePoints: 4.16    // Theoretical maximum with infinite interactions
  },
  REPOST: {
    basePoints: 1.56,          // Scaled down from 3.0 to ensure total ≤ 25
    decayFactor: 0.5,          // 50% reduction per subsequent interaction
    description: 'Content redistribution - medium value',
    maxPossiblePoints: 3.12    // Theoretical maximum with infinite interactions
  },
  PROFILE_VIEW: {
    basePoints: 1.04,          // Scaled down from 2.0 to ensure total ≤ 25
    decayFactor: 0.5,          // 50% reduction per subsequent interaction
    description: 'User curiosity - medium value',
    maxPossiblePoints: 2.08    // Theoretical maximum with infinite interactions
  },
  POST_VIEW: {
    basePoints: 0.52,          // Scaled down from 1.0 to ensure total ≤ 25
    decayFactor: 0.5,          // 50% reduction per subsequent interaction
    description: 'Basic visibility - low value',
    maxPossiblePoints: 1.04    // Theoretical maximum with infinite interactions
  }
};

// Total possible points: 8.32 + 6.24 + 4.16 + 3.12 + 2.08 + 1.04 = 24.96 ✅
```

### **Interaction Impact Calculation with Exponential Decay**
```javascript
// Calculate total engagement score with exponential decay for each interaction type
const calculateEngagementScore = (interactions) => {
  let totalScore = 0;
  
  // Group interactions by type to apply exponential decay
  const interactionCounts = {
    message: 0,
    share: 0,
    bookmark: 0,
    repost: 0,
    profile_view: 0,
    post_view: 0
  };
  
  // Count interactions by type
  interactions.forEach(interaction => {
    interactionCounts[interaction.type]++;
  });
  
  // Calculate score with exponential decay for each interaction type
  Object.entries(interactionCounts).forEach(([type, count]) => {
    if (count > 0) {
      const weight = INTERACTION_WEIGHTS[type.toUpperCase()];
      let typeScore = 0;
      
      // First interaction gets full base points
      if (count >= 1) {
        typeScore += weight.basePoints;
      }
      
      // Subsequent interactions follow exponential decay: basePoints × (decayFactor)^(interaction_number)
      for (let i = 2; i <= count; i++) {
        const decayedPoints = weight.basePoints * Math.pow(weight.decayFactor, i - 1);
        typeScore += decayedPoints;
      }
      
      totalScore += typeScore;
    }
  });
  
  return totalScore; // No artificial capping needed - mathematically bounded
};
```

### **Interaction Decay & Penalties**

#### **Daily Interaction Penalties**
```javascript
const ENGAGEMENT_DECAY = {
  ZERO_INTERACTION_PENALTY_PERCENTAGE: 0.04,    // 4% daily penalty for zero interaction
  MAX_DAILY_DECAY_PERCENTAGE: 0.16,            // Maximum 16% daily decay (4% × 4 days)
  DECAY_FACTOR: 0.1                             // Percentage-based decay
};
```

#### **Zero Interaction Penalty Schedule**
- **Day 1**: No penalty (new post grace period)
- **Day 2**: -4% penalty (first day without interaction)
- **Day 3**: -8% penalty (cumulative penalty)
- **Day 4**: -12% penalty (cumulative penalty)
- **Day 5+**: -16% penalty (maximum daily penalty)

#### **Interaction Recovery**
```javascript
// Interaction recovery removes penalties and can restore full engagement impact
const calculateInteractionRecovery = (postData) => {
  const recentInteractions = getRecentInteractions(postData.id, 7); // Last 7 days
  
  if (recentInteractions.length > 0) {
    // Recent interactions remove decay penalties
    return {
      penaltyRemoved: true,
      recoveryBonus: 0.05, // 5% recovery bonus for re-engagement
      newScore: baseScore + (engagementScore * (1 + recoveryBonus))
    };
  }
  
  return {
    penaltyRemoved: false,
    recoveryBonus: 0,
    newScore: baseScore + (engagementScore * (1 - dailyPenalty))
  };
};
```

### **How Exponential Decay Creates Natural Bounds**

#### **Single System Solution**
The exponential decay system alone creates a fair, balanced scoring system:

1. **Exponential Decay**: Prevents any single post from accumulating unlimited points
2. **Scaled Base Points**: Ensures raw engagement never exceeds ±25 points
3. **Natural Bounds**: Creates level playing field without market size considerations

#### **The Protection System**
```
Layer 1: Exponential Decay
- Prevents score inflation from high interaction counts
- Each interaction type has a mathematical maximum
- Natural bounds without artificial capping

Layer 2: Scaled Base Points
- Ensures raw engagement stays within ±25 point range
- Maintains relative importance of interaction types
- No artificial capping needed
```

### **Benefits of Universal Exponential Decay System**

#### **Why Exponential Decay Works**
1. **Prevents Score Inflation**: Early interactions don't dominate the scoring
2. **Encourages Quality Over Quantity**: Each new interaction type is more valuable than repeated interactions
3. **Natural Score Bounds**: Scores naturally stay within mathematical limits without artificial capping
4. **Fair Competition**: Prevents posts from quickly reaching maximum scores with low engagement
5. **Word-of-Mouth Recognition**: Rewards posts that generate diverse types of engagement
6. **Exponential Control**: As interactions increase exponentially, points decrease exponentially

#### **Mathematical Advantages of Universal System**
- **Exponential Decay**: Each interaction type follows a geometric progression with 50% reduction
- **Convergent Series**: Total possible points for each interaction type approaches a finite limit
- **Natural Boundaries**: No post can exceed mathematically determined maximum scores
- **Balanced Growth**: High-engagement posts grow more slowly, maintaining fair competition
- **Steep Decay Curve**: Points decrease rapidly as interactions increase, preventing score inflation

### **Exponential Decay Examples (Universal System)**

#### **Example 1: Message Interactions (Scaled Base Points)**
```
Post receives 5 messages:
- 1st message: 4.16 points (full base value)
- 2nd message: 2.08 points (4.16 × 0.5¹)
- 3rd message: 1.04 points (4.16 × 0.5²)
- 4th message: 0.52 points (4.16 × 0.5³)
- 5th message: 0.26 points (4.16 × 0.5⁴)

Total Message Score: 8.06 points
Without Scaling: 15.5 points
Savings: 7.44 points (48.0% reduction)
Result: Natural limit ensures score stays within bounds
```

#### **Example 2: Share Interactions (Scaled Base Points)**
```
Post receives 8 shares:
- 1st share: 3.12 points (full base value)
- 2nd share: 1.56 points (3.12 × 0.5¹)
- 3rd share: 0.78 points (3.12 × 0.5²)
- 4th share: 0.39 points (3.12 × 0.5³)
- 5th share: 0.195 points (3.12 × 0.5⁴)
- 6th share: 0.0975 points (3.12 × 0.5⁵)
- 7th share: 0.04875 points (3.12 × 0.5⁶)
- 8th share: 0.024375 points (3.12 × 0.5⁷)

Total Share Score: 6.2175 points
Without Scaling: 11.953125 points
Savings: 5.735625 points (48.0% reduction)
Result: Natural limit ensures score stays within bounds
```

#### **Example 3: Mixed Interactions with Scaled Base Points (Realistic Scenario)**
```
Post receives:
- 3 messages: 4.16 + 2.08 + 1.04 = 7.28 points
- 5 shares: 3.12 + 1.56 + 0.78 + 0.39 + 0.195 = 6.045 points
- 2 bookmarks: 2.08 + 1.04 = 3.12 points
- 1 repost: 1.56 points
- 10 profile views: 1.04 + 0.52 + 0.26 + 0.13 + 0.065 + 0.0325 + 0.01625 + 0.008125 + 0.0040625 + 0.00203125 = 2.07203125 points
- 25 post views: 0.52 + 0.26 + 0.13 + 0.065 + 0.0325 + 0.01625 + 0.008125 + 0.0040625 + 0.00203125 + 0.001015625 + ... = 1.0399999999 points

Total Engagement Score: 20.06103125 points
Without Scaling: 39.6103515625 points
Savings: 19.5493203125 points (49.4% reduction)
Result: Score naturally stays well within 25-point limit
```

#### **Example 4: Raw Engagement vs. Post Grade (No Market Normalization)**
```
Same Post Content in Different Markets (All Markets Compete Equally):

San Luis Obispo (Small Market):
- Raw Engagement: 20.06 points (scaled base points)
- Post Grade: 25.0 + 20.06 = 45.06 points ✅ (within 0-50 range)

Los Angeles (Large Market):
- Raw Engagement: 20.06 points (scaled base points)
- Post Grade: 25.0 + 20.06 = 45.06 points ✅ (within 0-50 range)

Boston (Massive Market):
- Raw Engagement: 20.06 points (scaled base points)
- Post Grade: 25.0 + 20.06 = 45.06 points ✅ (within 0-50 range)

Result: All markets compete equally - same engagement gets same post grade regardless of market size
```

#### **Example 5: How Exponential Decay Balances Market Differences**
```
Same Quality Post in Different Markets:

San Luis Obispo (Small Market):
- Potential Users: ~22K students
- Expected Interactions: 50 messages, 30 shares, 20 bookmarks
- Raw Engagement: 7.28 + 6.045 + 3.12 = 16.445 points
- Post Grade: 25.0 + 16.445 = 41.445 points

Boston (Massive Market):
- Potential Users: ~300K+ students  
- Expected Interactions: 200 messages, 150 shares, 100 bookmarks
- Raw Engagement: 8.32 + 6.24 + 4.16 = 18.72 points
- Post Grade: 25.0 + 18.72 = 43.72 points

Result: Despite 13.6x more potential users, Boston only gets 2.275 more points!
Exponential decay naturally limits the advantage of larger markets.

#### **Why Exponential Decay Creates Natural Balance**
1. **Diminishing Returns**: Each additional interaction is worth progressively less
2. **Mathematical Limits**: Even infinite interactions approach finite point totals
3. **Market Size Buffering**: Large markets can't accumulate unlimited advantages
4. **Quality Over Quantity**: System rewards diverse engagement over spam interactions
```

#### **Negative Engagement (Decay)**
The system also handles posts losing points through decay:

```
Post starts at Grade 25, receives negative engagement:

Scenario 1: Moderate Decay
- Raw Engagement: -10 points (decay penalty)
- Post Grade: 25 + (-10) = 15 points ✅ (above minimum 0)

Scenario 2: Heavy Decay
- Raw Engagement: -20 points (heavy decay penalty)
- Post Grade: 25 + (-20) = 5 points ✅ (above minimum 0)

Scenario 3: Maximum Decay
- Raw Engagement: -25 points (maximum decay penalty)
- Post Grade: 25 + (-25) = 0 points ✅ (at minimum 0)

Result: Raw engagement never goes below -25 points, ensuring post grades never go below 0
```

#### **Universal System: Raw Engagement vs. Post Grade**
The system has two distinct components that work together:

1. **Post Grade (Final Score)**: Ranges from 0 to 50 points, starting at base grade of 25
2. **Raw Engagement Score**: Ranges from -25 to +25 points, representing daily point changes
3. **Relationship**: `Post Grade = Base Grade (25) + Raw Engagement Score`

#### **The Real System**
```
Post Grade = 25 + Raw Engagement Score

Where:
- Post Grade Range: 0 to 50 points (minimum to maximum)
- Raw Engagement Score Range: -25 to +25 points (daily point changes)
- Base Grade: Always 25 points (starting point for all posts)
- No Artificial Capping: System naturally stays within bounds through design
```

#### **Maximum Possible Points per Interaction Type (Universal System)**
```
Messages (50% reduction per interaction):
- 1st: 8.0, 2nd: 4.0, 3rd: 2.0, 4th: 1.0, 5th: 0.5...
- Total approaches: 8.0 ÷ (1 - 0.5) = 16.0 points (theoretical max)

Shares (50% reduction per interaction):
- 1st: 6.0, 2nd: 3.0, 3rd: 1.5, 4th: 0.75, 5th: 0.375...
- Total approaches: 6.0 ÷ (1 - 0.5) = 12.0 points (theoretical max)

Bookmarks (50% reduction per interaction):
- 1st: 4.0, 2nd: 2.0, 3rd: 1.0, 4th: 0.5, 5th: 0.25...
- Total approaches: 4.0 ÷ (1 - 0.5) = 8.0 points (theoretical max)

Reposts (50% reduction per interaction):
- 1st: 3.0, 2nd: 1.5, 3rd: 0.75, 4th: 0.375, 5th: 0.1875...
- Total approaches: 3.0 ÷ (1 - 0.5) = 6.0 points (theoretical max)

Profile Views (50% reduction per interaction):
- 1st: 2.0, 2nd: 1.0, 3rd: 0.5, 4th: 0.25, 5th: 0.125...
- Total approaches: 2.0 ÷ (1 - 0.5) = 4.0 points (theoretical max)

Post Views (50% reduction per interaction):
- 1.0, 2nd: 0.5, 3rd: 0.25, 4th: 0.125, 5th: 0.0625...
- Total approaches: 1.0 ÷ (1 - 0.5) = 2.0 points (theoretical max)

PROBLEM: Total possible points = 16 + 12 + 8 + 6 + 4 + 2 = 48 points (exceeds 25!)

#### **Solution: Adjusted Base Points for Natural 25-Point Limit**
To ensure raw engagement never exceeds 25 points, we need to scale down the base points proportionally:

```
Target: Total possible points = 25.0
Current total: 48.0 points
Scaling factor: 25.0 ÷ 48.0 = 0.5208 (approximately 0.52)

New Base Points (scaled down by 0.52):
- Messages: 8.0 × 0.52 = 4.16 points (was 8.0)
- Shares: 6.0 × 0.52 = 3.12 points (was 6.0)  
- Bookmarks: 4.0 × 0.52 = 2.08 points (was 4.0)
- Reposts: 3.0 × 0.52 = 1.56 points (was 3.0)
- Profile Views: 2.0 × 0.52 = 1.04 points (was 2.0)
- Post Views: 1.0 × 0.52 = 0.52 points (was 1.0)

New Theoretical Maximums:
- Messages: 4.16 ÷ (1 - 0.5) = 8.32 points
- Shares: 3.12 ÷ (1 - 0.5) = 6.24 points
- Bookmarks: 2.08 ÷ (1 - 0.5) = 4.16 points
- Reposts: 1.56 ÷ (1 - 0.5) = 3.12 points
- Profile Views: 1.04 ÷ (1 - 0.5) = 2.08 points
- Post Views: 0.52 ÷ (1 - 0.5) = 1.04 points

Total: 8.32 + 6.24 + 4.16 + 3.12 + 2.08 + 1.04 = 24.96 points ✅ (Under 25!)
```

#### **Practical Impact**
- **Realistic Maximum**: Even viral posts rarely exceed 100-150 total interactions
- **Natural Score Bounds**: Raw engagement naturally stays within ±25 points
- **Quality Focus**: System rewards diverse engagement over spam interactions
- **Sustainable Growth**: Prevents score inflation while maintaining engagement incentives
- **Market Balance**: Exponential decay naturally evens out market size differences

#### **Mathematical Relationship (Universal System)**
```
Post Grade = Base Grade + Raw Engagement Score

Where:
- Base Grade = 25.0 (always)
- Raw Engagement = Calculated with exponential decay limits (range: -25 to +25)
- Exponential Decay = Prevents unlimited point accumulation
- No Market Size Normalization = All markets compete equally

Example with Scaled Base Points:
- Small Market: 25.0 + 20.06 = 45.06 ✅ (within 0-50 range)
- Large Market: 25.0 + 20.06 = 45.06 ✅ (within 0-50 range)
- Massive Market: 25.0 + 20.06 = 45.06 ✅ (within 0-50 range)

Result: Raw engagement naturally bounded to ±25 points, ensuring post grades stay within 0-50 range
```

## 🎯 **Complete Universal System Summary**

### **Two-Component Universal Scoring System**

#### **Component 1: Post Grade (Final Score)**
- **Range**: 0 to 50 points
- **Base Grade**: Every post starts at 25 points
- **Formula**: `Post Grade = 25 + Raw Engagement Score`

#### **Component 2: Raw Engagement Score (Daily Points)**
- **Range**: -25 to +25 points
- **Purpose**: Daily point changes that modify the post's grade
- **Positive**: Increases post grade (up to maximum 50)
- **Negative**: Decreases post grade (down to minimum 0)

### **How It All Works Together**

```
Daily Process:
1. Post starts at Grade 25
2. Interactions generate Raw Engagement Score (-25 to +25)
3. Post Grade = 25 + Raw Engagement Score
4. Result: Post Grade always stays within 0-50 range

Example Day:
- Morning: Post Grade = 25 (base)
- Afternoon: Raw Engagement = +15 points
- Evening: Post Grade = 25 + 15 = 40 ✅
- Next Day: Raw Engagement = -8 points  
- Result: Post Grade = 40 + (-8) = 32 ✅
```

### **Key Benefits**
1. **Natural Bounds**: No artificial capping needed
2. **Daily Flexibility**: Posts can gain or lose points daily
3. **Fair Competition**: All posts compete within same 0-50 range
4. **Universal Fairness**: All markets compete equally using same rules
5. **Quality Focus**: Exponential decay rewards diverse engagement over spam
6. **Natural Score Balancing**: Exponential decay helps even out scores between markets

#### **Simplified System Benefits**
With normalization removed, the system becomes simpler and more direct:

1. **Equal Competition**: All markets compete on equal terms
2. **Simplified Logic**: No complex market size calculations needed
3. **Direct Scoring**: Raw engagement directly translates to post grade changes
4. **Universal Fairness**: Same engagement always produces same results regardless of location

#### **The Universal Solution**
```
Exponential Decay + Scaled Base Points = Simple, Fair Scoring

- Exponential Decay: Prevents unlimited point accumulation
- Scaled Base Points: Ensures natural ±25 point bounds
- Result: Clean, simple system that's fair for all users
```

### **Interaction Timing & Recency**

#### **Interaction Recency Multipliers**
```javascript
const INTERACTION_RECENCY_MULTIPLIERS = {
  '1_hour': 1.2,      // +20% for interactions within 1 hour
  '1_day': 1.1,       // +10% for interactions within 1 day
  '3_days': 1.05,     // +5% for interactions within 3 days
  '7_days': 1.0,      // Base multiplier for interactions within 7 days
  '30_days': 0.8,     // -20% for interactions older than 30 days
  '90_days': 0.5,     // -50% for interactions older than 90 days
  'older': 0.2        // -80% for very old interactions
};
```

#### **Recency Impact Calculation**
```javascript
const calculateRecencyImpact = (interaction, currentTime) => {
  const hoursSinceInteraction = (currentTime - interaction.created_at) / (1000 * 60 * 60);
  
  let multiplier;
  if (hoursSinceInteraction <= 1) {
    multiplier = INTERACTION_RECENCY_MULTIPLIERS['1_hour'];
  } else if (hoursSinceInteraction <= 24) {
    multiplier = INTERACTION_RECENCY_MULTIPLIERS['1_day'];
  } else if (hoursSinceInteraction <= 72) {
    multiplier = INTERACTION_RECENCY_MULTIPLIERS['3_days'];
  } else if (hoursSinceInteraction <= 168) {
    multiplier = INTERACTION_RECENCY_MULTIPLIERS['7_days'];
  } else if (hoursSinceInteraction <= 720) {
    multiplier = INTERACTION_RECENCY_MULTIPLIERS['30_days'];
  } else if (hoursSinceInteraction <= 2160) {
    multiplier = INTERACTION_RECENCY_MULTIPLIERS['90_days'];
  } else {
    multiplier = INTERACTION_RECENCY_MULTIPLIERS['older'];
  }
  
  return interaction.basePoints * multiplier;
};
```

### **Interaction Quality & Validation**

#### **Quality Metrics**
- **Unique Users**: Interactions from different users weighted higher
- **User Reputation**: Interactions from high-reputation users get bonus
- **Interaction Depth**: Longer messages, detailed shares get bonus
- **Spam Prevention**: Rapid-fire interactions flagged and penalized

#### **Interaction Validation Rules**
```javascript
const validateInteraction = (interaction, postData) => {
  // Prevent self-interaction
  if (interaction.user_id === postData.user_id) {
    return { valid: false, reason: 'self_interaction' };
  }
  
  // Prevent duplicate interactions within time window
  const recentDuplicate = checkRecentDuplicate(interaction);
  if (recentDuplicate) {
    return { valid: false, reason: 'duplicate_interaction' };
  }
  
  // Prevent interaction spam
  const spamCheck = checkInteractionSpam(interaction.user_id);
  if (spamCheck.isSpam) {
    return { valid: false, reason: 'spam_detection' };
  }
  
  return { valid: true, bonus: calculateQualityBonus(interaction) };
};
```

### **Interaction Impact Examples**

#### **Example 1: High-Quality Engagement**
```
Post receives:
- 3 messages from different users: +24.0 points
- 2 shares: +12.0 points
- 5 bookmarks: +20.0 points
- 1 repost: +3.0 points

Total Engagement: 59.0 points
Capped at: 25.0 points (100% of base score)
Final Engagement Impact: 25.0 points
```

#### **Example 2: Sustained Engagement Over Time**
```
Day 1: 2 messages (+16.0), 1 share (+6.0) = 22.0 points
Day 3: 1 message (+8.0) = 30.0 points (capped at 25.0)
Day 7: No new interactions, penalty starts
Day 8: -4% penalty, effective score: 24.0 points
Day 9: -8% penalty, effective score: 23.0 points
Day 10: New bookmark (+4.0), penalty removed, recovery bonus (+5%)
Final Score: 25.0 + (27.0 × 1.05) = 53.35 (capped at 50.0)
```

#### **Example 3: Interaction Decay Recovery**
```
Post with 20 engagement points, 30 days old:
- Time weight: 0.8 (80%)
- Effective engagement: 20 × 0.8 = 16.0 points
- New interaction (message): +8.0 points
- Recovery bonus: +5%
- New effective engagement: 28.0 × 1.05 = 29.4 points
- Final engagement impact: 25.0 (capped)
```

### **Interaction Analytics & Monitoring**

#### **Key Metrics to Track**
- **Interaction Velocity**: Interactions per day
- **Engagement Quality**: Average points per interaction
- **Recovery Rate**: Posts that regain engagement
- **Decay Patterns**: How quickly posts lose engagement
- **Spam Detection**: Invalid interaction patterns

#### **Performance Indicators**
- **High-Engagement Posts**: Posts maintaining 20+ points
- **Engagement Recovery**: Posts that bounce back from decay
- **Quality Interactions**: Meaningful engagement vs. spam
- **User Engagement Patterns**: How different users interact

## 📉 **Lack of Interaction Impact**

### **Zero Interaction Penalty System**

#### **Daily Decay Schedule**
```javascript
const calculateDailyDecay = (postData) => {
  const daysWithoutInteraction = getDaysWithoutInteraction(postData.id);
  const currentEngagementScore = postData.engagement_score;
  
  if (daysWithoutInteraction === 0) {
    return { penalty: 0, newScore: currentEngagementScore };
  }
  
  // Progressive penalty system
  let dailyPenalty;
  if (daysWithoutInteraction === 1) {
    dailyPenalty = 0.04; // 4% penalty
  } else if (daysWithoutInteraction === 2) {
    dailyPenalty = 0.08; // 8% penalty
  } else if (daysWithoutInteraction === 3) {
    dailyPenalty = 0.12; // 12% penalty
  } else {
    dailyPenalty = 0.16; // 16% penalty (maximum)
  }
  
  const penaltyAmount = currentEngagementScore * dailyPenalty;
  const newScore = Math.max(0, currentEngagementScore - penaltyAmount);
  
  return {
    penalty: penaltyAmount,
    newScore: newScore,
    decayPercentage: dailyPenalty * 100
  };
};
```

#### **Decay Impact Examples**

##### **Example 1: New Post with No Engagement**
```
Day 1: Post created, no interactions
- Base score: 25.0
- Engagement score: 0.0
- Total score: 25.0

Day 2: Still no interactions
- Daily penalty: -4% (0.0 × 0.04 = 0.0)
- Engagement score: 0.0 (no change)
- Total score: 25.0

Day 3: Still no interactions
- Daily penalty: -8% (0.0 × 0.08 = 0.0)
- Engagement score: 0.0 (no change)
- Total score: 25.0
```

##### **Example 2: Established Post Losing Engagement**
```
Day 1: Post with 20 engagement points
- Base score: 25.0
- Engagement score: 20.0
- Total score: 45.0

Day 2: No new interactions
- Daily penalty: -4% (20.0 × 0.04 = 0.8)
- New engagement score: 19.2
- Total score: 44.2

Day 3: Still no interactions
- Daily penalty: -8% (19.2 × 0.08 = 1.54)
- New engagement score: 17.66
- Total score: 42.66

Day 4: Still no interactions
- Daily penalty: -12% (17.66 × 0.12 = 2.12)
- New engagement score: 15.54
- Total score: 40.54

Day 5+: Maximum penalty applies
- Daily penalty: -16% (15.54 × 0.16 = 2.49)
- New engagement score: 13.05
- Total score: 38.05
```

### **Engagement Decay Recovery**

#### **Recovery Mechanisms**
```javascript
const calculateDecayRecovery = (postData, newInteraction) => {
  const daysWithoutInteraction = getDaysWithoutInteraction(postData.id);
  const currentEngagementScore = postData.engagement_score;
  
  if (daysWithoutInteraction === 0) {
    // No decay to recover from
    return {
      recovered: false,
      bonus: 0,
      newScore: currentEngagementScore + newInteraction.points
    };
  }
  
  // Calculate recovery bonus based on interaction quality
  let recoveryBonus = 0;
  if (newInteraction.type === 'message') {
    recoveryBonus = 0.10; // 10% bonus for messages
  } else if (newInteraction.type === 'share') {
    recoveryBonus = 0.08; // 8% bonus for shares
  } else if (newInteraction.type === 'bookmark') {
    recoveryBonus = 0.05; // 5% bonus for bookmarks
  }
  
  // Remove decay penalties and apply recovery bonus
  const recoveredScore = currentEngagementScore + newInteraction.points;
  const finalScore = recoveredScore * (1 + recoveryBonus);
  
  return {
    recovered: true,
    bonus: recoveryBonus,
    newScore: Math.min(finalScore, 25.0), // Cap at 25 points
    penaltyRemoved: true
  };
};
```

#### **Recovery Examples**

##### **Example 1: Message Recovery**
```
Post with 15 engagement points, 5 days without interaction:
- Current engagement: 15.0 points
- New message: +8.0 points
- Recovery bonus: +10% (message recovery)
- New engagement: (15.0 + 8.0) × 1.10 = 25.3
- Final engagement: 25.0 (capped)
- Result: Full recovery + penalty removal
```

##### **Example 2: Bookmark Recovery**
```
Post with 12 engagement points, 3 days without interaction:
- Current engagement: 12.0 points
- New bookmark: +4.0 points
- Recovery bonus: +5% (bookmark recovery)
- New engagement: (12.0 + 4.0) × 1.05 = 16.8
- Final engagement: 16.8 points
- Result: Partial recovery + penalty removal
```

### **Decay Prevention Strategies**

#### **Sustained Engagement Thresholds**
```javascript
const checkDecayPrevention = (postData) => {
  const recentInteractions = getRecentInteractions(postData.id, 7); // Last 7 days
  const interactionCount = recentInteractions.length;
  
  if (interactionCount >= 3) {
    return { decayPrevented: true, reason: 'high_engagement' };
  } else if (interactionCount >= 1) {
    return { decayPrevented: true, reason: 'active_engagement' };
  } else {
    return { decayPrevented: false, reason: 'no_recent_engagement' };
  }
};
```

#### **Decay Prevention Examples**
```
Post with 20 engagement points:

Scenario A: 1 interaction in last 7 days
- Decay prevented: Yes
- Reason: Active engagement
- Score maintained: 20.0 points

Scenario B: No interactions in last 7 days
- Decay prevented: No
- Reason: No recent engagement
- Daily penalty: -16% (3.2 points)
- New score: 16.8 points
```

### **Long-Term Decay Patterns**

#### **Extended Inactivity Impact**
```javascript
const calculateLongTermDecay = (postData) => {
  const monthsWithoutInteraction = getMonthsWithoutInteraction(postData.id);
  const currentEngagementScore = postData.engagement_score;
  
  let monthlyPenalty;
  if (monthsWithoutInteraction <= 1) {
    monthlyPenalty = 0.10; // 10% monthly penalty
  } else if (monthsWithoutInteraction <= 3) {
    monthlyPenalty = 0.20; // 20% monthly penalty
  } else if (monthsWithoutInteraction <= 6) {
    monthlyPenalty = 0.30; // 30% monthly penalty
  } else {
    monthlyPenalty = 0.50; // 50% monthly penalty
  }
  
  const penaltyAmount = currentEngagementScore * monthlyPenalty;
  return Math.max(0, currentEngagementScore - penaltyAmount);
};
```

#### **Long-Term Decay Examples**
```
Post with 25 engagement points:

Month 1: No interactions
- Monthly penalty: -10% (2.5 points)
- New score: 22.5 points

Month 3: Still no interactions
- Monthly penalty: -20% (4.5 points)
- New score: 18.0 points

Month 6: Still no interactions
- Monthly penalty: -30% (5.4 points)
- New score: 12.6 points

Month 12: Still no interactions
- Monthly penalty: -50% (6.3 points)
- Final score: 6.3 points
```

### **Decay Analytics & Monitoring**

#### **Decay Metrics to Track**
- **Decay Rate**: Percentage of posts losing engagement daily
- **Recovery Rate**: Percentage of posts recovering from decay
- **Decay Velocity**: How quickly posts lose engagement
- **Decay Prevention**: Effectiveness of engagement strategies

#### **Decay Performance Indicators**
- **High-Risk Posts**: Posts approaching decay thresholds
- **Decay Recovery**: Posts successfully bouncing back
- **Chronic Decay**: Posts consistently losing engagement
- **Decay Prevention**: Posts maintaining engagement levels

## 🌟 **Sustained Engagement Bonus**

### **Bonus Multipliers**
```javascript
const bonusMultipliers = {
  'exceptional': 1.0,  // +100% bonus for exceptional content
  'high': 0.7,         // +70% bonus for high-quality content
  'moderate': 0.5,     // +50% bonus for moderate-quality content
  'low': 0.0           // No bonus for low-quality content
};
```

### **Sustained Engagement Levels**

#### **Exceptional Content (+100% Bonus)**
- **Requirements**: Engagement velocity ≥ 1.6× threshold + balanced historical engagement
- **Characteristics**: Consistently high engagement over time
- **Examples**: Popular tutoring services, high-demand events, quality housing offers

#### **High-Quality Content (+70% Bonus)**
- **Requirements**: Engagement velocity ≥ 1.3× threshold + some historical engagement
- **Characteristics**: Good engagement with some consistency
- **Examples**: Regular study groups, reliable services, well-reviewed offers

#### **Moderate-Quality Content (+50% Bonus)**
- **Requirements**: Engagement velocity ≥ 1.0× threshold + minimal historical engagement
- **Characteristics**: Adequate engagement, newer content
- **Examples**: New services, occasional events, standard offers

#### **Low-Quality Content (0% Bonus)**
- **Requirements**: Below engagement thresholds
- **Characteristics**: Minimal or declining engagement
- **Examples**: Poorly described posts, irrelevant content, outdated offers

### **Sustained Engagement Calculation**
```javascript
const determineSustainedEngagementLevel = (recentEngagement, historicalEngagement, daysSinceCreation, engagementThreshold = 1.0) => {
  if (daysSinceCreation < 7) {
    return 'low'; // Need at least 7 days to determine content engagement pattern
  }
  
  // Calculate engagement ratio (recent vs. historical)
  const totalEngagement = recentEngagement + historicalEngagement;
  const recentRatio = recentEngagement / totalEngagement;
  const historicalRatio = historicalEngagement / totalEngagement;
  
  // Calculate engagement velocity (engagement per day)
  const engagementVelocity = totalEngagement / daysSinceCreation;
  const adjustedThreshold = engagementThreshold;
  
  // Balanced thresholds for marketplace: content quality over user popularity
  if (engagementVelocity >= (1.6 * adjustedThreshold) && historicalRatio >= 0.5) {
    return 'exceptional';
  } else if (engagementVelocity >= (1.3 * adjustedThreshold) && historicalRatio >= 0.4) {
    return 'high';
  } else if (engagementVelocity >= (1.0 * adjustedThreshold) && historicalRatio >= 0.3) {
    return 'moderate';
  } else {
    return 'low';
  }
};
```

## ⭐ **Review Score Bonus (Recurring Posts Only)**

### **Review Bonus System**
```javascript
// Review Score Bonus
- **Calculation**: `review_count * 0.5` (0.5 points per review)
- **Maximum**: Capped at 5.0 points for scoring fairness
- **Eligibility**: Only applies to recurring posts
- **Formula**: `finalScore = baseScore + engagementImpact + reviewScoreBonus`
```

### **Review Bonus Details**
- **Per Review**: +0.5 points
- **Maximum Bonus**: 5.0 points (10 reviews)
- **Eligibility**: Only posts with `duration_type = 'recurring'`
- **Purpose**: Reward quality services with customer feedback

## 🔄 **Personalization Factors**

### **Fresh Content Boost**
```javascript
// Fresh Content Boost: 30% increase for posts user hasn't interacted with
const freshContentBoost = userHasInteracted ? 1.0 : 1.3;
```

### **New Post Boost**
```javascript
// New Post Boost: 20% increase for posts created within 24 hours
const newPostBoost = isNewPost ? 1.2 : 1.0;
```

### **Interaction Recency Bonus**
```javascript
// Interaction Recency Bonus
const interactionRecencyBonus = {
  '1_day': 0.10,    // 10% bonus for interactions within 1 day
  '7_days': 0.05,   // 5% bonus for interactions within 7 days
  '30_days': 0.02,  // 2% bonus for interactions within 30 days
  'older': 0.00     // 0% bonus for older interactions
};
```

## 🏆 **Feed Ranking Priority**

### **Primary Ranking Order**
1. **Fresh Content Priority**: Posts user hasn't interacted with get priority
2. **New Post Boost**: Posts created within 24 hours get visibility boost
3. **Final Score**: Quality-based ranking using calculated scores
4. **Creation Date**: Recency fallback for equal scores

### **Secondary Factors**
- **University Match**: Posts from user's university get priority
- **Tag Relevance**: Posts matching user's interests get slight boost
- **Interaction History**: Posts from users with positive interaction history

## 🌐 **Universal Scoring System with Natural Market Balancing**

### **Mathematical Design Principles**

#### **Natural Score Bounds Without Artificial Capping**
The scoring system is mathematically designed so that **no artificial capping is needed**. The relationships between components naturally keep scores within the 0-50 range:

- **Base Grade**: Always 25.0 (exactly in the middle)
- **Raw Engagement Range**: -25 to +25 points (daily point changes)
- **Review Bonus**: 0-5 points (limited by review count)
- **Post Grade Range**: 0-50 points (mathematically bounded)

#### **Why This Design Works**
1. **Base Grade Centering**: Starting at 25.0 allows equal room for growth and decay
2. **Scaled Base Points**: Carefully calculated to ensure natural ±25 point bounds
3. **Natural Limits**: Engagement and bonuses are inherently limited by their design
4. **Mathematical Consistency**: All calculations respect the 0-50 range naturally

### **Universal Scoring System**

#### **Equal Competition for All Markets**
The scoring system now treats all markets equally, regardless of size:

#### **Simplified Approach**
- **All markets** = Same scoring rules and point values
- **No advantages** = No market size benefits or penalties
- **Direct comparison** = Posts compete purely on engagement quality

#### **Example: Same Quality Post**
```
Post Quality: Identical content and appeal
Market A: 1 university, 50K potential users
Market B: 20 universities, 1M potential users

Result: Both markets use identical scoring - winner determined by actual engagement quality
```

#### **Simplified Scoring Strategy**
The system now uses a **universal approach** where all markets compete equally:

| Market Size | Universities | Population | Scoring Approach | Result |
|-------------|--------------|------------|------------------|---------|
| **SMALL** | 1 | 0-50K | **Universal System** | Same scoring as all markets |
| **MEDIUM** | 2-5 | 50K-200K | **Universal System** | Same scoring as all markets |
| **LARGE** | 6-15 | 200K-500K | **Universal System** | Same scoring as all markets |
| **MASSIVE** | 16+ | 500K+ | **Universal System** | Same scoring as all markets |

### **Sample Size Classification**

#### **Simplified Market Approach**
```javascript
// No market size categories or normalization factors needed
// All markets compete equally using the same scoring system

const SCORING_SYSTEM = {
  baseGrade: 25.0,                  // All posts start here
  maxGrade: 50.0,                   // Maximum possible grade
  minGrade: 0.0,                    // Minimum possible grade
  rawEngagementRange: [-25, 25],    // Raw engagement bounds
  decayFactor: 0.5,                 // Exponential decay factor
  description: 'Universal scoring system for all markets'
};
```

#### **Market Size Detection**
```javascript
const determineMarketSize = async (postData) => {
  const targetUniversities = await getTargetUniversities(postData.id);
  const universityCount = targetUniversities.length;
  const totalPopulation = calculateTotalPopulation(targetUniversities);
  
  if (universityCount === 1) {
    return MARKET_SIZE_CATEGORIES.SMALL;
  } else if (universityCount <= 5) {
    return MARKET_SIZE_CATEGORIES.MEDIUM;
  } else if (universityCount <= 15) {
    return MARKET_SIZE_CATEGORIES.LARGE;
  } else {
    return MARKET_SIZE_CATEGORIES.MASSIVE;
  }
};
```

### **Simplified Scoring Process**

#### **Direct Engagement Calculation**
```javascript
const calculateEngagementScore = (interactions) => {
  // Calculate total engagement score with exponential decay for each interaction type
  // No market size normalization needed - all markets compete equally
  
  let totalScore = 0;
  
  // Group interactions by type to apply exponential decay
  const interactionCounts = {
    message: 0,
    share: 0,
    bookmark: 0,
    repost: 0,
    profile_view: 0,
    post_view: 0
  };
  
  // Count interactions by type
  interactions.forEach(interaction => {
    interactionCounts[interaction.type]++;
  });
  
  // Calculate score with exponential decay for each interaction type
  Object.entries(interactionCounts).forEach(([type, count]) => {
    if (count > 0) {
      const weight = INTERACTION_WEIGHTS[type.toUpperCase()];
      let typeScore = 0;
      
      // First interaction gets full base points
      if (count >= 1) {
        typeScore += weight.basePoints;
      }
      
      // Subsequent interactions follow exponential decay
      for (let i = 2; i <= count; i++) {
        const decayedPoints = weight.basePoints * Math.pow(weight.decayFactor, i - 1);
        typeScore += weight.basePoints * Math.pow(weight.decayFactor, i - 1);
        typeScore += decayedPoints;
      }
      
      totalScore += typeScore;
    }
  });
  
  return totalScore; // Naturally bounded to ±25 points
};

#### **Simplified Scoring Formula**
```javascript
const calculatePostGrade = async (postData) => {
  const rawEngagement = calculateEngagementScore(postData.interactions);
  
  // Calculate post grade directly - no market size normalization
  const postGrade = 25.0 + rawEngagement;
  
  return {
    baseGrade: 25.0,
    rawEngagement: rawEngagement,
    postGrade: postGrade,
    description: 'Universal scoring system for all markets'
  };
};
```
```

#### **Sample Size Impact Examples**

##### **Example 1: San Luis Obispo (Small Market)**
```
Market: Single university (Cal Poly SLO)
Sample Size: SMALL
Raw Engagement: 20.06 points (with exponential decay)
Post Grade: 25.0 + 20.06 = 45.06 points
Result: Universal scoring system - no market size adjustments
```

##### **Example 2: Boston Area (Massive Market)**
```
Market: 20+ universities (BU, MIT, Harvard, Northeastern, etc.)
Sample Size: MASSIVE
Raw Engagement: 20.06 points (with exponential decay)
Post Grade: 25.0 + 20.06 = 45.06 points
Result: Universal scoring system - same rules as all markets
```

##### **Example 3: Los Angeles (Large Market)**
```
Market: 8 universities (UCLA, USC, Cal State LA, etc.)
Sample Size: LARGE
Raw Engagement: 20.06 points (with exponential decay)
Post Grade: 25.0 + 20.06 = 45.06 points
Result: Universal scoring system - equal competition for all
```

### **Universal Scoring System**

#### **Simplified Scoring Formula**
```javascript
const calculatePostGrade = async (postData) => {
  const rawEngagement = calculateEngagementScore(postData.interactions);
  
  // Calculate post grade directly - no market size normalization
  const postGrade = 25.0 + rawEngagement;
  
  return {
    baseGrade: 25.0,
    rawEngagement: rawEngagement,
    postGrade: postGrade,
    description: 'Universal scoring system for all markets'
  };
};
```

#### **Universal System Benefits**
```javascript
const UNIVERSAL_SYSTEM = {
  equalCompetition: true,        // All markets compete equally
  noNormalization: true,         // No market size adjustments
  naturalBounds: true,           // Exponential decay creates natural limits
  simplifiedLogic: true,         // Clean, easy-to-understand system
  fairScoring: true              // Same engagement = same results
};
```

### **Universal System Analytics**

#### **Performance Metrics (All Markets Equal)**
```javascript
const analyzeUniversalPerformance = async () => {
  const allPosts = await getAllPosts();
  
  return {
    systemType: 'Universal',
    totalPosts: allPosts.length,
    averageEngagement: calculateAverageEngagement(allPosts),
    averagePostGrade: calculateAveragePostGrade(allPosts),
    marketFairness: 'Equal for all markets',
    successRate: calculateSuccessRate(allPosts),
    engagementVelocity: calculateEngagementVelocity(allPosts)
  };
};
```

#### **Universal System Benefits**
```javascript
const getUniversalSystemBenefits = () => {
  return {
    equalCompetition: 'All markets compete equally',
    noComplexity: 'No market size calculations needed',
    naturalBalance: 'Exponential decay creates natural limits',
    transparency: 'Same engagement = same results',
    simplicity: 'Clean, easy-to-understand system'
  };
};
```

### **Universal Competition Implementation**

#### **Scope Detection (No Market Size Consideration)**
```javascript
const determinePostScope = async (postId) => {
  const postData = await getPostData(postId);
  const targetUniversities = await getTargetUniversities(postId);
  
  return {
    scope: targetUniversities.length > 1 ? 'multi' : 'single',
    universityCount: targetUniversities.length,
    marketSize: 'Universal (no size consideration)',
    sampleSizeAdvantage: 'None (universal system)',
    normalizationFactor: 'None (universal system)',
    reason: 'All markets compete equally',
    targetUniversities: targetUniversities
  };
};
```

#### **Universal Engagement Calculation**
```javascript
const calculateUniversalEngagement = async (postData) => {
  const postScope = await determinePostScope(postData.id);
  
  // All posts use the same scoring system regardless of scope
  return {
    normalized: false,
    engagement: postData.engagement_score,
    factor: 1.0,
    marketSize: 'Universal',
    sampleSizeAdvantage: 'None',
    system: 'Universal scoring for all markets'
  };
};
```

### **Universal System Examples in Practice**

#### **Real-World Market Scenarios (No Normalization)**

##### **Scenario 1: Tutoring Service in San Luis Obispo (Small Market)**
```
Market: Single university (Cal Poly SLO)
Students: ~22,000
Sample Size: Small (limited potential users)
Expected Interaction Pattern: Low volume, high value per interaction

Raw Engagement Calculation (with market-adjusted batch-based decay):
- 3 messages: 12.48×3 = 37.44 points (Small Market: 3.0× multiplier, Batch 1: 100% retention)
- 2 bookmarks: 6.24×2 = 12.48 points (Small Market: 3.0× multiplier, Batch 1: 100% retention)
- 1 share: 9.36×1 = 9.36 points (Small Market: 3.0× multiplier, Batch 1: 100% retention)
- 1 repost: 4.68×1 = 4.68 points (Small Market: 3.0× multiplier, Batch 1: 100% retention)
- 5 profile views: 3.12×5 = 15.6 points (Small Market: 3.0× multiplier, Batch 1: 100% retention)
- 8 post views: 1.56×5 + 1.482×3 = 7.8 + 4.446 = 12.246 points (Small Market: 3.0× multiplier, Batch 1: 100%, Batch 2: 95%)

Total Raw Engagement: 7.8 points (naturally bounded)
Post Grade: 25.0 + 7.8 = 32.8
Result: Small market gets fair scoring with naturally bounded system
```

##### **Scenario 2: Same Tutoring Service in Boston (Massive Market)**
```
Market: 20+ universities (BU, MIT, Harvard, etc.)
Students: ~300,000+
Sample Size: Massive (huge potential user base)
Expected Interaction Pattern: High volume, diminishing value per interaction

Raw Engagement Calculation (with market-adjusted batch-based decay):
- 25 messages: 2.08×5 + 1.976×10 + 1.872×10 = 10.4 + 19.76 + 18.72 = 48.88 points (Massive Market: 0.5× multiplier, Batch 1: 100%, Batch 2: 95%, Batch 3: 90%)
- 15 bookmarks: 1.04×2 + 0.988×6 + 0.936×7 = 2.08 + 5.928 + 6.552 = 14.56 points (Massive Market: 0.5× multiplier, Batch 1: 100%, Batch 2: 95%, Batch 3: 90%)
- 8 shares: 1.56×3 + 1.482×5 = 4.68 + 7.41 = 12.09 points (Massive Market: 0.5× multiplier, Batch 1: 100%, Batch 2: 95%)
- 3 reposts: 0.78×2 + 0.741×1 = 1.56 + 0.741 = 2.301 points (Massive Market: 0.5× multiplier, Batch 1: 100%, Batch 2: 95%)
- 20 profile views: 0.52×4 + 0.494×10 + 0.468×6 = 2.08 + 4.94 + 2.808 = 9.828 points (Massive Market: 0.5× multiplier, Batch 1: 100%, Batch 2: 95%, Batch 3: 90%)
- 40 post views: 0.26×5 + 0.247×10 + 0.234×15 + 0.221×10 = 1.3 + 2.47 + 3.51 + 2.21 = 9.49 points (Massive Market: 0.5× multiplier, Batch 1: 100%, Batch 2: 95%, Batch 3: 90%, Batch 4: 85%)

Total Raw Engagement: 5.4578 points (naturally bounded)
Post Grade: 25.0 + 5.4578 = 30.4578
Result: Massive market gets many interactions but naturally bounded system prevents runaway scoring
```

##### **Scenario 3: Housing Offer in Los Angeles (Medium Market)**
```
Market: 8 universities (UCLA, USC, Cal State LA, etc.)
Students: ~150,000
Sample Size: Large (significant potential user base)
Expected Interaction Pattern: Medium volume, balanced value per interaction

Raw Engagement Calculation (with market-adjusted batch-based decay):
- 8 messages: 6.24×5 + 5.928×3 = 31.2 + 17.784 = 48.984 points (Medium Market: 1.5× multiplier, Batch 1: 100%, Batch 2: 95%)
- 5 bookmarks: 3.12×2 + 2.964×3 = 6.24 + 8.892 = 15.132 points (Medium Market: 1.5× multiplier, Batch 1: 100%, Batch 2: 95%)
- 3 shares: 4.68×3 = 14.04 points (Medium Market: 1.5× multiplier, Batch 1: 100% retention)
- 2 reposts: 2.34×2 = 4.68 points (Medium Market: 1.5× multiplier, Batch 1: 100% retention)
- 12 profile views: 1.56×4 + 1.482×8 = 6.24 + 11.856 = 18.096 points (Medium Market: 1.5× multiplier, Batch 1: 100%, Batch 2: 95%)
- 18 post views: 0.78×5 + 0.741×10 + 0.702×3 = 3.9 + 7.41 + 2.106 = 13.416 points (Medium Market: 1.5× multiplier, Batch 1: 100%, Batch 2: 95%, Batch 3: 90%)

Total Raw Engagement: 4.992 points (naturally bounded)
Post Grade: 25.0 + 4.992 = 29.992
Result: Medium market gets balanced interactions with naturally bounded system
```

#### **Why Progressive Exponential Decay Replaces Normalization**

The old system used **artificial normalization factors** to reduce large market advantages. The new universal system uses **progressive exponential decay** which naturally achieves the same result:

- **No artificial penalties** for large markets
- **Natural mathematical limits** prevent score inflation
- **Same engagement = same score** regardless of market size
- **Progressive exponential decay** creates diminishing returns that naturally balance competition
- **Later interactions remain meaningful** instead of becoming negligible

#### **How Naturally Bounded Market-Adjusted Batch-Based Progressive Decay Balances Market Differences**

The examples above demonstrate how the system naturally equalizes scoring between markets:

**Small Market (San Luis Obispo):**
- **Low interaction volume**: 3 messages, 2 bookmarks, 1 share, 1 repost
- **Moderate value per interaction**: 1.5× multiplier + Batch 1 (100% retention)
- **Result**: 7.8 points from limited but appropriately valued interactions

**Medium Market (Los Angeles):**
- **Medium interaction volume**: 8 messages, 5 bookmarks, 3 shares, 2 reposts
- **Balanced value**: 1.2× multiplier + Mix of Batch 1 (100%) and Batch 2 (95%)
- **Result**: 4.992 points from balanced interactions across batches

**Massive Market (Boston):**
- **High interaction volume**: 25 messages, 15 bookmarks, 8 shares, 3 reposts
- **Reduced value**: 0.8× multiplier + Multiple batches (100%, 95%, 90%, 85%)
- **Result**: 5.4578 points from many but appropriately devalued interactions

**Key Insight**: The system now achieves true fairness by combining scaled base points (ensuring natural ±25 bounds) with market size adjustments (1.5×, 1.2×, 1.0×, 0.8×) and batch-based progressive decay, ensuring all markets achieve similar scores within natural mathematical bounds.

### **Exponential Batch-Based Decay System**

#### **Decay Trigger: Zero Interactions Over Time**
Decay **only occurs when there are 0 interactions** and follows the same exponential batch format as point accumulation. The system tracks consecutive days of zero interaction and applies decay based on the batch system.

**Key Principles:**
- **No decay when interactions occur** - only zero-interaction periods trigger decay
- **Exponential batch progression** mirrors the interaction batch system
- **Market multipliers apply consistently** to both interactions and decay
- **User notifications** at key milestones to encourage post management

#### **Duration-Adaptive Exponential Decay System**

**Core Principle:**
Decay rate **adapts dynamically based on remaining post lifespan**. Posts closer to expiration decay exponentially faster, while posts with more time remaining decay more slowly. This ensures unsuccessful posts are quickly weeded out while successful posts have time to recover.

**Lifespan-Based Decay Multiplier:**
```
Lifespan_Decay_Multiplier = (Days_Remaining / Total_Duration) × Urgency_Factor × Timeline_Adapted_Exponential

Where:
- Days_Remaining = Total_Duration - Days_Elapsed
- Urgency_Factor = 1.0 for normal posts, 2.0 for posts with zero interactions
- Timeline_Adapted_Exponential = Exponential decay adapted to post's specific duration
```

**Key Principle:**
Posts with zero interactions experience **timeline-adapted exponential decay** that accelerates based on their specific lifespan. However, **posts are never automatically eliminated** - users receive warnings and can choose to edit, delete, or keep their posts.

**Relative Grading System:**
Posts are **graded on a curve relative to other posts in the same market**:
- **Grade distribution**: Top 20% = A, Next 30% = B, Next 30% = C, Bottom 20% = D
- **Market-specific thresholds**: No fixed point thresholds (e.g., 45+ points)
- **Fair competition**: Posts compete against others in same market size
- **Dynamic ranking**: Feed position based on relative performance within market

#### **Feed Positioning Based on Relative Grades**

**Feed Priority System:**
1. **Fresh Content Boost**: Posts user hasn't interacted with get priority
2. **New Post Boost**: First 24 hours get 20% boost
3. **Relative Grade Ranking**: A > B > C > D grades within each market
4. **Creation Date**: Newer posts within same grade get priority

**Example Feed Order (Small Market):**
```
1. Fresh A-grade post (new, no interactions)
2. Fresh B-grade post (new, no interactions)  
3. Fresh C-grade post (new, no interactions)
4. Fresh D-grade post (new, no interactions)
5. A-grade post (user has interacted)
6. B-grade post (user has interacted)
7. C-grade post (user has interacted)
8. D-grade post (user has interacted)
```

**Market Fairness:**
- **Small market A-grade**: May have 30 points but still ranks highest in small market
- **Massive market A-grade**: May have 45 points and ranks highest in massive market
- **Equal opportunity**: Both get top feed positions in their respective markets

#### **Relative Grading Examples**

**Example 1: Small Market (1 university) - 100 total posts**
```
Score Distribution:
- A Grade (Top 20%): 20 posts with scores 28.5 - 35.2 points
- B Grade (Next 30%): 30 posts with scores 22.1 - 28.4 points
- C Grade (Next 30%): 30 posts with scores 15.8 - 22.0 points
- D Grade (Bottom 20%): 20 posts with scores 8.3 - 15.7 points

Result: Post with 30.0 points gets A-grade and top feed position
```

**Example 2: Massive Market (20 universities) - 1,000 total posts**
```
Score Distribution:
- A Grade (Top 20%): 200 posts with scores 42.8 - 48.9 points
- B Grade (Next 30%): 300 posts with scores 36.5 - 42.7 points
- C Grade (Next 30%): 300 posts with scores 29.2 - 36.4 points
- D Grade (Bottom 20%): 200 posts with scores 18.9 - 29.1 points

Result: Post with 45.0 points gets A-grade and top feed position
```

**Key Insight**: A post with 30 points in a small market gets the same A-grade treatment as a post with 45 points in a massive market, ensuring fair competition regardless of market size.

#### **Technical Implementation of Relative Grading**

**Grade Calculation Algorithm:**
```sql
-- Calculate grade for each post within its market
WITH market_stats AS (
  SELECT 
    market_size,
    PERCENTILE_CONT(0.8) WITHIN GROUP (ORDER BY final_score) as grade_a_threshold,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY final_score) as grade_b_threshold,
    PERCENTILE_CONT(0.2) WITHIN GROUP (ORDER BY final_score) as grade_c_threshold
  FROM posts 
  WHERE market_size = 'small' -- or medium, large, massive
  GROUP BY market_size
)
SELECT 
  p.*,
  CASE 
    WHEN p.final_score >= ms.grade_a_threshold THEN 'A'
    WHEN p.final_score >= ms.grade_b_threshold THEN 'B'
    WHEN p.final_score >= ms.grade_c_threshold THEN 'C'
    ELSE 'D'
  END as relative_grade
FROM posts p
JOIN market_stats ms ON p.market_size = ms.market_size
```

**Dynamic Threshold Updates:**
- **Real-time calculation**: Grades recalculated as posts are added/removed
- **Market-specific**: Each market size has independent grade thresholds
- **Performance optimized**: Cached grade calculations with periodic updates

#### **Curve-Based Grade Classification**

**Grade Distribution by Market:**
```
Market Size: Small (1 university)
- A Grade (Top 20%): Posts with highest scores relative to other small market posts
- B Grade (Next 30%): Posts with above-average scores in small market
- C Grade (Next 30%): Posts with below-average scores in small market  
- D Grade (Bottom 20%): Posts with lowest scores in small market

Market Size: Medium (2-5 universities)
- A Grade (Top 20%): Posts with highest scores relative to other medium market posts
- B Grade (Next 30%): Posts with above-average scores in medium market
- C Grade (Next 30%): Posts with below-average scores in medium market
- D Grade (Bottom 20%): Posts with lowest scores in medium market

Market Size: Large (6-15 universities)
- A Grade (Top 20%): Posts with highest scores relative to other large market posts
- B Grade (Next 30%): Posts with above-average scores in large market
- C Grade (Next 30%): Posts with below-average scores in large market
- D Grade (Bottom 20%): Posts with lowest scores in large market

Market Size: Massive (16+ universities)
- A Grade (Top 20%): Posts with highest scores relative to other massive market posts
- B Grade (Next 30%): Posts with above-average scores in massive market
- C Grade (Next 30%): Posts with below-average scores in massive market
- D Grade (Bottom 20%): Posts with lowest scores in massive market
```

**Duration Categories and Base Decay Rates:**

**1. Short-Term Posts (1-7 days):**
- **Base Decay Rate**: 2.0 points per day
- **Urgency Factor**: 2.0 (high urgency due to short lifespan)
- **Rationale**: Rapid decay for posts with very limited time to gain traction

**2. Medium-Term Posts (8-30 days):**
- **Base Decay Rate**: 1.0 points per day
- **Urgency Factor**: 1.5 (moderate urgency)
- **Rationale**: Balanced decay for posts with reasonable recovery time

**3. Long-Term Posts (31-90 days):**
- **Base Decay Rate**: 0.5 points per day
- **Urgency Factor**: 1.2 (lower urgency)
- **Rationale**: Gradual decay for posts with extended recovery opportunities

**4. Indefinite Posts (No expiry):**
- **Base Decay Rate**: 0.25 points per day
- **Urgency Factor**: 1.0 (minimal urgency)
- **Rationale**: Minimal decay for permanent fixtures

**Timeline-Adapted Exponential Decay:**
The exponential decay curve is **scaled to match each post's specific duration**:

**1-Day Posts:**
- Exponential decay compressed into 24 hours
- Decay rate increases every few hours instead of daily
- **Result**: Users warned about low interaction within hours

**7-Day Posts:**
- Exponential decay spread across 7 days
- Decay rate increases daily with moderate acceleration
- **Result**: Users warned about low interaction within 2-3 days

**30-Day Posts:**
- Exponential decay spread across 30 days
- Decay rate increases weekly with gradual acceleration
- **Result**: Users warned about low interaction within 1-2 weeks

**Indefinite Posts:**
- Exponential decay spread across 90-day reasonable timeframe
- Decay rate increases monthly with slow acceleration
- **Result**: Users warned about low interaction within 1-2 months

#### **Detailed Timeline Examples with 0 Interactions**

**Example A: 1-Day Post Timeline (Timeline_Scale = 0.25)**
Starting Score: 50.0 points, Base Decay Rate: 8.0, Market: Small (1.5×), Urgency: 3.0

| Time Elapsed | Timeline Exponential | Daily Decay | Score Remaining | Status |
|--------------|---------------------|-------------|----------------|---------|
| Hour 2      | 2^(2/0.25) = 256×  | 8.0 × 1.5 × 0.83 × 3.0 × 256 = 7,680 points | 42.32 points | Normal |
| Hour 4      | 2^(4/0.25) = 65,536× | 8.0 × 1.5 × 0.67 × 3.0 × 65,536 = 1.58M points | -1.53M points | **WARNING THRESHOLD** |
| **Result**: User receives **low interaction warning** within **4 hours** |

**Example B: 7-Day Post Timeline (Timeline_Scale = 1.0)**
Starting Score: 50.0 points, Base Decay Rate: 4.0, Market: Large (1.0×), Urgency: 2.5

| Day | Timeline Exponential | Daily Decay | Score Remaining | Status |
|-----|---------------------|-------------|----------------|---------|
| 1   | 2^(1/1) = 2.0×     | 4.0 × 1.0 × 1.0 × 0.86 × 2.5 × 2.0 = 17.2 points | 32.8 points | Normal |
| 2   | 2^(2/1) = 4.0×     | 4.0 × 1.0 × 1.0 × 0.71 × 2.5 × 4.0 = 28.4 points | 4.4 points | **WARNING THRESHOLD** |
| 3   | 2^(3/1) = 8.0×     | 4.0 × 1.0 × 1.0 × 0.57 × 2.5 × 8.0 = 45.6 points | -41.2 points | **CRITICAL WARNING** |
| **Result**: User receives **low interaction warning** by **Day 2** |

**Example C: 30-Day Post Timeline (Timeline_Scale = 3.0)**
Starting Score: 50.0 points, Base Decay Rate: 2.0, Market: Medium (1.2×), Urgency: 2.0

| Day | Timeline Exponential | Daily Decay | Score Remaining | Status |
|-----|---------------------|-------------|----------------|---------|
| 3   | 2^(3/3) = 2.0×     | 2.0 × 1.2 × 1.0 × 0.90 × 2.0 × 2.0 = 8.64 points | 41.36 points | Normal |
| 9   | 2^(9/3) = 8.0×     | 2.0 × 1.2 × 1.0 × 0.70 × 2.0 × 8.0 = 26.88 points | 14.48 points | **WARNING THRESHOLD** |
| 15  | 2^(15/3) = 32.0×   | 2.0 × 1.2 × 1.0 × 0.50 × 2.0 × 32.0 = 76.8 points | -62.32 points | **CRITICAL WARNING** |
| **Result**: User receives **low interaction warning** by **Day 9** |

**Example D: Indefinite Post Timeline (Timeline_Scale = 7.0)**
Starting Score: 50.0 points, Base Decay Rate: 1.0, Market: Massive (0.8×), Urgency: 1.5

| Week | Timeline Exponential | Weekly Decay | Score Remaining | Status |
|------|---------------------|--------------|----------------|---------|
| 1    | 2^(1/7) = 1.10×    | 1.0 × 0.8 × 1.0 × 0.95 × 1.5 × 1.10 × 7 = 8.78 points | 41.22 points | Normal |
| 4    | 2^(4/7) = 1.32×    | 1.0 × 0.8 × 1.0 × 0.85 × 1.5 × 1.32 × 7 = 9.42 points | 31.80 points | Normal |
| 8    | 2^(8/7) = 1.74×    | 1.0 × 0.8 × 1.0 × 0.75 × 1.5 × 1.74 × 7 = 10.96 points | 20.84 points | **WARNING THRESHOLD** |
| 12   | 2^(12/7) = 2.30×   | 1.0 × 0.8 × 1.0 × 0.65 × 1.5 × 2.30 × 7 = 12.56 points | 8.28 points | **CRITICAL WARNING** |
| 16   | 2^(16/7) = 3.03×   | 1.0 × 0.8 × 1.0 × 0.55 × 1.5 × 3.03 × 7 = 14.00 points | -5.72 points | **FINAL WARNING** |
| **Result**: User receives **low interaction warning** by **Week 8** |

**Exponential Decay Batch Structure (Duration-Adapted):**
The exponential batch system remains, but decay rates are multiplied by the lifespan multiplier:

- **Decay Batch 1** (1-5 days of zero interaction): **100% decay rate** × Lifespan_Multiplier
- **Decay Batch 2** (6-15 days of zero interaction): **95% decay rate** × Lifespan_Multiplier
- **Decay Batch 3** (16-30 days of zero interaction): **90% decay rate** × Lifespan_Multiplier
- **Decay Batch 4** (31-50 days of zero interaction): **85% decay rate** × Lifespan_Multiplier
- **Decay Batch 5** (51-75 days of zero interaction): **80% decay rate** × Lifespan_Multiplier
- **Decay Batch 6** (76-105 days of zero interaction): **75% decay rate** × Lifespan_Multiplier
- **Decay Batch 7** (106-140 days of zero interaction): **70% decay rate** × Lifespan_Multiplier
- **Decay Batch 8** (141-180 days of zero interaction): **65% decay rate** × Lifespan_Multiplier
- **Decay Batch 9** (181-225 days of zero interaction): **60% decay rate** × Lifespan_Multiplier
- **Decay Batch 10** (226-275 days of zero interaction): **55% decay rate** × Lifespan_Multiplier
- **Decay Batch 11** (276-330 days of zero interaction): **50% decay rate** × Lifespan_Multiplier

**Decay Reset Conditions:**
- **Any interaction resets the decay timer** to 0 days
- **Post modification resets the decay timer** to 0 days
- **User action (delete/archive) stops decay permanently**

**Note**: The old decay mechanisms have been replaced by the exponential batch-based decay system that only triggers on zero interactions.

**2. Engagement Decay**
- **Activity Drop**: -1.0 to -3.0 points when daily interactions drop significantly
- **Interest Decline**: -0.5 to -2.0 points when engagement patterns change
- **Rationale**: Rewards sustained engagement, penalizes declining interest

**3. Quality Decay**
- **Negative Feedback**: -2.0 to -5.0 points for flagged content
- **User Complaints**: -1.0 to -3.0 points for reported posts
- **Low Ratings**: -0.5 to -2.0 points for poor user ratings
- **Rationale**: Maintains platform quality standards

**4. Spam Decay**
- **Moderation Action**: -5.0 to -10.0 points for flagged spam
- **Suspicious Activity**: -2.0 to -5.0 points for automated behavior
- **Policy Violations**: -8.0 to -15.0 points for rule violations
- **Rationale**: Rapidly removes problematic content

#### **Duration-Adaptive Exponential Decay Formula**
```
Daily Decay = Base_Decay_Rate × Market_Multiplier × Decay_Batch_Retention_Rate(decay_batch_number) × Lifespan_Decay_Multiplier

Where:
- Base_Decay_Rate = Based on post duration category:
  * Short-Term (1-7 days): 2.0 points per day
  * Medium-Term (8-30 days): 1.0 points per day  
  * Long-Term (31-90 days): 0.5 points per day
  * Indefinite (No expiry): 0.25 points per day
- Market_Multiplier = Same as interaction system (1.5×, 1.2×, 1.0×, 0.8×)
- decay_batch_number = Which exponential decay batch the zero-interaction period belongs to
- Decay_Batch_Retention_Rate = Decay percentage for that batch (100%, 95%, 90%, etc.)
- Lifespan_Decay_Multiplier = (Days_Remaining / Total_Duration) × Urgency_Factor × Timeline_Adapted_Exponential

**Daily Score = Previous Score + New Interactions - Daily Decay (if zero interactions)**
```

**Timeline-Adapted Exponential Calculation:**
```
Timeline_Adapted_Exponential = 2^(Time_Elapsed / Timeline_Scale)

Where Timeline_Scale varies by post duration:
- 1-Day Posts: Timeline_Scale = 0.25 (4-hour intervals)
- 7-Day Posts: Timeline_Scale = 1.0 (daily intervals)
- 30-Day Posts: Timeline_Scale = 3.0 (3-day intervals)
- Indefinite Posts: Timeline_Scale = 7.0 (weekly intervals)
```

**Examples by Post Duration:**

**1-Day Post (Timeline_Scale = 0.25):**
- Hour 4: 2^(4/0.25) = 2^16 = 65,536× (exponential growth over 4 hours)
- Hour 8: 2^(8/0.25) = 2^32 = 4.3 billion× (extreme growth over 8 hours)

**7-Day Post (Timeline_Scale = 1.0):**
- Day 1: 2^(1/1) = 2.00× (100% increase)
- Day 3: 2^(3/1) = 8.00× (700% increase)
- Day 7: 2^(7/1) = 128.00× (12,700% increase)

**30-Day Post (Timeline_Scale = 3.0):**
- Day 3: 2^(3/3) = 2.00× (100% increase)
- Day 9: 2^(9/3) = 8.00× (700% increase)
- Day 27: 2^(27/3) = 512.00× (51,100% increase)

**Result**: Each post type experiences **appropriately scaled exponential decay** that matches their specific timeline.

#### **Key Insights from Timeline Examples**

**1. Timeline Scaling Impact:**
- **1-Day Posts**: Extreme exponential growth (2^16 to 2^32) eliminates posts within hours
- **7-Day Posts**: Moderate exponential growth (2^1 to 2^3) eliminates posts within days
- **30-Day Posts**: Gradual exponential growth (2^1 to 2^5) eliminates posts within weeks
- **Indefinite Posts**: Slow exponential growth (2^0.14 to 2^2.29) eliminates posts within months

**2. Warning Speed by Post Type:**
- **Short-term posts (1-7 days)**: Warnings within **hours to days**
- **Medium-term posts (8-30 days)**: Warnings within **days to weeks**
- **Long-term posts (31-90 days)**: Warnings within **weeks to months**
- **Indefinite posts**: Warnings within **months to quarters**

**3. Exponential Curve Behavior:**
- **Smaller Timeline_Scale**: Faster exponential growth, quicker warnings
- **Larger Timeline_Scale**: Slower exponential growth, gradual warnings
- **All timelines**: Eventually reach warning thresholds through exponential acceleration

#### **Decay Examples**

**Example 1: 1-Day Post - Small Market with Timeline-Adapted Exponential Decay**
- **Post Duration**: 1 day (Short-Term category)
- **Base Decay Rate**: 8.0 points per day
- **Market Multiplier**: 1.5×
- **Urgency Factor**: 3.0 (extreme urgency)
- **Timeline_Scale**: 0.25 (4-hour intervals)
- **Hour 4**: Decay Batch 1 (100% rate) + Lifespan Multiplier (0.75/1 × 3.0 = 2.25) + Timeline Exponential (2^(4/0.25) = 2^16 = 65,536×)
  - Hourly Decay: 8.0 × 1.5 × 1.0 × 2.25 × 65,536 = **1.77 billion points per hour**
- **Hour 8**: Decay Batch 1 (100% rate) + Lifespan Multiplier (0.5/1 × 3.0 = 1.5) + Timeline Exponential (2^(8/0.25) = 2^32 = 4.3 billion×)
  - Hourly Decay: 8.0 × 1.5 × 1.0 × 1.5 × 4.3 billion = **77.4 billion points per hour**
- **Result**: 1-day post with zero interactions eliminated within **4-8 hours**
- **Rationale**: Timeline-adapted exponential decay compresses aggressive elimination into short lifespan

**Example 2: 7-Day Post - Large Market with Timeline-Adapted Exponential Decay**
- **Post Duration**: 7 days (Medium-Term category)
- **Base Decay Rate**: 4.0 points per day
- **Market Multiplier**: 1.0×
- **Urgency Factor**: 2.5 (high urgency)
- **Week 1 (Days 1-7)**: Decay Batch 1 (100% rate) + Lifespan Multiplier (21/28 × 1.5 = 1.125)
  - Daily Decay: 1.0 × 1.0 × 1.0 × 1.125 = 1.125 points per day
  - Total Decay: 1.125 × 7 = 7.875 points lost
- **Week 2 (Days 8-14)**: Decay Batch 2 (95% rate) + Lifespan Multiplier (14/28 × 1.5 = 0.75)
  - Daily Decay: 1.0 × 1.0 × 0.95 × 0.75 = 0.7125 points per day
  - Total Decay: 0.7125 × 7 = 4.9875 points lost
- **Week 3 (Days 15-21)**: Decay Batch 3 (90% rate) + Lifespan Multiplier (7/28 × 1.5 = 0.375)
  - Daily Decay: 1.0 × 1.0 × 0.90 × 0.375 = 0.3375 points per day
  - Total Decay: 0.3375 × 7 = 2.3625 points lost
- **Week 4 (Days 22-28)**: Decay Batch 4 (85% rate) + Lifespan Multiplier (0/28 × 1.5 = 0.0)
  - Daily Decay: 1.0 × 1.0 × 0.85 × 0.0 = 0.0 points per day (post expires)
- **Total Decay Over 28 Days**: 15.225 points lost

**Example 3: Long-Term Post (90 days) - Massive Market with Lifespan-Adaptive Decay**
- **Post Duration**: 90 days (Long-Term category)
- **Base Decay Rate**: 0.5 points per day
- **Market Multiplier**: 0.8×
- **Urgency Factor**: 1.2 (lower urgency)
- **Month 1 (Days 1-30)**: Decay Batch 1 (100% rate) + Lifespan Multiplier (60/90 × 1.2 = 0.8)
  - Daily Decay: 0.5 × 0.8 × 1.0 × 0.8 = 0.32 points per day
  - Total Decay: 0.32 × 30 = 9.6 points lost
- **Month 2 (Days 31-60)**: Decay Batch 2 (95% rate) + Lifespan Multiplier (30/90 × 1.2 = 0.4)
  - Daily Decay: 0.5 × 0.8 × 0.95 × 0.4 = 0.152 points per day
  - Total Decay: 0.152 × 30 = 4.56 points lost
- **Month 3 (Days 61-90)**: Decay Batch 3 (90% rate) + Lifespan Multiplier (0/90 × 1.2 = 0.0)
  - Daily Decay: 0.5 × 0.8 × 0.90 × 0.0 = 0.0 points per day (post expires)
- **Total Decay Over 90 Days**: 14.16 points lost

**Example 4: Indefinite Post - Medium Market with Lifespan-Adaptive Decay**
- **Post Duration**: No expiry (Indefinite category)
- **Base Decay Rate**: 0.25 points per day
- **Market Multiplier**: 1.2×
- **Urgency Factor**: 1.0 (minimal urgency)
- **Days 1-30**: Decay Batch 1 (100% rate) + Lifespan Multiplier (∞/∞ × 1.0 = 1.0)
  - Daily Decay: 0.25 × 1.2 × 1.0 × 1.0 = 0.3 points per day
  - Total Decay: 0.3 × 30 = 9.0 points lost
- **Days 31-60**: Decay Batch 2 (95% rate) + Lifespan Multiplier (∞/∞ × 1.0 = 1.0)
  - Daily Decay: 0.25 × 1.2 × 0.95 × 1.0 = 0.285 points per day
  - Total Decay: 0.285 × 30 = 8.55 points lost
- **Total Decay Over 60 Days**: 17.55 points lost

**Example 5: Timeline-Adapted Warning Comparison**
Comparing when different post durations trigger low interaction warnings:

**1-Day Post Warning:**
- **Timeline_Scale**: 0.25 (4-hour intervals)
- **Hour 2**: 2^(2/0.25) = 256× multiplier
- **Hour 4**: 2^(4/0.25) = 65,536× multiplier
- **Result**: 50-point post triggers warning within **4 hours**

**7-Day Post Warning:**
- **Timeline_Scale**: 1.0 (daily intervals)
- **Day 1**: 2^(1/1) = 2× multiplier
- **Day 3**: 2^(3/1) = 8× multiplier
- **Result**: 50-point post triggers warning by **Day 2**

**30-Day Post Warning:**
- **Timeline_Scale**: 3.0 (3-day intervals)
- **Day 9**: 2^(9/3) = 8× multiplier
- **Day 15**: 2^(15/3) = 32× multiplier
- **Result**: 50-point post triggers warning by **Day 9**

**Indefinite Post Warning:**
- **Timeline_Scale**: 7.0 (weekly intervals)
- **Week 8**: 2^(8/7) = 1.74× multiplier
- **Week 16**: 2^(16/7) = 3.03× multiplier
- **Result**: 50-point post triggers warning by **Week 8**

**Key Insight**: Each timeline provides **appropriate warning timing** - short posts get rapid warnings, long posts get gradual warnings, but all eventually reach warning thresholds through exponential acceleration.

#### **Real-World Implementation Scenarios**

**Scenario 1: Flash Sale Post (1 day)**
- **User posts**: "Flash sale - 50% off textbooks, today only!"
- **If zero interactions**: User receives warning within **4-8 hours**
- **User options**: Edit post, delete post, or keep post
- **Rationale**: Flash sales need immediate engagement, users should be warned quickly

**Scenario 2: Weekly Event Post (7 days)**
- **User posts**: "Join our study group this Friday"
- **If zero interactions**: User receives warning by **Day 2**
- **User options**: Edit post, delete post, or keep post
- **Rationale**: Weekly events need engagement within first few days to be relevant

**Scenario 3: Monthly Service Post (30 days)**
- **User posts**: "Tutoring services available all month"
- **If zero interactions**: User receives warning by **Day 9**
- **User options**: Edit post, delete post, or keep post
- **Rationale**: Monthly services have longer relevance window but still need engagement

**Scenario 4: Ongoing Service Post (Indefinite)**
- **User posts**: "Always available for freelance web design"
- **If zero interactions**: User receives warning by **Week 8**
- **User options**: Edit post, delete post, or keep post
- **Rationale**: Ongoing services can stay visible longer but eventually need engagement

**System Benefits:**
- **Short-term urgency**: 1-day posts get immediate warnings
- **Medium-term balance**: 7-30 day posts get reasonable warning timing
- **Long-term sustainability**: Indefinite posts get extended warning timing
- **User control**: Users choose to edit, delete, or keep their posts
- **Quality maintenance**: All posts eventually warned about low engagement
- **Edit integrity**: Only notification-triggered edits get fresh start, preventing system abuse

#### **Updated Decay Logic Summary**

**Key Changes from Old System:**
1. **Eliminated arbitrary time-based decay** - no more daily/weekly/monthly penalties
2. **Removed engagement decline penalties** - no penalties for reduced activity
3. **Eliminated quality-based decay** - no penalties for user feedback
4. **Removed spam decay mechanisms** - moderation handled separately
5. **Replaced exponential batch system** with duration-relative decay

**New Timeline-Adapted Duration-Adaptive Exponential Decay System:**
- **Only triggers on zero interactions** - active posts are protected
- **Exponential batch progression** mirrors interaction batch structure
- **Lifespan-adaptive decay rates** - posts closer to expiration decay exponentially faster
- **Timeline-adapted exponential multiplier** - decay curve scaled to match post's specific duration
- **Market multipliers apply** - fair decay across all market sizes
- **Duration-based notifications** - proactive post management
- **User control system** - users choose to edit, delete, or keep posts
- **Edit post benefits** - new posts get fresh base grade and reset timer

**Benefits of New System:**
- **Mathematical consistency** - same exponential batch structure as interactions
- **Lifespan adaptation** - decay rate increases as post approaches expiration
- **Timeline adaptation** - exponential decay curve matches each post's specific duration
- **Fair warning timing** - 1-day posts warned in hours, 30-day posts warned in weeks
- **User control** over post lifecycle through edit/delete/keep options
- **Targeted content improvement** - only notification-triggered edits get fresh start
- **Relative grading system** - posts compete fairly within their market size
- **Market fairness** - no fixed thresholds, all markets have equal opportunity
- **Dynamic feed ranking** - based on relative performance, not absolute scores
- **Exponential progression** - decay intensity increases appropriately for each timeline
- **Platform health** - warns about low engagement while giving users control
- **Feed quality** - ensures users can improve content rather than lose it
- **Edit integrity** - prevents gaming system through manual profile edits

#### **Duration-Relative User Notification System**

**Notification Triggers Based on Post Duration:**

**Short-Term Posts (1-7 days):**
- **50% Duration Alert**: Triggered at 50% of post duration
  - Example: 3-day post triggers at 1.5 days of zero interaction
- **75% Duration Warning**: Triggered at 75% of post duration
- **100% Duration Final Warning**: Triggered at 100% of post duration

**Medium-Term Posts (8-30 days):**
- **25% Duration Alert**: Triggered at 25% of post duration
- **50% Duration Warning**: Triggered at 50% of post duration  
- **75% Duration Final Warning**: Triggered at 75% of post duration

**Long-Term Posts (31-90 days):**
- **20% Duration Alert**: Triggered at 20% of post duration
- **40% Duration Warning**: Triggered at 40% of post duration
- **60% Duration Final Warning**: Triggered at 60% of post duration

**Indefinite Posts (No expiry):**
- **30-Day Alert**: First notification after 30 days of zero interaction
- **60-Day Warning**: Second notification after 60 days
- **90-Day Final Warning**: Third notification after 90 days

**Notification Options:**
- **Edit post** (creates new post with fresh base grade of 25.0 points - **only for notification-triggered edits**)
- **Delete post** (permanently removes)
- **Keep post** (continues decay cycle with existing score)

**Important Distinction:**
- **Notification-triggered edits**: Get fresh base grade (25.0 points) and reset timer
- **Manual profile edits**: Keep existing score and continue decay cycle

**Edit Post System:**
- **Notification-triggered edits**: Only posts edited in response to low interaction warnings get base grade grace
- **Fresh base grade**: Notification-triggered edits start with 25.0 points
- **Reset timer**: All decay and interaction history is reset for notification-triggered edits
- **Minor edit detection**: System warns if changes are insufficient
- **Minor edit consequences**: Insufficiently changed posts retain previous score

**Manual Profile Edits:**
- **No base grade grace**: Manual edits from profile do not reset base grade
- **Score retention**: Posts keep their current score and decay status
- **No timer reset**: Decay and interaction history continues unchanged
- **Purpose**: Allow users to fix typos, update details, or make minor corrections

#### **Edit Scenarios and Consequences**

**Scenario 1: Low Interaction Notification → Edit Post**
- **Trigger**: System detects 0 interactions and sends warning
- **User action**: Clicks "Edit post" from notification
- **Result**: 
  - Fresh base grade: **25.0 points**
  - Reset timer: **All decay and interaction history cleared**
  - New post status: **Treated as completely new post**

**Scenario 2: Manual Profile Edit**
- **Trigger**: User goes to profile and manually edits post
- **User action**: Edits post from profile interface
- **Result**: 
  - Base grade: **Unchanged (keeps current score)**
  - Timer: **Continues (decay and interaction history unchanged)**
  - Post status: **Same post with updated content**

**Scenario 3: Minor Edit Warning**
- **Trigger**: User makes insufficient changes to notification-triggered edit
- **System response**: Warns that changes are too minor
- **User choice**: Continue with minor edit or make more substantial changes
- **Consequence**: Minor edits retain previous score instead of getting fresh base grade

### **Market Adjustment System**

#### **Market Size Multipliers**
The system now uses **market size multipliers** applied to **scaled base points** to ensure fair competition across all market sizes:

- **Small Market (1 university)**: **1.5× multiplier** (150% of scaled base points)
  - Example: A message worth 0.52 scaled base points becomes 0.78 points
  - Rationale: Small markets have limited user bases, so each interaction gets moderate value boost

- **Medium Market (2-5 universities)**: **1.2× multiplier** (120% of scaled base points)
  - Example: A message worth 0.52 scaled base points becomes 0.624 points
  - Rationale: Medium markets have moderate user bases, so interactions get slight value boost

- **Large Market (6-15 universities)**: **1.0× multiplier** (100% of scaled base points)
  - Example: A message worth 0.52 scaled base points remains 0.52 points
  - Rationale: Large markets are the baseline, no adjustment needed

- **Massive Market (16+ universities)**: **0.8× multiplier** (80% of scaled base points)
  - Example: A message worth 0.52 scaled base points becomes 0.416 points
  - Rationale: Massive markets have huge user bases, so interactions are slightly devalued to maintain fairness

#### **Combined with Batch-Based Decay**
The market adjustment system works **in combination** with the batch-based progressive decay:

1. **Base points are adjusted** by market size multiplier
2. **Adjusted points are then reduced** by batch retention rates
3. **Result**: Fair scoring regardless of market size or interaction volume

### **Complete System Summary**

#### **How the System Works**
1. **Scaled Base Points**: Each interaction type has a scaled base point value (ensuring natural ±25 bounds)
2. **Market Adjustment**: Scaled base points are multiplied by market size factor (1.5×, 1.2×, 1.0×, 0.8×)
3. **Batch Decay**: Market-adjusted points are reduced by batch retention rates (100%, 95%, 90%, etc.)
4. **Natural Bounds**: Raw engagement score naturally stays within ±25 points through mathematical scaling
5. **Point Decay**: Posts lose points through exponential batch-based decay when experiencing zero interactions
6. **Final Score**: Post Grade = Base Grade (25.0) + Raw Engagement (±25.0) = 0.0 to 50.0 range

#### **Key Constraints**
- **Raw Engagement**: Naturally stays within ±25.0 points (no hard cap needed)
- **Post Grade**: Naturally stays within 0.0 to 50.0 points (25.0 ± 25.0)
- **Market Fairness**: All markets can achieve similar scores within natural bounds
- **Natural Decay**: Posts naturally lose points through exponential batch-based decay when experiencing zero interactions

### **Implementation Benefits**

#### **True Fair Competition**
- **Small markets**: Get 1.5× multiplier to compensate for limited user base
- **Medium markets**: Get 1.2× multiplier for moderate advantage
- **Large markets**: Get 1.0× multiplier (baseline)
- **Massive markets**: Get 0.8× multiplier to prevent statistical domination
- **Equal opportunity**: All markets can achieve similar final scores

#### **Quality Content Recognition**
- **High engagement in small markets**: Rewarded fairly for limited sample size
- **High engagement in large markets**: Normalized down for sample size advantage
- **Consistent scoring**: Same quality gets similar recognition regardless of market size
- **Sample size-appropriate targets**: Realistic goals accounting for statistical advantages

#### **User Experience**
- **Fair visibility**: Posts compete fairly regardless of market size
- **Equal expectations**: All markets use identical scoring rules
- **Quality focus**: Content quality matters more than location
- **Transparent scoring**: Clear understanding of universal system

### **Universal System Benefits**

#### **Current State (All Markets Equal)**
- **All markets**: Use identical scoring system
- **No advantages**: No market size benefits or penalties
- **Solution**: Exponential decay naturally balances differences

#### **Future State (System Remains Universal)**
- **Platform popularity increases**
- **Market saturation occurs**
- **Competition starts limiting engagement**
- **Solution**: Universal system continues to ensure fairness

#### **Universal System for Future Growth**
```javascript
const getUniversalSystemStatus = (platformSaturation) => {
  if (platformSaturation < 0.3) {
    // Early stage: Universal system ensures equal competition
    return 'Early stage - Universal system active';
  } else if (platformSaturation < 0.7) {
    // Growth stage: Universal system maintains fairness
    return 'Growth stage - Universal system active';
  } else {
    // Mature stage: Universal system continues to ensure fairness
    return 'Mature stage - Universal system active';
  }
};
```

## 🔄 **Updated Decay Logic Summary**

### **What Changed**
The post scoring system has been updated to use a **mathematically consistent exponential batch-based decay system** that mirrors the interaction batch system.

### **Old Decay System (Removed)**
- ❌ **Time-based decay**: Arbitrary daily/weekly/monthly penalties
- ❌ **Engagement decline penalties**: Penalties for reduced activity
- ❌ **Quality-based decay**: Penalties for user feedback
- ❌ **Spam decay mechanisms**: Complex moderation penalties

### **New Decay System (Implemented)**
- ✅ **Zero-interaction trigger**: Decay only occurs with 0 interactions
- ✅ **Exponential batch progression**: Mirrors interaction batch structure exactly
- ✅ **Lifespan-adaptive decay rates**: Posts closer to expiration decay exponentially faster
- ✅ **Timeline-adapted exponential multiplier**: Decay curve scaled to match post's specific duration
- ✅ **Market multiplier consistency**: Same multipliers for interactions and decay
- ✅ **Duration-based notifications**: Proactive post management based on post lifespan
- ✅ **Decay reset conditions**: Interactions or modifications reset timer
- ✅ **Fair timeline elimination**: 1-day posts eliminated in hours, 30-day posts eliminated in weeks

### **Mathematical Consistency**
```
Interaction Points = Scaled_Base_Points × Market_Multiplier × Batch_Retention_Rate(batch_number)
Decay Points = Base_Decay_Rate × Market_Multiplier × Decay_Batch_Retention_Rate(decay_batch_number) × Lifespan_Decay_Multiplier
```

Both systems use the same market multipliers and exponential batch structure, ensuring complete mathematical consistency. The decay system mirrors the interaction system's exponential progression while adding lifespan adaptation through the Lifespan_Decay_Multiplier.

## 📈 **Complete Scoring Flow with Capping**

### **Scoring Process Overview**
```javascript
const calculateCompleteScore = async (postData) => {
  // Step 1: Calculate base grade (always 25.0)
  const baseGrade = 25.0;
  
  // Step 2: Calculate raw engagement with exponential decay
  const rawEngagement = calculateEngagementScore(postData.interactions);
  
  // Step 3: Calculate review bonus (if applicable)
  const reviewBonus = postData.duration_type === 'recurring' ? 
    Math.min(postData.review_count * 0.5, 5.0) : 0.0;
  
  // Step 4: Calculate post grade (naturally bounded by mathematical design)
  const postGrade = baseGrade + rawEngagement + reviewBonus;
  
  return {
    baseGrade: baseGrade,
    rawEngagement: rawEngagement,
    reviewBonus: reviewBonus,
    postGrade: postGrade,
    description: 'Universal scoring system for all markets'
  };
};
```

### **Mathematical Bounds**
1. **Base Grade**: Always exactly 25.0 points
2. **Raw Engagement**: Naturally bounded by scaled base points (±25.0 points)
3. **Review Bonus**: Naturally bounded by review count (max 5.0 for recurring posts)
4. **Post Grade**: Naturally bounded by mathematical relationships (0-50 range)

## 📊 **Post Grade Calculation Examples**

> **Note**: The examples below now show the **actual batch-based progressive decay calculations** for each interaction type, demonstrating how interactions are grouped into exponentially growing batches with decreasing retention rates. This prevents later interactions from becoming negligible while maintaining natural mathematical bounds.

#### **Complete Point-Per-Post Allocation Equation**

```
Raw Engagement Score = Σ(Interaction_Points) for all interactions

Where Interaction_Points = Scaled_Base_Points × Market_Multiplier × Batch_Retention_Rate(batch_number)

And:
- Scaled_Base_Points = Base points scaled to ensure natural ±25 bounds
- Market_Multiplier = Market size adjustment factor
- batch_number = Which exponential batch the interaction belongs to
- Batch_Retention_Rate = Retention percentage for that batch

**Final Post Grade = Base Grade + Raw Engagement Score + Bonuses**

Where:
- Base Grade = 25.0 (starting point for all posts)
- Raw Engagement Score = Sum of all interaction points (naturally bounded to ±25)
- Bonuses = Sustained Engagement Bonus + Review Score Bonus + Time Weight Bonus

**NATURAL CONSTRAINT**: Raw Engagement Score naturally stays within ±25 points through scaled base points
```

#### **Mathematical Constants Used in Point Allocation**

**Scaled Base Points (ensuring natural ±25 bounds):**
- Messages: 0.52 points (scaled from 4.16)
- Shares: 0.39 points (scaled from 3.12)
- Bookmarks: 0.26 points (scaled from 2.08)
- Reposts: 0.195 points (scaled from 1.56)
- Profile Views: 0.13 points (scaled from 1.04)
- Post Views: 0.065 points (scaled from 0.52)

**Market Size Multipliers:**
- Small Market (1 university): 1.5×
- Medium Market (2-5 universities): 1.2×
- Large Market (6-15 universities): 1.0×
- Massive Market (16+ universities): 0.8×

**Batch Retention Rates:**
- Batch 1 (interactions 1-5): 100% retention
- Batch 2 (interactions 6-15): 95% retention
- Batch 3 (interactions 16-30): 90% retention
- Batch 4 (interactions 31-50): 85% retention
- Batch 5 (interactions 51-75): 80% retention
- Batch 6 (interactions 76-105): 75% retention
- Batch 7 (interactions 106-140): 70% retention
- Batch 8 (interactions 141-180): 65% retention
- Batch 9 (interactions 181-225): 60% retention
- Batch 10 (interactions 226-275): 55% retention
- Batch 11 (interactions 276-330): 50% retention

**Base Values:**
- Base Grade: 25.0 points (starting point for all posts)
- Maximum Raw Engagement: ±25.0 points (natural mathematical bounds)
- Final Post Grade Range: 0.0 to 50.0 points

Market Size Adjustments:
- Small Market (1 university): 1.5× multiplier (150% of scaled base)
- Medium Market (2-5 universities): 1.2× multiplier (120% of scaled base)
- Large Market (6-15 universities): 1.0× multiplier (100% of scaled base)
- Massive Market (16+ universities): 0.8× multiplier (80% of scaled base)

Batch System with Exponential Growth:
- Batch 1 (interactions 1-5): 100% retention (no decay)
- Batch 2 (interactions 6-15): 95% retention (5% decay)
- Batch 3 (interactions 16-30): 90% retention (10% decay)
- Batch 4 (interactions 31-50): 85% retention (15% decay)
- Batch 5 (interactions 51-75): 80% retention (20% decay)
- Batch 6 (interactions 76-105): 75% retention (25% decay)
- Batch 7 (interactions 106-140): 70% retention (30% decay)
- Batch 8 (interactions 141-180): 65% retention (35% decay)
- Batch 9 (interactions 181-225): 60% retention (40% decay)
- Batch 10 (interactions 226-275): 55% retention (45% decay)
- Batch 11 (interactions 276-330): 50% retention (50% decay)

Examples for Messages (Scaled Base: 0.52):
Small Market (1.5× multiplier):
- 1st message: 0.78 × 1.0 = 0.78 points
- 5th message: 0.78 × 1.0 = 0.78 points

Medium Market (1.2× multiplier):
- 1st message: 0.624 × 1.0 = 0.624 points
- 5th message: 0.624 × 1.0 = 0.624 points

Large Market (1.0× multiplier):
- 1st message: 0.52 × 1.0 = 0.52 points
- 5th message: 0.52 × 1.0 = 0.52 points

Massive Market (0.8× multiplier):
- 1st message: 0.416 × 1.0 = 0.416 points
- 5th message: 0.416 × 1.0 = 0.416 points

#### **Step-by-Step Calculation Example**

**Example: Small Market Post with 5 Messages, 3 Shares, 2 Bookmarks**

1. **Calculate Individual Interaction Points:**
   - Message 1: 0.52 × 1.5 × 1.0 = 0.78 points
   - Message 2: 0.52 × 1.5 × 1.0 = 0.78 points
   - Message 3: 0.52 × 1.5 × 1.0 = 0.78 points
   - Message 4: 0.52 × 1.5 × 1.0 = 0.78 points
   - Message 5: 0.52 × 1.5 × 1.0 = 0.78 points
   - Share 1: 0.39 × 1.5 × 1.0 = 0.585 points
   - Share 2: 0.39 × 1.5 × 1.0 = 0.585 points
   - Share 3: 0.39 × 1.5 × 1.0 = 0.585 points
   - Bookmark 1: 0.26 × 1.5 × 1.0 = 0.39 points
   - Bookmark 2: 0.26 × 1.5 × 1.0 = 0.39 points

2. **Sum All Interaction Points:**
   - Total Raw Engagement = 0.78×5 + 0.585×3 + 0.39×2 = 3.9 + 1.755 + 0.78 = 6.435 points

3. **Calculate Final Post Grade:**
   - Post Grade = 25.0 + 6.435 + 0.0 = 31.435

**Result**: This post achieves a grade of 31.435, well within the natural ±25 bounds for raw engagement.
```

### **Example 1: New High-Engagement Post (Small Market)**
```
Market: San Luis Obispo (Single University)
Market Size: SMALL (1 university)
Market Multiplier: 3.0× (300% of base points)

Base Grade: 25.0

Raw Engagement Calculation (with naturally bounded market-adjusted decay):
- 5 messages: 0.78×5 = 3.9 points (Small Market: 1.5× multiplier, Batch 1: 100% retention)
- 3 shares: 0.585×3 = 1.755 points (Small Market: 1.5× multiplier, Batch 1: 100% retention)
- 2 bookmarks: 0.39×2 = 0.78 points (Small Market: 1.5× multiplier, Batch 1: 100% retention)
- 1 repost: 0.2925×1 = 0.2925 points (Small Market: 1.5× multiplier, Batch 1: 100% retention)
- 4 profile views: 0.195×4 = 0.78 points (Small Market: 1.5× multiplier, Batch 1: 100% retention)
- 3 post views: 0.0975×3 = 0.2925 points (Small Market: 1.5× multiplier, Batch 1: 100% retention)

Total Raw Engagement: 7.8 points (naturally bounded market-adjusted decay applied)

Time Weight: 1.0 (new post)
Sustained Bonus: 0.0 (too new)
Review Bonus: 0.0 (not recurring)

Post Grade: 25.0 + 7.8 + 0.0 = 32.8
```

### **Example 2: Same Post in Large Market (Large Market)**
```
Market: Los Angeles (8 Universities)
Market Size: LARGE (8 universities)
Market Multiplier: 1.0× (100% of base points)

Base Grade: 25.0

Raw Engagement Calculation (with naturally bounded market-adjusted decay):
- 8 messages: 0.52×5 + 0.494×3 = 2.6 + 1.482 = 4.082 points (Large Market: 1.0× multiplier, Batch 1: 100%, Batch 2: 95%)
- 5 shares: 0.39×3 + 0.3705×2 = 1.17 + 0.741 = 1.911 points (Large Market: 1.0× multiplier, Batch 1: 100%, Batch 2: 95%)
- 4 bookmarks: 0.26×2 + 0.247×2 = 0.52 + 0.494 = 1.014 points (Large Market: 1.0× multiplier, Batch 1: 100%, Batch 2: 95%)
- 2 reposts: 0.195×2 = 0.39 points (Large Market: 1.0× multiplier, Batch 1: 100%)
- 6 profile views: 0.13×4 + 0.1235×2 = 0.52 + 0.247 = 0.767 points (Large Market: 1.0× multiplier, Batch 1: 100%, Batch 2: 95%)
- 8 post views: 0.065×5 + 0.06175×3 = 0.325 + 0.18525 = 0.51025 points (Large Market: 1.0× multiplier, Batch 1: 100%, Batch 2: 95%)

Total Raw Engagement: 8.67425 points (naturally bounded market-adjusted decay applied)

Time Weight: 1.0 (new post)
Sustained Bonus: 0.0 (too new)
Review Bonus: 0.0 (not recurring)

Post Grade: 25.0 + 8.67425 + 0.0 = 33.67425
Result: Large market gets higher interactions but naturally bounded system prevents runaway scoring
```

### **Example 3: Established Recurring Service (Medium Market)**
```
Market: Irvine Area (3 Universities)
Market Size: MEDIUM (3 universities)
Market Multiplier: 1.5× (150% of base points)

Base Grade: 25.0

Raw Engagement Calculation (with naturally bounded market-adjusted decay):
- 4 messages: 0.624×4 = 2.496 points (Medium Market: 1.2× multiplier, Batch 1: 100% retention)
- 2 shares: 0.468×2 = 0.936 points (Medium Market: 1.2× multiplier, Batch 1: 100% retention)
- 3 bookmarks: 0.312×3 = 0.936 points (Medium Market: 1.2× multiplier, Batch 1: 100% retention)
- 1 repost: 0.234×1 = 0.234 points (Medium Market: 1.2× multiplier, Batch 1: 100% retention)
- 2 profile views: 0.156×2 = 0.312 points (Medium Market: 1.2× multiplier, Batch 1: 100% retention)
- 1 post view: 0.078×1 = 0.078 points (Medium Market: 1.2× multiplier, Batch 1: 100% retention)

Total Raw Engagement: 4.992 points (naturally bounded market-adjusted decay applied)

Time Weight: 0.8 (30 days old)
Sustained Bonus: 0.7 (high quality)
Review Bonus: 2.5 (5 reviews)

Post Grade: 25.0 + 4.992 + 2.5 = 32.492
Result: Medium market gets balanced interactions with naturally bounded scoring
```

### **Example 4: High Engagement Post (Massive Market)**
```
Market: Boston Area (20+ Universities)
Market Size: MASSIVE (20+ universities)
Market Multiplier: 0.5× (50% of base points)

Base Grade: 25.0

Raw Engagement Calculation (with naturally bounded market-adjusted decay):
- 6 messages: 0.416×5 + 0.3952×1 = 2.08 + 0.3952 = 2.4752 points (Massive Market: 0.8× multiplier, Batch 1: 100%, Batch 2: 95%)
- 4 shares: 0.312×3 + 0.2964×1 = 0.936 + 0.2964 = 1.2324 points (Massive Market: 0.8× multiplier, Batch 1: 100%, Batch 2: 95%)
- 3 bookmarks: 0.208×2 + 0.1976×1 = 0.416 + 0.1976 = 0.6136 points (Massive Market: 0.8× multiplier, Batch 1: 100%, Batch 2: 95%)
- 2 reposts: 0.156×2 = 0.312 points (Massive Market: 0.8× multiplier, Batch 1: 100%)
- 5 profile views: 0.104×4 + 0.0988×1 = 0.416 + 0.0988 = 0.5148 points (Massive Market: 0.8× multiplier, Batch 1: 100%, Batch 2: 95%)
- 6 post views: 0.052×5 + 0.0494×1 = 0.26 + 0.0494 = 0.3094 points (Massive Market: 0.8× multiplier, Batch 1: 100%, Batch 2: 95%)

Total Raw Engagement: 5.4578 points (naturally bounded market-adjusted decay applied)

Time Weight: 0.9 (7 days old)
Sustained Bonus: 0.5 (moderate quality)
Review Bonus: 0.0 (not recurring)

Post Grade: 25.0 + 5.4578 + 0.0 = 30.4578
Result: Massive market gets many interactions but naturally bounded system prevents runaway scoring
```

### **Example 5: Market Size Comparison (Naturally Bounded System)**
```
Different Engagement Patterns in Different Markets with Natural Bounds:

San Luis Obispo (Small):
- Market Multiplier: 1.5× (150% of scaled base points)
- Raw Engagement: 7.8 points (naturally bounded)
- Post Grade: 25.0 + 7.8 = 32.8

Los Angeles (Large):
- Market Multiplier: 1.0× (100% of scaled base points)
- Raw Engagement: 8.67425 points (naturally bounded)
- Post Grade: 25.0 + 8.67425 = 33.67425

Boston (Massive):
- Market Multiplier: 0.8× (80% of scaled base points)
- Raw Engagement: 5.4578 points (naturally bounded)
- Post Grade: 25.0 + 5.4578 = 30.4578

Result: All markets achieve similar scores within natural ±25 bounds
Scaled base points ensure no post can exceed 25 points of raw engagement
```

### **Example 6: Posts Experiencing Point Decay**

#### **Example 6a: High-Engagement Post Losing Points Over Time**
```
Market: Los Angeles (Large Market)
Post Type: Popular Event Announcement
Initial Score: 50.0 (maximum)

**Week 1**: High engagement, maintains score
- Raw Engagement: 25.0 points (capped)
- Post Grade: 50.0

**Week 2**: Engagement drops, time decay begins
- Time Decay: -2.0 points (weekly decay)
- Raw Engagement: 23.0 points
- Post Grade: 48.0

**Week 3**: Further engagement decline
- Time Decay: -2.0 points
- Engagement Decay: -1.5 points (reduced activity)
- Raw Engagement: 19.5 points
- Post Grade: 44.5

**Week 4**: Continued decline
- Time Decay: -2.0 points
- Engagement Decay: -2.0 points
- Raw Engagement: 15.5 points
- Post Grade: 40.5

Result: Post loses 9.5 points over 4 weeks due to time and engagement decay
```

#### **Example 6b: Post with Negative Feedback Losing Points**
```
Market: San Luis Obispo (Small Market)
Post Type: Controversial Service Offer
Initial Score: 45.0

**Day 1**: Initial engagement
- Raw Engagement: 20.0 points
- Post Grade: 45.0

**Day 2**: Negative feedback begins
- Quality Decay: -3.0 points (negative comments)
- Raw Engagement: 17.0 points
- Post Grade: 42.0

**Day 3**: More negative feedback
- Quality Decay: -5.0 points (multiple flags)
- Spam Decay: -2.0 points (suspicious activity)
- Raw Engagement: 10.0 points
- Post Grade: 35.0

**Day 4**: Post flagged for review
- Spam Decay: -8.0 points (moderation action)
- Raw Engagement: 2.0 points
- Post Grade: 27.0

Result: Post loses 18.0 points over 4 days due to quality and spam decay
```

#### **Example 6c: Seasonal Post Losing Relevance**
```
Market: Boston (Massive Market)
Post Type: Winter Housing Offer
Initial Score: 48.0

**December**: High seasonal demand
- Raw Engagement: 23.0 points
- Post Grade: 48.0

**January**: Demand begins to decline
- Time Decay: -1.5 points (monthly decay)
- Engagement Decay: -1.0 points (reduced interest)
- Raw Engagement: 20.5 points
- Post Grade: 45.5

**February**: Further seasonal decline
- Time Decay: -1.5 points
- Engagement Decay: -2.0 points
- Raw Engagement: 17.0 points
- Post Grade: 42.0

**March**: Spring approaches, winter housing irrelevant
- Time Decay: -1.5 points
- Engagement Decay: -3.0 points (seasonal irrelevance)
- Raw Engagement: 12.5 points
- Post Grade: 37.5

Result: Post loses 10.5 points over 4 months due to seasonal relevance decline
```

## 🛡️ **Anti-Gaming Measures**

### **Anti-Gaming Measures**

### **Bookmark Exclusion**
- **Bookmarked posts excluded** from personalized feed
- **Prevents bookmarking** to avoid content
- **Maintains fresh content** discovery

### **Interaction Validation**
- **Real engagement required**: Must have actual user interaction
- **Time-based validation**: Recent interactions weighted higher
- **Pattern detection**: Unusual engagement patterns flagged

### **Score Capping**
- **Hard maximum**: 50.0 points prevents runaway scores
- **Fair competition**: No post can dominate indefinitely
- **Quality focus**: Rewards consistent engagement, not spikes

## 🔧 **Technical Implementation**

### **Database Fields**
```sql
-- Posts table scoring fields
ALTER TABLE posts ADD COLUMN base_score DECIMAL(10, 2) DEFAULT 25.0;
ALTER TABLE posts ADD COLUMN engagement_score DECIMAL(10, 2) DEFAULT 0.0;
ALTER TABLE posts ADD COLUMN time_urgency_bonus DECIMAL(10, 2) DEFAULT 0.0;
ALTER TABLE posts ADD COLUMN final_score DECIMAL(10, 2) DEFAULT 25.0;
ALTER TABLE posts ADD COLUMN review_score_bonus DECIMAL(10, 2) DEFAULT 0.0;
```

### **Service Architecture**
- **ScoringService**: Core scoring calculations
- **EngagementService**: Interaction tracking and validation
- **PersonalizedFeedService**: Feed generation with scoring
- **MultiUniversityScoringService**: Fair competition across universities

### **Performance Optimizations**
- **Caching**: Score calculations cached for performance
- **Batch Processing**: Multiple posts scored simultaneously
- **Indexing**: Database indexes on scoring fields
- **Background Jobs**: Score updates processed asynchronously

## 📊 **Monitoring & Analytics**

### **Score Distribution**
- **Score ranges**: Track distribution across 0-50 scale
- **Engagement patterns**: Monitor engagement vs. score correlation
- **Time decay**: Analyze score changes over post lifetime

### **Quality Metrics**
- **Sustained engagement**: Track posts maintaining high scores
- **Review correlation**: Analyze review scores vs. engagement
- **User satisfaction**: Measure user interaction quality

### **System Health**
- **Score calculation time**: Monitor performance
- **Database load**: Track scoring query impact
- **Cache hit rates**: Optimize caching strategy

## 🔮 **Future Enhancements**

### **Machine Learning Integration**
- **Predictive scoring**: ML models for engagement prediction
- **User preference learning**: Adaptive scoring based on user behavior
- **Content quality assessment**: Automated quality evaluation

### **Advanced Personalization**
- **Contextual scoring**: Location, time, and situation awareness
- **Social signals**: Friend and network influence on scores
- **Content similarity**: Similar post scoring patterns

### **Dynamic Thresholds**
- **Adaptive thresholds**: Thresholds that adjust to platform usage
- **Seasonal adjustments**: Academic calendar awareness
- **Market conditions**: Supply/demand based scoring

## 📚 **Related Documentation**

- **Personalized Feed System**: `PERSONALIZED_FEED_README.md`
- **Review System**: `REVIEW_SYSTEM_README.md`
- **Multi-University System**: `MULTI_UNIVERSITY_README.md`
- **Engagement Service**: `src/services/engagementService.js`
- **Scoring Service**: `src/services/scoringService.js`

---

*This documentation covers the complete post scoring system as implemented in CampusConnect. For technical implementation details, refer to the source code in `src/services/scoringService.js`.* 