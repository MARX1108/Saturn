#!/usr/bin/env node

/**
 * Saturn Frontend Integration Test Script
 * Tests frontend configuration and Redux setup
 */

const fs = require('fs');
const path = require('path');

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

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    return null;
  }
}

// Test functions
function testEnvironmentConfig() {
  logSection('Environment Configuration');
  
  // Check .env.example exists
  const envExamplePath = path.join(__dirname, '.env.example');
  if (fileExists(envExamplePath)) {
    logTest('Environment example file exists', true, '.env.example found');
    
    const envContent = readFile(envExamplePath);
    if (envContent && envContent.includes('EXPO_PUBLIC_API_URL')) {
      logTest('Environment example contains API URL', true, 'EXPO_PUBLIC_API_URL configured');
    } else {
      logTest('Environment example contains API URL', false, 'Missing EXPO_PUBLIC_API_URL');
    }
  } else {
    logTest('Environment example file exists', false, '.env.example not found');
  }
  
  // Check if .env exists
  const envPath = path.join(__dirname, '.env');
  if (fileExists(envPath)) {
    logTest('Environment file exists', true, '.env found');
  } else {
    logTest('Environment file exists', false, '.env not found - copy from .env.example');
  }
}

function testAPISlices() {
  logSection('API Slice Configuration');
  
  // Check auth API
  const authApiPath = path.join(__dirname, 'redux/api/auth.ts');
  if (fileExists(authApiPath)) {
    logTest('Auth API slice exists', true, 'auth.ts found');
    
    const authContent = readFile(authApiPath);
    if (authContent && authContent.includes('useLoginMutation') && authContent.includes('useRegisterMutation')) {
      logTest('Auth API exports correct hooks', true, 'Login and register mutations available');
    } else {
      logTest('Auth API exports correct hooks', false, 'Missing required mutations');
    }
  } else {
    logTest('Auth API slice exists', false, 'auth.ts not found');
  }
  
  // Check posts API
  const postsApiPath = path.join(__dirname, 'redux/api/posts.ts');
  if (fileExists(postsApiPath)) {
    logTest('Posts API slice exists', true, 'posts.ts found');
    
    const postsContent = readFile(postsApiPath);
    if (postsContent && postsContent.includes('useGetFeedQuery') && postsContent.includes('useCreatePostMutation')) {
      logTest('Posts API exports correct hooks', true, 'Feed query and create post mutation available');
    } else {
      logTest('Posts API exports correct hooks', false, 'Missing required hooks');
    }
  } else {
    logTest('Posts API slice exists', false, 'posts.ts not found');
  }
  
  // Check media API
  const mediaApiPath = path.join(__dirname, 'redux/api/media.ts');
  if (fileExists(mediaApiPath)) {
    logTest('Media API slice exists', true, 'media.ts found');
    
    const mediaContent = readFile(mediaApiPath);
    if (mediaContent && mediaContent.includes('useUploadMediaMutation')) {
      logTest('Media API exports correct hooks', true, 'Upload media mutation available');
    } else {
      logTest('Media API exports correct hooks', false, 'Missing upload mutation');
    }
  } else {
    logTest('Media API slice exists', false, 'media.ts not found');
  }
}

function testReduxStore() {
  logSection('Redux Store Configuration');
  
  const storePath = path.join(__dirname, 'redux/store.ts');
  if (fileExists(storePath)) {
    logTest('Redux store file exists', true, 'store.ts found');
    
    const storeContent = readFile(storePath);
    if (storeContent) {
      // Check if new APIs are imported
      const hasAuthApi = storeContent.includes('authApi');
      const hasPostsApi = storeContent.includes('postsApi');
      const hasMediaApi = storeContent.includes('mediaApi');
      
      if (hasAuthApi && hasPostsApi && hasMediaApi) {
        logTest('Store includes new API slices', true, 'All API slices imported');
      } else {
        const missing = [];
        if (!hasAuthApi) missing.push('authApi');
        if (!hasPostsApi) missing.push('postsApi');
        if (!hasMediaApi) missing.push('mediaApi');
        logTest('Store includes new API slices', false, `Missing: ${missing.join(', ')}`);
      }
      
      // Check middleware configuration
      if (storeContent.includes('.concat(authApi.middleware)') &&
          storeContent.includes('.concat(postsApi.middleware)') &&
          storeContent.includes('.concat(mediaApi.middleware)')) {
        logTest('Store middleware configured', true, 'API middleware properly configured');
      } else {
        logTest('Store middleware configured', false, 'API middleware not properly configured');
      }
    }
  } else {
    logTest('Redux store file exists', false, 'store.ts not found');
  }
}

