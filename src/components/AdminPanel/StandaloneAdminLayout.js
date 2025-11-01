import React from 'react';
import { Layout as ReactAdminLayout, AppBar, Sidebar } from 'react-admin';
import { Box, Typography, Button, Avatar } from '@mui/material';
import { LogoutOutlined, AdminPanelSettingsOutlined } from '@mui/icons-material';
import { useAuth } from '../AdminAuth';
import CustomMenu from './CustomMenu';
import './standaloneAdminStyle.css';

const AdminAppBar = () => {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

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
                    <Avatar className="admin-avatar">A</Avatar>
                    <Typography variant="body2" className="admin-user-text">
                        Admin User
                    </Typography>
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