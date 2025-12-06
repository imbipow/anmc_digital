import React, { useState, useEffect } from 'react';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import WarningIcon from '@mui/icons-material/Warning';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

import ANMCHeader from '../../components/ANMCHeader';
import PaymentForm from '../../components/PaymentForm';
import API_CONFIG from '../../config/api';
import cognitoAuthService from '../../services/cognitoAuth';
import "react-datepicker/dist/react-datepicker.css";
import './style.css';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Helper function to make authenticated API calls
const authenticatedFetch = async (url, options = {}) => {
    try {
        const token = await cognitoAuthService.getIdToken();
        console.log('🔐 Auth token:', token ? 'Token retrieved successfully' : 'No token');
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log('✅ Authorization header added to request:', url);
        } else {
            console.warn('⚠️ No token available for request:', url);
        }
        return fetch(url, { ...options, headers });
    } catch (error) {
        console.error('❌ Auth fetch error:', error);
        throw error;
    }
};

const BookServices = () => {
    const navigate = useNavigate();
    const [selectedService, setSelectedService] = useState(null);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow;
    });
    const [cleaningFee, setCleaningFee] = useState(null);
    const [bookingData, setBookingData] = useState({
        numberOfPeople: '',
        specialRequirements: '',
        contactPerson: '',
        contactPhone: '',
        venue: 'Temple Premises',
        startTime: ''
    });
    const [activeStep, setActiveStep] = useState(0);
    const [createdBookingId, setCreatedBookingId] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [memberData, setMemberData] = useState(null);
    const [isLifeMember, setIsLifeMember] = useState(false);
    const steps = ['Booking Details', 'Payment'];

    useEffect(() => {
        initializeComponent();
    }, []);

    useEffect(() => {
        // Only fetch slots if the service requires slot booking
        if (selectedService && selectedDate && selectedService.requiresSlotBooking !== false) {
            fetchAvailableSlots();
        }
    }, [selectedService, selectedDate]);

    const initializeComponent = async () => {
        try {
            // Get current user
            const user = await cognitoAuthService.getCurrentUser();
            setCurrentUser(user);

            // Pre-fill contact info if available
            setBookingData(prev => ({
                ...prev,
                contactPerson: user.name || user.email || '',
                contactPhone: user.phone_number || ''
            }));

            // Check for life member status from Cognito groups first
            const userGroups = user.groups || [];
            const lifeMemberGroups = ['AnmcLifeMembers', 'LifeMembers'];
            const isLifeMemberByGroup = userGroups.some(group => lifeMemberGroups.includes(group));

            if (isLifeMemberByGroup) {
                setIsLifeMember(true);
                console.log('✅ Life member detected (via Cognito group) - 10% discount will be applied');
                console.log('   User groups:', userGroups.join(', '));
            }

            // Fetch member data to check for life membership (also check database)
            try {
                const memberResponse = await authenticatedFetch(
                    API_CONFIG.getURL(API_CONFIG.endpoints.members) + `?email=${user.email}`
                );
                if (memberResponse.ok) {
                    const members = await memberResponse.json();
                    if (members && members.length > 0) {
                        const member = members[0];
                        setMemberData(member);
                        // Check if life member for 10% discount (from database membership category)
                        if (member.membershipCategory === 'life') {
                            setIsLifeMember(true);
                            console.log('✅ Life member detected (via database) - 10% discount will be applied');
                        }
                    }
                }
            } catch (memberError) {
                console.error('Error fetching member data:', memberError);
                // Continue - discount may still apply if detected via Cognito group
            }

            // Fetch services
            await fetchServices();
        } catch (error) {
            console.error('Error initializing:', error);
            toast.error('Please login to book services');
            navigate('/login');
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.servicesActive));
            if (!response.ok) throw new Error('Failed to fetch services');

            const data = await response.json();

            // Filter out cleaning services (only show puja services)
            const pujaServices = data.filter(service =>
                service.category !== 'service' &&
                !service.anusthanName.toLowerCase().includes('cleaning')
            );

            // Find cleaning fee for automatic calculation
            const cleaningFeeService = data.find(service =>
                service.category === 'service' &&
                service.anusthanName.toLowerCase().includes('cleaning')
            );
            setCleaningFee(cleaningFeeService);

            setServices(pujaServices);
        } catch (error) {
            console.error('Error fetching services:', error);
            toast.error('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSlots = async () => {
        if (!selectedService || !selectedDate) return;

        setLoadingSlots(true);
        setBookingData(prev => ({
            ...prev,
            startTime: '' // Reset time slot when fetching new slots
        }));

        try {
            const dateStr = selectedDate.toISOString().split('T')[0];
            const response = await authenticatedFetch(
                API_CONFIG.getURL(
                    API_CONFIG.endpoints.availableSlots(dateStr, selectedService.durationHours)
                )
            );

            if (!response.ok) throw new Error('Failed to fetch available slots');

            const slots = await response.json();
            setAvailableSlots(slots);
        } catch (error) {
            console.error('Error fetching slots:', error);
            toast.error('Failed to load available time slots');
            setAvailableSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    const formatDuration = (hours) => {
        if (!hours || hours === 0) return 'Contact for details';
        if (hours < 1) return `${hours * 60} minutes`;
        if (hours === 1) return '1 hour';
        return `${hours} hours`;
    };

    const getCategoryLabel = (category) => {
        const labels = {
            small: 'Small Puja',
            medium: 'Medium Puja',
            large: 'Large Puja',
            special: 'Special Ceremony'
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category) => {
        const colors = {
            small: '#4caf50',
            medium: '#ff9800',
            large: '#f44336',
            special: '#9c27b0'
        };
        return colors[category] || '#1976d2';
    };

    const calculateTotalAmount = () => {
        if (!selectedService) return 0;

        let serviceAmount = selectedService.amount;
        const numPeople = parseInt(bookingData.numberOfPeople) || 0;

        // Apply 10% discount for life members (on service amount only, not cleaning fee)
        if (isLifeMember) {
            serviceAmount = serviceAmount * 0.5; // 50% discount
        }

        let total = serviceAmount;

        // Add cleaning fee if more than 21 people (no discount on cleaning fee)
        if (numPeople > 21 && cleaningFee) {
            total += cleaningFee.amount;
        }

        return total;
    };

    const getLifeMemberDiscount = () => {
        if (!selectedService || !isLifeMember) return 0;
        return selectedService.amount * 0.5; // 10% of original service amount
    };

    const shouldApplyCleaningFee = () => {
        const numPeople = parseInt(bookingData.numberOfPeople) || 0;
        return numPeople > 21 && cleaningFee;
    };

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setAvailableSlots([]);
        setBookingData(prev => ({
            ...prev,
            startTime: ''
        }));
    };

    const handleChange = (e) => {
        setBookingData({
            ...bookingData,
            [e.target.name]: e.target.value
        });
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setBookingData(prev => ({
            ...prev,
            startTime: '' // Reset time slot when date changes
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedService) {
            toast.error('Please select a service first');
            return;
        }

        // Only require time slot if service requires slot booking
        if (selectedService.requiresSlotBooking !== false && !bookingData.startTime) {
            toast.error('Please select a time slot');
            return;
        }

        if (!currentUser) {
            toast.error('Please login to book services');
            navigate('/login');
            return;
        }

        setSubmitting(true);

        try {
            const totalAmount = calculateTotalAmount();
            const cleaningFeeApplied = shouldApplyCleaningFee();

            const lifeMemberDiscount = getLifeMemberDiscount();

            const bookingPayload = {
                serviceId: selectedService.id,
                serviceName: selectedService.anusthanName,
                serviceAmount: selectedService.amount,
                serviceDuration: selectedService.durationHours,
                memberEmail: currentUser.email,
                memberName: currentUser.name || currentUser.email,
                membershipCategory: memberData?.membershipCategory || 'standard',
                userGroups: currentUser.groups || [], // Include Cognito groups for life member discount check
                preferredDate: selectedDate.toISOString(),
                startTime: bookingData.startTime,
                numberOfPeople: parseInt(bookingData.numberOfPeople),
                specialRequirements: bookingData.specialRequirements,
                contactPerson: bookingData.contactPerson,
                contactPhone: bookingData.contactPhone,
                venue: bookingData.venue,
                bookingDate: new Date().toISOString(),
                totalAmount: totalAmount,
                cleaningFeeApplied: cleaningFeeApplied,
                cleaningFeeAmount: cleaningFeeApplied ? cleaningFee.amount : 0,
                lifeMemberDiscount: lifeMemberDiscount,
                isLifeMember: isLifeMember,
                status: 'pending'
            };

            const response = await authenticatedFetch(API_CONFIG.getURL(API_CONFIG.endpoints.bookings), {
                method: 'POST',
                body: JSON.stringify(bookingPayload)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create booking');
            }

            const result = await response.json();

            // Save booking ID and create payment intent
            setCreatedBookingId(result.id);

            // Create payment intent for embedded form
            try {
                const paymentResponse = await authenticatedFetch(API_CONFIG.getURL(API_CONFIG.endpoints.bookings) + '/create-payment-intent', {
                    method: 'POST',
                    body: JSON.stringify({
                        bookingId: result.id,
                        amount: totalAmount
                    })
                });

                if (!paymentResponse.ok) {
                    throw new Error('Failed to create payment intent');
                }

                const { clientSecret: secret } = await paymentResponse.json();
                setClientSecret(secret);

                // Move to payment step
                setActiveStep(1);
                toast.success('Please complete your payment to confirm booking');

            } catch (paymentError) {
                console.error('Payment setup error:', paymentError);
                toast.error('Booking created but payment setup failed. Please contact admin.');
                // Could navigate to member portal with booking ID
                setTimeout(() => {
                    navigate('/member-portal');
                }, 2000);
            }

        } catch (error) {
            console.error('Error submitting booking:', error);
            toast.error(error.message || 'Failed to submit booking. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntent) => {
        try {
            // Update booking with payment status
            const response = await authenticatedFetch(API_CONFIG.getURL(API_CONFIG.endpoints.bookings) + `/${createdBookingId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    paymentStatus: 'paid',
                    paymentIntentId: paymentIntent.id,
                    paidAt: new Date().toISOString()
                })
            });

            if (response.ok) {
                toast.success('Payment successful! Your booking is confirmed.');

                // Send payment success email via bookings service
                const emailResponse = await authenticatedFetch(API_CONFIG.getURL(API_CONFIG.endpoints.bookings) + '/payment-confirmed', {
                    method: 'POST',
                    body: JSON.stringify({
                        bookingId: createdBookingId
                    })
                });

                setTimeout(() => {
                    navigate('/member-portal');
                }, 2000);
            }
        } catch (error) {
            console.error('Error updating booking:', error);
            toast.error('Payment processed but booking update failed. Please contact support.');
        }
    };

    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        toast.error('Payment failed. Please try again or contact support.');
    };

    const handleBackToDetails = () => {
        setActiveStep(0);
        setClientSecret(null);
    };

    if (loading) {
        return (
            <div className="book-services-wrapper">
                <ANMCHeader />
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                    <CircularProgress />
                </Box>
            </div>
        );
    }

    const totalAmount = calculateTotalAmount();
    const cleaningFeeApplied = shouldApplyCleaningFee();

    return (
        <div className="book-services-wrapper">
            <ANMCHeader />

            <div className="container" style={{ padding: '40px 20px' }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box className="page-header" sx={{ mb: 4 }}>
                            <Button
                                component={Link}
                                to="/member-portal"
                                className="back-button"
                                sx={{
                                    backgroundColor: '#1e3c72',
                                    color: 'white',
                                    mb: 2,
                                    '&:hover': {
                                        backgroundColor: '#2a5298'
                                    }
                                }}
                            >
                                ← Back to Portal
                            </Button>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Book Services / Anusthan
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Select a service and book your preferred date and time slot
                            </Typography>
                            <Alert severity="info" sx={{ mt: 2 }}>
                                <strong>Available Hours:</strong> Morning (8:00 AM - 12:00 PM) | Evening (5:00 PM - 9:00 PM)
                            </Alert>
                        </Box>
                    </Grid>

                    {!selectedService ? (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="h5" component="h2" className="section-title" sx={{ mb: 3 }}>
                                    Available Services
                                </Typography>
                            </Grid>

                            {services.length === 0 ? (
                                <Grid item xs={12}>
                                    <Alert severity="info">
                                        No services available at the moment. Please check back later.
                                    </Alert>
                                </Grid>
                            ) : (
                                services.map((service) => (
                                    <Grid item xs={12} md={6} lg={4} key={service.id}>
                                        <Card
                                            className="service-card"
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: 'transform 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 3
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                    <Chip
                                                        label={getCategoryLabel(service.category)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getCategoryColor(service.category),
                                                            color: 'white',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="h5"
                                                        color="primary"
                                                        sx={{ fontWeight: 'bold' }}
                                                    >
                                                        ${service.amount.toFixed(2)}
                                                    </Typography>
                                                </Box>

                                                <Typography variant="h6" component="h3" gutterBottom>
                                                    {service.anusthanName}
                                                </Typography>

                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        <strong>Duration:</strong> {formatDuration(service.durationHours)}
                                                    </Typography>
                                                    {service.notes && (
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                            <strong>Note:</strong> {service.notes}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </CardContent>
                                            <CardActions sx={{ p: 2, pt: 0 }}>
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    onClick={() => handleServiceSelect(service)}
                                                    sx={{
                                                        backgroundColor: '#1e3c72',
                                                        '&:hover': { backgroundColor: '#2a5298' }
                                                    }}
                                                >
                                                    Book This Service
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </>
                    ) : (
                        <Grid item xs={12}>
                            <Card className="booking-form-card">
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Typography variant="h5" component="h2">
                                            Book: {selectedService.anusthanName}
                                        </Typography>
                                        <Button
                                            variant="outlined"
                                            onClick={() => {
                                                setSelectedService(null);
                                                setAvailableSlots([]);
                                                setActiveStep(0);
                                                setClientSecret(null);
                                                setCreatedBookingId(null);
                                            }}
                                        >
                                            Change Service
                                        </Button>
                                    </Box>

                                    {/* Stepper */}
                                    <Box sx={{ mb: 4 }}>
                                        <Stepper activeStep={activeStep}>
                                            {steps.map((label) => (
                                                <Step key={label}>
                                                    <StepLabel>{label}</StepLabel>
                                                </Step>
                                            ))}
                                        </Stepper>
                                    </Box>

                                    {/* Show booking form or payment form based on active step */}
                                    {activeStep === 0 ? (
                                        <div>

                                    <Grid container spacing={3}>
                                        {/* Service Summary */}
                                        <Grid item xs={12} md={5}>
                                            <Card variant="outlined" sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                                                <Typography variant="h6" gutterBottom>
                                                    Service Summary
                                                </Typography>
                                                <Box sx={{ mt: 2 }}>
                                                    <Chip
                                                        label={getCategoryLabel(selectedService.category)}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getCategoryColor(selectedService.category),
                                                            color: 'white',
                                                            mb: 2
                                                        }}
                                                    />
                                                    <Typography variant="body1" gutterBottom>
                                                        <strong>Service:</strong> {selectedService.anusthanName}
                                                    </Typography>
                                                    <Typography variant="body1" gutterBottom>
                                                        <strong>Duration:</strong> {formatDuration(selectedService.durationHours)}
                                                    </Typography>
                                                    <Typography variant="body1" gutterBottom>
                                                        <strong>Base Price:</strong> ${selectedService.amount.toFixed(2)}
                                                    </Typography>

                                                    {isLifeMember && (
                                                        <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                                                            <Typography variant="body2">
                                                                <strong>Life Member Discount (50%)</strong>
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                -${getLifeMemberDiscount().toFixed(2)}
                                                            </Typography>
                                                        </Alert>
                                                    )}

                                                    {cleaningFeeApplied && (
                                                        <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2, mb: 2 }}>
                                                            <Typography variant="body2">
                                                                <strong>Cleaning Fee Applied</strong>
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                ${cleaningFee.amount.toFixed(2)} (More than 21 attendees)
                                                            </Typography>
                                                        </Alert>
                                                    )}

                                                    <Typography variant="h5" color="primary" sx={{ mt: 2 }}>
                                                        Total: ${totalAmount.toFixed(2)}
                                                    </Typography>

                                                    {selectedService.notes && (
                                                        <Alert severity="info" sx={{ mt: 2 }}>
                                                            {selectedService.notes}
                                                        </Alert>
                                                    )}
                                                </Box>
                                            </Card>
                                        </Grid>

                                        {/* Booking Form */}
                                        <Grid item xs={12} md={7}>
                                            <form onSubmit={handleSubmit}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="h6" gutterBottom>
                                                            Booking Details
                                                        </Typography>
                                                    </Grid>

                                                    {selectedService && selectedService.requiresSlotBooking !== false && (
                                                        <>
                                                            <Grid item xs={12} sm={6}>
                                                                <Box className="date-picker-container">
                                                                    <label className="date-picker-label">Select Date *</label>
                                                                    <DatePicker
                                                                        selected={selectedDate}
                                                                        onChange={handleDateChange}
                                                                        minDate={(() => {
                                                                            const tomorrow = new Date();
                                                                            tomorrow.setDate(tomorrow.getDate() + 1);
                                                                            return tomorrow;
                                                                        })()}
                                                                        className="date-picker"
                                                                        dateFormat="dd/MM/yyyy"
                                                                        placeholderText="Select a future date"
                                                                        required
                                                                    />
                                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                                                                        Only future dates can be booked
                                                                    </Typography>
                                                                </Box>
                                                            </Grid>

                                                            <Grid item xs={12} sm={6}>
                                                                <FormControl fullWidth required>
                                                                    <InputLabel>Select Time Slot *</InputLabel>
                                                                    <Select
                                                                        name="startTime"
                                                                        value={bookingData.startTime}
                                                                        onChange={handleChange}
                                                                        label="Select Time Slot *"
                                                                        disabled={loadingSlots || availableSlots.length === 0}
                                                                    >
                                                                        {loadingSlots ? (
                                                                            <MenuItem disabled>
                                                                                <CircularProgress size={20} /> Loading slots...
                                                                            </MenuItem>
                                                                        ) : availableSlots.length === 0 ? (
                                                                            <MenuItem disabled>No slots available for this day</MenuItem>
                                                                        ) : (
                                                                            availableSlots.map((slot, index) => (
                                                                                <MenuItem key={index} value={slot.startTime}>
                                                                                    {slot.display}
                                                                                </MenuItem>
                                                                            ))
                                                                        )}
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid>

                                                            {!loadingSlots && availableSlots.length === 0 && (
                                                                <Grid item xs={12}>
                                                                    <Alert severity="warning">
                                                                        <strong>No time slots available for this date.</strong> All slots are fully booked. Please select another date to see available time slots.
                                                                    </Alert>
                                                                </Grid>
                                                            )}
                                                        </>
                                                    )}

                                                    {selectedService && selectedService.requiresSlotBooking === false && (
                                                        <Grid item xs={12}>
                                                            <Alert severity="info">
                                                                This service does not require slot booking. You can submit your booking request directly.
                                                            </Alert>
                                                        </Grid>
                                                    )}

                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Number of People"
                                                            name="numberOfPeople"
                                                            type="number"
                                                            value={bookingData.numberOfPeople}
                                                            onChange={handleChange}
                                                            required
                                                            variant="outlined"
                                                            inputProps={{ min: 1 }}
                                                            helperText={parseInt(bookingData.numberOfPeople) > 21 ? "Cleaning fee will be applied" : ""}
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <FormControl fullWidth required>
                                                            <InputLabel>Venue</InputLabel>
                                                            <Select
                                                                name="venue"
                                                                value={bookingData.venue}
                                                                onChange={handleChange}
                                                                label="Venue"
                                                            >
                                                                <MenuItem value="Temple Premises">Temple Premises</MenuItem>
                                                                <MenuItem value="Home Visit">Home Visit</MenuItem>
                                                                <MenuItem value="Other Location">Other Location</MenuItem>
                                                            </Select>
                                                        </FormControl>
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <TextField
                                                            fullWidth
                                                            label="Special Requirements"
                                                            name="specialRequirements"
                                                            value={bookingData.specialRequirements}
                                                            onChange={handleChange}
                                                            multiline
                                                            rows={3}
                                                            variant="outlined"
                                                            placeholder="Any special requirements or dietary restrictions..."
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Contact Person"
                                                            name="contactPerson"
                                                            value={bookingData.contactPerson}
                                                            onChange={handleChange}
                                                            required
                                                            variant="outlined"
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <TextField
                                                            fullWidth
                                                            label="Contact Phone"
                                                            name="contactPhone"
                                                            value={bookingData.contactPhone}
                                                            onChange={handleChange}
                                                            required
                                                            variant="outlined"
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <Alert severity="info" sx={{ mb: 2 }}>
                                                            Your booking request will be reviewed by our team. You will receive a confirmation call within 24 hours.
                                                            {cleaningFeeApplied && (
                                                                <>
                                                                    <br /><br />
                                                                    <strong>Note:</strong> A cleaning fee of ${cleaningFee.amount.toFixed(2)} has been added due to more than 21 attendees.
                                                                </>
                                                            )}
                                                        </Alert>
                                                    </Grid>

                                                    <Grid item xs={12}>
                                                        <Button
                                                            type="submit"
                                                            variant="contained"
                                                            fullWidth
                                                            size="large"
                                                            disabled={submitting || (selectedService?.requiresSlotBooking !== false && !bookingData.startTime)}
                                                            sx={{
                                                                backgroundColor: '#1e3c72',
                                                                '&:hover': { backgroundColor: '#2a5298' },
                                                                py: 1.5,
                                                                fontSize: '1.1rem'
                                                            }}
                                                        >
                                                            {submitting ? (
                                                                <CircularProgress size={24} color="inherit" />
                                                            ) : (
                                                                `Submit Booking - $${totalAmount.toFixed(2)}`
                                                            )}
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                            </form>
                                        </Grid>
                                    </Grid>
                                    </div>
                                    ) : (
                                        /* Payment Step */
                                        <Box>
                                            <Alert severity="info" sx={{ mb: 3 }}>
                                                Your booking has been created. Please complete payment to confirm.
                                            </Alert>

                                            <Box sx={{ mb: 3, p: 3, backgroundColor: '#f5f9ff', borderRadius: 2 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    Booking Summary
                                                </Typography>
                                                <Typography variant="body1">
                                                    <strong>Service:</strong> {selectedService.anusthanName}
                                                </Typography>
                                                {selectedService.requiresSlotBooking !== false && (
                                                    <>
                                                        <Typography variant="body1">
                                                            <strong>Date:</strong> {selectedDate.toLocaleDateString('en-AU')}
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            <strong>Time:</strong> {bookingData.startTime}
                                                        </Typography>
                                                    </>
                                                )}
                                                <Typography variant="body1">
                                                    <strong>Attendees:</strong> {bookingData.numberOfPeople}
                                                </Typography>
                                                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                                                    <strong>Total:</strong> ${calculateTotalAmount().toFixed(2)} AUD
                                                </Typography>
                                            </Box>

                                            {clientSecret && (
                                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                                    <PaymentForm
                                                        amount={calculateTotalAmount()}
                                                        bookingId={createdBookingId}
                                                        onSuccess={handlePaymentSuccess}
                                                        onError={handlePaymentError}
                                                    />
                                                </Elements>
                                            )}

                                            <Button
                                                variant="outlined"
                                                onClick={handleBackToDetails}
                                                sx={{ mt: 2 }}
                                            >
                                                ← Back to Details
                                            </Button>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    )}
                </Grid>
            </div>
        </div>
    );
};

export default BookServices;
