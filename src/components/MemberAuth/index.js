import React, { createContext, useState, useContext, useEffect } from 'react';
import cognitoAuthService from '../../services/cognitoAuth';

const MemberAuthContext = createContext(null);

// Groups that are allowed to access the member portal
const ALLOWED_MEMBER_GROUPS = [
    'AnmcMembers',
    'AnmcUsers',
    'AnmcLifeMembers',
    'LifeMembers',
    'GeneralMembers',
    'FamilyMembers'
];

// Helper function to check if user has any allowed group
const hasAllowedGroup = (groups) => {
    return groups.some(group => ALLOWED_MEMBER_GROUPS.includes(group));
};

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

            // Check if user is in any allowed member group
            const groups = user.groups || [];
            if (hasAllowedGroup(groups)) {
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
        } catch (error) {
            setCurrentUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const result = await cognitoAuthService.signIn(email, password);

            // Check if user is in any allowed member group
            const groups = result.groups || [];
            console.log('User groups:', groups); // Debug log to see what groups the user has

            if (!hasAllowedGroup(groups)) {
                return {
                    success: false,
                    error: 'Access denied. Only ANMC members and registered users can access the portal.'
                };
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
