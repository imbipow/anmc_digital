import React, { useState } from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    SelectInput,
    BooleanInput,
    DateInput,
    NumberInput,
    ArrayInput,
    SimpleFormIterator,
    TopToolbar,
    ListButton,
    useInput
} from 'react-admin';
import { Card, CardContent, Typography, Button, Box, TextField } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';
import MediaGallerySelector from './MediaGallerySelector';
import RichTextInput from './RichTextInput';

const CreateActions = () => (
    <TopToolbar>
        <ListButton />
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
                    sx={{ mt: 0, minWidth: '200px' }}
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

const ProjectCreate = () => (
    <Create actions={<CreateActions />}>
        <SimpleForm>
            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Basic Information
                    </Typography>
                    <TextInput source="title" fullWidth required label="Project Title" />
                    <TextInput source="slug" fullWidth label="URL Slug" helperText="Leave empty to auto-generate from title" />
                    <TextInput source="description" fullWidth multiline rows={3} label="Short Description" />
                    <SelectInput
                        source="category"
                        fullWidth
                        choices={[
                            { id: 'infrastructure', name: 'Infrastructure' },
                            { id: 'community', name: 'Community' },
                            { id: 'education', name: 'Education' },
                            { id: 'culture', name: 'Culture' },
                            { id: 'sustainability', name: 'Sustainability' },
                            { id: 'youth', name: 'Youth' },
                            { id: 'fundraising', name: 'Fundraising' },
                        ]}
                        label="Category"
                    />
                    <FeaturedImageField />
                    <BooleanInput source="featured" label="Feature this project on homepage" defaultValue={false} />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Project Details
                    </Typography>
                    <RichTextInput source="content" label="Full Project Description" />

                    <SelectInput
                        source="status"
                        fullWidth
                        choices={[
                            { id: 'planning', name: 'Planning' },
                            { id: 'active', name: 'Active' },
                            { id: 'completed', name: 'Completed' },
                            { id: 'on-hold', name: 'On Hold' },
                            { id: 'cancelled', name: 'Cancelled' },
                        ]}
                        label="Project Status"
                        defaultValue="planning"
                    />

                    <NumberInput
                        source="progress"
                        fullWidth
                        label="Progress (%)"
                        min={0}
                        max={100}
                        defaultValue={0}
                        helperText="Enter progress percentage (0-100)"
                    />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Timeline & Budget
                    </Typography>
                    <DateInput source="startDate" fullWidth label="Start Date" />
                    <DateInput source="endDate" fullWidth label="End Date" />

                    <NumberInput
                        source="budget"
                        fullWidth
                        label="Budget ($)"
                        helperText="Enter budget amount in dollars"
                    />
                    <TextInput source="fundingSource" fullWidth label="Funding Source" />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Management
                    </Typography>
                    <TextInput source="projectManager" fullWidth label="Project Manager" />
                    <TextInput source="teamSize" fullWidth label="Team Size" helperText="e.g., 5 members" />

                    <ArrayInput source="milestones" label="Project Milestones">
                        <SimpleFormIterator>
                            <TextInput source="title" label="Milestone Title" fullWidth />
                            <TextInput source="description" label="Description" fullWidth multiline rows={2} />
                            <DateInput source="targetDate" label="Target Date" />
                            <BooleanInput source="completed" label="Completed" />
                        </SimpleFormIterator>
                    </ArrayInput>
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Additional Information
                    </Typography>

                    <ArrayInput source="tags" label="Tags">
                        <SimpleFormIterator inline>
                            <TextInput source="" label="Tag" />
                        </SimpleFormIterator>
                    </ArrayInput>

                    <TextInput source="galleryLink" fullWidth label="Photo Gallery Link" type="url" />
                    <TextInput source="videoLink" fullWidth label="Video Link" type="url" />
                </CardContent>
            </Card>
        </SimpleForm>
    </Create>
);

export default ProjectCreate;
