import React, { useState, useEffect } from 'react';
import './style.css'

const Donate = (props) => {
    const [donateData, setDonateData] = useState(null);
    const [donationForm, setDonationForm] = useState({
        amount: '',
        customAmount: '',
        purpose: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        message: '',
        paymentMethod: 'stripe',
        isAnonymous: false
    });
    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    // Load donation data from JSON
    useEffect(() => {
        const loadDonateData = async () => {
            try {
                const response = await fetch('/data/donate.json');
                const data = await response.json();
                setDonateData(data);
            } catch (error) {
                console.warn('Failed to load donation data:', error);
            }
        };
        loadDonateData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDonationForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAmountSelect = (amount) => {
        setDonationForm(prev => ({
            ...prev,
            amount: amount,
            customAmount: ''
        }));
    };

    const handleCustomAmountChange = (e) => {
        setDonationForm(prev => ({
            ...prev,
            customAmount: e.target.value,
            amount: ''
        }));
    };

    const getFinalAmount = () => {
        return donationForm.customAmount || donationForm.amount;
    };

    const handleNext = () => {
        const finalAmount = getFinalAmount();
        if (!finalAmount || finalAmount < 10) {
            alert('Please select or enter a minimum amount of $10');
            return;
        }
        if (!donationForm.purpose) {
            alert('Please select a donation purpose');
            return;
        }
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        
        // Simulate processing
        setTimeout(() => {
            setIsProcessing(false);
            alert(`Thank you for your donation of $${getFinalAmount()}! You will receive a confirmation email shortly.`);
            
            // Reset form
            setDonationForm({
                amount: '',
                customAmount: '',
                purpose: '',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address: '',
                message: '',
                paymentMethod: 'stripe',
                isAnonymous: false
            });
            setStep(1);
        }, 2000);
    };

    if (!donateData) {
        return <div>Loading donation options...</div>;
    }

    return (
        <div className="wpo-donation-page-area section-padding">
            <div className="container">
                <div className="row">
                    <div className="col-lg-10 offset-lg-1">
                        <div className="wpo-donate-header">
                            <h2>Support ANMC</h2>
                            <p>Your donation helps us build stronger communities and preserve cultural heritage</p>
                        </div>

                        {step === 1 && (
                            <div className="donation-step-1">
                                {/* Donation Purpose Section */}
                                <div className="donation-purposes-section">
                                    <h3>Choose Your Donation Purpose</h3>
                                    <div className="row">
                                        {donateData.donationOptions.map((option) => (
                                            <div key={option.id} className="col-lg-6 col-md-12 mb-3">
                                                <div 
                                                    className={`purpose-card ${donationForm.purpose === option.id ? 'selected' : ''}`}
                                                    onClick={() => setDonationForm(prev => ({ ...prev, purpose: option.id }))}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="purpose-icon">
                                                        <i className={option.icon}></i>
                                                    </div>
                                                    <div className="purpose-content">
                                                        <h4>{option.title}</h4>
                                                        <p>{option.description}</p>
                                                        {option.goal && (
                                                            <div className="progress-info">
                                                                <div className="progress-bar">
                                                                    <div 
                                                                        className="progress-fill" 
                                                                        style={{ width: `${(option.raised / option.goal) * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                                <small>${option.raised.toLocaleString()} of ${option.goal.toLocaleString()}</small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Amount Selection */}
                                <div className="wpo-donations-amount">
                                    <h3>Select Donation Amount</h3>
                                    <div className="amount-buttons">
                                        {donateData.donationOptions
                                            .find(opt => opt.id === donationForm.purpose)?.suggestedAmounts
                                            ?.map((amount) => (
                                                <button
                                                    key={amount}
                                                    type="button"
                                                    className={`amount-btn ${donationForm.amount === amount ? 'selected' : ''}`}
                                                    onClick={() => handleAmountSelect(amount)}
                                                >
                                                    ${amount}
                                                </button>
                                            )) || 
                                            [25, 50, 100, 250, 500].map((amount) => (
                                                <button
                                                    key={amount}
                                                    type="button"
                                                    className={`amount-btn ${donationForm.amount === amount ? 'selected' : ''}`}
                                                    onClick={() => handleAmountSelect(amount)}
                                                >
                                                    ${amount}
                                                </button>
                                            ))
                                        }
                                    </div>
                                    <div className="custom-amount mt-3">
                                        <input 
                                            type="number" 
                                            className="form-control" 
                                            name="customAmount"
                                            value={donationForm.customAmount}
                                            onChange={handleCustomAmountChange}
                                            placeholder="Enter custom amount"
                                            min="10"
                                        />
                                    </div>
                                </div>


                                {getFinalAmount() && (
                                    <div className="donation-summary">
                                        <h4>Donation Summary</h4>
                                        <div className="summary-details">
                                            <p><strong>Amount:</strong> ${getFinalAmount()}</p>
                                            <p><strong>Purpose:</strong> {donateData.donationOptions.find(opt => opt.id === donationForm.purpose)?.title || 'Not selected'}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="submit-area">
                                    <button 
                                        type="button" 
                                        className="theme-btn submit-btn"
                                        onClick={handleNext}
                                    >
                                        Continue to Details
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleSubmit} className="donation-step-2">
                                <div className="row">
                                    <div className="col-lg-8">
                                        <div className="wpo-donations-details">
                                            <h3>Your Details</h3>
                                            <div className="row">
                                                <div className="col-lg-6 col-md-6 form-group">
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        name="firstName" 
                                                        value={donationForm.firstName}
                                                        onChange={handleInputChange}
                                                        placeholder="First Name*"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-lg-6 col-md-6 form-group">
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        name="lastName" 
                                                        value={donationForm.lastName}
                                                        onChange={handleInputChange}
                                                        placeholder="Last Name*"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-lg-6 col-md-6 form-group">
                                                    <input 
                                                        type="email" 
                                                        className="form-control" 
                                                        name="email" 
                                                        value={donationForm.email}
                                                        onChange={handleInputChange}
                                                        placeholder="Email*"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-lg-6 col-md-6 form-group">
                                                    <input 
                                                        type="tel" 
                                                        className="form-control" 
                                                        name="phone" 
                                                        value={donationForm.phone}
                                                        onChange={handleInputChange}
                                                        placeholder="Phone Number"
                                                    />
                                                </div>
                                                <div className="col-lg-12 form-group">
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        name="address" 
                                                        value={donationForm.address}
                                                        onChange={handleInputChange}
                                                        placeholder="Address"
                                                    />
                                                </div>
                                                <div className="col-lg-12 form-group">
                                                    <textarea 
                                                        className="form-control" 
                                                        name="message" 
                                                        value={donationForm.message}
                                                        onChange={handleInputChange}
                                                        placeholder="Message (Optional)"
                                                        rows="3"
                                                    ></textarea>
                                                </div>
                                                <div className="col-lg-12 form-group">
                                                    <label className="checkbox-label">
                                                        <input 
                                                            type="checkbox" 
                                                            name="isAnonymous"
                                                            checked={donationForm.isAnonymous}
                                                            onChange={handleInputChange}
                                                        />
                                                        Make this donation anonymous
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="wpo-doanation-payment">
                                            <h3><i className="fa fa-credit-card"></i> Secure Payment with Stripe</h3>
                                            <div className="stripe-payment-info">
                                                <div className="payment-security">
                                                    <div className="security-badges">
                                                        <span className="security-badge">
                                                            <i className="fa fa-lock"></i> SSL Secured
                                                        </span>
                                                        <span className="security-badge">
                                                            <i className="fa fa-shield-alt"></i> 256-bit Encryption
                                                        </span>
                                                    </div>
                                                    <p className="payment-note">
                                                        Your payment information is processed securely through Stripe. 
                                                        We do not store your credit card details.
                                                    </p>
                                                </div>
                                                <div className="accepted-cards">
                                                    <span>We accept:</span>
                                                    <div className="card-icons">
                                                        <i className="fa fa-cc-visa"></i>
                                                        <i className="fa fa-cc-mastercard"></i>
                                                        <i className="fa fa-cc-amex"></i>
                                                        <i className="fa fa-cc-discover"></i>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-4">
                                        <div className="donation-summary-sidebar">
                                            <h4>Donation Summary</h4>
                                            <div className="summary-item">
                                                <span>Amount:</span>
                                                <strong>${getFinalAmount()}</strong>
                                            </div>
                                            <div className="summary-item">
                                                <span>Purpose:</span>
                                                <span>{donateData.donationOptions.find(opt => opt.id === donationForm.purpose)?.title}</span>
                                            </div>
                                            
                                            {donateData.tax.isDeductible && (
                                                <div className="tax-info">
                                                    <p><small><i className="fa fa-info-circle"></i> {donateData.tax.receiptPolicy}</small></p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="submit-area">
                                    <button 
                                        type="button" 
                                        className="theme-btn-2 back-btn"
                                        onClick={handleBack}
                                        disabled={isProcessing}
                                    >
                                        Back
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="theme-btn submit-btn"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Processing...' : `Donate $${getFinalAmount()}`}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Donate;