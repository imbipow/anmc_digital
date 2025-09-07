import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    Edit,
    SimpleForm,
    TextInput,
} from 'react-admin';

export const BlogSectionList = (props) => (
    <List {...props} title="Blog Section Content">
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="sectionTitle" />
            <TextField source="sectionHeading" />
        </Datagrid>
    </List>
);

export const BlogSectionEdit = (props) => (
    <Edit {...props} title="Edit Blog Section">
        <SimpleForm>
            <TextInput source="sectionTitle" label="Section Title" fullWidth />
            <TextInput source="sectionHeading" label="Section Heading" fullWidth />
        </SimpleForm>
    </Edit>
);