#!/bin/bash

# QuizMentor Mobile Build Script
# Handles building and deploying mobile apps for iOS and Android

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
PLATFORM="both"
BUILD_TYPE="preview"
SUBMIT_TO_STORE=false
AUTO_INCREMENT=true
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

Build and deploy QuizMentor mobile apps

OPTIONS:
    -p, --platform PLATFORM    Target platform (ios, android, both) [default: both]
    -t, --type BUILD_TYPE       Build type (development, preview, production) [default: preview]
    -s, --submit               Submit to app stores after successful build
    -n, --no-increment         Don't auto-increment version numbers
    -v, --verbose              Verbose output
    -h, --help                 Show this help message

BUILD TYPES:
    development    Development build with debugging enabled
    preview        Internal testing build (TestFlight/Internal Testing)
    production     Production build for app store release

EXAMPLES:
    $0 --platform ios --type preview
    $0 --platform android --type production --submit
    $0 --type development --verbose

EOF
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -t|--type)
            BUILD_TYPE="$2"
            shift 2
            ;;
        -s|--submit)
            SUBMIT_TO_STORE=true
            shift
            ;;
        -n|--no-increment)
            AUTO_INCREMENT=false
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

# Validate platform
if [[ ! "$PLATFORM" =~ ^(ios|android|both)$ ]]; then
    print_error "Invalid platform: $PLATFORM"
    print_error "Must be one of: ios, android, both"
    exit 1
fi

# Validate build type
if [[ ! "$BUILD_TYPE" =~ ^(development|preview|production)$ ]]; then
    print_error "Invalid build type: $BUILD_TYPE"
    print_error "Must be one of: development, preview, production"
    exit 1
fi

print_status "Starting mobile build process"
print_status "Platform: $PLATFORM"
print_status "Build Type: $BUILD_TYPE"
print_status "Submit to Store: $SUBMIT_TO_STORE"
print_status "Auto Increment: $AUTO_INCREMENT"

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    # Check Expo CLI
    if ! command -v expo &> /dev/null; then
        print_error "Expo CLI is not installed"
        print_status "Installing Expo CLI..."
        npm install -g @expo/cli
    fi
    
    # Check EAS CLI
    if ! command -v eas &> /dev/null; then
        print_error "EAS CLI is not installed"
        print_status "Installing EAS CLI..."
        npm install -g eas-cli
    fi
    
    # Check if logged in to Expo
    if ! eas whoami &> /dev/null; then
        print_error "Not logged in to Expo/EAS"
        print_status "Please run: eas login"
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Setup environment
setup_environment() {
    print_status "Setting up build environment..."
    
    # Set environment variables based on build type
    case $BUILD_TYPE in
        development)
            export NODE_ENV=development
            export EXPO_PUBLIC_ENV=development
            ;;
        preview)
            export NODE_ENV=production
            export EXPO_PUBLIC_ENV=preview
            ;;
        production)
            export NODE_ENV=production
            export EXPO_PUBLIC_ENV=production
            ;;
    esac
    
    # Load environment variables
    if [[ -f "config/${BUILD_TYPE}.env" ]]; then
        print_status "Loading environment from config/${BUILD_TYPE}.env"
        source "config/${BUILD_TYPE}.env"
    fi
    
    print_success "Environment setup complete"
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

# Run pre-build checks
run_prebuild_checks() {
    print_status "Running pre-build checks..."
    
    # Check app.config.js
    if [[ ! -f "app.config.js" ]]; then
        print_error "app.config.js not found"
        exit 1
    fi
    
    # Check eas.json
    if [[ ! -f "eas.json" ]]; then
        print_error "eas.json not found"
        exit 1
    fi
    
    # Validate configuration
    if [[ "$VERBOSE" == true ]]; then
        expo config --type public
    fi
    
    # Run tests if not development build
    if [[ "$BUILD_TYPE" != "development" ]]; then
        print_status "Running tests..."
        npm run test:unit
    fi
    
    print_success "Pre-build checks passed"
}

