# MyBookings Payment Fix - AnmcUsers 401 Error

## Issue

AnmcUsers getting **401 Unauthorized** error when trying to retry payment from the "My Bookings" page.

**Symptom:**
- User has unpaid booking in "My Bookings"
- User clicks "Pay Now" button to retry payment
- Request to `/api/bookings/create-payment-intent` fails with 401
- Error message: "No token provided. Please include Authorization header with Bearer token."

---

## Root Cause

**File:** [src/main-component/MyBookings/index.js](src/main-component/MyBookings/index.js)
**Function:** `handleRetryPayment` (lines 208-239)

The `handleRetryPayment` function was using plain `fetch()` instead of `authenticatedFetch()`, which meant **no authentication headers** were being sent with the payment intent request.

**Before (Broken):**
```javascript
const handleRetryPayment = async (booking) => {
    try {
        const response = await fetch(  // ❌ Plain fetch - no auth header
            API_CONFIG.getURL(API_CONFIG.endpoints.bookings) + '/create-payment-intent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'  // ❌ Missing Authorization header
                },
                body: JSON.stringify({
                    bookingId: booking.id,
                    amount: booking.totalAmount
                })
            }
        );
        // ...
    }
};
```

**Result:**
- Request sent without `Authorization: Bearer <token>` header
- Backend `verifyToken` middleware rejects request
- Returns 401 Unauthorized
- Payment retry fails for all users (both AnmcMembers and AnmcUsers)

---

## Solution

Changed `handleRetryPayment` to use `authenticatedFetch()` which automatically adds the authentication token.

**After (Fixed):**
```javascript
const handleRetryPayment = async (booking) => {
    try {
        // ✅ Use authenticatedFetch instead of plain fetch
        const response = await authenticatedFetch(
            API_CONFIG.getURL(API_CONFIG.endpoints.bookings) + '/create-payment-intent',
            {
                method: 'POST',
                body: JSON.stringify({
                    bookingId: booking.id,
                    amount: booking.totalAmount
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create payment');
        }

        const { clientSecret } = await response.json();

        // Store in session and navigate to payment
        sessionStorage.setItem('retryPaymentBooking', JSON.stringify(booking));
        sessionStorage.setItem('retryPaymentSecret', clientSecret);

        window.location.href = `/retry-payment?booking_id=${booking.id}`;
    } catch (error) {
        console.error('Error creating payment:', error);
        toast.error(error.message || 'Failed to initiate payment. Please try again.');
    }
};
```

**What Changed:**
1. **Line 210:** Changed from `fetch()` to `authenticatedFetch()`
2. **Removed explicit headers:** `authenticatedFetch` automatically adds `Content-Type` and `Authorization` headers
3. **Better error handling:** Now catches and displays backend error messages

---

## Technical Details

### authenticatedFetch Helper

The `authenticatedFetch` function (defined at top of MyBookings file) automatically:
1. Retrieves the current user's ID token from Cognito
2. Adds `Authorization: Bearer <token>` header
3. Adds `Content-Type: application/json` header
4. Handles token retrieval errors

**Implementation:**
```javascript
const authenticatedFetch = async (url, options = {}) => {
    try {
        const token = await cognitoAuthService.getIdToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return fetch(url, { ...options, headers });
    } catch (error) {
        console.error('Auth fetch error:', error);
        throw error;
    }
};
```

### Backend Endpoint

