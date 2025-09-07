import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    Edit,
    SimpleForm,
    TextInput,
    DeleteButton,
    TopToolbar,
    EditButton,
} from 'react-admin';

const HeroEditActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

export const HomepageList = (props) => (
    <List {...props} title="Homepage Hero Section">
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="data.title" label="Title" />
            <TextField source="data.welcomeText" label="Welcome Text" />
            <TextField source="component" />
        </Datagrid>
    </List>
);

export const HomepageEdit = (props) => (
    <Edit {...props} title="Edit Homepage Hero" actions={<HeroEditActions />}>
        <SimpleForm>
            <TextInput source="data.welcomeText" label="Welcome Text" fullWidth />
            <TextInput source="data.title" label="Main Title" fullWidth />
            <TextInput source="data.subtitle" label="Subtitle" multiline rows={4} fullWidth />
            <TextInput source="data.learnMoreText" label="Learn More Button Text" />
            <TextInput source="data.memberButtonText" label="Member Button Text" />
            <TextInput source="data.heroImage" label="Hero Image Path" fullWidth />
        </SimpleForm>
    </Edit>
);