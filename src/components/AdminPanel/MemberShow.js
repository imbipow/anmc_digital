import React from 'react';
import {
    Show,
    SimpleShowLayout,
    TextField,
    EmailField,
    DateField,
    NumberField,
    ChipField,
    ArrayField,
    Datagrid,
    RichTextField
} from 'react-admin';

export const MemberShow = (props) => (
    <Show {...props}>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="referenceNo" label="Reference Number" />

            <h3>Personal Information</h3>
            <TextField source="firstName" label="First Name" />
            <TextField source="lastName" label="Last Name" />
            <EmailField source="email" />
            <TextField source="mobile" />
            <TextField source="gender" />
            <TextField source="age" />

            <h3>Membership Details</h3>
            <ChipField source="membershipCategory" label="Category" />
            <ChipField source="membershipType" label="Type" />
            <NumberField
                source="membershipFee"
                label="Membership Fee"
                options={{ style: 'currency', currency: 'AUD' }}
            />
            <TextField source="paymentType" label="Payment Type" />
            <ChipField source="paymentStatus" label="Payment Status" />
            <TextField source="paymentIntentId" label="Stripe Payment ID" />
            <DateField source="paymentDate" label="Payment Date" showTime />

            <h3>Address</h3>
            <TextField source="residentialAddress.street" label="Street" />
            <TextField source="residentialAddress.suburb" label="Suburb" />
            <TextField source="residentialAddress.state" label="State" />
            <TextField source="residentialAddress.postcode" label="Postcode" />
            <TextField source="residentialAddress.country" label="Country" />

            <h3>Family Members</h3>
            <ArrayField source="familyMembers">
                <Datagrid>
                    <TextField source="firstName" />
                    <TextField source="lastName" />
                    <TextField source="relationship" />
                    <TextField source="age" />
                </Datagrid>
            </ArrayField>

            <h3>Additional Information</h3>
            <RichTextField source="comments" />
            <ChipField source="status" />
            <TextField source="cognitoUserId" label="Cognito User ID" />
            <DateField source="createdAt" label="Registration Date" showTime />
            <DateField source="updatedAt" label="Last Updated" showTime />
        </SimpleShowLayout>
    </Show>
);
