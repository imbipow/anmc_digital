import React from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
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

const FaqEdit = () => (
    <Edit actions={<EditActions />}>
        <SimpleForm>
            <Card style={{ width: '100%', marginBottom: 16 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        FAQ Information
                    </Typography>
                    <TextInput source="question" fullWidth required label="Question" />
                    <TextInput
                        source="answer"
                        fullWidth
                        multiline
                        rows={6}
                        required
                        label="Answer"
                    />
                    <SelectInput
                        source="category"
                        choices={[
                            { id: 'General', name: 'General' },
                            { id: 'Membership', name: 'Membership' },
                            { id: 'Facilities', name: 'Facilities' },
                            { id: 'Services', name: 'Services' },
                            { id: 'Events', name: 'Events' },
                        ]}
                        required
                    />
                    <SelectInput
                        source="status"
                        choices={[
                            { id: 'published', name: 'Published' },
                            { id: 'draft', name: 'Draft' },
                        ]}
                        required
                    />
                    <NumberInput
                        source="order"
                        label="Display Order"
                        helperText="Lower numbers appear first"
                        min={1}
                    />
                </CardContent>
            </Card>
        </SimpleForm>
    </Edit>
);

export default FaqEdit;
