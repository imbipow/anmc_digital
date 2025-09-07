import React, { useState } from 'react';
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
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

import ANMCHeader from '../../components/ANMCHeader';
import "react-datepicker/dist/react-datepicker.css";
import './style.css';

const BookServices = () => {
    const [selectedService, setSelectedService] = useState('');
    const [bookingData, setBookingData] = useState({
        serviceType: '',
        preferredDate: new Date(),
        alternateDate: new Date(),
        numberOfPeople: '',
        specialRequirements: '',
        contactPerson: 'John Doe',
        contactPhone: '+91-9876543210',
        venue: 'Temple Premises'
    });

    const services = [
        {
            id: 'car-puja',
            title: 'Car Puja',
            icon: '🚗',
            description: 'Vehicle blessing ceremony for new cars and bikes',
            duration: '1-2 hours',
            price: '₹2,100',
            includes: ['Puja materials', 'Priest service', 'Prasadam', 'Certificate']
        },
        {
            id: 'marriage',
            title: 'Marriage Ceremony',
            icon: '💒',
            description: 'Complete wedding ceremony as per traditions',
            duration: '3-4 hours',
            price: '₹15,000',
            includes: ['Complete puja setup', 'Priest service', 'Marriage certificate', 'Photography coordination']
        },
        {
            id: 'bartabhanda',
            title: 'Bartabhanda',
            icon: '👨‍👦',
            description: 'Sacred thread ceremony for young men',
            duration: '4-5 hours',
            price: '₹8,500',
            includes: ['Sacred thread', 'Puja materials', 'Priest service', 'Feast coordination', 'Certificate']
        }
    ];

    const handleServiceSelect = (serviceId) => {
        setSelectedService(serviceId);
        setBookingData({
            ...bookingData,
            serviceType: serviceId
        });
    };

    const handleChange = (e) => {
        setBookingData({
            ...bookingData,
            [e.target.name]: e.target.value
        });
    };

    const handleDateChange = (date, field) => {
        setBookingData({
            ...bookingData,
            [field]: date
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedService) {
            toast.error('Please select a service first');
            return;
        }
        toast.success('Booking request submitted successfully! You will receive a confirmation call within 24 hours.');
        
        setBookingData({
            serviceType: '',
            preferredDate: new Date(),
            alternateDate: new Date(),
            numberOfPeople: '',
            specialRequirements: '',
            contactPerson: 'John Doe',
            contactPhone: '+91-9876543210',
            venue: 'Temple Premises'
        });
        setSelectedService('');
    };

    const selectedServiceData = services.find(service => service.id === selectedService);

    return (
        <div className="book-services-wrapper">
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
                                🏛️ Book Services
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Book Car Puja, Marriage, or Bartabhanda ceremonies
                            </Typography>
                        </Box>
                    </Grid>

                    {!selectedService ? (
                        <>
                            <Grid item xs={12}>
                                <Typography variant="h5" component="h2" className="section-title">
                                    Select a Service
                                </Typography>
                            </Grid>

                            {services.map((service) => (
                                <Grid item xs={12} md={4} key={service.id}>
                                    <Card className="service-card">
                                        <CardContent className="service-content">
                                            <Box className="service-icon">
                                                <Typography variant="h2" component="div">
                                                    {service.icon}
                                                </Typography>
                                            </Box>
                                            <Typography variant="h5" component="h3" className="service-title">
                                                {service.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" className="service-description">
                                                {service.description}
                                            </Typography>
                                            <Box className="service-details">
                                                <Typography variant="body2">
                                                    <strong>Duration:</strong> {service.duration}
                                                </Typography>
                                                <Typography variant="h6" color="primary" className="service-price">
                                                    {service.price}
                                                </Typography>
                                            </Box>
                                            <Box className="service-includes">
                                                <Typography variant="body2" className="includes-title">
                                                    <strong>Includes:</strong>
                                                </Typography>
                                                {service.includes.map((item, index) => (
                                                    <Typography variant="body2" key={index} className="include-item">
                                                        • {item}
                                                    </Typography>
                                                ))}
                                            </Box>
                                        </CardContent>
                                        <CardActions className="service-actions">
                                            <Button 
                                                variant="contained"
                                                fullWidth
                                                onClick={() => handleServiceSelect(service.id)}
                                                sx={{ backgroundColor: '#1e3c72', '&:hover': { backgroundColor: '#2a5298' } }}
                                            >
                                                Book This Service
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </>
                    ) : (
                        <Grid item xs={12}>
                            <Card className="booking-form-card">
                                <CardContent>
                                    <Box className="form-header">
                                        <Typography variant="h5" component="h2">
                                            Book {selectedServiceData.title}
                                        </Typography>
                                        <Button 
                                            variant="outlined" 
                                            onClick={() => setSelectedService('')}
                                        >
                                            Change Service
                                        </Button>
                                    </Box>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={6}>
                                            <Card className="service-summary">
                                                <CardContent>
                                                    <Box className="summary-icon">
                                                        {selectedServiceData.icon}
                                                    </Box>
                                                    <Typography variant="h6">
                                                        {selectedServiceData.title}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {selectedServiceData.description}
                                                    </Typography>
                                                    <Typography variant="h5" color="primary" className="summary-price">
                                                        {selectedServiceData.price}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>

                                        <Grid item xs={12} md={6}>
                                            <form onSubmit={handleSubmit}>
                                                <Grid container spacing={2}>
                                                    <Grid item xs={12}>
                                                        <Typography variant="h6" gutterBottom>
                                                            Booking Details
                                                        </Typography>
                                                    </Grid>
                                                    
                                                    <Grid item xs={12} sm={6}>
                                                        <Box className="date-picker-container">
                                                            <label className="date-picker-label">Preferred Date</label>
                                                            <DatePicker
                                                                selected={bookingData.preferredDate}
                                                                onChange={(date) => handleDateChange(date, 'preferredDate')}
                                                                minDate={new Date()}
                                                                className="date-picker"
                                                                dateFormat="dd/MM/yyyy"
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    
                                                    <Grid item xs={12} sm={6}>
                                                        <Box className="date-picker-container">
                                                            <label className="date-picker-label">Alternate Date</label>
                                                            <DatePicker
                                                                selected={bookingData.alternateDate}
                                                                onChange={(date) => handleDateChange(date, 'alternateDate')}
                                                                minDate={new Date()}
                                                                className="date-picker"
                                                                dateFormat="dd/MM/yyyy"
                                                            />
                                                        </Box>
                                                    </Grid>

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
                                                        />
                                                    </Grid>

                                                    <Grid item xs={12} sm={6}>
                                                        <FormControl fullWidth>
                                                            <InputLabel>Venue</InputLabel>
                                                            <Select
                                                                name="venue"
                                                                value={bookingData.venue}
                                                                onChange={handleChange}
                                                                label="Venue"
                                                            >
                                                                <MenuItem value="Temple Premises">Temple Premises</MenuItem>
                                                                <MenuItem value="Home Visit">Home Visit (+₹500)</MenuItem>
                                                                <MenuItem value="Other Location">Other Location (+₹1000)</MenuItem>
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
                                                        <Button 
                                                            type="submit"
                                                            variant="contained"
                                                            fullWidth
                                                            size="large"
                                                            sx={{ 
                                                                backgroundColor: '#1e3c72',
                                                                '&:hover': { backgroundColor: '#2a5298' },
                                                                py: 1.5,
                                                                fontSize: '1.1rem'
                                                            }}
                                                        >
                                                            Submit Booking Request
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                            </form>
                                        </Grid>
                                    </Grid>
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