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

const NewsEdit = () => (
    <Edit actions={<EditActions />}>
        <SimpleForm>
            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        News Article Details
                    </Typography>
                    <TextInput source="title" fullWidth required />
                    <TextInput source="slug" fullWidth required />
                    <TextInput source="excerpt" fullWidth multiline rows={3} />
                    <TextInput source="authorName" fullWidth required />
                    <SelectInput
                        source="category"
                        choices={[
                            { id: 'community-events', name: 'Community Events' },
                            { id: 'programs', name: 'Programs' },
                            { id: 'announcements', name: 'Announcements' },
                            { id: 'achievements', name: 'Achievements' },
                        ]}
                        required
                    />
                    <DateInput source="date" required />
                    <DateInput source="publishedAt" label="Published Date" />
                    <BooleanInput source="featured" />
                    <SelectInput
                        source="status"
                        choices={[
                            { id: 'draft', name: 'Draft' },
                            { id: 'published', name: 'Published' },
                            { id: 'archived', name: 'Archived' },
                        ]}
                        required
                    />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Content
                    </Typography>
                    <TextInput source="featuredImage" fullWidth label="Featured Image URL" />
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

export default NewsEdit;