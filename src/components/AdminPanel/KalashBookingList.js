import React, { useState, useEffect } from 'react';
import {
    List,
    Datagrid,
    TextField,
    DateField,
    NumberField,
    EmailField,
    ChipField,
    FunctionField,
    EditButton,
    DeleteButton,
    FilterButton,
    TopToolbar,
    SelectColumnsButton,
    ExportButton,
    TextInput,
    SelectInput,
    useDataProvider
} from 'react-admin';
import { Chip, Box, Card, CardContent, Typography, Grid } from '@mui/material';
import { tableHeaderStyles } from './commonTableStyles';
import API_CONFIG from '../../config/api';

const ListActions = () => {
    return (
        <TopToolbar>
            <FilterButton />
            <SelectColumnsButton />
            <ExportButton />
        </TopToolbar>
    );
};

const statusColors = {
    pending: '#ff9800',
    confirmed: '#4caf50',
    cancelled: '#f44336'
};

const paymentStatusColors = {
    pending: '#ff9800',
    paid: '#4caf50',
    failed: '#f44336'
};

const StatusField = ({ record, source }) => {
    if (!record || !record[source]) return null;

    const colors = source === 'paymentStatus' ? paymentStatusColors : statusColors;

    return (
        <Chip
            label={record[source].toUpperCase()}
            size="small"
            sx={{
                backgroundColor: colors[record[source]],
                color: 'white',
                fontWeight: 'bold'
            }}
        />
    );
};

const kalashFilters = [
    <TextInput key="name" label="Search by Name" source="name" alwaysOn />,
    <TextInput key="email" label="Search by Email" source="email" alwaysOn />,
    <SelectInput
        key="status"
        label="Status"
        source="status"
        choices={[
            { id: 'pending', name: 'Pending' },
            { id: 'confirmed', name: 'Confirmed' },
            { id: 'cancelled', name: 'Cancelled' }
        ]}
    />,
    <SelectInput
        key="paymentStatus"
        label="Payment Status"
        source="paymentStatus"
        choices={[
            { id: 'pending', name: 'Pending' },
            { id: 'paid', name: 'Paid' },
            { id: 'failed', name: 'Failed' }
        ]}
    />
];

const KalashStats = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Add authentication headers
                const token = localStorage.getItem('idToken');
                const headers = {
                    'Content-Type': 'application/json'
                };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(API_CONFIG.getURL(API_CONFIG.endpoints.kalashBookingStats), {
                    headers
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Kalash Stats received:', data);
                setStats(data);
            } catch (error) {
                console.error('Error fetching Kalash stats:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <Box sx={{ mb: 3, p: 3, textAlign: 'center' }}>
                <Typography>Loading statistics...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ mb: 3, p: 3, backgroundColor: '#ffebee', borderRadius: 2 }}>
                <Typography color="error">Error loading statistics: {error}</Typography>
            </Box>
        );
    }

    if (!stats) return null;

    const remaining = stats.remainingInventory || 0;
    const sold = stats.totalKalashSold || 0;
    const percentSold = stats.maxInventory ? ((sold / stats.maxInventory) * 100).toFixed(1) : 0;

    return (
        <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Kalash Sold
                            </Typography>
                            <Typography variant="h4" component="div">
                                {sold}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                out of {stats.maxInventory}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Remaining Inventory
                            </Typography>
                            <Typography variant="h4" component="div" sx={{ color: remaining < 50 ? '#d32f2f' : '#2e7d32' }}>
                                {remaining}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                {percentSold}% sold
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Total Revenue
                            </Typography>
                            <Typography variant="h4" component="div">
                                ${stats.totalRevenue?.toFixed(0) || 0}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                AUD
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Typography color="textSecondary" gutterBottom>
                                Paid Bookings
                            </Typography>
                            <Typography variant="h4" component="div">
                                {stats.paid || 0}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                                of {stats.total} total
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export const KalashBookingList = (props) => (
    <List
        {...props}
        actions={<ListActions />}
        filters={kalashFilters}
        sort={{ field: 'createdAt', order: 'DESC' }}
        perPage={25}
        title="Kalash Bookings"
    >
        <KalashStats />
        <Datagrid
            bulkActionButtons={false}
            sx={tableHeaderStyles}
            rowClick="edit"
        >
            <TextField source="id" label="Booking ID" />
            <TextField source="name" label="Customer Name" />
            <EmailField source="email" label="Email" />
            <TextField source="phone" label="Phone" />
            <NumberField source="numberOfKalash" label="Kalash Qty" />
            <NumberField
                source="amount"
                label="Amount"
                options={{ style: 'currency', currency: 'AUD' }}
            />
            <FunctionField
                label="Status"
                render={record => <StatusField record={record} source="status" />}
            />
            <FunctionField
                label="Payment Status"
                render={record => <StatusField record={record} source="paymentStatus" />}
            />
            <DateField
                source="createdAt"
                label="Booking Date"
                showTime
                options={{
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }}
            />
            <DateField
                source="paidAt"
                label="Paid At"
                showTime
                options={{
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }}
            />
            <EditButton />
            <DeleteButton />
        </Datagrid>
    </List>
);

export default KalashBookingList;
