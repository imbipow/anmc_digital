/**
 * AWS Secrets Manager Service
 * Handles retrieving secrets from AWS Secrets Manager
 */

const AWS = require('aws-sdk');

class SecretsManagerService {
    constructor() {
        this.secretsManager = null;
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5 minutes cache
        this.environment = process.env.ENVIRONMENT || 'dev';
        this.initialized = false;
    }

    /**
     * Initialize the AWS Secrets Manager client
     */
    initialize() {
        if (this.initialized) return;

        // Use environment variables for initial AWS configuration
        // After getting credentials from Secrets Manager, they'll be used for subsequent calls
        const region = process.env.AWS_REGION || 'ap-southeast-2';

        AWS.config.update({ region });

        // If we have credentials in env, use them (for initial bootstrap)
        if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            AWS.config.update({
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            });
        }

        this.secretsManager = new AWS.SecretsManager();
        this.initialized = true;
    }

    /**
     * Get a secret from AWS Secrets Manager
     * @param {string} secretName - Name of the secret
     * @param {boolean} useCache - Whether to use cache (default: true)
     * @returns {Promise<Object>} - Parsed secret value
     */
    async getSecret(secretName, useCache = true) {
        this.initialize();

        const fullSecretName = `anmc/${this.environment}/${secretName}`;

        // Check cache first
        if (useCache && this.cache.has(fullSecretName)) {
            const cached = this.cache.get(fullSecretName);
            if (Date.now() - cached.timestamp < this.cacheExpiry) {
                console.log(`📦 Using cached secret: ${fullSecretName}`);
                return cached.value;
            }
        }

        try {
            console.log(`🔐 Fetching secret from AWS Secrets Manager: ${fullSecretName}`);

            const data = await this.secretsManager.getSecretValue({
                SecretId: fullSecretName
            }).promise();

            let secret;
            if (data.SecretString) {
                secret = JSON.parse(data.SecretString);
            } else {
                // Binary secret
                const buff = Buffer.from(data.SecretBinary, 'base64');
                secret = JSON.parse(buff.toString('ascii'));
            }

            // Cache the secret
            this.cache.set(fullSecretName, {
                value: secret,
                timestamp: Date.now()
            });

            console.log(`✅ Successfully retrieved secret: ${fullSecretName}`);
            return secret;

        } catch (error) {
            console.error(`❌ Error retrieving secret ${fullSecretName}:`, error.message);

            // In development, fall back to environment variables
            if (this.environment === 'dev') {
                console.warn(`⚠️  Falling back to environment variables for ${secretName}`);
                return this.getFallbackSecret(secretName);
            }

            throw error;
        }
    }

    /**
     * Fallback to environment variables if Secrets Manager is unavailable
     * @param {string} secretName - Name of the secret
     * @returns {Object} - Secret from environment variables
     */
    getFallbackSecret(secretName) {
        switch (secretName) {
            case 'aws-credentials':
                return {
                    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
                    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
                    AWS_REGION: process.env.AWS_REGION
                };
            case 'cognito-config':
                return {
                    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
                    COGNITO_CLIENT_ID: process.env.COGNITO_CLIENT_ID,
                    COGNITO_REGION: process.env.AWS_REGION
                };
            case 'stripe-keys':
                return {
                    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY
                };
            case 'application-config':
                return {
                    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
                    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
                    FROM_EMAIL: process.env.FROM_EMAIL
                };
            default:
                throw new Error(`Unknown secret: ${secretName}`);
        }
    }

    /**
     * Get all application secrets at once
     * @returns {Promise<Object>} - All secrets combined
     */
    async getAllSecrets() {
        try {
            const [awsCredentials, cognitoConfig, stripeKeys, appConfig] = await Promise.all([
                this.getSecret('aws-credentials'),
                this.getSecret('cognito-config'),
                this.getSecret('stripe-keys'),
                this.getSecret('application-config')
            ]);

            return {
                ...awsCredentials,
                ...cognitoConfig,
                ...stripeKeys,
                ...appConfig
            };
        } catch (error) {
            console.error('❌ Error fetching all secrets:', error.message);
            throw error;
        }
    }

    /**
     * Clear the secrets cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️  Secrets cache cleared');
    }

    /**
     * Refresh a specific secret in cache
     * @param {string} secretName - Name of the secret to refresh
     */
    async refreshSecret(secretName) {
        return this.getSecret(secretName, false);
    }
}

// Export singleton instance
module.exports = new SecretsManagerService();
