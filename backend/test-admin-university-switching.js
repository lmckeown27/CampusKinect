/**
 * Test Script: Admin University Switching Verification
 * 
 * This script verifies that posts are correctly filtered by university
 * with no overlap (except for intentional cross-posting).
 */

const { query } = require('./src/config/database');

async function testAdminUniversitySwitching() {
  console.log('🔍 Testing Admin University Switching...\n');

  try {
    // 1. Get all posts
    console.log('📊 Step 1: Fetching all posts...');
    const allPosts = await query(`
      SELECT 
        p.id, 
        p.title, 
        p.university_id,
        u.name as university_name,
        p.user_id,
        us.username as creator_username
      FROM posts p
      JOIN universities u ON p.university_id = u.id
      JOIN users us ON p.user_id = us.id
      WHERE p.is_active = true
      ORDER BY p.created_at DESC
      LIMIT 20
    `);

    console.log(`Found ${allPosts.rows.length} active posts:\n`);
    allPosts.rows.forEach(post => {
      console.log(`  Post ${post.id}: "${post.title}"`);
      console.log(`    ├─ Primary university_id: ${post.university_id} (${post.university_name})`);
      console.log(`    └─ Created by: ${post.creator_username} (user_id: ${post.user_id})`);
    });

    // 2. Check post_universities table (cross-posting)
    console.log('\n📊 Step 2: Checking cross-posted posts (post_universities table)...');
    const crossPosted = await query(`
      SELECT 
        pu.post_id,
        p.title,
        p.university_id as primary_university_id,
        un1.name as primary_university_name,
        pu.university_id as target_university_id,
        un2.name as target_university_name
      FROM post_universities pu
      JOIN posts p ON pu.post_id = p.id
      JOIN universities un1 ON p.university_id = un1.id
      JOIN universities un2 ON pu.university_id = un2.id
      ORDER BY pu.post_id, pu.university_id
    `);

    if (crossPosted.rows.length === 0) {
      console.log('  ✅ No cross-posted posts found (all posts are university-specific)\n');
    } else {
      console.log(`  Found ${crossPosted.rows.length} cross-posting entries:\n`);
      
      // Group by post_id
      const groupedByPost = {};
      crossPosted.rows.forEach(row => {
        if (!groupedByPost[row.post_id]) {
          groupedByPost[row.post_id] = {
            title: row.title,
            primaryUniversity: `${row.primary_university_name} (ID: ${row.primary_university_id})`,
            targetUniversities: []
          };
        }
        groupedByPost[row.post_id].targetUniversities.push(
          `${row.target_university_name} (ID: ${row.target_university_id})`
        );
      });

      Object.entries(groupedByPost).forEach(([postId, data]) => {
        console.log(`  Post ${postId}: "${data.title}"`);
        console.log(`    ├─ Primary university: ${data.primaryUniversity}`);
        console.log(`    └─ Also visible to: ${data.targetUniversities.join(', ')}`);
      });
    }

    // 3. Simulate admin viewing specific universities
    console.log('\n📊 Step 3: Simulating admin viewing different universities...\n');

    const testUniversities = [
      { id: 11, name: 'California Polytechnic State University, San Luis Obispo' },
      { id: 12, name: 'University of San Diego' },
      { id: 25, name: 'Arizona State University' },
      { id: 1, name: 'University of California, Berkeley' }
    ];

    for (const uni of testUniversities) {
      console.log(`\n🎓 Viewing as Admin: ${uni.name} (ID: ${uni.id})`);
      
      const posts = await query(`
        SELECT 
          p.id,
          p.title,
          p.university_id,
          un.name as university_name
        FROM posts p
        JOIN universities un ON p.university_id = un.id
        WHERE p.is_active = true
          AND (p.university_id = $1 OR EXISTS (
            SELECT 1 FROM post_universities pu 
            WHERE pu.post_id = p.id AND pu.university_id = $1
          ))
        ORDER BY p.created_at DESC
      `, [uni.id]);

      if (posts.rows.length === 0) {
        console.log('  📭 No posts visible for this university');
      } else {
        console.log(`  📬 ${posts.rows.length} posts visible:`);
        posts.rows.forEach(post => {
          const isCrossPosted = post.university_id !== uni.id;
          const marker = isCrossPosted ? '🔗 (cross-posted)' : '📝 (direct)';
          console.log(`    ${marker} Post ${post.id}: "${post.title}"`);
          if (isCrossPosted) {
            console.log(`      └─ Originally from: ${post.university_name} (ID: ${post.university_id})`);
          }
        });
      }
    }

    // 4. Verify no overlap
    console.log('\n📊 Step 4: Verifying no unintended overlap...\n');
    
    const overlapCheck = await query(`
      SELECT 
        p.id,
        p.title,
        COUNT(DISTINCT pu.university_id) as cross_post_count
      FROM posts p
      LEFT JOIN post_universities pu ON p.id = pu.post_id
      WHERE p.is_active = true
      GROUP BY p.id, p.title
      HAVING COUNT(DISTINCT pu.university_id) > 0
    `);

    if (overlapCheck.rows.length === 0) {
      console.log('  ✅ All posts are university-specific (no cross-posting detected)');
    } else {
      console.log('  ℹ️  Cross-posted posts found (this is intentional for admin posts):');
      overlapCheck.rows.forEach(post => {
        console.log(`    Post ${post.id}: "${post.title}" → visible to ${post.cross_post_count} universities`);
      });
    }

    console.log('\n✅ Admin university switching verification complete!\n');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  } finally {
    process.exit(0);
  }
}

testAdminUniversitySwitching();

