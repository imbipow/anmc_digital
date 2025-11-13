import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Card,
    CardMedia,
    CardActionArea,
    TextField,
    Box,
    Typography,
    CircularProgress,
    Tabs,
    Tab
} from '@mui/material';
import { ImageOutlined, LinkOutlined } from '@mui/icons-material';
import API_CONFIG from '../../config/api';
import cognitoAuthService from '../../services/cognitoAuth';

const ImageSelector = ({ open, onClose, onSelect, currentValue }) => {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(currentValue || '');
    const [manualUrl, setManualUrl] = useState(currentValue || '');
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        if (open) {
            loadMediaItems();
            setManualUrl(currentValue || '');
            setSelectedImage(currentValue || '');
        }
    }, [open, currentValue]);

    const loadMediaItems = async () => {
        setLoading(true);
        try {
            const token = await cognitoAuthService.getIdToken();

            // Load images from all folders
            const folders = ['images', 'news', 'events', 'projects'];
            const allImages = [];

            for (const folder of folders) {
                try {
                    const response = await fetch(API_CONFIG.getURL(`/media?folder=${folder}`), {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // Transform media items to have required fields
                        const folderImages = data.map(item => ({
                            id: item.key,
                            fileName: item.key.split('/').pop() || item.key,
                            folder: folder,
                            url: item.url,
                            mimeType: 'image/jpeg', // Assume images from this endpoint
                            ...item
                        }));
                        allImages.push(...folderImages);
                    }
                } catch (err) {
                    console.warn(`Could not load images from ${folder}:`, err);
                }
            }

            console.log('Media data loaded:', allImages.length, 'images from', folders.join(', '));
            setMediaItems(allImages);
        } catch (error) {
            console.error('Error loading media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    const handleConfirm = () => {
        const finalUrl = tabValue === 0 ? selectedImage : manualUrl;
        onSelect(finalUrl);
        onClose();
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Select Hero Image</DialogTitle>
            <DialogContent>
                <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tab icon={<ImageOutlined />} label="Media Library" />
                    <Tab icon={<LinkOutlined />} label="Custom URL" />
                </Tabs>

                {tabValue === 0 && (
                    <>
                        {loading ? (
                            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
                                <CircularProgress />
                            </Box>
                        ) : mediaItems.length === 0 ? (
                            <Box textAlign="center" py={4}>
                                <Typography variant="body1" color="text.secondary">
                                    No images found in media library
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Upload images in the Media Library section first
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                {mediaItems.map((item) => (
                                    <Grid item xs={6} sm={4} md={3} key={item.id}>
                                        <Card
                                            sx={{
                                                border: selectedImage === item.url ? '3px solid #1976d2' : '1px solid #e0e0e0',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <CardActionArea onClick={() => handleImageSelect(item.url)}>
                                                <CardMedia
                                                    component="img"
                                                    height="120"
                                                    image={item.url}
                                                    alt={item.fileName}
                                                    sx={{ objectFit: 'cover' }}
                                                />
                                                <Box p={1}>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            display: 'block',
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap',
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {item.fileName}
                                                    </Typography>
                                                    {item.folder && (
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                display: 'block',
                                                                color: 'text.secondary',
                                                                fontSize: '0.7rem'
                                                            }}
                                                        >
                                                            {item.folder}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </CardActionArea>
                                        </Card>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </>
                )}

                {tabValue === 1 && (
                    <Box sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Image URL"
                            value={manualUrl}
                            onChange={(e) => setManualUrl(e.target.value)}
                            placeholder="Enter image URL or path"
                            helperText="Enter a full URL (e.g., https://...) or local path (e.g., /images/hero.jpg)"
                            sx={{ mb: 2 }}
                        />
                        {manualUrl && (
                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Preview:
                                </Typography>
                                <img
                                    src={manualUrl}
                                    alt="Preview"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '300px',
                                        border: '1px solid #e0e0e0',
                                        borderRadius: '4px'
                                    }}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={tabValue === 0 ? !selectedImage : !manualUrl}
                >
                    Select Image
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ImageSelector;
