import React, { useState, createContext, useContext, useEffect } from 'react';
import cognitoAuthService from '../../services/cognitoAuth';
import './style.css';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        try {
            const user = await cognitoAuthService.getCurrentUser();

            // Check if user is in AnmcAdmins or AnmcManagers group
            const groups = user.groups || [];
            const hasAdminAccess = groups.includes('AnmcAdmins') || groups.includes('AnmcManagers');

            if (hasAdminAccess) {
                setIsAuthenticated(true);
                setCurrentUser(user);
            } else {
                setIsAuthenticated(false);
                setCurrentUser(null);
            }
        } catch (error) {
            setIsAuthenticated(false);
            setCurrentUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const result = await cognitoAuthService.signIn(email, password);

            // Check if user is in AnmcAdmins or AnmcManagers group
            const groups = result.groups || [];
            const hasAdminAccess = groups.includes('AnmcAdmins') || groups.includes('AnmcManagers');

            if (!hasAdminAccess) {
                return {
                    success: false,
                    error: 'Access denied. You must be an ANMC administrator or manager to access the admin panel.'
                };
            }

            setIsAuthenticated(true);
            setCurrentUser(result);
            return { success: true, user: result };
        } catch (error) {
            console.error('Admin login error:', error);
            return {
                success: false,
                error: error.message || 'Login failed. Please check your credentials.'
            };
        }
    };

    const logout = async () => {
        await cognitoAuthService.signOut();
        setIsAuthenticated(false);
        setCurrentUser(null);
    };

    const value = {
        isAuthenticated,
        isLoading,
        currentUser,
        login,
        logout,
        checkAuthentication
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

const AdminLogin = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await login(email, password);

        if (result.success) {
            // Don't reload, just call onLogin which will trigger re-render
            if (onLogin) {
                onLogin();
            }
        } else {
            setError(result.error || 'Invalid credentials. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="admin-login">
            <div className="login-container">
                <div className="login-header">
                    <h2>ANMC Admin Access</h2>
                    <p>Please sign in with your admin credentials</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="email">Admin Email:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter admin email"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                            disabled={loading}
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading || !email || !password}
                        className="login-btn"
                    >
                        {loading ? 'Authenticating...' : 'Access Admin Panel'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>Only ANMC administrators can access this panel. Contact the system administrator if you need access.</p>
                </div>
            </div>
        </div>
    );
};

export const ProtectedAdminRoute = ({ children }) => {
    const { isAuthenticated, isLoading, checkAuthentication } = useAuth();

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Pass checkAuthentication as onLogin to avoid full page reload
        return <AdminLogin onLogin={checkAuthentication} />;
    }

    return children;
};

export default AdminLogin;