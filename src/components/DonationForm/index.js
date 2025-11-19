import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';
import API_CONFIG from '../../config/api';
import { getPhoneValidationError } from '../../utils/phoneValidation';
import './style.css';

// Load Stripe publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const DonationForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        amount: '',
        comments: ''
    });
    const [errors, setErrors] = useState({});
    const [showPayment, setShowPayment] = useState(false);
    const [clientSecret, setClientSecret] = useState('');
    const [loading, setLoading] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        // Australian phone validation
        const phoneError = getPhoneValidationError(formData.phone);
        if (phoneError) newErrors.phone = phoneError;
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Please enter a valid donation amount';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleProceedToPayment = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            // Create payment intent
            const response = await fetch(API_CONFIG.getURL('/stripe/create-payment-intent'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(formData.amount),
                    currency: 'aud',
                    metadata: {
                        firstName: formData.firstName,
                        lastName: formData.lastName,
                        email: formData.email,
                        phone: formData.phone
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Check if it's a Stripe configuration error
                if (data.error && data.error.includes('Stripe is not configured')) {
                    alert('Payment system is currently being configured. Please contact the administrator or try again later.');
                } else {
                    throw new Error(data.error || 'Failed to create payment intent');
                }
                setLoading(false);
                return;
            }

            setClientSecret(data.clientSecret);
            setShowPayment(true);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to process payment. Please try again or contact support.');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntent) => {
        try {
            // Save donation to database
            const donationData = {
                ...formData,
                amount: parseFloat(formData.amount),
                paymentIntentId: paymentIntent.id,
                paymentStatus: paymentIntent.status,
                currency: 'AUD'
            };

            const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.donations), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(donationData)
            });

            if (!response.ok) {
                throw new Error('Failed to save donation');
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error('Error saving donation:', error);
        }
    };

    const appearance = {
        theme: 'stripe',
        variables: {
            colorPrimary: '#fc5356',
        },
    };

    if (showPayment && clientSecret) {
        return (
            <div className="donation-form-overlay">
                <div className="donation-form-container payment-step">
                    <button className="close-btn" onClick={onClose}>×</button>
                    <div className="donation-form-header">
                        <h2>Complete Your Donation</h2>
                        <p className="donation-amount">Amount: ${formData.amount} AUD</p>
                    </div>
                    <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
                        <CheckoutForm
                            clientSecret={clientSecret}
                            formData={formData}
                            onSuccess={handlePaymentSuccess}
                            onBack={() => setShowPayment(false)}
                        />
                    </Elements>
                </div>
            </div>
        );
    }

    return (
        <div className="donation-form-overlay">
            <div className="donation-form-container">
                <button className="close-btn" onClick={onClose}>×</button>
                <div className="donation-form-header">
                    <h2>Make a Donation</h2>
                    <p>Support ANMC's $450,000 bank loan payoff effort</p>
                </div>
                <form onSubmit={handleProceedToPayment} className="donation-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name *</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className={errors.firstName ? 'error' : ''}
                            />
                            {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name *</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className={errors.lastName ? 'error' : ''}
                            />
                            {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="0412 345 678"
                            className={errors.phone ? 'error' : ''}
                        />
                        {errors.phone && <span className="error-message">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="amount">Donation Amount (AUD) *</label>
                        <div className="amount-input-wrapper">
                            <span className="currency-symbol"></span>
                            <input
                                type="number"
                                id="amount"
                                name="amount"
                                value={formData.amount}
                                onChange={handleInputChange}
                                min="1"
                                step="0.01"
                                placeholder="100.00"
                                className={errors.amount ? 'error' : ''}
                            />
                        </div>
                        {errors.amount && <span className="error-message">{errors.amount}</span>}
                        <div className="quick-amounts">
                            {[50, 100, 250, 500, 1000].map(amt => (
                                <button
                                    key={amt}
                                    type="button"
                                    className="quick-amount-btn"
                                    onClick={() => setFormData(prev => ({ ...prev, amount: amt.toString() }))}
                                >
                                    ${amt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="comments">Comments (Optional)</label>
                        <textarea
                            id="comments"
                            name="comments"
                            value={formData.comments}
                            onChange={handleInputChange}
                            rows="4"
                            placeholder="Add a message with your donation..."
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Processing...' : 'Proceed to Payment'}
                    </button>

                    <p className="secure-note">
                        <i className="fa fa-lock"></i> Secure payment powered by Stripe
                    </p>
                </form>
            </div>
        </div>
    );
};

export default DonationForm;
