import React, { useState } from 'react';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import ANMCHeader from '../../components/ANMCHeader';
import './style.css';

const MyBookings = () => {
    const [activeTab, setActiveTab] = useState(0);

    const bookingsData = [
        {
            id: 'BK001',
            service: 'Car Puja',
            icon: '🚗',
            date: '2024-03-15',
            time: '10:00 AM',
            status: 'confirmed',
            venue: 'Temple Premises',
            numberOfPeople: 5,
            amount: '₹2,100',
            paymentStatus: 'paid',
            specialRequirements: 'New car blessing ceremony',
            contactPerson: 'John Doe',
            contactPhone: '+91-9876543210',
            bookedOn: '2024-02-20'
        },
        {
            id: 'BK002',
            service: 'Marriage Ceremony',
            icon: '💒',
            date: '2024-04-20',
            time: '9:00 AM',
            status: 'pending',
            venue: 'Home Visit',
            numberOfPeople: 150,
            amount: '₹15,500',
            paymentStatus: 'pending',
            specialRequirements: 'Traditional wedding ceremony with full arrangements',
            contactPerson: 'Jane Smith',
            contactPhone: '+91-9876543211',
            bookedOn: '2024-02-25'
        },
        {
            id: 'BK003',
            service: 'Bartabhanda',
            icon: '👨‍👦',
            date: '2024-02-10',
            time: '8:00 AM',
            status: 'completed',
            venue: 'Temple Premises',
            numberOfPeople: 80,
            amount: '₹8,500',
            paymentStatus: 'paid',
            specialRequirements: 'Sacred thread ceremony for my son',
            contactPerson: 'John Doe',
            contactPhone: '+91-9876543210',
            bookedOn: '2024-01-15'
        }
    ];

    const memberDocuments = [
        {
            id: 'DOC001',
            title: 'Membership Certificate',
            type: 'Certificate',
            size: '2.3 MB',
            format: 'PDF',
            uploadDate: '2024-01-15',
            description: 'Official membership certificate'
        },
        {
            id: 'DOC002',
            title: 'Donation Receipts 2024',
            type: 'Receipt',
            size: '1.8 MB',
            format: 'PDF',
            uploadDate: '2024-02-20',
            description: 'All donation receipts for tax purposes'
        },
        {
            id: 'DOC003',
            title: 'Service Booking History',
            type: 'Report',
            size: '945 KB',
            format: 'PDF',
            uploadDate: '2024-02-25',
            description: 'Complete service booking history report'
        },
        {
            id: 'DOC004',
            title: 'Member ID Card',
            type: 'ID Card',
            size: '654 KB',
            format: 'PDF',
            uploadDate: '2024-01-15',
            description: 'Digital member ID card for events'
        }
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'success';
            case 'pending':
                return 'warning';
            case 'completed':
                return 'info';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'success';
            case 'pending':
                return 'warning';
            case 'failed':
                return 'error';
            default:
                return 'default';
        }
    };

    const handleDownloadReceipt = (bookingId) => {
        toast.success(`Downloading receipt for booking ${bookingId}...`);
    };

    const handleDownloadDocument = (docId, title) => {
        toast.success(`Downloading ${title}...`);
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const filteredBookings = () => {
        switch (activeTab) {
            case 0:
                return bookingsData;
            case 1:
                return bookingsData.filter(booking => booking.status === 'pending' || booking.status === 'confirmed');
            case 2:
                return bookingsData.filter(booking => booking.status === 'completed');
            default:
                return bookingsData;
        }
    };

    return (
        <div className="my-bookings-wrapper">
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
                                📋 My Bookings
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                View booking history, receipts and download member documents
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Card className="bookings-card">
                            <CardContent>
                                <Box className="bookings-tabs">
                                    <Tabs 
                                        value={activeTab} 
                                        onChange={handleTabChange}
                                        centered
                                        variant="fullWidth"
                                        sx={{
                                            borderBottom: 1,
                                            borderColor: 'divider',
                                            mb: 3
                                        }}
                                    >
                                        <Tab label="All Bookings" />
                                        <Tab label="Active" />
                                        <Tab label="Completed" />
                                        <Tab label="Documents" />
                                    </Tabs>
                                </Box>

                                {activeTab < 3 && (
                                    <Grid container spacing={3}>
                                        {filteredBookings().map((booking) => (
                                            <Grid item xs={12} key={booking.id}>
                                                <Card className="booking-item">
                                                    <CardContent>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={2} className="booking-icon-section">
                                                                <Box className="booking-icon">
                                                                    <Typography variant="h2" component="div">
                                                                        {booking.icon}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>

                                                            <Grid item xs={12} sm={7}>
                                                                <Box className="booking-details">
                                                                    <Box className="booking-header">
                                                                        <Typography variant="h6" component="h3">
                                                                            {booking.service}
                                                                        </Typography>
                                                                        <Chip 
                                                                            label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                                            color={getStatusColor(booking.status)}
                                                                            size="small"
                                                                        />
                                                                    </Box>
                                                                    
                                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                        Booking ID: {booking.id}
                                                                    </Typography>

                                                                    <Box className="booking-info">
                                                                        <Box className="info-item">
                                                                            <span style={{fontSize: '1rem'}}>📅</span>
                                                                            <Typography variant="body2">
                                                                                {booking.date} at {booking.time}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box className="info-item">
                                                                            <span style={{fontSize: '1rem'}}>📍</span>
                                                                            <Typography variant="body2">
                                                                                {booking.venue}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box className="info-item">
                                                                            <span style={{fontSize: '1rem'}}>👥</span>
                                                                            <Typography variant="body2">
                                                                                {booking.numberOfPeople} people
                                                                            </Typography>
                                                                        </Box>
                                                                    </Box>

                                                                    <Typography variant="body2" className="special-requirements">
                                                                        <strong>Requirements:</strong> {booking.specialRequirements}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>

                                                            <Grid item xs={12} sm={3} className="booking-payment">
                                                                <Box className="payment-info">
                                                                    <Typography variant="h6" color="primary" className="amount">
                                                                        {booking.amount}
                                                                    </Typography>
                                                                    <Chip 
                                                                        label={booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                                                                        color={getPaymentStatusColor(booking.paymentStatus)}
                                                                        size="small"
                                                                        className="payment-status"
                                                                    />
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Booked: {booking.bookedOn}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                    </CardContent>
                                                    <CardActions className="booking-actions">
                                                        {booking.paymentStatus === 'paid' && (
                                                            <Tooltip title="Download Receipt">
                                                                <IconButton
                                                                    color="primary"
                                                                    onClick={() => handleDownloadReceipt(booking.id)}
                                                                >
                                                                    📋
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                        {booking.status === 'pending' && (
                                                            <Button size="small" color="warning">
                                                                Modify Booking
                                                            </Button>
                                                        )}
                                                        <Button size="small" variant="outlined">
                                                            View Details
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        ))}
                                        
                                        {filteredBookings().length === 0 && (
                                            <Grid item xs={12}>
                                                <Box className="empty-state">
                                                    <Typography variant="h6" color="text.secondary">
                                                        No bookings found
                                                    </Typography>
                                                    <Button 
                                                        component={Link} 
                                                        to="/member/book-services"
                                                        variant="contained"
                                                        sx={{ mt: 2 }}
                                                    >
                                                        Book a Service
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        )}
                                    </Grid>
                                )}

                                {activeTab === 3 && (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Typography variant="h6" className="documents-title">
                                                Member Documents
                                            </Typography>
                                        </Grid>
                                        
                                        {memberDocuments.map((document) => (
                                            <Grid item xs={12} sm={6} md={4} key={document.id}>
                                                <Card className="document-card">
                                                    <CardContent>
                                                        <Box className="document-icon">
                                                            <Typography variant="h3" component="div">
                                                                📄
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="h6" component="h3" className="document-title">
                                                            {document.title}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" className="document-description">
                                                            {document.description}
                                                        </Typography>
                                                        <Box className="document-meta">
                                                            <Typography variant="body2">
                                                                <strong>Type:</strong> {document.type}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                <strong>Size:</strong> {document.size}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                <strong>Format:</strong> {document.format}
                                                            </Typography>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Uploaded: {document.uploadDate}
                                                            </Typography>
                                                        </Box>
                                                    </CardContent>
                                                    <CardActions className="document-actions">
                                                        <Button
                                                            variant="contained"
                                                            fullWidth
                                                            onClick={() => handleDownloadDocument(document.id, document.title)}
                                                            sx={{ backgroundColor: '#1e3c72', '&:hover': { backgroundColor: '#2a5298' } }}
                                                        >
                                                            ⬇️ Download
                                                        </Button>
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default MyBookings;