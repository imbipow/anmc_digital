import React from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
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

const CounterEdit = () => (
    <Edit actions={<EditActions />}>
        <SimpleForm>
            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Counter Details
                    </Typography>
                    <TextInput source="label" fullWidth required />
                    <NumberInput source="count" fullWidth required />
                    <TextInput source="prefix" fullWidth helperText="Text to display before the number (e.g., $)" />
                    <TextInput source="suffix" fullWidth helperText="Text to display after the number (e.g., +, M)" />
                </CardContent>
            </Card>
        </SimpleForm>
    </Edit>
);

export default CounterEdit;