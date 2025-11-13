/**
 * Secrets Configuration
 * Loads secrets from AWS Secrets Manager and provides them to the application
 */

const secretsManager = require('../services/secretsManager');

let cachedSecrets = null;

/**
 * Load all secrets from AWS Secrets Manager
 * @returns {Promise<Object>} - All application secrets
 */
async function loadSecrets() {
    if (cachedSecrets) {
        return cachedSecrets;
    }

    try {
        console.log('🔐 Loading secrets from AWS Secrets Manager...');
        cachedSecrets = await secretsManager.getAllSecrets();
        console.log('✅ Secrets loaded successfully');
        return cachedSecrets;
    } catch (error) {
        console.error('❌ Failed to load secrets:', error.message);

        // In development, use environment variables as fallback
        if (process.env.NODE_ENV === 'development' || process.env.ENVIRONMENT === 'dev') {
            console.warn('⚠️  Using environment variables as fallback (development mode)');
            cachedSecrets = {
                AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
                AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
                AWS_REGION: process.env.AWS_REGION,
                COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
                COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
                COGNITO_REGION: process.env.AWS_REGION,
                STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
                S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
                ADMIN_EMAIL: process.env.ADMIN_EMAIL,
                FROM_EMAIL: process.env.FROM_EMAIL
            };
            return cachedSecrets;
        }

        throw error;
    }
}

/**
 * Get a specific secret value
 * @param {string} key - Secret key
 * @returns {Promise<string>} - Secret value
 */
async function getSecret(key) {
    const secrets = await loadSecrets();
    return secrets[key];
}

/**
 * Refresh secrets cache
 */
async function refreshSecrets() {
    console.log('🔄 Refreshing secrets cache...');
    secretsManager.clearCache();
    cachedSecrets = null;
    return loadSecrets();
}

module.exports = {
    loadSecrets,
    getSecret,
    refreshSecrets
};
