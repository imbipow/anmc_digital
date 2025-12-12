import React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    EmailField,
    NumberField,
    DateField,
    ChipField,
    TopToolbar,
    ListButton,
    EditButton
} from 'react-admin';
import { Card, CardContent, Typography, Grid } from '@mui/material';

const ShowActions = () => (
    <TopToolbar>
        <ListButton />
        <EditButton />
    </TopToolbar>
);

const DonationShow = () => (
    <Show actions={<ShowActions />}>
        <SimpleShowLayout>
            <Card style={{ width: '100%', marginBottom: 16 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Donor Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField source="firstName" label="First Name" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField source="lastName" label="Last Name" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <EmailField source="email" label="Email" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField source="phone" label="Phone" />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card style={{ width: '100%', marginBottom: 16 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Donation Details
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={3}>
                            <TextField source="donationType" label="Donation Type" />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <NumberField
                                source="amount"
                                label="Amount"
                                options={{ style: 'currency', currency: 'AUD' }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <TextField source="currency" label="Currency" />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <ChipField source="paymentStatus" label="Payment Status" />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField source="comments" label="Comments" />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card style={{ width: '100%', marginBottom: 16 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Payment Information
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField source="paymentIntentId" label="Payment Intent ID" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField source="id" label="Donation ID" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DateField source="createdAt" label="Created At" showTime />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DateField source="updatedAt" label="Updated At" showTime />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </SimpleShowLayout>
    </Show>
);

export default DonationShow;
