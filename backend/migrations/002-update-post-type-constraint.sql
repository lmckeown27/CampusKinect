-- Update post_type check constraint
-- post_type should be: 'offer', 'request', or 'events'
-- (goods/services/housing are stored as tags, not post_type)

-- Drop the existing constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_post_type_check;

-- Add new constraint with valid post types
ALTER TABLE posts ADD CONSTRAINT posts_post_type_check 
  CHECK (post_type IN ('offer', 'request', 'events'));

-- Verify the constraint was updated
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'posts_post_type_check';

