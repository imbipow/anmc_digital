import React from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    SelectInput,
    DateInput,
    TopToolbar,
    ListButton,
    ShowButton,
    DeleteButton
} from 'react-admin';
import { Card, CardContent, Typography } from '@mui/material';

const EditActions = () => (
    <TopToolbar>
        <ShowButton />
        <ListButton />
        <DeleteButton />
    </TopToolbar>
);

const DonationEdit = () => (
    <Edit actions={<EditActions />}>
        <SimpleForm>
            <Card style={{ width: '100%', marginBottom: 16 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Donor Information
                    </Typography>
                    <TextInput source="firstName" fullWidth disabled />
                    <TextInput source="lastName" fullWidth disabled />
                    <TextInput source="email" fullWidth disabled />
                    <TextInput source="phone" fullWidth disabled />
                </CardContent>
            </Card>

            <Card style={{ width: '100%', marginBottom: 16 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Donation Details
                    </Typography>
                    <SelectInput
                        source="donationType"
                        choices={[
                            { id: 'general', name: 'General' },
                            { id: 'brick', name: 'Brick' },
                        ]}
                        fullWidth
                        disabled
                    />
                    <NumberInput source="amount" fullWidth disabled label="Amount (AUD)" />
                    <SelectInput
                        source="paymentStatus"
                        choices={[
                            { id: 'succeeded', name: 'Succeeded' },
                            { id: 'pending', name: 'Pending' },
                            { id: 'failed', name: 'Failed' },
                        ]}
                        fullWidth
                    />
                    <TextInput source="comments" fullWidth multiline rows={4} disabled />
                </CardContent>
            </Card>

            <Card style={{ width: '100%', marginBottom: 16 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        System Information
                    </Typography>
                    <TextInput source="paymentIntentId" fullWidth disabled />
                    <DateInput source="createdAt" fullWidth disabled />
                    <DateInput source="updatedAt" fullWidth disabled />
                </CardContent>
            </Card>
        </SimpleForm>
    </Edit>
);

export default DonationEdit;