# Build for iOS
build_ios() {
    print_status "Building for iOS..."
    
    local build_profile=""
    case $BUILD_TYPE in
        development)
            build_profile="development"
            ;;
        preview)
            build_profile="preview"
            ;;
        production)
            build_profile="production-ios"
            ;;
    esac
    
    # Build command
    local build_cmd="eas build --platform ios --profile $build_profile"
    
    if [[ "$AUTO_INCREMENT" == true && "$BUILD_TYPE" == "production" ]]; then
        build_cmd="$build_cmd --auto-increment"
    fi
    
    if [[ "$VERBOSE" == false ]]; then
        build_cmd="$build_cmd --non-interactive"
    fi
    
    print_status "Executing: $build_cmd"
    eval $build_cmd
    
    print_success "iOS build completed"
}

# Build for Android
build_android() {
    print_status "Building for Android..."
    
    local build_profile=""
    case $BUILD_TYPE in
        development)
            build_profile="development"
            ;;
        preview)
            build_profile="preview"
            ;;
        production)
            build_profile="production-android"
            ;;
    esac
    
    # Build command
    local build_cmd="eas build --platform android --profile $build_profile"
    
    if [[ "$AUTO_INCREMENT" == true && "$BUILD_TYPE" == "production" ]]; then
        build_cmd="$build_cmd --auto-increment"
    fi
    
    if [[ "$VERBOSE" == false ]]; then
        build_cmd="$build_cmd --non-interactive"
    fi
    
    print_status "Executing: $build_cmd"
    eval $build_cmd
    
    print_success "Android build completed"
}

# Submit to app stores
submit_to_stores() {
    if [[ "$SUBMIT_TO_STORE" == false || "$BUILD_TYPE" != "production" ]]; then
        return 0
    fi
    
    print_status "Submitting to app stores..."
    
    if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "both" ]]; then
        print_status "Submitting to App Store..."
        eas submit --platform ios --profile production-ios --non-interactive
        print_success "Submitted to App Store"
    fi
    
    if [[ "$PLATFORM" == "android" || "$PLATFORM" == "both" ]]; then
        print_status "Submitting to Google Play..."
        eas submit --platform android --profile production-android --non-interactive
        print_success "Submitted to Google Play"
    fi
}

# Generate build artifacts
generate_artifacts() {
    print_status "Generating build artifacts..."
    
    # Create build info file
    cat > build-info.json << EOF
{
  "buildDate": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "buildType": "$BUILD_TYPE",
  "platform": "$PLATFORM",
  "version": "$(node -p "require('./package.json').version")",
  "gitCommit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "gitBranch": "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'unknown')",
  "nodeVersion": "$(node --version)",
  "expoVersion": "$(expo --version)"
}
EOF
    
    print_success "Build artifacts generated"
}

# Send notifications
send_notifications() {
    if [[ "$BUILD_TYPE" == "production" ]]; then
        print_status "Build completed successfully!"
        print_status "Platform: $PLATFORM"
        print_status "Build Type: $BUILD_TYPE"
        print_status "Timestamp: $(date)"
        
        # You can add webhook notifications here
        # curl -X POST "your-webhook-url" -d "Build completed for $PLATFORM"
    fi
}

# Cleanup
cleanup() {
    print_status "Cleaning up..."
    
    # Remove temporary files
    rm -f build-info.json
    
    # Clear Expo cache if development build
    if [[ "$BUILD_TYPE" == "development" ]]; then
        expo r -c &> /dev/null || true
    fi
    
    print_success "Cleanup completed"
}

# Main build flow
main() {
    print_status "QuizMentor Mobile Build Script"
    echo
    
    check_prerequisites
    setup_environment
    install_dependencies
    run_prebuild_checks
    
    # Build for specified platforms
    if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "both" ]]; then
        build_ios
    fi
    
    if [[ "$PLATFORM" == "android" || "$PLATFORM" == "both" ]]; then
        build_android
    fi
    
    submit_to_stores
    generate_artifacts
    send_notifications
    cleanup
    
    print_success "Mobile build process completed successfully!"
    
    # Show build summary
    echo
    print_status "Build Summary:"
    echo "  Platform: $PLATFORM"
    echo "  Build Type: $BUILD_TYPE"
    echo "  Submitted: $SUBMIT_TO_STORE"
    echo "  Timestamp: $(date)"
    
    if [[ "$BUILD_TYPE" == "production" ]]; then
        echo
        print_warning "Production build completed!"
        print_warning "Don't forget to:"
        echo "  1. Test the build thoroughly"
        echo "  2. Update release notes"
        echo "  3. Monitor app store review status"
        echo "  4. Prepare marketing materials"
    fi
}

# Run main function
main "$@"
