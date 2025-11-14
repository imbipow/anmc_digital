# Quick Start - Auto Deploy on Git Push 🚀

## ✅ What's Been Set Up

GitHub Actions workflows are now configured to automatically deploy your app to AWS whenever you push to the `main` branch!

---

## 🎯 Quick Setup (5 Steps)

### Step 1: Get Your AWS Credentials

```bash
# Get your AWS Account ID
aws sts get-caller-identity --query Account --output text
```

You already have:
- AWS Access Key ID
- AWS Secret Access Key
- Account ID: 941377129485

### Step 2: Add GitHub Secrets

Go to: `https://github.com/YOUR_USERNAME/anmcDigital/settings/secrets/actions`

Click **"New repository secret"** and add these **9 secrets**:

| Secret Name | Value |
|-------------|-------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `AWS_ACCOUNT_ID` | 941377129485 |
| `REACT_APP_COGNITO_USER_POOL_ID` | ap-southeast-2_egMmxcO1M |
| `REACT_APP_COGNITO_CLIENT_ID` | 2h0bk9340rlmevdnsof7ml31ai |
| `REACT_APP_STRIPE_PUBLISHABLE_KEY` | pk_test_YOUR_KEY |
| `S3_FRONTEND_BUCKET` | anmc-frontend |
| `REACT_APP_API_URL` | (Will get after step 3) |
| `CLOUDFRONT_DISTRIBUTION_ID` | (Optional) |

### Step 3: Run Initial Setup (One Time Only)

1. Go to: `https://github.com/YOUR_USERNAME/anmcDigital/actions`
2. Click: **"Initial AWS Setup (Run Once)"**
3. Click: **"Run workflow"** → **"Run workflow"**
4. Wait ~10 minutes for completion
5. Copy the **Backend API URL** from the logs

### Step 4: Update API URL Secret

1. Go back to Secrets
2. Update `REACT_APP_API_URL` with:
   ```
   http://anmc-api-prod.eba-8kyprvvf.ap-southeast-2.elasticbeanstalk.com/api
   ```

   Note: Currently using HTTP. For HTTPS, you'll need to set up CloudFront or a load-balanced environment.

### Step 5: Push to Main Branch

```bash
# Make any change
echo "# CI/CD is ready!" >> README.md

git add .
git commit -m "feat: enable auto deployment"
git push origin main

# 🎉 Watch it deploy automatically!
```

---

## 🎊 That's It!

From now on, every time you push to `main`:

```bash
git push origin main
```

**GitHub Actions will automatically:**
1. ✅ Deploy backend API to AWS Elastic Beanstalk
2. ✅ Build and deploy frontend to S3
3. ✅ Invalidate CloudFront cache (if configured)
4. ✅ Notify you of deployment status

---

## 📱 Your App URLs

After deployment:

**Frontend:**
```
http://anmc-frontend.s3-website-ap-southeast-2.amazonaws.com
```

**Backend API:**
```
http://anmc-api-prod.eba-8kyprvvf.ap-southeast-2.elasticbeanstalk.com/api
```

**GitHub Actions:**
```
https://github.com/YOUR_USERNAME/anmcDigital/actions
```

---

## 🔍 Monitor Deployments

**Watch Live Deployments:**
1. Go to GitHub → Actions tab
2. See deployments in real-time
3. View logs for any issues

**Check AWS Status:**
```bash
# Backend status
aws elasticbeanstalk describe-environments \
  --application-name anmc-api \
  --environment-names anmc-api-prod \
  --query "Environments[0].Status"

# Frontend check
aws s3 ls s3://anmc-frontend/
```

---

## 🆘 Need Help?

**Full Documentation:**
- [CICD-SETUP-GUIDE.md](CICD-SETUP-GUIDE.md) - Detailed setup guide
- [AWS-DEPLOYMENT-COMPLETE-GUIDE.md](AWS-DEPLOYMENT-COMPLETE-GUIDE.md) - Architecture and manual deployment

**Common Issues:**

**"Application does not exist"**
→ Run the initial setup workflow again

**"Access Denied"**
→ Check AWS credentials in GitHub Secrets

**Frontend not updating**
→ Check S3 bucket name in secrets

**Backend health check failing**
→ Check Elastic Beanstalk logs in AWS Console

---

## 💡 Pro Tips

**See what changed:**
```bash
# View deployment history
git log --oneline
```

**Rollback if needed:**
```bash
# Revert to previous version
git revert HEAD
git push origin main  # Auto-deploys previous version
```

**Deploy specific branch:**
```bash
# Create a PR to main
# Merge PR → Auto-deploys
```

---

## 🎯 Next Steps

1. ✅ Complete Step 1-5 above
2. ✅ Test a deployment
3. ✅ Configure custom domain (optional)
4. ✅ Set up monitoring alerts
5. ✅ Enable HTTPS with SSL certificate

---

**Happy Deploying!** 🚀

*Estimated setup time: 15 minutes*
*Estimated deployment time: 5-7 minutes per push*
