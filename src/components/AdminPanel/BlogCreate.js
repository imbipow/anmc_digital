import React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    BooleanInput,
    DateInput,
    ArrayInput,
    SimpleFormIterator,
    TopToolbar,
    ListButton
} from 'react-admin';
import { Card, CardContent, Typography } from '@mui/material';

const CreateActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

const BlogCreate = () => (
    <Create actions={<CreateActions />}>
        <SimpleForm>
            <Card style={{ width: '100%', marginBottom: 16 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Basic Information
                    </Typography>
                    <TextInput source="title" fullWidth required />
                    <TextInput source="excerpt" fullWidth multiline rows={3} />
                    <TextInput
                        source="author"
                        fullWidth
                        required
                        defaultValue="ANMC Admin"
                    />
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
                    <DateInput
                        source="date"
                        required
                        defaultValue={new Date().toISOString().split('T')[0]}
                    />
                    <BooleanInput source="featured" defaultValue={false} />
                    <TextInput
                        source="readTime"
                        placeholder="e.g., 5 min read"
                        defaultValue="3 min read"
                    />
                </CardContent>
            </Card>

            <Card style={{ width: '100%', marginBottom: 16 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Content
                    </Typography>
                    <TextInput
                        source="image"
                        fullWidth
                        label="Image URL"
                        defaultValue="images/blog/default.jpg"
                    />
                    <TextInput source="content" fullWidth multiline rows={8} required />
                </CardContent>
            </Card>

            <Card style={{ width: '100%', marginBottom: 16 }}>
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
    </Create>
);

export default BlogCreate;