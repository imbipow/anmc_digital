import React, { useState } from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    BooleanInput,
    DateInput,
    TimeInput,
    NumberInput,
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

const EventEdit = () => (
    <Edit actions={<EditActions />}>
        <SimpleForm>
            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Event Details
                    </Typography>
                    <TextInput source="title" fullWidth required />
                    <TextInput source="slug" fullWidth required />
                    <TextInput source="description" fullWidth multiline rows={3} />
                    <SelectInput
                        source="category"
                        choices={[
                            { id: 'community', name: 'Community' },
                            { id: 'culture', name: 'Culture' },
                            { id: 'education', name: 'Education' },
                            { id: 'fundraising', name: 'Fundraising' },
                            { id: 'workshop', name: 'Workshop' },
                        ]}
                        required
                    />
                    <BooleanInput source="featured" />
                    <SelectInput
                        source="status"
                        choices={[
                            { id: 'upcoming', name: 'Upcoming' },
                            { id: 'ongoing', name: 'Ongoing' },
                            { id: 'completed', name: 'Completed' },
                            { id: 'cancelled', name: 'Cancelled' },
                        ]}
                        required
                    />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Date & Time
                    </Typography>
                    <DateInput source="startDate" required />
                    <DateInput source="endDate" required />
                    <TimeInput source="startTime" />
                    <TimeInput source="endTime" />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Location & Registration
                    </Typography>
                    <TextInput source="location" fullWidth required />
                    <TextInput source="address" fullWidth />
                    <NumberInput source="maxAttendees" />
                    <BooleanInput source="registrationRequired" />
                    <TextInput source="contactEmail" fullWidth type="email" />
                    <TextInput
                        source="registrationLink"
                        fullWidth
                        label="Registration Link"
                        helperText="URL to event registration form (e.g., Google Forms, Eventbrite)"
                    />
                    <TextInput
                        source="galleryLink"
                        fullWidth
                        label="Gallery Link"
                        helperText="URL to event photo gallery (e.g., Google Photos, Flickr)"
                    />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Content & Media
                    </Typography>
                    <FeaturedImageField />
                    <RichTextInput source="content" label="Event Content" required />
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

export default EventEdit;