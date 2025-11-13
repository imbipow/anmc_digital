require('dotenv').config();
const { getSecret } = require('./secrets');

// Configuration that doesn't require secrets
const baseConfig = {
  // Server config
  port: process.env.PORT || 3001,
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',
  environment: process.env.ENVIRONMENT || 'dev',

  // DynamoDB table names
  tables: {
    news: `anmc-news-${process.env.ENVIRONMENT || 'dev'}`,
    events: `anmc-events-${process.env.ENVIRONMENT || 'dev'}`,
    projects: `anmc-projects-${process.env.ENVIRONMENT || 'dev'}`,
    homepage: `anmc-homepage-${process.env.ENVIRONMENT || 'dev'}`,
    counters: `anmc-counters-${process.env.ENVIRONMENT || 'dev'}`,
    aboutUs: `anmc-about-us-${process.env.ENVIRONMENT || 'dev'}`,
    contact: `anmc-contact-${process.env.ENVIRONMENT || 'dev'}`,
    masterPlan: `anmc-master-plan-${process.env.ENVIRONMENT || 'dev'}`,
    projectAchievements: `anmc-project-achievements-${process.env.ENVIRONMENT || 'dev'}`,
    faqs: `anmc-faqs-${process.env.ENVIRONMENT || 'dev'}`,
    donations: `anmc-donations-${process.env.ENVIRONMENT || 'dev'}`,
    members: `anmc-members-${process.env.ENVIRONMENT || 'dev'}`,
    services: `anmc-services-${process.env.ENVIRONMENT || 'dev'}`,
    bookings: `anmc-bookings-${process.env.ENVIRONMENT || 'dev'}`,
    documents: `anmc-documents-${process.env.ENVIRONMENT || 'dev'}`,
    subscribers: `anmc-subscribers-${process.env.ENVIRONMENT || 'dev'}`,
    messages: `anmc-messages-${process.env.ENVIRONMENT || 'dev'}`
  },

  // CORS config
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 100 : 1000),
    message: 'Too many requests from this IP, please try again later.'
  }
};

// Configuration that requires secrets (will be populated async)
const secretConfig = {
  aws: {
    region: process.env.AWS_REGION || 'ap-southeast-2',
    accessKeyId: null, // Will be loaded from secrets
    secretAccessKey: null // Will be loaded from secrets
  },
  cognito: {
    userPoolId: null, // Will be loaded from secrets
    clientId: null, // Will be loaded from secrets
    region: null // Will be loaded from secrets
  },
  stripe: {
    secretKey: null // Will be loaded from secrets
  },
  s3: {
    bucket: process.env.S3_BUCKET_NAME || `anmc-media-${process.env.ENVIRONMENT || 'dev'}`
  },
  email: {
    adminEmail: null, // Will be loaded from secrets
    fromEmail: null // Will be loaded from secrets
  }
};

// Helper function to get AWS credentials
async function getAwsCredentials() {
  return {
    region: await getSecret('AWS_REGION'),
    accessKeyId: await getSecret('AWS_ACCESS_KEY_ID'),
    secretAccessKey: await getSecret('AWS_SECRET_ACCESS_KEY')
  };
}

// Helper function to get Cognito config
async function getCognitoConfig() {
  return {
    userPoolId: await getSecret('COGNITO_USER_POOL_ID'),
    clientId: await getSecret('COGNITO_CLIENT_ID'),
    region: await getSecret('COGNITO_REGION')
  };
}

// Helper function to get Stripe config
async function getStripeConfig() {
  return {
    secretKey: await getSecret('STRIPE_SECRET_KEY')
  };
}

// Helper function to get S3 config
async function getS3Config() {
  return {
    bucket: await getSecret('S3_BUCKET_NAME')
  };
}

// Helper function to get email config
async function getEmailConfig() {
  return {
    adminEmail: await getSecret('ADMIN_EMAIL'),
    fromEmail: await getSecret('FROM_EMAIL')
  };
}

// Export base config immediately, secrets will be loaded async
module.exports = {
  ...baseConfig,
  ...secretConfig,
  // Helper functions to get secret-based config
  getAwsCredentials,
  getCognitoConfig,
  getStripeConfig,
  getS3Config,
  getEmailConfig
};
