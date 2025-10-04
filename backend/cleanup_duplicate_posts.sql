-- Cleanup duplicate multi-university posts
-- This script finds posts with identical title, description, and user_id
-- created within a short time window, and keeps only the first one

-- Step 1: View duplicates before deletion
SELECT 
    title,
    description,
    user_id,
    COUNT(*) as duplicate_count,
    MIN(id) as keep_post_id,
    ARRAY_AGG(id ORDER BY id) as all_post_ids,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM posts 
WHERE user_id = 1  -- Admin user (liam_mckeown38)
GROUP BY user_id, title, description
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- Step 2: Delete duplicates, keeping only the first post (lowest ID)
-- This will CASCADE delete related records (post_tags, post_images, etc.)
DELETE FROM posts 
WHERE id IN (
    SELECT id
    FROM (
        SELECT id, 
               ROW_NUMBER() OVER (
                   PARTITION BY user_id, title, description 
                   ORDER BY id ASC
               ) AS rn
        FROM posts
        WHERE user_id = 1  -- Admin user
    ) t
    WHERE rn > 1  -- Keep first (rn = 1), delete rest (rn > 1)
)
RETURNING id, title, LEFT(description, 50) as description_preview;

-- Step 3: Show summary after cleanup
SELECT 
    'Cleanup complete' as status,
    COUNT(*) as remaining_posts
FROM posts 
WHERE user_id = 1;

-- Step 4: Verify no more duplicates remain
SELECT 
    title,
    COUNT(*) as count
FROM posts 
WHERE user_id = 1
GROUP BY title
HAVING COUNT(*) > 1;

