#!/bin/bash

# QuizMentor Test Runner Script
# Provides easy commands for running different test suites

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_color() {
    color=$1
    message=$2
    echo -e "${color}${message}${NC}"
}

# Function to show usage
show_usage() {
    print_color "$BLUE" "QuizMentor Test Runner"
    echo ""
    echo "Usage: ./scripts/test-runner.sh [command]"
    echo ""
    echo "Commands:"
    echo "  all           - Run all tests with coverage"
    echo "  unit          - Run unit tests only"
    echo "  integration   - Run integration tests only"
    echo "  e2e           - Run E2E tests with Playwright"
    echo "  screen        - Run screen component tests"
    echo "  service       - Run service tests"
    echo "  store         - Run store tests"
    echo "  watch         - Run tests in watch mode"
    echo "  coverage      - Generate and open coverage report"
    echo "  ci            - Run tests in CI mode"
    echo "  quick         - Run quick smoke tests"
    echo "  help          - Show this help message"
    echo ""
}

# Main command handler
case "$1" in
    all)
        print_color "$BLUE" "Running all tests with coverage..."
        npm test -- --coverage --silent
        ;;
    
    unit)
        print_color "$BLUE" "Running unit tests..."
        npm test -- --testPathPattern='(screens|services|store)/__tests__' --silent
        ;;
    
    integration)
        print_color "$BLUE" "Running integration tests..."
        npm test -- --testPathPattern='__tests__/integration' --silent
        ;;
    
    e2e)
        print_color "$BLUE" "Running E2E tests..."
        npx playwright test
        ;;
    
    screen)
        print_color "$BLUE" "Running screen tests..."
        npm test -- --testPathPattern='screens/__tests__' --silent
        ;;
    
    service)
        print_color "$BLUE" "Running service tests..."
        npm test -- --testPathPattern='services/__tests__' --silent
        ;;
    
    store)
        print_color "$BLUE" "Running store tests..."
        npm test -- --testPathPattern='store/__tests__' --silent
        ;;
    
    watch)
        print_color "$BLUE" "Running tests in watch mode..."
        npm test -- --watch
        ;;
    
    coverage)
        print_color "$BLUE" "Generating coverage report..."
        npm test -- --coverage --silent
        print_color "$GREEN" "Opening coverage report..."
        open coverage/lcov-report/index.html 2>/dev/null || xdg-open coverage/lcov-report/index.html 2>/dev/null || echo "Please open coverage/lcov-report/index.html manually"
        ;;
    
    ci)
        print_color "$BLUE" "Running tests in CI mode..."
        npm test -- --coverage --ci --silent --maxWorkers=2
        ;;
    
    quick)
        print_color "$BLUE" "Running quick smoke tests..."
        npm test -- --testNamePattern='should render|should load|should initialize' --silent
        ;;
    
    help|--help|-h)
        show_usage
        ;;
    
    *)
        print_color "$RED" "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac

# Check exit code
if [ $? -eq 0 ]; then
    print_color "$GREEN" "✅ Tests completed successfully!"
else
    print_color "$RED" "❌ Tests failed!"
    exit 1
fi
