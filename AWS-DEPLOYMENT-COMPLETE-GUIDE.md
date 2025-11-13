# ANMC Digital - Complete AWS Deployment Guide

## 🎯 Deployment Overview

This guide will deploy the complete ANMC Digital application to AWS:

**Architecture:**
```
┌─────────────────────────────────────────────────────────────┐
│                        Users/Browsers                        │
└────────────────────┬────────────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │   CloudFront CDN     │ (Optional - Better Performance)
          └──────────┬───────────┘
                     │
    ┌────────────────┴────────────────┐
    │                                 │
┌───▼──────────┐            ┌────────▼─────────┐
│  S3 Bucket   │            │  EC2/Elastic     │
│  (Frontend)  │            │  Beanstalk       │
│  React App   │            │  (Backend API)   │
└──────────────┘            └────────┬─────────┘
                                     │
                      ┌──────────────┴──────────────┐
                      │                             │
               ┌──────▼──────┐             ┌───────▼────────┐
               │  DynamoDB    │             │   S3 Bucket    │
               │  (Database)  │             │  (Media Files) │
               └──────────────┘             └────────────────┘
                      │
            ┌─────────┴─────────┐
            │                   │
     ┌──────▼────────┐  ┌───────▼────────┐
     │   Cognito     │  │ Secrets Manager│
     │ (Auth/Users)  │  │  (API Keys)    │
     └───────────────┘  └────────────────┘
```

---

## ✅ Current Status (Already Deployed)

✅ **DynamoDB Tables** - 18 tables created
✅ **S3 Media Bucket** - `anmc-media-storage` stack deployed
✅ **Cognito User Pool** - User authentication configured
✅ **Secrets Manager** - API keys and credentials stored

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend API to AWS Elastic Beanstalk

#### 1.1 Install Elastic Beanstalk CLI

```bash
# Install EB CLI
pip install awsebcli --upgrade
```

#### 1.2 Initialize Elastic Beanstalk Application

```bash
cd d:/my-projects/anmcDigital/api

# Initialize EB application
eb init -p node.js-18 anmc-api --region ap-southeast-2

# Create environment
eb create anmc-api-prod \
  --instance-type t3.small \
  --platform "Node.js 18 running on 64bit Amazon Linux 2023" \
  --region ap-southeast-2
```

#### 1.3 Configure Environment Variables

```bash
# Set environment variables in Elastic Beanstalk
eb setenv \
  NODE_ENV=production \
  AWS_REGION=ap-southeast-2 \
  COGNITO_USER_POOL_ID=ap-southeast-2_egMmxcO1M \
  COGNITO_CLIENT_ID=2h0bk9340rlmevdnsof7ml31ai \
  COGNITO_REGION=ap-southeast-2 \
  FRONTEND_URL=https://your-domain.com \
  PORT=8080
```

#### 1.4 Deploy API

```bash
# Deploy to Elastic Beanstalk
eb deploy
```

#### 1.5 Get API URL

```bash
# Get the Elastic Beanstalk URL
eb status | grep CNAME
```

**Example output:**
```
CNAME: anmc-api-prod.ap-southeast-2.elasticbeanstalk.com
```

---

### Step 2: Build and Deploy React Frontend to S3

#### 2.1 Update Frontend API Configuration

```bash
cd d:/my-projects/anmcDigital

# Create production environment file
cat > .env.production << EOF
REACT_APP_API_URL=https://anmc-api-prod.ap-southeast-2.elasticbeanstalk.com/api
REACT_APP_COGNITO_USER_POOL_ID=ap-southeast-2_egMmxcO1M
REACT_APP_COGNITO_CLIENT_ID=2h0bk9340rlmevdnsof7ml31ai
REACT_APP_COGNITO_REGION=ap-southeast-2
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
EOF
```

#### 2.2 Build React Application

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

#### 2.3 Create S3 Bucket for Frontend

```bash
# Create S3 bucket (replace with your domain name)
aws s3 mb s3://anmc-frontend --region ap-southeast-2

# Enable static website hosting
aws s3 website s3://anmc-frontend \
  --index-document index.html \
  --error-document index.html

# Set bucket policy for public read
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::anmc-frontend/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy \
  --bucket anmc-frontend \
  --policy file://bucket-policy.json
```

#### 2.4 Deploy Frontend to S3

```bash
# Upload build files to S3
aws s3 sync build/ s3://anmc-frontend --delete

# Verify deployment
aws s3 ls s3://anmc-frontend/
```

**Frontend URL:**
```
http://anmc-frontend.s3-website-ap-southeast-2.amazonaws.com
```

---

### Step 3: (Optional) Set Up CloudFront CDN

#### 3.1 Create CloudFront Distribution

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --origin-domain-name anmc-frontend.s3-website-ap-southeast-2.amazonaws.com \
  --default-root-object index.html
```

#### 3.2 Configure Custom Domain (Optional)

1. Register domain in Route 53
2. Create SSL certificate in ACM
3. Update CloudFront to use custom domain
4. Update DNS records

---

### Step 4: Configure CORS on Backend

Update `api/server.js` to allow frontend domain:

```javascript
const cors = require('cors');

