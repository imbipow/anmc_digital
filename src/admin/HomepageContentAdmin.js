import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    BooleanInput,
    ArrayInput,
    SimpleFormIterator,
} from 'react-admin';

export const HomepageContentList = (props) => (
    <List {...props} title="Homepage Content Management" hasCreate={false}>
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="type" />
            <TextField source="component" />
            <TextField source="data.title" label="Title" />
            <TextField source="data.welcomeText" label="Welcome Text" />
        </Datagrid>
    </List>
);

export const HomepageContentEdit = (props) => (
    <Edit {...props} title="Edit Homepage Content">
        <SimpleForm>
            {/* Hero Banner Section */}
            <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#666' }}>Hero Banner</h3>
            <TextInput 
                source="hero.welcomeText" 
                label="Welcome Text" 
                fullWidth 
            />
            <TextInput 
                source="hero.title" 
                label="Main Title" 
                fullWidth 
            />
            <TextInput 
                source="hero.subtitle" 
                label="Subtitle" 
                multiline 
                rows={4} 
                fullWidth 
            />
            <TextInput 
                source="hero.learnMoreText" 
                label="Learn More Button Text" 
            />
            <TextInput 
                source="hero.memberButtonText" 
                label="Member Button Text" 
            />
            <TextInput 
                source="hero.heroImage" 
                label="Hero Image Path" 
                fullWidth 
            />
            <BooleanInput source="hero.active" label="Hero Banner Active" defaultValue={true} />

            {/* Statistics Counters Section */}
            <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#666' }}>Statistics Counters</h3>
            <ArrayInput source="counters" label="Homepage Counters">
                <SimpleFormIterator>
                    <NumberInput source="count" label="Count Value" />
                    <TextInput source="label" label="Counter Label" />
                    <TextInput source="prefix" label="Prefix (e.g., $)" />
                    <TextInput source="suffix" label="Suffix (e.g., +, M+)" />
                    <TextInput source="description" label="Description" multiline />
                    <BooleanInput source="active" label="Counter Active" defaultValue={true} />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Edit>
);

