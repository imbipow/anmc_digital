import React from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    TopToolbar,
    ListButton
} from 'react-admin';
import { Card, CardContent, Typography } from '@mui/material';

const EditActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

const ContactEdit = () => (
    <Edit actions={<EditActions />}>
        <SimpleForm>
            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Contact Information
                    </Typography>
                    <TextInput source="address" fullWidth required label="Address" />
                    <TextInput source="phone" fullWidth required label="Phone Number" />
                    <TextInput source="email" fullWidth required label="Email Address" type="email" />
                    <TextInput source="emergencyPhone" fullWidth label="Emergency Phone" />

                    <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
                        Office Hours
                    </Typography>
                    <TextInput source="officeHours" fullWidth multiline rows={2} label="Regular Office Hours" />
                    <TextInput source="weekendHours" fullWidth multiline rows={2} label="Weekend Hours" />

                    <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
                        Social Media Links
                    </Typography>
                    <TextInput source="socialMedia.facebook" fullWidth label="Facebook URL" />
                    <TextInput source="socialMedia.twitter" fullWidth label="Twitter URL" />
                    <TextInput source="socialMedia.instagram" fullWidth label="Instagram URL" />

                    <Typography variant="h6" gutterBottom style={{ marginTop: '20px' }}>
                        Map Coordinates
                    </Typography>
                    <TextInput source="mapCoordinates.lat" fullWidth label="Latitude" type="number" step="any" />
                    <TextInput source="mapCoordinates.lng" fullWidth label="Longitude" type="number" step="any" />
                </CardContent>
            </Card>
        </SimpleForm>
    </Edit>
);

export default ContactEdit;
