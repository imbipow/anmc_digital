import React, { useState, useEffect } from 'react';
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    DateField,
    NumberField,
    ChipField,
    EditButton,
    ShowButton,
    DeleteButton,
    Filter,
    TextInput,
    SelectInput,
    useRecordContext
} from 'react-admin';
import { Chip } from '@mui/material';
import cognitoAuthService from '../../services/cognitoAuth';

const StatusField = () => {
    const record = useRecordContext();
    if (!record || !record.status) return null;

    const statusColors = {
        'pending_approval': 'warning',
        'active': 'success',
        'rejected': 'error',
        'suspended': 'error',
        'expired': 'default'
    };

    const statusLabels = {
        'pending_approval': 'Pending Approval',
        'active': 'Active',
        'rejected': 'Rejected',
        'suspended': 'Suspended',
        'expired': 'Expired'
    };

    return (
        <Chip
            label={statusLabels[record.status] || record.status}
            color={statusColors[record.status] || 'default'}
            size="small"
        />
    );
};

const MemberFilters = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
        <SelectInput source="membershipCategory" choices={[
            { id: 'general', name: 'General' },
            { id: 'life', name: 'Life' },
        ]} />
        <SelectInput source="membershipType" choices={[
            { id: 'single', name: 'Single' },
            { id: 'family', name: 'Family' },
        ]} />
        <SelectInput source="paymentStatus" choices={[
            { id: 'succeeded', name: 'Paid' },
            { id: 'pending', name: 'Pending' },
            { id: 'failed', name: 'Failed' },
        ]} />
        <SelectInput source="status" label="Member Status" choices={[
            { id: 'pending_approval', name: 'Pending Approval' },
            { id: 'active', name: 'Active' },
            { id: 'rejected', name: 'Rejected' },
            { id: 'suspended', name: 'Suspended' },
            { id: 'expired', name: 'Expired' },
        ]} />
    </Filter>
);

// Component to conditionally render buttons based on role
const ConditionalEditButton = () => {
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

    // Only show edit button for admins
    return userRole === 'admin' ? <EditButton /> : null;
};

const ConditionalDeleteButton = () => {
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

    // Only show delete button for admins
    return userRole === 'admin' ? <DeleteButton /> : null;
};

export const MemberList = (props) => (
    <List {...props} filters={<MemberFilters />} sort={{ field: 'createdAt', order: 'DESC' }}>
        <Datagrid rowClick="show">
            <TextField source="referenceNo" label="Ref No" />
            <TextField source="firstName" label="First Name" />
            <TextField source="lastName" label="Last Name" />
            <EmailField source="email" />
            <TextField source="mobile" />
            <ChipField source="membershipCategory" label="Category" />
            <ChipField source="membershipType" label="Type" />
            <NumberField
                source="membershipFee"
                label="Fee"
                options={{ style: 'currency', currency: 'AUD' }}
            />
            <ChipField source="paymentStatus" label="Payment" />
            <StatusField label="Status" />
            <DateField source="createdAt" label="Registered" showTime />
            <ConditionalEditButton />
            <ShowButton />
            <ConditionalDeleteButton />
        </Datagrid>
    </List>
);
