const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
const { fromInstanceMetadata } = require('@aws-sdk/credential-providers');

let snsClient = null;

/**
 * Get or initialize SNS client
 */
function getSNSClient() {
    if (!snsClient) {
        const clientConfig = {
            region: process.env.AWS_REGION || 'ap-southeast-2'
        };

        // In production (Elastic Beanstalk), use EC2 instance metadata
        if (process.env.NODE_ENV === 'production') {
            clientConfig.credentials = fromInstanceMetadata({
                timeout: 5000,
                maxRetries: 10
            });
            console.log('🔐 Using EC2 instance profile credentials for SNS');
        } else if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            // Development: use explicit credentials
            clientConfig.credentials = {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            };
            console.log('🔐 Using explicit credentials for SNS (development)');
        }

        snsClient = new SNSClient(clientConfig);
        console.log('✅ SNS client initialized successfully');
    }
    return snsClient;
}

/**
 * Send SMS message
 * @param {Object} smsData - SMS data including phone and message
 * @returns {Promise<Object>} - Result with success status and message ID
 */
const sendSMS = async (smsData) => {
    const { phone, message } = smsData;

    if (!phone || !message) {
        throw new Error('Phone number and message are required');
    }

    // Validate phone number format (E.164)
    if (!phone.startsWith('+')) {
        throw new Error('Phone number must be in E.164 format (e.g., +61412345678)');
    }

    const params = {
        PhoneNumber: phone,
        Message: message,
        MessageAttributes: {
            'AWS.SNS.SMS.SMSType': {
                DataType: 'String',
                StringValue: 'Transactional' // Use 'Transactional' for high priority
            }
        }
    };

    try {
        const command = new PublishCommand(params);
        const client = getSNSClient();
        const response = await client.send(command);
        console.log('✅ SMS sent successfully to:', phone, 'MessageId:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('❌ Error sending SMS:', error);
        // Don't throw error - just log it and return failure
        // This prevents SMS failures from blocking the import process
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendSMS
};
