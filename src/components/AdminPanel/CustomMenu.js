import React, { useState, useEffect } from 'react';
import { useResourceDefinitions } from 'react-admin';
import { List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import {
    ExpandLess,
    ExpandMore,
    DashboardOutlined,
    FolderOutlined,
    PersonOutlined,
    MessageOutlined,
    BookOnlineOutlined,
    DescriptionOutlined,
    PermMediaOutlined,
    InboxOutlined,
    SendOutlined
} from '@mui/icons-material';
import cognitoAuthService from '../../services/cognitoAuth';
import './customMenu.css';

const CustomMenu = () => {
    const resources = useResourceDefinitions();
    const [contentOpen, setContentOpen] = useState(true);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const getUserRole = async () => {
            try {
                const user = await cognitoAuthService.getCurrentUser();
                const groups = user.groups || [];

                if (groups.includes('AnmcAdmins')) {
                    setUserRole('admin');
                } else if (groups.includes('AnmcManagers')) {
                    setUserRole('manager');
                }
            } catch (error) {
                console.error('Error getting user role:', error);
                setUserRole('manager'); // Default to manager (more restrictive)
            }
        };

        getUserRole();
    }, []);

    const handleContentClick = () => {
        setContentOpen(!contentOpen);
    };

    const handleNavigation = (resourceName) => {
        window.location.hash = `#/${resourceName}`;
    };

    const isSelected = (resourceName) => {
        return window.location.hash.startsWith(`#/${resourceName}`);
    };

    // Content submenu items (matching the resource names from index.js)
    const contentItems = [
        { name: 'hero-slides', label: 'Hero Slides' },
        { name: 'counters', label: 'Statistics' },
        { name: 'news', label: 'News & Updates' },
        { name: 'events', label: 'Events' },
        { name: 'projects', label: 'Projects' },
        { name: 'services', label: 'Services / Anusthan' },
        { name: 'about_us', label: 'About Us' },
        { name: 'contact', label: 'Contact Info' },
        { name: 'faqs', label: 'FAQs' },
        { name: 'achievements', label: 'Project achievements' },
    ];

    // Top-level menu items (not in Content submenu)
    const topLevelItems = [
        { name: 'bookings', label: 'Bookings' },
        { name: 'donations', label: 'Donations' },
        { name: 'members', label: 'Members' },
        { name: 'user-management', label: 'User Management' },
    ];

    // Media and Documents items - Admin Only
    const mediaItems = [
        { name: 'media', label: 'Media Library', icon: <PermMediaOutlined /> },
        { name: 'documents', label: 'Documents', icon: <DescriptionOutlined /> },
    ];

    // Messaging items - Admin Only
    const messagingItems = [
        { name: 'inbox', label: 'Contact Messages', icon: <InboxOutlined /> },
        { name: 'broadcast', label: 'Send Messages', icon: <SendOutlined /> },
    ];

    const isAdmin = userRole === 'admin';

    return (
        <List component="nav" className="custom-admin-menu">
            {/* Dashboard */}
            <ListItem
                button
                onClick={() => window.location.hash = '#/'}
                selected={window.location.hash === '#/' || window.location.hash === '' || window.location.hash === '#'}
                className="menu-item"
            >
                <ListItemIcon>
                    <DashboardOutlined />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
            </ListItem>

            {/* Content Submenu - Admin Only */}
            {isAdmin && (
                <>
                    <ListItem
                        button
                        onClick={handleContentClick}
                        className="menu-item submenu-trigger"
                    >
                        <ListItemIcon>
                            <FolderOutlined />
                        </ListItemIcon>
                        <ListItemText primary="Content" />
                        {contentOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <Collapse in={contentOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding className="submenu-list">
                            {contentItems.map((item) => {
                                const resource = resources[item.name];
                                if (!resource) return null;

                                const Icon = resource.icon;
                                return (
                                    <ListItem
                                        button
                                        key={item.name}
                                        onClick={() => handleNavigation(item.name)}
                                        selected={isSelected(item.name)}
                                        className="submenu-item"
                                    >
                                        <ListItemIcon>
                                            {Icon && <Icon />}
                                        </ListItemIcon>
                                        <ListItemText primary={item.label} />
                                    </ListItem>
                                );
                            })}
                        </List>
                    </Collapse>
                </>
            )}

            {/* Top-level items - Filter based on role */}
            {topLevelItems.map((item) => {
                // User Management is admin-only
                if (item.name === 'user-management' && !isAdmin) {
                    return null;
                }

                const resource = resources[item.name];
                if (!resource) return null;

                const Icon = resource.icon;
                return (
                    <ListItem
                        button
                        key={item.name}
                        onClick={() => handleNavigation(item.name)}
                        selected={isSelected(item.name)}
                        className="menu-item"
                    >
                        <ListItemIcon>
                            {Icon && <Icon />}
                        </ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItem>
                );
            })}

            {/* Media and Documents - Admin Only */}
            {isAdmin && mediaItems.map((item) => (
                <ListItem
                    button
                    key={item.name}
                    onClick={() => handleNavigation(item.name)}
                    selected={isSelected(item.name)}
                    className="menu-item"
                >
                    <ListItemIcon>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                </ListItem>
            ))}

            {/* Messaging - Admin Only */}
            {isAdmin && messagingItems.map((item) => (
                <ListItem
                    button
                    key={item.name}
                    onClick={() => handleNavigation(item.name)}
                    selected={isSelected(item.name)}
                    className="menu-item"
                >
                    <ListItemIcon>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                </ListItem>
            ))}
        </List>
    );
};

export default CustomMenu;
