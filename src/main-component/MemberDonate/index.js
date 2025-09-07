import React, { useState } from 'react';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import ANMCHeader from '../../components/ANMCHeader';
import './style.css';

const MemberDonate = () => {
    const [donationData, setDonationData] = useState({
        amount: '',
        customAmount: '',
        purpose: '',
        frequency: 'one-time',
        donorName: 'John Doe',
        email: 'user@gmail.com',
        phone: '+91-9876543210',
        address: '123 Temple Street, Mumbai',
        panCard: '',
        isAnonymous: false
    });

    const [step, setStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);

    const predefinedAmounts = [500, 1000, 2500, 5000, 10000, 25000];
    
    const donationPurposes = [
        { value: 'general', label: 'General Temple Fund' },
        { value: 'construction', label: 'Temple Construction' },
        { value: 'festivals', label: 'Festival Celebrations' },
        { value: 'food', label: 'Free Food Program' },
        { value: 'education', label: 'Educational Activities' },
        { value: 'maintenance', label: 'Temple Maintenance' },
        { value: 'charity', label: 'Charity Work' },
        { value: 'other', label: 'Other Purpose' }
    ];

    const handleChange = (e) => {
        setDonationData({
            ...donationData,
            [e.target.name]: e.target.value
        });
    };

    const handleAmountSelect = (amount) => {
        setDonationData({
            ...donationData,
            amount: amount,
            customAmount: ''
        });
    };

    const handleCustomAmountChange = (e) => {
        setDonationData({
            ...donationData,
            customAmount: e.target.value,
            amount: ''
        });
    };

    const getFinalAmount = () => {
        return donationData.customAmount || donationData.amount;
    };

    const handleNext = () => {
        const finalAmount = getFinalAmount();
        if (!finalAmount || finalAmount < 100) {
            toast.error('Please select or enter a minimum amount of ₹100');
            return;
        }
        if (!donationData.purpose) {
            toast.error('Please select a donation purpose');
            return;
        }
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        
        try {
            const finalAmount = getFinalAmount();
            
            toast.success(`Processing donation of ₹${finalAmount} via Stripe...`);
            
            setTimeout(() => {
                setIsProcessing(false);
                toast.success('Thank you! Your donation has been processed successfully. You will receive a receipt via email.');
                
                setDonationData({
                    amount: '',
                    customAmount: '',
                    purpose: '',
                    frequency: 'one-time',
                    donorName: 'John Doe',
                    email: 'user@gmail.com',
                    phone: '+91-9876543210',
                    address: '123 Temple Street, Mumbai',
                    panCard: '',
                    isAnonymous: false
                });
                setStep(1);
            }, 3000);
            
        } catch (error) {
            setIsProcessing(false);
            toast.error('Payment failed. Please try again.');
        }
    };

    return (
        <div className="member-donate-wrapper">
            <ANMCHeader />
            
            <div className="container">
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box className="page-header">
                            <Button 
                                component={Link} 
                                to="/member-portal"
                                className="back-button"
                                sx={{ 
                                    backgroundColor: '#1e3c72',
                                    color: 'white',
                                    '&:hover': {
                                        backgroundColor: '#2a5298'
                                    }
                                }}
                            >
                                ← Back to Portal
                            </Button>
                            <Typography variant="h4" component="h1">
                                💳 Make Donation
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Secure donations via Stripe - Support the temple community
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Card className="donation-card">
                            <CardContent>
                                <Box className="donation-steps">
                                    <Box className={`step ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
                                        <div className="step-number">1</div>
                                        <div className="step-label">Amount & Purpose</div>
                                    </Box>
                                    <div className="step-divider"></div>
                                    <Box className={`step ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
                                        <div className="step-number">2</div>
                                        <div className="step-label">Payment Details</div>
                                    </Box>
                                </Box>

                                {step === 1 && (
                                    <div className="step-content">
                                        <Typography variant="h5" component="h2" className="step-title">
                                            Choose Donation Amount
                                        </Typography>
                                        
                                        <Grid container spacing={2} className="amount-grid">
                                            {predefinedAmounts.map((amount) => (
                                                <Grid item xs={6} sm={4} md={2} key={amount}>
                                                    <Button
                                                        variant={donationData.amount === amount ? "contained" : "outlined"}
                                                        fullWidth
                                                        className={`amount-button ${donationData.amount === amount ? 'selected' : ''}`}
                                                        onClick={() => handleAmountSelect(amount)}
                                                    >
                                                        ₹{amount.toLocaleString()}
                                                    </Button>
                                                </Grid>
                                            ))}
                                        </Grid>

                                        <Box className="custom-amount">
                                            <TextField
                                                fullWidth
                                                label="Custom Amount"
                                                type="number"
                                                value={donationData.customAmount}
                                                onChange={handleCustomAmountChange}
                                                placeholder="Enter custom amount"
                                                InputProps={{
                                                    startAdornment: <span style={{marginRight: '8px'}}>₹</span>,
                                                }}
                                                helperText="Minimum donation amount is ₹100"
                                            />
                                        </Box>

                                        <FormControl fullWidth className="purpose-select">
                                            <InputLabel>Donation Purpose</InputLabel>
                                            <Select
                                                name="purpose"
                                                value={donationData.purpose}
                                                onChange={handleChange}
                                                label="Donation Purpose"
                                            >
                                                {donationPurposes.map((purpose) => (
                                                    <MenuItem key={purpose.value} value={purpose.value}>
                                                        {purpose.label}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        <FormControl component="fieldset" className="frequency-select">
                                            <FormLabel component="legend">Donation Frequency</FormLabel>
                                            <RadioGroup
                                                row
                                                name="frequency"
                                                value={donationData.frequency}
                                                onChange={handleChange}
                                            >
                                                <FormControlLabel 
                                                    value="one-time" 
                                                    control={<Radio />} 
                                                    label="One-time" 
                                                />
                                                <FormControlLabel 
                                                    value="monthly" 
                                                    control={<Radio />} 
                                                    label="Monthly" 
                                                />
                                                <FormControlLabel 
                                                    value="yearly" 
                                                    control={<Radio />} 
                                                    label="Yearly" 
                                                />
                                            </RadioGroup>
                                        </FormControl>

                                        {getFinalAmount() && (
                                            <Box className="donation-summary">
                                                <Typography variant="h6">
                                                    Donation Summary
                                                </Typography>
                                                <Typography variant="h4" color="primary">
                                                    ₹{getFinalAmount().toLocaleString()}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {donationPurposes.find(p => p.value === donationData.purpose)?.label || 'Purpose not selected'}
                                                    {donationData.frequency !== 'one-time' && ` - ${donationData.frequency}`}
                                                </Typography>
                                            </Box>
                                        )}

                                        <Button
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            onClick={handleNext}
                                            className="next-button"
                                            sx={{ backgroundColor: '#1e3c72', '&:hover': { backgroundColor: '#2a5298' } }}
                                        >
                                            Proceed to Payment
                                        </Button>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="step-content">
                                        <Typography variant="h5" component="h2" className="step-title">
                                            Payment Details
                                        </Typography>

                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <Card className="payment-summary">
                                                    <CardContent>
                                                        <Typography variant="h6" gutterBottom>
                                                            Donation Summary
                                                        </Typography>
                                                        <Box className="summary-row">
                                                            <Typography>Amount:</Typography>
                                                            <Typography variant="h6" color="primary">
                                                                ₹{getFinalAmount().toLocaleString()}
                                                            </Typography>
                                                        </Box>
                                                        <Box className="summary-row">
                                                            <Typography>Purpose:</Typography>
                                                            <Typography>
                                                                {donationPurposes.find(p => p.value === donationData.purpose)?.label}
                                                            </Typography>
                                                        </Box>
                                                        <Box className="summary-row">
                                                            <Typography>Frequency:</Typography>
                                                            <Chip 
                                                                label={donationData.frequency.charAt(0).toUpperCase() + donationData.frequency.slice(1)}
                                                                size="small"
                                                                color="primary"
                                                            />
                                                        </Box>
                                                        
                                                        <Box className="security-info">
                                                            <span style={{color: '#4CAF50', fontSize: '1.2rem'}}>🔒</span>
                                                            <Typography variant="body2" color="text.secondary">
                                                                Secured by Stripe SSL encryption
                                                            </Typography>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>

                                            <Grid item xs={12} md={6}>
                                                <form onSubmit={handlePayment}>
                                                    <Typography variant="h6" gutterBottom className="form-section-title">
                                                        <span style={{marginRight: '0.5rem', fontSize: '1.2rem'}}>💳</span>
                                                        Stripe Payment
                                                    </Typography>
                                                    
                                                    <TextField
                                                        fullWidth
                                                        label="Card Number"
                                                        placeholder="4242 4242 4242 4242"
                                                        margin="normal"
                                                        required
                                                        helperText="Test card: 4242 4242 4242 4242"
                                                    />
                                                    
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="Expiry Date"
                                                                placeholder="MM/YY"
                                                                margin="normal"
                                                                required
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <TextField
                                                                fullWidth
                                                                label="CVV"
                                                                placeholder="123"
                                                                margin="normal"
                                                                required
                                                            />
                                                        </Grid>
                                                    </Grid>

                                                    <TextField
                                                        fullWidth
                                                        label="Cardholder Name"
                                                        value={donationData.donorName}
                                                        onChange={handleChange}
                                                        name="donorName"
                                                        margin="normal"
                                                        required
                                                    />

                                                    <TextField
                                                        fullWidth
                                                        label="PAN Card (for 80G receipt)"
                                                        name="panCard"
                                                        value={donationData.panCard}
                                                        onChange={handleChange}
                                                        margin="normal"
                                                        placeholder="ABCDE1234F (Optional)"
                                                        helperText="Required for tax exemption certificate"
                                                    />

                                                    <Box className="payment-buttons">
                                                        <Button
                                                            variant="outlined"
                                                            onClick={handleBack}
                                                            disabled={isProcessing}
                                                            sx={{ mr: 2 }}
                                                        >
                                                            Back
                                                        </Button>
                                                        <Button
                                                            type="submit"
                                                            variant="contained"
                                                            size="large"
                                                            disabled={isProcessing}
                                                            className="pay-button"
                                                            sx={{ backgroundColor: '#1e3c72', '&:hover': { backgroundColor: '#2a5298' } }}
                                                        >
                                                            {isProcessing ? 'Processing...' : `Donate ₹${getFinalAmount().toLocaleString()}`}
                                                        </Button>
                                                    </Box>
                                                </form>
                                            </Grid>
                                        </Grid>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default MemberDonate;