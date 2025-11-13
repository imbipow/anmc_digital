import React from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    DateInput,
    NumberInput,
    required,
    Toolbar,
    SaveButton,
    DeleteButton,
    useRecordContext
} from 'react-admin';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';

const BookingEditToolbar = props => (
    <Toolbar {...props}>
        <SaveButton />
        <DeleteButton mutationMode="pessimistic" />
    </Toolbar>
);

const BookingTitle = () => {
    const record = useRecordContext();
    return <span>Edit Booking #{record ? record.id : ''}</span>;
};

export const BookingEdit = (props) => (
    <Edit {...props} title={<BookingTitle />} mutationMode="pessimistic">
        <SimpleForm toolbar={<BookingEditToolbar />}>
            <Alert severity="info" sx={{ mb: 3, width: '100%' }}>
                <strong>Booking Management:</strong> Update booking status, contact information, or cancel the booking.
                Service details cannot be changed - create a new booking if service needs to be modified.
            </Alert>

            {/* Status Management */}
            <Card sx={{ width: '100%', mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                        Booking Status
                    </Typography>
                    <SelectInput
                        source="status"
                        label="Status"
                        choices={[
                            { id: 'pending', name: 'Pending - Awaiting Confirmation' },
                            { id: 'confirmed', name: 'Confirmed - Booking Approved' },
                            { id: 'completed', name: 'Completed - Service Finished' },
                            { id: 'cancelled', name: 'Cancelled' },
                        ]}
                        validate={[required()]}
                        fullWidth
                        helperText="Update the booking status to confirm or cancel"
                    />
                </CardContent>
            </Card>

            {/* Service Information (Read-only display) */}
            <Card sx={{ width: '100%', mb: 3, backgroundColor: '#f5f5f5' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                        Service Information (Read-Only)
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextInput source="serviceName" label="Service Name" disabled fullWidth />
                        <NumberInput source="serviceDuration" label="Duration (hours)" disabled />
                        <DateInput source="preferredDate" label="Booking Date" disabled />
                        <TextInput source="startTime" label="Start Time" disabled />
                        <NumberInput source="numberOfPeople" label="Number of Attendees" disabled />
                        <TextInput source="venue" label="Venue" disabled />
                    </Box>
                </CardContent>
            </Card>

            {/* Contact Information */}
            <Card sx={{ width: '100%', mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                        Contact Information
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        <TextInput
                            source="memberName"
                            label="Member Name"
                            disabled
                            fullWidth
                        />
                        <TextInput
                            source="memberEmail"
                            label="Member Email"
                            disabled
                            fullWidth
                        />
                        <TextInput
                            source="contactPerson"
                            label="Contact Person"
                            validate={[required()]}
                            fullWidth
                        />
                        <TextInput
                            source="contactPhone"
                            label="Contact Phone"
                            validate={[required()]}
                            fullWidth
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* Special Requirements */}
            <Card sx={{ width: '100%', mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                        Special Requirements
                    </Typography>
                    <TextInput
                        source="specialRequirements"
                        label="Special Requirements / Notes"
                        multiline
                        rows={4}
                        fullWidth
                    />
                </CardContent>
            </Card>

            {/* Pricing Information (Read-only) */}
            <Card sx={{ width: '100%', mb: 3, backgroundColor: '#e8f5e9' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                        Pricing Details (Read-Only)
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                        <NumberInput
                            source="serviceAmount"
                            label="Service Amount"
                            disabled
                            options={{ style: 'currency', currency: 'AUD' }}
                        />
                        <NumberInput
                            source="cleaningFeeAmount"
                            label="Cleaning Fee"
                            disabled
                            options={{ style: 'currency', currency: 'AUD' }}
                        />
                        <NumberInput
                            source="totalAmount"
                            label="Total Amount"
                            disabled
                            options={{ style: 'currency', currency: 'AUD' }}
                        />
                    </Box>
                </CardContent>
            </Card>

            {/* Metadata */}
            <Card sx={{ width: '100%', backgroundColor: '#fafafa' }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Booking Metadata
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                        <TextInput source="id" label="Booking ID" disabled />
                        <DateInput source="createdAt" label="Created At" disabled />
                        <DateInput source="updatedAt" label="Last Updated" disabled />
                    </Box>
                </CardContent>
            </Card>
        </SimpleForm>
    </Edit>
);

export default BookingEdit;
