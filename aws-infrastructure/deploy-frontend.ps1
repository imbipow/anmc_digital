# AWS S3 + CloudFront Deployment Script for ANMC Digital React App (Windows PowerShell)
# This script deploys the React build to S3 and invalidates CloudFront cache

param(
    [string]$Environment = "prod",
    [string]$Region = "ap-southeast-2",
    [string]$StackName = "",
    [string]$Profile = "",
    [switch]$BuildOnly,
    [switch]$DeployOnly,
    [switch]$SkipInvalidation,
    [switch]$Help
)

# Colors
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Green }
function Write-Warn { Write-Host "[WARNING] $args" -ForegroundColor Yellow }
function Write-Err { Write-Host "[ERROR] $args" -ForegroundColor Red }
function Write-Step { Write-Host "[STEP] $args" -ForegroundColor Cyan }

if ($Help) {
    Write-Host @"
Usage: .\deploy-frontend.ps1 [OPTIONS]

Options:
  -Environment    Environment (dev|staging|prod) [default: prod]
  -Region         AWS region [default: ap-southeast-2]
  -StackName      CloudFormation stack name [default: anmc-frontend-{environment}]
  -Profile        AWS profile to use [optional]
  -BuildOnly      Only build React app, don't deploy
  -DeployOnly     Only deploy (skip build)
  -SkipInvalidation  Skip CloudFront cache invalidation
  -Help           Show this help message

Examples:
  .\deploy-frontend.ps1
  .\deploy-frontend.ps1 -Environment staging
  .\deploy-frontend.ps1 -BuildOnly
  .\deploy-frontend.ps1 -DeployOnly -SkipInvalidation
"@
    exit 0
}

# Validate environment
if ($Environment -notin @("dev", "staging", "prod")) {
    Write-Err "Invalid environment. Must be one of: dev, staging, prod"
    exit 1
}

# Set default stack name
if (-not $StackName) {
    $StackName = "anmc-frontend-$Environment"
}

# AWS profile option
$AwsProfileOption = if ($Profile) { "--profile $Profile" } else { "" }

# Project paths
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$BuildDir = Join-Path $ProjectRoot "build"

Write-Host "============================================" -ForegroundColor Cyan
Write-Info "ANMC Digital Frontend Deployment"
Write-Host "============================================" -ForegroundColor Cyan
Write-Info "Environment: $Environment"
Write-Info "Region: $Region"
Write-Info "Stack Name: $StackName"
Write-Info "Project Root: $ProjectRoot"
if ($Profile) { Write-Info "AWS Profile: $Profile" }
Write-Host ""

# ============================================
# STEP 1: Build React App
# ============================================
if (-not $DeployOnly) {
    Write-Step "Building React application..."

    Set-Location $ProjectRoot

    if (-not (Test-Path "package.json")) {
        Write-Err "package.json not found in $ProjectRoot"
        exit 1
    }

    # Install dependencies if needed
    if (-not (Test-Path "node_modules")) {
        Write-Info "Installing dependencies..."
        npm install
    }

    # Set environment and build
    $env:REACT_APP_ENV = $Environment

    Write-Info "Running npm build..."
    npm run build

    if (-not (Test-Path $BuildDir)) {
        Write-Err "Build failed - build directory not found"
        exit 1
    }

    Write-Info "Build completed successfully!"

    if ($BuildOnly) {
        Write-Info "Build-only mode - skipping deployment"
        exit 0
    }
}

# Check build directory for deploy-only mode
if ($DeployOnly -and -not (Test-Path $BuildDir)) {
    Write-Err "Build directory not found. Run build first or remove -DeployOnly flag"
    exit 1
}

# ============================================
# STEP 2: Get S3 Bucket and CloudFront Distribution
# ============================================
Write-Step "Getting deployment configuration from CloudFormation..."

# Check AWS CLI
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Err "AWS CLI is not installed. Please install it first."
    exit 1
}

# Get stack outputs
$BucketName = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $Region `
    $AwsProfileOption `
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteBucketName`].OutputValue' `
    --output text 2>$null

$DistributionId = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $Region `
    $AwsProfileOption `
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' `
    --output text 2>$null

$WebsiteUrl = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $Region `
    $AwsProfileOption `
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' `
    --output text 2>$null

if (-not $BucketName -or $BucketName -eq "None") {
    Write-Err "Could not find S3 bucket. Make sure the CloudFormation stack exists."
    Write-Info "Run: .\deploy-infrastructure.ps1 -Environment $Environment first"
    exit 1
}

Write-Info "S3 Bucket: $BucketName"
Write-Info "CloudFront Distribution: $DistributionId"

# ============================================
# STEP 3: Upload to S3
# ============================================
Write-Step "Uploading build files to S3..."

# Sync build directory (excluding index.html for special handling)
aws s3 sync $BuildDir "s3://$BucketName" `
    --delete `
    --region $Region `
    $AwsProfileOption `
    --cache-control "public, max-age=31536000" `
    --exclude "index.html" `
    --exclude "service-worker.js" `
    --exclude "*.map"

# Upload index.html with no-cache
aws s3 cp "$BuildDir\index.html" "s3://$BucketName/index.html" `
    --region $Region `
    $AwsProfileOption `
    --cache-control "no-cache, no-store, must-revalidate" `
    --content-type "text/html"

# Upload service worker if exists
if (Test-Path "$BuildDir\service-worker.js") {
    aws s3 cp "$BuildDir\service-worker.js" "s3://$BucketName/service-worker.js" `
        --region $Region `
        $AwsProfileOption `
        --cache-control "no-cache, no-store, must-revalidate"
}

Write-Info "Upload completed!"

# ============================================
# STEP 4: Invalidate CloudFront Cache
# ============================================
if (-not $SkipInvalidation -and $DistributionId -and $DistributionId -ne "None") {
    Write-Step "Invalidating CloudFront cache..."

    $InvalidationId = aws cloudfront create-invalidation `
        --distribution-id $DistributionId `
        --paths "/*" `
        $AwsProfileOption `
        --query 'Invalidation.Id' `
        --output text

    Write-Info "Invalidation created: $InvalidationId"
    Write-Warn "Cache invalidation may take a few minutes to propagate."
} else {
    Write-Warn "Skipping CloudFront cache invalidation"
}

# ============================================
# Done!
# ============================================
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Info "Deployment completed successfully!"
Write-Host "============================================" -ForegroundColor Cyan
Write-Info "Website URL: $WebsiteUrl"
Write-Host ""
Write-Warn "Note: It may take a few minutes for changes to propagate globally."
