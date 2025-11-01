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

const HomepageEdit = () => (
    <Edit actions={<EditActions />}>
        <SimpleForm>
            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Hero Section
                    </Typography>
                    <TextInput source="data.welcomeText" fullWidth required label="Welcome Text" />
                    <TextInput source="data.title" fullWidth required label="Main Title" />
                    <TextInput source="data.subtitle" fullWidth multiline rows={4} required label="Subtitle" />
                    <TextInput source="data.learnMoreText" fullWidth required label="Learn More Button Text" />
                    <TextInput source="data.memberButtonText" fullWidth required label="Member Button Text" />
                    <TextInput source="data.heroImage" fullWidth required label="Hero Image Path" />
                </CardContent>
            </Card>
        </SimpleForm>
    </Edit>
);

export default HomepageEdit;