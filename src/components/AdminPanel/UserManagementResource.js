import React from 'react';
import { usePermissions } from 'react-admin';
import UserManagement from './UserManagement';

// This wraps the UserManagement component for React Admin
const UserManagementList = () => {
    return <UserManagement />;
};

export default UserManagementList;
