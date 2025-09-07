// Simple test Lambda function to verify deployment works
const awsServerlessExpress = require('aws-serverless-express');
const express = require('express');

// Create express app
const app = express();

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control');
  res.header('Access-Control-Allow-Methods', 'DELETE, GET, OPTIONS, POST, PUT');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

// Add body parser
app.use(express.json());

// Simple test route
app.get('/content', (req, res) => {
  console.log('GET /content called', req.query);
  res.json({ 
    message: 'API is working!',
    query: req.query,
    timestamp: new Date().toISOString(),
    table: process.env.TABLE_NAME || 'ContentTable-dev'
  });
});

app.get('/content/test', (req, res) => {
  res.json({ 
    message: 'Test endpoint working',
    environment: process.env.ENV || 'dev'
  });
});

// Default handler for root
app.get('/', (req, res) => {
  res.json({ message: 'Content API Root' });
});

// Create server
const server = awsServerlessExpress.createServer(app);

// Lambda handler
exports.handler = (event, context) => {
  console.log('Lambda invoked with event:', JSON.stringify(event));
  return awsServerlessExpress.proxy(server, event, context, 'PROMISE').promise;
};