-- Remove 'recurring', 'limited', 'one-time', 'offer', 'request' tags from all posts
DELETE FROM post_tags 
WHERE tag_id IN (
  SELECT id FROM tags 
  WHERE LOWER(name) IN ('recurring', 'limited', 'one-time', 'onetime', 'permanent', 'offer', 'request')
);

-- Optionally delete the tags themselves if they're not used elsewhere
DELETE FROM tags 
WHERE LOWER(name) IN ('recurring', 'limited', 'one-time', 'onetime', 'permanent', 'offer', 'request')
AND id NOT IN (SELECT DISTINCT tag_id FROM post_tags);

-- Show what was deleted
SELECT 'Tags cleaned up successfully' as message;
