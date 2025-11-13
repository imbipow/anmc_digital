/**
 * Test script to verify Cognito configuration and user creation
 *
 * Usage: node test-cognito.js <email> <password>
 * Example: node test-cognito.js test@example.com Test@1234
 */

require('dotenv').config();
const cognitoService = require('./services/cognitoService');

async function testCognito() {
    console.log('=====================================');
    console.log('  Cognito Configuration Test');
    console.log('=====================================\n');

    // Get command line arguments
    const email = process.argv[2] || 'test@example.com';
    const password = process.argv[3] || 'TestPassword@123';

    console.log('Test Parameters:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${'*'.repeat(password.length)}\n`);

    // Test 1: Check if Cognito is configured
    console.log('Test 1: Checking Cognito Configuration...');
    const isConfigured = cognitoService.isConfigured();

    if (!isConfigured) {
        console.error('❌ FAILED: Cognito is not properly configured');
        console.error('\nPlease check:');
        console.error('1. COGNITO_USER_POOL_ID is set in .env');
        console.error('2. COGNITO_CLIENT_ID is set in .env');
        console.error('3. AWS_ACCESS_KEY_ID is set in .env');
        console.error('4. AWS_SECRET_ACCESS_KEY is set in .env');
        process.exit(1);
    }

    console.log('✅ PASSED: Cognito is configured\n');

    // Test 2: Validate password
    console.log('Test 2: Validating Password...');
    const validation = cognitoService.validatePassword(password);

    if (!validation.isValid) {
        console.error('❌ FAILED: Password validation failed');
        validation.errors.forEach(err => console.error(`  - ${err}`));
        process.exit(1);
    }

    console.log('✅ PASSED: Password meets requirements\n');

    // Test 3: Check if user already exists
    console.log('Test 3: Checking if user already exists...');
    try {
        const existingUser = await cognitoService.getUser(email);

        if (existingUser) {
            console.log('⚠️  WARNING: User already exists in Cognito');
            console.log('User details:', {
                username: existingUser.username,
                status: existingUser.userStatus,
                enabled: existingUser.enabled
            });
            console.log('\nSkipping user creation test.');
            console.log('\nTo test user creation, either:');
            console.log('1. Use a different email address');
            console.log('2. Delete this user from Cognito first');
            process.exit(0);
        }

        console.log('✅ User does not exist - ready for creation\n');
    } catch (error) {
        console.log('✅ User does not exist - ready for creation\n');
    }

    // Test 4: Create Cognito user
    console.log('Test 4: Creating Cognito User...');
    try {
        const result = await cognitoService.createUser({
            email: email,
            password: password,
            firstName: 'Test',
            lastName: 'User',
            phone: '0400000000',
            membershipType: 'general',
            membershipCategory: 'single',
            memberId: 'TEST-2025-0001'
        }, false); // false = disabled by default

        console.log('✅ PASSED: User created successfully');
        console.log('Creation result:', result);
        console.log('\nUser Details:');
        console.log(`  Username: ${result.username}`);
        console.log(`  User Sub: ${result.userSub}`);
        console.log(`  Cognito Enabled: ${result.cognitoEnabled}`);
        console.log(`  Requires Approval: ${result.requiresApproval}`);
        console.log(`  Status: ${result.status}\n`);

        // Test 5: Verify user was created
        console.log('Test 5: Verifying User in Cognito...');
        const verifyUser = await cognitoService.getUser(email);

        if (verifyUser) {
            console.log('✅ PASSED: User verified in Cognito');
            console.log('User status:', {
                username: verifyUser.username,
                userStatus: verifyUser.userStatus,
                enabled: verifyUser.enabled
            });
        } else {
            console.log('❌ FAILED: User not found in Cognito after creation');
            process.exit(1);
        }

        // Cleanup message
        console.log('\n=====================================');
        console.log('  All Tests Passed! ✅');
        console.log('=====================================');
        console.log('\nTest user created successfully.');
        console.log('\n⚠️  CLEANUP:');
        console.log('To delete this test user, run:');
        console.log(`aws cognito-idp admin-delete-user \\`);
        console.log(`  --user-pool-id ${process.env.COGNITO_USER_POOL_ID} \\`);
        console.log(`  --username ${email} \\`);
        console.log(`  --region ${process.env.AWS_REGION || 'ap-southeast-2'}`);

    } catch (error) {
        console.error('❌ FAILED: Error creating user');
        console.error('Error:', error.message);
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

// Run the test
testCognito().catch(error => {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
});
