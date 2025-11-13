import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import API_CONFIG from '../../config/api';

const BookingSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const sessionId = params.get('session_id');

        if (sessionId) {
            verifyPayment(sessionId);
        } else {
            setError('No payment session found');
            setVerifying(false);
        }
    }, [location]);

    const verifyPayment = async (sessionId) => {
        try {
            const response = await fetch(
                API_CONFIG.getURL(API_CONFIG.endpoints.bookings) + '/verify-payment',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId })
                }
            );

            if (!response.ok) {
                throw new Error('Payment verification failed');
            }

            const result = await response.json();

            if (result.success) {
                setBooking(result.booking);
            } else {
                setError(result.message || 'Payment verification failed');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setError('Failed to verify payment. Please contact support.');
        } finally {
            setVerifying(false);
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
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

    if (verifying) {
        return (
            <Container maxWidth="md">
                <Box sx={{ textAlign: 'center', mt: 10 }}>
                    <CircularProgress size={60} />
                    <Typography variant="h5" sx={{ mt: 3 }}>
                        Verifying your payment...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md">
                <Box sx={{ mt: 10 }}>
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/member-portal')}
                        fullWidth
                    >
                        Return to Member Portal
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 10, mb: 5 }}>
                <Card sx={{ boxShadow: 3 }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <CheckCircleIcon
                            sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
                        />
                        <Typography variant="h4" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            Payment Successful!
                        </Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Your booking has been confirmed
                        </Typography>

                        {booking && (
                            <Box sx={{ mt: 4, textAlign: 'left' }}>
                                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #1976d2', pb: 1, mb: 2 }}>
                                    Booking Details
                                </Typography>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Booking ID
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {booking.id}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Service
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {booking.serviceName}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Date
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {formatDate(booking.preferredDate)}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Time
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Number of Attendees
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {booking.numberOfPeople}
                                    </Typography>
                                </Box>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Amount Paid
                                    </Typography>
                                    <Typography variant="h5" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                        ${booking.totalAmount.toFixed(2)} AUD
                                    </Typography>
                                </Box>

                                <Alert severity="success" sx={{ mt: 3 }}>
                                    A confirmation email has been sent to {booking.memberEmail}
                                </Alert>

                                <Alert severity="info" sx={{ mt: 2 }}>
                                    <strong>Important:</strong> Please arrive 10 minutes before your scheduled time.
                                    Bring a copy of this confirmation for reference.
                                </Alert>
                            </Box>
                        )}

                        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/member-portal')}
                                fullWidth
                                size="large"
                            >
                                Return to Member Portal
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/book-services')}
                                fullWidth
                                size="large"
                            >
                                Book Another Service
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default BookingSuccess;
