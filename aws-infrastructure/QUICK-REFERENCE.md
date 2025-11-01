# DynamoDB Quick Reference Card

## 🚀 Quick Commands

### Deployment
```bash
# Deploy to dev
aws cloudformation create-stack --stack-name anmc-dynamodb-dev \
  --template-body file://dynamodb-tables-updated.yml \
  --parameters ParameterKey=Environment,ParameterValue=dev

# Validate template
npm run validate

# Wait for completion
aws cloudformation wait stack-create-complete --stack-name anmc-dynamodb-dev
```

### Data Seeding
```bash
# Seed dev environment
npm run seed:dev

# Clear and re-seed
npm run seed:reset:dev

# Clear only
npm run seed:clear:dev
```

### Querying Tables
```bash
# Get all items from a table
aws dynamodb scan --table-name anmc-news-dev --limit 10

# Get specific item
aws dynamodb get-item --table-name anmc-news-dev \
  --key '{"id": {"N": "1"}}'

# Query by GSI
aws dynamodb query --table-name anmc-news-dev \
  --index-name CategoryDateIndex \
  --key-condition-expression "category = :cat" \
  --expression-attribute-values '{":cat": {"S": "community-events"}}'
```

## 📊 Table Names (Dev)

| Resource | Table Name |
|----------|-----------|
| News | `anmc-news-dev` |
| Events | `anmc-events-dev` |
| Projects | `anmc-projects-dev` |
| Facilities | `anmc-facilities-dev` |
| Homepage | `anmc-homepage-dev` |
| Counters | `anmc-counters-dev` |
| About Us | `anmc-about-us-dev` |
| Contact | `anmc-contact-dev` |
| Master Plan | `anmc-master-plan-dev` |
| Achievements | `anmc-project-achievements-dev` |

## 🔑 Key Structures

```javascript
// News
{ id: Number }

// Events
{ id: Number }

// Projects
{ id: Number }

// Facilities
{ id: String }

// Homepage
{ id: String }

// Counters
{ id: Number }

// About Us
{ id: String }

// Contact
{ id: String }

// Master Plan
{ id: String }

// Achievements
{ year: String }
```

## 📑 Global Secondary Indexes

### News Table
- `SlugIndex`: slug
- `CategoryDateIndex`: category + publishedAt
- `FeaturedIndex`: featured + publishedAt

### Events Table
- `SlugIndex`: slug
- `StatusDateIndex`: status + startDate
- `CategoryDateIndex`: category + startDate

### Projects Table
- `SlugIndex`: slug
- `StatusIndex`: status
- `CategoryIndex`: category
- `FeaturedIndex`: featured

### Achievements Table
- `CategoryIndex`: category + year

## 🔍 Common Queries

### Get Featured News
```javascript
const params = {
  TableName: 'anmc-news-dev',
  IndexName: 'FeaturedIndex',
  KeyConditionExpression: 'featured = :f',
  ExpressionAttributeValues: { ':f': 'true' }
};
```

### Get Upcoming Events
```javascript
const params = {
  TableName: 'anmc-events-dev',
  IndexName: 'StatusDateIndex',
  KeyConditionExpression: 'status = :s AND startDate >= :d',
  ExpressionAttributeValues: {
    ':s': 'upcoming',
    ':d': new Date().toISOString().split('T')[0]
  }
};
```

### Get News by Category
```javascript
const params = {
  TableName: 'anmc-news-dev',
  IndexName: 'CategoryDateIndex',
  KeyConditionExpression: 'category = :c',
  ExpressionAttributeValues: { ':c': 'community-events' },
  ScanIndexForward: false  // DESC order
};
```

## 💰 Cost Estimation

| Environment | Monthly Cost |
|-------------|--------------|
| Dev | $4-5 |
| Staging | $10-15 |
| Production | $50-100 |

## 🛠️ Useful Scripts

### List All Tables
```bash
aws dynamodb list-tables | grep anmc
```

### Describe Table
```bash
aws dynamodb describe-table --table-name anmc-news-dev
```

### Get Item Count
```bash
aws dynamodb describe-table --table-name anmc-news-dev \
  --query 'Table.ItemCount'
```

### Enable PITR (Production)
```bash
aws dynamodb update-continuous-backups \
  --table-name anmc-news-prod \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

### Create Backup
```bash
aws dynamodb create-backup \
  --table-name anmc-news-prod \
  --backup-name "backup-$(date +%Y%m%d)"
```

## 🔧 Troubleshooting

### Check Stack Status
```bash
aws cloudformation describe-stacks --stack-name anmc-dynamodb-dev
```

### View Stack Events
```bash
aws cloudformation describe-stack-events \
  --stack-name anmc-dynamodb-dev --max-items 10
```

### Delete Stack
```bash
aws cloudformation delete-stack --stack-name anmc-dynamodb-dev
```

## 📦 npm Scripts

```bash
npm run deploy          # Deploy stack
npm run seed            # Seed data
npm run seed:dev        # Seed dev
npm run seed:clear      # Clear all tables
npm run seed:reset      # Clear and re-seed
npm run validate        # Validate template
```

## 🌍 Regions

- Primary: `ap-southeast-2` (Sydney, Australia)
- Secondary (Prod): `ap-southeast-1` (Singapore) - recommended for DR

## 📞 Support

- Documentation: `README-DYNAMODB.md`
- Deployment Guide: `DEPLOYMENT-GUIDE.md`
- Schema Details: `DATABASE-SCHEMA.md`
- AWS Docs: https://docs.aws.amazon.com/dynamodb/
