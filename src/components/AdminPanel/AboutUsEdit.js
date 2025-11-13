import React, { useState } from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    ArrayInput,
    SimpleFormIterator,
    TopToolbar,
    ListButton,
    ShowButton,
    DeleteButton,
    useInput
} from 'react-admin';
import { Card, CardContent, Typography, Box, Button, TextField } from '@mui/material';
import { Image as ImageIcon } from '@mui/icons-material';
import MediaGallerySelector from './MediaGallerySelector';

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

const MemberImageField = ({ source }) => {
    const { field } = useInput({ source });
    const [galleryOpen, setGalleryOpen] = useState(false);

    const handleSelectImage = (url) => {
        field.onChange(url);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                    fullWidth
                    label="Profile Image URL"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    error={!!field.error}
                    helperText={field.error?.message}
                />
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ImageIcon />}
                    onClick={() => setGalleryOpen(true)}
                    sx={{ minWidth: '160px' }}
                >
                    Select Image
                </Button>
            </Box>
            {field.value && (
                <Box sx={{ mt: 1 }}>
                    <img
                        src={field.value}
                        alt="Member"
                        style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }}
                    />
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

const AboutUsEdit = () => (
    <Edit actions={<EditActions />}>
        <SimpleForm>
            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Basic Information
                    </Typography>
                    <TextInput source="title" fullWidth required />
                    <TextInput source="subtitle" fullWidth required />
                    <FeaturedImageField />
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Mission, Vision & History
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#062265' }}>
                            Mission
                        </Typography>
                        <TextInput source="mission.title" fullWidth label="Mission Title" />
                        <TextInput source="mission.content" fullWidth multiline rows={4} label="Mission Content" />
                        <TextInput source="mission.icon" fullWidth label="Mission Icon (Font Awesome class)" helperText="e.g., fa fa-bullseye" />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#062265' }}>
                            Vision
                        </Typography>
                        <TextInput source="vision.title" fullWidth label="Vision Title" />
                        <TextInput source="vision.content" fullWidth multiline rows={4} label="Vision Content" />
                        <TextInput source="vision.icon" fullWidth label="Vision Icon (Font Awesome class)" helperText="e.g., fa fa-eye" />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600, color: '#062265' }}>
                            History
                        </Typography>
                        <TextInput source="history.title" fullWidth label="History Title" />
                        <TextInput source="history.content" fullWidth multiline rows={4} label="History Content" />
                        <TextInput source="history.icon" fullWidth label="History Icon (Font Awesome class)" helperText="e.g., fa fa-history" />
                    </Box>
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Values & Achievements
                    </Typography>

                    <ArrayInput source="values" label="Organizational Values">
                        <SimpleFormIterator inline>
                            <TextInput source="" label="Value" />
                        </SimpleFormIterator>
                    </ArrayInput>

                    <ArrayInput source="achievements" label="Key Achievements">
                        <SimpleFormIterator inline>
                            <TextInput source="" label="Achievement" />
                        </SimpleFormIterator>
                    </ArrayInput>
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Executive Committee
                    </Typography>

                    <TextInput source="executiveCommittee.title" fullWidth label="Committee Title" />
                    <TextInput source="executiveCommittee.subtitle" fullWidth multiline rows={2} label="Committee Subtitle" />

                    <ArrayInput source="executiveCommittee.members" label="Committee Members">
                        <SimpleFormIterator>
                            <TextInput source="name" fullWidth required label="Full Name" />
                            <TextInput source="title" fullWidth required label="Position Title" />
                            <TextInput source="position" fullWidth label="Position Category" />
                            <TextInput source="email" fullWidth label="Email Address" />
                            <TextInput source="phone" fullWidth label="Phone Number" />
                            <TextInput source="description" fullWidth multiline rows={3} label="Description" />
                            <MemberImageField source="image" />
                            <TextInput source="tenure" fullWidth label="Tenure Period" helperText="e.g., 2022-2024" />

                            <ArrayInput source="responsibilities" label="Key Responsibilities">
                                <SimpleFormIterator inline>
                                    <TextInput source="" label="Responsibility" />
                                </SimpleFormIterator>
                            </ArrayInput>
                        </SimpleFormIterator>
                    </ArrayInput>
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Governance Structure
                    </Typography>

                    <TextInput source="governance.title" fullWidth label="Governance Title" />
                    <TextInput source="governance.subtitle" fullWidth multiline rows={2} label="Governance Subtitle" />

                    <ArrayInput source="governance.structure" label="Governance Bodies">
                        <SimpleFormIterator>
                            <TextInput source="title" fullWidth required label="Body Title" />
                            <TextInput source="description" fullWidth multiline rows={4} label="Description" />
                            <TextInput source="icon" fullWidth label="Icon (Font Awesome class)" helperText="e.g., fa fa-gavel" />
                            <TextInput source="composition" fullWidth label="Composition" helperText="Who makes up this body" />
                            <TextInput source="meetingFrequency" fullWidth label="Meeting Frequency" />

                            <ArrayInput source="members" label="Members/Positions">
                                <SimpleFormIterator inline>
                                    <TextInput source="" label="Member/Position" />
                                </SimpleFormIterator>
                            </ArrayInput>

                            <ArrayInput source="responsibilities" label="Key Responsibilities">
                                <SimpleFormIterator inline>
                                    <TextInput source="" label="Responsibility" />
                                </SimpleFormIterator>
                            </ArrayInput>
                        </SimpleFormIterator>
                    </ArrayInput>
                </CardContent>
            </Card>

            <Card className="admin-content-card">
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Sub-Committees
                    </Typography>

                    <ArrayInput source="committees" label="Working Committees">
                        <SimpleFormIterator>
                            <TextInput source="name" fullWidth required label="Committee Name" />
                            <TextInput source="purpose" fullWidth multiline rows={2} label="Purpose & Objectives" />
                            <TextInput source="chairperson" fullWidth label="Chairperson" />
                            <TextInput source="members" fullWidth label="Number of Members" type="number" />
                            <TextInput source="meetingFrequency" fullWidth label="Meeting Frequency" />
                        </SimpleFormIterator>
                    </ArrayInput>
                </CardContent>
            </Card>
        </SimpleForm>
    </Edit>
);

export default AboutUsEdit;