# ANMC Membership Registration System - Setup Guide

## Overview

The membership registration system has been fully implemented with the following features:

- Comprehensive registration form matching the Jotform structure
- Stripe payment integration for membership fees
- AWS Cognito user authentication
- Database storage (local JSON for dev, DynamoDB for production)
- Full admin panel for member management

## System Architecture

### Frontend Components
- **SignUp Page** (`src/main-component/SignUpPage/index.js`) - Main registration form
- **Membership Payment** (`src/main-component/SignUpPage/MembershipPayment.js`) - Stripe payment component
- **Admin Panel** - Member list, show, and edit components

### Backend API
- **Members Routes** (`api/routes/members.js`) - REST API endpoints
- **Members Service** (`api/services/membersService.js`) - Business logic
- **Cognito Service** (`api/services/cognitoService.js`) - AWS Cognito integration
- **Data Storage** (`api/data/members.json`) - Local development storage

## Membership Tiers & Fees

| Category | Type | Fee (AUD) | Payment Options |
|----------|------|-----------|-----------------|
| General | Single | $100 | Upfront only |
| General | Family | $200 | Upfront only |
| Life | Single | $1,000 | Upfront or Installments |
| Life | Family | $1,500 | Upfront or Installments |

## Form Fields

### Personal Information
- First Name * (required)
- Last Name * (required)
- Email * (required, validated)
- Mobile * (required)
- Gender * (Male/Female)
- Age (optional, for statistics)

### Membership Selection
- Membership Category * (General/Life)
- Membership Type * (Single/Family)
- Payment Type (Upfront/Installments) - only for Life membership

### Family Members (for Family membership)
- Up to 3 family members
- Each member: First Name, Last Name, Relationship, Age

### Address Information
- Residential Address * (Street, Suburb, State, Postcode, Country)
- Postal Address (optional, same as residential or different)

### Account Security
- Password * (min 8 chars, uppercase, lowercase, number, special char)
- Confirm Password *

### Additional
- Comments (optional)
- Declaration checkbox * (required)

## Setup Instructions

### 1. Configure Stripe (for Payment Processing)

#### Get Stripe Keys
1. Create account at https://dashboard.stripe.com/register
2. Navigate to **Developers** > **API keys**
3. Get your test keys:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

#### Add to Environment Variables

**API (.env in api folder):**
```env
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
```

**Frontend (.env in root folder):**
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

#### Restart Servers
```bash
# Terminal 1 - API
cd api
npm run dev

# Terminal 2 - Frontend
npm start
```

### 2. Configure AWS Cognito (for User Authentication)

#### Create User Pool
1. Go to https://console.aws.amazon.com/cognito
2. Click "Create user pool"
3. Configure:
   - Sign-in options: Email
   - Password policy: Default (or customize)
   - MFA: Optional
   - User account recovery: Email
4. Create app client:
   - App type: Public client
   - Don't generate client secret
   - Enable username password auth
5. Save User Pool ID and Client ID

#### Create User Groups
Create the following groups in your User Pool:
- `GeneralMembers`
- `LifeMembers`
- `FamilyMembers`

#### Configure Environment Variables

**API (.env in api folder):**
```env
COGNITO_USER_POOL_ID=ap-southeast-2_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
```

**Frontend (.env in root folder):**
```env
REACT_APP_COGNITO_USER_POOL_ID=ap-southeast-2_xxxxxxxxx
REACT_APP_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
REACT_APP_COGNITO_REGION=ap-southeast-2
```

### 3. Database Setup

#### Development (Local JSON)
No setup required! The system uses local JSON files in `api/data/members.json`

#### Production (DynamoDB)

**Set environment variable:**
```env
USE_DYNAMODB=true
ENVIRONMENT=prod
```

**Create DynamoDB Table:**
1. Go to https://console.aws.amazon.com/dynamodb
2. Create table:
   - Table name: `anmc-members-prod`
   - Partition key: `id` (String)
3. Wait for table to be active

## API Endpoints

### Member Registration
```http
POST /api/members/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "mobile": "0412345678",
  "gender": "male",
  "age": "30",
  "membershipCategory": "general",
  "membershipType": "single",
  "residentialAddress": {
    "street": "123 Main St",
    "suburb": "Sydney",
    "state": "NSW",
    "postcode": "2000",
    "country": "Australia"
  },
  "postalAddress": { ... },
  "sameAsResidential": true,
  "familyMembers": [],
  "password": "SecurePass123!",
  "paymentType": "upfront",
  "acceptDeclaration": true,
  "comments": ""
}
```

### Member Management (Admin)
```http
GET /api/members              # List all members
GET /api/members/:id          # Get single member
GET /api/members/stats        # Get statistics
GET /api/members/search?q=... # Search members
PUT /api/members/:id          # Update member
DELETE /api/members/:id       # Delete member
PATCH /api/members/:id/payment-status  # Update payment status
```

## User Flow

### 1. Registration Process

**For Upfront Payment:**
1. User fills out registration form
2. Clicks "Proceed to Payment"
3. System creates Stripe payment intent
4. User enters payment details
5. Payment processed
6. Member record created in database
7. User account created in Cognito
8. Redirect to member portal

