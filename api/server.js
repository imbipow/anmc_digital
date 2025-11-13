const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const config = require('./config');
const { initializeSecrets } = require('./config/initSecrets');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const routes = require('./routes');

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Rate limiting
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Request logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Disable caching in development
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
  });
}

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ANMC Digital API',
    version: '1.0.0',
    endpoints: {
      news: '/api/news',
      events: '/api/events',
      projects: '/api/projects',
      facilities: '/api/facilities',
      homepage: '/api/homepage',
      counters: '/api/counters',
      aboutUs: '/api/about-us',
      contact: '/api/contact',
      masterPlan: '/api/master-plan',
      achievements: '/api/achievements',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

// Start server with secrets loaded
const PORT = config.port;
const HOST = config.host;

async function startServer() {
  try {
    // Initialize secrets from AWS Secrets Manager
    // This populates process.env with secret values
    await initializeSecrets();

    app.listen(PORT, () => {
      console.log('\n╔══════════════════════════════════════════════════════════╗');
      console.log('║            ANMC Digital API Server                       ║');
      console.log('╚══════════════════════════════════════════════════════════╝');
      console.log(`\n🚀 Server running on http://${HOST}:${PORT}`);
      console.log(`📍 Environment: ${config.nodeEnv}`);
      console.log(`🗄️  DynamoDB Region: ${config.aws.region}`);
      console.log(`🏷️  Table Prefix: anmc-*-${process.env.ENVIRONMENT || 'dev'}`);
      console.log(`🔐 Secrets: Loaded from AWS Secrets Manager`);
      console.log('\n📚 API Documentation: http://${HOST}:${PORT}/');
      console.log('🏥 Health Check: http://${HOST}:${PORT}/api/health\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
