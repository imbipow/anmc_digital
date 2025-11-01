import React from 'react';
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
    SelectInput
} from 'react-admin';

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
        <SelectInput source="status" choices={[
            { id: 'active', name: 'Active' },
            { id: 'inactive', name: 'Inactive' },
        ]} />
    </Filter>
);

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
            <ChipField source="status" />
            <DateField source="createdAt" label="Registered" showTime />
            <EditButton />
            <ShowButton />
            <DeleteButton />
        </Datagrid>
    </List>
);
