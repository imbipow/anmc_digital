import React, { createContext, useState, useContext, useEffect } from 'react';
import cognitoAuthService from '../../services/cognitoAuth';

const MemberAuthContext = createContext(null);

export const useMemberAuth = () => {
    const context = useContext(MemberAuthContext);
    if (!context) {
        throw new Error('useMemberAuth must be used within MemberAuthProvider');
    }
    return context;
};

export const MemberAuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already authenticated on mount
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const user = await cognitoAuthService.getCurrentUser();
            setCurrentUser(user);
        } catch (error) {
            setCurrentUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const result = await cognitoAuthService.signIn(email, password);

            // Store auth data for fallback
            if (result.fallbackAuth) {
                cognitoAuthService.storeAuthData(result);
            }

            setCurrentUser(result);
            return { success: true, user: result };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        try {
            await cognitoAuthService.signOut();
            setCurrentUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const changePassword = async (oldPassword, newPassword) => {
        try {
            await cognitoAuthService.changePassword(oldPassword, newPassword);
            return { success: true };
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, error: error.message };
        }
    };

    const value = {
        currentUser,
        loading,
        login,
        logout,
        changePassword,
        isAuthenticated: !!currentUser
    };

    return (
        <MemberAuthContext.Provider value={value}>
            {children}
        </MemberAuthContext.Provider>
    );
};

export default MemberAuthContext;
