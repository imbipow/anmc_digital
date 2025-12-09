import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Typography,
    CircularProgress,
    Paper,
    Card,
    CardContent,
    CardHeader
} from '@mui/material';
import {
    PeopleOutlined,
    BookOnlineOutlined,
    InboxOutlined,
    VolunteerActivismOutlined
} from '@mui/icons-material';
import { useRedirect } from 'react-admin';
import cognitoAuthService from '../../services/cognitoAuth';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

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

const StatCard = ({ title, value, icon: Icon, color, loading, onClick }) => (
    <Paper
        elevation={3}
        onClick={onClick}
        sx={{
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            height: '100%',
            minHeight: '120px',
            borderLeft: `4px solid ${color}`,
            cursor: onClick ? 'pointer' : 'default',
            transition: 'all 0.3s ease',
            '&:hover': onClick ? {
                transform: 'translateY(-4px)',
                boxShadow: 6,
                backgroundColor: '#f9f9f9'
            } : {}
        }}
    >
        <Box
            sx={{
                backgroundColor: `${color}20`,
                borderRadius: '50%',
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}
        >
            <Icon sx={{ fontSize: 40, color }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                {title}
            </Typography>
            {loading ? (
                <CircularProgress size={24} />
            ) : (
                <Typography
                    variant="h4"
                    component="div"
                    sx={{
                        fontWeight: 'bold',
                        wordBreak: 'break-word'
                    }}
                >
                    {value}
                </Typography>
            )}
        </Box>
    </Paper>
);

const Dashboard = () => {
    const redirect = useRedirect();
    const [stats, setStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        totalBookings: 0,
        pendingBookings: 0,
        totalMessages: 0,
        unreadMessages: 0,
        totalDonations: 0,
        donationAmount: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setError(null);

                // Fetch members counts (optimized endpoint - only returns counts, not full data)
                try {
                    const membersCountsResponse = await authenticatedFetch(`${API_BASE_URL}/members/counts`);
                    if (membersCountsResponse.ok) {
                        const memberCounts = await membersCountsResponse.json();
                        setStats(prev => ({
                            ...prev,
                            totalMembers: memberCounts.total || 0,
                            activeMembers: memberCounts.active || 0
                        }));
                    } else if (membersCountsResponse.status === 429) {
                        console.warn('Rate limited on members/counts - using cached data');
                    }
                } catch (err) {
                    console.error('Error fetching member counts:', err);
                }

                // Add small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

                // Fetch bookings counts (optimized endpoint - only returns counts, not full data)
                try {
                    const bookingsCountsResponse = await authenticatedFetch(`${API_BASE_URL}/bookings/counts`);
                    if (bookingsCountsResponse.ok) {
                        const bookingCounts = await bookingsCountsResponse.json();
                        const pendingBookings = (bookingCounts.pending || 0) + (bookingCounts.confirmed || 0);
                        setStats(prev => ({
                            ...prev,
                            totalBookings: bookingCounts.total || 0,
                            pendingBookings
                        }));
                    } else if (bookingsCountsResponse.status === 429) {
                        console.warn('Rate limited on bookings/counts - using cached data');
                    }
                } catch (err) {
                    console.error('Error fetching booking counts:', err);
                }

                // Add small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

                // Fetch messages stats
                try {
                    const messagesResponse = await authenticatedFetch(`${API_BASE_URL}/messages`);
                    if (messagesResponse.ok) {
                        const messages = await messagesResponse.json();
                        // Filter contact messages only (exclude sent broadcasts)
                        const contactMessages = messages.filter(m => m.type === 'contact');
                        const unreadMessages = contactMessages.filter(m => m.status === 'unread').length;
                        setStats(prev => ({
                            ...prev,
                            totalMessages: contactMessages.length,
                            unreadMessages
                        }));
                    } else if (messagesResponse.status === 429) {
                        console.warn('Rate limited on messages - using cached data');
                    }
                } catch (err) {
                    console.error('Error fetching messages stats:', err);
                }

                // Add small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 100));

                // Fetch donations stats
                try {
                    const donationsResponse = await authenticatedFetch(`${API_BASE_URL}/donations`);
                    if (donationsResponse.ok) {
                        const donations = await donationsResponse.json();
                        const totalAmount = donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
                        setStats(prev => ({
                            ...prev,
                            totalDonations: donations.length,
                            donationAmount: totalAmount
                        }));
                    } else if (donationsResponse.status === 429) {
                        console.warn('Rate limited on donations - using cached data');
                    }
                } catch (err) {
                    console.error('Error fetching donations stats:', err);
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
                setError('Failed to load some statistics. Please refresh the page.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <Card>
            <CardHeader title="Dashboard Overview" />
            <CardContent>
                <Grid container spacing={3}>
                    {/* Members Stats */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Total Members"
                            value={stats.totalMembers}
                            icon={PeopleOutlined}
                            color="#1e3c72"
                            loading={loading}
                            onClick={() => redirect('list', 'members')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Active Members"
                            value={stats.activeMembers}
                            icon={PeopleOutlined}
                            color="#4caf50"
                            loading={loading}
                            onClick={() => redirect('list', 'members')}
                        />
                    </Grid>

                    {/* Bookings Stats */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Total Bookings"
                            value={stats.totalBookings}
                            icon={BookOnlineOutlined}
                            color="#2196f3"
                            loading={loading}
                            onClick={() => redirect('list', 'bookings')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Pending Bookings"
                            value={stats.pendingBookings}
                            icon={BookOnlineOutlined}
                            color="#ff9800"
                            loading={loading}
                            onClick={() => redirect('list', 'bookings')}
                        />
                    </Grid>

                    {/* Messages Stats */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Total Messages"
                            value={stats.totalMessages}
                            icon={InboxOutlined}
                            color="#9c27b0"
                            loading={loading}
                            onClick={() => redirect('list', 'inbox')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Unread Messages"
                            value={stats.unreadMessages}
                            icon={InboxOutlined}
                            color="#f44336"
                            loading={loading}
                            onClick={() => redirect('list', 'inbox')}
                        />
                    </Grid>

                    {/* Donations Stats */}
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Total Donations"
                            value={stats.totalDonations}
                            icon={VolunteerActivismOutlined}
                            color="#ff5722"
                            loading={loading}
                            onClick={() => redirect('list', 'donations')}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                        <StatCard
                            title="Total Amount"
                            value={`$${stats.donationAmount.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                            icon={VolunteerActivismOutlined}
                            color="#4caf50"
                            loading={loading}
                            onClick={() => redirect('list', 'donations')}
                        />
                    </Grid>
                </Grid>

                {/* Additional info section */}
                <Box sx={{ mt: 4 }}>
                    <Paper elevation={2} sx={{ p: 3, backgroundColor: '#f5f5f5' }}>
                        <Typography variant="h6" gutterBottom>
                            Quick Actions
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Click on any stat card above to navigate to that section. Use the sidebar menu to access all admin features.
                        </Typography>
                    </Paper>
                </Box>
            </CardContent>
        </Card>
    );
};

export default Dashboard;
