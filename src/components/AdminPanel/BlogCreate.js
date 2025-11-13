import React, { useState } from 'react';
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
    ListButton,
    useInput
} from 'react-admin';
import { Card, CardContent, Typography, Button, Box } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';
import MediaGallerySelector from './MediaGallerySelector';
import RichTextInput from './RichTextInput';

const CreateActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

const ImageSelector = ({ source, label }) => {
    const { field } = useInput({ source });
    const [galleryOpen, setGalleryOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState(field.value || '');

    React.useEffect(() => {
        if (field.value) {
            setImageUrl(field.value);
        }
    }, [field.value]);

    const handleSelectImage = (url) => {
        setImageUrl(url);
        field.onChange(url);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                <TextInput
                    source={source}
                    label={label}
                    fullWidth
                    value={imageUrl}
                    onChange={(e) => {
                        setImageUrl(e.target.value);
                        field.onChange(e.target.value);
                    }}
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
            {imageUrl && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        Preview:
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        <img
                            src={imageUrl}
                            alt="Preview"
                            style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px' }}
                        />
                    </Box>
                </Box>
            )}
            <MediaGallerySelector
                open={galleryOpen}
                onClose={() => setGalleryOpen(false)}
                onSelect={handleSelectImage}
                currentImage={imageUrl}
            />
        </Box>
    );
};

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
                    <ImageSelector source="image" label="Image URL" />
                    <RichTextInput source="content" label="Article Content" required />
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