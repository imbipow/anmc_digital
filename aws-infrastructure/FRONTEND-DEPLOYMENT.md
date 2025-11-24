# ANMC Digital - S3 + CloudFront Deployment Guide

This guide explains how to deploy the ANMC Digital React application to AWS S3 with CloudFront CDN for a **low-cost, high-performance** static website hosting solution.

## Cost Estimate (Low Traffic)

| Service | Monthly Cost (Estimate) |
|---------|------------------------|
| S3 Storage (1GB) | ~$0.023 |
| S3 Requests (10,000/month) | ~$0.004 |
| CloudFront (10GB data transfer) | ~$0.85 |
| CloudFront Requests (100,000/month) | ~$0.10 |
| **Total** | **~$1-2/month** |

> **Note**: Actual costs depend on traffic. Price Class 100 (US, Canada, Europe only) is used to minimize costs. For Asia-Pacific users, consider upgrading to Price Class 200.

## Prerequisites

1. **AWS CLI** installed and configured
   ```bash
   # Install AWS CLI (Windows)
   winget install Amazon.AWSCLI

   # Configure credentials
   aws configure
   ```

2. **Node.js** installed (for building React app)

3. **AWS Account** with appropriate permissions:
   - CloudFormation
   - S3
   - CloudFront
   - IAM (for OAC)

## Quick Start

### Step 1: Deploy Infrastructure (One-time)

**Windows (PowerShell):**
```powershell
cd aws-infrastructure
.\deploy-infrastructure.ps1 -Environment prod -Region ap-southeast-2
```

**Linux/Mac (Bash):**
```bash
cd aws-infrastructure
chmod +x deploy-infrastructure.sh
./deploy-infrastructure.sh -e prod -r ap-southeast-2
```

This creates:
- S3 bucket for website files
- CloudFront distribution with HTTPS
- Origin Access Control (OAC) for secure S3 access

### Step 2: Deploy Frontend (Every update)

**Windows (PowerShell):**
```powershell
.\deploy-frontend.ps1 -Environment prod
```

**Linux/Mac (Bash):**
```bash
./deploy-frontend.sh -e prod
```

This:
1. Builds the React application
2. Uploads files to S3
3. Invalidates CloudFront cache

## Deployment Options

### Infrastructure Deployment (`deploy-infrastructure`)

| Option | Description | Default |
|--------|-------------|---------|
| `-Environment` | dev, staging, or prod | prod |
| `-Region` | AWS region | ap-southeast-2 |
| `-StackName` | CloudFormation stack name | anmc-frontend-{env} |
| `-Profile` | AWS CLI profile | default |
| `-DomainName` | Custom domain (optional) | - |
| `-CertificateArn` | ACM certificate ARN | - |

### Frontend Deployment (`deploy-frontend`)

| Option | Description | Default |
|--------|-------------|---------|
| `-Environment` | dev, staging, or prod | prod |
| `-Region` | AWS region | ap-southeast-2 |
| `-StackName` | CloudFormation stack name | anmc-frontend-{env} |
| `-Profile` | AWS CLI profile | default |
| `-BuildOnly` | Only build, don't deploy | false |
| `-DeployOnly` | Skip build, deploy only | false |
| `-SkipInvalidation` | Skip CloudFront invalidation | false |

## Custom Domain Setup (Optional)

To use a custom domain (e.g., www.anmc.org.au):

### 1. Create ACM Certificate

```bash
# Certificate MUST be in us-east-1 for CloudFront
aws acm request-certificate \
    --domain-name www.anmc.org.au \
    --validation-method DNS \
    --region us-east-1
```

### 2. Validate Certificate

Add the DNS validation records to your domain's DNS settings.

### 3. Deploy with Custom Domain

```powershell
.\deploy-infrastructure.ps1 `
    -Environment prod `
    -DomainName www.anmc.org.au `
    -CertificateArn arn:aws:acm:us-east-1:123456789:certificate/xxx-xxx
```

### 4. Update DNS

Add a CNAME record pointing your domain to the CloudFront distribution domain name.

## Architecture

```
User Request
     │
     ▼
CloudFront CDN (HTTPS, Caching, Global Edge Locations)
     │
     ▼ (Origin Access Control)
     │
S3 Bucket (Private, Encrypted)
     │
     ▼
React SPA (index.html, static assets)
```

## Cost Optimization Tips

1. **Price Class 100** (Default): Only uses US, Canada, and Europe edge locations
   - Cheapest option
   - Good for primarily Western audiences

2. **Price Class 200**: Adds Asia, Middle East, Africa
   - Better for Australian users
   - Slightly higher cost

3. **Price Class All**: All edge locations globally
   - Best performance worldwide
   - Highest cost

To change price class, edit `s3-cloudfront.yml`:
```yaml
PriceClass: PriceClass_200  # or PriceClass_All
```

## Manual Deployment (Without Scripts)

### 1. Build React App
```bash
cd /path/to/anmcDigital
npm run build
```

### 2. Upload to S3
```bash
# Get bucket name from CloudFormation outputs
BUCKET_NAME=anmc-website-prod-123456789

# Upload all files
aws s3 sync build/ s3://$BUCKET_NAME --delete

# Set proper cache headers for index.html
aws s3 cp build/index.html s3://$BUCKET_NAME/index.html \
    --cache-control "no-cache, no-store, must-revalidate"
```

### 3. Invalidate CloudFront Cache
```bash
# Get distribution ID from CloudFormation outputs
DISTRIBUTION_ID=E1234567890ABC

aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*"
```

## Troubleshooting

### 403 Forbidden Error
- Check S3 bucket policy allows CloudFront access
- Verify OAC is correctly configured
- Check CloudFront origin is pointing to correct S3 bucket

### 404 Not Found (SPA Routes)
- CloudFront error pages should redirect 404/403 to index.html
- Check `CustomErrorResponses` in CloudFormation template

### Slow Initial Load
- First request after invalidation may be slow (cache miss)
- Subsequent requests should be fast (CDN cache hit)

### Cache Not Updating
- Invalidate CloudFront cache after deployment
- Check browser cache (try incognito/private window)
- Verify S3 files are updated

## Files Created

| File | Description |
|------|-------------|
| `s3-cloudfront.yml` | CloudFormation template |
| `deploy-infrastructure.ps1` | Windows infrastructure deployment |
| `deploy-infrastructure.sh` | Linux/Mac infrastructure deployment |
| `deploy-frontend.ps1` | Windows frontend deployment |
| `deploy-frontend.sh` | Linux/Mac frontend deployment |

## Cleanup

To delete all resources:

```bash
# Empty S3 bucket first
aws s3 rm s3://anmc-website-prod-123456789 --recursive

# Delete CloudFormation stack
aws cloudformation delete-stack --stack-name anmc-frontend-prod
```

## Support

For issues with deployment, check:
1. AWS CloudFormation console for stack events
2. CloudFront console for distribution status
3. S3 console for bucket contents and permissions
