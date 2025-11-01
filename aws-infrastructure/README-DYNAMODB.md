# ANMC Digital - DynamoDB Infrastructure

This directory contains the AWS infrastructure setup for the ANMC Digital application, specifically the DynamoDB database schema and seeding scripts.

## 📋 Table of Contents

- [Overview](#overview)
- [DynamoDB Tables](#dynamodb-tables)
- [Setup Instructions](#setup-instructions)
- [Data Seeding](#data-seeding)
- [Table Schemas](#table-schemas)
- [Best Practices](#best-practices)

## 🎯 Overview

The application uses Amazon DynamoDB as its primary database. The infrastructure is defined using AWS CloudFormation and includes:

- **10 DynamoDB tables** for different data types
- **Pay-per-request billing** for cost optimization
- **Global Secondary Indexes (GSIs)** for efficient querying
- **Automated seeding scripts** for initial data population

## 📊 DynamoDB Tables

| Table Name | Purpose | Primary Key | GSIs |
|------------|---------|-------------|------|
| `anmc-news-{env}` | News/Blog articles | `id` (N) | SlugIndex, CategoryDateIndex, FeaturedIndex |
| `anmc-events-{env}` | Community events | `id` (N) | SlugIndex, StatusDateIndex, CategoryDateIndex |
| `anmc-projects-{env}` | Community projects | `id` (N) | SlugIndex, StatusIndex, CategoryIndex, FeaturedIndex |
| `anmc-facilities-{env}` | Facility information | `id` (S) | - |
| `anmc-homepage-{env}` | Homepage content | `id` (S) | ComponentIndex |
| `anmc-counters-{env}` | Statistics counters | `id` (N) | - |
| `anmc-about-us-{env}` | About us content | `id` (S) | - |
| `anmc-contact-{env}` | Contact information | `id` (S) | - |
| `anmc-master-plan-{env}` | Strategic master plan | `id` (S) | - |
| `anmc-project-achievements-{env}` | Historical achievements | `year` (S) | CategoryIndex |

## 🚀 Setup Instructions

### Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured
- Node.js installed (v14 or higher)
- AWS SDK for JavaScript

### Step 1: Install Dependencies

```bash
cd aws-infrastructure
npm install
```

### Step 2: Deploy DynamoDB Tables

#### Option A: Using AWS CloudFormation (Recommended)

```bash
# Deploy to dev environment (Sydney region)
aws cloudformation create-stack \
  --stack-name anmc-dynamodb-dev \
  --template-body file://dynamodb-tables-updated.yml \
  --parameters ParameterKey=Environment,ParameterValue=dev \
  --region ap-southeast-2

# Deploy to production (Sydney region)
aws cloudformation create-stack \
  --stack-name anmc-dynamodb-prod \
  --template-body file://dynamodb-tables-updated.yml \
  --parameters ParameterKey=Environment,ParameterValue=prod \
  --region ap-southeast-2
```

#### Option B: Using AWS Console

1. Open AWS CloudFormation console
2. Click "Create Stack"
3. Upload `dynamodb-tables-updated.yml`
4. Set the Environment parameter
5. Review and create

### Step 3: Verify Table Creation

```bash
# List all ANMC tables
aws dynamodb list-tables | grep anmc

# Describe a specific table
aws dynamodb describe-table --table-name anmc-news-dev
```

## 📥 Data Seeding

### Seed All Tables

```bash
# Set environment variables
export AWS_REGION=ap-southeast-2
export ENVIRONMENT=dev

# Run seeding script
node seed-data-updated.js
```

### Clear and Re-seed Tables

```bash
# Clear all tables and then seed
node seed-data-updated.js --clear --seed

# Only clear tables (no seeding)
node seed-data-updated.js --clear
```

### Environment Variables

- `AWS_REGION`: AWS region where tables are deployed (default: `ap-southeast-2` - Sydney)
- `ENVIRONMENT`: Environment name (`dev`, `staging`, or `prod`) (default: `dev`)
- `AWS_ACCESS_KEY_ID`: Your AWS access key
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret key

## 📐 Table Schemas

### News Table

```javascript
{
  id: Number,                    // Primary Key
  slug: String,                  // GSI
  title: String,
  content: String,
  excerpt: String,
  authorName: String,
  date: String,                  // ISO 8601 format
  publishedAt: String,           // ISO 8601 format (GSI sort key)
  featuredImage: String,         // URL
  featured: String,              // 'true' or 'false' (GSI)
  status: String,                // 'published', 'draft'
  category: String,              // GSI
  tags: Array<String>
}
```

### Events Table

```javascript
{
  id: Number,                    // Primary Key
  slug: String,                  // GSI
  title: String,
  description: String,
  content: String,
  startDate: String,             // YYYY-MM-DD (GSI sort key)
  endDate: String,               // YYYY-MM-DD
  startTime: String,             // HH:MM
  endTime: String,               // HH:MM
  location: String,
  address: String,
  featuredImage: String,         // URL
  featured: Boolean,
  status: String,                // 'upcoming', 'past' (GSI)
  category: String,              // GSI
  maxAttendees: Number,
  registrationRequired: Boolean,
  contactEmail: String,
  tags: Array<String>
}
```

### Projects Table

```javascript
{
  id: Number,                    // Primary Key
  slug: String,                  // GSI
  title: String,
  description: String,
  content: String,
  status: String,                // 'active', 'completed', 'planning' (GSI)
  startDate: String,             // YYYY-MM-DD
  endDate: String,               // YYYY-MM-DD
  budget: Number,
  fundingSource: String,
  projectManager: String,
  featuredImage: String,         // URL
  featured: String,              // 'true' or 'false' (GSI)
  category: String,              // GSI
  progress: Number,              // 0-100
  tags: Array<String>
}
```

### About Us Table

```javascript
{
  id: String,                    // Primary Key (e.g., 'main')
  title: String,
  subtitle: String,
  mission: {
    title: String,
    content: String,
    icon: String
  },
  vision: {
    title: String,
    content: String,
    icon: String
  },
  history: {
    title: String,
    content: String,
    icon: String
  },
  executiveCommittee: {
    title: String,
    subtitle: String,
    members: Array<{
      id: Number,
      name: String,
      title: String,
      position: String,
      email: String,
      phone: String,
      description: String,
      image: String,              // URL
      tenure: String,
      responsibilities: Array<String>
    }>
  },
  governance: {
    title: String,
    subtitle: String,
    structure: Array<Object>
  },
  featuredImage: String          // URL
}
```

### Facilities Table

```javascript
{
  id: String,                    // Primary Key
  name: String,
  capacity: String,
  description: String,
  features: Array<String>,
  pricing: String,
  icon: String,
  image: String                  // URL
}
```

### Homepage Table

```javascript
{
  id: String,                    // Primary Key (e.g., 'hero')
  component: String,             // GSI (e.g., 'hero', 'counters')
  data: {
    // Component-specific data
  }
}
```

### Counters Table

```javascript
{
  id: Number,                    // Primary Key
  count: Number,
  prefix: String,                // Optional (e.g., '$')
  suffix: String,                // Optional (e.g., '+', 'M+')
  label: String
}
```

### Contact Table

```javascript
{
  id: String,                    // Primary Key (e.g., 'main')
  address: String,
  phone: String,
  email: String,
  emergencyPhone: String,
  officeHours: String,
  weekendHours: String,
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String
  },
  mapCoordinates: {
    lat: Number,
    lng: Number
  }
}
```

### Master Plan Table

```javascript
{
  id: String,                    // Primary Key
  title: String,
  description: String,
  period: String,
  total_budget: String,
  key_areas: Array<{
    title: String,
    description: String,
    budget: String,
    timeline: String
  }>,
  goals: Array<String>
}
```

### Project Achievements Table

```javascript
{
  year: String,                  // Primary Key (e.g., '1998')
  title: String,
  description: String,
  category: String               // GSI (e.g., 'Foundation', 'Growth')
}
```

## 🔍 Querying Examples

### Query News by Category

```javascript
const params = {
  TableName: 'anmc-news-dev',
  IndexName: 'CategoryDateIndex',
  KeyConditionExpression: 'category = :category',
  ExpressionAttributeValues: {
    ':category': 'community-events'
  },
  ScanIndexForward: false  // Sort by date descending
};

const result = await dynamodb.query(params).promise();
```

### Query Featured News

```javascript
const params = {
  TableName: 'anmc-news-dev',
  IndexName: 'FeaturedIndex',
  KeyConditionExpression: 'featured = :featured',
  ExpressionAttributeValues: {
    ':featured': 'true'
  }
};

const result = await dynamodb.query(params).promise();
```

### Get Event by Slug

```javascript
const params = {
  TableName: 'anmc-events-dev',
  IndexName: 'SlugIndex',
  KeyConditionExpression: 'slug = :slug',
  ExpressionAttributeValues: {
    ':slug': 'community-picnic-2025'
  }
};

const result = await dynamodb.query(params).promise();
```

### Query Upcoming Events

```javascript
const params = {
  TableName: 'anmc-events-dev',
  IndexName: 'StatusDateIndex',
  KeyConditionExpression: 'status = :status AND startDate >= :today',
  ExpressionAttributeValues: {
    ':status': 'upcoming',
    ':today': new Date().toISOString().split('T')[0]
  }
};

const result = await dynamodb.query(params).promise();
```

## 💰 Cost Optimization

- **Pay-per-request billing**: Only pay for actual read/write requests
- **No idle costs**: No charges when tables are not being used
- **Efficient queries**: Use GSIs to avoid expensive scans
- **Data lifecycle**: Implement TTL for temporary data if needed

### Estimated Monthly Costs (Dev Environment)

- Write requests: ~1,000 per month = $1.25
- Read requests: ~10,000 per month = $2.50
- Storage: <1 GB = $0.25
- **Total: ~$4/month**

## 🔒 Best Practices

1. **Always use indexes for queries**: Avoid full table scans
2. **Implement error handling**: Use retries with exponential backoff
3. **Batch operations**: Use BatchWriteItem for multiple writes
4. **Consistent naming**: Follow the `anmc-{resource}-{environment}` pattern
5. **Monitor costs**: Set up CloudWatch alarms for unexpected usage
6. **Data validation**: Validate data before writing to DynamoDB
7. **Use single-table design when appropriate**: For related data with access patterns
8. **Enable point-in-time recovery**: For production tables

## 🔄 Migration from JSON Server

To migrate from the local JSON server to DynamoDB:

1. Deploy the CloudFormation stack
2. Run the seed script to populate tables
3. Update API endpoints to use DynamoDB instead of json-server
4. Implement AWS SDK in your backend services
5. Test thoroughly before switching production traffic

## 📚 Additional Resources

- [AWS DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/)
- [DynamoDB Best Practices](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/best-practices.html)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [DynamoDB Pricing](https://aws.amazon.com/dynamodb/pricing/)

## 🆘 Troubleshooting

### Tables not created

- Check CloudFormation stack status
- Verify IAM permissions
- Check CloudFormation events for errors

### Seeding fails

- Ensure tables are created and active
- Verify AWS credentials are configured
- Check that db.json exists and is valid JSON
- Verify network connectivity to AWS

### High costs

- Review CloudWatch metrics
- Check for unexpected table scans
- Verify GSI usage is appropriate
- Consider switching to provisioned capacity for predictable workloads

## 📞 Support

For questions or issues, contact the development team or create an issue in the project repository.
