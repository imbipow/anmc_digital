import React, { useState } from 'react';
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
    DeleteButton,
    useInput
} from 'react-admin';
import { Card, CardContent, Typography, Button, Box, TextField } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';
import MediaGallerySelector from './MediaGallerySelector';
import RichTextInput from './RichTextInput';

const EditActions = () => (
    <TopToolbar>
        <ShowButton />
        <ListButton />
        <DeleteButton />
    </TopToolbar>
);

const FeaturedImageField = () => {
    const { field } = useInput({ source: 'featuredImage' });
    const [galleryOpen, setGalleryOpen] = useState(false);

    const handleSelectImage = (url) => {
        field.onChange(url);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                <TextField
                    fullWidth
                    label="Featured Image URL"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    error={!!field.error}
                    helperText={field.error?.message}
                />
                <Button
                    variant="outlined"
                    startIcon={<ImageIcon />}
                    onClick={() => setGalleryOpen(true)}
                    sx={{ mt: 1, minWidth: '200px' }}
                >
                    Select from Gallery
                </Button>
            </Box>
            {field.value && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        Preview:
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        <img
                            src={field.value}
                            alt="Featured"
                            style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                    </Box>
                </Box>
            )}
            <MediaGallerySelector
                open={galleryOpen}
                onClose={() => setGalleryOpen(false)}
                onSelect={handleSelectImage}
                currentImage={field.value}
            />
        </Box>
    );
};

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
                    <FeaturedImageField />
                    <RichTextInput source="content" label="Article Content" required />
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