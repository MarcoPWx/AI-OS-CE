#!/bin/bash

# QuizMentor Deployment Script
# This script handles deployment to different environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT="development"
BUILD_MOBILE=false
BUILD_WEB=false
BUILD_API=false
DEPLOY_K8S=false
RUN_TESTS=true
VERBOSE=false

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS]

Deploy QuizMentor to specified environment

OPTIONS:
    -e, --env ENVIRONMENT       Target environment (development, staging, production)
    -m, --mobile               Build and deploy mobile app
    -w, --web                  Build and deploy web app
    -a, --api                  Build and deploy API
    -k, --kubernetes           Deploy to Kubernetes cluster
    -t, --no-tests             Skip running tests
    -v, --verbose              Verbose output
    -h, --help                 Show this help message

EXAMPLES:
    $0 --env production --web --api --kubernetes
    $0 --env staging --mobile --web
    $0 --env development --api --no-tests

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -m|--mobile)
            BUILD_MOBILE=true
            shift
            ;;
        -w|--web)
            BUILD_WEB=true
            shift
            ;;
        -a|--api)
            BUILD_API=true
            shift
            ;;
        -k|--kubernetes)
            DEPLOY_K8S=true
            shift
            ;;
        -t|--no-tests)
            RUN_TESTS=false
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    print_error "Must be one of: development, staging, production"
    exit 1
fi

print_status "Starting deployment to $ENVIRONMENT environment"

# Check if at least one build target is specified
if [[ "$BUILD_MOBILE" == false && "$BUILD_WEB" == false && "$BUILD_API" == false ]]; then
    print_warning "No build targets specified. Building all components."
    BUILD_MOBILE=true
    BUILD_WEB=true
    BUILD_API=true
fi

# Load environment variables
if [[ -f "config/${ENVIRONMENT}.env" ]]; then
    print_status "Loading environment variables from config/${ENVIRONMENT}.env"
    source "config/${ENVIRONMENT}.env"
else
    print_warning "No environment file found for $ENVIRONMENT"
fi

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Docker (if building containers)
    if [[ "$BUILD_API" == true || "$DEPLOY_K8S" == true ]]; then
        if ! command -v docker &> /dev/null; then
            print_error "Docker is not installed"
            exit 1
        fi
    fi
    
    # Check kubectl (if deploying to Kubernetes)
    if [[ "$DEPLOY_K8S" == true ]]; then
        if ! command -v kubectl &> /dev/null; then
            print_error "kubectl is not installed"
            exit 1
        fi
    fi
    
    # Check Expo CLI (if building mobile)
    if [[ "$BUILD_MOBILE" == true ]]; then
        if ! command -v expo &> /dev/null; then
            print_warning "Expo CLI not found, installing..."
            npm install -g @expo/cli
        fi
    fi
    
    print_success "Prerequisites check passed"
}

# Install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    if [[ "$VERBOSE" == true ]]; then
        npm install
    else
        npm install --silent
    fi
    
    print_success "Dependencies installed"
}

# Run tests
run_tests() {
    if [[ "$RUN_TESTS" == true ]]; then
        print_status "Running tests..."
        
        # Run unit tests
        npm run test:unit
        
        # Run API contract tests
        if [[ "$BUILD_API" == true ]]; then
            npm run test:api
        fi
        
        # Run E2E tests (only in development/staging)
        if [[ "$ENVIRONMENT" != "production" ]]; then
            npm run test:e2e
        fi
        
        print_success "All tests passed"
    else
        print_warning "Skipping tests"
    fi
}

# Build mobile app
build_mobile() {
    if [[ "$BUILD_MOBILE" == true ]]; then
        print_status "Building mobile app for $ENVIRONMENT..."
        
        case $ENVIRONMENT in
            development)
                expo build:android --type apk
                expo build:ios --type simulator
                ;;
            staging)
                expo build:android --type app-bundle
                expo build:ios --type archive
                ;;
            production)
                expo build:android --type app-bundle --release-channel production
                expo build:ios --type archive --release-channel production
                ;;
        esac
        
        print_success "Mobile app built successfully"
    fi
}

# Build web app
build_web() {
    if [[ "$BUILD_WEB" == true ]]; then
        print_status "Building web app for $ENVIRONMENT..."
        
        # Set environment variables
        export NODE_ENV=$ENVIRONMENT
        
        # Build Next.js app
        npm run build:web
        
        # Build Docker image for production
        if [[ "$ENVIRONMENT" == "production" ]]; then
            docker build -t quizmentor/web:latest -f Dockerfile.web .
            
            # Tag with version if available
            if [[ -n "$APP_VERSION" ]]; then
                docker tag quizmentor/web:latest quizmentor/web:$APP_VERSION
            fi
        fi
        
        print_success "Web app built successfully"
    fi
}

