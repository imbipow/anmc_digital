# AWS Secrets Manager Setup Guide

This guide explains how to migrate sensitive configuration from `.env` files to AWS Secrets Manager for enhanced security.

## Overview

Sensitive information like API keys, database credentials, and access tokens have been moved from `.env` files to AWS Secrets Manager. This provides:

- **Enhanced Security**: Secrets are encrypted at rest and in transit
- **Centralized Management**: All secrets in one secure location
- **Audit Trail**: Track who accesses secrets and when
- **Easy Rotation**: Update secrets without code changes
- **Environment Separation**: Different secrets for dev/staging/prod

## Secrets Structure

Secrets are organized by environment and category:

```
anmc/{environment}/{category}
```

### Secret Categories

1. **aws-credentials**: AWS access keys
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `AWS_REGION`

2. **cognito-config**: AWS Cognito configuration
   - `COGNITO_USER_POOL_ID`
   - `COGNITO_CLIENT_ID`
   - `COGNITO_REGION`

3. **stripe-keys**: Stripe payment keys
   - `STRIPE_SECRET_KEY`

4. **application-config**: General app configuration
   - `S3_BUCKET_NAME`
   - `ADMIN_EMAIL`
   - `FROM_EMAIL`

## Setup Instructions

### Step 1: Install AWS SDK (if not already installed)

```bash
cd api
npm install aws-sdk
```

### Step 2: Create Secrets in AWS Secrets Manager

Run the provided script to create all secrets:

```bash
cd api
node scripts/create-secrets.js
```

This script will:
- Read values from your current `.env` file
- Create secrets in AWS Secrets Manager
- Update existing secrets if they already exist

### Step 3: Verify Secrets in AWS Console

1. Go to AWS Console → Secrets Manager
2. Verify the following secrets exist:
   - `anmc/dev/aws-credentials`
   - `anmc/dev/cognito-config`
   - `anmc/dev/stripe-keys`
   - `anmc/dev/application-config`

### Step 4: Update Your .env Files

After secrets are created, you can remove sensitive values from `.env` files:

**api/.env** (keep only non-sensitive values):
```env
# Environment
NODE_ENV=development
ENVIRONMENT=dev

# Server Configuration
PORT=3001
HOST=localhost

# Database Configuration
USE_DYNAMODB=false

# CORS
CORS_ORIGIN=http://localhost:3036

# AWS Region (needed to bootstrap Secrets Manager)
AWS_REGION=ap-southeast-2

# Note: Sensitive credentials are now in AWS Secrets Manager
# AWS_ACCESS_KEY_ID=<removed>
# AWS_SECRET_ACCESS_KEY=<removed>
# COGNITO_USER_POOL_ID=<removed>
# COGNITO_CLIENT_ID=<removed>
# STRIPE_SECRET_KEY=<removed>
```

**Frontend .env** (keep only public values):
```env
PORT=3036
ENVIRONMENT=dev
FRONTEND_URL=http://localhost:3036
ADMIN_PANEL_URL=http://localhost:3036/admin

# Note: Sensitive values are now in AWS Secrets Manager
# REACT_APP_COGNITO_USER_POOL_ID=<removed>
# REACT_APP_COGNITO_CLIENT_ID=<removed>
# REACT_APP_STRIPE_PUBLISHABLE_KEY=<removed>
```

### Step 5: Test the Application

1. Start the API server:
   ```bash
   cd api
   npm start
   ```

2. Check the console logs - you should see:
   ```
   🔐 Loading secrets from AWS Secrets Manager...
   ✅ Secrets loaded successfully
   ```

3. If secrets can't be loaded, the app will fall back to `.env` values in development mode

## How It Works

### API Server

1. **On Startup**: Server loads secrets from AWS Secrets Manager
2. **Caching**: Secrets are cached for 5 minutes to reduce API calls
3. **Fallback**: In development, falls back to `.env` if Secrets Manager is unavailable

### Accessing Secrets in Code

```javascript
const { getSecret } = require('./config/secrets');

// Get a specific secret
const stripeKey = await getSecret('STRIPE_SECRET_KEY');

// Or use helper functions
const config = require('./config');
const cognitoConfig = await config.getCognitoConfig();
```

## Environment-Specific Secrets

### Development (dev)
- Secret prefix: `anmc/dev/`
- Falls back to `.env` if unavailable

### Production (prod)
- Secret prefix: `anmc/prod/`
- No fallback - must have secrets configured

To create production secrets:

```bash
ENVIRONMENT=prod node scripts/create-secrets.js
```

## Security Best Practices

### DO:
✅ Use AWS Secrets Manager for all sensitive data
✅ Use different secrets for each environment
✅ Rotate secrets regularly
✅ Use IAM roles with least privilege
✅ Enable CloudTrail logging for audit

### DON'T:
❌ Commit `.env` files with real secrets to Git
❌ Share secrets via email or chat
❌ Use production secrets in development
❌ Hard-code secrets in application code

## Troubleshooting

### Error: "Failed to load secrets"

**Problem**: Cannot connect to AWS Secrets Manager

**Solutions**:
1. Check AWS credentials are valid
2. Verify AWS region is correct
3. Ensure IAM user/role has `secretsmanager:GetSecretValue` permission
4. In development, fallback to `.env` should work automatically

### Error: "ResourceNotFoundException"

**Problem**: Secret doesn't exist in Secrets Manager

**Solutions**:
1. Run `node scripts/create-secrets.js` to create secrets
2. Verify the secret name matches the pattern: `anmc/{env}/{category}`
3. Check you're using the correct environment (dev/prod)

### Secrets Not Updating

**Problem**: Changed secrets but app still uses old values

**Solutions**:
1. Secrets are cached for 5 minutes - wait or restart server
2. Clear cache manually (if implemented)
3. Verify secrets were actually updated in AWS Console

## IAM Permissions Required

Your AWS IAM user/role needs these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecrets"
      ],
      "Resource": "arn:aws:secretsmanager:ap-southeast-2:*:secret:anmc/*"
    }
  ]
}
```

For the setup script, you also need:
```json
{
  "Effect": "Allow",
  "Action": [
    "secretsmanager:CreateSecret",
    "secretsmanager:UpdateSecret"
  ],
  "Resource": "arn:aws:secretsmanager:ap-southeast-2:*:secret:anmc/*"
}
```

## Cost Considerations

AWS Secrets Manager pricing (as of 2024):
- **Storage**: $0.40 per secret per month
- **API Calls**: $0.05 per 10,000 API calls

For this application with 4 secrets:
- Monthly cost: ~$1.60 + minimal API call costs
- Caching reduces API calls significantly

## Migration Checklist

- [ ] Install AWS SDK in API project
- [ ] Run `create-secrets.js` script
- [ ] Verify secrets in AWS Console
- [ ] Test application with Secrets Manager
- [ ] Remove sensitive values from `.env` files
- [ ] Update `.env.example` files
- [ ] Update `.gitignore` to exclude `.env`
- [ ] Document secrets for team members
- [ ] Set up production secrets
- [ ] Configure IAM permissions
- [ ] Update deployment scripts if needed

## Support

For issues or questions:
- Check AWS Secrets Manager documentation
- Review CloudTrail logs for access issues
- Contact DevOps team for production secret management

---

**Last Updated**: January 2025
**Environment**: Development
**Region**: ap-southeast-2 (Sydney)
