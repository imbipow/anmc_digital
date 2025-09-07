import React from 'react';
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    BooleanField,
    Edit,
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    BooleanInput,
    ArrayInput,
    SimpleFormIterator,
    required,
} from 'react-admin';

export const FacilitiesList = (props) => (
    <List {...props} title="Facilities">
        <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="name" />
            <NumberField source="capacity" />
            <NumberField source="bookingRate" />
            <BooleanField source="available" />
        </Datagrid>
    </List>
);

export const FacilitiesEdit = (props) => (
    <Edit {...props} title="Edit Facility">
        <SimpleForm>
            <TextInput source="name" label="Facility Name" fullWidth validate={required()} />
            <TextInput source="description" label="Description" multiline rows={4} fullWidth validate={required()} />
            <NumberInput source="capacity" label="Capacity (people)" validate={required()} />
            <ArrayInput source="amenities" label="Amenities">
                <SimpleFormIterator>
                    <TextInput />
                </SimpleFormIterator>
            </ArrayInput>
            <NumberInput source="bookingRate" label="Booking Rate ($/hour)" />
            <TextInput source="featuredImage" label="Featured Image URL" fullWidth />
            <BooleanInput source="available" label="Available for Booking" />
        </SimpleForm>
    </Edit>
);

export const FacilitiesCreate = (props) => (
    <Create {...props} title="Create Facility">
        <SimpleForm>
            <TextInput source="name" label="Facility Name" fullWidth validate={required()} />
            <TextInput source="description" label="Description" multiline rows={4} fullWidth validate={required()} />
            <NumberInput source="capacity" label="Capacity (people)" validate={required()} />
            <ArrayInput source="amenities" label="Amenities">
                <SimpleFormIterator>
                    <TextInput />
                </SimpleFormIterator>
            </ArrayInput>
            <NumberInput source="bookingRate" label="Booking Rate ($/hour)" />
            <TextInput source="featuredImage" label="Featured Image URL" fullWidth />
            <BooleanInput source="available" label="Available for Booking" defaultValue={true} />
        </SimpleForm>
    </Create>
);