/**
 * Update Fallback Content from Production API
 * Forces update from production CloudFront API
 * Run: npm run update-fallback-prod
 */

// Set production API URL before importing the update script
process.env.REACT_APP_API_URL = 'https://d140ihn2kmroxe.cloudfront.net/api';

// Import and run the main update script
require('./update-fallback-content.js');
