-- Test Algorithm: Compare Post Rankings
-- Run this query to see how posts are ranked

SELECT 
  p.id,
  p.title,
  p.created_at,
  EXTRACT(DAYS FROM NOW() - p.created_at) as days_old,
  
  -- Engagement counts
  p.message_count,
  p.share_count,
  p.bookmark_count,
  p.repost_count,
  
  -- Scores
  p.engagement_score,
  p.base_score,
  p.final_score,
  
  -- Rank in feed
  RANK() OVER (ORDER BY 
    CASE WHEN p.created_at >= NOW() - INTERVAL '24 hours' THEN 0 ELSE 1 END,
    p.final_score DESC,
    p.created_at DESC
  ) as feed_rank

FROM posts p
WHERE p.is_active = true
  AND p.university_id = YOUR_UNIVERSITY_ID_HERE

ORDER BY feed_rank
LIMIT 20;

-- This shows:
-- 1. Top 20 posts in your feed
-- 2. Their engagement counts
-- 3. Their scores
-- 4. Posts with more engagement should have higher final_score
-- 5. Posts with higher final_score should have better feed_rank

