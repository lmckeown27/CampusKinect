-- Fix Cal Poly users who were assigned to wrong university
-- This script updates users with @calpoly.edu emails to have Cal Poly university ID (11)

-- First, let's see what we're working with
SELECT 'BEFORE UPDATE - Cal Poly users:' as status;
SELECT id, username, email, university_id, first_name, last_name
FROM users 
WHERE email LIKE '%@calpoly.edu'
ORDER BY id;

-- Check what Cal Poly's ID should be (should be 11)
SELECT 'Cal Poly university in database:' as status;
SELECT id, name, domain FROM universities WHERE domain = 'calpoly.edu' OR name LIKE '%Cal%Poly%';

-- Show users that need to be updated (not already assigned to Cal Poly ID 11)
SELECT 'Users that need updating:' as status;
SELECT id, username, email, university_id, first_name, last_name,
       CASE 
         WHEN university_id = 11 THEN 'Already correct'
         ELSE 'Needs update: ' || university_id || ' → 11'
       END as update_needed
FROM users 
WHERE email LIKE '%@calpoly.edu'
ORDER BY id;

-- UPDATE STATEMENT (uncomment the next line to actually run the update)
-- UPDATE users SET university_id = 11, updated_at = CURRENT_TIMESTAMP WHERE email LIKE '%@calpoly.edu' AND university_id != 11;

-- Verification query (run this after the update)
SELECT 'AFTER UPDATE - Verification:' as status;
SELECT id, username, email, university_id, first_name, last_name,
       CASE 
         WHEN university_id = 11 THEN '✅ Correct (Cal Poly)'
         ELSE '❌ Still wrong: ' || university_id
       END as status
FROM users 
WHERE email LIKE '%@calpoly.edu'
ORDER BY id;

-- Show summary
SELECT 'Summary:' as info,
       COUNT(*) as total_calpoly_users,
       COUNT(CASE WHEN university_id = 11 THEN 1 END) as correctly_assigned,
       COUNT(CASE WHEN university_id != 11 THEN 1 END) as incorrectly_assigned
FROM users 
WHERE email LIKE '%@calpoly.edu'; 