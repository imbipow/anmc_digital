import React from 'react';
import {
    Create,
    SimpleForm,
    TextInput,
    NumberInput,
    SelectInput,
    BooleanInput,
    required
} from 'react-admin';
import { Box } from '@mui/material';

export const ServiceCreate = (props) => (
    <Create {...props}>
        <SimpleForm>
            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <NumberInput
                    source="item"
                    label="Item Number"
                    validate={[required()]}
                    helperText="Sequential number for ordering"
                    sx={{ width: '150px' }}
                />
                <SelectInput
                    source="status"
                    label="Status"
                    choices={[
                        { id: 'active', name: 'Active' },
                        { id: 'inactive', name: 'Inactive' },
                    ]}
                    validate={[required()]}
                    defaultValue="active"
                    sx={{ width: '150px' }}
                />
            </Box>

            <TextInput
                source="anusthanName"
                label="Service Name"
                validate={[required()]}
                fullWidth
                helperText="Full name of the service/puja"
            />

            <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                <NumberInput
                    source="amount"
                    label="Amount (AUD $)"
                    validate={[required()]}
                    sx={{ flex: 1 }}
                />
                <NumberInput
                    source="durationHours"
                    label="Duration (hours)"
                    step={0.5}
                    defaultValue={0}
                    helperText="Enter duration in hours (e.g., 0.5, 2, 4, 6)"
                    sx={{ flex: 1 }}
                />
            </Box>

            <SelectInput
                source="category"
                label="Category"
                choices={[
                    { id: 'service', name: 'Service/Facility' },
                    { id: 'small', name: 'Small Puja' },
                    { id: 'medium', name: 'Medium Puja' },
                    { id: 'large', name: 'Large Puja' },
                    { id: 'special', name: 'Special' },
                ]}
                validate={[required()]}
                defaultValue="small"
                fullWidth
            />

            <BooleanInput
                source="requiresSlotBooking"
                label="Requires Slot Booking"
                helperText="Enable this if the service requires date and time slot selection"
                defaultValue={true}
            />

            <TextInput
                source="notes"
                label="Notes"
                multiline
                rows={4}
                fullWidth
                helperText="Additional information about the service"
            />
        </SimpleForm>
    </Create>
);

export default ServiceCreate;
