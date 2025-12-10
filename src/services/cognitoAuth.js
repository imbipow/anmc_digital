import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
    CognitoUserAttribute
} from 'amazon-cognito-identity-js';

// Cognito User Pool configuration
const poolData = {
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || 'your_user_pool_id_here',
    ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID || 'your_client_id_here'
};

// Debug logging
console.log('🔐 Cognito Configuration:', {
    UserPoolId: poolData.UserPoolId,
    ClientId: poolData.ClientId,
    isConfigured: poolData.UserPoolId !== 'your_user_pool_id_here' && poolData.ClientId !== 'your_client_id_here'
});

let userPool = null;

// Check if Cognito is configured
const isCognitoConfigured = () => {
    return poolData.UserPoolId !== 'your_user_pool_id_here' &&
           poolData.ClientId !== 'your_client_id_here';
};

// Initialize user pool only if configured
if (isCognitoConfigured()) {
    userPool = new CognitoUserPool(poolData);
    console.log('✅ Cognito User Pool initialized successfully');
} else {
    console.error('❌ Cognito is NOT configured. Environment variables not loaded.');
}

class CognitoAuthService {
    /**
     * Check if Cognito is configured
     */
    isConfigured() {
        return isCognitoConfigured() && userPool !== null;
    }

    /**
     * Sign in a user
     */
    signIn(email, password) {
        return new Promise((resolve, reject) => {
            if (!this.isConfigured()) {
                reject(new Error('Cognito is not configured. Please configure AWS Cognito User Pool settings.'));
                return;
            }

            const authenticationData = {
                Username: email,
                Password: password,
            };

            const authenticationDetails = new AuthenticationDetails(authenticationData);

            const userData = {
                Username: email,
                Pool: userPool
            };

            const cognitoUser = new CognitoUser(userData);

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    const accessToken = result.getAccessToken().getJwtToken();
                    const idToken = result.getIdToken().getJwtToken();

                    // Get user groups from token
                    const payload = result.getIdToken().payload;
                    const groups = payload['cognito:groups'] || [];

                    // Note: Group validation is now handled by individual components
                    // (AdminAuth for admins/managers, MemberAuth for members)
                    // This allows the same service to be used for both portals

                    // Get user attributes
                    cognitoUser.getUserAttributes((err, attributes) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        const userAttributes = {};
                        attributes.forEach(attribute => {
                            userAttributes[attribute.Name] = attribute.Value;
                        });

                        resolve({
                            accessToken,
                            idToken,
                            email: userAttributes.email,
                            name: userAttributes.name,
                            given_name: userAttributes.given_name,
                            family_name: userAttributes.family_name,
                            phone_number: userAttributes.phone_number,
                            attributes: userAttributes,
                            groups: groups,
                            cognitoUser
                        });
                    });
                },
                onFailure: (err) => {
                    reject(err);
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    reject(new Error('New password required'));
                }
            });
        });
    }

    /**
     * Sign out the current user
     */
    signOut() {
        if (!this.isConfigured()) {
            return Promise.reject(new Error('Cognito is not configured'));
        }

        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.signOut();
        }
        return Promise.resolve();
    }

    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        return new Promise((resolve, reject) => {
            if (!this.isConfigured()) {
                reject(new Error('Cognito is not configured'));
                return;
            }

            const cognitoUser = userPool.getCurrentUser();

            if (!cognitoUser) {
                reject(new Error('No current user'));
                return;
            }

            cognitoUser.getSession((err, session) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!session.isValid()) {
                    reject(new Error('Session is invalid'));
                    return;
                }

                // Get user groups from token
                const idToken = session.getIdToken();
                const payload = idToken.payload;
                const groups = payload['cognito:groups'] || [];

                cognitoUser.getUserAttributes((err, attributes) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    const userAttributes = {};
                    attributes.forEach(attribute => {
                        userAttributes[attribute.Name] = attribute.Value;
                    });

                    resolve({
                        email: userAttributes.email,
                        name: userAttributes.name,
                        given_name: userAttributes.given_name,
                        family_name: userAttributes.family_name,
                        phone_number: userAttributes.phone_number,
                        attributes: userAttributes,
                        groups: groups,
                        session
                    });
                });
            });
        });
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated() {
        try {
            await this.getCurrentUser();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Change password
     */
    changePassword(oldPassword, newPassword) {
        return new Promise((resolve, reject) => {
            if (!this.isConfigured()) {
                reject(new Error('Cognito not configured'));
                return;
            }

            const cognitoUser = userPool.getCurrentUser();

            if (!cognitoUser) {
                reject(new Error('No current user'));
                return;
            }

            cognitoUser.getSession((err, session) => {
                if (err) {
                    reject(err);
                    return;
                }

                cognitoUser.changePassword(oldPassword, newPassword, (err, result) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(result);
                });
            });
        });
    }

    /**
     * Complete new password challenge for temporary passwords
     */
    completeNewPasswordChallenge(email, temporaryPassword, newPassword) {
        return new Promise((resolve, reject) => {
            if (!this.isConfigured()) {
                reject(new Error('Cognito is not configured'));
                return;
            }

            const authenticationData = {
                Username: email,
                Password: temporaryPassword,
            };

            const authenticationDetails = new AuthenticationDetails(authenticationData);

            const userData = {
                Username: email,
                Pool: userPool
            };

            const cognitoUser = new CognitoUser(userData);

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    // Password was already permanent, no challenge needed
                    resolve({
                        success: true,
                        message: 'Already authenticated with permanent password'
                    });
                },
                onFailure: (err) => {
                    reject(err);
                },
                newPasswordRequired: (userAttributes, requiredAttributes) => {
                    // User needs to set a new password
                    // Remove attributes that cannot be modified or are system-managed
                    delete userAttributes.email_verified;
                    delete userAttributes.phone_number_verified;
                    delete userAttributes.email;
                    delete userAttributes.sub;

                    // Check which attributes are required and set defaults if missing
                    console.log('Required attributes:', requiredAttributes);
                    console.log('User attributes:', userAttributes);

                    // Provide default values for required attributes that are missing
                    if (requiredAttributes && requiredAttributes.includes('address')) {
                        if (!userAttributes.address) {
                            userAttributes.address = 'Not provided';
                        }
                    }
                    if (requiredAttributes && requiredAttributes.includes('gender')) {
                        if (!userAttributes.gender) {
                            userAttributes.gender = 'Not specified';
                        }
                    }
                    if (requiredAttributes && requiredAttributes.includes('name')) {
                        if (!userAttributes.name) {
                            // Construct name from given_name and family_name if available
                            const firstName = userAttributes.given_name || '';
                            const lastName = userAttributes.family_name || '';
                            userAttributes.name = (firstName + ' ' + lastName).trim() || 'User';
                        }
                    }

                    // Only keep attributes that are actually set and not empty
                    const cleanedAttributes = {};
                    for (const key in userAttributes) {
                        if (userAttributes[key] && userAttributes[key] !== '') {
                            cleanedAttributes[key] = userAttributes[key];
                        }
                    }

                    console.log('Cleaned attributes:', cleanedAttributes);

                    cognitoUser.completeNewPasswordChallenge(newPassword, cleanedAttributes, {
                        onSuccess: (result) => {
                            resolve({
                                success: true,
                                message: 'Password changed successfully',
                                result: result
                            });
                        },
                        onFailure: (err) => {
                            reject(err);
                        }
                    });
                }
            });
        });
    }

    /**
     * Get current user's ID token
     */
    getIdToken() {
        return new Promise((resolve, reject) => {
            if (!this.isConfigured()) {
                reject(new Error('Cognito not configured'));
                return;
            }

            const cognitoUser = userPool.getCurrentUser();

            if (!cognitoUser) {
                reject(new Error('No current user'));
                return;
            }

            cognitoUser.getSession((err, session) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!session.isValid()) {
                    reject(new Error('Session is invalid'));
                    return;
                }

                const idToken = session.getIdToken().getJwtToken();
                resolve(idToken);
            });
        });
    }

    /**
     * Forgot password - initiate reset
     * Note: This may not work for users in FORCE_CHANGE_PASSWORD state
     * Those users should use their temporary password to log in and change it
     */
    forgotPassword(email) {
        return new Promise((resolve, reject) => {
            if (!this.isConfigured()) {
                reject(new Error('Cognito not configured'));
                return;
            }

            const userData = {
                Username: email,
                Pool: userPool
            };

            const cognitoUser = new CognitoUser(userData);

            cognitoUser.forgotPassword({
                onSuccess: (data) => {
                    console.log('✅ Password reset code sent successfully');
                    resolve(data);
                },
                onFailure: (err) => {
                    console.error('❌ Forgot password error:', err);

                    // Handle specific error cases
                    if (err.code === 'InvalidParameterException' &&
                        err.message && err.message.includes('Cannot reset password for the user as there is no registered/verified email')) {
                        // User might be in FORCE_CHANGE_PASSWORD state
                        reject({
                            ...err,
                            code: 'UserInForceChangePasswordState',
                            message: 'Your account requires initial password setup. Please check your email for your temporary password or contact support.'
                        });
                    } else {
                        reject(err);
                    }
                }
            });
        });
    }

    /**
     * Confirm new password after forgot password
     */
    confirmPassword(email, verificationCode, newPassword) {
        return new Promise((resolve, reject) => {
            if (!this.isConfigured()) {
                reject(new Error('Cognito not configured'));
                return;
            }

            const userData = {
                Username: email,
                Pool: userPool
            };

            const cognitoUser = new CognitoUser(userData);

            cognitoUser.confirmPassword(verificationCode, newPassword, {
                onSuccess: () => {
                    resolve('Password confirmed successfully');
                },
                onFailure: (err) => {
                    reject(err);
                }
            });
        });
    }

}

export default new CognitoAuthService();
