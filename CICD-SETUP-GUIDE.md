# CI/CD Setup Guide - Auto Deploy on Git Push

## 🎯 Overview

This guide will set up automatic deployment to AWS whenever you push to the `main` branch.

**What happens on every git push to main:**
1. ✅ Backend API automatically deploys to Elastic Beanstalk
2. ✅ Frontend automatically builds and deploys to S3
3. ✅ CloudFront cache invalidated (if configured)
4. ✅ Deployment status notifications

---

## 📋 Prerequisites

- GitHub repository with push access
- AWS Account with appropriate permissions
- AWS CLI configured locally

---

## 🔐 Step 1: Create AWS IAM User for GitHub Actions

### 1.1 Create IAM User

```bash
# Create IAM user for CI/CD
aws iam create-user --user-name github-actions-anmc

# Create access key
aws iam create-access-key --user-name github-actions-anmc
```

**Save the output:**
- `AccessKeyId` → Will be `AWS_ACCESS_KEY_ID`
- `SecretAccessKey` → Will be `AWS_SECRET_ACCESS_KEY`

### 1.2 Attach Required Policies

```bash
# Attach Elastic Beanstalk full access
aws iam attach-user-policy \
  --user-name github-actions-anmc \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess-AWSElasticBeanstalk

# Attach S3 full access
aws iam attach-user-policy \
  --user-name github-actions-anmc \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3FullAccess

# Attach CloudFront invalidation access (optional)
aws iam attach-user-policy \
  --user-name github-actions-anmc \
  --policy-arn arn:aws:iam::aws:policy/CloudFrontFullAccess
```

**Alternative: Create Custom Policy (More Secure)**

Create `github-actions-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "elasticbeanstalk:*",
        "s3:*",
        "cloudfront:CreateInvalidation",
        "cloudfront:GetInvalidation",
        "ec2:DescribeInstances",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeVpcs",
        "elasticloadbalancing:DescribeLoadBalancers",
        "autoscaling:DescribeAutoScalingGroups",
        "cloudwatch:PutMetricData"
      ],
      "Resource": "*"
    }
  ]
}
```

```bash
aws iam create-policy \
  --policy-name GitHubActionsANMCPolicy \
  --policy-document file://github-actions-policy.json

aws iam attach-user-policy \
  --user-name github-actions-anmc \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/GitHubActionsANMCPolicy
```

---

## 🔑 Step 2: Configure GitHub Secrets

Go to your GitHub repository:
1. Click **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**

### Required Secrets:

| Secret Name | Value | How to Get |
|-------------|-------|------------|
| `AWS_ACCESS_KEY_ID` | AKIA... | From Step 1.1 output |
| `AWS_SECRET_ACCESS_KEY` | xxxxxx | From Step 1.1 output |
| `AWS_ACCOUNT_ID` | 941377129485 | Run: `aws sts get-caller-identity --query Account --output text` |
| `REACT_APP_API_URL` | https://xxx.elasticbeanstalk.com/api | Get after initial setup |
| `REACT_APP_COGNITO_USER_POOL_ID` | ap-southeast-2_egMmxcO1M | From your Cognito setup |
| `REACT_APP_COGNITO_CLIENT_ID` | 2h0bk9340rlmevdnsof7ml31ai | From your Cognito setup |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | pk_test_xxx | From Stripe dashboard |
| `S3_FRONTEND_BUCKET` | anmc-frontend | Your chosen bucket name |
| `CLOUDFRONT_DISTRIBUTION_ID` | E123ABC... | (Optional) If using CloudFront |

### How to Add Each Secret:

```bash
# Example for AWS_ACCESS_KEY_ID
1. Click "New repository secret"
2. Name: AWS_ACCESS_KEY_ID
3. Value: <paste your access key>
4. Click "Add secret"

# Repeat for all secrets above
```

---

## 🚀 Step 3: Run Initial Setup

### 3.1 First-Time Setup (Run Once)

