#!/bin/bash

# Save the current directory
CURRENT_DIR=$(pwd)

# Print working directory for debugging
echo "Current directory: $CURRENT_DIR"

# Remove node_modules and yarn.lock files
echo "Removing node_modules and yarn.lock files..."
find . -name "node_modules" -type d -exec rm -rf {} +
find . -name "yarn.lock" -type f -delete

# Clean yarn cache
echo "Cleaning yarn cache..."
yarn cache clean

# Reinstall dependencies
echo "Reinstalling dependencies..."
yarn install

echo "Done! Dependencies have been reinstalled with a fresh yarn.lock file."
