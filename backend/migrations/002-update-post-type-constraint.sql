-- Update post_type check constraint to allow 'offer' and 'request'

-- Drop the existing constraint
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_post_type_check;

-- Add new constraint with all valid post types
ALTER TABLE posts ADD CONSTRAINT posts_post_type_check 
  CHECK (post_type IN ('goods', 'services', 'housing', 'events', 'offer', 'request'));

-- Verify the constraint was updated
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'posts_post_type_check';

