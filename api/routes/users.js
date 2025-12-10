const express = require('express');
const router = express.Router();
const { verifyToken, requireAdmin, requireMember } = require('../middleware/auth');
const {
    CognitoIdentityProviderClient,
    ListUsersInGroupCommand,
    AdminCreateUserCommand,
    AdminSetUserPasswordCommand,
    AdminAddUserToGroupCommand,
    AdminRemoveUserFromGroupCommand,
    AdminDisableUserCommand,
    AdminEnableUserCommand,
    AdminDeleteUserCommand,
    AdminGetUserCommand,
    AdminUpdateUserAttributesCommand,
    ListGroupsCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const { fromInstanceMetadata } = require('@aws-sdk/credential-providers');

let cognitoClient = null;

function getCognitoClient() {
    if (!cognitoClient) {
        const region = process.env.AWS_REGION || 'ap-southeast-2';
        const clientConfig = { region };

        // In production (Elastic Beanstalk), use EC2 instance metadata for credentials
        // In development, use explicit credentials if provided
        if (process.env.NODE_ENV === 'production') {
            // AWS SDK v3 requires explicit credential provider for EC2 instance metadata
            clientConfig.credentials = fromInstanceMetadata({
                timeout: 5000,
                maxRetries: 10
            });
            console.log('🔐 Using EC2 instance profile credentials for Cognito in users routes (SDK v3)');
        } else {
            const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
            const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

            if (!accessKeyId || !secretAccessKey) {
                throw new Error('AWS credentials not configured. Please ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set.');
            }

            clientConfig.credentials = {
                accessKeyId,
                secretAccessKey
            };
            console.log('🔐 Using explicit credentials for Cognito in users routes (development)');
        }

        cognitoClient = new CognitoIdentityProviderClient(clientConfig);
        console.log('✅ Cognito client initialized in users routes');
    }
    return cognitoClient;
}

function getUserPoolId() {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    if (!userPoolId) {
        throw new Error('COGNITO_USER_POOL_ID not configured.');
    }
    return userPoolId;
}

// Get all groups
router.get('/groups', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const client = getCognitoClient();
        const userPoolId = getUserPoolId();

        const command = new ListGroupsCommand({
            UserPoolId: userPoolId
        });

        const result = await client.send(command);

        res.json({
            success: true,
            groups: result.Groups
        });
    } catch (error) {
        console.error('Error listing groups:', error);
        next(error);
    }
});

// Get users in a specific group (AnmcAdmins, AnmcManagers, or AnmcUsers)
router.get('/groups/:groupName/users', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { groupName } = req.params;

        // Only allow listing AnmcAdmins, AnmcManagers, and AnmcUsers
        if (!['AnmcAdmins', 'AnmcManagers', 'AnmcUsers'].includes(groupName)) {
            return res.status(403).json({
                error: 'Unauthorized group access'
            });
        }

        const client = getCognitoClient();
        const userPoolId = getUserPoolId();

        const command = new ListUsersInGroupCommand({
            UserPoolId: userPoolId,
            GroupName: groupName
        });

        const result = await client.send(command);

        // Format users
        const users = result.Users.map(user => {
            const attributes = {};
            user.Attributes.forEach(attr => {
                attributes[attr.Name] = attr.Value;
            });

            return {
                username: user.Username,
                email: attributes.email,
                name: attributes.name || `${attributes.given_name || ''} ${attributes.family_name || ''}`.trim(),
                phoneNumber: attributes.phone_number,
                enabled: user.Enabled,
                status: user.UserStatus,
                created: user.UserCreateDate,
                lastModified: user.UserLastModifiedDate,
                attributes
            };
        });

        res.json({
            success: true,
            groupName,
            users
        });
    } catch (error) {
        console.error('Error listing users in group:', error);
        next(error);
    }
});

// Get user details
router.get('/:username', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { username } = req.params;
        const client = getCognitoClient();
        const userPoolId = getUserPoolId();

        const command = new AdminGetUserCommand({
            UserPoolId: userPoolId,
            Username: username
        });

        const result = await client.send(command);

        // Format attributes
        const attributes = {};
        result.UserAttributes.forEach(attr => {
            attributes[attr.Name] = attr.Value;
        });

        res.json({
            success: true,
            user: {
                username: result.Username,
                email: attributes.email,
                name: attributes.name || `${attributes.given_name || ''} ${attributes.family_name || ''}`.trim(),
                phoneNumber: attributes.phone_number,
                enabled: result.Enabled,
                status: result.UserStatus,
                created: result.UserCreateDate,
                lastModified: result.UserLastModifiedDate,
                attributes
            }
        });
    } catch (error) {
        if (error.name === 'UserNotFoundException') {
            return res.status(404).json({ error: 'User not found' });
        }
        console.error('Error getting user:', error);
        next(error);
    }
});

