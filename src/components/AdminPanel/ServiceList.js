import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    BooleanField,
    EditButton,
    DeleteButton,
    Filter,
    TextInput,
    SelectInput,
    FunctionField
} from 'react-admin';
import { tableHeaderStyles } from './commonTableStyles';

const ServiceFilters = (props) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
        <SelectInput source="category" choices={[
            { id: 'service', name: 'Service/Facility' },
            { id: 'small', name: 'Small Puja' },
            { id: 'medium', name: 'Medium Puja' },
            { id: 'large', name: 'Large Puja' },
            { id: 'special', name: 'Special' },
        ]} />
        <SelectInput source="status" choices={[
            { id: 'active', name: 'Active' },
            { id: 'inactive', name: 'Inactive' },
        ]} />
    </Filter>
);

export const ServiceList = (props) => (
    <List
        {...props}
        filters={<ServiceFilters />}
        sort={{ field: 'item', order: 'ASC' }}
        sx={tableHeaderStyles}
    >
        <Datagrid rowClick="edit">
            <TextField source="item" label="Item #" />
            <FunctionField
                source="anusthanName"
                label="Service Name"
                render={record => {
                    if (!record || !record.anusthanName) return '-';
                    // Extract text before the colon, slash, or parenthesis
                    const match = record.anusthanName.match(/^([^:\/\(]+)/);
                    return match ? match[1].trim() : record.anusthanName;
                }}
            />
            <NumberField
                source="amount"
                label="Amount"
                options={{ style: 'currency', currency: 'AUD' }}
            />
            <NumberField source="durationHours" label="Duration (hrs)" />
            <TextField source="category" label="Category" />
            <BooleanField source="requiresSlotBooking" label="Slot Booking" />
            <TextField source="status" label="Status" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export default ServiceList;
