import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import { toast } from "react-toastify";
import './style.scss';

const MembershipPayment = ({ clientSecret, formData, membershipFee, onSuccess, onCancel }) => {
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
                    return_url: window.location.origin + '/member-portal',
                    receipt_email: formData.email,
                    payment_method_data: {
                        billing_details: {
                            name: `${formData.firstName} ${formData.lastName}`,
                            email: formData.email,
                            phone: formData.mobile,
                            address: {
                                line1: formData.residentialAddress.street,
                                city: formData.residentialAddress.suburb,
                                state: formData.residentialAddress.state,
                                postal_code: formData.residentialAddress.postcode,
                                country: 'AU'
                            }
                        }
                    }
                },
                redirect: 'if_required'
            });

            if (error) {
                setErrorMessage(error.message);
                toast.error(error.message);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                await onSuccess(paymentIntent);
                toast.success('Payment successful! Your membership is now active.');
            }
        } catch (err) {
            console.error('Payment error:', err);
            setErrorMessage('An unexpected error occurred. Please try again.');
            toast.error('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid className="loginWrapper">
            <Grid className="loginForm paymentForm">
                <h2>Complete Your Payment</h2>
                <p>Membership Registration</p>

                <div className="payment-summary">
                    <h3>Order Summary</h3>
                    <div className="summary-item">
                        <span>Membership Type:</span>
                        <span>
                            {formData.membershipCategory === 'general' ? 'General' : 'Life'} Membership - {formData.membershipType === 'single' ? 'Single' : 'Family'}
                        </span>
                    </div>
                    <div className="summary-item">
                        <span>Member Name:</span>
                        <span>{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div className="summary-item">
                        <span>Email:</span>
                        <span>{formData.email}</span>
                    </div>
                    {formData.membershipType === 'family' && formData.familyMembers.length > 0 && (
                        <div className="summary-item">
                            <span>Family Members:</span>
                            <span>{formData.familyMembers.length}</span>
                        </div>
                    )}
                    <div className="summary-item total">
                        <span>Total Amount:</span>
                        <span className="amount">${membershipFee} AUD</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <div className="payment-element-container">
                                <PaymentElement />
                            </div>
                        </Grid>

                        {errorMessage && (
                            <Grid item xs={12}>
                                <div className="error-message">
                                    {errorMessage}
                                </div>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                className="cBtn cBtnLarge cBtnTheme"
                                type="submit"
                                disabled={!stripe || loading}
                            >
                                {loading ? 'Processing Payment...' : `Pay $${membershipFee}`}
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={onCancel}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </Grid>

                        <Grid item xs={12}>
                            <div className="payment-security-notice">
                                <i className="fa fa-lock"></i>
                                <p>Your payment information is secure and encrypted</p>
                            </div>
                        </Grid>
                    </Grid>
                </form>

                <div className="shape-img">
                    <i className="fi flaticon-honeycomb"></i>
                </div>
            </Grid>
        </Grid>
    );
};

export default MembershipPayment;
