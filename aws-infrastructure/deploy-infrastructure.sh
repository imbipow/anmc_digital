#!/bin/bash

# AWS Infrastructure Deployment Script for ANMC Digital
# Creates S3 bucket and CloudFront distribution

set -e

# Default values
ENVIRONMENT="prod"
REGION="ap-southeast-2"
STACK_NAME=""
PROFILE=""
DOMAIN_NAME=""
CERTIFICATE_ARN=""

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
    echo "  -d, --domain          Custom domain name [optional]"
    echo "  -c, --certificate     ACM Certificate ARN [required if using custom domain]"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e prod -r ap-southeast-2"
    echo "  $0 -e prod -d www.example.com -c arn:aws:acm:us-east-1:123456789:certificate/xxx"
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
        -d|--domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        -c|--certificate)
            CERTIFICATE_ARN="$2"
            shift 2
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

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
TEMPLATE_FILE="$SCRIPT_DIR/s3-cloudfront.yml"

print_info "============================================"
print_info "ANMC Digital Infrastructure Deployment"
print_info "============================================"
print_info "Environment: $ENVIRONMENT"
print_info "Region: $REGION"
print_info "Stack Name: $STACK_NAME"
if [[ -n "$DOMAIN_NAME" ]]; then
    print_info "Custom Domain: $DOMAIN_NAME"
fi
if [[ -n "$PROFILE" ]]; then
    print_info "AWS Profile: $PROFILE"
fi
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if template file exists
if [[ ! -f "$TEMPLATE_FILE" ]]; then
    print_error "CloudFormation template file '$TEMPLATE_FILE' not found."
    exit 1
fi

# Validate CloudFormation template
print_step "Validating CloudFormation template..."
aws cloudformation validate-template \
    --template-body file://$TEMPLATE_FILE \
    --region $REGION \
    $AWS_PROFILE_OPTION > /dev/null

print_info "Template validation successful."

# Build parameters
PARAMETERS="ParameterKey=Environment,ParameterValue=$ENVIRONMENT"

if [[ -n "$DOMAIN_NAME" ]]; then
    PARAMETERS="$PARAMETERS ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME"
fi

if [[ -n "$CERTIFICATE_ARN" ]]; then
    PARAMETERS="$PARAMETERS ParameterKey=CertificateArn,ParameterValue=$CERTIFICATE_ARN"
fi

# Check if stack exists
print_step "Checking if stack exists..."
STACK_EXISTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    $AWS_PROFILE_OPTION \
    --query 'Stacks[0].StackStatus' \
    --output text 2>/dev/null || echo "DOES_NOT_EXIST")

if [[ "$STACK_EXISTS" == "DOES_NOT_EXIST" ]]; then
    print_step "Creating new stack..."

    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters $PARAMETERS \
        --region $REGION \
        $AWS_PROFILE_OPTION

    print_info "Stack creation initiated. Waiting for completion..."
    print_warning "This may take 10-15 minutes for CloudFront distribution..."

    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION \
        $AWS_PROFILE_OPTION

    print_info "Stack creation completed successfully!"

else
    print_step "Updating existing stack..."

    UPDATE_OUTPUT=$(aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters $PARAMETERS \
        --region $REGION \
        $AWS_PROFILE_OPTION 2>&1) || {
        if echo "$UPDATE_OUTPUT" | grep -q "No updates are to be performed"; then
            print_warning "No updates to be performed on the stack."
        else
            print_error "Stack update failed: $UPDATE_OUTPUT"
            exit 1
        fi
    }

    if ! echo "$UPDATE_OUTPUT" | grep -q "No updates are to be performed"; then
        print_info "Stack update initiated. Waiting for completion..."

        aws cloudformation wait stack-update-complete \
            --stack-name $STACK_NAME \
            --region $REGION \
            $AWS_PROFILE_OPTION

        print_info "Stack update completed successfully!"
    fi
fi

# Get stack outputs
print_step "Getting stack outputs..."
echo ""

aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    $AWS_PROFILE_OPTION \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

echo ""
print_info "============================================"
print_info "Infrastructure deployment completed!"
print_info "============================================"
print_info ""
print_info "Next steps:"
print_info "1. Build and deploy your React app:"
print_info "   ./deploy-frontend.sh -e $ENVIRONMENT"
print_info ""
print_info "2. Or deploy manually:"
print_info "   npm run build"
print_info "   aws s3 sync build/ s3://\$(BUCKET_NAME) --delete"
print_info ""

# Get the website URL
WEBSITE_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    $AWS_PROFILE_OPTION \
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
    --output text)

print_info "Your website will be available at:"
print_info "$WEBSITE_URL"
