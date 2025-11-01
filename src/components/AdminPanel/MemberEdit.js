import React from 'react';
import {
    Edit,
    SimpleForm,
    TextInput,
    SelectInput,
    NumberInput,
    DateInput,
    required,
    email
} from 'react-admin';

export const MemberEdit = (props) => (
    <Edit {...props}>
        <SimpleForm>
            <TextInput source="id" disabled />
            <TextInput source="referenceNo" label="Reference Number" disabled />

            <h3>Personal Information</h3>
            <TextInput source="firstName" label="First Name" validate={[required()]} />
            <TextInput source="lastName" label="Last Name" validate={[required()]} />
            <TextInput source="email" validate={[required(), email()]} />
            <TextInput source="mobile" validate={[required()]} />
            <SelectInput source="gender" choices={[
                { id: 'male', name: 'Male' },
                { id: 'female', name: 'Female' },
            ]} validate={[required()]} />
            <NumberInput source="age" />

            <h3>Membership Details</h3>
            <SelectInput source="membershipCategory" choices={[
                { id: 'general', name: 'General Membership' },
                { id: 'life', name: 'Life Membership' },
            ]} validate={[required()]} />
            <SelectInput source="membershipType" choices={[
                { id: 'single', name: 'Single' },
                { id: 'family', name: 'Family' },
            ]} validate={[required()]} />
            <NumberInput
                source="membershipFee"
                label="Membership Fee"
            />
            <SelectInput source="paymentType" choices={[
                { id: 'upfront', name: 'Upfront Payment' },
                { id: 'installments', name: 'Installments' },
            ]} />
            <SelectInput source="paymentStatus" choices={[
                { id: 'pending', name: 'Pending' },
                { id: 'processing', name: 'Processing' },
                { id: 'succeeded', name: 'Succeeded' },
                { id: 'failed', name: 'Failed' },
            ]} validate={[required()]} />
            <TextInput source="paymentIntentId" label="Stripe Payment Intent ID" />
            <DateInput source="paymentDate" label="Payment Date" />

            <h3>Account Status</h3>
            <SelectInput source="status" choices={[
                { id: 'active', name: 'Active' },
                { id: 'inactive', name: 'Inactive' },
                { id: 'suspended', name: 'Suspended' },
            ]} validate={[required()]} />

            <h3>Address</h3>
            <TextInput source="residentialAddress.street" label="Street" fullWidth />
            <TextInput source="residentialAddress.suburb" label="Suburb" />
            <TextInput source="residentialAddress.state" label="State" />
            <TextInput source="residentialAddress.postcode" label="Postcode" />
            <TextInput source="residentialAddress.country" label="Country" defaultValue="Australia" />

            <h3>Additional Information</h3>
            <TextInput source="comments" multiline rows={3} fullWidth />
            <TextInput source="cognitoUserId" label="Cognito User ID" disabled />
        </SimpleForm>
    </Edit>
);
