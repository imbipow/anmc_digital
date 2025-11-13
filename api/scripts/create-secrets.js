/**
 * Script to create secrets in AWS Secrets Manager
 * Run this once to migrate sensitive data from .env to AWS Secrets Manager
 *
 * Usage: node scripts/create-secrets.js
 */

const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS SDK
AWS.config.update({
    region: process.env.AWS_REGION || 'ap-southeast-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const secretsManager = new AWS.SecretsManager();

// Define secrets to create
const secrets = [
    {
        name: 'anmc/dev/aws-credentials',
        description: 'AWS credentials for ANMC application',
        secretString: JSON.stringify({
            AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
            AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
            AWS_REGION: process.env.AWS_REGION
        })
    },
    {
        name: 'anmc/dev/cognito-config',
        description: 'AWS Cognito configuration for ANMC',
        secretString: JSON.stringify({
            COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
            COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
            COGNITO_REGION: process.env.AWS_REGION
        })
    },
    {
        name: 'anmc/dev/stripe-keys',
        description: 'Stripe API keys for ANMC',
        secretString: JSON.stringify({
            STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
        })
    },
    {
        name: 'anmc/dev/application-config',
        description: 'General application configuration',
        secretString: JSON.stringify({
            S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || 'anmc-media-dev',
            ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'prakash@anmcinc.org.au',
            FROM_EMAIL: process.env.FROM_EMAIL || 'prakash@anmcinc.org.au'
        })
    }
];

/**
 * Create or update a secret in AWS Secrets Manager
 */
async function createOrUpdateSecret(secret) {
    try {
        // Try to create the secret
        await secretsManager.createSecret({
            Name: secret.name,
            Description: secret.description,
            SecretString: secret.secretString
        }).promise();

        console.log(`✅ Created secret: ${secret.name}`);
    } catch (error) {
        if (error.code === 'ResourceExistsException') {
            // Secret already exists, update it
            try {
                await secretsManager.updateSecret({
                    SecretId: secret.name,
                    SecretString: secret.secretString
                }).promise();
                console.log(`✅ Updated existing secret: ${secret.name}`);
            } catch (updateError) {
                console.error(`❌ Failed to update secret ${secret.name}:`, updateError.message);
            }
        } else {
            console.error(`❌ Failed to create secret ${secret.name}:`, error.message);
        }
    }
}

/**
 * Main function to create all secrets
 */
async function createAllSecrets() {
    console.log('🔐 Starting to create secrets in AWS Secrets Manager...\n');

    // Validate that we have AWS credentials
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
        console.error('❌ AWS credentials not found in environment variables');
        console.error('Please ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in your .env file');
        process.exit(1);
    }

    for (const secret of secrets) {
        await createOrUpdateSecret(secret);
    }

    console.log('\n✨ Secrets creation completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Verify secrets in AWS Console → Secrets Manager');
    console.log('2. Update your application to use the secrets service');
    console.log('3. Remove sensitive values from .env files (keep placeholders)');
    console.log('4. Update .env.example with placeholder values');
}

// Run the script
createAllSecrets().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
});
