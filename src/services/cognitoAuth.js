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

let userPool = null;

// Check if Cognito is configured
const isCognitoConfigured = () => {
    return poolData.UserPoolId !== 'your_user_pool_id_here' &&
           poolData.ClientId !== 'your_client_id_here';
};

// Initialize user pool only if configured
if (isCognitoConfigured()) {
    userPool = new CognitoUserPool(poolData);
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
                // Fallback to simple email/password check for development
                console.warn('Cognito not configured, using fallback authentication');

                // Simple fallback for testing
                if (email === 'member@anmc.org.au' && password === 'Member123!') {
                    resolve({
                        email: email,
                        attributes: {
                            email: email,
                            given_name: 'Test',
                            family_name: 'Member',
                            'custom:membership_type': 'general'
                        },
                        fallbackAuth: true
                    });
                } else {
                    reject(new Error('Invalid credentials'));
                }
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
                            attributes: userAttributes,
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
            localStorage.removeItem('memberAuth');
            return Promise.resolve();
        }

        const cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            cognitoUser.signOut();
        }
        localStorage.removeItem('memberAuth');
        return Promise.resolve();
    }

    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        return new Promise((resolve, reject) => {
            if (!this.isConfigured()) {
                // Check fallback auth
                const fallbackAuth = localStorage.getItem('memberAuth');
                if (fallbackAuth) {
                    try {
                        resolve(JSON.parse(fallbackAuth));
                    } catch (e) {
                        reject(new Error('Invalid session'));
                    }
                } else {
                    reject(new Error('No current user'));
                }
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
                        attributes: userAttributes,
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

    /**
     * Store auth data in localStorage (for fallback auth)
     */
    storeAuthData(authData) {
        localStorage.setItem('memberAuth', JSON.stringify(authData));
    }

    /**
     * Get stored auth data
     */
    getStoredAuthData() {
        const data = localStorage.getItem('memberAuth');
        return data ? JSON.parse(data) : null;
    }
}

export default new CognitoAuthService();
