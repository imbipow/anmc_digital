import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    BooleanField,
    EditButton,
    DeleteButton,
    NumberField,
    TopToolbar,
    CreateButton,
    useRecordContext
} from 'react-admin';
import { Chip } from '@mui/material';
import './commonTableStyles.css';

const ListActions = () => (
    <TopToolbar>
        <CreateButton />
    </TopToolbar>
);

const StatusField = () => {
    const record = useRecordContext();
    return (
        <Chip
            label={record.active ? 'Active' : 'Inactive'}
            color={record.active ? 'success' : 'default'}
            size="small"
        />
    );
};

const HeroSlidesList = () => (
    <List
        actions={<ListActions />}
        sort={{ field: 'order', order: 'ASC' }}
        className="admin-list-container"
    >
        <Datagrid bulkActionButtons={false} className="admin-table">
            <NumberField source="order" label="Order" />
            <TextField source="title" label="Title" />
            <TextField source="welcomeText" label="Welcome Text" />
            <StatusField label="Status" />
            <TextField source="buttonText" label="Button Text" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export default HeroSlidesList;