// Register new regular user (no auth required - public endpoint)
router.post('/register', async (req, res, next) => {
    try {
        const cognitoService = require('../services/cognitoService');
        const { firstName, lastName, email, mobile, gender, password, residentialAddress, comments } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !mobile || !password || !gender) {
            return res.status(400).json({
                error: 'First name, last name, email, mobile, gender, and password are required'
            });
        }

        // Validate email format
        if (!/\S+@\S+\.\S+/.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        // Validate password
        const passwordValidation = cognitoService.validatePassword(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({
                error: passwordValidation.errors.join(', ')
            });
        }

        // Create user in Cognito with userType = 'user'
        const cognitoResult = await cognitoService.createUser({
            email,
            password,
            firstName,
            lastName,
            phone: mobile
        }, true, 'user'); // enabledByDefault = true, userType = 'user'

        console.log(`✅ Regular user registered: ${email} (AnmcUsers group)`);

        // Send welcome email to user
        try {
            const emailService = require('../services/emailService');
            await emailService.sendUserWelcomeEmail({
                email,
                firstName,
                lastName
            });
            console.log('✅ Welcome email sent to:', email);
        } catch (emailError) {
            // Don't fail registration if email fails
            console.error('⚠️ Failed to send welcome email:', emailError.message);
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! You can now login and book services.',
            user: {
                email,
                firstName,
                lastName,
                userType: 'user'
            }
        });
    } catch (error) {
        if (error.message.includes('UsernameExistsException') || error.message.includes('already exists')) {
            return res.status(409).json({
                error: 'A user with this email already exists'
            });
        }
        console.error('Error registering user:', error);
        next(error);
    }
});

// Create new manager (AnmcAdmins only)
router.post('/managers', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { email, name, password, phoneNumber } = req.body;

        // Validate required fields
        if (!email || !name || !password) {
            return res.status(400).json({
                error: 'Email, name, and password are required'
            });
        }

        // Validate password
        if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
            });
        }

        const client = getCognitoClient();
        const userPoolId = getUserPoolId();

        // Create user
        const createCommand = new AdminCreateUserCommand({
            UserPoolId: userPoolId,
            Username: email,
            UserAttributes: [
                { Name: 'email', Value: email },
                { Name: 'email_verified', Value: 'true' },
                { Name: 'name', Value: name }
            ].concat(phoneNumber ? [{ Name: 'phone_number', Value: phoneNumber }] : []),
            MessageAction: 'SUPPRESS',
            TemporaryPassword: password
        });

        const createResult = await client.send(createCommand);

        // Set permanent password
        const setPasswordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: userPoolId,
            Username: email,
            Password: password,
            Permanent: true
        });

        await client.send(setPasswordCommand);

        // Add to AnmcManagers group
        const addToGroupCommand = new AdminAddUserToGroupCommand({
            UserPoolId: userPoolId,
            Username: email,
            GroupName: 'AnmcManagers'
        });

        await client.send(addToGroupCommand);

        console.log(`✅ Manager created: ${email}`);

        res.status(201).json({
            success: true,
            message: 'Manager created successfully',
            user: {
                username: createResult.User.Username,
                email,
                name
            }
        });
    } catch (error) {
        if (error.name === 'UsernameExistsException') {
            return res.status(409).json({
                error: 'A user with this email already exists'
            });
        }
        console.error('Error creating manager:', error);
        next(error);
    }
});

// Update user attributes
router.put('/:username', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { username } = req.params;
        const { name, phoneNumber } = req.body;

        const userAttributes = [];

        if (name) {
            userAttributes.push({ Name: 'name', Value: name });
        }

        if (phoneNumber) {
            userAttributes.push({ Name: 'phone_number', Value: phoneNumber });
        }

        if (userAttributes.length === 0) {
            return res.status(400).json({
                error: 'No attributes to update'
            });
        }

        const client = getCognitoClient();
        const userPoolId = getUserPoolId();

        const command = new AdminUpdateUserAttributesCommand({
            UserPoolId: userPoolId,
            Username: username,
            UserAttributes: userAttributes
        });

        await client.send(command);

        res.json({
            success: true,
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        next(error);
    }
});

