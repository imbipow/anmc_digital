# ANMC Digital - AWS DynamoDB Infrastructure

This directory contains the AWS infrastructure setup for the ANMC Digital application, specifically the DynamoDB database design and deployment scripts.

## Database Schema

The application uses the following DynamoDB tables:

### 1. Blog Articles Table (`anmc-blog-articles-{env}`)
- **Partition Key**: `id` (Number)
- **Purpose**: Store blog articles and news
- **Indexes**:
  - CategoryIndex (category)
  - FeaturedIndex (featured)

### 2. Events Table (`anmc-events-{env}`)
- **Partition Key**: `id` (Number)
- **Sort Key**: `eventType` (String) - "upcoming" or "recent"
- **Purpose**: Store upcoming and recent events
- **Indexes**:
  - CategoryDateIndex (category, date)

### 3. Members Table (`anmc-members-{env}`)
- **Partition Key**: `memberId` (String)
- **Purpose**: Store member information and subscriptions
- **Indexes**:
  - MembershipTierIndex (membershipTier)
  - ExpiryDateIndex (expiryDate)

### 4. Donations Table (`anmc-donations-{env}`)
- **Partition Key**: `donationId` (String)
- **Sort Key**: `timestamp` (String)
- **Purpose**: Store donation records and options
- **Indexes**:
  - DonationTypeIndex (donationType, timestamp)

### 5. Facilities Table (`anmc-facilities-{env}`)
- **Partition Key**: `facilityId` (String)
- **Sort Key**: `bookingDate` (String)
- **Purpose**: Store facility information and booking records

### 6. Shop Products Table (`anmc-shop-products-{env}`)
- **Partition Key**: `productId` (String)
- **Purpose**: Store shop products and inventory
- **Indexes**:
  - CategoryIndex (category)
  - FeaturedIndex (isFeatured)

### 7. Organization Info Table (`anmc-organization-info-{env}`)
- **Partition Key**: `infoType` (String)
- **Purpose**: Store contact details, committee info, and general organization data

## Prerequisites

1. **AWS CLI** - Install and configure with appropriate credentials
2. **Node.js** (v14+) - For running the data seeding scripts
3. **Bash** - For running deployment scripts (Windows users can use Git Bash or WSL)

## Setup Instructions

### 1. Install Dependencies

```bash
cd aws-infrastructure
npm install
```

### 2. Configure AWS Credentials

Make sure your AWS CLI is configured with appropriate credentials:

```bash
aws configure
```

Or use AWS profiles:

```bash
aws configure --profile anmc-dev
```

### 3. Deploy DynamoDB Tables

#### Using the deployment script (recommended):

```bash
# Deploy to development environment
./deploy.sh -e dev -r us-east-1

# Deploy to production with a specific profile
./deploy.sh -e prod -r ap-southeast-2 -p anmc-prod

# Deploy with custom stack name
./deploy.sh -e staging -r us-west-2 -s my-custom-stack-name
```

#### Using npm scripts:

```bash
# Deploy to different environments
npm run deploy:dev
npm run deploy:staging
npm run deploy:prod
```

#### Using AWS CLI directly:

```bash
# Validate template first
npm run validate

# Deploy manually
aws cloudformation create-stack \
  --stack-name anmc-dynamodb-dev \
  --template-body file://dynamodb-tables.yml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --region us-east-1
```

### 4. Seed Initial Data

After deploying the tables, seed them with initial data from your JSON files:

```bash
# Seed development environment
ENVIRONMENT=dev node seed-data.js

# Or use npm scripts
npm run seed:dev
npm run seed:staging
npm run seed:prod
```

## Environment Variables

The following environment variables can be used:

- `ENVIRONMENT`: Environment name (dev, staging, prod) - default: dev
- `AWS_REGION`: AWS region - default: us-east-1
- `AWS_PROFILE`: AWS profile to use (optional)

## File Structure

```
aws-infrastructure/
├── dynamodb-tables.yml    # CloudFormation template for DynamoDB tables
├── seed-data.js           # Script to seed tables with initial data
├── deploy.sh              # Deployment script
├── package.json           # Node.js dependencies and scripts
└── README.md              # This file
```

## Deployment Script Options

The `deploy.sh` script supports the following options:

- `-e, --environment`: Environment (dev|staging|prod) [default: dev]
- `-r, --region`: AWS region [default: us-east-1]
- `-s, --stack-name`: CloudFormation stack name [default: anmc-dynamodb-{environment}]
- `-p, --profile`: AWS profile to use [optional]
- `-h, --help`: Show help message

## Data Seeding

The `seed-data.js` script will:

1. Load data from JSON files in `../public/data/`
2. Transform the data to match the DynamoDB schema
3. Insert the data into the appropriate tables
4. Provide progress feedback and error handling

## Cost Considerations

All tables are configured with **PAY_PER_REQUEST** billing mode, which means:

- No upfront costs or minimum fees
- You pay only for what you use
- Automatically scales up and down based on demand
- Ideal for development and variable workloads

For production with predictable traffic, consider switching to **PROVISIONED** billing mode for cost optimization.

## Security

- All tables are tagged for resource management
- Consider implementing fine-grained access control with IAM policies
- Enable point-in-time recovery for production environments
- Consider encryption at rest for sensitive data

## Monitoring

Consider setting up:

- CloudWatch alarms for read/write capacity
- DynamoDB Insights for performance monitoring
- Cost budgets and alerts

## Troubleshooting

### Common Issues

1. **Template validation errors**: Check YAML syntax and AWS resource properties
2. **Stack creation failures**: Check IAM permissions and resource limits
3. **Data seeding errors**: Verify table names and AWS credentials
4. **Regional issues**: Ensure consistent region configuration across all commands

### Useful Commands

```bash
# List all stacks
aws cloudformation list-stacks --region us-east-1

# Describe stack events
aws cloudformation describe-stack-events --stack-name anmc-dynamodb-dev

# Delete stack (careful!)
aws cloudformation delete-stack --stack-name anmc-dynamodb-dev

# List tables
aws dynamodb list-tables --region us-east-1

# Scan table (for testing)
aws dynamodb scan --table-name anmc-blog-articles-dev --limit 5
```

## Next Steps

After successfully deploying the database:

1. Update your application configuration with the table names
2. Implement AWS SDK integration in your application
3. Set up proper IAM roles for your application
4. Consider implementing API Gateway + Lambda for serverless architecture
5. Set up monitoring and alerting
6. Plan for backup and disaster recovery

## Support

For issues or questions regarding the infrastructure setup, please check:

1. AWS CloudFormation documentation
2. DynamoDB best practices guide
3. Project documentation and issue tracker