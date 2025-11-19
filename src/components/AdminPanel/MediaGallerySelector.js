import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    Card,
    CardMedia,
    CardActions,
    IconButton,
    Tabs,
    Tab,
    Box,
    Typography,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    LinearProgress
} from '@mui/material';
import {
    CheckCircle,
    Folder,
    Search,
    Refresh,
    CloudUpload
} from '@mui/icons-material';
import API_CONFIG from '../../config/api';

const MediaGallerySelector = ({ open, onClose, onSelect, currentImage }) => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(currentImage || null);
    const [currentTab, setCurrentTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);

    const folders = [
        { value: 'images', label: 'General Images' },
        { value: 'news', label: 'News Images' },
        { value: 'events', label: 'Events Images' },
        { value: 'projects', label: 'Projects Images' },
        { value: 'banners', label: 'Banners' }
    ];

    useEffect(() => {
        if (open) {
            fetchMedia();
        }
    }, [open, currentTab]);

    useEffect(() => {
        if (currentImage) {
            setSelectedImage(currentImage);
        }
    }, [currentImage]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const folder = folders[currentTab].value;
            const response = await fetch(
                API_CONFIG.getURL(API_CONFIG.endpoints.mediaByFolder(folder))
            );
            const data = await response.json();
            setMedia(data);
        } catch (error) {
            console.error('Error fetching media:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const handleSelectImage = (image) => {
        setSelectedImage(image.url);
    };

    const handleConfirm = () => {
        if (selectedImage) {
            onSelect(selectedImage);
            onClose();
        }
    };

    const handleClose = () => {
        setSelectedImage(currentImage);
        onClose();
    };

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Validate files
        const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
        if (invalidFiles.length > 0) {
            alert('Please select only image files');
            return;
        }

        const largeFiles = files.filter(file => file.size > 10 * 1024 * 1024);
        if (largeFiles.length > 0) {
            alert('Some files are larger than 10MB. Please choose smaller files.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const folder = folders[currentTab].value;
            let uploadedCount = 0;

            for (const file of files) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', folder);

                const response = await fetch(
                    API_CONFIG.getURL(API_CONFIG.endpoints.mediaUpload),
                    {
                        method: 'POST',
                        body: formData
                    }
                );

                if (!response.ok) throw new Error(`Upload failed for ${file.name}`);

                uploadedCount++;
                setUploadProgress(Math.round((uploadedCount / files.length) * 100));
            }

            alert(`Successfully uploaded ${uploadedCount} image(s)!`);
            fetchMedia();
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Failed to upload some images. Please try again.');
        } finally {
            setUploading(false);
            setUploadProgress(0);
            // Reset file input
            event.target.value = '';
        }
    };

    const filteredMedia = media.filter(item => {
        if (!searchTerm) return true;
        return item.key.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
            <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Select Image from Gallery</Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<CloudUpload />}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                        >
                            Upload Images
                        </Button>
                        <IconButton onClick={fetchMedia} size="small" title="Refresh">
                            <Refresh />
                        </IconButton>
                    </Box>
                </Box>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                />
            </DialogTitle>
            <DialogContent>
                {uploading && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Uploading images... {uploadProgress}%
                        </Typography>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                    </Box>
                )}

                <Box sx={{ mb: 2 }}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search images..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search />
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>

                <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                    {folders.map((folder, index) => (
                        <Tab
                            key={folder.value}
                            label={folder.label}
                            icon={<Folder />}
                            iconPosition="start"
                        />
                    ))}
                </Tabs>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : filteredMedia.length === 0 ? (
                    <Alert severity="info">
                        No images found in this folder. Upload images in Media Library first.
                    </Alert>
                ) : (
                    <Grid container spacing={2} sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                        {filteredMedia.map((item) => (
                            <Grid item xs={6} sm={4} md={3} key={item.key}>
                                <Card
                                    sx={{
                                        position: 'relative',
                                        cursor: 'pointer',
                                        border: selectedImage === item.url ? '3px solid #1976d2' : '1px solid #e0e0e0',
                                        '&:hover': {
                                            boxShadow: 3
                                        }
                                    }}
                                    onClick={() => handleSelectImage(item)}
                                >
                                    <CardMedia
                                        component="img"
                                        height="150"
                                        image={item.url}
                                        alt={item.key}
                                        sx={{ objectFit: 'cover' }}
                                    />
                                    {selectedImage === item.url && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                                borderRadius: '50%'
                                            }}
                                        >
                                            <CheckCircle color="primary" />
                                        </Box>
                                    )}
                                    <CardActions sx={{ p: 1 }}>
                                        <Typography variant="caption" noWrap sx={{ width: '100%' }}>
                                            {item.key.split('/').pop()}
                                        </Typography>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {selectedImage && (
                    <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            Selected Image:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <img
                                src={selectedImage}
                                alt="Selected"
                                style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'cover' }}
                            />
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                {selectedImage}
                            </Typography>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={!selectedImage}
                >
                    Use Selected Image
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default MediaGallerySelector;
