#!/bin/bash

# AWS S3 + CloudFront Deployment Script for ANMC Digital React App
# This script deploys the React build to S3 and invalidates CloudFront cache

set -e

# Default values
ENVIRONMENT="prod"
REGION="ap-southeast-2"
STACK_NAME=""
PROFILE=""
BUILD_ONLY=false
DEPLOY_ONLY=false
SKIP_INVALIDATION=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment     Environment (dev|staging|prod) [default: prod]"
    echo "  -r, --region          AWS region [default: ap-southeast-2]"
    echo "  -s, --stack-name      CloudFormation stack name [default: anmc-frontend-{environment}]"
    echo "  -p, --profile         AWS profile to use [optional]"
    echo "  -b, --build-only      Only build React app, don't deploy"
    echo "  -d, --deploy-only     Only deploy (skip build)"
    echo "  --skip-invalidation   Skip CloudFront cache invalidation"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Full deployment to prod"
    echo "  $0 -e staging                         # Deploy to staging"
    echo "  $0 -b                                 # Build only"
    echo "  $0 -d --skip-invalidation             # Deploy without cache invalidation"
    echo "  $0 -e prod -p production -r ap-southeast-2"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -r|--region)
            REGION="$2"
            shift 2
            ;;
        -s|--stack-name)
            STACK_NAME="$2"
            shift 2
            ;;
        -p|--profile)
            PROFILE="$2"
            shift 2
            ;;
        -b|--build-only)
            BUILD_ONLY=true
            shift
            ;;
        -d|--deploy-only)
            DEPLOY_ONLY=true
            shift
            ;;
        --skip-invalidation)
            SKIP_INVALIDATION=true
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
    print_error "Invalid environment. Must be one of: dev, staging, prod"
    exit 1
fi

# Set default stack name if not provided
if [[ -z "$STACK_NAME" ]]; then
    STACK_NAME="anmc-frontend-${ENVIRONMENT}"
fi

# Build AWS CLI profile option
AWS_PROFILE_OPTION=""
if [[ -n "$PROFILE" ]]; then
    AWS_PROFILE_OPTION="--profile $PROFILE"
fi

# Get project root directory (parent of aws-infrastructure)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$PROJECT_ROOT/build"

print_info "============================================"
print_info "ANMC Digital Frontend Deployment"
print_info "============================================"
print_info "Environment: $ENVIRONMENT"
print_info "Region: $REGION"
print_info "Stack Name: $STACK_NAME"
print_info "Project Root: $PROJECT_ROOT"
if [[ -n "$PROFILE" ]]; then
    print_info "AWS Profile: $PROFILE"
fi
echo ""

# ============================================
# STEP 1: Build React App
# ============================================
if [[ "$DEPLOY_ONLY" != true ]]; then
    print_step "Building React application..."

    cd "$PROJECT_ROOT"

    # Check if package.json exists
    if [[ ! -f "package.json" ]]; then
        print_error "package.json not found in $PROJECT_ROOT"
        exit 1
    fi

    # Install dependencies if node_modules doesn't exist
    if [[ ! -d "node_modules" ]]; then
        print_info "Installing dependencies..."
        npm install
    fi

    # Set environment for build
    export REACT_APP_ENV=$ENVIRONMENT

    # Run production build
    print_info "Running npm build..."
    npm run build

    if [[ ! -d "$BUILD_DIR" ]]; then
        print_error "Build failed - build directory not found"
        exit 1
    fi

    print_info "Build completed successfully!"

    if [[ "$BUILD_ONLY" == true ]]; then
        print_info "Build-only mode - skipping deployment"
        exit 0
    fi
fi

# Check if build directory exists for deploy-only mode
if [[ "$DEPLOY_ONLY" == true ]] && [[ ! -d "$BUILD_DIR" ]]; then
    print_error "Build directory not found. Run build first or remove --deploy-only flag"
    exit 1
fi

# ============================================
# STEP 2: Get S3 Bucket and CloudFront Distribution
# ============================================
print_step "Getting deployment configuration from CloudFormation..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Get stack outputs
BUCKET_NAME=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    $AWS_PROFILE_OPTION \
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' \
    --output text 2>/dev/null)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    $AWS_PROFILE_OPTION \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text 2>/dev/null)

WEBSITE_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    $AWS_PROFILE_OPTION \
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
    --output text 2>/dev/null)

if [[ -z "$BUCKET_NAME" ]] || [[ "$BUCKET_NAME" == "None" ]]; then
    print_error "Could not find S3 bucket. Make sure the CloudFormation stack exists."
    print_info "Run: ./deploy-infrastructure.sh -e $ENVIRONMENT first"
    exit 1
fi

print_info "S3 Bucket: $BUCKET_NAME"
print_info "CloudFront Distribution: $DISTRIBUTION_ID"

# ============================================
# STEP 3: Upload to S3
# ============================================
print_step "Uploading build files to S3..."

# Sync build directory to S3
aws s3 sync "$BUILD_DIR" "s3://$BUCKET_NAME" \
    --delete \
    --region $REGION \
    $AWS_PROFILE_OPTION \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --exclude "service-worker.js" \
    --exclude "*.map"

# Upload index.html with no-cache (for SPA updates)
aws s3 cp "$BUILD_DIR/index.html" "s3://$BUCKET_NAME/index.html" \
    --region $REGION \
    $AWS_PROFILE_OPTION \
    --cache-control "no-cache, no-store, must-revalidate" \
    --content-type "text/html"

# Upload service worker with no-cache
if [[ -f "$BUILD_DIR/service-worker.js" ]]; then
    aws s3 cp "$BUILD_DIR/service-worker.js" "s3://$BUCKET_NAME/service-worker.js" \
        --region $REGION \
        $AWS_PROFILE_OPTION \
        --cache-control "no-cache, no-store, must-revalidate"
fi

print_info "Upload completed!"

# ============================================
# STEP 4: Invalidate CloudFront Cache
# ============================================
if [[ "$SKIP_INVALIDATION" != true ]] && [[ -n "$DISTRIBUTION_ID" ]] && [[ "$DISTRIBUTION_ID" != "None" ]]; then
    print_step "Invalidating CloudFront cache..."

    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id $DISTRIBUTION_ID \
        --paths "/*" \
        $AWS_PROFILE_OPTION \
        --query 'Invalidation.Id' \
        --output text)

    print_info "Invalidation created: $INVALIDATION_ID"
    print_warning "Cache invalidation may take a few minutes to propagate."
else
    print_warning "Skipping CloudFront cache invalidation"
fi

# ============================================
# Done!
# ============================================
echo ""
print_info "============================================"
print_info "Deployment completed successfully!"
print_info "============================================"
print_info "Website URL: $WEBSITE_URL"
echo ""
print_warning "Note: It may take a few minutes for changes to propagate globally."
