# ANMC Digital - DynamoDB Deployment Guide

## 🚀 Quick Start

This guide will walk you through deploying the DynamoDB infrastructure for the ANMC Digital application.

## Prerequisites Checklist

Before you begin, ensure you have:

- [ ] AWS Account with administrative access
- [ ] AWS CLI installed and configured
- [ ] Node.js v14+ installed
- [ ] Git repository cloned
- [ ] Basic understanding of AWS DynamoDB and CloudFormation

## Step-by-Step Deployment

### 1. Configure AWS Credentials

```bash
# Configure AWS CLI with your credentials
aws configure

# Verify configuration
aws sts get-caller-identity
```

Expected output:
```json
{
    "UserId": "AIDAI...",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/your-username"
}
```

### 2. Install Dependencies

```bash
cd aws-infrastructure
npm install
```

### 3. Validate CloudFormation Template

```bash
# Validate the template
npm run validate
```

Expected output:
```
{
    "Parameters": [...],
    "Description": "DynamoDB tables for ANMC Digital Application - Updated Schema"
}
```

### 4. Deploy DynamoDB Tables

#### Option A: Deploy to Development Environment

```bash
# Using AWS CLI (Sydney region)
aws cloudformation create-stack \
  --stack-name anmc-dynamodb-dev \
  --template-body file://dynamodb-tables-updated.yml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --region ap-southeast-2

# Wait for stack creation to complete
aws cloudformation wait stack-create-complete \
  --stack-name anmc-dynamodb-dev \
  --region ap-southeast-2
```

#### Option B: Deploy via AWS Console

1. Go to AWS CloudFormation Console
2. Click **Create Stack** → **With new resources**
3. Choose **Upload a template file**
4. Upload `dynamodb-tables-updated.yml`
5. Click **Next**
6. Enter stack name: `anmc-dynamodb-dev`
7. Set Environment parameter to `dev`
8. Click **Next** → **Next** → **Create Stack**
9. Wait for status to show **CREATE_COMPLETE**

### 5. Verify Table Creation

```bash
# List all DynamoDB tables
aws dynamodb list-tables --region ap-southeast-2

# Check for ANMC tables
aws dynamodb list-tables --region ap-southeast-2 | grep anmc
```

Expected output:
```
"anmc-news-dev"
"anmc-events-dev"
"anmc-projects-dev"
"anmc-facilities-dev"
"anmc-homepage-dev"
"anmc-counters-dev"
"anmc-about-us-dev"
"anmc-contact-dev"
"anmc-master-plan-dev"
"anmc-project-achievements-dev"
```

### 6. Seed Initial Data

```bash
# Set environment variables
export AWS_REGION=ap-southeast-2
export ENVIRONMENT=dev

# Run seeding script
npm run seed:dev
```

Expected output:
```
╔══════════════════════════════════════════════════════════╗
║   ANMC Digital - DynamoDB Data Seeding Process          ║
╚══════════════════════════════════════════════════════════╝

🌍 Region: us-east-1
🏷️  Environment: dev

✓ Successfully loaded db.json

📰 Seeding news articles...
  ✓ Batch 1 written successfully (6 items)
✅ Successfully seeded 6 news articles

📅 Seeding events...
  ✓ Batch 1 written successfully (2 items)
✅ Successfully seeded 2 events

...

╔══════════════════════════════════════════════════════════╗
║   ✅ Data seeding completed successfully!               ║
╚══════════════════════════════════════════════════════════╝
```

### 7. Verify Data

```bash
# Query a table to verify data
aws dynamodb scan \
  --table-name anmc-news-dev \
  --limit 1 \
  --region ap-southeast-2
```

## Production Deployment

### Deploy to Production

⚠️ **Warning**: Ensure you've tested thoroughly in dev environment first!

```bash
# Deploy stack
aws cloudformation create-stack \
  --stack-name anmc-dynamodb-prod \
  --template-body file://dynamodb-tables-updated.yml \
  --parameters ParameterKey=Environment,ParameterValue=prod \
  --region us-east-1

# Wait for completion
aws cloudformation wait stack-create-complete \
  --stack-name anmc-dynamodb-prod \
  --region us-east-1

# Seed production data
export ENVIRONMENT=prod
npm run seed:prod
```

## Common Operations

### Re-seed Tables

```bash
# Clear and re-seed dev environment
npm run seed:reset:dev

# Seed only (no clearing)
npm run seed:dev
```

### Clear All Data

```bash
# Clear all tables (without re-seeding)
npm run seed:clear:dev
```

### Update Stack

```bash
# Update existing stack with new template
aws cloudformation update-stack \
  --stack-name anmc-dynamodb-dev \
  --template-body file://dynamodb-tables-updated.yml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --region us-east-1
```

### Delete Stack

⚠️ **Warning**: This will permanently delete all tables and data!

```bash
# Delete dev stack
aws cloudformation delete-stack \
  --stack-name anmc-dynamodb-dev \
  --region us-east-1

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name anmc-dynamodb-dev \
  --region us-east-1
```

## Environment-Specific Configurations

### Development

