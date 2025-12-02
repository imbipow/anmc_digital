import React from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    NumberInput,
    DateTimeInput,
    required
} from 'react-admin';
import { Box } from '@mui/material';

export const KalashBookingEdit = (props) => (
    <Edit {...props} title="Edit Kalash Booking">
        <SimpleForm>
            <Box sx={{ display: 'flex', gap: 2, width: '100%', flexWrap: 'wrap' }}>
                <TextInput
                    source="id"
                    label="Booking ID"
                    disabled
                    fullWidth
                    sx={{ flexBasis: '100%' }}
                />

                <TextInput
                    source="name"
                    label="Customer Name"
                    validate={[required()]}
                    fullWidth
                    sx={{ flexBasis: '48%' }}
                />

                <TextInput
                    source="email"
                    label="Email"
                    type="email"
                    validate={[required()]}
                    fullWidth
                    sx={{ flexBasis: '48%' }}
                />

                <TextInput
                    source="phone"
                    label="Phone"
                    validate={[required()]}
                    fullWidth
                    sx={{ flexBasis: '48%' }}
                />

                <SelectInput
                    source="numberOfKalash"
                    label="Number of Kalash"
                    choices={[
                        { id: 1, name: '1 Kalash - $111 AUD' },
                        { id: 2, name: '2 Kalash - $151 AUD' }
                    ]}
                    validate={[required()]}
                    fullWidth
                    sx={{ flexBasis: '48%' }}
                />

                <NumberInput
                    source="amount"
                    label="Amount (AUD)"
                    validate={[required()]}
                    disabled
                    fullWidth
                    sx={{ flexBasis: '48%' }}
                />

                <SelectInput
                    source="status"
                    label="Booking Status"
                    choices={[
                        { id: 'pending', name: 'Pending' },
                        { id: 'confirmed', name: 'Confirmed' },
                        { id: 'cancelled', name: 'Cancelled' }
                    ]}
                    validate={[required()]}
                    defaultValue="pending"
                    fullWidth
                    sx={{ flexBasis: '48%' }}
                />

                <SelectInput
                    source="paymentStatus"
                    label="Payment Status"
                    choices={[
                        { id: 'pending', name: 'Pending' },
                        { id: 'paid', name: 'Paid' },
                        { id: 'failed', name: 'Failed' }
                    ]}
                    validate={[required()]}
                    defaultValue="pending"
                    fullWidth
                    sx={{ flexBasis: '48%' }}
                />

                <TextInput
                    source="paymentIntentId"
                    label="Payment Intent ID"
                    disabled
                    fullWidth
                    sx={{ flexBasis: '100%' }}
                />

                <DateTimeInput
                    source="createdAt"
                    label="Created At"
                    disabled
                    fullWidth
                    sx={{ flexBasis: '48%' }}
                />

                <DateTimeInput
                    source="paidAt"
                    label="Paid At"
                    fullWidth
                    sx={{ flexBasis: '48%' }}
                />
            </Box>
        </SimpleForm>
    </Edit>
);

export default KalashBookingEdit;
