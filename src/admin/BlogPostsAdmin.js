import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    Edit,
    Create,
    SimpleForm,
    TextInput,
    DateInput,
    BooleanInput,
    BooleanField,
} from 'react-admin';

export const BlogPostsList = (props) => (
    <List {...props} title="Blog Posts">
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="author" />
            <TextField source="date" />
            <BooleanField source="featured" />
        </Datagrid>
    </List>
);

export const BlogPostsCreate = (props) => (
    <Create {...props} title="Create Blog Post">
        <SimpleForm>
            <TextInput source="title" label="Title" fullWidth required />
            <TextInput source="content" label="Content" multiline rows={5} fullWidth />
            <TextInput source="author" label="Author Name" />
            <DateInput source="date" label="Date" />
            <TextInput source="image" label="Image URL" fullWidth />
            <BooleanInput source="featured" label="Featured Post" />
        </SimpleForm>
    </Create>
);

export const BlogPostsEdit = (props) => (
    <Edit {...props} title="Edit Blog Post">
        <SimpleForm>
            <TextInput source="title" label="Title" fullWidth required />
            <TextInput source="content" label="Content" multiline rows={5} fullWidth />
            <TextInput source="author" label="Author Name" />
            <DateInput source="date" label="Date" />
            <TextInput source="image" label="Image URL" fullWidth />
            <BooleanInput source="featured" label="Featured Post" />
        </SimpleForm>
    </Edit>
);