import React, { useState, createContext, useContext, useEffect } from 'react';
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

    useEffect(() => {
        const savedAuth = localStorage.getItem('anmc_admin_auth');
        if (savedAuth === 'true') {
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);

    const login = (password) => {
        const adminPassword = 'anmc2024admin';
        if (password === adminPassword) {
            setIsAuthenticated(true);
            localStorage.setItem('anmc_admin_auth', 'true');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('anmc_admin_auth');
    };

    const value = {
        isAuthenticated,
        isLoading,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

const AdminLogin = ({ onLogin }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (login(password)) {
            onLogin();
        } else {
            setError('Invalid password. Please try again.');
        }

        setLoading(false);
        setPassword('');
    };

    return (
        <div className="admin-login">
            <div className="login-container">
                <div className="login-header">
                    <h2>ANMC Admin Access</h2>
                    <p>Please enter the admin password to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="password">Admin Password:</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            required
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        className="login-btn"
                    >
                        {loading ? 'Authenticating...' : 'Access Admin Panel'}
                    </button>
                </form>

                <div className="login-footer">
                    <p>For security purposes, please contact the administrator if you don't have the password.</p>
                </div>
            </div>
        </div>
    );
};

export const ProtectedAdminRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <AdminLogin onLogin={() => window.location.reload()} />;
    }

    return children;
};

export default AdminLogin;