-- Migrate existing posts to the new post_type system
-- Old system: post_type could be 'goods', 'services', 'housing', 'events'
-- New system: post_type can only be 'offer', 'request', 'events'

-- First, let's see what we're dealing with
SELECT post_type, COUNT(*) as count 
FROM posts 
GROUP BY post_type 
ORDER BY count DESC;

-- Update all 'goods', 'services', and 'housing' posts to 'offer' (default choice)
-- In the new system, these categories will be stored as tags instead
UPDATE posts 
SET post_type = 'offer' 
WHERE post_type IN ('goods', 'services', 'housing');

-- Verify the update
SELECT post_type, COUNT(*) as count 
FROM posts 
GROUP BY post_type 
ORDER BY count DESC;

-- Now we can safely apply the constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_post_type_check;

ALTER TABLE posts ADD CONSTRAINT posts_post_type_check 
  CHECK (post_type IN ('offer', 'request', 'events'));

-- Verify the constraint was added
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'posts_post_type_check';

