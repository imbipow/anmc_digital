import React from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    BooleanInput,
    DateInput,
    ArrayInput,
    SimpleFormIterator,
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

const BlogEdit = () => (
    <Edit actions={<EditActions />}>
        <SimpleForm>
            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Basic Information
                    </Typography>
                    <TextInput source="title" fullWidth required />
                    <TextInput source="excerpt" fullWidth multiline rows={3} />
                    <TextInput source="author" fullWidth required />
                    <SelectInput
                        source="category"
                        choices={[
                            { id: 'Events', name: 'Events' },
                            { id: 'Education', name: 'Education' },
                            { id: 'Community', name: 'Community' },
                            { id: 'Youth', name: 'Youth' },
                            { id: 'Culture', name: 'Culture' },
                            { id: 'Fundraising', name: 'Fundraising' },
                        ]}
                        required
                    />
                    <DateInput source="date" required />
                    <BooleanInput source="featured" />
                    <TextInput source="readTime" placeholder="e.g., 5 min read" />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Content
                    </Typography>
                    <TextInput source="image" fullWidth label="Image URL" />
                    <TextInput source="content" fullWidth multiline rows={8} required />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Tags
                    </Typography>
                    <ArrayInput source="tags">
                        <SimpleFormIterator inline>
                            <TextInput source="" label="Tag" />
                        </SimpleFormIterator>
                    </ArrayInput>
                </CardContent>
            </Card>
        </SimpleForm>
    </Edit>
);

export default BlogEdit;