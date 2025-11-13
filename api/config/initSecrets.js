/**
 * Initialize Secrets and Update Environment
 * Loads secrets from AWS Secrets Manager and makes them available via process.env
 */

const { loadSecrets } = require('./secrets');

let initialized = false;

/**
 * Load secrets and populate process.env
 * This allows existing services to work without modification
 */
async function initializeSecrets() {
    if (initialized) {
        console.log('⚠️  Secrets already initialized');
        return;
    }

    try {
        console.log('🔐 Initializing secrets from AWS Secrets Manager...');

        // Load all secrets
        const secrets = await loadSecrets();

        // Populate process.env with secret values
        // This makes them available to services that read from process.env
        Object.keys(secrets).forEach(key => {
            if (secrets[key]) {
                process.env[key] = secrets[key];
            }
        });

        initialized = true;
        console.log('✅ Secrets initialized and available in process.env');

        // Log which secrets were loaded (without showing values)
        const loadedKeys = Object.keys(secrets).filter(k => secrets[k]);
        console.log('🔑 Loaded secrets:', loadedKeys.join(', '));

        return secrets;
    } catch (error) {
        console.error('❌ Failed to initialize secrets:', error.message);

        // In development, log that we're using .env fallback
        if (process.env.NODE_ENV === 'development' || process.env.ENVIRONMENT === 'dev') {
            console.warn('⚠️  Using .env fallback values (development mode)');
            console.warn('⚠️  Note: .env file no longer contains sensitive values');
            console.warn('⚠️  To use real secrets, ensure AWS Secrets Manager is accessible');
        } else {
            // In production, fail fast
            throw new Error('Secrets Manager is required in production');
        }
    }
}

/**
 * Check if secrets have been initialized
 */
function isInitialized() {
    return initialized;
}

module.exports = {
    initializeSecrets,
    isInitialized
};
