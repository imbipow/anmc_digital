const AWS = require('aws-sdk');
const {
    CognitoIdentityProviderClient,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    AdminAddUserToGroupCommand,
    AdminGetUserCommand,
    AdminDisableUserCommand,
    AdminEnableUserCommand,
    AdminUpdateUserAttributesCommand,
    AdminUpdateUserAttributesCommand: AdminVerifyUserAttributeCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const crypto = require('crypto');

class CognitoService {
    constructor() {
        this.cognitoClient = null;
        this.region = null;
        this.userPoolId = null;
        this.clientId = null;
    }

    /**
     * Get or initialize Cognito client with lazy initialization
     * This allows secrets to be loaded before initializing the client
     */
    getCognitoClient() {
        if (!this.cognitoClient) {
            this.region = process.env.AWS_REGION || 'ap-southeast-2';
            this.userPoolId = process.env.COGNITO_USER_POOL_ID;
            this.clientId = process.env.COGNITO_CLIENT_ID;

            console.log('🔧 Cognito Service Lazy Initialization:', {
                region: this.region,
                userPoolId: this.userPoolId ? `${this.userPoolId.substring(0, 20)}...` : 'NOT SET',
                clientId: this.clientId ? `${this.clientId.substring(0, 20)}...` : 'NOT SET',
                hasAwsCredentials: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
            });

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
                    console.log('✅ Cognito client initialized successfully (lazy init)');
                } catch (error) {
                    console.warn('❌ Cognito client initialization failed:', error.message);
                    this.cognitoClient = null;
                }
            } else {
                console.warn('❌ Cognito client not initialized - missing user pool ID');
                this.cognitoClient = null;
            }
        }
        return this.cognitoClient;
    }

    isConfigured() {
        // Trigger lazy initialization if not yet done
        const client = this.getCognitoClient();

        // Update properties in case they weren't set yet
        if (!this.userPoolId) {
            this.userPoolId = process.env.COGNITO_USER_POOL_ID;
        }
        if (!this.clientId) {
            this.clientId = process.env.COGNITO_CLIENT_ID;
        }

        const configured = client !== null && this.userPoolId && this.clientId;
        console.log('🔍 Cognito isConfigured check:', {
            configured,
            hasClient: client !== null,
            hasUserPoolId: !!this.userPoolId,
            hasClientId: !!this.clientId
        });
        return configured;
    }

    /**
     * Create a new user in Cognito (disabled by default, pending approval)
     * @param {Object} userData - User data including email, password, and attributes
     * @param {boolean} enabledByDefault - Whether to enable user immediately (default: false)
     * @param {string} userType - Type of user: 'member' or 'user' (default: 'member')
     * @returns {Promise<Object>} Created user data
     */
    async createUser(userData, enabledByDefault = false, userType = 'member') {
        if (!this.isConfigured()) {
            console.warn('Cognito is not configured. User will be created in database only.');
            return {
                username: userData.email,
                userSub: null,
                cognitoEnabled: false,
                requiresApproval: true
            };
        }

        const { email, password, firstName, lastName, phone, membershipType, membershipCategory, memberId } = userData;

        try {
            // Create user in Cognito
            const createUserParams = {
                UserPoolId: this.userPoolId,
                Username: email,
                UserAttributes: [
                    { Name: 'email', Value: email },
                    { Name: 'email_verified', Value: 'true' },
                    { Name: 'given_name', Value: firstName },
                    { Name: 'family_name', Value: lastName }
                ],
                MessageAction: 'SUPPRESS', // Don't send welcome email, we'll handle it
                TemporaryPassword: this.generateTemporaryPassword()
            };

            // Add optional attributes
            if (phone) {
                // Convert Australian phone number to E.164 format if needed
                let formattedPhone = phone;
                if (phone.startsWith('04')) {
                    formattedPhone = '+61' + phone.substring(1);
                } else if (!phone.startsWith('+')) {
                    formattedPhone = '+61' + phone;
                }
                createUserParams.UserAttributes.push({ Name: 'phone_number', Value: formattedPhone });
            }

            // Note: Custom attributes (membership_type, membership_category, member_id) are not added
            // because they don't exist in the User Pool schema. These are tracked in DynamoDB instead.
            // If needed in the future, custom attributes must be created when the User Pool is created.

            const createCommand = new AdminCreateUserCommand(createUserParams);
            const cognitoClient = this.getCognitoClient();
            const createResult = await cognitoClient.send(createCommand);

            // Set permanent password
            const setPasswordParams = {
                UserPoolId: this.userPoolId,
                Username: email,
                Password: password,
                Permanent: true
            };

            const setPasswordCommand = new AdminSetUserPasswordCommand(setPasswordParams);
            await cognitoClient.send(setPasswordCommand);
            console.log(`✅ Password set for user: ${email}`);

            // Add user to appropriate group based on userType
            if (userType === 'user') {
                // Regular user - add to AnmcUsers group and enable immediately
                await this.addToAnmcUsersGroup(email);
                enabledByDefault = true; // Regular users don't need approval
            } else {
                // Member - add to AnmcMembers group (requires approval)
                await this.addToAnmcMembersGroup(email);
            }

            // Disable user by default (requires admin approval) - except for regular users
            if (!enabledByDefault) {
                await this.disableUser(email);
                console.log(`⚠️ User disabled (pending approval): ${email}`);
            } else {
                console.log(`✅ User enabled and ready to login: ${email}`);
            }

            return {
                username: email,
                userSub: createResult.User.Username,
                cognitoEnabled: true,
                requiresApproval: !enabledByDefault,
                status: enabledByDefault ? 'active' : 'pending_approval',
                userType
            };
        } catch (error) {
            console.error('❌ Error creating Cognito user:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                statusCode: error.$metadata?.httpStatusCode
            });
            throw new Error(`Failed to create user in Cognito: ${error.message}`);
        }
    }

    /**
     * Add user to AnmcMembers group
     * @param {string} username - Username (email)
     * @returns {Promise<void>}
     */
    async addToAnmcMembersGroup(username) {
        if (!this.isConfigured()) {
            console.warn('Cognito not configured, skipping group assignment');
            return;
        }

        try {
            const addToGroupParams = {
                UserPoolId: this.userPoolId,
                Username: username,
                GroupName: 'AnmcMembers'
            };

            const addToGroupCommand = new AdminAddUserToGroupCommand(addToGroupParams);
            const cognitoClient = this.getCognitoClient();
            await cognitoClient.send(addToGroupCommand);
            console.log(`User ${username} added to AnmcMembers group`);
        } catch (error) {
            // Group might not exist, log warning but don't fail
            console.warn(`Could not add user to AnmcMembers group: ${error.message}`);
        }
    }

    /**
     * Add user to AnmcUsers group (for regular users, not members)
     * @param {string} username - Username (email)
     * @returns {Promise<void>}
     */
    async addToAnmcUsersGroup(username) {
        if (!this.isConfigured()) {
            console.warn('Cognito not configured, skipping group assignment');
            return;
        }

        try {
            const addToGroupParams = {
                UserPoolId: this.userPoolId,
                Username: username,
                GroupName: 'AnmcUsers'
            };

            const addToGroupCommand = new AdminAddUserToGroupCommand(addToGroupParams);
            const cognitoClient = this.getCognitoClient();
            await cognitoClient.send(addToGroupCommand);
            console.log(`User ${username} added to AnmcUsers group`);
        } catch (error) {
            // Group might not exist, log warning but don't fail
            console.warn(`Could not add user to AnmcUsers group: ${error.message}`);
        }
    }

    /**
     * Enable a Cognito user (approve member)
     * @param {string} username - Username (email)
     * @returns {Promise<void>}
     */
    async enableUser(username) {
        if (!this.isConfigured()) {
            console.warn('Cognito not configured, skipping user enable');
            return;
        }

        try {
            const params = {
                UserPoolId: this.userPoolId,
                Username: username
            };

            const command = new AdminEnableUserCommand(params);
            const cognitoClient = this.getCognitoClient();
            await cognitoClient.send(command);
            console.log(`User ${username} enabled`);
        } catch (error) {
            console.error(`Error enabling user: ${error.message}`);
            throw error;
        }
    }

    /**
     * Disable a Cognito user (reject or suspend member)
     * @param {string} username - Username (email)
     * @returns {Promise<void>}
     */
    async disableUser(username) {
        if (!this.isConfigured()) {
            console.warn('Cognito not configured, skipping user disable');
            return;
        }

        try {
            const params = {
                UserPoolId: this.userPoolId,
                Username: username
            };

            const command = new AdminDisableUserCommand(params);
            const cognitoClient = this.getCognitoClient();
            await cognitoClient.send(command);
            console.log(`User ${username} disabled`);
        } catch (error) {
            console.error(`Error disabling user: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update user attributes in Cognito
     * @param {string} username - Username (email)
     * @param {Object} attributes - Attributes to update
     * @returns {Promise<void>}
     */
    async updateUserAttributes(username, attributes) {
        if (!this.isConfigured()) {
            console.warn('Cognito not configured, skipping attribute update');
            return;
        }

        try {
            const userAttributes = Object.keys(attributes).map(key => ({
                Name: key,
                Value: attributes[key]
            }));

            const params = {
                UserPoolId: this.userPoolId,
                Username: username,
                UserAttributes: userAttributes
            };

            const command = new AdminUpdateUserAttributesCommand(params);
            const cognitoClient = this.getCognitoClient();
            await cognitoClient.send(command);
            console.log(`User ${username} attributes updated`);
        } catch (error) {
            console.error(`Error updating user attributes: ${error.message}`);
            throw error;
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
            const cognitoClient = this.getCognitoClient();
            const result = await cognitoClient.send(command);

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
