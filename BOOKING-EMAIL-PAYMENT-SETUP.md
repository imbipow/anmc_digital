# Booking System - Email Notifications & Payment Integration

This document describes the email notification system and Stripe payment integration for the ANMC booking system.

## Overview

The booking system now includes:
1. **Automated Email Notifications** - Sent via AWS SES
2. **Online Payment Processing** - Integrated with Stripe
3. **Payment Status Tracking** - Linked to booking lifecycle

## Email Notification Flow

### 1. Booking Request Email (Immediate)
**Trigger:** When a member creates a new booking
**Recipients:** Member + Admin
**Content:**
- Member receives confirmation that request was received
- Admin receives notification of pending booking for approval
- Includes all booking details (service, date, time, attendees, amount)

### 2. Booking Confirmation Email (After Admin Approval)
**Trigger:** When admin/manager approves booking (status: pending → confirmed)
**Recipient:** Member
**Content:**
- Booking approval confirmation
- **Stripe payment link** (valid for 24 hours)
- Service details and important information
- Instructions to complete payment

### 3. Payment Success Email
**Trigger:** After successful payment completion
**Recipient:** Member
**Content:**
- Payment confirmation
- Complete booking details with booking ID
- Receipt information
- Important reminders about the service

## Payment Integration Flow

### Step 1: Booking Creation
```
Member books service → Booking created with:
- status: 'pending'
- paymentStatus: 'unpaid'
- paymentIntentId: null
```

### Step 2: Admin Approval
```
Admin approves → System automatically:
1. Changes status to 'confirmed'
2. Creates Stripe Checkout Session
3. Generates unique payment link
4. Sends confirmation email with payment link
5. Updates booking with stripeSessionId
```

### Step 3: Payment Processing
```
Member clicks payment link → Stripe Checkout:
1. Secure payment form
2. Card details processed by Stripe
3. Payment success → Redirects to success page
4. Frontend calls verify-payment endpoint
```

### Step 4: Payment Verification
```
System verifies payment → Updates booking:
- paymentStatus: 'paid'
- paymentIntentId: [Stripe payment ID]
- paidAt: [timestamp]
→ Sends payment success email
```

## API Endpoints

### Booking Endpoints

#### Create Booking
```http
POST /api/bookings
Content-Type: application/json

{
  "serviceId": "string",
  "serviceName": "string",
  "memberEmail": "string",
  "memberName": "string",
  "memberContact": "string",
  "preferredDate": "2025-11-05",
  "startTime": "08:00",
  "endTime": "10:00",
  "serviceDuration": 2,
  "numberOfPeople": 25,
  "serviceAmount": 300,
  "venue": "Main Hall",
  "specialRequirements": "string"
}

Response: Booking object + Emails sent to member & admin
```

#### Update Booking (Approve)
```http
PUT /api/bookings/:id
Content-Type: application/json

{
  "status": "confirmed"
}

Response:
- Booking updated
- Stripe session created
- Payment link generated
- Confirmation email sent with payment link
```

#### Verify Payment
```http
POST /api/bookings/verify-payment
Content-Type: application/json

{
  "sessionId": "cs_test_..."
}

Response:
{
  "success": true,
  "booking": { ... updated booking with paymentStatus: 'paid' }
}
```

## Environment Variables

Add these to your `.env` file:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# AWS SES Email Configuration
AWS_REGION=ap-southeast-2
FROM_EMAIL=noreply@anmc.org.au
ADMIN_EMAIL=admin@anmc.org.au

# Application URLs
FRONTEND_URL=http://localhost:3036
ADMIN_PANEL_URL=http://localhost:3036/admin
ENVIRONMENT=dev
```

## Setup Instructions

### 1. AWS SES Setup

#### Verify Email Addresses
```bash
# Verify sender email in AWS SES
aws ses verify-email-identity --email-address noreply@anmc.org.au
aws ses verify-email-identity --email-address admin@anmc.org.au
```

#### Move Out of Sandbox (Production)
In AWS SES Sandbox mode, you can only send to verified addresses.
To send to any email:
1. Go to AWS SES Console
2. Request production access
3. Provide use case details
4. Wait for approval (24-48 hours)

#### Set Up IAM Permissions
Ensure your AWS credentials have SES permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

### 2. Stripe Setup

#### Get API Keys
1. Sign in to [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to Developers → API keys
3. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
4. Add to `.env` as `STRIPE_SECRET_KEY`

#### Test Cards
Use these cards in test mode:
- Success: `4242 4242 4242 4242`
- Requires authentication: `4000 0025 0000 3155`
- Declined: `4000 0000 0000 9995`

#### Configure Webhooks (Optional)
For production, set up Stripe webhooks:
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/bookings/webhook/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. Copy webhook secret to `.env` as `STRIPE_WEBHOOK_SECRET`

### 3. Database Migration

Update DynamoDB bookings table to include new fields:
```bash
# The bookingsService automatically adds these fields to new bookings:
- paymentStatus: 'paid' | 'unpaid'
- paymentIntentId: string | null
- stripeSessionId: string | null
- paymentUrl: string | null
- paidAt: string (ISO timestamp)
```

No manual migration needed - existing bookings will work as-is.

## Testing

### Test Email Flow

1. **Create a booking:**
```bash
curl -X POST http://localhost:3001/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "1",
    "serviceName": "Small Puja",
    "memberEmail": "test@example.com",
    "memberName": "Test User",
    "memberContact": "0412345678",
    "preferredDate": "2025-11-10",
    "startTime": "08:00",
    "endTime": "08:30",
    "serviceDuration": 0.5,
    "numberOfPeople": 10,
    "serviceAmount": 150
  }'