# Build API
build_api() {
    if [[ "$BUILD_API" == true ]]; then
        print_status "Building API for $ENVIRONMENT..."
        
        # Build TypeScript
        cd api && npm run build && cd ..
        
        # Build Docker image
        docker build -t quizmentor/api:latest -f api/Dockerfile ./api
        
        # Tag with version if available
        if [[ -n "$APP_VERSION" ]]; then
            docker tag quizmentor/api:latest quizmentor/api:$APP_VERSION
        fi
        
        print_success "API built successfully"
    fi
}

# Deploy to Kubernetes
deploy_kubernetes() {
    if [[ "$DEPLOY_K8S" == true ]]; then
        print_status "Deploying to Kubernetes cluster..."
        
        # Apply namespace and configurations
        kubectl apply -f deployment/production.yml
        
        # Wait for deployments to be ready
        kubectl wait --for=condition=available --timeout=300s deployment/quizmentor-api -n quizmentor-prod
        kubectl wait --for=condition=available --timeout=300s deployment/quizmentor-web -n quizmentor-prod
        
        # Get service URLs
        print_status "Getting service information..."
        kubectl get services -n quizmentor-prod
        
        print_success "Kubernetes deployment completed"
    fi
}

# Deploy to Vercel (for web)
deploy_vercel() {
    if [[ "$BUILD_WEB" == true && "$ENVIRONMENT" == "production" ]]; then
        print_status "Deploying web app to Vercel..."
        
        if command -v vercel &> /dev/null; then
            vercel --prod
            print_success "Web app deployed to Vercel"
        else
            print_warning "Vercel CLI not found, skipping Vercel deployment"
        fi
    fi
}

# Deploy mobile app
deploy_mobile() {
    if [[ "$BUILD_MOBILE" == true && "$ENVIRONMENT" == "production" ]]; then
        print_status "Submitting mobile app to app stores..."
        
        # Submit to Google Play
        if [[ -n "$GOOGLE_PLAY_SERVICE_ACCOUNT" ]]; then
            expo upload:android --key "$GOOGLE_PLAY_SERVICE_ACCOUNT"
        fi
        
        # Submit to App Store
        if [[ -n "$APPLE_ID" && -n "$APPLE_ID_PASSWORD" ]]; then
            expo upload:ios --apple-id "$APPLE_ID" --apple-id-password "$APPLE_ID_PASSWORD"
        fi
        
        print_success "Mobile app submitted to app stores"
    fi
}

# Health check
health_check() {
    if [[ "$BUILD_API" == true ]]; then
        print_status "Performing health check..."
        
        # Wait a moment for services to start
        sleep 10
        
        # Check API health
        if [[ "$DEPLOY_K8S" == true ]]; then
            API_URL="https://api.quizmentor.com"
        else
            API_URL="http://localhost:3001"
        fi
        
        if curl -f "$API_URL/health" &> /dev/null; then
            print_success "API health check passed"
        else
            print_error "API health check failed"
            exit 1
        fi
    fi
}

# Cleanup
cleanup() {
    print_status "Cleaning up temporary files..."
    
    # Remove build artifacts if needed
    if [[ "$ENVIRONMENT" != "production" ]]; then
        rm -rf .next/cache
        rm -rf node_modules/.cache
    fi
    
    print_success "Cleanup completed"
}

# Main deployment flow
main() {
    print_status "QuizMentor Deployment Script"
    print_status "Environment: $ENVIRONMENT"
    print_status "Mobile: $BUILD_MOBILE, Web: $BUILD_WEB, API: $BUILD_API"
    print_status "Kubernetes: $DEPLOY_K8S, Tests: $RUN_TESTS"
    echo
    
    check_prerequisites
    install_dependencies
    run_tests
    build_mobile
    build_web
    build_api
    deploy_kubernetes
    deploy_vercel
    deploy_mobile
    health_check
    cleanup
    
    print_success "Deployment completed successfully!"
    
    # Show deployment summary
    echo
    print_status "Deployment Summary:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Timestamp: $(date)"
    
    if [[ "$BUILD_WEB" == true ]]; then
        echo "  Web App: Deployed"
    fi
    
    if [[ "$BUILD_API" == true ]]; then
        echo "  API: Deployed"
    fi
    
    if [[ "$BUILD_MOBILE" == true ]]; then
        echo "  Mobile App: Built"
    fi
    
    if [[ "$DEPLOY_K8S" == true ]]; then
        echo "  Kubernetes: Deployed"
    fi
}

# Run main function
main "$@"