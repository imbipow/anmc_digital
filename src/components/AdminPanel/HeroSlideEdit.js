import React, { useState } from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    NumberInput,
    BooleanInput,
    TopToolbar,
    ListButton,
    required,
    useRecordContext
} from 'react-admin';
import { Card, CardContent, Typography, Grid, Button, Box } from '@mui/material';
import { ImageOutlined } from '@mui/icons-material';
import ImageSelector from './ImageSelector';

const EditActions = () => (
    <TopToolbar>
        <ListButton />
    </TopToolbar>
);

const ImageInputWithSelector = ({ source, label, helperText }) => {
    const [open, setOpen] = useState(false);
    const record = useRecordContext();
    const [imageUrl, setImageUrl] = useState(record?.[source] || '');

    const handleImageSelect = (url) => {
        setImageUrl(url);
        // Update the form value
        const input = document.querySelector(`input[name="${source}"]`);
        if (input) {
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLInputElement.prototype,
                'value'
            ).set;
            nativeInputValueSetter.call(input, url);
            const event = new Event('input', { bubbles: true });
            input.dispatchEvent(event);
        }
    };

    return (
        <Box>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                    <TextInput
                        source={source}
                        label={label}
                        fullWidth
                        helperText={helperText}
                        defaultValue={imageUrl}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <Button
                        variant="outlined"
                        startIcon={<ImageOutlined />}
                        onClick={() => setOpen(true)}
                        fullWidth
                    >
                        Select from Media
                    </Button>
                </Grid>
            </Grid>
            {imageUrl && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="caption" display="block" gutterBottom>
                        Preview:
                    </Typography>
                    <img
                        src={imageUrl}
                        alt="Preview"
                        style={{
                            maxWidth: '300px',
                            maxHeight: '200px',
                            border: '1px solid #e0e0e0',
                            borderRadius: '4px'
                        }}
                    />
                </Box>
            )}
            <ImageSelector
                open={open}
                onClose={() => setOpen(false)}
                onSelect={handleImageSelect}
                currentValue={imageUrl}
            />
        </Box>
    );
};

const HeroSlideEdit = () => (
    <Edit actions={<EditActions />}>
        <SimpleForm>
            <Card className="admin-content-card" style={{ width: '100%', marginBottom: '20px' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Basic Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <NumberInput
                                source="order"
                                label="Display Order"
                                helperText="Lower numbers appear first"
                                defaultValue={0}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <BooleanInput
                                source="active"
                                label="Active"
                                defaultValue={true}
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card className="admin-content-card" style={{ width: '100%', marginBottom: '20px' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Slide Content
                    </Typography>
                    <TextInput
                        source="welcomeText"
                        label="Welcome Text"
                        fullWidth
                        helperText="Small text above the title"
                    />
                    <TextInput
                        source="title"
                        label="Main Title"
                        fullWidth
                        validate={[required()]}
                    />
                    <TextInput
                        source="subtitle"
                        label="Subtitle / Description"
                        fullWidth
                        multiline
                        rows={4}
                        helperText="Brief description below the title"
                    />
                </CardContent>
            </Card>

            <Card className="admin-content-card" style={{ width: '100%', marginBottom: '20px' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Image
                    </Typography>
                    <ImageInputWithSelector
                        source="imageUrl"
                        label="Image URL"
                        helperText="Click 'Select from Media' to choose from uploaded images, or enter a URL manually"
                    />
                </CardContent>
            </Card>

            <Card className="admin-content-card" style={{ width: '100%', marginBottom: '20px' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Primary Button
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="buttonText"
                                label="Button Text"
                                fullWidth
                                helperText="Text on the primary button"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="buttonLink"
                                label="Button Link"
                                fullWidth
                                helperText="Where the button links to (e.g., /about)"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card className="admin-content-card" style={{ width: '100%' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Secondary Button (Optional)
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="secondaryButtonText"
                                label="Secondary Button Text"
                                fullWidth
                                helperText="Text on the secondary button"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextInput
                                source="secondaryButtonLink"
                                label="Secondary Button Link"
                                fullWidth
                                helperText="Where the secondary button links to"
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </SimpleForm>
    </Edit>
);

export default HeroSlideEdit;
