import React, { useState, useEffect } from 'react';
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
import CircularProgress from "@mui/material/CircularProgress";
import { Link, useNavigate } from "react-router-dom";
import { useMemberAuth } from '../../components/MemberAuth';
import { toast } from 'react-toastify';
import cognitoAuthService from '../../services/cognitoAuth';

import logo from '../../images/logo.png';
import './style.css';

const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to make authenticated API calls
const authenticatedFetch = async (url, options = {}) => {
    try {
        const token = await cognitoAuthService.getIdToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
    } catch (error) {
        console.error('Auth fetch error:', error);
        throw error;
    }
};

const MemberPortal = () => {
    const navigate = useNavigate();
    const { currentUser, logout } = useMemberAuth();
    const [memberData, setMemberData] = useState(null);
    const [stats, setStats] = useState({
        activeBookings: 0,
        totalBookings: 0,
        completedBookings: 0
    });
    const [loading, setLoading] = useState(true);
    const [userGroups, setUserGroups] = useState([]);

    useEffect(() => {
        const fetchMemberData = async () => {
            if (!currentUser || !currentUser.email) {
                setLoading(false);
                return;
            }

            try {
                // Get user groups to determine access
                const groups = currentUser.groups || [];
                setUserGroups(groups);
                console.log('User groups:', groups);

                const isAnmcUser = groups.includes('AnmcUsers');
                const isAnmcMember = groups.includes('AnmcMembers');

                if (isAnmcUser && !isAnmcMember) {
                    // AnmcUsers don't have member records - create user data from Cognito
                    const userData = {
                        firstName: currentUser.given_name || currentUser.name?.split(' ')[0] || '',
                        lastName: currentUser.family_name || currentUser.name?.split(' ').slice(1).join(' ') || '',
                        email: currentUser.email,
                        referenceNo: 'N/A',
                        createdAt: new Date().toISOString(),
                        membershipCategory: 'User',
                        status: 'active',
                        isAnmcUser: true
                    };
                    setMemberData(userData);
                } else {
                    // Fetch member data from API for AnmcMembers
                    const memberResponse = await authenticatedFetch(`${API_BASE_URL}/members?email=${currentUser.email}`);
                    if (memberResponse.ok) {
                        const members = await memberResponse.json();
                        if (members && members.length > 0) {
                            setMemberData(members[0]);
                        }
                    }
                }

                // Fetch booking statistics
                const bookingsResponse = await authenticatedFetch(`${API_BASE_URL}/bookings?memberEmail=${currentUser.email}`);
                if (bookingsResponse.ok) {
                    const bookings = await bookingsResponse.json();

                    const activeBookings = bookings.filter(b =>
                        b.status === 'confirmed' || b.status === 'pending'
                    ).length;

                    const completedBookings = bookings.filter(b =>
                        b.status === 'completed'
                    ).length;

                    setStats({
                        activeBookings,
                        totalBookings: bookings.length,
                        completedBookings
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to load member data');
            } finally {
                setLoading(false);
            }
        };

        fetchMemberData();
    }, [currentUser]);

    const handleLogout = async () => {
        await logout();
        toast.success('Successfully logged out');
        navigate('/login');
    };

    // Fallback member data from Cognito if API data not loaded
    const displayMemberData = memberData || {
        firstName: currentUser?.attributes?.given_name || currentUser?.email?.split('@')[0] || "Member",
        lastName: currentUser?.attributes?.family_name || "",
        referenceNo: "Loading...",
        createdAt: currentUser?.attributes?.['custom:join_date'] || "2024"
    };

    const memberName = `${displayMemberData.firstName} ${displayMemberData.lastName}`.trim();

    // Check if user is in AnmcMembers group (has access to documents)
    const isAnmcMember = userGroups.includes('AnmcMembers');
    const isAnmcUser = userGroups.includes('AnmcUsers');

    // Define features based on user type
    const allFeatures = [
        {
            icon: "👤",
            title: "Update Details",
            description: "Modify your contact information",
            link: "/member/update-details",
            color: "#1e3c72",
            showFor: ['member', 'user'] // Show for both
        },
        {
            icon: "🏛️",
            title: "Book Services",
            description: "Book Car Puja, Marriage, Bartabhanda",
            link: "/member/book-services",
            color: "#2a5298",
            showFor: ['member', 'user'] // Show for both
        },
        {
            icon: "📋",
            title: "My Bookings",
            description: "View booking history and receipts",
            link: "/member/bookings",
            color: "#2a5298",
            showFor: ['member', 'user'] // Show for both
        },
        {
            icon: "📄",
            title: "Member Documents",
            description: "Download certificates and official documents",
            link: "/member/documents",
            color: "#1e3c72",
            showFor: ['member'] // Only show for members
        }
    ];

    // Filter features based on user type
    const features = allFeatures.filter(feature => {
        if (isAnmcMember) {
            return feature.showFor.includes('member');
        } else if (isAnmcUser) {
            return feature.showFor.includes('user');
        }
        // Default: show features for both (fallback)
        return true;
    });

    if (loading) {
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
                    </Toolbar>
                </AppBar>
                <div className="container">
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                        <CircularProgress size={60} />
                    </Box>
                </div>
            </div>
        );
    }

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
                                {isAnmcMember ? 'Member Portal' : isAnmcUser ? 'User Portal' : 'Portal'}
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
                            onClick={handleLogout}
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
                                {memberName.split(' ').map(n => n[0]).filter(l => l).join('').toUpperCase()}
                            </Avatar>
                            <Box className="member-info">
                                <Typography variant="h4" component="h1">
                                    Welcome, {memberName}
                                </Typography>
                                {isAnmcMember && (
                                    <>
                                        <Typography variant="body1" color="text.secondary">
                                            Member ID: {displayMemberData.referenceNo || 'N/A'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Member since: {displayMemberData.createdAt ? new Date(displayMemberData.createdAt).getFullYear() : 'N/A'}
                                        </Typography>
                                    </>
                                )}
                                {isAnmcUser && (
                                    <Typography variant="body2" color="text.secondary">
                                        Account Type: Regular User
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="h5" component="h2" className="section-title">
                            {isAnmcMember ? 'Member Features' : 'Available Features'}
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
                                                {stats.activeBookings}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Active Bookings
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box className="stat-item">
                                            <Typography variant="h4" component="div" color="primary">
                                                {stats.completedBookings}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Completed Services
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Box className="stat-item">
                                            <Typography variant="h4" component="div" color="primary">
                                                {stats.totalBookings}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Bookings
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