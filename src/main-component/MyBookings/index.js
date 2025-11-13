import React, { useState, useEffect } from 'react';
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
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import ANMCHeader from '../../components/ANMCHeader';
import PaymentForm from '../../components/PaymentForm';
import API_CONFIG from '../../config/api';
import cognitoAuthService from '../../services/cognitoAuth';
import './style.css';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Helper function to make authenticated API calls
const authenticatedFetch = async (url, options = {}) => {
    try {
        const token = await cognitoAuthService.getIdToken();
        console.log('🔐 [MyBookings] Auth token:', token ? 'Token retrieved' : 'No token');
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('✅ [MyBookings] Auth header added:', url);
        } else {
            console.warn('⚠️ [MyBookings] No token for:', url);
        }
        return fetch(url, { ...options, headers });
    } catch (error) {
        console.error('❌ [MyBookings] Auth fetch error:', error);
        throw error;
    }
};

const MyBookings = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
    const [paymentBooking, setPaymentBooking] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [processingPayment, setProcessingPayment] = useState(false);

    useEffect(() => {
        initializeComponent();
    }, []);

    const initializeComponent = async () => {
        try {
            const user = await cognitoAuthService.getCurrentUser();
            setCurrentUser(user);

            if (user && user.email) {
                await fetchBookings(user.email);
            }
        } catch (error) {
            console.error('Error initializing:', error);
            toast.error('Failed to load user information');
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async (email) => {
        try {
            const response = await authenticatedFetch(
                API_CONFIG.getURL(API_CONFIG.endpoints.bookings) + `?memberEmail=${email}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch bookings');
            }

            const data = await response.json();
            // Sort by date descending (most recent first)
            const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setBookings(sorted);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Failed to load bookings');
        }
    };

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
            case 'unpaid':
                return 'warning';
            case 'failed':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-AU', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${period}`;
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const filteredBookings = () => {
        switch (activeTab) {
            case 0:
                return bookings;
            case 1:
                return bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
            case 2:
                return bookings.filter(b => b.status === 'completed');
            case 3:
                return bookings.filter(b => b.status === 'cancelled');
            default:
                return bookings;
        }
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setDetailsDialogOpen(true);
    };

    const handleCancelClick = (booking) => {
        setSelectedBooking(booking);
        setCancelDialogOpen(true);
    };

    const handleCancelBooking = async () => {
        if (!selectedBooking) return;

        setCancelling(true);
        try {
            const response = await fetch(
                API_CONFIG.getURL(API_CONFIG.endpoints.bookings) + `/${selectedBooking.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: 'cancelled'
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to cancel booking');
            }

            toast.success('Booking cancelled successfully');
            setCancelDialogOpen(false);

            // Refresh bookings
            if (currentUser && currentUser.email) {
                await fetchBookings(currentUser.email);
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            toast.error('Failed to cancel booking. Please contact admin.');
        } finally {
            setCancelling(false);
        }
    };

    const handleRetryPayment = async (booking) => {
        try {
            setProcessingPayment(true);

            // Use authenticatedFetch instead of plain fetch to include auth headers
            const response = await authenticatedFetch(
                API_CONFIG.getURL(API_CONFIG.endpoints.bookings) + '/create-payment-intent',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        bookingId: booking.id,
                        amount: booking.totalAmount
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to create payment');
            }

            const { clientSecret: secret } = await response.json();

            // Open payment dialog with the booking and client secret
            setPaymentBooking(booking);
            setClientSecret(secret);
            setPaymentDialogOpen(true);
            setProcessingPayment(false);
        } catch (error) {
            console.error('Error creating payment:', error);
            toast.error(error.message || 'Failed to initiate payment. Please try again.');
            setProcessingPayment(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntent) => {
        try {
            // Update booking with payment status
            const response = await authenticatedFetch(
                API_CONFIG.getURL(API_CONFIG.endpoints.bookings) + `/${paymentBooking.id}`,
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        paymentStatus: 'paid',
                        paymentIntentId: paymentIntent.id,
                        paidAt: new Date().toISOString(),
                        status: 'confirmed'
                    })
                }
            );

            if (response.ok) {
                toast.success('Payment successful! Your booking is confirmed.');

                // Close dialog and refresh bookings
                setPaymentDialogOpen(false);
                setClientSecret(null);
                setPaymentBooking(null);

                // Refresh bookings list
                if (currentUser && currentUser.email) {
                    await fetchBookings(currentUser.email);
                }
            } else {
                throw new Error('Failed to update booking status');
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            toast.error('Payment succeeded but failed to update booking. Please contact admin.');
        }
    };

    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        toast.error('Payment failed. Please try again.');
    };

    const handleClosePaymentDialog = () => {
        setPaymentDialogOpen(false);
        setClientSecret(null);
        setPaymentBooking(null);
    };

    const canCancelBooking = (booking) => {
        if (booking.status === 'cancelled' || booking.status === 'completed') {
            return false;
        }

        // Can cancel if booking date is more than 48 hours away
        const bookingDate = new Date(booking.preferredDate);
        const now = new Date();
        const hoursDiff = (bookingDate - now) / (1000 * 60 * 60);

        return hoursDiff > 48;
    };

    if (loading) {
        return (
            <div className="my-bookings-wrapper">
                <ANMCHeader />
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <CircularProgress />
                </Box>
            </div>
        );
    }

    return (
        <div className="my-bookings-wrapper">
            <ANMCHeader />

            <div className="container" style={{ padding: '40px 20px' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box className="page-header" sx={{ mb: 4 }}>
                            <Button
                                component={Link}
                                to="/member-portal"
                                className="back-button"
                                sx={{
                                    backgroundColor: '#1e3c72',
                                    color: 'white',
                                    mb: 2,
                                    '&:hover': {
                                        backgroundColor: '#2a5298'
                                    }
                                }}
                            >
                                ← Back to Portal
                            </Button>
                            <Typography variant="h4" component="h1" gutterBottom>
                                My Bookings
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Manage your service bookings and view booking history
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
                                        variant="fullWidth"
                                        sx={{
                                            borderBottom: 1,
                                            borderColor: 'divider',
                                            mb: 3
                                        }}
                                    >
                                        <Tab label={`All (${bookings.length})`} />
                                        <Tab label={`Active (${bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length})`} />
                                        <Tab label={`Completed (${bookings.filter(b => b.status === 'completed').length})`} />
                                        <Tab label={`Cancelled (${bookings.filter(b => b.status === 'cancelled').length})`} />
                                    </Tabs>
                                </Box>

                                <Grid container spacing={3}>
                                    {filteredBookings().map((booking) => {
                                        const serviceName = booking.serviceName
                                            ? (booking.serviceName.match(/^([^:\/\(]+)/) || [])[1]?.trim() || booking.serviceName
                                            : 'Service';

                                        return (
                                            <Grid item xs={12} key={booking.id}>
                                                <Card
                                                    className="booking-item"
                                                    sx={{
                                                        border: booking.paymentStatus === 'unpaid' ? '2px solid #ff9800' : '1px solid #e0e0e0',
                                                        boxShadow: booking.paymentStatus === 'unpaid' ? '0 2px 8px rgba(255,152,0,0.2)' : 1
                                                    }}
                                                >
                                                    <CardContent>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} sm={8}>
                                                                <Box className="booking-details">
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                                        <Typography variant="h6" component="h3">
                                                                            {serviceName}
                                                                        </Typography>
                                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                                            <Chip
                                                                                label={booking.status.toUpperCase()}
                                                                                color={getStatusColor(booking.status)}
                                                                                size="small"
                                                                            />
                                                                            <Chip
                                                                                label={booking.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                                                                                color={getPaymentStatusColor(booking.paymentStatus)}
                                                                                size="small"
                                                                            />
                                                                        </Box>
                                                                    </Box>

                                                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                                                        Booking ID: {booking.id}
                                                                    </Typography>

                                                                    <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                            <Typography variant="body2">📅</Typography>
                                                                            <Typography variant="body2">
                                                                                {formatDate(booking.preferredDate)}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                            <Typography variant="body2">🕐</Typography>
                                                                            <Typography variant="body2">
                                                                                {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                                            </Typography>
                                                                        </Box>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                            <Typography variant="body2">👥</Typography>
                                                                            <Typography variant="body2">
                                                                                {booking.numberOfPeople} people
                                                                            </Typography>
                                                                        </Box>
                                                                        {booking.venue && (
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                <Typography variant="body2">📍</Typography>
                                                                                <Typography variant="body2">
                                                                                    {booking.venue}
                                                                                </Typography>
                                                                            </Box>
                                                                        )}
                                                                    </Box>

                                                                    {booking.paymentStatus === 'unpaid' && (
                                                                        <Alert severity="warning" sx={{ mt: 2 }}>
                                                                            Payment pending - Please complete payment to confirm your booking
                                                                        </Alert>
                                                                    )}
                                                                </Box>
                                                            </Grid>

                                                            <Grid item xs={12} sm={4}>
                                                                <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                                                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                                                                        ${booking.totalAmount.toFixed(2)}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary">
                                                                        Booked: {formatDate(booking.createdAt)}
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                    </CardContent>
                                                    <CardActions sx={{ justifyContent: 'flex-end', gap: 1, px: 2, pb: 2 }}>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            onClick={() => handleViewDetails(booking)}
                                                        >
                                                            View Details
                                                        </Button>

                                                        {booking.paymentStatus === 'unpaid' && booking.status !== 'cancelled' && (
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="warning"
                                                                onClick={() => handleRetryPayment(booking)}
                                                                disabled={processingPayment}
                                                            >
                                                                {processingPayment ? <CircularProgress size={20} color="inherit" /> : 'Pay Now'}
                                                            </Button>
                                                        )}

                                                        {canCancelBooking(booking) && (
                                                            <Button
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleCancelClick(booking)}
                                                            >
                                                                Cancel Booking
                                                            </Button>
                                                        )}
                                                    </CardActions>
                                                </Card>
                                            </Grid>
                                        );
                                    })}

                                    {filteredBookings().length === 0 && (
                                        <Grid item xs={12}>
                                            <Box sx={{ textAlign: 'center', py: 5 }}>
                                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                                    No bookings found
                                                </Typography>
                                                <Button
                                                    component={Link}
                                                    to="/member/book-services"
                                                    variant="contained"
                                                    sx={{
                                                        mt: 2,
                                                        backgroundColor: '#1e3c72',
                                                        '&:hover': { backgroundColor: '#2a5298' }
                                                    }}
                                                >
                                                    Book a Service
                                                </Button>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>

            {/* Details Dialog */}
            <Dialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                {selectedBooking && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">Booking Details</Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Chip
                                        label={selectedBooking.status.toUpperCase()}
                                        color={getStatusColor(selectedBooking.status)}
                                        size="small"
                                    />
                                    <Chip
                                        label={selectedBooking.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                                        color={getPaymentStatusColor(selectedBooking.paymentStatus)}
                                        size="small"
                                    />
                                </Box>
                            </Box>
                        </DialogTitle>
                        <DialogContent dividers>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Booking ID</Typography>
                                    <Typography variant="body1">{selectedBooking.id}</Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Service</Typography>
                                    <Typography variant="body1">{selectedBooking.serviceName}</Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Date & Time</Typography>
                                    <Typography variant="body1">
                                        {formatDate(selectedBooking.preferredDate)}<br/>
                                        {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Number of Attendees</Typography>
                                    <Typography variant="body1">{selectedBooking.numberOfPeople}</Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Venue</Typography>
                                    <Typography variant="body1">{selectedBooking.venue || 'N/A'}</Typography>
                                </Grid>

                                {selectedBooking.specialRequirements && (
                                    <Grid item xs={12}>
                                        <Typography variant="subtitle2" color="text.secondary">Special Requirements</Typography>
                                        <Typography variant="body1">{selectedBooking.specialRequirements}</Typography>
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <Divider />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Contact Person</Typography>
                                    <Typography variant="body1">{selectedBooking.contactPerson || selectedBooking.memberName}</Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Contact Phone</Typography>
                                    <Typography variant="body1">{selectedBooking.contactPhone || selectedBooking.memberContact || 'N/A'}</Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="subtitle2" color="text.secondary">Service Amount</Typography>
                                    <Typography variant="body1">${selectedBooking.serviceAmount.toFixed(2)}</Typography>
                                </Grid>

                                {selectedBooking.cleaningFeeApplied && (
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Cleaning Fee</Typography>
                                        <Typography variant="body1">${selectedBooking.cleaningFeeAmount.toFixed(2)}</Typography>
                                    </Grid>
                                )}

                                <Grid item xs={12}>
                                    <Typography variant="h6" color="primary">
                                        Total Amount: ${selectedBooking.totalAmount.toFixed(2)} AUD
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">
                                        Booking created: {formatDate(selectedBooking.createdAt)}<br/>
                                        Last updated: {formatDate(selectedBooking.updatedAt)}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            {selectedBooking.paymentStatus === 'unpaid' && selectedBooking.status !== 'cancelled' && (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    onClick={() => {
                                        setDetailsDialogOpen(false);
                                        handleRetryPayment(selectedBooking);
                                    }}
                                    disabled={processingPayment}
                                >
                                    {processingPayment ? <CircularProgress size={20} color="inherit" /> : 'Pay Now'}
                                </Button>
                            )}
                            <Button onClick={() => setDetailsDialogOpen(false)}>
                                Close
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Cancel Confirmation Dialog */}
            <Dialog
                open={cancelDialogOpen}
                onClose={() => !cancelling && setCancelDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Cancel Booking</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Are you sure you want to cancel this booking?
                    </Alert>
                    {selectedBooking && (
                        <Box>
                            <Typography variant="body1" gutterBottom>
                                <strong>Service:</strong> {selectedBooking.serviceName}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Date:</strong> {formatDate(selectedBooking.preferredDate)}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Amount:</strong> ${selectedBooking.totalAmount.toFixed(2)}
                            </Typography>
                            {selectedBooking.paymentStatus === 'paid' && (
                                <Alert severity="info" sx={{ mt: 2 }}>
                                    Since you've already paid, please contact admin@anmc.org.au for refund processing.
                                </Alert>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelDialogOpen(false)} disabled={cancelling}>
                        No, Keep It
                    </Button>
                    <Button
                        onClick={handleCancelBooking}
                        color="error"
                        variant="contained"
                        disabled={cancelling}
                    >
                        {cancelling ? <CircularProgress size={24} /> : 'Yes, Cancel Booking'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Payment Dialog */}
            <Dialog
                open={paymentDialogOpen}
                onClose={handleClosePaymentDialog}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Complete Payment
                </DialogTitle>
                <DialogContent>
                    {paymentBooking && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="body1" gutterBottom>
                                <strong>Service:</strong> {paymentBooking.serviceName}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                                <strong>Date:</strong> {formatDate(paymentBooking.preferredDate)}
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                                <strong>Amount:</strong> ${paymentBooking.totalAmount.toFixed(2)} AUD
                            </Typography>
                        </Box>
                    )}

                    {clientSecret && (
                        <Elements stripe={stripePromise} options={{ clientSecret }}>
                            <PaymentForm
                                amount={paymentBooking?.totalAmount || 0}
                                bookingId={paymentBooking?.id}
                                onSuccess={handlePaymentSuccess}
                                onError={handlePaymentError}
                            />
                        </Elements>
                    )}

                    {!clientSecret && (
                        <Box display="flex" justifyContent="center" py={3}>
                            <CircularProgress />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePaymentDialog} disabled={processingPayment}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default MyBookings;
