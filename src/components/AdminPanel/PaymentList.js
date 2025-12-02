import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    EmailField,
    ChipField,
    FunctionField,
    FilterButton,
    TopToolbar,
    SelectColumnsButton,
    ExportButton,
    usePermissions,
    Filter,
    TextInput,
    SelectInput
} from 'react-admin';
import { Chip, Box } from '@mui/material';
import { tableHeaderStyles } from './commonTableStyles';

const ListActions = () => {
    return (
        <TopToolbar>
            <FilterButton />
            <SelectColumnsButton />
            <ExportButton />
        </TopToolbar>
    );
};

const PaymentFilters = [
    <TextInput key="search" label="Search by Name/Email" source="q" alwaysOn />,
    <SelectInput
        key="status"
        source="paymentStatus"
        label="Payment Status"
        choices={[
            { id: 'succeeded', name: 'Succeeded' },
            { id: 'processing', name: 'Processing' },
            { id: 'pending', name: 'Pending' },
            { id: 'failed', name: 'Failed' }
        ]}
        emptyText="All Statuses"
        emptyValue=""
        alwaysOn
    />,
    <SelectInput
        key="category"
        source="membershipCategory"
        label="Membership Category"
        choices={[
            { id: 'general', name: 'General' },
            { id: 'life', name: 'Life' }
        ]}
        emptyText="All Categories"
        emptyValue=""
    />,
];

const PaymentStatusField = ({ record }) => {
    if (!record) return <span>-</span>;

    const statusColors = {
        succeeded: '#4caf50',
        pending: '#ff9800',
        processing: '#2196f3',
        failed: '#f44336'
    };

    const status = record.paymentStatus || 'pending';

    // Debug log to see what we're getting
    console.log('Payment Status for record:', record.id, 'Status:', record.paymentStatus, 'Using:', status);

    return (
        <Chip
            label={status.toUpperCase()}
            size="small"
            sx={{
                backgroundColor: statusColors[status] || '#757575',
                color: 'white',
                fontWeight: 'bold'
            }}
        />
    );
};

const MemberTypeField = ({ record }) => {
    if (!record) return <span>-</span>;

    const category = record.membershipCategory || 'general';
    const type = record.membershipType || 'single';

    // Debug log to see what we're getting
    console.log('Member Type for record:', record.id, 'Category:', record.membershipCategory, 'Type:', record.membershipType);

    // Capitalize first letter
    const formatText = (text) => {
        if (!text) return 'N/A';
        return text.charAt(0).toUpperCase() + text.slice(1);
    };

    return (
        <Chip
            label={`${formatText(category)} - ${formatText(type)}`}
            size="small"
            sx={{
                backgroundColor: category === 'life' ? '#9c27b0' : '#1976d2',
                color: 'white'
            }}
        />
    );
};

export const PaymentList = (props) => {
    const { permissions } = usePermissions();

    return (
        <List
            {...props}
            sort={{ field: 'paymentDate', order: 'DESC' }}
            perPage={25}
            actions={<ListActions />}
            filters={PaymentFilters}
            filterDefaultValues={{ paymentStatus: '' }}
        >
            <Datagrid
                bulkActionButtons={false}
                sx={tableHeaderStyles}
            >
                <TextField source="id" label="ID" />
                <TextField source="referenceNo" label="Reference" />
                <FunctionField
                    label="Member Name"
                    render={record => `${record.firstName || ''} ${record.lastName || ''}`}
                />
                <EmailField source="email" />
                <FunctionField
                    label="Membership Type"
                    render={record => <MemberTypeField record={record} />}
                />
                <NumberField
                    source="membershipFee"
                    label="Amount"
                    options={{ style: 'currency', currency: 'AUD' }}
                />
                <FunctionField
                    label="Payment Status"
                    render={record => <PaymentStatusField record={record} />}
                />
                <DateField source="paymentDate" label="Payment Date" showTime />
                <TextField source="paymentIntentId" label="Payment ID" />
                <FunctionField
                    label="Payment Type"
                    render={record => record.paymentType || 'upfront'}
                />
                <DateField source="createdAt" label="Registered" showTime />
            </Datagrid>
        </List>
    );
};

export default PaymentList;