```

Check both test@example.com and admin@anmc.org.au for emails.

2. **Approve booking via admin panel:**
- Login to admin panel
- Go to Bookings
- Click "Approve" button on pending booking
- Check member email for confirmation with payment link

3. **Test payment:**
- Click payment link in email
- Use test card: 4242 4242 4242 4242
- Complete payment
- Verify payment success email received

### Test Payment Flow

```javascript
// Frontend: After successful Stripe checkout
const response = await fetch('/api/bookings/verify-payment', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sessionId: 'cs_test_...' })
});

const result = await response.json();
console.log(result.booking.paymentStatus); // should be 'paid'
```

## Booking States

| Status | Payment Status | Description |
|--------|---------------|-------------|
| pending | unpaid | Awaiting admin approval |
| confirmed | unpaid | Approved, payment link sent |
| confirmed | paid | Payment completed, booking secured |
| completed | paid | Service completed |
| cancelled | * | Booking cancelled |

## Error Handling

The system is designed to be resilient:

- **Email failures**: Booking still created/updated, error logged
- **Payment link generation failure**: Booking approved, admin notified
- **Payment verification failure**: Returns error, booking remains unpaid

All errors are logged to console with context for debugging.

## Security Considerations

1. **Email sending**: Uses AWS SES with proper authentication
2. **Payment processing**: All card data handled by Stripe (PCI compliant)
3. **Payment verification**: Server-side validation of Stripe sessions
4. **Webhook signatures**: Verify Stripe webhook signatures (if implemented)

## Monitoring

### Check Email Delivery
```bash
# AWS CloudWatch Logs for SES
aws logs tail /aws/ses --follow
```

### Check Stripe Payments
- Stripe Dashboard → Payments
- View successful payments, refunds, disputes

### Check Booking Status
```bash
# Get booking stats
curl http://localhost:3001/api/bookings/stats
```

## Troubleshooting

### Emails Not Sending

1. **Check AWS credentials:**
```bash
aws sts get-caller-identity
```

2. **Verify sender email:**
```bash
aws ses list-verified-email-addresses
```

3. **Check SES sending limits:**
```bash
aws ses get-send-quota
```

### Payment Link Not Generated

1. Check STRIPE_SECRET_KEY in .env
2. Verify Stripe account is active
3. Check API logs for Stripe errors
4. Ensure FRONTEND_URL is correctly set

### Payment Verification Failing

1. Check session ID format (starts with `cs_`)
2. Verify Stripe secret key matches environment
3. Check booking ID exists in database
4. Review Stripe Dashboard for session details

## Frontend Integration

### Success Page
Create pages to handle payment redirects:

**`src/main-component/BookingSuccess/index.js`:**
```javascript
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import API_CONFIG from '../../config/api';

const BookingSuccess = () => {
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      verifyPayment(sessionId);
    }
  }, [location]);

  const verifyPayment = async (sessionId) => {
    try {
      const response = await fetch(
        API_CONFIG.getURL(API_CONFIG.endpoints.bookings) + '/verify-payment',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        }
      );

      const result = await response.json();
      setBooking(result.booking);
    } catch (error) {
      console.error('Payment verification error:', error);
    } finally {
      setVerifying(false);
    }
  };

  if (verifying) return <div>Verifying payment...</div>;

  return (
    <div>
      <h1>Payment Successful!</h1>
      {booking && (
        <div>
          <p>Booking ID: {booking.id}</p>
          <p>Service: {booking.serviceName}</p>
          <p>Amount Paid: ${booking.totalAmount}</p>
          <p>Check your email for confirmation details.</p>
        </div>
      )}
    </div>
  );
};

export default BookingSuccess;
```

### Cancel Page
**`src/main-component/BookingCancelled/index.js`:**
```javascript
import React from 'react';
import { Link } from 'react-router-dom';

const BookingCancelled = () => {
  return (
    <div>
      <h1>Payment Cancelled</h1>
      <p>Your booking is still confirmed, but payment is pending.</p>
      <p>Check your email for the payment link.</p>
      <Link to="/member-portal">Return to Portal</Link>
    </div>
  );
};

export default BookingCancelled;
```

## Future Enhancements

1. **Stripe Webhook Integration**: Automatic payment verification
2. **Email Templates**: HTML emails with branding
3. **Refund Handling**: Admin can issue refunds through panel
4. **Payment Reminders**: Automated reminders for unpaid bookings
5. **Receipt Generation**: PDF receipts attached to emails
6. **SMS Notifications**: Twilio integration for SMS alerts

## Support

For issues or questions:
- Email: admin@anmc.org.au
- Check logs: `tail -f api/logs/error.log`
- AWS SES Dashboard: Monitor email delivery
- Stripe Dashboard: Monitor payment status
