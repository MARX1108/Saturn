#!/usr/bin/env node

// Simple test to check if our React Native/Expo setup works
const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Saturn Frontend Setup...\n');

// Check critical files
const criticalFiles = [
  'App.tsx',
  'package.json',
  'babel.config.js',
  '.env',
  'node_modules/expo/AppEntry.js'
];

let allGood = true;

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allGood = false;
  }
});

// Check environment variables
console.log('\n🔍 Environment Variables:');
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('EXPO_PUBLIC_API_URL')) {
    console.log('✅ EXPO_PUBLIC_API_URL configured');
  } else {
    console.log('❌ EXPO_PUBLIC_API_URL missing');
    allGood = false;
  }
} else {
  console.log('❌ .env file missing');
  allGood = false;
}

// Check package.json main field
console.log('\n🔍 Package Configuration:');
const packagePath = path.join(__dirname, 'package.json');
const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
if (packageData.main === 'node_modules/expo/AppEntry.js') {
  console.log('✅ Package.json main field correct');
} else {
  console.log(`❌ Package.json main field incorrect: ${packageData.main}`);
  allGood = false;
}

// Check important dependencies
console.log('\n🔍 Key Dependencies:');
const importantDeps = ['expo', 'react', 'react-native', '@reduxjs/toolkit'];
importantDeps.forEach(dep => {
  if (packageData.dependencies[dep]) {
    console.log(`✅ ${dep}: ${packageData.dependencies[dep]}`);
  } else {
    console.log(`❌ ${dep} missing`);
    allGood = false;
  }
});

console.log('\n📊 Summary:');
if (allGood) {
  console.log('🎉 Frontend setup looks good!');
  console.log('\n📋 Next steps:');
  console.log('1. Kill any existing Metro bundlers');
  console.log('2. Run: npx expo start --clear');
  console.log('3. Try web version: npx expo start --web');
  console.log('4. For iOS: scan QR code with Expo Go app');
} else {
  console.log('❌ Setup has issues. Please fix the missing items above.');
}

console.log('\n🔗 Useful commands:');
console.log('- Clear all caches: rm -rf .expo node_modules/.cache');
console.log('- Kill Metro: pkill -f metro');
console.log('- Reset Watchman: watchman watch-del . && watchman watch-project .');