function testUIComponents() {
  logSection('UI Component Updates');
  
  // Check Login screen
  const loginPath = path.join(__dirname, 'screen/Auth/Login.tsx');
  if (fileExists(loginPath)) {
    logTest('Login screen exists', true, 'Login.tsx found');
    
    const loginContent = readFile(loginPath);
    if (loginContent && loginContent.includes('useLoginMutation')) {
      logTest('Login screen uses auth API', true, 'useLoginMutation imported');
    } else {
      logTest('Login screen uses auth API', false, 'Not using new auth API');
    }
  } else {
    logTest('Login screen exists', false, 'Login.tsx not found');
  }
  
  // Check Register screen
  const registerPath = path.join(__dirname, 'screen/Auth/Register.tsx');
  if (fileExists(registerPath)) {
    logTest('Register screen exists', true, 'Register.tsx found');
    
    const registerContent = readFile(registerPath);
    if (registerContent && registerContent.includes('useRegisterMutation')) {
      logTest('Register screen uses auth API', true, 'useRegisterMutation imported');
    } else {
      logTest('Register screen uses auth API', false, 'Not using new auth API');
    }
  } else {
    logTest('Register screen exists', false, 'Register.tsx not found');
  }
  
  // Check Home screen
  const homePath = path.join(__dirname, 'screen/App/HomeScreens/HomeAll.tsx');
  if (fileExists(homePath)) {
    logTest('Home screen exists', true, 'HomeAll.tsx found');
    
    const homeContent = readFile(homePath);
    if (homeContent && homeContent.includes('useGetFeedQuery')) {
      logTest('Home screen uses posts API', true, 'useGetFeedQuery imported');
    } else {
      logTest('Home screen uses posts API', false, 'Not using new posts API');
    }
  } else {
    logTest('Home screen exists', false, 'HomeAll.tsx not found');
  }
  
  // Check PostContent screen
  const postContentPath = path.join(__dirname, 'screen/App/PostContent.tsx');
  if (fileExists(postContentPath)) {
    logTest('Post creation screen exists', true, 'PostContent.tsx found');
    
    const postContentContent = readFile(postContentPath);
    if (postContentContent && 
        postContentContent.includes('useCreatePostMutation') && 
        postContentContent.includes('useUploadMediaMutation')) {
      logTest('Post creation screen uses new APIs', true, 'Post and media APIs imported');
    } else {
      logTest('Post creation screen uses new APIs', false, 'Not using new APIs');
    }
  } else {
    logTest('Post creation screen exists', false, 'PostContent.tsx not found');
  }
}

function testPackageJson() {
  logSection('Package Configuration');
  
  const packagePath = path.join(__dirname, 'package.json');
  if (fileExists(packagePath)) {
    logTest('Package.json exists', true, 'package.json found');
    
    try {
      const packageContent = JSON.parse(readFile(packagePath));
      
      // Check for required dependencies
      const deps = { ...packageContent.dependencies, ...packageContent.devDependencies };
      const requiredDeps = [
        '@reduxjs/toolkit',
        'react-redux',
        'react-native',
        'expo'
      ];
      
      const missingDeps = requiredDeps.filter(dep => !deps[dep]);
      if (missingDeps.length === 0) {
        logTest('Required dependencies present', true, 'All core dependencies found');
      } else {
        logTest('Required dependencies present', false, `Missing: ${missingDeps.join(', ')}`);
      }
      
    } catch (error) {
      logTest('Package.json is valid', false, 'Invalid JSON format');
    }
  } else {
    logTest('Package.json exists', false, 'package.json not found');
  }
}

function printSummary() {
  logSection('Test Summary');
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(test => test.success).length;
  const failedTests = totalTests - passedTests;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.filter(test => !test.success).forEach(test => {
      console.log(`  - ${test.name}: ${test.details}`);
    });
    
    console.log('\n📋 Next Steps:');
    console.log('1. Copy .env.example to .env and configure API URL');
    console.log('2. Run: npm install');
    console.log('3. Run: npm start');
  }
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All frontend tests passed! Ready to start the app.');
    console.log('\n📋 To start the frontend:');
    console.log('1. Make sure .env is configured with the correct API URL');
    console.log('2. Run: npm install');
    console.log('3. Run: npm start');
  }
}

// Main test runner
function runTests() {
  console.log('🚀 Saturn Frontend Integration Tests');
  console.log('Testing Block 1: Frontend Configuration');
  console.log(`Directory: ${__dirname}`);
  console.log(`Time: ${new Date().toISOString()}\n`);
  
  testEnvironmentConfig();
  testAPISlices();
  testReduxStore();
  testUIComponents();
  testPackageJson();
  printSummary();
}

// Run the tests
runTests();