1. Go to GitHub → **Actions** tab
2. Find **"Initial AWS Setup (Run Once)"** workflow
3. Click **"Run workflow"** → **"Run workflow"**

This will:
- Create Elastic Beanstalk application
- Create EB environment
- Create S3 bucket for frontend
- Configure bucket for static hosting

**This takes ~10 minutes to complete**

### 3.2 Get the Backend API URL

After the initial setup completes:
1. Check the workflow logs
2. Find the line: `🌐 Backend API URL: https://xxx.elasticbeanstalk.com`
3. Copy this URL

### 3.3 Update GitHub Secrets

Go back to **Settings** → **Secrets** and update:

```
REACT_APP_API_URL = https://anmc-api-prod.ap-southeast-2.elasticbeanstalk.com/api
S3_FRONTEND_BUCKET = anmc-frontend
```

---

## ✅ Step 4: Test Automatic Deployment

### 4.1 Make a Test Change

```bash
# Make a small change to test deployment
echo "# Test deployment" >> README.md

git add README.md
git commit -m "test: CI/CD deployment"
git push origin main
```

### 4.2 Watch the Deployment

1. Go to GitHub → **Actions** tab
2. You'll see **"Deploy to AWS"** workflow running
3. Click on it to see live logs

**Expected flow:**
```
1. ✅ Deploy Backend API (3-5 minutes)
   - Install dependencies
   - Create deployment package
   - Upload to S3
   - Deploy to Elastic Beanstalk
   - Wait for health check

2. ✅ Deploy Frontend (2-3 minutes)
   - Install dependencies
   - Build React app
   - Upload to S3
   - Invalidate CloudFront cache

3. ✅ Deployment Summary
   - Show status
   - Display URLs
```

### 4.3 Verify Deployment

```bash
# Check backend API
curl https://anmc-api-prod.ap-southeast-2.elasticbeanstalk.com/api/health

# Check frontend (in browser)
http://anmc-frontend.s3-website-ap-southeast-2.amazonaws.com
```

---

## 🎨 Step 5: Configure Backend Environment Variables

After the first deployment, set additional environment variables:

```bash
# Configure Elastic Beanstalk environment variables
aws elasticbeanstalk update-environment \
  --application-name anmc-api \
  --environment-name anmc-api-prod \
  --option-settings \
    "Namespace=aws:elasticbeanstalk:application:environment,OptionName=NODE_ENV,Value=production" \
    "Namespace=aws:elasticbeanstalk:application:environment,OptionName=AWS_REGION,Value=ap-southeast-2" \
    "Namespace=aws:elasticbeanstalk:application:environment,OptionName=COGNITO_USER_POOL_ID,Value=ap-southeast-2_egMmxcO1M" \
    "Namespace=aws:elasticbeanstalk:application:environment,OptionName=COGNITO_CLIENT_ID,Value=2h0bk9340rlmevdnsof7ml31ai" \
    "Namespace=aws:elasticbeanstalk:application:environment,OptionName=COGNITO_REGION,Value=ap-southeast-2" \
    "Namespace=aws:elasticbeanstalk:application:environment,OptionName=FRONTEND_URL,Value=http://anmc-frontend.s3-website-ap-southeast-2.amazonaws.com"
```

Or use AWS Console:
1. Go to Elastic Beanstalk → `anmc-api-prod`
2. Configuration → Software → Edit
3. Add environment properties
4. Save and apply

---

## 🔄 Daily Workflow

After setup is complete, your daily workflow becomes:

```bash
# Make changes to your code
git add .
git commit -m "feat: add new feature"
git push origin main

# 🎉 That's it! GitHub Actions will automatically:
# - Run tests (if configured)
# - Deploy backend
# - Deploy frontend
# - Notify you of status
```

---

## 📊 Monitoring Deployments

### View Deployment History

1. Go to GitHub → **Actions** tab
2. See all past deployments
3. Click any workflow to see:
   - What changed (commit)
   - Deployment logs
   - Success/failure status
   - Deployment time

### Get Notifications

GitHub will automatically notify you via:
- Email (on failure)
- GitHub UI (status badges)
- Pull Request checks

