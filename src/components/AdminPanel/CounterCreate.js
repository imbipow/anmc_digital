import React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    TopToolbar,
    ListButton
} from 'react-admin';
import { Card, CardContent, Typography } from '@mui/material';

const CreateActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

const CounterCreate = () => (
    <Create actions={<CreateActions />}>
        <SimpleForm>
            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        New Counter
                    </Typography>
                    <TextInput source="label" fullWidth required />
                    <NumberInput source="count" fullWidth required defaultValue={0} />
                    <TextInput source="prefix" fullWidth helperText="Text to display before the number (e.g., $)" />
                    <TextInput source="suffix" fullWidth helperText="Text to display after the number (e.g., +, M)" />
                </CardContent>
            </Card>
        </SimpleForm>
    </Create>
);

export default CounterCreate;