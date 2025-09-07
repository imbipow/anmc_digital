import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    BooleanField,
    NumberField,
    Edit,
    Create,
    SimpleForm,
    TextInput,
    DateInput,
    BooleanInput,
    SelectInput,
    NumberInput,
    ArrayInput,
    SimpleFormIterator,
    required,
} from 'react-admin';

export const ProjectsList = (props) => (
    <List {...props} title="Projects">
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="status" />
            <DateField source="startDate" />
            <DateField source="endDate" />
            <NumberField source="progress" />
            <BooleanField source="featured" />
            <TextField source="projectManager" />
        </Datagrid>
    </List>
);

export const ProjectsEdit = (props) => (
    <Edit {...props} title="Edit Project">
        <SimpleForm>
            <TextInput source="title" label="Project Title" fullWidth validate={required()} />
            <TextInput source="slug" label="URL Slug" fullWidth validate={required()} />
            <TextInput source="description" label="Short Description" multiline rows={2} fullWidth />
            <TextInput source="content" label="Detailed Description" multiline rows={6} fullWidth validate={required()} />
            <SelectInput 
                source="status" 
                choices={[
                    { id: 'planning', name: 'Planning' },
                    { id: 'active', name: 'Active' },
                    { id: 'on-hold', name: 'On Hold' },
                    { id: 'completed', name: 'Completed' },
                    { id: 'cancelled', name: 'Cancelled' },
                ]}
            />
            <DateInput source="startDate" label="Start Date" validate={required()} />
            <DateInput source="endDate" label="End Date" />
            <NumberInput source="budget" label="Budget ($)" />
            <TextInput source="fundingSource" label="Funding Source" />
            <TextInput source="projectManager" label="Project Manager" />
            <TextInput source="featuredImage" label="Featured Image URL" fullWidth />
            <BooleanInput source="featured" label="Featured Project" />
            <SelectInput 
                source="category" 
                choices={[
                    { id: 'sustainability', name: 'Sustainability' },
                    { id: 'youth', name: 'Youth' },
                    { id: 'education', name: 'Education' },
                    { id: 'infrastructure', name: 'Infrastructure' },
                    { id: 'cultural', name: 'Cultural' },
                ]}
            />
            <NumberInput source="progress" label="Progress (%)" min={0} max={100} />
            <ArrayInput source="tags" label="Tags">
                <SimpleFormIterator>
                    <TextInput />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Edit>
);

export const ProjectsCreate = (props) => (
    <Create {...props} title="Create Project">
        <SimpleForm>
            <TextInput source="title" label="Project Title" fullWidth validate={required()} />
            <TextInput source="slug" label="URL Slug" fullWidth validate={required()} />
            <TextInput source="description" label="Short Description" multiline rows={2} fullWidth />
            <TextInput source="content" label="Detailed Description" multiline rows={6} fullWidth validate={required()} />
            <SelectInput 
                source="status" 
                choices={[
                    { id: 'planning', name: 'Planning' },
                    { id: 'active', name: 'Active' },
                    { id: 'on-hold', name: 'On Hold' },
                    { id: 'completed', name: 'Completed' },
                    { id: 'cancelled', name: 'Cancelled' },
                ]}
                defaultValue="planning"
            />
            <DateInput source="startDate" label="Start Date" validate={required()} />
            <DateInput source="endDate" label="End Date" />
            <NumberInput source="budget" label="Budget ($)" />
            <TextInput source="fundingSource" label="Funding Source" />
            <TextInput source="projectManager" label="Project Manager" />
            <TextInput source="featuredImage" label="Featured Image URL" fullWidth />
            <BooleanInput source="featured" label="Featured Project" />
            <SelectInput 
                source="category" 
                choices={[
                    { id: 'sustainability', name: 'Sustainability' },
                    { id: 'youth', name: 'Youth' },
                    { id: 'education', name: 'Education' },
                    { id: 'infrastructure', name: 'Infrastructure' },
                    { id: 'cultural', name: 'Cultural' },
                ]}
            />
            <NumberInput source="progress" label="Progress (%)" min={0} max={100} defaultValue={0} />
            <ArrayInput source="tags" label="Tags">
                <SimpleFormIterator>
                    <TextInput />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Create>
);