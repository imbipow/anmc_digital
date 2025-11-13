import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Typography,
    CircularProgress,
    Alert,
    Snackbar,
    Tabs,
    Tab
} from '@mui/material';
import {
    CloudUpload,
    Delete,
    Edit,
    Download,
    Visibility,
    VisibilityOff,
    Description as DocumentIcon
} from '@mui/icons-material';
import API_CONFIG from '../../config/api';
import cognitoAuthService from '../../services/cognitoAuth';

// Helper function to make authenticated API calls
const authenticatedFetch = async (url, options = {}) => {
    try {
        const token = await cognitoAuthService.getIdToken();
        const headers = {
            ...(options.headers || {}),
        };
        // Don't add Content-Type for FormData (browser sets it automatically with boundary)
        if (!(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
    } catch (error) {
        console.error('Auth fetch error:', error);
        throw error;
    }
};

const DocumentList = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [currentTab, setCurrentTab] = useState(0);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'general',
        visibility: 'members'
    });

    const categories = [
        { value: 'general', label: 'General' },
        { value: 'policies', label: 'Policies' },
        { value: 'forms', label: 'Forms' },
        { value: 'reports', label: 'Reports' },
        { value: 'minutes', label: 'Meeting Minutes' },
        { value: 'newsletters', label: 'Newsletters' }
    ];

    const visibilityOptions = [
        { value: 'members', label: 'Members Only' },
        { value: 'public', label: 'Public' },
        { value: 'admin', label: 'Admin Only' }
    ];

    useEffect(() => {
        fetchDocuments();
    }, [currentTab]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            // Tab 0 is "All Documents", tabs 1+ are categories
            // So we need to subtract 1 from currentTab to get the category index
            const isAllDocuments = currentTab === 0;
            const category = isAllDocuments ? null : categories[currentTab - 1]?.value;

            const endpoint = isAllDocuments
                ? API_CONFIG.endpoints.documents
                : API_CONFIG.endpoints.documentsByCategory(category);

            const response = await authenticatedFetch(API_CONFIG.getURL(endpoint));
            const data = await response.json();
            setDocuments(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        } catch (error) {
            console.error('Error fetching documents:', error);
            showSnackbar('Failed to load documents', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file size (max 50MB for documents)
            if (file.size > 50 * 1024 * 1024) {
                showSnackbar('File size must be less than 50MB', 'error');
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !formData.title) {
            showSnackbar('Please fill in all required fields', 'error');
            return;
        }

        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', selectedFile);
        uploadFormData.append('title', formData.title);
        uploadFormData.append('description', formData.description);
        uploadFormData.append('category', formData.category);
        uploadFormData.append('visibility', formData.visibility);

        try {
            const response = await authenticatedFetch(
                API_CONFIG.getURL(API_CONFIG.endpoints.documentsUpload),
                {
                    method: 'POST',
                    body: uploadFormData
                }
            );

            if (!response.ok) throw new Error('Upload failed');

            const result = await response.json();
            showSnackbar('Document uploaded successfully!', 'success');
            setUploadDialogOpen(false);
            resetForm();
            fetchDocuments();
        } catch (error) {
            console.error('Error uploading document:', error);
            showSnackbar('Failed to upload document', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleEdit = (document) => {
        setSelectedDocument(document);
        setFormData({
            title: document.title,
            description: document.description || '',
            category: document.category,
            visibility: document.visibility
        });
        setEditDialogOpen(true);
    };

    const handleUpdate = async () => {
        if (!selectedDocument) return;

        try {
            const response = await authenticatedFetch(
                API_CONFIG.getURL(`${API_CONFIG.endpoints.documents}/${selectedDocument.id}`),
                {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                }
            );

            if (!response.ok) throw new Error('Update failed');

            showSnackbar('Document updated successfully!', 'success');
            setEditDialogOpen(false);
            resetForm();
            fetchDocuments();
        } catch (error) {
            console.error('Error updating document:', error);
            showSnackbar('Failed to update document', 'error');
        }
    };

    const handleDelete = async (id, s3Key) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            const response = await authenticatedFetch(
                API_CONFIG.getURL(`${API_CONFIG.endpoints.documents}/${id}`),
                { method: 'DELETE' }
            );

            if (!response.ok) throw new Error('Delete failed');

            showSnackbar('Document deleted successfully', 'success');
            fetchDocuments();
        } catch (error) {
            console.error('Error deleting document:', error);
            showSnackbar('Failed to delete document', 'error');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            category: 'general',
            visibility: 'members'
        });
        setSelectedFile(null);
        setSelectedDocument(null);
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleTabChange = (event, newValue) => {
        setCurrentTab(newValue);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const getVisibilityIcon = (visibility) => {
        return visibility === 'public' ? <Visibility /> : <VisibilityOff />;
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">Documents</Typography>
                <Button
                    variant="contained"
                    startIcon={<CloudUpload />}
                    onClick={() => setUploadDialogOpen(true)}
                >
                    Upload Document
                </Button>
            </Box>

            <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab label="All Documents" />
                {categories.map((category) => (
                    <Tab key={category.value} label={category.label} />
                ))}
            </Tabs>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress />
                </Box>
            ) : documents.length === 0 ? (
                <Alert severity="info">
                    No documents found. Upload your first document to get started!
                </Alert>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Visibility</TableCell>
                                <TableCell>File</TableCell>
                                <TableCell>Size</TableCell>
                                <TableCell>Uploaded</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell>{doc.title}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                                            {doc.description || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={doc.category} size="small" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            icon={getVisibilityIcon(doc.visibility)}
                                            label={doc.visibility}
                                            size="small"
                                            color={doc.visibility === 'public' ? 'success' : 'default'}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>
                                            {doc.fileName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                                    <TableCell>
                                        {new Date(doc.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => window.open(doc.url, '_blank')}
                                            title="Download"
                                        >
                                            <Download fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleEdit(doc)}
                                            title="Edit"
                                        >
                                            <Edit fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(doc.id, doc.s3Key)}
                                            title="Delete"
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Upload Dialog */}
            <Dialog
                open={uploadDialogOpen}
                onClose={() => !uploading && setUploadDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Upload Document</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            multiline
                            rows={3}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                label="Category"
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Visibility</InputLabel>
                            <Select
                                value={formData.visibility}
                                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                label="Visibility"
                            >
                                {visibilityOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <input
                            accept="*/*"
                            style={{ display: 'none' }}
                            id="document-upload"
                            type="file"
                            onChange={handleFileSelect}
                        />
                        <label htmlFor="document-upload">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<DocumentIcon />}
                                fullWidth
                            >
                                {selectedFile ? selectedFile.name : 'Select Document'}
                            </Button>
                        </label>

                        {selectedFile && (
                            <Alert severity="success">
                                File selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                            </Alert>
                        )}

                        <Alert severity="info">
                            Maximum file size: 50MB. All file types supported.
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setUploadDialogOpen(false); resetForm(); }} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        variant="contained"
                        disabled={!selectedFile || !formData.title || uploading}
                        startIcon={uploading && <CircularProgress size={20} />}
                    >
                        {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Edit Document</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            fullWidth
                        />
                        <TextField
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            multiline
                            rows={3}
                            fullWidth
                        />
                        <FormControl fullWidth>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                label="Category"
                            >
                                {categories.map((cat) => (
                                    <MenuItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel>Visibility</InputLabel>
                            <Select
                                value={formData.visibility}
                                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                label="Visibility"
                            >
                                {visibilityOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => { setEditDialogOpen(false); resetForm(); }}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate} variant="contained">
                        Update
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

export default DocumentList;