**Endpoint:** `POST /api/bookings/create-payment-intent`
**Middleware:** `verifyToken, requireMember` (lines from [api/routes/bookings.js:117](api/routes/bookings.js#L117))

**Authentication Flow:**
```
Client Request
    ↓
Header: Authorization: Bearer <JWT token>
    ↓
Backend: verifyToken middleware
    ↓
Extract token → Verify with Cognito JWKS
    ↓
Extract user info (email, groups) from token payload
    ↓
Backend: requireMember middleware
    ↓
Check if req.user exists (any authenticated user)
    ↓
✅ Allow request (both AnmcMembers and AnmcUsers)
```

---

## User Journey: Retry Payment

### Before Fix (Broken):

```
User: AnmcUser with unpaid booking
    ↓
Navigate to "My Bookings"
    ↓
See booking with "UNPAID" status
    ↓
Click "Pay Now" button
    ↓
handleRetryPayment() called
    ↓
fetch() without auth header → POST /api/bookings/create-payment-intent
    ↓
Backend: verifyToken middleware checks Authorization header
    ↓
❌ No Authorization header found
    ↓
Backend returns: 401 Unauthorized
    ↓
User sees error: "Failed to initiate payment. Please try again."
    ↓
Payment retry fails ❌
```

### After Fix (Working):

```
User: AnmcUser with unpaid booking
    ↓
Navigate to "My Bookings"
    ↓
See booking with "UNPAID" status
    ↓
Click "Pay Now" button
    ↓
handleRetryPayment() called
    ↓
authenticatedFetch() → Retrieves JWT token from Cognito
    ↓
POST /api/bookings/create-payment-intent
    ↓
Header: Authorization: Bearer <token>
    ↓
Backend: verifyToken middleware validates token
    ↓
Backend: requireMember middleware checks authentication
    ↓
✅ Token valid, user authenticated
    ↓
Create Stripe payment intent → Return clientSecret
    ↓
Store clientSecret in sessionStorage
    ↓
Redirect to /retry-payment page
    ↓
User completes payment ✅
```

---

## Additional Improvements

### Added Debugging Logs

Added console logging to track authentication flow:

```javascript
console.log('🔐 [MyBookings] Auth token:', token ? 'Token retrieved' : 'No token');
console.log('✅ [MyBookings] Auth header added:', url);
console.warn('⚠️ [MyBookings] No token for:', url);
console.error('❌ [MyBookings] Auth fetch error:', error);
```

**Benefits:**
- Easy debugging of auth issues
- Can track token retrieval problems
- Helps identify session expiration

---

## Files Modified

1. **[src/main-component/MyBookings/index.js](src/main-component/MyBookings/index.js)**
   - **Lines 208-238:** Updated `handleRetryPayment()` to use `authenticatedFetch`
   - **Lines 27-47:** Added debugging logs to `authenticatedFetch` helper

---

## Testing Checklist

### ✅ AnmcUser - Retry Payment Flow
1. Login as AnmcUser
2. Create a booking (don't complete payment)
3. Navigate to "My Bookings"
4. Find the unpaid booking (orange border, "UNPAID" chip)
5. Click "Pay Now" button
6. **Expected:**
   - Browser console shows: `✅ [MyBookings] Auth header added: http://localhost:3001/api/bookings/create-payment-intent`
   - Redirects to `/retry-payment` page
   - Payment form displays
   - Can complete payment

### ✅ AnmcMember - Retry Payment Flow
1. Login as AnmcMember
2. Create a booking (don't complete payment)
3. Navigate to "My Bookings"
4. Click "Pay Now" on unpaid booking
5. **Expected:** Same as AnmcUser (should work)

### ✅ Check Console Logs
**Successful flow should show:**
```
🔐 [MyBookings] Auth token: Token retrieved
✅ [MyBookings] Auth header added: http://localhost:3001/api/bookings/create-payment-intent
```

**Failed flow would show:**
```
❌ [MyBookings] Auth fetch error: Error: No current user
⚠️ [MyBookings] No token for: http://localhost:3001/api/bookings/create-payment-intent
```

---

## Impact

### Who Was Affected:
- ✅ **AnmcUsers** - Could not retry payment (got 401)
- ✅ **AnmcMembers** - Could not retry payment (got 401)
- ✅ **All authenticated users** - Payment retry was broken for everyone

### What's Fixed:
- ✅ Payment retry now works for AnmcUsers
- ✅ Payment retry now works for AnmcMembers
- ✅ Proper authentication headers sent
- ✅ Better error messages
- ✅ Debugging logs added

---

## Related Issues Fixed

This is the **same pattern** that was causing issues in other components:

1. ✅ **BookServices** - Already using `authenticatedFetch` (working)
2. ✅ **UpdateDetails** - Already using `authenticatedFetch` (working)
3. ✅ **MyBookings** - **NOW FIXED** - Changed to use `authenticatedFetch`

**Lesson Learned:** Always use the `authenticatedFetch` helper function for API calls that require authentication, never use plain `fetch()`.

---

## Related Documentation

1. [ANMCUSER-BOOKING-PAYMENT-FIXES.md](ANMCUSER-BOOKING-PAYMENT-FIXES.md) - Overall AnmcUser fixes
2. [PAYMENT-BUTTON-FIX.md](PAYMENT-BUTTON-FIX.md) - Stripe payment button issue
3. [DEBUGGING-GUIDE.md](DEBUGGING-GUIDE.md) - Debugging authentication issues

---

## Conclusion

The payment retry failure was caused by missing authentication headers in the `handleRetryPayment` function. By switching from plain `fetch()` to `authenticatedFetch()`, the issue is now resolved for all users.

**Status:** ✅ **FIXED**

Users can now successfully retry payment for unpaid bookings from the "My Bookings" page.