**For Installments (Life membership only):**
1. User fills out registration form
2. Selects "Installments" payment type
3. Clicks "Complete Registration"
4. Member record created with "pending" payment status
5. User account created in Cognito
6. Admin contacts user for payment arrangements

### 2. Admin Management

Admins can:
- View all members in a filterable list
- Search members by name, email, phone, or reference number
- View detailed member information
- Edit member details
- Update payment status
- Filter by membership category, type, payment status
- Delete members
- View membership statistics

## Testing

### Test Card Numbers (Stripe)

| Card Number | Description |
|------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 0002 | Generic decline |

All test cards:
- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Test Registration

1. Navigate to `/sign-up`
2. Fill in all required fields
3. Select membership type
4. Enter test card details (if upfront payment)
5. Submit registration
6. Verify in admin panel at `/admin`

## File Structure

```
anmcDigital/
├── api/
│   ├── data/
│   │   └── members.json          # Local member data
│   ├── routes/
│   │   └── members.js             # Member API routes
│   ├── services/
│   │   ├── membersService.js      # Member business logic
│   │   ├── cognitoService.js      # Cognito integration
│   │   └── dynamodb.js            # DynamoDB utilities
│   └── config/
│       └── index.js               # Configuration
├── src/
│   ├── main-component/
│   │   └── SignUpPage/
│   │       ├── index.js           # Main registration form
│   │       ├── MembershipPayment.js  # Stripe payment
│   │       └── style.scss         # Styles
│   ├── components/
│   │   └── AdminPanel/
│   │       ├── MemberList.js      # Admin list view
│   │       ├── MemberShow.js      # Admin detail view
│   │       ├── MemberEdit.js      # Admin edit view
│   │       ├── index.js           # Admin panel config
│   │       └── dataProvider.js    # Data provider
│   └── config/
│       └── api.js                 # API endpoints config
└── .env.example                   # Environment variables template
```

## Troubleshooting

### Issue: Stripe Payment Fails with 500 Error

**Cause:** Stripe keys not configured

**Solution:**
1. Check `.env` files have correct Stripe keys
2. Ensure keys start with `pk_test_` (publishable) and `sk_test_` (secret)
3. Restart both servers
4. Verify keys in Stripe Dashboard

### Issue: "Payment system is being configured" Message

**Cause:** This is the expected behavior when Stripe is not configured

**Solution:** Add Stripe keys as per Setup Instructions section 1

### Issue: User Not Created in Cognito

**Cause:** Cognito credentials not configured

**Solution:**
1. Verify all Cognito environment variables are set
2. Check AWS credentials have permission to create users
3. Verify User Pool exists
4. Check user groups exist in Cognito

**Note:** Registration will still work without Cognito (users stored in database only)

### Issue: Cannot Access Admin Panel

**Cause:** Admin panel is at `/admin` route

**Solution:**
1. Navigate to `http://localhost:3000/admin`
2. Click on "Members" in the sidebar
3. View/edit member records

### Issue: Family Members Not Saving

**Cause:** Family membership type not selected

**Solution:**
1. Select "Family" membership type first
2. Then add family members using "+ Add Family Member" button
3. Fill in all required fields for each member

## Security Considerations

✅ **Implemented:**
- Password strength validation (8+ chars, uppercase, lowercase, number, special char)
- Email validation
- Stripe PCI compliance (no card data touches server)
- HTTPS requirement for production
- Input sanitization
- SQL injection prevention (using parameterized queries)

⚠️ **TODO for Production:**
- Enable Cognito MFA (Multi-Factor Authentication)
- Set up Stripe webhooks for payment confirmations
- Implement rate limiting on registration endpoint
- Add CAPTCHA to prevent spam registrations
- Set up monitoring and logging
- Configure backup strategy for DynamoDB

## Next Steps

1. **Configure Stripe** - Get test keys and add to environment variables
2. **Test Registration** - Complete a test registration flow
3. **Configure Cognito** (Optional) - Set up user pool for authentication
4. **Customize Emails** - Set up email templates for registration confirmation
5. **Set up Production** - Configure production Stripe keys and DynamoDB
6. **Go Live** - Deploy to production environment

## Support Resources

- **Stripe Documentation**: https://stripe.com/docs
- **AWS Cognito Documentation**: https://docs.aws.amazon.com/cognito
- **React Admin Documentation**: https://marmelab.com/react-admin
- **Stripe Test Cards**: https://stripe.com/docs/testing

## API Reference

Complete API documentation is available at:
- Local: `http://localhost:3001/api/health`
- Member endpoints: `http://localhost:3001/api/members`
- Statistics: `http://localhost:3001/api/members/stats`

## Notes

- Life membership supports both upfront and installment payments
- General membership only supports upfront payment
- Family membership requires at least one family member
- Postal address defaults to residential address if "same as residential" is checked
- Member reference numbers are auto-generated in format: `ANMC-YYYY-NNNN`
- All timestamps are stored in ISO 8601 format
- Currency is hardcoded to AUD (Australian Dollars)
