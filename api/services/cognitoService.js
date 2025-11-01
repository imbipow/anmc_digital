const AWS = require('aws-sdk');
const {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    AdminAddUserToGroupCommand,
    AdminGetUserCommand
} = require('@aws-sdk/client-cognito-identity-provider');

class CognitoService {
    constructor() {
        this.region = process.env.AWS_REGION || 'ap-southeast-2';
        this.userPoolId = process.env.COGNITO_USER_POOL_ID;
        this.clientId = process.env.COGNITO_CLIENT_ID;

        // Initialize Cognito client only if credentials are available
        if (this.userPoolId && this.userPoolId !== 'your_user_pool_id_here') {
            try {
                this.cognitoClient = new CognitoIdentityProviderClient({
                    region: this.region,
                    credentials: {
                        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
                    }
                });
            } catch (error) {
                console.warn('Cognito client initialization skipped:', error.message);
                this.cognitoClient = null;
            }
        } else {
            this.cognitoClient = null;
        }
    }

    isConfigured() {
        return this.cognitoClient !== null && this.userPoolId && this.clientId;
    }

    /**
     * Create a new user in Cognito
     * @param {Object} userData - User data including email, password, and attributes
     * @returns {Promise<Object>} Created user data
     */
    async createUser(userData) {
        if (!this.isConfigured()) {
            console.warn('Cognito is not configured. User will be created in database only.');
            return {
                username: userData.email,
                userSub: null,
                cognitoEnabled: false
            };
        }

        const { email, password, firstName, lastName, phone, membershipType } = userData;

        try {
            // Create user in Cognito
            const createUserParams = {
                UserPoolId: this.userPoolId,
                Username: email,
                UserAttributes: [
                    { Name: 'email', Value: email },
                    { Name: 'email_verified', Value: 'true' },
                    { Name: 'given_name', Value: firstName },
                    { Name: 'family_name', Value: lastName },
                    { Name: 'phone_number', Value: phone || '' },
                    { Name: 'custom:membership_type', Value: membershipType || 'general' }
                ],
                MessageAction: 'SUPPRESS', // Don't send welcome email, we'll handle it
                TemporaryPassword: this.generateTemporaryPassword()
            };

            const createCommand = new AdminCreateUserCommand(createUserParams);
            const createResult = await this.cognitoClient.send(createCommand);

            // Set permanent password
            const setPasswordParams = {
                UserPoolId: this.userPoolId,
                Username: email,
                Password: password,
                Permanent: true
            };

            const setPasswordCommand = new AdminSetUserPasswordCommand(setPasswordParams);
            await this.cognitoClient.send(setPasswordCommand);

            // Add user to appropriate group based on membership type
            const groupName = this.getMembershipGroup(membershipType);
            if (groupName) {
                const addToGroupParams = {
                    UserPoolId: this.userPoolId,
                    Username: email,
                    GroupName: groupName
                };

                const addToGroupCommand = new AdminAddUserToGroupCommand(addToGroupParams);
                await this.cognitoClient.send(addToGroupCommand);
            }

            return {
                username: email,
                userSub: createResult.User.Username,
                cognitoEnabled: true
            };
        } catch (error) {
            console.error('Error creating Cognito user:', error);
            throw new Error(`Failed to create user in Cognito: ${error.message}`);
        }
    }

    /**
     * Get user details from Cognito
     * @param {string} username - Username (email)
     * @returns {Promise<Object>} User details
     */
    async getUser(username) {
        if (!this.isConfigured()) {
            return null;
        }

        try {
            const params = {
                UserPoolId: this.userPoolId,
                Username: username
            };

            const command = new AdminGetUserCommand(params);
            const result = await this.cognitoClient.send(command);

            return {
                username: result.Username,
                userStatus: result.UserStatus,
                enabled: result.Enabled,
                attributes: result.UserAttributes.reduce((acc, attr) => {
                    acc[attr.Name] = attr.Value;
                    return acc;
                }, {})
            };
        } catch (error) {
            if (error.name === 'UserNotFoundException') {
                return null;
            }
            throw error;
        }
    }

    /**
     * Generate a temporary password for initial user creation
     * @returns {string} Temporary password
     */
    generateTemporaryPassword() {
        const length = 12;
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return password;
    }

    /**
     * Get Cognito group name based on membership type
     * @param {string} membershipType - Type of membership
     * @returns {string|null} Group name
     */
    getMembershipGroup(membershipType) {
        const groupMap = {
            'general': 'GeneralMembers',
            'life': 'LifeMembers',
            'family': 'FamilyMembers'
        };
        return groupMap[membershipType] || 'GeneralMembers';
    }

    /**
     * Validate password meets Cognito requirements
     * @param {string} password - Password to validate
     * @returns {Object} Validation result
     */
    validatePassword(password) {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        const errors = [];
        if (password.length < minLength) {
            errors.push(`Password must be at least ${minLength} characters long`);
        }
        if (!hasUpperCase) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!hasLowerCase) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!hasNumbers) {
            errors.push('Password must contain at least one number');
        }
        if (!hasSpecialChar) {
            errors.push('Password must contain at least one special character');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

module.exports = new CognitoService();
