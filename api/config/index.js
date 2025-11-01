require('dotenv').config();

module.exports = {
  // Server config
  port: process.env.PORT || 3001,
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
    facilities: `anmc-facilities-${process.env.ENVIRONMENT || 'dev'}`,
    homepage: `anmc-homepage-${process.env.ENVIRONMENT || 'dev'}`,
    counters: `anmc-counters-${process.env.ENVIRONMENT || 'dev'}`,
    aboutUs: `anmc-about-us-${process.env.ENVIRONMENT || 'dev'}`,
    contact: `anmc-contact-${process.env.ENVIRONMENT || 'dev'}`,
    masterPlan: `anmc-master-plan-${process.env.ENVIRONMENT || 'dev'}`,
    projectAchievements: `anmc-project-achievements-${process.env.ENVIRONMENT || 'dev'}`,
    faqs: `anmc-faqs-${process.env.ENVIRONMENT || 'dev'}`,
    donations: `anmc-donations-${process.env.ENVIRONMENT || 'dev'}`,
    members: `anmc-members-${process.env.ENVIRONMENT || 'dev'}`
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
