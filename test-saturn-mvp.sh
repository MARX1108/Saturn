#!/bin/bash

# Saturn MVP Integration Test Suite
# Tests Block 1: Pilot-Ready MVP Integration

echo "🚀 Saturn MVP Integration Test Suite"
echo "Testing Block 1: Pilot-Ready MVP Integration"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the Saturn root directory
if [ ! -d "packages/server" ] || [ ! -d "packages/frontend" ]; then
    echo -e "${RED}❌ Error: This script must be run from the Saturn root directory${NC}"
    echo "Current directory: $(pwd)"
    echo "Expected structure:"
    echo "  - packages/server/"
    echo "  - packages/frontend/"
    exit 1
fi

# Function to check if server is running
check_server() {
    if curl -s http://localhost:4000/ > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to wait for server
wait_for_server() {
    echo "⏳ Waiting for server to start..."
    for i in {1..30}; do
        if check_server; then
            echo -e "${GREEN}✅ Server is running${NC}"
            return 0
        fi
        sleep 1
        echo -n "."
    done
    echo -e "${RED}❌ Server failed to start within 30 seconds${NC}"
    return 1
}

echo -e "${BLUE}📋 Test Plan:${NC}"
echo "1. Backend Configuration Tests"
echo "2. Backend API Integration Tests"
echo "3. Frontend Configuration Tests"
echo "4. Integration Validation"
echo ""

# Step 1: Backend Tests
echo -e "${YELLOW}🔧 Step 1: Backend Configuration Tests${NC}"
cd packages/server

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env from .env.example${NC}"
    else
        echo -e "${RED}❌ No .env.example found${NC}"
        exit 1
    fi
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Start server if not running
if ! check_server; then
    echo "🚀 Starting Saturn backend server..."
    npm run dev > server.log 2>&1 &
    SERVER_PID=$!
    echo "Server PID: $SERVER_PID"
    
    if wait_for_server; then
        echo -e "${GREEN}✅ Backend server started successfully${NC}"
    else
        echo -e "${RED}❌ Failed to start backend server${NC}"
        echo "Server log:"
        cat server.log
        exit 1
    fi
else
    echo -e "${GREEN}✅ Backend server is already running${NC}"
fi

# Step 2: Backend API Tests
echo ""
echo -e "${YELLOW}🧪 Step 2: Backend API Integration Tests${NC}"

# Check if axios is available for API tests
if ! npm list axios > /dev/null 2>&1; then
    echo "📦 Installing test dependencies..."
    npm install --save-dev axios form-data
fi

# Run backend API tests
echo "Running backend API tests..."
node test-api.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend API tests passed${NC}"
else
    echo -e "${RED}❌ Backend API tests failed${NC}"
    if [ ! -z "$SERVER_PID" ]; then
        echo "🛑 Stopping server..."
        kill $SERVER_PID
    fi
    exit 1
fi

# Step 3: Frontend Tests
echo ""
echo -e "${YELLOW}🎨 Step 3: Frontend Configuration Tests${NC}"
cd ../frontend

# Check frontend configuration
echo "Running frontend configuration tests..."
node test-frontend.js

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend configuration tests passed${NC}"
else
    echo -e "${YELLOW}⚠️  Some frontend configuration issues found${NC}"
    echo "You may need to:"
    echo "1. Copy .env.example to .env"
    echo "2. Run npm install"
    echo "3. Fix any missing dependencies"
fi

# Step 4: Integration Summary
echo ""
echo -e "${YELLOW}📊 Step 4: Integration Summary${NC}"
cd ../..

echo ""
echo -e "${GREEN}🎉 Saturn MVP Integration Tests Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Manual Testing Instructions:${NC}"
echo ""
echo "Backend (packages/server):"
echo "  - Server running at: http://localhost:4000"
echo "  - API base URL: http://localhost:4000/api"
echo "  - Health check: curl http://localhost:4000/"
echo ""
echo "Frontend (packages/frontend):"
echo "  1. Copy .env.example to .env (if not done)"
echo "  2. Set EXPO_PUBLIC_API_URL=http://localhost:4000"
echo "  3. Run: npm install"
echo "  4. Run: npm start"
echo ""
echo -e "${BLUE}🔗 Test the complete flow:${NC}"
echo "  1. Open the app and register a new user"
echo "  2. Login with the registered user"
echo "  3. View the feed (initially empty)"
echo "  4. Create a new post"
echo "  5. Verify the post appears in the feed"
echo "  6. Test media upload (optional)"
echo ""

if [ ! -z "$SERVER_PID" ]; then
    echo -e "${YELLOW}🛑 To stop the backend server:${NC}"
    echo "  kill $SERVER_PID"
fi

echo ""
echo -e "${GREEN}✅ Block 1: Pilot-Ready MVP Integration - Validation Complete${NC}"