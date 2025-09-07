import React from 'react';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Link } from "react-router-dom";

import logo from '../../images/logo.png';
import './style.css';

const MemberPortal = () => {
    const memberData = {
        name: "John Doe",
        email: "user@gmail.com",
        membershipId: "ANMC-2024-001",
        joinDate: "January 2024"
    };

    const features = [
        {
            icon: "👤",
            title: "Update Details",
            description: "Modify your contact information",
            link: "/member/update-details",
            color: "#1e3c72"
        },
        {
            icon: "🏛️",
            title: "Book Services",
            description: "Book Car Puja, Marriage, Bartabhanda",
            link: "/member/book-services",
            color: "#2a5298"
        },
        {
            icon: "💳",
            title: "Make Donation",
            description: "Secure donations via Stripe",
            link: "/member/donate",
            color: "#1e3c72"
        },
        {
            icon: "📋",
            title: "My Bookings",
            description: "View booking history and receipts",
            link: "/member/bookings",
            color: "#2a5298"
        },
        {
            icon: "📄",
            title: "Member Documents",
            description: "Download certificates and official documents",
            link: "/member/documents",
            color: "#1e3c72"
        }
    ];

    return (
        <div className="member-portal-wrapper">
            <AppBar position="static" className="anmc-header" sx={{ backgroundColor: '#1e3c72', mb: 2 }}>
                <Toolbar sx={{ justifyContent: 'space-between', alignItems: 'center', minHeight: '80px !important' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <img src={logo} alt="ANMC Logo" className="header-logo" />
                        <Box className="header-text" sx={{ ml: 2 }}>
                            <Typography variant="h5" component="div" sx={{ color: 'white', fontWeight: 600, lineHeight: 1.2 }}>
                                Australian Nepalese Multicultural Centre
                            </Typography>
                            <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 500, opacity: 0.9 }}>
                                (ANMC)
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', marginTop: '2px' }}>
                                Member Portal
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button 
                            component={Link} 
                            to="/home"
                            variant="outlined"
                            sx={{ 
                                color: 'white',
                                borderColor: 'rgba(255,255,255,0.3)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    borderColor: 'rgba(255,255,255,0.5)'
                                }
                            }}
                        >
                            🏠 Home
                        </Button>
                        <Button 
                            component={Link} 
                            to="/login"
                            variant="outlined"
                            sx={{ 
                                color: 'white',
                                borderColor: 'rgba(255,255,255,0.3)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255,255,255,0.1)',
                                    borderColor: 'rgba(255,255,255,0.5)'
                                }
                            }}
                        >
                            🚪 Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            
            <div className="container">
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Box className="member-header">
                            <Avatar 
                                sx={{ width: 80, height: 80, bgcolor: '#1e3c72', fontSize: '2rem' }}
                            >
                                {memberData.name.split(' ').map(n => n[0]).join('')}
                            </Avatar>
                            <Box className="member-info">
                                <Typography variant="h4" component="h1">
                                    Welcome, {memberData.name}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Member ID: {memberData.membershipId}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Member since: {memberData.joinDate}
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h5" component="h2" className="section-title">
                            Member Features
                        </Typography>
                    </Grid>

                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card className="feature-card" sx={{ height: '100%' }}>
                                <CardContent className="feature-content">
                                    <Box className="feature-icon" style={{ backgroundColor: feature.color }}>
                                        <Typography variant="h3" component="div">
                                            {feature.icon}
                                        </Typography>
                                    </Box>
                                    <Typography variant="h6" component="h3" className="feature-title">
                                        {feature.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" className="feature-description">
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                                <CardActions className="feature-actions">
                                    <Button 
                                        component={Link} 
                                        to={feature.link}
                                        variant="contained"
                                        fullWidth
                                        sx={{ backgroundColor: feature.color, '&:hover': { opacity: 0.8 } }}
                                    >
                                        Access Feature
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}

                    <Grid item xs={12}>
                        <Card className="quick-stats">
                            <CardContent>
                                <Typography variant="h6" component="h3" gutterBottom>
                                    Quick Stats
                                </Typography>
                                <Grid container spacing={3}>
                                    <Grid item xs={12} sm={4}>
                                        <Box className="stat-item">
                                            <Typography variant="h4" component="div" color="primary">
                                                3
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Active Bookings
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box className="stat-item">
                                            <Typography variant="h4" component="div" color="primary">
                                                ₹15,000
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Donations
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box className="stat-item">
                                            <Typography variant="h4" component="div" color="primary">
                                                12
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Services Booked
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
        </div>
    );
};

export default MemberPortal;