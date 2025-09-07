import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    BooleanField,
    Edit,
    Create,
    SimpleForm,
    TextInput,
    DateTimeInput,
    BooleanInput,
    SelectInput,
    ArrayInput,
    SimpleFormIterator,
    required,
} from 'react-admin';

export const NewsList = (props) => (
    <List {...props} title="News Articles">
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="authorName" />
            <DateField source="date" />
            <BooleanField source="featured" />
            <TextField source="status" />
            <TextField source="category" />
        </Datagrid>
    </List>
);

export const NewsEdit = (props) => (
    <Edit {...props} title="Edit News Article">
        <SimpleForm>
            <TextInput source="title" label="Title" fullWidth validate={required()} />
            <TextInput source="slug" label="URL Slug" fullWidth validate={required()} />
            <TextInput source="excerpt" label="Excerpt" multiline rows={2} fullWidth />
            <TextInput source="content" label="Content" multiline rows={6} fullWidth validate={required()} />
            <TextInput source="authorName" label="Author" validate={required()} />
            <DateTimeInput source="publishedAt" label="Published Date" />
            <TextInput source="featuredImage" label="Featured Image URL" fullWidth />
            <BooleanInput source="featured" label="Featured Article" />
            <SelectInput 
                source="status" 
                choices={[
                    { id: 'draft', name: 'Draft' },
                    { id: 'published', name: 'Published' },
                    { id: 'archived', name: 'Archived' },
                ]}
            />
            <SelectInput 
                source="category" 
                choices={[
                    { id: 'community-events', name: 'Community Events' },
                    { id: 'programs', name: 'Programs' },
                    { id: 'announcements', name: 'Announcements' },
                    { id: 'achievements', name: 'Achievements' },
                ]}
            />
            <ArrayInput source="tags" label="Tags">
                <SimpleFormIterator>
                    <TextInput />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Edit>
);

export const NewsCreate = (props) => (
    <Create {...props} title="Create News Article">
        <SimpleForm>
            <TextInput source="title" label="Title" fullWidth validate={required()} />
            <TextInput source="slug" label="URL Slug" fullWidth validate={required()} />
            <TextInput source="excerpt" label="Excerpt" multiline rows={2} fullWidth />
            <TextInput source="content" label="Content" multiline rows={6} fullWidth validate={required()} />
            <TextInput source="authorName" label="Author" validate={required()} />
            <DateTimeInput source="publishedAt" label="Published Date" />
            <TextInput source="featuredImage" label="Featured Image URL" fullWidth />
            <BooleanInput source="featured" label="Featured Article" />
            <SelectInput 
                source="status" 
                choices={[
                    { id: 'draft', name: 'Draft' },
                    { id: 'published', name: 'Published' },
                    { id: 'archived', name: 'Archived' },
                ]}
                defaultValue="draft"
            />
            <SelectInput 
                source="category" 
                choices={[
                    { id: 'community-events', name: 'Community Events' },
                    { id: 'programs', name: 'Programs' },
                    { id: 'announcements', name: 'Announcements' },
                    { id: 'achievements', name: 'Achievements' },
                ]}
            />
            <ArrayInput source="tags" label="Tags">
                <SimpleFormIterator>
                    <TextInput />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Create>
);