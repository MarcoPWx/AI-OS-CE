#!/bin/bash

# E2E Test Runner Script for QuizMentor
# Supports both Playwright (web) and Detox (React Native) tests

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test environment
TEST_ENV=${1:-"all"}
PLATFORM=${2:-"all"}
HEADLESS=${3:-"false"}

echo -e "${GREEN}🧪 QuizMentor E2E Test Runner${NC}"
echo "================================"

# Function to run Playwright tests
run_playwright_tests() {
    echo -e "${YELLOW}Running Playwright tests...${NC}"
    
    # Install dependencies if needed
    if [ ! -d "node_modules/@playwright" ]; then
        echo "Installing Playwright..."
        npm install --save-dev @playwright/test
        npx playwright install
    fi
    
    # Run tests based on platform
    if [ "$PLATFORM" = "mobile" ]; then
        npx playwright test --project="Mobile Chrome" --project="Mobile Safari"
    elif [ "$PLATFORM" = "desktop" ]; then
        npx playwright test --project=chromium --project=firefox --project=webkit
    else
        npx playwright test
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Playwright tests passed${NC}"
    else
        echo -e "${RED}❌ Playwright tests failed${NC}"
        exit 1
    fi
}

# Function to run Detox tests
run_detox_tests() {
    echo -e "${YELLOW}Running Detox tests...${NC}"
    
    # Check if React Native is set up
    if [ ! -f "ios/Podfile" ]; then
        echo -e "${RED}React Native iOS not configured. Skipping Detox tests.${NC}"
        return
    fi
    
    # Build the app for testing
    echo "Building app for Detox..."
    
    if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "all" ]; then
        echo "Building iOS app..."
        detox build --configuration ios.sim.debug
        
        echo "Running iOS tests..."
        detox test --configuration ios.sim.debug
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ iOS Detox tests passed${NC}"
        else
            echo -e "${RED}❌ iOS Detox tests failed${NC}"
            exit 1
        fi
    fi
    
    if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "all" ]; then
        echo "Building Android app..."
        detox build --configuration android.emu.debug
        
        echo "Running Android tests..."
        detox test --configuration android.emu.debug
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Android Detox tests passed${NC}"
        else
            echo -e "${RED}❌ Android Detox tests failed${NC}"
            exit 1
        fi
    fi
}

# Function to run API tests
run_api_tests() {
    echo -e "${YELLOW}Running API integration tests...${NC}"
    
    # Run Jest tests for API
    npm test -- --testPathPattern=api.test.ts --coverage
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ API tests passed${NC}"
    else
        echo -e "${RED}❌ API tests failed${NC}"
        exit 1
    fi
}

# Function to run performance tests
run_performance_tests() {
    echo -e "${YELLOW}Running performance tests...${NC}"
    
    # Run Lighthouse CI for web performance
    if command -v lhci &> /dev/null; then
        lhci autorun
    else
        echo "Lighthouse CI not installed. Installing..."
        npm install -g @lhci/cli
        lhci autorun
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Performance tests passed${NC}"
    else
        echo -e "${RED}❌ Performance tests failed${NC}"
        exit 1
    fi
}

# Function to generate test report
generate_report() {
    echo -e "${YELLOW}Generating test report...${NC}"
    
    # Merge test results
    if [ -f "test-results/results.json" ]; then
        echo "Playwright results found"
    fi
    
    if [ -f "artifacts/detox-results.json" ]; then
        echo "Detox results found"
    fi
    
    # Generate HTML report
  npx playwright show-report
  # Ensure a JSON summary exists (derive from HTML if needed)
  if [ -f "scripts/ensure-playwright-summary.js" ]; then
    node scripts/ensure-playwright-summary.js || true
  fi
    
    echo -e "${GREEN}✅ Test report generated (see playwright-report/index.html). JSON summary (if created): playwright-summary.json${NC}"
}

# Clean up before tests
cleanup() {
    echo -e "${YELLOW}Cleaning up test artifacts...${NC}"
    rm -rf test-results
    rm -rf artifacts
    rm -rf coverage
    mkdir -p test-results
    mkdir -p artifacts
}

# Main execution
main() {
    cleanup
    
    case "$TEST_ENV" in
        "web")
            run_playwright_tests
            ;;
        "mobile")
            run_detox_tests
            ;;
        "api")
            run_api_tests
            ;;
        "performance")
            run_performance_tests
            ;;
        "all")
            run_api_tests
            run_playwright_tests
            run_detox_tests
            run_performance_tests
            ;;
        *)
            echo -e "${RED}Invalid test environment: $TEST_ENV${NC}"
            echo "Usage: ./run-tests.sh [web|mobile|api|performance|all] [platform] [headless]"
            exit 1
            ;;
    esac
    
    generate_report
    
    echo -e "${GREEN}🎉 All tests completed successfully!${NC}"
}

# Handle interrupts
trap 'echo -e "${RED}Tests interrupted${NC}"; exit 1' INT TERM

# Run main function
main
