const { query } = require('./database');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Seed clusters
    console.log('📍 Seeding geographic clusters...');
    const clusters = [
      { name: 'Northeast', region: 'Northeast United States' },
      { name: 'Southeast', region: 'Southeast United States' },
      { name: 'Midwest', region: 'Midwest United States' },
      { name: 'Southwest', region: 'Southwest United States' },
      { name: 'West Coast', region: 'West Coast United States' },
      { name: 'Mountain West', region: 'Mountain West United States' }
    ];

    for (const cluster of clusters) {
      await query(`
        INSERT INTO clusters (name, region) 
        VALUES ($1, $2) 
        ON CONFLICT DO NOTHING
      `, [cluster.name, cluster.region]);
    }

    // Seed universities
    console.log('🏫 Seeding universities...');
    const universities = [
      {
        name: 'Harvard University',
        domain: 'harvard.edu',
        city: 'Cambridge',
        state: 'MA',
        country: 'USA',
        latitude: 42.3744,
        longitude: -71.1169,
        timezone: 'America/New_York',
        cluster: 'Northeast'
      },
      {
        name: 'Stanford University',
        domain: 'stanford.edu',
        city: 'Stanford',
        state: 'CA',
        country: 'USA',
        latitude: 37.4275,
        longitude: -122.1697,
        timezone: 'America/Los_Angeles',
        cluster: 'West Coast'
      },
      {
        name: 'MIT',
        domain: 'mit.edu',
        city: 'Cambridge',
        state: 'MA',
        country: 'USA',
        latitude: 42.3601,
        longitude: -71.0942,
        timezone: 'America/New_York',
        cluster: 'Northeast'
      },
      {
        name: 'University of California, Berkeley',
        domain: 'berkeley.edu',
        city: 'Berkeley',
        state: 'CA',
        country: 'USA',
        latitude: 37.8719,
        longitude: -122.2585,
        timezone: 'America/Los_Angeles',
        cluster: 'West Coast'
      },
      {
        name: 'University of Michigan',
        domain: 'umich.edu',
        city: 'Ann Arbor',
        state: 'MI',
        country: 'USA',
        latitude: 42.2780,
        longitude: -83.7382,
        timezone: 'America/Detroit',
        cluster: 'Midwest'
      },
      {
        name: 'University of Texas at Austin',
        domain: 'utexas.edu',
        city: 'Austin',
        state: 'TX',
        country: 'USA',
        latitude: 30.2849,
        longitude: -97.7341,
        timezone: 'America/Chicago',
        cluster: 'Southwest'
      },
      {
        name: 'University of Florida',
        domain: 'ufl.edu',
        city: 'Gainesville',
        state: 'FL',
        country: 'USA',
        latitude: 29.6516,
        longitude: -82.3248,
        timezone: 'America/New_York',
        cluster: 'Southeast'
      },
      {
        name: 'University of Colorado Boulder',
        domain: 'colorado.edu',
        city: 'Boulder',
        state: 'CO',
        country: 'USA',
        latitude: 40.0076,
        longitude: -105.2659,
        timezone: 'America/Denver',
        cluster: 'Mountain West'
      },
      {
        name: 'New York University',
        domain: 'nyu.edu',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        latitude: 40.7295,
        longitude: -73.9965,
        timezone: 'America/New_York',
        cluster: 'Northeast'
      },
      {
        name: 'University of Washington',
        domain: 'washington.edu',
        city: 'Seattle',
        state: 'WA',
        country: 'USA',
        latitude: 47.6062,
        longitude: -122.3321,
        timezone: 'America/Los_Angeles',
        cluster: 'West Coast'
      }
    ];

    for (const uni of universities) {
      // Get cluster ID
      const clusterResult = await query('SELECT id FROM clusters WHERE name = $1', [uni.cluster]);
      const clusterId = clusterResult.rows[0]?.id;

      await query(`
        INSERT INTO universities (name, domain, city, state, country, latitude, longitude, timezone, cluster_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        ON CONFLICT (domain) DO UPDATE SET
          timezone = EXCLUDED.timezone,
          cluster_id = EXCLUDED.cluster_id
      `, [uni.name, uni.domain, uni.city, uni.state, uni.country, uni.latitude, uni.longitude, uni.timezone, clusterId]);
    }

    // Seed tags
    console.log('🏷️ Seeding tags...');
    const tags = [
      // Housing
      { name: 'Housing', category: 'housing' },
      { name: 'Apartment', category: 'housing' },
      { name: 'Roommate', category: 'housing' },
      { name: 'Sublet', category: 'housing' },
      { name: 'Furniture', category: 'housing' },
      
      // Goods/Services
      { name: 'Electronics', category: 'goods' },
      { name: 'Books', category: 'goods' },
      { name: 'Clothing', category: 'goods' },
      { name: 'Transportation', category: 'goods' },
      { name: 'Food', category: 'goods' },
      
      // Tutoring
      { name: 'Math', category: 'tutoring' },
      { name: 'Science', category: 'tutoring' },
      { name: 'Language', category: 'tutoring' },
      { name: 'Computer Science', category: 'tutoring' },
      { name: 'Writing', category: 'tutoring' },
      
      // Coaching
      { name: 'Fitness', category: 'coaching' },
      { name: 'Music', category: 'coaching' },
      { name: 'Sports', category: 'coaching' },
      { name: 'Career', category: 'coaching' },
      { name: 'Life Skills', category: 'coaching' },
      
      // Greek Life
      { name: 'Fraternity', category: 'greek' },
      { name: 'Sorority', category: 'greek' },
      { name: 'Rush', category: 'greek' },
      { name: 'Greek Events', category: 'greek' },
      
      // Sports
      { name: 'Basketball', category: 'sports' },
      { name: 'Football', category: 'sports' },
      { name: 'Soccer', category: 'sports' },
      { name: 'Tennis', category: 'sports' },
      { name: 'Swimming', category: 'sports' },
      
      // Other
      { name: 'Events', category: 'other' },
      { name: 'Volunteer', category: 'other' },
      { name: 'Travel', category: 'other' },
      { name: 'Study Group', category: 'other' },
      { name: 'Networking', category: 'other' }
    ];

    for (const tag of tags) {
      await query(`
        INSERT INTO tags (name, category) 
        VALUES ($1, $2) 
        ON CONFLICT DO NOTHING
      `, [tag.name, tag.category]);
    }

    // Create a sample user for testing
    console.log('👤 Creating sample user...');
    const bcrypt = require('bcryptjs');
    const samplePassword = await bcrypt.hash('Test123!@#', 12);
    
    // Get a university ID
    const uniResult = await query('SELECT id FROM universities LIMIT 1');
    const universityId = uniResult.rows[0]?.id;

    if (universityId) {
      await query(`
        INSERT INTO users (username, email, password_hash, first_name, last_name, year, major, hometown, university_id, is_verified, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT DO NOTHING
      `, [
        'testuser',
        'test@harvard.edu',
        samplePassword,
        'Test',
        'User',
        3,
        'Computer Science',
        'Boston, MA',
        universityId,
        true,
        true
      ]);
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Seeded data:');
    console.log(`   - ${clusters.length} geographic clusters`);
    console.log(`   - ${universities.length} universities`);
    console.log(`   - ${tags.length} tags`);
    console.log('   - 1 sample user (test@harvard.edu / Test123!@#)');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase }; 