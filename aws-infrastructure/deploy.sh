#!/bin/bash

# AWS DynamoDB Deployment Script for ANMC Digital
# This script deploys the DynamoDB tables using CloudFormation

set -e

# Default values
ENVIRONMENT="dev"
REGION="us-east-1"
STACK_NAME=""
PROFILE=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Function to show usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --environment   Environment (dev|staging|prod) [default: dev]"
    echo "  -r, --region        AWS region [default: us-east-1]"
    echo "  -s, --stack-name    CloudFormation stack name [default: anmc-dynamodb-{environment}]"
    echo "  -p, --profile       AWS profile to use [optional]"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 -e dev -r us-east-1"
    echo "  $0 -e prod -r ap-southeast-2 -p production"
    echo "  $0 --environment staging --region us-west-2"
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
    STACK_NAME="anmc-dynamodb-${ENVIRONMENT}"
fi

# Build AWS CLI profile option
AWS_PROFILE_OPTION=""
if [[ -n "$PROFILE" ]]; then
    AWS_PROFILE_OPTION="--profile $PROFILE"
fi

print_info "Starting DynamoDB deployment..."
print_info "Environment: $ENVIRONMENT"
print_info "Region: $REGION"
print_info "Stack Name: $STACK_NAME"
if [[ -n "$PROFILE" ]]; then
    print_info "AWS Profile: $PROFILE"
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if template file exists
TEMPLATE_FILE="dynamodb-tables.yml"
if [[ ! -f "$TEMPLATE_FILE" ]]; then
    print_error "CloudFormation template file '$TEMPLATE_FILE' not found."
    exit 1
fi

# Validate CloudFormation template
print_info "Validating CloudFormation template..."
aws cloudformation validate-template \
    --template-body file://$TEMPLATE_FILE \
    --region $REGION \
    $AWS_PROFILE_OPTION

if [[ $? -ne 0 ]]; then
    print_error "CloudFormation template validation failed."
    exit 1
fi

print_info "Template validation successful."

# Check if stack exists
print_info "Checking if stack exists..."
STACK_EXISTS=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    $AWS_PROFILE_OPTION \
    --query 'Stacks[0].StackStatus' \
    --output text 2>/dev/null || echo "DOES_NOT_EXIST")

if [[ "$STACK_EXISTS" == "DOES_NOT_EXIST" ]]; then
    print_info "Stack does not exist. Creating new stack..."

    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        --region $REGION \
        --capabilities CAPABILITY_IAM \
        $AWS_PROFILE_OPTION

    print_info "Stack creation initiated. Waiting for completion..."

    aws cloudformation wait stack-create-complete \
        --stack-name $STACK_NAME \
        --region $REGION \
        $AWS_PROFILE_OPTION

    if [[ $? -eq 0 ]]; then
        print_info "Stack creation completed successfully!"
    else
        print_error "Stack creation failed or timed out."
        exit 1
    fi

else
    print_info "Stack exists. Updating stack..."

    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://$TEMPLATE_FILE \
        --parameters ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        --region $REGION \
        --capabilities CAPABILITY_IAM \
        $AWS_PROFILE_OPTION

    if [[ $? -eq 0 ]]; then
        print_info "Stack update initiated. Waiting for completion..."

        aws cloudformation wait stack-update-complete \
            --stack-name $STACK_NAME \
            --region $REGION \
            $AWS_PROFILE_OPTION

        if [[ $? -eq 0 ]]; then
            print_info "Stack update completed successfully!"
        else
            print_error "Stack update failed or timed out."
            exit 1
        fi
    else
        UPDATE_ERROR=$(aws logs describe-log-groups 2>&1 | grep -i "no updates" || echo "")
        if [[ -n "$UPDATE_ERROR" ]]; then
            print_warning "No updates to be performed on the stack."
        else
            print_error "Stack update failed."
            exit 1
        fi
    fi
fi

# Get stack outputs
print_info "Getting stack outputs..."
aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    $AWS_PROFILE_OPTION \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

print_info "DynamoDB tables deployment completed successfully!"
print_warning "Don't forget to seed the tables with initial data using: node seed-data.js"

# Ask if user wants to seed data
echo ""
read -p "Would you like to seed the tables with initial data now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting data seeding process..."

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install it to seed data."
        exit 1
    fi

    # Check if seed script exists
    if [[ ! -f "seed-data.js" ]]; then
        print_error "Seed data script 'seed-data.js' not found."
        exit 1
    fi

    # Install dependencies if package.json exists
    if [[ -f "package.json" ]]; then
        print_info "Installing Node.js dependencies..."
        npm install
    fi

    # Set environment variables and run seed script
    export ENVIRONMENT=$ENVIRONMENT
    export AWS_REGION=$REGION
    if [[ -n "$PROFILE" ]]; then
        export AWS_PROFILE=$PROFILE
    fi

    node seed-data.js

    if [[ $? -eq 0 ]]; then
        print_info "Data seeding completed successfully!"
    else
        print_error "Data seeding failed."
        exit 1
    fi
fi

print_info "Deployment process completed!"