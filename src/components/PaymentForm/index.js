import React, { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';

const PaymentForm = ({ amount, bookingId, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setErrorMessage(null);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/booking-success?booking_id=${bookingId}`,
                },
                redirect: 'if_required'
            });

            if (error) {
                setErrorMessage(error.message);
                setProcessing(false);
                if (onError) onError(error);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                setProcessing(false);
                if (onSuccess) onSuccess(paymentIntent);
            }
        } catch (err) {
            console.error('Payment error:', err);
            setErrorMessage('An unexpected error occurred. Please try again.');
            setProcessing(false);
            if (onError) onError(err);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ borderBottom: '2px solid #1976d2', pb: 1, mb: 2 }}>
                    Payment Details
                </Typography>

                <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f9ff', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Amount to Pay
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                        ${amount.toFixed(2)} AUD
                    </Typography>
                </Box>

                <PaymentElement
                    options={{
                        layout: {
                            type: 'tabs',
                            defaultCollapsed: false,
                        }
                    }}
                />
            </Box>

            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                </Alert>
            )}

            <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={!stripe || processing}
                sx={{
                    backgroundColor: '#1e3c72',
                    '&:hover': { backgroundColor: '#2a5298' },
                    py: 1.5,
                    fontSize: '1.1rem'
                }}
            >
                {processing ? (
                    <>
                        <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                        Processing...
                    </>
                ) : (
                    `Pay $${amount.toFixed(2)}`
                )}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                Powered by Stripe. Your payment information is secure and encrypted.
            </Typography>
        </form>
    );
};

export default PaymentForm;
