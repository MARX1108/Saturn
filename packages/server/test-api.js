#!/usr/bin/env node

/**
 * Saturn API Integration Test Script
 * Tests all MVP endpoints to validate Block 1 implementation
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = 'http://localhost:4000';
const TEST_USER = {
  name: 'Test User',
  username: 'testuser_' + Date.now(),
  email: `test_${Date.now()}@example.com`,
  password: 'Test123!@#',
};

let authToken = null;
let testResults = [];

// Helper functions
function logTest(name, success, details = '') {
  const status = success ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}`);
  if (details) console.log(`    ${details}`);
  testResults.push({ name, success, details });
}

function logSection(name) {
  console.log(`\n🔍 ${name}`);
  console.log('='.repeat(50));
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Create a test file for media upload (minimal valid image)
function createTestFile() {
  // Create a minimal 1x1 PNG image as a test file
  const filePath = path.join(__dirname, 'test-upload.png');
  // This is a minimal valid PNG file (1x1 transparent pixel)
  const pngData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAG8BmdkwgAAAABJRU5ErkJggg==',
    'base64'
  );
  fs.writeFileSync(filePath, pngData);
  return filePath;
}

// Test functions
async function testServerHealth() {
  logSection('Server Health Check');

  try {
    const response = await axios.get(`${BASE_URL}/`);
    if (response.status === 200 && response.data.message) {
      logTest('Server is running', true, `Status: ${response.data.status}`);
      return true;
    } else {
      logTest('Server health check', false, 'Unexpected response format');
      return false;
    }
  } catch (error) {
    logTest('Server is running', false, `Error: ${error.message}`);
    return false;
  }
}

async function testRegistration() {
  logSection('User Registration');

  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/register`,
      TEST_USER,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.status === 200 || response.status === 201) {
      logTest('User registration', true, `User created: ${TEST_USER.username}`);
      return true;
    } else {
      logTest(
        'User registration',
        false,
        `Unexpected status: ${response.status}`
      );
      return false;
    }
  } catch (error) {
    const details = error.response?.data?.message || error.message;
    logTest('User registration', false, `Error: ${details}`);
    return false;
  }
}

async function testLogin() {
  logSection('User Authentication');

  try {
    const response = await axios.post(
      `${BASE_URL}/api/auth/login`,
      {
        username: TEST_USER.username,
        password: TEST_USER.password,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (response.status === 200 && response.data.token) {
      authToken = response.data.token;
      logTest('User login', true, 'JWT token received');
      return true;
    } else {
      logTest('User login', false, 'No token in response');
      return false;
    }
  } catch (error) {
    const details = error.response?.data?.message || error.message;
    logTest('User login', false, `Error: ${details}`);
    return false;
  }
}

async function testMediaUpload() {
  logSection('Media Upload');

  if (!authToken) {
    logTest('Media upload', false, 'No auth token available');
    return false;
  }

  try {
    // Create test file
    const testFilePath = createTestFile();

    // Create form data
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));

    const response = await axios.post(
      `${BASE_URL}/api/media/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          ...formData.getHeaders(),
        },
      }
    );

    // Clean up test file
    fs.unlinkSync(testFilePath);

    if (response.status === 200 || response.status === 201) {
      logTest(
        'Media upload',
        true,
        `Media ID: ${response.data.id || 'created'}`
      );
      return true;
    } else {
      logTest('Media upload', false, `Unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    // Clean up test file if it exists
    const testFilePath = path.join(__dirname, 'test-upload.png');
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }

    const details = error.response?.data?.error || error.message;
    logTest('Media upload', false, `Error: ${details}`);
    return false;
  }
}

async function testCreatePost() {
  logSection('Post Creation');

  if (!authToken) {
    logTest('Create post', false, 'No auth token available');
    return false;
  }

  try {
    const postContent = `Hello from Saturn! Test post created at ${new Date().toISOString()}`;

    const response = await axios.post(
      `${BASE_URL}/api/posts`,
      {
        content: postContent,
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      logTest(
        'Create post',
        true,
        `Post created: ${response.data.id || 'success'}`
      );
      return true;
    } else {
      logTest('Create post', false, `Unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    const details = error.response?.data?.error || error.message;
    logTest('Create post', false, `Error: ${details}`);
    return false;
  }
}

async function testGetFeed() {
  logSection('Feed Retrieval');

  if (!authToken) {
    logTest('Get feed', false, 'No auth token available');
    return false;
  }

  try {
    const response = await axios.get(`${BASE_URL}/api/posts`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (response.status === 200) {
      const postsCount = response.data.posts?.length || 0;
      logTest('Get feed', true, `Retrieved ${postsCount} posts`);
      return true;
    } else {
      logTest('Get feed', false, `Unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    const details = error.response?.data?.error || error.message;
    logTest('Get feed', false, `Error: ${details}`);
    return false;
  }
}

async function testInvalidRoutes() {
  logSection('Error Handling');

  try {
    // Test invalid media ID (should not crash with ObjectId error)
    await axios.get(`${BASE_URL}/api/media/invalid-id`);
    logTest(
      'Invalid media ID handling',
      false,
      'Should have returned 404 error'
    );
  } catch (error) {
    if (error.response?.status === 404 || error.response?.status === 400) {
      logTest(
        'Invalid media ID handling',
        true,
        'Correctly returned 404 Not Found (acceptable for invalid ID)'
      );
    } else {
      logTest(
        'Invalid media ID handling',
        false,
        `Unexpected error: ${error.message}`
      );
    }
  }

  try {
    // Test accessing upload endpoint with GET (the original issue)
    await axios.get(`${BASE_URL}/api/media/upload`);
    logTest(
      'GET /api/media/upload handling',
      false,
      'Should have returned 405 error'
    );
  } catch (error) {
    if (error.response?.status === 405) {
      logTest(
        'GET /api/media/upload handling',
        true,
        'Correctly returned 405 Method Not Allowed'
      );
    } else {
      logTest(
        'GET /api/media/upload handling',
        false,
        `Unexpected error: ${error.message}`
      );
    }
  }
}

async function printSummary() {
  logSection('Test Summary');

  const totalTests = testResults.length;
  const passedTests = testResults.filter(test => test.success).length;
  const failedTests = totalTests - passedTests;

  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(
    `Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`
  );

  if (failedTests > 0) {
    console.log('\n❌ Failed Tests:');
    testResults
      .filter(test => !test.success)
      .forEach(test => {
        console.log(`  - ${test.name}: ${test.details}`);
      });
  }

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Saturn MVP is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Saturn API Integration Tests');
  console.log('Testing Block 1: Pilot-Ready MVP Integration');
  console.log(`Server: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  // Test sequence
  const serverHealthy = await testServerHealth();
  if (!serverHealthy) {
    console.log('\n❌ Server is not running. Please start the server first:');
    console.log('cd /Users/marxw/Saturn/packages/server && npm run dev');
    process.exit(1);
  }

  await sleep(500);
  await testRegistration();

  await sleep(500);
  await testLogin();

  await sleep(500);
  await testMediaUpload();

  await sleep(500);
  await testCreatePost();

  await sleep(500);
  await testGetFeed();

  await sleep(500);
  await testInvalidRoutes();

  await sleep(500);
  await printSummary();
}

// Handle errors gracefully
process.on('unhandledRejection', error => {
  console.error('\n❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the tests
runTests().catch(error => {
  console.error('\n❌ Test runner failed:', error.message);
  process.exit(1);
});
