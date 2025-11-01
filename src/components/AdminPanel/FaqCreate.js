import React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
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

const FaqCreate = () => (
    <Create actions={<CreateActions />}>
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
                        defaultValue="General"
                    />
                    <SelectInput
                        source="status"
                        choices={[
                            { id: 'published', name: 'Published' },
                            { id: 'draft', name: 'Draft' },
                        ]}
                        required
                        defaultValue="published"
                    />
                    <NumberInput
                        source="order"
                        label="Display Order"
                        helperText="Lower numbers appear first"
                        defaultValue={1}
                        min={1}
                    />
                </CardContent>
            </Card>
        </SimpleForm>
    </Create>
);

export default FaqCreate;
