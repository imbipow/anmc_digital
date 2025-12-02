import React from 'react';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import ANMCHeader from '../../components/ANMCHeader';
import Footer from '../../components/footer';

const KalashBookingSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingId, formData } = location.state || {};

    if (!bookingId) {
        navigate('/');
        return null;
    }

    return (
        <>
            <ANMCHeader />
            <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 8 }}>
                <Box sx={{ maxWidth: '600px', margin: '0 auto', px: 2 }}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center', p: 4 }}>
                            <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />

                            <Typography variant="h4" component="h1" gutterBottom>
                                Booking Confirmed!
                            </Typography>

                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                Your Kalash booking has been successfully confirmed and payment received.
                            </Typography>

                            <Box sx={{ backgroundColor: '#e3f2fd', p: 3, borderRadius: 2, mb: 3, border: '2px solid #2196f3', textAlign: 'left' }}>
                                <Typography variant="h6" sx={{ color: '#1976d2', mb: 2, fontWeight: 'bold' }}>
                                    📍 Collection Instructions
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                                    You can collect your Kalash from the Mandir during the event.
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2, color: '#d32f2f', fontWeight: 'bold', backgroundColor: '#fff3e0', p: 1.5, borderRadius: 1 }}>
                                    ⚠️ Important: Please bring proof of payment when collecting your Kalash.
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#666', mb: 1, fontWeight: 'bold' }}>
                                    What to bring for collection:
                                </Typography>
                                <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                                    <Typography component="li" variant="body2" sx={{ color: '#333', mb: 0.5 }}>
                                        Your Booking ID: <strong>{bookingId}</strong>
                                    </Typography>
                                    <Typography component="li" variant="body2" sx={{ color: '#333', mb: 0.5 }}>
                                        Printed confirmation email or show on your phone
                                    </Typography>
                                    <Typography component="li" variant="body2" sx={{ color: '#333', mb: 0.5 }}>
                                        Valid ID (Driver's License or Passport)
                                    </Typography>
                                    <Typography component="li" variant="body2" sx={{ color: '#333' }}>
                                        Payment receipt (check your email)
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ backgroundColor: '#f5f9ff', p: 3, borderRadius: 2, mb: 3, textAlign: 'left' }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Booking Details
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Booking ID:</strong> {bookingId}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Number of Kalash:</strong> {formData?.numberOfKalash}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Name:</strong> {formData?.name}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    <strong>Email:</strong> {formData?.email}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Phone:</strong> {formData?.phone}
                                </Typography>
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                A confirmation email has been sent to {formData?.email}
                            </Typography>

                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/')}
                                sx={{
                                    backgroundColor: '#ff9800',
                                    '&:hover': { backgroundColor: '#f57c00' }
                                }}
                            >
                                Return to Home
                            </Button>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
            <Footer />
        </>
    );
};

export default KalashBookingSuccess;
