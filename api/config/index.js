const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

// IMPORTANT: Force API server to use port 3001 regardless of parent environment
// Frontend uses PORT=3036, API must use PORT=3001
const API_PORT = 3001;

module.exports = {
  // Server config
  port: API_PORT,
  host: process.env.HOST || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',

  // AWS config
  aws: {
    region: process.env.AWS_REGION || 'ap-southeast-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  },

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

  // S3 config
  s3: {
    bucket: process.env.S3_BUCKET_NAME || `anmc-media-${process.env.ENVIRONMENT || 'dev'}`
  },

  // CORS config
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  },

  // Rate limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 100 : 1000), // 1000 for dev, 100 for prod
    message: 'Too many requests from this IP, please try again later.'
  }
};
