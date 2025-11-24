# AWS Infrastructure Deployment Script for ANMC Digital (Windows PowerShell)
# Creates S3 bucket and CloudFront distribution

param(
    [string]$Environment = "prod",
    [string]$Region = "ap-southeast-2",
    [string]$StackName = "",
    [string]$Profile = "",
    [string]$DomainName = "",
    [string]$CertificateArn = "",
    [switch]$Help
)

# Colors
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Green }
function Write-Warn { Write-Host "[WARNING] $args" -ForegroundColor Yellow }
function Write-Err { Write-Host "[ERROR] $args" -ForegroundColor Red }
function Write-Step { Write-Host "[STEP] $args" -ForegroundColor Cyan }

if ($Help) {
    Write-Host @"
Usage: .\deploy-infrastructure.ps1 [OPTIONS]

Options:
  -Environment     Environment (dev|staging|prod) [default: prod]
  -Region          AWS region [default: ap-southeast-2]
  -StackName       CloudFormation stack name [default: anmc-frontend-{environment}]
  -Profile         AWS profile to use [optional]
  -DomainName      Custom domain name [optional]
  -CertificateArn  ACM Certificate ARN [required if using custom domain]
  -Help            Show this help message

Examples:
  .\deploy-infrastructure.ps1 -Environment prod -Region ap-southeast-2
  .\deploy-infrastructure.ps1 -DomainName www.example.com -CertificateArn arn:aws:acm:...
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

# Template file
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$TemplateFile = Join-Path $ScriptDir "s3-cloudfront.yml"

Write-Host "============================================" -ForegroundColor Cyan
Write-Info "ANMC Digital Infrastructure Deployment"
Write-Host "============================================" -ForegroundColor Cyan
Write-Info "Environment: $Environment"
Write-Info "Region: $Region"
Write-Info "Stack Name: $StackName"
if ($DomainName) { Write-Info "Custom Domain: $DomainName" }
if ($Profile) { Write-Info "AWS Profile: $Profile" }
Write-Host ""

# Check AWS CLI
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Err "AWS CLI is not installed. Please install it first."
    exit 1
}

# Check template exists
if (-not (Test-Path $TemplateFile)) {
    Write-Err "CloudFormation template file '$TemplateFile' not found."
    exit 1
}

# Validate template
Write-Step "Validating CloudFormation template..."
$validateResult = aws cloudformation validate-template `
    --template-body "file://$TemplateFile" `
    --region $Region `
    $AwsProfileOption 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Err "Template validation failed: $validateResult"
    exit 1
}
Write-Info "Template validation successful."

# Build parameters
$Parameters = "ParameterKey=Environment,ParameterValue=$Environment"
if ($DomainName) {
    $Parameters += " ParameterKey=DomainName,ParameterValue=$DomainName"
}
if ($CertificateArn) {
    $Parameters += " ParameterKey=CertificateArn,ParameterValue=$CertificateArn"
}

# Check if stack exists
Write-Step "Checking if stack exists..."
$stackStatus = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $Region `
    $AwsProfileOption `
    --query 'Stacks[0].StackStatus' `
    --output text 2>$null

if ($LASTEXITCODE -ne 0) {
    $stackStatus = "DOES_NOT_EXIST"
}

if ($stackStatus -eq "DOES_NOT_EXIST") {
    Write-Step "Creating new stack..."

    aws cloudformation create-stack `
        --stack-name $StackName `
        --template-body "file://$TemplateFile" `
        --parameters $Parameters `
        --region $Region `
        $AwsProfileOption

    Write-Info "Stack creation initiated. Waiting for completion..."
    Write-Warn "This may take 10-15 minutes for CloudFront distribution..."

    aws cloudformation wait stack-create-complete `
        --stack-name $StackName `
        --region $Region `
        $AwsProfileOption

    if ($LASTEXITCODE -eq 0) {
        Write-Info "Stack creation completed successfully!"
    } else {
        Write-Err "Stack creation failed or timed out."
        exit 1
    }
} else {
    Write-Step "Updating existing stack..."

    $updateResult = aws cloudformation update-stack `
        --stack-name $StackName `
        --template-body "file://$TemplateFile" `
        --parameters $Parameters `
        --region $Region `
        $AwsProfileOption 2>&1

    if ($updateResult -match "No updates are to be performed") {
        Write-Warn "No updates to be performed on the stack."
    } elseif ($LASTEXITCODE -eq 0) {
        Write-Info "Stack update initiated. Waiting for completion..."

        aws cloudformation wait stack-update-complete `
            --stack-name $StackName `
            --region $Region `
            $AwsProfileOption

        if ($LASTEXITCODE -eq 0) {
            Write-Info "Stack update completed successfully!"
        } else {
            Write-Err "Stack update failed or timed out."
            exit 1
        }
    } else {
        Write-Err "Stack update failed: $updateResult"
        exit 1
    }
}

# Get stack outputs
Write-Step "Getting stack outputs..."
Write-Host ""

aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $Region `
    $AwsProfileOption `
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' `
    --output table

# Get website URL
$WebsiteUrl = aws cloudformation describe-stacks `
    --stack-name $StackName `
    --region $Region `
    $AwsProfileOption `
    --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' `
    --output text

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Info "Infrastructure deployment completed!"
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Info "Next steps:"
Write-Info "1. Build and deploy your React app:"
Write-Info "   .\deploy-frontend.ps1 -Environment $Environment"
Write-Host ""
Write-Info "Your website will be available at:"
Write-Info $WebsiteUrl
