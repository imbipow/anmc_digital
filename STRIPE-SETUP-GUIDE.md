# Stripe Payment Setup Guide

## Current Status

The donation system is fully implemented and functional, but requires Stripe API keys to process payments. Currently, when users try to donate, they receive a 500 error with the message:

```
Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.
```

This is **expected behavior** until Stripe is configured.

## What's Already Implemented

### Backend (API)
- ✅ Donation data model and service (`api/services/donationsService.js`)
- ✅ REST API endpoints for donations (`api/routes/donations.js`)
- ✅ Stripe payment intent routes (`api/routes/stripe.js`)
- ✅ Dual-mode storage (local JSON for dev, DynamoDB for production)
- ✅ Error handling for missing Stripe configuration

### Frontend
- ✅ Donation form modal with validation (`src/components/DonationForm/`)
- ✅ Stripe Elements integration for secure payment
- ✅ Homepage "Donate Now" button integration
- ✅ Dedicated `/donate` page with information
- ✅ Admin panel for managing donations

### Admin Panel
- ✅ List all donations with filtering
- ✅ View donation details
- ✅ Edit payment status
- ✅ Delete donations
- ✅ View donation statistics

## Steps to Enable Stripe Payments

### 1. Create a Stripe Account

1. Go to https://dashboard.stripe.com/register
2. Sign up with your email address
3. Complete the account verification process
4. Choose "Test mode" for development

### 2. Get Your API Keys

1. Log in to your Stripe Dashboard
2. Navigate to **Developers** > **API keys**
3. You'll see two types of keys:
   - **Publishable key** (starts with `pk_test_` for test mode)
   - **Secret key** (starts with `sk_test_` for test mode)

**IMPORTANT:** Never commit secret keys to version control!

### 3. Configure Environment Variables

#### For the API Server (Backend)

1. Navigate to the `api` folder
2. Create a `.env` file if it doesn't exist
3. Add your Stripe secret key:

```env
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
```

#### For the React App (Frontend)

1. In the project root directory
2. Create a `.env` file if it doesn't exist (or `.env.local`)
3. Add your Stripe publishable key:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
```

### 4. Restart Your Servers

After adding the environment variables, restart both servers:

```bash
# Terminal 1 - API Server
cd api
npm run dev

# Terminal 2 - React App
npm start
```

### 5. Test the Donation Flow

1. Open the application in your browser
2. Click "Donate Now" on the homepage or visit `/donate`
3. Fill out the donation form:
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Phone: (optional)
   - Amount: 25 (or any amount)
   - Comments: (optional)
4. Click "Proceed to Payment"
5. Use Stripe test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Declined**: `4000 0000 0000 0002`
   - **Requires authentication**: `4000 0025 0000 3155`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - ZIP: Any 5 digits (e.g., 12345)

### 6. Verify in Admin Panel

1. Navigate to `/admin`
2. Click on "Donations" in the sidebar
3. You should see your test donation listed
4. Click "Show" or "Edit" to view details

## Stripe Test Card Numbers

For testing different scenarios:

| Card Number | Description |
|------------|-------------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0025 0000 3155 | Requires authentication (3D Secure) |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 0002 | Generic decline |

All test cards:
- **Expiry**: Use any future date
- **CVC**: Use any 3 digits
- **ZIP**: Use any 5 digits

More test cards: https://stripe.com/docs/testing

## Production Deployment

When ready to go live:

1. In Stripe Dashboard, toggle from "Test mode" to "Live mode"
2. Get your **live API keys** (start with `pk_live_` and `sk_live_`)
3. Update production environment variables with live keys
4. Test thoroughly before accepting real donations
5. Complete Stripe account verification for payouts

## Security Best Practices

1. ✅ **Never commit API keys** - Keys are in `.env` files which are git-ignored
2. ✅ **Use environment variables** - Keys are loaded from `.env` files
3. ✅ **HTTPS only in production** - Stripe requires HTTPS for live mode
4. ✅ **PCI compliance** - Using Stripe Elements (no card data touches your server)
5. ✅ **Webhook verification** - Consider implementing webhook signature verification

## Troubleshooting

### Issue: "Stripe is not configured" error

**Solution:** Make sure you've:
1. Created a `.env` file in the `api` folder
2. Added `STRIPE_SECRET_KEY=sk_test_...`
3. Restarted the API server

### Issue: "Invalid API Key" error

**Solution:**
1. Verify the key starts with `sk_test_` or `sk_live_`
2. Check for extra spaces or quotes in `.env` file
3. Make sure you're using the correct key from Stripe Dashboard

### Issue: Payment form doesn't appear

**Solution:**
1. Check browser console for errors
2. Verify `REACT_APP_STRIPE_PUBLISHABLE_KEY` is set in frontend `.env`
3. Make sure the key starts with `pk_test_` or `pk_live_`
4. Restart React dev server

### Issue: Donation not saving to database

**Solution:**
1. Check API server logs for errors
2. Verify the donation is created in Stripe Dashboard
3. Check `api/data/donations.json` for local development
4. Ensure DynamoDB table exists if `USE_DYNAMODB=true`

## API Endpoints

### Donations
- `GET /api/donations` - List all donations
- `GET /api/donations/stats` - Get donation statistics
- `GET /api/donations/status/:status` - Filter by payment status
- `GET /api/donations/:id` - Get single donation
- `POST /api/donations` - Create new donation
- `PUT /api/donations/:id` - Update donation
- `DELETE /api/donations/:id` - Delete donation

### Stripe
- `POST /api/stripe/create-payment-intent` - Create payment intent
- `POST /api/stripe/verify-payment` - Verify payment status

## Next Steps

1. **Configure Stripe keys** (follow steps above)
2. **Test donation flow** with test card numbers
3. **Verify admin panel** shows donations correctly
4. **Customize donation amounts** (edit suggested amounts in form if needed)
5. **Set up webhooks** (optional, for payment confirmations)
6. **Enable live mode** when ready for production

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Dashboard: https://dashboard.stripe.com
- Test Card Numbers: https://stripe.com/docs/testing

## Files Reference

- Frontend form: `src/components/DonationForm/index.js`
- Payment component: `src/components/DonationForm/CheckoutForm.js`
- API routes: `api/routes/stripe.js`, `api/routes/donations.js`
- Service layer: `api/services/donationsService.js`
- Admin components: `src/components/AdminPanel/Donation*.js`
