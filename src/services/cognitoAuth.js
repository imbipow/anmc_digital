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
                    resolve(data);
                },
                onFailure: (err) => {
                    reject(err);
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
