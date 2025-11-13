import React, { useState, useEffect } from 'react';
import { Layout as ReactAdminLayout, AppBar, Sidebar } from 'react-admin';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { LogoutOutlined, AdminPanelSettingsOutlined } from '@mui/icons-material';
import { useAuth } from '../AdminAuth';
import cognitoAuthService from '../../services/cognitoAuth';
import CustomMenu from './CustomMenu';
import './standaloneAdminStyle.css';

const AdminAppBar = () => {
    const { logout } = useAuth();
    const [userInfo, setUserInfo] = useState({
        name: 'Admin User',
        email: '',
        role: ''
    });

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const user = await cognitoAuthService.getCurrentUser();

                // Get name from attributes or email
                const attributes = user.attributes || {};
                const name = attributes.name ||
                             attributes.given_name ||
                             user.email?.split('@')[0] ||
                             'Admin User';

                const email = user.email || '';
                const groups = user.groups || [];

                let role = 'Manager';
                if (groups.includes('AnmcAdmins')) {
                    role = 'Admin';
                } else if (groups.includes('AnmcManagers')) {
                    role = 'Manager';
                }

                setUserInfo({
                    name,
                    email,
                    role
                });
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        fetchUserInfo();
    }, []);

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    // Get first letter of name for avatar
    const avatarLetter = userInfo.name.charAt(0).toUpperCase();

    return (
        <AppBar className="standalone-admin-appbar">
            <Box className="admin-appbar-content">
                <Box className="admin-brand">
                    <AdminPanelSettingsOutlined className="admin-brand-icon" />
                    <Typography variant="h6" className="admin-brand-text">
                        ANMC Admin Panel
                    </Typography>
                </Box>
                <Box className="admin-user-section">
                    <Avatar className="admin-avatar">{avatarLetter}</Avatar>
                    <Box className="admin-user-info">
                        <Typography variant="body2" className="admin-user-name">
                            {userInfo.name}
                        </Typography>
                        <Typography variant="caption" className="admin-user-role">
                            {userInfo.role}
                        </Typography>
                    </Box>
                    <Button
                        onClick={handleLogout}
                        startIcon={<LogoutOutlined />}
                        className="admin-logout-button"
                        size="small"
                    >
                        Logout
                    </Button>
                </Box>
            </Box>
        </AppBar>
    );
};

const AdminSidebar = (props) => {
    return (
        <Box className="standalone-admin-sidebar">
            <Sidebar {...props}>
                <Box className="admin-sidebar-content">
                    <Typography variant="subtitle1" className="admin-sidebar-title">
                        Navigation
                    </Typography>
                    <CustomMenu />
                </Box>
            </Sidebar>
        </Box>
    );
};

const StandaloneAdminLayout = (props) => {
    return (
        <Box className="standalone-admin-layout">
            <ReactAdminLayout
                {...props}
                appBar={AdminAppBar}
                sidebar={AdminSidebar}
                className="admin-main-layout"
            />
        </Box>
    );
};

export default StandaloneAdminLayout;