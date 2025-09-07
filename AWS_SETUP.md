# AWS Amplify + DynamoDB Setup Guide

This guide will help you set up AWS Amplify with DynamoDB for your content management system.

## Prerequisites

1. **AWS Account**: You need an active AWS account
2. **AWS CLI**: Install and configure AWS CLI with your credentials
3. **Amplify CLI**: Already installed (`@aws-amplify/cli`)

## Setup Steps

### 1. Configure AWS CLI

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key  
- Default region (e.g., `us-east-1`)
- Default output format (`json`)

### 2. Initialize Amplify Project

```bash
amplify init
```

Follow the prompts:
- Project name: `anmcDigital`
- Environment name: `dev`
- Choose your default editor
- Choose the type of app: `javascript`
- Framework: `react`
- Source directory: `src`
- Distribution directory: `build`
- Build command: `npm run build`
- Start command: `npm start`

### 3. Add Storage (DynamoDB)

```bash
amplify add storage
```

Choose:
- `NoSQL Database`
- Resource name: `contentdb`
- Table name: `ContentTable`

Configure the table:
- Partition key: `id` (String)
- Sort key: `type` (String)
- Add a global secondary index:
  - Index name: `TypeIndex`
  - Partition key: `type` (String)
  - Sort key: `created_at` (String)

### 4. Add API (REST API)

```bash
amplify add api
```

Choose:
- `REST`
- API name: `contentAPI`
- Path: `/content`
- Lambda source: `Create a new Lambda function`
- Function name: `contentAPIHandler`
- Choose template: `CRUD function for DynamoDB`
- Choose the DynamoDB table you created: `ContentTable`

### 5. Deploy to AWS

```bash
amplify push
```

This will:
- Create the DynamoDB table
- Deploy the Lambda function
- Create the API Gateway
- Generate the `aws-exports.js` configuration file

### 6. Environment Variables

Create a `.env` file in your root directory:

```bash
cp .env.example .env
```

Update the values in `.env`:
- Replace `your-api-id` with your actual API Gateway ID (you'll get this after `amplify push`)
- Set your AWS region if different from `us-east-1`

### 7. Migrate Existing Data

After deployment, migrate your existing JSON data to DynamoDB:

```bash
# Install AWS SDK for the migration script
npm install aws-sdk

# Run the migration
node scripts/migrate-data.js
```

### 8. Update API Endpoints

The current configuration supports these endpoints:
- `/homepage` - Homepage content
- `/counters` - Counter statistics
- `/blog_posts` - Blog posts
- `/news` - News articles
- `/events` - Events
- `/projects` - Projects
- `/about_us` - About us content
- `/facilities` - Facilities
- `/contact` - Contact information

### 9. Test Your Setup

Start your React app:

```bash
npm start
```

The app should now fetch data from DynamoDB instead of the local JSON server.

## DynamoDB Table Structure

Your data will be stored with this structure:

```json
{
  "id": "unique-identifier",
  "type": "content-type", 
  "created_at": "2024-01-01T00:00:00Z",
  // ... other fields specific to content type
}
```

Content types:
- `homepage` - Hero section content
- `counters` - Statistics counters
- `blog_posts` - Blog articles
- `news` - News items
- `events` - Event information
- `projects` - Project details
- `about_us` - About page content
- `facilities` - Facility information
- `contact` - Contact details

## Troubleshooting

### Common Issues

1. **API Gateway not found**: Make sure you completed `amplify push` successfully
2. **DynamoDB access denied**: Check your Lambda function has proper DynamoDB permissions
3. **CORS errors**: Ensure CORS is properly configured in API Gateway

### Useful Commands

```bash
# Check Amplify status
amplify status

# View Amplify console
amplify console

# Add environment
amplify env add

# Remove resources
amplify remove storage
amplify remove api
```

## Security Notes

- Never commit AWS credentials to version control
- Use IAM roles instead of access keys in production
- Enable CloudTrail for audit logging
- Consider using Cognito for authentication if user management is needed

## Cost Optimization

- DynamoDB is configured with On-Demand pricing
- API Gateway charges per request
- Lambda has a generous free tier
- Monitor usage through AWS Cost Explorer