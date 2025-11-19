/**
 * Test AWS Configuration
 * Run: node api/scripts/test-aws-config.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const cognitoService = require('../services/cognitoService');

console.log('🔍 Testing AWS Configuration...\n');

console.log('📋 Environment Variables:');
console.log('  AWS_REGION:', process.env.AWS_REGION || '❌ NOT SET');
console.log('  COGNITO_USER_POOL_ID:', process.env.COGNITO_USER_POOL_ID ? '✅ SET' : '❌ NOT SET');
console.log('  COGNITO_CLIENT_ID:', process.env.COGNITO_CLIENT_ID ? '✅ SET' : '❌ NOT SET');
console.log('  AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ SET' : '❌ NOT SET');
console.log('  AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ SET' : '❌ NOT SET');
console.log('');

console.log('🔧 Cognito Service Status:');
const isConfigured = cognitoService.isConfigured();
console.log('  Is Configured:', isConfigured ? '✅ YES' : '❌ NO');
console.log('');

if (!isConfigured) {
    console.log('❌ COGNITO NOT CONFIGURED');
    console.log('');
    console.log('To fix this, add the following to your api/.env file:');
    console.log('');
    console.log('COGNITO_USER_POOL_ID=your-user-pool-id');
    console.log('COGNITO_CLIENT_ID=your-client-id');
    console.log('AWS_ACCESS_KEY_ID=your-access-key');
    console.log('AWS_SECRET_ACCESS_KEY=your-secret-key');
    console.log('');
    console.log('💡 You can find these values in AWS Console → Cognito → User Pools');
    console.log('');
    console.log('⚠️  NOTE: Members and Managers can still be created without Cognito.');
    console.log('   They just won\'t have login credentials until Cognito is configured.');
} else {
    console.log('✅ COGNITO IS CONFIGURED');
    console.log('   Member and Manager creation should work with login credentials.');
}

console.log('');
console.log('✨ Test completed!');
