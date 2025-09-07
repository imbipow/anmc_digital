import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    Edit,
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    required,
    DeleteButton,
    TopToolbar,
    EditButton,
} from 'react-admin';

const CounterEditActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

export const CountersList = (props) => (
    <List {...props} title="Homepage Counter Statistics">
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <NumberField source="data.count" label="Count" />
            <TextField source="data.prefix" label="Prefix" />
            <TextField source="data.suffix" label="Suffix" />
            <TextField source="data.label" label="Label" />
        </Datagrid>
    </List>
);

export const CountersEdit = (props) => (
    <Edit {...props} title="Edit Counter" actions={<CounterEditActions />}>
        <SimpleForm>
            <NumberInput source="data.count" label="Count Value" validate={required()} />
            <TextInput source="data.prefix" label="Prefix (e.g., $)" />
            <TextInput source="data.suffix" label="Suffix (e.g., +, M+)" />
            <TextInput source="data.label" label="Label" fullWidth validate={required()} />
        </SimpleForm>
    </Edit>
);

export const CountersCreate = (props) => (
    <Create {...props} title="Create Counter" transform={(data) => ({ ...data, type: 'counters' })}>
        <SimpleForm>
            <NumberInput source="data.count" label="Count Value" validate={required()} />
            <TextInput source="data.prefix" label="Prefix (e.g., $)" />
            <TextInput source="data.suffix" label="Suffix (e.g., +, M+)" />
            <TextInput source="data.label" label="Label" fullWidth validate={required()} />
        </SimpleForm>
    </Create>
);