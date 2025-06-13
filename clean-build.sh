#!/bin/bash
#
# A rigorous cleanup script to remove all caches and build artifacts.
# Use this when you suspect dependency or cache-related issues.

echo "🧹 Starting deep clean of the Saturn project..."

# 1. Clean root node_modules
echo "🔥 Removing root node_modules..."
rm -rf node_modules

# 2. Clean frontend workspace
echo "🔥 Removing frontend node_modules and build artifacts..."
rm -rf packages/frontend/node_modules
rm -rf packages/frontend/ios/build
rm -rf packages/frontend/android/build
rm -rf packages/frontend/.expo

# 3. Clean server workspace
echo "🔥 Removing server node_modules and build artifacts..."
rm -rf packages/server/node_modules
rm -rf packages/server/dist

# 4. Clean CocoaPods cache
echo "🔥 Removing CocoaPods cache..."
rm -rf ~/Library/Caches/CocoaPods
rm -rf packages/frontend/ios/Pods
rm -f packages/frontend/ios/Podfile.lock

# 5. Clean npm cache
echo "🔥 Cleaning npm cache..."
npm cache clean --force

echo "✅ Deep clean complete. Run 'npm install' to rebuild." 