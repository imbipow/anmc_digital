import React from 'react';
import { Layout as ReactAdminLayout, AppBar, Sidebar, Menu } from 'react-admin';
import { Box, Typography, Button } from '@mui/material';
import { LogoutOutlined } from '@mui/icons-material';
import Header from '../header';
import { useAuth } from '../AdminAuth';
import './websiteAdminStyle.css';

const WebsiteAdminAppBar = () => null;

const AdminSidebar = (props) => {
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        window.location.href = '/';
    };

    return (
        <Box className="admin-sidebar-wrapper">
            <Sidebar {...props}>
                <Box className="admin-sidebar-header">
                    <Typography variant="h6" className="admin-sidebar-title">
                        Admin Panel
                    </Typography>
                    <Button
                        onClick={handleLogout}
                        startIcon={<LogoutOutlined />}
                        className="admin-logout-btn"
                        size="small"
                    >
                        Logout
                    </Button>
                </Box>
                <Menu {...props} />
            </Sidebar>
        </Box>
    );
};

const WebsiteAdminLayout = (props) => {
    return (
        <Box className="website-admin-layout">
            <Header />
            <Box className="admin-content-wrapper">
                <ReactAdminLayout
                    {...props}
                    appBar={WebsiteAdminAppBar}
                    sidebar={AdminSidebar}
                    className="integrated-admin-layout"
                />
            </Box>
        </Box>
    );
};

export default WebsiteAdminLayout;