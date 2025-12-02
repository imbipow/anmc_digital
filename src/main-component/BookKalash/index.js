import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Grid
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ANMCHeader from '../../components/ANMCHeader';
import Footer from '../../components/footer';
import API_CONFIG from '../../config/api';
import './style.css';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const KALASH_PRICES = {
    1: 111,
    2: 151
};

// Get price for selected quantity
const getKalashPrice = (quantity) => {
    return KALASH_PRICES[quantity] || KALASH_PRICES[1];
};

const KalashPaymentForm = ({ formData, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        try {
            // Create payment intent
            const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.kalashBookings), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    amount: getKalashPrice(parseInt(formData.numberOfKalash))
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create booking');
            }

            // Confirm payment
            const result = await stripe.confirmCardPayment(data.clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                    billing_details: {
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone,
                    },
                },
            });

            if (result.error) {
                toast.error(result.error.message);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    toast.success('Kalash booking confirmed! Payment successful.');
                    onSuccess(data.booking.id, {
                        numberOfKalash: formData.numberOfKalash,
                        name: formData.name,
                        email: formData.email,
                        phone: formData.phone
                    });
                }
            }
        } catch (error) {
            console.error('Error processing payment:', error);
            toast.error(error.message || 'Failed to process payment');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom>
                    Card Details
                </Typography>
                <Box
                    sx={{
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        padding: '12px',
                        backgroundColor: '#fff'
                    }}
                >
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }}
                    />
                </Box>
            </Box>

            <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={!stripe || processing}
                sx={{
                    backgroundColor: '#ff9800',
                    '&:hover': { backgroundColor: '#f57c00' },
                    py: 1.5,
                }}
            >
                {processing ? (
                    <>
                        <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                        Processing...
                    </>
                ) : (
                    `Pay $${getKalashPrice(parseInt(formData.numberOfKalash))} AUD`
                )}
            </Button>
        </form>
    );
};

const BookKalash = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        numberOfKalash: 1,
        name: '',
        email: '',
        phone: ''
    });
    const [showPayment, setShowPayment] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = () => {
        if (validateForm()) {
            setShowPayment(true);
        }
    };

    const handleSuccess = (bookingId, bookingData) => {
        navigate('/kalash-booking-success', { state: { bookingId, formData: bookingData || formData } });
    };

    return (
        <>
            <ANMCHeader />
            <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5', py: 4 }}>
                <Box sx={{ maxWidth: '800px', margin: '0 auto', px: 2 }}>
                    <Button
                        onClick={() => navigate(-1)}
                        sx={{ mb: 2 }}
                    >
                        ← Back
                    </Button>

                    <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center', mb: 1 }}>
                        Book Kalash for Puja
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 4 }}>
                        Reserve sacred Kalash for your religious ceremonies
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Card>
                                <CardContent sx={{ p: 4 }}>
                                    {!showPayment ? (
                                        <>
                                            <Typography variant="h6" gutterBottom>
                                                Booking Details
                                            </Typography>

                                            <FormControl fullWidth sx={{ mb: 3 }}>
                                                <InputLabel>Number of Kalash</InputLabel>
                                                <Select
                                                    name="numberOfKalash"
                                                    value={formData.numberOfKalash}
                                                    onChange={handleChange}
                                                    label="Number of Kalash"
                                                >
                                                    <MenuItem value={1}>1 Kalash - $111 AUD</MenuItem>
                                                    <MenuItem value={2}>2 Kalash - $151 AUD</MenuItem>
                                                </Select>
                                            </FormControl>

                                            <TextField
                                                fullWidth
                                                label="Full Name *"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                error={!!errors.name}
                                                helperText={errors.name}
                                                sx={{ mb: 3 }}
                                            />

                                            <TextField
                                                fullWidth
                                                label="Email *"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                error={!!errors.email}
                                                helperText={errors.email}
                                                sx={{ mb: 3 }}
                                            />

                                            <TextField
                                                fullWidth
                                                label="Phone Number *"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                error={!!errors.phone}
                                                helperText={errors.phone}
                                                sx={{ mb: 3 }}
                                            />

                                            <Button
                                                variant="contained"
                                                fullWidth
                                                size="large"
                                                onClick={handleContinue}
                                                sx={{
                                                    backgroundColor: '#ff9800',
                                                    '&:hover': { backgroundColor: '#f57c00' },
                                                    py: 1.5,
                                                }}
                                            >
                                                Continue to Payment
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                                <Typography variant="h6">
                                                    Payment
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => setShowPayment(false)}
                                                >
                                                    Edit Details
                                                </Button>
                                            </Box>

                                            <Alert severity="info" sx={{ mb: 3 }}>
                                                Please complete your payment to confirm the Kalash booking
                                            </Alert>

                                            <Elements stripe={stripePromise}>
                                                <KalashPaymentForm
                                                    formData={formData}
                                                    onSuccess={handleSuccess}
                                                />
                                            </Elements>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Card sx={{ position: 'sticky', top: 20 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Booking Summary
                                    </Typography>

                                    <Box sx={{ my: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Number of Kalash:
                                            </Typography>
                                            <Typography variant="body2" fontWeight="bold">
                                                {formData.numberOfKalash}
                                            </Typography>
                                        </Box>

                                        {formData.name && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Name:
                                                </Typography>
                                                <Typography variant="body2">
                                                    {formData.name}
                                                </Typography>
                                            </Box>
                                        )}

                                        {formData.email && (
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Email:
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                                    {formData.email}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Box>

                                    <Box sx={{ borderTop: '2px solid #e0e0e0', pt: 2, mt: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="h6">
                                                Total:
                                            </Typography>
                                            <Typography variant="h6" color="primary">
                                                ${getKalashPrice(parseInt(formData.numberOfKalash) || 1)} AUD
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>

                            <Card sx={{ mt: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" gutterBottom>
                                        About Kalash Booking
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Sacred Kalash vessels are essential for performing traditional Hindu pujas and ceremonies. Book in advance to ensure availability for your special occasion.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
            <Footer />
        </>
    );
};

export default BookKalash;
