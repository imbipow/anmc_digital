import React, { useState } from 'react';
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
    DescriptionOutlined
} from '@mui/icons-material';
import './customMenu.css';

const CustomMenu = () => {
    const resources = useResourceDefinitions();
    const [contentOpen, setContentOpen] = useState(true);

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
        { name: 'homepage', label: 'Homepage' },
        { name: 'counters', label: 'Statistics' },
        { name: 'news', label: 'News & Updates' },
        { name: 'events', label: 'Events' },
        { name: 'projects', label: 'Projects' },
        { name: 'facilities', label: 'Facilities' },
        { name: 'about_us', label: 'About Us' },
        { name: 'contact', label: 'Contact Info' },
        { name: 'faqs', label: 'FAQs' },
    ];

    // Top-level menu items (not in Content submenu)
    const topLevelItems = [
        { name: 'donations', label: 'Donations' },
        { name: 'members', label: 'Members' },
    ];

    // Additional menu items (to be implemented)
    const additionalItems = [
        { name: 'users', label: 'Users', icon: <PersonOutlined /> },
        { name: 'messages', label: 'Messages', icon: <MessageOutlined /> },
        { name: 'bookings', label: 'Bookings', icon: <BookOnlineOutlined /> },
        { name: 'documents', label: 'Documents', icon: <DescriptionOutlined /> },
    ];

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

            {/* Content Submenu */}
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

            {/* Top-level items (Donations, Members) */}
            {topLevelItems.map((item) => {
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

            {/* Additional Items (Users, Messages, Bookings, Documents) */}
            {additionalItems.map((item) => (
                <ListItem
                    button
                    key={item.name}
                    onClick={() => handleNavigation(item.name)}
                    selected={isSelected(item.name)}
                    className="menu-item menu-item-disabled"
                    disabled
                >
                    <ListItemIcon>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.label}
                        secondary="Coming soon"
                    />
                </ListItem>
            ))}
        </List>
    );
};

export default CustomMenu;
