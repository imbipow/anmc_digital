import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

const CheckoutForm = ({ clientSecret, formData, onSuccess, onBack }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setErrorMessage('');

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.origin + '/donation-success',
                    receipt_email: formData.email,
                },
                redirect: 'if_required'
            });

            if (error) {
                setErrorMessage(error.message);
                setLoading(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                await onSuccess(paymentIntent);
                // Show success message
                alert('Thank you for your donation! Your payment was successful.');
                window.location.reload();
            }
        } catch (err) {
            console.error('Payment error:', err);
            setErrorMessage('An unexpected error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="checkout-form">
            <PaymentElement />

            {errorMessage && (
                <div className="error-alert">
                    <i className="fa fa-exclamation-circle"></i> {errorMessage}
                </div>
            )}

            <div className="payment-actions">
                <button
                    type="button"
                    className="back-btn"
                    onClick={onBack}
                    disabled={loading}
                >
                    Back
                </button>
                <button
                    type="submit"
                    className="pay-btn"
                    disabled={!stripe || loading}
                >
                    {loading ? 'Processing...' : `Pay $${formData.amount}`}
                </button>
            </div>

            <p className="payment-info">
                Your payment information is securely processed by Stripe. We never store your card details.
            </p>
        </form>
    );
};

export default CheckoutForm;
