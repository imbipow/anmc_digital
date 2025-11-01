import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    EditButton,
    DeleteButton,
    TopToolbar,
    CreateButton,
    ExportButton,
    FilterButton
} from 'react-admin';

const ListActions = () => (
    <TopToolbar>
        <CreateButton />
        <ExportButton />
    </TopToolbar>
);

const CounterList = () => (
    <List actions={<ListActions />} sort={{ field: 'id', order: 'ASC' }}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="label" />
            <NumberField source="count" />
            <TextField source="prefix" />
            <TextField source="suffix" />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export default CounterList;