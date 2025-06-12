#!/usr/bin/env node

/**
 * Simple Saturn Backend Test - Isolate Issues
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:4000';

async function testHealthOnly() {
  console.log('🔍 Testing basic server health...');

  try {
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Server health check passed');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Server health check failed');
    console.log('Error:', error.message);
    return false;
  }

  return true;
}

async function testAuthRoutes() {
  console.log('\n🔍 Testing auth route availability...');

  try {
    // Test register endpoint with empty body to see if route exists
    await axios.post(`${BASE_URL}/api/auth/register`, {});
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 422) {
      console.log('✅ Register route exists (validation error expected)');
    } else if (error.response?.status === 404) {
      console.log('❌ Register route not found (404)');
      return false;
    } else {
      console.log(
        '✅ Register route exists (other error)',
        error.response?.status
      );
    }
  }

  try {
    // Test login endpoint with empty body
    await axios.post(`${BASE_URL}/api/auth/login`, {});
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 422) {
      console.log('✅ Login route exists (validation error expected)');
    } else if (error.response?.status === 404) {
      console.log('❌ Login route not found (404)');
      return false;
    } else {
      console.log(
        '✅ Login route exists (other error)',
        error.response?.status
      );
    }
  }

  return true;
}

async function testMediaRoutes() {
  console.log('\n🔍 Testing media route configuration...');

  try {
    // Test the problematic media/upload with GET (should return 405, not 500)
    await axios.get(`${BASE_URL}/api/media/upload`);
  } catch (error) {
    console.log(`GET /api/media/upload returned: ${error.response?.status}`);
    if (error.response?.status === 405) {
      console.log(
        '✅ Media upload GET handled correctly (405 Method Not Allowed)'
      );
    } else if (error.response?.status === 500) {
      console.log('❌ Media route still has 500 error');
      console.log('Error response:', error.response?.data);
      return false;
    } else {
      console.log('ℹ️  Media route returned unexpected status');
    }
  }

  try {
    // Test invalid media ID
    await axios.get(`${BASE_URL}/api/media/invalid-id`);
  } catch (error) {
    console.log(
      `GET /api/media/invalid-id returned: ${error.response?.status}`
    );
    console.log('Error response:', error.response?.data);
    if (error.response?.status === 400 || error.response?.status === 404) {
      console.log(
        '✅ Invalid media ID handling works (404 Not Found is acceptable)'
      );
    } else if (error.response?.status === 500) {
      console.log(
        '❌ Invalid media ID still returns 500, should be 400 or 404'
      );
      return false;
    } else {
      console.log('ℹ️  Unexpected status for invalid media ID');
    }
  }

  return true;
}

async function runSimpleTest() {
  console.log('🚀 Saturn Simple Backend Test');
  console.log('Testing basic route configuration...\n');

  const healthOk = await testHealthOnly();
  if (!healthOk) {
    console.log('\n❌ Server is not running. Please start it first.');
    process.exit(1);
  }

  const authOk = await testAuthRoutes();
  const mediaOk = await testMediaRoutes();

  console.log('\n📊 Test Results:');
  console.log(`Server Health: ${healthOk ? '✅' : '❌'}`);
  console.log(`Auth Routes: ${authOk ? '✅' : '❌'}`);
  console.log(`Media Routes: ${mediaOk ? '✅' : '❌'}`);

  if (healthOk && authOk && mediaOk) {
    console.log(
      '\n🎉 Basic routing is working! You can now run the full test.'
    );
  } else {
    console.log('\n❌ Some basic routing issues found. Check server logs.');
  }
}

runSimpleTest().catch(error => {
  console.error('Test failed:', error.message);
  process.exit(1);
});
