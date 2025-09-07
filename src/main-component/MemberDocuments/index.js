import React, { useState } from 'react';
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
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import ANMCHeader from '../../components/ANMCHeader';
import './style.css';

const MemberDocuments = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const memberDocuments = [
        {
            id: 'DOC001',
            title: 'Membership Certificate',
            type: 'Certificate',
            category: 'membership',
            size: '2.3 MB',
            format: 'PDF',
            uploadDate: '2024-01-15',
            validUntil: '2025-01-15',
            description: 'Official ANMC membership certificate with unique member ID and validity',
            icon: '🏆',
            color: '#1e3c72'
        },
        {
            id: 'DOC002',
            title: 'Member ID Card',
            type: 'ID Card',
            category: 'membership',
            size: '654 KB',
            format: 'PDF',
            uploadDate: '2024-01-15',
            validUntil: '2025-01-15',
            description: 'Digital member ID card for events and community activities',
            icon: '🆔',
            color: '#2a5298'
        },
        {
            id: 'DOC003',
            title: 'Donation Receipts 2024',
            type: 'Receipt',
            category: 'financial',
            size: '1.8 MB',
            format: 'PDF',
            uploadDate: '2024-02-20',
            validUntil: null,
            description: 'All donation receipts for tax purposes and 80G exemption certificates',
            icon: '🧾',
            color: '#1e3c72'
        },
        {
            id: 'DOC004',
            title: 'Service Booking History',
            type: 'Report',
            category: 'services',
            size: '945 KB',
            format: 'PDF',
            uploadDate: '2024-02-25',
            validUntil: null,
            description: 'Complete service booking history with payment details and receipts',
            icon: '📊',
            color: '#2a5298'
        },
        {
            id: 'DOC005',
            title: 'Event Participation Certificates',
            type: 'Certificate',
            category: 'events',
            size: '3.2 MB',
            format: 'ZIP',
            uploadDate: '2024-03-01',
            validUntil: null,
            description: 'Certificates from community events, workshops, and cultural programs',
            icon: '🎓',
            color: '#1e3c72'
        },
        {
            id: 'DOC006',
            title: 'Volunteer Hours Certificate',
            type: 'Certificate',
            category: 'volunteer',
            size: '756 KB',
            format: 'PDF',
            uploadDate: '2024-02-15',
            validUntil: '2024-12-31',
            description: 'Recognition certificate for community volunteer service hours',
            icon: '🤝',
            color: '#2a5298'
        },
        {
            id: 'DOC007',
            title: 'Community Guidelines & Handbook',
            type: 'Handbook',
            category: 'general',
            size: '4.1 MB',
            format: 'PDF',
            uploadDate: '2024-01-01',
            validUntil: null,
            description: 'ANMC community guidelines, rules, and member handbook',
            icon: '📘',
            color: '#1e3c72'
        },
        {
            id: 'DOC008',
            title: 'Insurance Certificate',
            type: 'Certificate',
            category: 'insurance',
            size: '890 KB',
            format: 'PDF',
            uploadDate: '2024-01-20',
            validUntil: '2025-01-19',
            description: 'Member insurance coverage certificate for community activities',
            icon: '🛡️',
            color: '#2a5298'
        }
    ];

    const handleDownloadDocument = (docId, title) => {
        // Simulate download process
        toast.success(`Downloading ${title}...`);
        
        // In a real application, this would trigger an actual file download
        setTimeout(() => {
            toast.info(`${title} downloaded successfully!`);
        }, 1500);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleFilterChange = (event) => {
        setFilterType(event.target.value);
    };

    const filteredDocuments = memberDocuments.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            doc.type.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterType === 'all' || doc.category === filterType;
        
        return matchesSearch && matchesFilter;
    });

    const getStatusChip = (doc) => {
        if (!doc.validUntil) {
            return <Chip label="Permanent" color="success" size="small" />;
        }
        
        const validDate = new Date(doc.validUntil);
        const today = new Date();
        const diffTime = validDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return <Chip label="Expired" color="error" size="small" />;
        } else if (diffDays < 30) {
            return <Chip label={`Expires in ${diffDays} days`} color="warning" size="small" />;
        } else {
            return <Chip label={`Valid until ${doc.validUntil}`} color="success" size="small" />;
        }
    };

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
                                                <MenuItem value="membership">Membership</MenuItem>
                                                <MenuItem value="financial">Financial</MenuItem>
                                                <MenuItem value="services">Services</MenuItem>
                                                <MenuItem value="events">Events</MenuItem>
                                                <MenuItem value="volunteer">Volunteer</MenuItem>
                                                <MenuItem value="insurance">Insurance</MenuItem>
                                                <MenuItem value="general">General</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h6" className="results-count">
                            {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} found
                        </Typography>
                    </Grid>

                    {filteredDocuments.map((document) => (
                        <Grid item xs={12} sm={6} lg={4} key={document.id}>
                            <Card className="document-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box className="document-header">
                                        <Box className="document-icon" style={{ backgroundColor: document.color }}>
                                            <Typography variant="h3" component="div">
                                                {document.icon}
                                            </Typography>
                                        </Box>
                                        {getStatusChip(document)}
                                    </Box>
                                    
                                    <Typography variant="h6" component="h3" className="document-title">
                                        {document.title}
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" className="document-description">
                                        {document.description}
                                    </Typography>
                                    
                                    <Box className="document-meta">
                                        <Grid container spacing={1}>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">
                                                    <strong>Type:</strong> {document.type}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">
                                                    <strong>Size:</strong> {document.size}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2">
                                                    <strong>Format:</strong> {document.format}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {document.uploadDate}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </CardContent>
                                
                                <CardActions className="document-actions">
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={() => handleDownloadDocument(document.id, document.title)}
                                        sx={{ 
                                            backgroundColor: document.color,
                                            '&:hover': { 
                                                backgroundColor: document.color === '#1e3c72' ? '#2a5298' : '#1e3c72'
                                            }
                                        }}
                                    >
                                        ⬇️ Download {document.format}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}

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
                                    If you can't find a specific document or need assistance with downloads, please contact our support team.
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        sx={{ borderColor: '#1e3c72', color: '#1e3c72' }}
                                    >
                                        📧 Email Support
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        sx={{ borderColor: '#1e3c72', color: '#1e3c72' }}
                                    >
                                        📞 Call Us
                                    </Button>
                                    <Button 
                                        variant="outlined" 
                                        size="small"
                                        sx={{ borderColor: '#1e3c72', color: '#1e3c72' }}
                                    >
                                        💬 Live Chat
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default MemberDocuments;