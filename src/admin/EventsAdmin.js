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
    TimeInput,
    BooleanInput,
    SelectInput,
    NumberInput,
    ArrayInput,
    SimpleFormIterator,
    required,
} from 'react-admin';

export const EventsList = (props) => (
    <List {...props} title="Events">
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="title" />
            <DateField source="startDate" />
            <TextField source="location" />
            <BooleanField source="featured" />
            <TextField source="status" />
            <NumberField source="maxAttendees" />
        </Datagrid>
    </List>
);

export const EventsEdit = (props) => (
    <Edit {...props} title="Edit Event">
        <SimpleForm>
            <TextInput source="title" label="Event Title" fullWidth validate={required()} />
            <TextInput source="slug" label="URL Slug" fullWidth validate={required()} />
            <TextInput source="description" label="Short Description" multiline rows={2} fullWidth />
            <TextInput source="content" label="Full Description" multiline rows={6} fullWidth validate={required()} />
            <DateInput source="startDate" label="Start Date" validate={required()} />
            <DateInput source="endDate" label="End Date" />
            <TimeInput source="startTime" label="Start Time" />
            <TimeInput source="endTime" label="End Time" />
            <TextInput source="location" label="Location" fullWidth validate={required()} />
            <TextInput source="address" label="Address" fullWidth />
            <TextInput source="featuredImage" label="Featured Image URL" fullWidth />
            <BooleanInput source="featured" label="Featured Event" />
            <SelectInput 
                source="status" 
                choices={[
                    { id: 'upcoming', name: 'Upcoming' },
                    { id: 'ongoing', name: 'Ongoing' },
                    { id: 'completed', name: 'Completed' },
                    { id: 'cancelled', name: 'Cancelled' },
                ]}
            />
            <SelectInput 
                source="category" 
                choices={[
                    { id: 'community', name: 'Community' },
                    { id: 'culture', name: 'Culture' },
                    { id: 'education', name: 'Education' },
                    { id: 'sports', name: 'Sports' },
                    { id: 'fundraising', name: 'Fundraising' },
                ]}
            />
            <NumberInput source="maxAttendees" label="Maximum Attendees" />
            <BooleanInput source="registrationRequired" label="Registration Required" />
            <TextInput source="contactEmail" label="Contact Email" type="email" />
            <ArrayInput source="tags" label="Tags">
                <SimpleFormIterator>
                    <TextInput />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Edit>
);

export const EventsCreate = (props) => (
    <Create {...props} title="Create Event">
        <SimpleForm>
            <TextInput source="title" label="Event Title" fullWidth validate={required()} />
            <TextInput source="slug" label="URL Slug" fullWidth validate={required()} />
            <TextInput source="description" label="Short Description" multiline rows={2} fullWidth />
            <TextInput source="content" label="Full Description" multiline rows={6} fullWidth validate={required()} />
            <DateInput source="startDate" label="Start Date" validate={required()} />
            <DateInput source="endDate" label="End Date" />
            <TimeInput source="startTime" label="Start Time" />
            <TimeInput source="endTime" label="End Time" />
            <TextInput source="location" label="Location" fullWidth validate={required()} />
            <TextInput source="address" label="Address" fullWidth />
            <TextInput source="featuredImage" label="Featured Image URL" fullWidth />
            <BooleanInput source="featured" label="Featured Event" />
            <SelectInput 
                source="status" 
                choices={[
                    { id: 'upcoming', name: 'Upcoming' },
                    { id: 'ongoing', name: 'Ongoing' },
                    { id: 'completed', name: 'Completed' },
                    { id: 'cancelled', name: 'Cancelled' },
                ]}
                defaultValue="upcoming"
            />
            <SelectInput 
                source="category" 
                choices={[
                    { id: 'community', name: 'Community' },
                    { id: 'culture', name: 'Culture' },
                    { id: 'education', name: 'Education' },
                    { id: 'sports', name: 'Sports' },
                    { id: 'fundraising', name: 'Fundraising' },
                ]}
            />
            <NumberInput source="maxAttendees" label="Maximum Attendees" />
            <BooleanInput source="registrationRequired" label="Registration Required" />
            <TextInput source="contactEmail" label="Contact Email" type="email" />
            <ArrayInput source="tags" label="Tags">
                <SimpleFormIterator>
                    <TextInput />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Create>
);