// Update user's own attributes (for AnmcUsers to update their profile)
router.patch('/:username/attributes', verifyToken, requireMember, async (req, res, next) => {
    try {
        const { username } = req.params;
        const { firstName, lastName, email, mobile } = req.body;

        // Users can only update their own attributes (email in params must match token email)
        if (username !== req.user.email) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only update your own profile'
            });
        }

        const userAttributes = [];

        if (firstName) {
            userAttributes.push({ Name: 'given_name', Value: firstName });
        }

        if (lastName) {
            userAttributes.push({ Name: 'family_name', Value: lastName });
        }

        if (mobile) {
            // Format phone number
            let formattedPhone = mobile;
            if (mobile.startsWith('04')) {
                formattedPhone = '+61' + mobile.substring(1);
            } else if (!mobile.startsWith('+')) {
                formattedPhone = '+61' + mobile;
            }
            userAttributes.push({ Name: 'phone_number', Value: formattedPhone });
        }

        if (email && email !== username) {
            userAttributes.push({ Name: 'email', Value: email });
            userAttributes.push({ Name: 'email_verified', Value: 'false' }); // Require re-verification
        }

        if (userAttributes.length === 0) {
            return res.status(400).json({
                error: 'No attributes to update'
            });
        }

        const client = getCognitoClient();
        const userPoolId = getUserPoolId();

        const command = new AdminUpdateUserAttributesCommand({
            UserPoolId: userPoolId,
            Username: username,
            UserAttributes: userAttributes
        });

        await client.send(command);

        console.log(`✅ User attributes updated for: ${username}`);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            emailVerificationRequired: email && email !== username
        });
    } catch (error) {
        console.error('Error updating user attributes:', error);
        next(error);
    }
});

// Disable/Enable user (Deactivate)
router.patch('/:username/status', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { username } = req.params;
        const { enabled } = req.body;

        if (typeof enabled !== 'boolean') {
            return res.status(400).json({
                error: 'enabled field must be boolean'
            });
        }

        const client = getCognitoClient();
        const userPoolId = getUserPoolId();

        const command = enabled
            ? new AdminEnableUserCommand({ UserPoolId: userPoolId, Username: username })
            : new AdminDisableUserCommand({ UserPoolId: userPoolId, Username: username });

        await client.send(command);

        console.log(`✅ User ${enabled ? 'enabled' : 'disabled'}: ${username}`);

        res.json({
            success: true,
            message: `User ${enabled ? 'enabled' : 'disabled'} successfully`
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        next(error);
    }
});

// Delete user (AnmcAdmins only)
router.delete('/:username', verifyToken, requireAdmin, async (req, res, next) => {
    try {
        const { username } = req.params;
        const client = getCognitoClient();
        const userPoolId = getUserPoolId();

        // First, get user to check if they're an admin
        const getUserCommand = new AdminGetUserCommand({
            UserPoolId: userPoolId,
            Username: username
        });

        const user = await client.send(getUserCommand);
        const email = user.UserAttributes.find(attr => attr.Name === 'email')?.Value;

        // Don't allow deleting admins (safety check)
        // This should also be checked on the frontend
        // You can remove this if you want to allow admin deletion
        console.log(`⚠️ Attempting to delete user: ${email || username}`);

        const deleteCommand = new AdminDeleteUserCommand({
            UserPoolId: userPoolId,
            Username: username
        });

        await client.send(deleteCommand);

        console.log(`✅ User deleted: ${email || username}`);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        if (error.name === 'UserNotFoundException') {
            return res.status(404).json({ error: 'User not found' });
        }
        console.error('Error deleting user:', error);
        next(error);
    }
});

// PUBLIC ENDPOINT - Reset password for users in FORCE_CHANGE_PASSWORD status
// This allows users who were created by admin to reset their password without knowing temporary password
router.post('/reset-password-forced', async (req, res, next) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                error: 'Email and new password are required'
            });
        }

        // Validate password strength
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

        if (newPassword.length < minLength || !hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            return res.status(400).json({
                error: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
            });
        }

        const client = getCognitoClient();
        const userPoolId = getUserPoolId();

        // Check if user exists and get their status
        const getUserCommand = new AdminGetUserCommand({
            UserPoolId: userPoolId,
            Username: email
        });

        let user;
        try {
            user = await client.send(getUserCommand);
        } catch (error) {
            if (error.name === 'UserNotFoundException') {
                return res.status(404).json({
                    error: 'User not found'
                });
            }
            throw error;
        }

        // Check if user is in FORCE_CHANGE_PASSWORD status
        if (user.UserStatus !== 'FORCE_CHANGE_PASSWORD') {
            return res.status(400).json({
                error: 'This reset method is only for users who need initial password setup. Please use the regular forgot password flow.',
                userStatus: user.UserStatus
            });
        }

        // Set the new password as permanent
        const setPasswordCommand = new AdminSetUserPasswordCommand({
            UserPoolId: userPoolId,
            Username: email,
            Password: newPassword,
            Permanent: true // Remove FORCE_CHANGE_PASSWORD status
        });

        await client.send(setPasswordCommand);

        console.log(`✅ Password reset successfully for FORCE_CHANGE_PASSWORD user: ${email}`);

        res.json({
            success: true,
            message: 'Password has been reset successfully. You can now log in with your new password.'
        });
    } catch (error) {
        console.error('Error resetting password for forced user:', error);
        next(error);
    }
});

module.exports = router;
