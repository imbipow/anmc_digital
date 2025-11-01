import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    BooleanField,
    EditButton,
    DeleteButton,
    ShowButton,
    TopToolbar,
    CreateButton,
    ExportButton,
    FilterButton,
    SearchInput,
    SelectInput,
    BooleanInput
} from 'react-admin';
import { Chip } from '@mui/material';

const EventFilters = [
    <SearchInput source="q" alwaysOn />,
    <SelectInput
        source="category"
        choices={[
            { id: 'community', name: 'Community' },
            { id: 'culture', name: 'Culture' },
            { id: 'education', name: 'Education' },
            { id: 'fundraising', name: 'Fundraising' },
            { id: 'workshop', name: 'Workshop' },
        ]}
    />,
    <SelectInput
        source="status"
        choices={[
            { id: 'upcoming', name: 'Upcoming' },
            { id: 'ongoing', name: 'Ongoing' },
            { id: 'completed', name: 'Completed' },
            { id: 'cancelled', name: 'Cancelled' },
        ]}
    />,
    <BooleanInput source="featured" />
];

const ListActions = () => (
    <TopToolbar>
        <FilterButton />
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

const EventList = () => (
    <List
        filters={EventFilters}
        actions={<ListActions />}
        sort={{ field: 'startDate', order: 'DESC' }}
        perPage={25}
    >
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="location" />
            <DateField source="startDate" />
            <DateField source="endDate" />
            <TextField source="status" />
            <BooleanField source="featured" />
            <EditButton />
            <ShowButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export default EventList;