### Enable Slack/Discord Notifications (Optional)

Add to `.github/workflows/deploy.yml`:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

---

## 🛠️ Advanced Configuration

### Deploy to Staging First

Create `.github/workflows/deploy-staging.yml`:

```yaml
name: Deploy to Staging

on:
  push:
    branches:
      - develop  # Deploy develop branch to staging

# ... similar to main deploy.yml but with staging environment
```

### Deploy on PR Approval

Add to `.github/workflows/deploy.yml`:

```yaml
on:
  push:
    branches:
      - main
  pull_request:
    types: [closed]
    branches:
      - main

jobs:
  deploy-backend:
    if: github.event.pull_request.merged == true || github.event_name == 'push'
    # ... rest of workflow
```

### Add Environment Protection Rules

1. Go to **Settings** → **Environments**
2. Create environment: `production`
3. Add required reviewers
4. Add deployment branch rule

Update workflow:

```yaml
jobs:
  deploy-backend:
    environment: production  # Requires approval before deploying
```

---

## 🔍 Troubleshooting

### Deployment Fails: "Application does not exist"

Run the initial setup workflow again:
```bash
# Or manually create EB app
aws elasticbeanstalk create-application \
  --application-name anmc-api \
  --description "ANMC Digital Backend API"
```

### Deployment Fails: "Access Denied"

Check IAM permissions:
```bash
# Verify IAM user has correct policies
aws iam list-attached-user-policies --user-name github-actions-anmc
```

### Frontend Not Updating

Clear CloudFront cache manually:
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Backend Health Check Failing

Check logs:
```bash
aws elasticbeanstalk retrieve-environment-info \
  --application-name anmc-api \
  --environment-name anmc-api-prod \
  --info-type tail
```

---

## 📈 Monitoring & Alerts

### Set Up CloudWatch Alarms

```bash
# Alert on EB environment health
aws cloudwatch put-metric-alarm \
  --alarm-name anmc-api-unhealthy \
  --alarm-description "Alert when EB environment is unhealthy" \
  --metric-name EnvironmentHealth \
  --namespace AWS/ElasticBeanstalk \
  --statistic Average \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=EnvironmentName,Value=anmc-api-prod
```

### Enable Access Logs

```bash
# Enable S3 access logs
aws s3api put-bucket-logging \
  --bucket anmc-frontend \
  --bucket-logging-status file://logging.json
```

---

## 💰 Cost Optimization

### Use Scheduled Scaling

For non-production environments:

```yaml
# Scale down during non-business hours
- cron: '0 18 * * 1-5'  # 6 PM weekdays
  min_instances: 0
  max_instances: 0

- cron: '0 8 * * 1-5'   # 8 AM weekdays
  min_instances: 1
  max_instances: 2
```

### Use Spot Instances (Dev/Staging)

Update EB configuration:
```bash
aws elasticbeanstalk update-environment \
  --environment-name anmc-api-staging \
  --option-settings \
    "Namespace=aws:ec2:instances,OptionName=EnableSpot,Value=true" \
    "Namespace=aws:ec2:instances,OptionName=SpotMaxPrice,Value=0.05"
```

---

## 🎉 Success Checklist

- [ ] GitHub secrets configured
- [ ] Initial setup workflow completed
- [ ] Backend API accessible
- [ ] Frontend accessible
- [ ] Test deployment successful
- [ ] Environment variables set
- [ ] Monitoring configured
- [ ] Team notified of workflow

---

## 📞 Support

**GitHub Actions Logs:** Check the Actions tab for detailed logs

**AWS Status:**
- Backend: Check Elastic Beanstalk console
- Frontend: Check S3 bucket contents
- Database: Check DynamoDB tables

**Documentation:**
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [AWS EB CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)
- [AWS S3 Static Website](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

---

## 🎊 You're Done!

Your CI/CD pipeline is now configured. Every push to `main` will automatically deploy your application!

**Next time you want to deploy:**
```bash
git push origin main
```

That's it! ✨
