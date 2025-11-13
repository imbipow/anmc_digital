import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    CardActions,
    Grid,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
    Tabs,
    Tab
} from '@mui/material';
import {
    CloudUpload,
    Delete,
    ContentCopy,
    Folder,
    Image as ImageIcon
} from '@mui/icons-material';
import API_CONFIG from '../../config/api';

const MediaList = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState('images');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [currentTab, setCurrentTab] = useState(0);

    const folders = [
        { value: 'images', label: 'General Images' },
        { value: 'news', label: 'News Images' },
        { value: 'events', label: 'Events Images' },
        { value: 'projects', label: 'Projects Images' },
        { value: 'banners', label: 'Banners' }
    ];

    useEffect(() => {
        fetchMedia();
    }, [selectedFolder]);

    const fetchMedia = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                API_CONFIG.getURL(API_CONFIG.endpoints.mediaByFolder(selectedFolder))
            );
            const data = await response.json();
            setMedia(data);
        } catch (error) {
            console.error('Error fetching media:', error);
            showSnackbar('Failed to load media files', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showSnackbar('Please select an image file', 'error');
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                showSnackbar('File size must be less than 10MB', 'error');
                return;
            }

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder', selectedFolder);

        try {
            const response = await fetch(
                API_CONFIG.getURL(API_CONFIG.endpoints.mediaUpload),
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            showSnackbar('Image uploaded successfully!', 'success');
            setUploadDialogOpen(false);
            setSelectedFile(null);
            setPreviewUrl(null);
            fetchMedia();
        } catch (error) {
            console.error('Error uploading file:', error);
            showSnackbar('Failed to upload image', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (key) => {
        if (!window.confirm('Are you sure you want to delete this image?')) return;

        try {
            const response = await fetch(
                API_CONFIG.getURL(`/media/${encodeURIComponent(key)}`),
                { method: 'DELETE' }
            );

            if (!response.ok) throw new Error('Delete failed');

            showSnackbar('Image deleted successfully', 'success');
            fetchMedia();
        } catch (error) {
            console.error('Error deleting file:', error);
            showSnackbar('Failed to delete image', 'error');
        }
    };

    const handleCopyUrl = (url) => {
        navigator.clipboard.writeText(url);
        showSnackbar('URL copied to clipboard!', 'success');
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
        setSelectedFolder(folders[newValue].value);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Media Library</Typography>
                <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => setUploadDialogOpen(true)}
                >
                    Upload Image
                </Button>
            </Box>

            <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                {folders.map((folder, index) => (
                    <Tab key={folder.value} label={folder.label} icon={<Folder />} iconPosition="start" />
                ))}
            </Tabs>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : media.length === 0 ? (
                <Alert severity="info">
                    No images found in this folder. Upload your first image to get started!
                </Alert>
            ) : (
                <Grid container spacing={2}>
                    {media.map((item) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={item.key}>
                            <Card>
                                <CardMedia
                                    component="img"
                                    height="200"
                                    image={item.url}
                                    alt={item.key}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent>
                                    <Typography variant="body2" noWrap title={item.key}>
                                        {item.key.split('/').pop()}
                                    </Typography>
                                    <Chip
                                        icon={<ImageIcon />}
                                        label={item.key.split('.').pop().toUpperCase()}
                                        size="small"
                                        sx={{ mt: 1 }}
                                    />
                                </CardContent>
                                <CardActions>
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleCopyUrl(item.url)}
                                        title="Copy URL"
                                    >
                                        <ContentCopy fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(item.key)}
                                        title="Delete"
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Upload Dialog */}
            <Dialog
                open={uploadDialogOpen}
                onClose={() => !uploading && setUploadDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Upload Image</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="file-upload"
                            type="file"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="file-upload">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<CloudUpload />}
                                fullWidth
                            >
                                Select Image
                            </Button>
                        </label>

                        {previewUrl && (
                            <Box sx={{ mt: 2 }}>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    style={{ width: '100%', maxHeight: '300px', objectFit: 'contain' }}
                                />
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    {selectedFile?.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {(selectedFile?.size / 1024).toFixed(2)} KB
                                </Typography>
                            </Box>
                        )}

                        <Alert severity="info" sx={{ mt: 2 }}>
                            Maximum file size: 10MB. Supported formats: JPG, PNG, GIF, WebP
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={!selectedFile || uploading}
                        startIcon={uploading && <CircularProgress size={20} />}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MediaList;
