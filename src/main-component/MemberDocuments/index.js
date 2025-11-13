import React, { useState, useEffect } from 'react';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import ANMCHeader from '../../components/ANMCHeader';
import API_CONFIG from '../../config/api';
import cognitoAuthService from '../../services/cognitoAuth';
import './style.css';

// Helper function to make authenticated API calls
const authenticatedFetch = async (url, options = {}) => {
    try {
        const token = await cognitoAuthService.getIdToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
    } catch (error) {
        console.error('Auth fetch error:', error);
        throw error;
    }
};

const MemberDocuments = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            // Fetch documents with visibility set to 'members' or 'public'
            const response = await authenticatedFetch(
                API_CONFIG.getURL(API_CONFIG.endpoints.documentsByVisibility('members'))
            );
            const data = await response.json();
            setDocuments(data);
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadDocument = (url, title) => {
        toast.success(`Downloading ${title}...`);
        // Open document URL in new tab (actual download)
        window.open(url, '_blank');
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const getDocumentIcon = (category) => {
        const icons = {
            general: '📘',
            policies: '📋',
            forms: '📝',
            reports: '📊',
            minutes: '📅',
            newsletters: '📰',
            membership: '🏆',
            financial: '🧾',
            services: '📊',
            events: '🎓',
            volunteer: '🤝',
            insurance: '🛡️'
        };
        return icons[category] || '📄';
    };

    const getDocumentColor = (index) => {
        const colors = ['#1e3c72', '#2a5298'];
        return colors[index % colors.length];
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (event) => {
        setFilterType(event.target.value);
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                            doc.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterType === 'all' || doc.category === filterType;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="member-documents-wrapper">
            <ANMCHeader />
            
            <div className="container">
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box className="page-header">
                            <Button 
                                component={Link} 
                                to="/member-portal"
                                className="back-button"
                                sx={{ 
                                    backgroundColor: '#1e3c72',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#2a5298'
                                    }
                                }}
                            >
                                ← Back to Portal
                            </Button>
                            <Typography variant="h4" component="h1">
                                📄 Member Documents
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Download your membership certificates, receipts, and important documents
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Card className="search-filter-card">
                            <CardContent>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={8}>
                                        <TextField
                                            fullWidth
                                            label="Search Documents"
                                            variant="outlined"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            placeholder="Search by document name, type, or description..."
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        🔍
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth>
                                            <InputLabel>Filter by Category</InputLabel>
                                            <Select
                                                value={filterType}
                                                onChange={handleFilterChange}
                                                label="Filter by Category"
                                            >
                                                <MenuItem value="all">All Documents</MenuItem>
                                                <MenuItem value="general">General</MenuItem>
                                                <MenuItem value="policies">Policies</MenuItem>
                                                <MenuItem value="forms">Forms</MenuItem>
                                                <MenuItem value="reports">Reports</MenuItem>
                                                <MenuItem value="minutes">Meeting Minutes</MenuItem>
                                                <MenuItem value="newsletters">Newsletters</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    {loading ? (
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                                <CircularProgress />
                            </Box>
                        </Grid>
                    ) : (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="h6" className="results-count">
                                    {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
                                </Typography>
                            </Grid>

                            {filteredDocuments.map((document, index) => {
                                const color = getDocumentColor(index);
                                const icon = getDocumentIcon(document.category);
                                const fileExtension = document.fileType?.split('/').pop()?.toUpperCase() || 'FILE';

                                return (
                                    <Grid item xs={12} sm={6} lg={4} key={document.id}>
                                        <Card className="document-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Box className="document-header">
                                                    <Box className="document-icon" style={{ backgroundColor: color }}>
                                                        <Typography variant="h3" component="div">
                                                            {icon}
                                                        </Typography>
                                                    </Box>
                                                    <Chip label={document.category} color="primary" size="small" />
                                                </Box>

                                                <Typography variant="h6" component="h3" className="document-title">
                                                    {document.title}
                                                </Typography>

                                                <Typography variant="body2" color="text.secondary" className="document-description">
                                                    {document.description || 'No description available'}
                                                </Typography>

                                                <Box className="document-meta">
                                                    <Grid container spacing={1}>
                                                        <Grid item xs={6}>
                                                            <Typography variant="body2">
                                                                <strong>File:</strong> {document.fileName}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="body2">
                                                                <strong>Size:</strong> {formatFileSize(document.fileSize)}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="body2">
                                                                <strong>Type:</strong> {fileExtension}
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Typography variant="body2" color="text.secondary">
                                                                {new Date(document.createdAt).toLocaleDateString()}
                                                            </Typography>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            </CardContent>

                                            <CardActions className="document-actions">
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    onClick={() => handleDownloadDocument(document.url, document.title)}
                                                    sx={{
                                                        backgroundColor: color,
                                                        '&:hover': {
                                                            backgroundColor: color === '#1e3c72' ? '#2a5298' : '#1e3c72'
                                                        }
                                                    }}
                                                >
                                                    ⬇️ Download
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </>
                    )}

                    {filteredDocuments.length === 0 && (
                        <Grid item xs={12}>
                            <Box className="empty-state">
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    📭 No documents found
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Try adjusting your search terms or filter criteria.
                                </Typography>
                                <Button 
                                    onClick={() => {
                                        setSearchTerm('');
                                        setFilterType('all');
                                    }}
                                    sx={{ mt: 2, color: '#1e3c72' }}
                                >
                                    Clear Filters
                                </Button>
                            </Box>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <Card className="help-card">
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    📞 Need Help?
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    If you can't find a specific document or need assistance with downloads, please contact our support team support@anmcinc.org.au.
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default MemberDocuments;