- Environment: `dev`
- Region: `ap-southeast-2` (Sydney)
- Billing: Pay-per-request
- Backup: Optional
- Point-in-time recovery: Disabled

### Staging

- Environment: `staging`
- Region: `ap-southeast-2` (Sydney)
- Billing: Pay-per-request
- Backup: Daily
- Point-in-time recovery: Enabled

### Production

- Environment: `prod`
- Region: `ap-southeast-2` (Sydney) with replica in `ap-southeast-1` (Singapore) recommended
- Billing: Pay-per-request or Provisioned (based on load)
- Backup: Daily with 30-day retention
- Point-in-time recovery: Enabled
- DynamoDB Global Tables: Recommended for DR

## Monitoring and Alerts

### Set Up CloudWatch Alarms

```bash
# Create alarm for high read capacity
aws cloudwatch put-metric-alarm \
  --alarm-name anmc-news-high-reads \
  --alarm-description "Alert when read capacity is high" \
  --metric-name ConsumedReadCapacityUnits \
  --namespace AWS/DynamoDB \
  --statistic Sum \
  --period 300 \
  --threshold 1000 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=TableName,Value=anmc-news-prod \
  --evaluation-periods 2
```

### View Metrics

```bash
# View table metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=anmc-news-dev \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

## Backup and Recovery

### Enable Point-in-Time Recovery (Production)

```bash
# Enable PITR for production tables
for table in news events projects facilities homepage counters about-us contact master-plan project-achievements; do
  aws dynamodb update-continuous-backups \
    --table-name anmc-${table}-prod \
    --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true \
    --region us-east-1
done
```

### Create On-Demand Backup

```bash
# Create backup for a table
aws dynamodb create-backup \
  --table-name anmc-news-prod \
  --backup-name anmc-news-backup-$(date +%Y%m%d-%H%M%S) \
  --region us-east-1
```

### Restore from Backup

```bash
# List available backups
aws dynamodb list-backups \
  --table-name anmc-news-prod \
  --region us-east-1

# Restore from backup
aws dynamodb restore-table-from-backup \
  --target-table-name anmc-news-prod-restored \
  --backup-arn arn:aws:dynamodb:us-east-1:123456789012:table/anmc-news-prod/backup/01234567890123-abcdef12 \
  --region us-east-1
```

## Troubleshooting

### Issue: Stack Creation Failed

**Solution:**
```bash
# Check stack events
aws cloudformation describe-stack-events \
  --stack-name anmc-dynamodb-dev \
  --region us-east-1

# Delete failed stack and retry
aws cloudformation delete-stack \
  --stack-name anmc-dynamodb-dev \
  --region us-east-1
```

### Issue: Seeding Script Fails

**Possible Causes:**
1. Tables not created yet
2. AWS credentials not configured
3. Insufficient permissions
4. db.json file not found

**Solution:**
```bash
# Verify tables exist
aws dynamodb list-tables --region us-east-1

# Check AWS credentials
aws sts get-caller-identity

# Verify db.json exists
ls -la ../server/db.json

# Check permissions
aws iam get-user
```

### Issue: High Costs

**Solution:**
```bash
# Review table usage
aws dynamodb describe-table \
  --table-name anmc-news-dev \
  --region us-east-1

# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedWriteCapacityUnits \
  --dimensions Name=TableName,Value=anmc-news-dev \
  --start-time $(date -u -d '7 days ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 86400 \
  --statistics Sum
```

## Security Best Practices

1. **Use IAM Roles**: Don't use root credentials
2. **Enable Encryption**: Tables should use encryption at rest
3. **VPC Endpoints**: Use VPC endpoints for private access
4. **Least Privilege**: Grant minimal required permissions
5. **Audit Logging**: Enable CloudTrail for DynamoDB API calls

### Example IAM Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:*:table/anmc-*"
    }
  ]
}
```

## Cost Estimation

### Development Environment
- **Tables**: 10 tables
- **Storage**: < 1 GB
- **Reads**: ~10,000/month
- **Writes**: ~1,000/month
- **Estimated Cost**: $4-5/month

### Production Environment
- **Tables**: 10 tables
- **Storage**: 5-10 GB
- **Reads**: ~1,000,000/month
- **Writes**: ~100,000/month
- **Backups**: 30-day retention
- **PITR**: Enabled
- **Estimated Cost**: $50-100/month

## Next Steps

After successful deployment:

1. ✅ Update backend API to use DynamoDB
2. ✅ Implement caching layer (ElastiCache/CloudFront)
3. ✅ Set up monitoring and alerting
4. ✅ Configure backup schedule
5. ✅ Create disaster recovery plan
6. ✅ Document API endpoints
7. ✅ Implement rate limiting
8. ✅ Security audit

## Support

For issues or questions:
- Check [README-DYNAMODB.md](./README-DYNAMODB.md) for detailed documentation
- Review CloudFormation events for errors
- Contact AWS Support for infrastructure issues
- Create GitHub issue for application-specific problems

## Additional Resources

- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [CloudFormation User Guide](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [AWS Pricing Calculator](https://calculator.aws/)
