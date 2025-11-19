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
    Tab,
    LinearProgress
} from '@mui/material';
import {
    CloudUpload,
    Delete,
    ContentCopy,
    Folder,
    Image as ImageIcon,
    Close
} from '@mui/icons-material';
import API_CONFIG from '../../config/api';

const MediaList = () => {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState('images');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
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
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Validate files
        const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
        if (invalidFiles.length > 0) {
            showSnackbar('Please select only image files', 'error');
            return;
        }

        const largeFiles = files.filter(file => file.size > 10 * 1024 * 1024);
        if (largeFiles.length > 0) {
            showSnackbar('Some files are larger than 10MB. Please choose smaller files.', 'error');
            return;
        }

        setSelectedFiles(files);
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        setUploadProgress(0);
        let uploadedCount = 0;

        try {
            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', selectedFolder);

                const response = await fetch(
                    API_CONFIG.getURL(API_CONFIG.endpoints.mediaUpload),
                    {
                        method: 'POST',
                        body: formData
                    }
                );

                if (!response.ok) throw new Error(`Upload failed for ${file.name}`);

                uploadedCount++;
                setUploadProgress(Math.round((uploadedCount / selectedFiles.length) * 100));
            }

            showSnackbar(`Successfully uploaded ${uploadedCount} image(s)!`, 'success');
            setUploadDialogOpen(false);
            setSelectedFiles([]);
            fetchMedia();
        } catch (error) {
            console.error('Error uploading files:', error);
            showSnackbar('Failed to upload some images. Please try again.', 'error');
        } finally {
            setUploading(false);
            setUploadProgress(0);
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
                    Upload Images
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
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Upload Images</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2 }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="file-upload"
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="file-upload">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<CloudUpload />}
                                fullWidth
                            >
                                Select Images (Multiple)
                            </Button>
                        </label>

                        {uploading && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Uploading images... {uploadProgress}%
                                </Typography>
                                <LinearProgress variant="determinate" value={uploadProgress} />
                            </Box>
                        )}

                        {selectedFiles.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Selected Files ({selectedFiles.length}):
                                </Typography>
                                <Grid container spacing={2}>
                                    {selectedFiles.map((file, index) => (
                                        <Grid item xs={6} sm={4} key={index}>
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    height="120"
                                                    image={URL.createObjectURL(file)}
                                                    alt={file.name}
                                                    sx={{ objectFit: 'cover' }}
                                                />
                                                <CardContent sx={{ p: 1 }}>
                                                    <Typography variant="caption" noWrap title={file.name}>
                                                        {file.name}
                                                    </Typography>
                                                    <Typography variant="caption" display="block" color="text.secondary">
                                                        {(file.size / 1024).toFixed(2)} KB
                                                    </Typography>
                                                </CardContent>
                                                <CardActions sx={{ p: 1 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRemoveFile(index)}
                                                        disabled={uploading}
                                                    >
                                                        <Close fontSize="small" />
                                                    </IconButton>
                                                </CardActions>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}

                        <Alert severity="info" sx={{ mt: 2 }}>
                            Maximum file size: 10MB per image. Supported formats: JPG, PNG, GIF, WebP
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
                        disabled={selectedFiles.length === 0 || uploading}
                        startIcon={uploading && <CircularProgress size={20} />}
                    >
                        {uploading ? `Uploading... ${uploadProgress}%` : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
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
