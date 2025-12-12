import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    EmailField,
    NumberField,
    DateField,
    ChipField,
    EditButton,
    ShowButton,
    DeleteButton,
    TopToolbar,
    ExportButton,
    FilterButton,
    SearchInput,
    SelectInput
} from 'react-admin';

const DonationFilters = [
    <SearchInput source="q" alwaysOn placeholder="Search donations..." />,
    <SelectInput
        source="donationType"
        choices={[
            { id: 'general', name: 'General' },
            { id: 'brick', name: 'Brick' },
        ]}
    />,
    <SelectInput
        source="paymentStatus"
        choices={[
            { id: 'succeeded', name: 'Succeeded' },
            { id: 'pending', name: 'Pending' },
            { id: 'failed', name: 'Failed' },
        ]}
    />
];

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <ExportButton />
    </TopToolbar>
);

const DonationList = () => (
    <List
        filters={DonationFilters}
        actions={<ListActions />}
        sort={{ field: 'createdAt', order: 'DESC' }}
        perPage={25}
    >
        <Datagrid rowClick="show">
            <TextField source="id" label="ID" />
            <TextField source="firstName" label="First Name" />
            <TextField source="lastName" label="Last Name" />
            <EmailField source="email" label="Email" />
            <TextField source="phone" label="Phone" />
            <TextField source="donationType" label="Type" />
            <NumberField source="amount" label="Amount ($)" options={{ style: 'currency', currency: 'AUD' }} />
            <ChipField source="paymentStatus" label="Status" />
            <DateField source="createdAt" label="Date" showTime />
            <ShowButton />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export default DonationList;
