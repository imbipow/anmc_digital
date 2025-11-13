# Secrets Manager Migration - Quick Start Guide

## ⚡ Quick Setup (5 minutes)

### Step 1: Create Secrets in AWS

```bash
cd api
node scripts/create-secrets.js
```

Expected output:
```
🔐 Starting to create secrets in AWS Secrets Manager...

✅ Created secret: anmc/dev/aws-credentials
✅ Created secret: anmc/dev/cognito-config
✅ Created secret: anmc/dev/stripe-keys
✅ Created secret: anmc/dev/application-config

✨ Secrets creation completed!
```

### Step 2: Verify in AWS Console

1. Go to https://console.aws.amazon.com/secretsmanager
2. Select region: **ap-southeast-2** (Sydney)
3. Verify you see 4 secrets starting with `anmc/dev/`

### Step 3: Test the Application

```bash
# Start API server
cd api
npm start

# You should see:
# 🔐 Loading secrets from AWS Secrets Manager...
# ✅ Secrets loaded successfully
# 🚀 Server running...
```

### Step 4: Clean Up .env Files (Optional but Recommended)

After verifying everything works, you can remove sensitive values from `.env` files:

**api/.env** - Keep only:
```env
NODE_ENV=development
ENVIRONMENT=dev
PORT=3001
HOST=localhost
USE_DYNAMODB=false
CORS_ORIGIN=http://localhost:3036
AWS_REGION=ap-southeast-2
```

Remove these lines (now in Secrets Manager):
```env
# AWS_ACCESS_KEY_ID=...
# AWS_SECRET_ACCESS_KEY=...
# COGNITO_USER_POOL_ID=...
# COGNITO_CLIENT_ID=...
# STRIPE_SECRET_KEY=...
```

## 🎯 What Was Migrated

### API Backend
- ✅ AWS Access Keys
- ✅ AWS Secret Keys
- ✅ Cognito User Pool ID
- ✅ Cognito Client ID
- ✅ Stripe Secret Key
- ✅ S3 Bucket Name
- ✅ Admin Email
- ✅ From Email

### Frontend
- ℹ️ Frontend loads config from backend API
- ℹ️ No direct Secrets Manager access needed

## 🔧 How It Works

### Development Mode
- App tries to load from AWS Secrets Manager
- Falls back to `.env` if unavailable
- Secrets cached for 5 minutes

### Production Mode
- Must have secrets in AWS Secrets Manager
- No fallback to `.env`
- Fails fast if secrets unavailable

## 📦 Files Created

```
api/
├── scripts/
│   └── create-secrets.js          # Script to create secrets
├── services/
│   └── secretsManager.js          # Secrets Manager service
├── config/
│   ├── secrets.js                 # Secrets configuration
│   └── index-new.js               # Updated config (optional)
└── .env.example                   # Example env file

SECRETS_MANAGER_SETUP.md           # Full setup guide
SECRETS_MIGRATION_QUICKSTART.md    # This file
```

## 🚨 Troubleshooting

### "Failed to load secrets"
- Check AWS credentials are valid
- Verify region is `ap-southeast-2`
- In dev mode, app will use `.env` as fallback

### "ResourceNotFoundException"
- Run `node scripts/create-secrets.js` again
- Verify secrets exist in AWS Console

### "Access Denied"
- Check IAM permissions include `secretsmanager:GetSecretValue`
- Verify you're using correct AWS account

## 📝 Next Steps

For production deployment:

1. Create production secrets:
   ```bash
   ENVIRONMENT=prod node scripts/create-secrets.js
   ```

2. Update IAM roles with Secrets Manager permissions

3. Remove all sensitive data from `.env` files

4. Update CI/CD pipelines

See [SECRETS_MANAGER_SETUP.md](./SECRETS_MANAGER_SETUP.md) for complete documentation.

## 💰 Cost

- **$0.40/month per secret** = $1.60/month for 4 secrets
- Minimal API call costs (caching reduces calls)
- Total: ~$2/month

## ✅ Benefits

- ✅ **Security**: Encrypted secrets, never in Git
- ✅ **Centralized**: All secrets in one place
- ✅ **Audit Trail**: Track secret access
- ✅ **Easy Rotation**: Update without code deploy
- ✅ **Environment Separation**: Different secrets per env

---

**Need Help?** See full documentation in [SECRETS_MANAGER_SETUP.md](./SECRETS_MANAGER_SETUP.md)
