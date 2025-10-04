-- Reset to the original 3-level category system
-- Level 1: Main Category (goods, services, housing, events)
-- Level 2: Offer/Request (stored as tags)
-- Level 3: Sub-category tags

-- Delete all posts for a fresh start (CASCADE will handle related records)
TRUNCATE TABLE posts CASCADE;

-- Reset sequences
ALTER SEQUENCE posts_id_seq RESTART WITH 1;

-- First drop the old constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_post_type_check;

-- Add new constraint to the original categories
ALTER TABLE posts ADD CONSTRAINT posts_post_type_check 
  CHECK (post_type IN ('goods', 'services', 'housing', 'events'));

-- Verify the constraint
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'posts_post_type_check';

-- Show current post count (should be 0)
SELECT COUNT(*) as total_posts FROM posts;

