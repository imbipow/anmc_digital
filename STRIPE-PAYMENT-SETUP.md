# Stripe Payment Setup - Fix Payment Button Issue

## Issue

Payment button remains disabled when trying to pay for bookings (affects both AnmcMembers and AnmcUsers).

**Error Symptom:**
- Payment form displays correctly
- Amount shows properly
- "Pay $XX.XX" button is visible but **disabled** (grayed out)
- Button never enables even after waiting

---

## Root Cause

The Stripe publishable key is missing from the frontend environment configuration.

**Technical Details:**
- [.env:25](.env#L25) - `REACT_APP_STRIPE_PUBLISHABLE_KEY` is commented out
- [src/main-component/BookServices/index.js:34](src/main-component/BookServices/index.js#L34) - `stripePromise` becomes `null` without the key
- [src/components/PaymentForm/index.js:93](src/components/PaymentForm/index.js#L93) - Button disabled when `!stripe`

---

## Solution

### Step 1: Get Your Stripe Publishable Key

1. **Login to Stripe Dashboard**: https://dashboard.stripe.com/
2. **Navigate to API Keys**:
   - Click "Developers" in the left sidebar
   - Click "API keys"
3. **Copy the Publishable Key**:
   - Look for "Publishable key" (starts with `pk_test_` for test mode or `pk_live_` for live mode)
   - Click "Reveal test key" or "Reveal live key"
   - Copy the entire key

**Example Keys:**
- Test mode: `pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`
- Live mode: `pk_live_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890`

> ⚠️ **Important**: Use **test keys** during development. Only use live keys in production.

---

### Step 2: Add Key to Frontend `.env` File

1. **Open the frontend `.env` file**: `d:\my-projects\anmcDigital\.env`

2. **Find line 25** (currently commented out):
   ```bash
   # REACT_APP_STRIPE_PUBLISHABLE_KEY=<add your publishable key here>
   ```

3. **Uncomment and replace** with your actual key:
   ```bash
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEfGhIjKlMnOpQrStUvWxYz1234567890
   ```

4. **Save the file**

---

### Step 3: Configure Backend Stripe Secret Key

The backend also needs the Stripe **secret key** (different from publishable key).

#### Option A: Using AWS Secrets Manager (Recommended)

If you're using AWS Secrets Manager (see [SECRETS_MANAGER_SETUP.md](SECRETS_MANAGER_SETUP.md)):

1. **Add to Secrets Manager**:
   ```bash
   aws secretsmanager update-secret \
     --secret-id anmc/dev/secrets \
     --secret-string '{
       "STRIPE_SECRET_KEY": "sk_test_your_secret_key_here",
       ... other secrets ...
     }'
   ```

2. The backend will automatically load it on startup.

#### Option B: Using Backend `.env` File (Development Only)

1. **Open backend `.env`**: `d:\my-projects\anmcDigital\api\.env`

2. **Add the secret key**:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   ```

> ⚠️ **Security Warning**: NEVER commit the secret key to git. It's called "secret" for a reason!

---

### Step 4: Restart the Development Server

After adding the keys, you **must restart** both frontend and backend servers:

```bash
# Stop current servers (Ctrl+C in each terminal)

# Restart frontend
cd d:\my-projects\anmcDigital
npm start

# Restart backend (in separate terminal)
cd d:\my-projects\anmcDigital\api
npm start
```

> 💡 **Why restart?** Environment variables are only loaded when the Node.js process starts. Changes to `.env` files don't take effect until restart.

---

## Verification

### 1. Check Environment Variable Loaded

Open browser console on booking page and check:

```javascript
console.log('Stripe Key exists:', !!process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
```

Should output: `Stripe Key exists: true`

### 2. Test Payment Flow

1. **Login** as AnmcUser or AnmcMember
2. **Navigate** to Book Services
3. **Fill booking form** with service details
4. **Click "Proceed to Payment"**
5. **Verify Payment Step**:
   - Payment form should display
   - Stripe payment element (card input fields) should appear
   - **"Pay $XX.XX" button should be ENABLED** (blue, clickable)

---

## Troubleshooting

### Issue: Button Still Disabled After Adding Key

**Check:**
1. Did you uncomment the line (remove the `#`)?
2. Did you restart the frontend server?
3. Is the key correctly formatted (starts with `pk_test_` or `pk_live_`)?
4. Check browser console for Stripe errors

**Solution:**
```bash
# Clear cache and restart
rm -rf node_modules/.cache
npm start
```

### Issue: "Invalid API Key" Error

**Check:**
1. Did you copy the **publishable key** (not secret key) for frontend?
2. Did you copy the **secret key** (not publishable key) for backend?
3. Are you using the correct mode (test vs live)?

**Key Identification:**
- Frontend (publishable): `pk_test_...` or `pk_live_...`
- Backend (secret): `sk_test_...` or `sk_live_...`

### Issue: Payment Intent Creation Fails

**Check:**
1. Backend has valid `STRIPE_SECRET_KEY`
2. Backend server restarted after adding key
3. Check backend logs for Stripe errors

**Test Backend Key:**
```bash
# In backend directory
node -e "console.log('Backend Stripe Key:', process.env.STRIPE_SECRET_KEY ? 'SET' : 'MISSING')"
```

---

## Security Best Practices

### 1. Publishable Key (Frontend)
- ✅ **Safe to expose** - It's called "publishable" for a reason
- ✅ Can be committed to git
- ✅ Visible in browser
- Used to initialize Stripe.js in the browser

### 2. Secret Key (Backend)
- ❌ **NEVER expose** to frontend
- ❌ **NEVER commit** to git
- ❌ **NEVER include** in client-side code
- ✅ Store in AWS Secrets Manager or backend `.env` (gitignored)
- Used for server-side API calls (creating payment intents, charges, etc.)

### 3. Environment Files
```bash
# Frontend .env - Safe to commit (with placeholders)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend api/.env - NEVER commit (add to .gitignore)
STRIPE_SECRET_KEY=sk_test_...
```

---

## Test vs Live Mode

### Development (Test Mode)
```bash
# Frontend
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_51AbCdEf...

# Backend
STRIPE_SECRET_KEY=sk_test_51AbCdEf...
```

**Use test cards**: https://stripe.com/docs/testing
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Production (Live Mode)
```bash
# Frontend
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_51AbCdEf...

# Backend (via Secrets Manager)
STRIPE_SECRET_KEY=sk_live_51AbCdEf...
```

**Real cards**: Actual charges will occur

---

## Related Files

1. [.env](.env) - Frontend environment config (add publishable key here)
2. [api/.env](api/.env) - Backend environment config (add secret key here)
3. [src/main-component/BookServices/index.js](src/main-component/BookServices/index.js#L34) - Stripe initialization
4. [src/components/PaymentForm/index.js](src/components/PaymentForm/index.js#L93) - Payment button logic
5. [SECRETS_MANAGER_SETUP.md](SECRETS_MANAGER_SETUP.md) - AWS Secrets Manager guide

---

## Quick Fix Summary

**For the impatient:**

1. Get Stripe keys from https://dashboard.stripe.com/apikeys
2. Edit `.env` (line 25):
   ```bash
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   ```
3. Edit `api/.env`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```
4. Restart both servers
5. Test booking → payment button should now be enabled

---

## Conclusion

The payment button issue was caused by missing Stripe configuration, not by any user group (AnmcMembers vs AnmcUsers) restrictions. Once the Stripe publishable key is added to the frontend `.env` file and the servers are restarted, the payment button will be enabled for all users.

**Impact:**
- ✅ Affects both AnmcMembers and AnmcUsers
- ✅ Not a permission/access issue
- ✅ Simple configuration fix
- ✅ No code changes needed