app.use(cors({
  origin: [
    'http://anmc-frontend.s3-website-ap-southeast-2.amazonaws.com',
    'https://your-cloudfront-url.cloudfront.net',
    'https://your-domain.com'
  ],
  credentials: true
}));
```

Then redeploy:

```bash
cd api
eb deploy
```

---

## 📋 Deployment Checklist

### Pre-Deployment
- [x] DynamoDB tables created
- [x] S3 media bucket created
- [x] Cognito configured
- [x] Secrets Manager configured
- [ ] AWS CLI configured
- [ ] EB CLI installed
- [ ] Environment variables prepared

### Backend Deployment
- [ ] Elastic Beanstalk application created
- [ ] Environment variables configured
- [ ] Backend API deployed
- [ ] API URL obtained
- [ ] CORS configured
- [ ] Health check passing

### Frontend Deployment
- [ ] Production environment file created
- [ ] React app built successfully
- [ ] S3 bucket created
- [ ] Bucket policy configured
- [ ] Build files uploaded
- [ ] Website accessible

### Post-Deployment
- [ ] Test user registration
- [ ] Test user login
- [ ] Test booking creation
- [ ] Test payment flow
- [ ] Test admin panel access
- [ ] Verify file uploads work
- [ ] Check email notifications

---

## 🔧 Alternative Deployment Options

### Option 1: EC2 Instance (Manual)

```bash
# 1. Launch EC2 instance (t3.small recommended)
# 2. SSH into instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# 3. Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 4. Install PM2
sudo npm install -g pm2

# 5. Clone repository
git clone https://github.com/your-repo/anmcDigital.git
cd anmcDigital/api

# 6. Install dependencies
npm install

# 7. Create .env file with production values

# 8. Start with PM2
pm2 start server.js --name anmc-api
pm2 save
pm2 startup

# 9. Install nginx
sudo yum install -y nginx

# 10. Configure nginx as reverse proxy
# 11. Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Option 2: Docker Container (Recommended for Production)

Create `Dockerfile` in api directory:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
```

Deploy to Amazon ECS or AWS App Runner.

---

## 🔐 Security Checklist

- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure security groups (restrict ports)
- [ ] Enable CloudWatch logging
- [ ] Set up CloudWatch alarms
- [ ] Enable AWS WAF (Web Application Firewall)
- [ ] Rotate AWS access keys
- [ ] Review IAM permissions
- [ ] Enable S3 bucket encryption
- [ ] Enable DynamoDB encryption at rest
- [ ] Set up backup strategy

---

## 📊 Monitoring and Maintenance

### CloudWatch Logs

```bash
# View API logs
eb logs

# Or view in AWS Console
# CloudWatch → Logs → /aws/elasticbeanstalk/anmc-api-prod
```

### Health Monitoring

```bash
# Check environment health
eb health

# View dashboard
eb console
```

---

## 💰 Cost Estimate

**Monthly costs (Sydney region):**

| Service | Configuration | Estimated Cost |
|---------|--------------|----------------|
| Elastic Beanstalk (t3.small) | Single instance | $15-20/month |
| DynamoDB | Pay-per-request | $4-5/month |
| S3 Storage | 5GB | $0.15/month |
| S3 Data Transfer | 10GB | $0.90/month |
| CloudFront (optional) | 10GB transfer | $1.20/month |
| Cognito | First 50K MAU free | $0/month |
| Secrets Manager | 2 secrets | $0.80/month |
| **Total** | | **~$22-28/month** |

*Note: Add ~$12/month per domain if using Route 53*

---

## 🆘 Troubleshooting

### Backend Not Accessible

```bash
# Check EB environment status
eb status

# Check logs
eb logs

# SSH into instance
eb ssh
```

### Frontend Not Loading

```bash
# Check S3 bucket contents
aws s3 ls s3://anmc-frontend/

# Verify bucket policy
aws s3api get-bucket-policy --bucket anmc-frontend

# Check website configuration
aws s3api get-bucket-website --bucket anmc-frontend
```

### CORS Errors

1. Check backend CORS configuration
2. Verify frontend URL in allowed origins
3. Check browser console for specific error
4. Ensure credentials: true if using cookies

### Database Connection Issues

1. Verify IAM role has DynamoDB permissions
2. Check AWS region matches table region
3. Verify environment variables are set
4. Check CloudWatch logs for error details

---

## 📞 Support

- **AWS Documentation**: https://docs.aws.amazon.com/
- **Elastic Beanstalk Guide**: https://docs.aws.amazon.com/elasticbeanstalk/
- **GitHub Issues**: Create issue in repository
- **AWS Support**: Use AWS Support Center

---

## 🎉 Success!

Once deployed, your application will be accessible at:

**Frontend:** `http://anmc-frontend.s3-website-ap-southeast-2.amazonaws.com`
**Backend API:** `https://anmc-api-prod.ap-southeast-2.elasticbeanstalk.com/api`

**Next Steps:**
1. Test all features thoroughly
2. Set up monitoring and alerts
3. Configure backups
4. Set up CI/CD pipeline
5. Configure custom domain
6. Enable HTTPS

---

*Last Updated: November 2025*
*Status: Ready for Deployment*
