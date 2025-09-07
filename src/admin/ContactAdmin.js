import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    required,
} from 'react-admin';

export const ContactList = (props) => (
    <List {...props} title="Contact Information">
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="address" />
            <TextField source="phone" />
            <TextField source="email" />
        </Datagrid>
    </List>
);

export const ContactEdit = (props) => (
    <Edit {...props} title="Edit Contact Information">
        <SimpleForm>
            <TextInput source="address" label="Address" fullWidth validate={required()} />
            <TextInput source="phone" label="Phone Number" validate={required()} />
            <TextInput source="email" label="Email" type="email" validate={required()} />
            <TextInput source="emergencyPhone" label="Emergency Phone" />
            <TextInput source="officeHours" label="Office Hours" fullWidth />
            <TextInput source="weekendHours" label="Weekend Hours" fullWidth />
            <TextInput source="socialMedia.facebook" label="Facebook URL" fullWidth />
            <TextInput source="socialMedia.instagram" label="Instagram URL" fullWidth />
            <TextInput source="socialMedia.twitter" label="Twitter URL" fullWidth />
            <NumberInput source="mapCoordinates.lat" label="Latitude" step={0.0001} />
            <NumberInput source="mapCoordinates.lng" label="Longitude" step={0.0001} />
        </SimpleForm>
    </Edit>
);