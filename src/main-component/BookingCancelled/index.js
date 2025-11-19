import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Container,
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Alert
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

const BookingCancelled = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const bookingId = params.get('booking_id');

    return (
        <Container maxWidth="md">
            <Box sx={{ mt: 10, mb: 5 }}>
                <Card sx={{ boxShadow: 3 }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <CancelIcon
                            sx={{ fontSize: 80, color: 'warning.main', mb: 2 }}
                        />
                        <Typography variant="h4" gutterBottom sx={{ color: 'warning.main', fontWeight: 'bold' }}>
                            Payment Cancelled
                        </Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
                            Your booking was created but payment was not completed
                        </Typography>

                        <Alert severity="warning" sx={{ textAlign: 'left', mb: 3 }}>
                            <Typography variant="body1" gutterBottom>
                                <strong>What happens next?</strong>
                            </Typography>
                            <Typography variant="body2">
                                • Your booking request has been saved but is not confirmed
                            </Typography>
                            <Typography variant="body2">
                                • Payment must be completed to secure your booking
                            </Typography>
                            <Typography variant="body2">
                                • You can retry payment from your member portal
                            </Typography>
                        </Alert>

                        {bookingId && (
                            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Booking ID
                                </Typography>
                                <Typography variant="h6" fontWeight="bold">
                                    {bookingId}
                                </Typography>
                            </Box>
                        )}

                        <Alert severity="info" sx={{ textAlign: 'left', mb: 4 }}>
                            <Typography variant="body2">
                                Need help? Contact us at admin@anmcinc.org.au or visit our office.
                            </Typography>
                        </Alert>

                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/member-portal')}
                                fullWidth
                                size="large"
                            >
                                Go to Member Portal
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/book-services')}
                                fullWidth
                                size="large"
                            >
                                Try Again
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default BookingCancelled;
