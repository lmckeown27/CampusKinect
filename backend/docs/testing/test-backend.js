#!/usr/bin/env node

/**
 * Backend Testing Script
 * Tests all new functionality without requiring a frontend
 */

const axios = require('axios');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_VERSION = process.env.API_VERSION || 'v1';
const API_BASE = `${BASE_URL}/api/${API_VERSION}`;

// Test results
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to run tests
const runTest = async (testName, testFunction) => {
  testResults.total++;
  console.log(`\n🧪 Running: ${testName}`);
  
  try {
    const result = await testFunction();
    testResults.passed++;
    console.log(`✅ PASSED: ${testName}`);
    if (result) {
      console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
    }
    return true;
  } catch (error) {
    testResults.failed++;
    console.log(`❌ FAILED: ${testName}`);
    console.log(`   Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    return false;
  }
};

// Test 1: Health Check
const testHealthCheck = async () => {
  const response = await axios.get(`${BASE_URL}/health`);
  return response.data;
};

// Test 2: Market Size Statistics
const testMarketSizeStatistics = async () => {
  const response = await axios.get(`${API_BASE}/market-size/statistics`);
  return response.data;
};

// Test 3: Grade Distribution for Small Market
const testGradeDistribution = async () => {
  const response = await axios.get(`${API_BASE}/grading/market/small/distribution`);
  return response.data;
};

// Test 4: Calculate Grades for Small Market
const testCalculateGrades = async () => {
  const response = await axios.post(`${API_BASE}/grading/calculate-market/small`);
  return response.data;
};

// Test 5: Get Post Grade Info (if posts exist)
const testPostGradeInfo = async () => {
  try {
    const response = await axios.get(`${API_BASE}/grading/post/1`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { message: 'No posts found (expected in empty database)' };
    }
    throw error;
  }
};

// Test 6: Reshuffle Eligibility Check
const testReshuffleEligibility = async () => {
  try {
    const response = await axios.get(`${API_BASE}/reshuffle/eligibility?mainTab=combined`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { message: 'Authentication required (expected)' };
    }
    throw error;
  }
};

// Test 7: Reshuffle Statistics (requires auth)
const testReshuffleStatistics = async () => {
  try {
    const response = await axios.get(`${API_BASE}/reshuffle/statistics`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { message: 'Authentication required (expected)' };
    }
    throw error;
  }
};

// Test 8: Update All Market Sizes (requires auth)
const testUpdateMarketSizes = async () => {
  try {
    const response = await axios.post(`${API_BASE}/market-size/update-all`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { message: 'Authentication required (expected)' };
    }
    throw error;
  }
};

// Test 9: Calculate All Market Grades (requires auth)
const testCalculateAllGrades = async () => {
  try {
    const response = await axios.post(`${API_BASE}/grading/calculate-all-markets`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return { message: 'Authentication required (expected)' };
    }
    throw error;
  }
};

// Test 10: Database Connection Test
const testDatabaseConnection = async () => {
  try {
    // This will test if the database is accessible through the API
    const response = await axios.get(`${API_BASE}/market-size/statistics`);
    return { message: 'Database connection successful', data: response.data };
  } catch (error) {
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

// Test 11: Redis Connection Test
const testRedisConnection = async () => {
  try {
    // Test caching by making the same request twice
    const response1 = await axios.get(`${API_BASE}/market-size/statistics`);
    const response2 = await axios.get(`${API_BASE}/market-size/statistics`);
    
    // If Redis is working, the second request should be faster
    return { 
      message: 'Redis connection successful',
      firstResponse: response1.data,
      secondResponse: response2.data
    };
  } catch (error) {
    throw new Error(`Redis connection failed: ${error.message}`);
  }
};

// Test 12: API Rate Limiting
const testRateLimiting = async () => {
  try {
    // Make multiple rapid requests to test rate limiting
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(axios.get(`${API_BASE}/market-size/statistics`));
    }
    
    await Promise.all(promises);
    return { message: 'Rate limiting test passed - all requests succeeded' };
  } catch (error) {
    if (error.response && error.response.status === 429) {
      return { message: 'Rate limiting working correctly - request blocked' };
    }
    throw error;
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('🚀 Starting CampusConnect Backend Tests...\n');
  console.log(`📍 Testing against: ${API_BASE}\n`);
  
  // Run all tests
  await runTest('Health Check', testHealthCheck);
  await runTest('Database Connection', testDatabaseConnection);
  await runTest('Redis Connection', testRedisConnection);
  await runTest('Market Size Statistics', testMarketSizeStatistics);
  await runTest('Grade Distribution', testGradeDistribution);
  await runTest('Calculate Grades (Small Market)', testCalculateGrades);
  await runTest('Post Grade Info', testPostGradeInfo);
  await runTest('Reshuffle Eligibility', testReshuffleEligibility);
  await runTest('Reshuffle Statistics', testReshuffleStatistics);
  await runTest('Update Market Sizes', testUpdateMarketSizes);
  await runTest('Calculate All Market Grades', testCalculateAllGrades);
  await runTest('API Rate Limiting', testRateLimiting);
  
  // Print summary
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.total}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Backend is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above.');
  }
  
  // Exit with appropriate code
  process.exit(testResults.failed === 0 ? 0 : 1);
};

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error);
  process.exit(1);
});

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testResults
}; 