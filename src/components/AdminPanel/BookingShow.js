import React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    DateField,
    NumberField,
    BooleanField,
    EmailField,
    FunctionField,
    TopToolbar,
    EditButton,
    DeleteButton,
    useRecordContext
} from 'react-admin';
import { Card, CardContent, Typography, Grid, Chip, Box, Divider } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const statusColors = {
    pending: '#ff9800',
    confirmed: '#2196f3',
    completed: '#4caf50',
    cancelled: '#f44336'
};

const ShowActions = () => (
    <TopToolbar>
        <EditButton />
        <DeleteButton />
    </TopToolbar>
);

const BookingTitle = () => {
    const record = useRecordContext();
    return <span>Booking #{record ? record.id : ''}</span>;
};

const BookingDetails = () => {
    const record = useRecordContext();
    if (!record) return null;

    const formatTime = (timeStr) => {
        if (!timeStr) return '-';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        return `${displayHour}:${minutes} ${period}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Grid container spacing={3}>
                {/* Status Card */}
                <Grid item xs={12}>
                    <Card sx={{ backgroundColor: '#f5f5f5' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">Booking Status</Typography>
                                <Chip
                                    label={record.status.toUpperCase()}
                                    sx={{
                                        backgroundColor: statusColors[record.status],
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: '1rem',
                                        px: 2,
                                        py: 1
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Service Details */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                Service Details
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Service Name
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {record.serviceName}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Duration
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {record.serviceDuration} hours
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventIcon color="action" />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Date
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {formatDate(record.preferredDate)}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTimeIcon color="action" />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Time Slot
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {formatTime(record.startTime)} ({record.serviceDuration} hours)
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOnIcon color="action" />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Venue
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {record.venue}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PeopleIcon color="action" />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Number of Attendees
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {record.numberOfPeople} people
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Member Details */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                Contact Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Member Name
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {record.memberName}
                                </Typography>
                            </Box>

                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EmailIcon color="action" />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {record.memberEmail}
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Contact Person
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {record.contactPerson}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <PhoneIcon color="action" />
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Contact Phone
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {record.contactPhone}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Pricing Details */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom color="primary">
                                Pricing Details
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Service Amount
                                        </Typography>
                                        <Typography variant="h5" color="primary" fontWeight="bold">
                                            ${record.serviceAmount.toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {record.cleaningFeeApplied && (
                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#fff3e0', borderRadius: 2 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                Cleaning Fee
                                            </Typography>
                                            <Typography variant="h5" color="warning.main" fontWeight="bold">
                                                ${record.cleaningFeeAmount.toFixed(2)}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}

                                <Grid item xs={12} md={record.cleaningFeeApplied ? 4 : 8}>
                                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: '#e8f5e9', borderRadius: 2 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Amount
                                        </Typography>
                                        <Typography variant="h4" color="success.main" fontWeight="bold">
                                            ${record.totalAmount.toFixed(2)}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Special Requirements */}
                {record.specialRequirements && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom color="primary">
                                    Special Requirements
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="body1">
                                    {record.specialRequirements}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Booking Metadata */}
                <Grid item xs={12}>
                    <Card sx={{ backgroundColor: '#fafafa' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Booking Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Booking ID
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {record.id}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Booked On
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {new Date(record.createdAt).toLocaleString('en-AU')}
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <Typography variant="body2" color="text.secondary">
                                        Last Updated
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold">
                                        {new Date(record.updatedAt).toLocaleString('en-AU')}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export const BookingShow = (props) => (
    <Show {...props} title={<BookingTitle />} actions={<ShowActions />}>
        <BookingDetails />
    </Show>
);

export default BookingShow;
