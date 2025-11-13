# MyBookings Inline Payment - Stay on Same Page

## Issue

When AnmcUsers click "Pay Now" in My Bookings page, it redirects to a new page (`/retry-payment`) instead of handling payment inline on the same page.

**User Feedback:** "pay now My Bookings anmc user is taking to new page, without taking same page"

---

## Solution

Changed the payment flow to use an inline modal dialog instead of redirecting to a separate page.

### Before (Redirect Approach):
```
User clicks "Pay Now"
    ↓
Create payment intent
    ↓
Store in sessionStorage
    ↓
Redirect: window.location.href = `/retry-payment?booking_id=${booking.id}`
    ↓
User leaves My Bookings page ❌
```

### After (Inline Modal Approach):
```
User clicks "Pay Now"
    ↓
Create payment intent
    ↓
Open payment dialog (modal) on same page
    ↓
User completes payment in modal
    ↓
Close modal, refresh bookings list
    ↓
User stays on My Bookings page ✅
```

---

## Implementation Details

### 1. Added Stripe Components

**File:** [src/main-component/MyBookings/index.js](src/main-component/MyBookings/index.js)

**Lines 21-31:** Added Stripe imports and initialization
```javascript
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from '../../components/PaymentForm';

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
```

---

### 2. Added Payment Dialog State

**Lines 64-67:** New state variables for payment modal
```javascript
const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
const [paymentBooking, setPaymentBooking] = useState(null);
const [clientSecret, setClientSecret] = useState(null);
const [processingPayment, setProcessingPayment] = useState(false);
```

---

### 3. Updated handleRetryPayment Function

**Lines 222-255:** Changed from redirect to modal

**Before:**
```javascript
const handleRetryPayment = async (booking) => {
    // ... create payment intent ...

    // Store in session and redirect
    sessionStorage.setItem('retryPaymentBooking', JSON.stringify(booking));
    sessionStorage.setItem('retryPaymentSecret', clientSecret);
    window.location.href = `/retry-payment?booking_id=${booking.id}`;
};
```

**After:**
```javascript
const handleRetryPayment = async (booking) => {
    try {
        setProcessingPayment(true);

        // Create payment intent with auth
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

        const { clientSecret: secret } = await response.json();

        // Open payment dialog instead of redirecting
        setPaymentBooking(booking);
        setClientSecret(secret);
        setPaymentDialogOpen(true);
        setProcessingPayment(false);
    } catch (error) {
        console.error('Error creating payment:', error);
        toast.error(error.message || 'Failed to initiate payment. Please try again.');
        setProcessingPayment(false);
    }
};
```

---

### 4. Added Payment Success Handler

**Lines 257-292:** Handle successful payment

```javascript
const handlePaymentSuccess = async (paymentIntent) => {
    try {
        // Update booking with payment status
        const response = await authenticatedFetch(
            API_CONFIG.getURL(API_CONFIG.endpoints.bookings) + `/${paymentBooking.id}`,
            {
                method: 'PUT',
                body: JSON.stringify({
                    paymentStatus: 'paid',
                    paymentIntentId: paymentIntent.id,
                    paidAt: new Date().toISOString(),
                    status: 'confirmed'
                })
            }
        );

        if (response.ok) {
            toast.success('Payment successful! Your booking is confirmed.');

            // Close dialog and refresh bookings
            setPaymentDialogOpen(false);
            setClientSecret(null);
            setPaymentBooking(null);

            // Refresh bookings list to show updated status
            if (currentUser && currentUser.email) {
                await fetchBookings(currentUser.email);
            }
        } else {
            throw new Error('Failed to update booking status');
        }
    } catch (error) {
        console.error('Error updating booking:', error);
        toast.error('Payment succeeded but failed to update booking. Please contact admin.');
    }
};
```

**Features:**
- Updates booking status to 'paid' and 'confirmed'
- Closes payment modal automatically
- Refreshes bookings list to show updated status
- User sees updated booking immediately without page reload

---

### 5. Added Payment Dialog UI

**Lines 713-760:** New payment modal dialog

```javascript
{/* Payment Dialog */}
<Dialog
    open={paymentDialogOpen}
    onClose={handleClosePaymentDialog}
    maxWidth="sm"
    fullWidth
>
    <DialogTitle>
        Complete Payment
    </DialogTitle>
    <DialogContent>
        {paymentBooking && (
            <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                    <strong>Service:</strong> {paymentBooking.serviceName}
                </Typography>
                <Typography variant="body1" gutterBottom>
                    <strong>Date:</strong> {formatDate(paymentBooking.preferredDate)}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                    <strong>Amount:</strong> ${paymentBooking.totalAmount.toFixed(2)} AUD
                </Typography>
            </Box>
        )}

        {clientSecret && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                    amount={paymentBooking?.totalAmount || 0}
                    bookingId={paymentBooking?.id}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                />
            </Elements>
        )}

        {!clientSecret && (
            <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress />
            </Box>
        )}
    </DialogContent>
    <DialogActions>
        <Button onClick={handleClosePaymentDialog} disabled={processingPayment}>
            Cancel
        </Button>
    </DialogActions>
</Dialog>
```

**Features:**
- Shows booking details (service, date, amount)
- Embedded Stripe payment form
- Loading spinner while payment intent is being created
- Cancel button to close modal

---

### 6. Updated Pay Now Buttons

**Lines 481-491 and 648-660:** Added loading state to buttons

```javascript
<Button
    variant="contained"
    color="warning"
    onClick={() => handleRetryPayment(booking)}
    disabled={processingPayment}
>
    {processingPayment ? <CircularProgress size={20} color="inherit" /> : 'Pay Now'}
</Button>
```

**Features:**
- Button disabled while creating payment intent
- Shows loading spinner during processing
- Prevents multiple clicks

---

## User Flow Comparison

### Before (Redirect):

```
User: Has unpaid booking in My Bookings
    ↓
Click "Pay Now" button
    ↓
Page redirects to /retry-payment
    ↓
User on new page (loses My Bookings context) ❌
    ↓
Complete payment
    ↓
Navigate back to My Bookings manually
    ↓
Refresh page to see updated status
```

### After (Inline Modal):

```
User: Has unpaid booking in My Bookings
    ↓
Click "Pay Now" button
    ↓
Modal opens on same page ✅
    ↓
See booking details in modal
    ↓
Complete payment in modal
    ↓
Modal closes automatically
    ↓
Booking list refreshes automatically
    ↓
See "PAID" status immediately
    ↓
User stays on My Bookings page ✅
```

---

## Benefits

### 1. Better User Experience
- ✅ No page navigation required
- ✅ User stays in context
- ✅ Faster payment process
- ✅ No need to manually navigate back

### 2. Automatic Updates
- ✅ Booking list refreshes automatically after payment
- ✅ Status changes from "UNPAID" to "PAID" immediately
- ✅ No manual page refresh needed

### 3. Better Error Handling
- ✅ Errors shown in modal
- ✅ User can retry without losing context
- ✅ Can close modal to try again later

### 4. Mobile Friendly
- ✅ Modal works better on mobile than page redirect
- ✅ Less navigation = better mobile UX
- ✅ Payment form properly sized in modal

---

## Technical Details

### Stripe Elements Integration

The payment modal uses Stripe Elements exactly like the BookServices page:

```javascript
<Elements stripe={stripePromise} options={{ clientSecret }}>
    <PaymentForm
        amount={paymentBooking?.totalAmount || 0}
        bookingId={paymentBooking?.id}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
    />
</Elements>
```

**Why this works:**
- Same PaymentForm component used everywhere
- Consistent payment experience
- Reuses existing, tested code
- No need for separate payment page

### Authentication

All API calls use `authenticatedFetch`:
- ✅ Create payment intent: Includes auth token
- ✅ Update booking status: Includes auth token
- ✅ Works for both AnmcUsers and AnmcMembers

---

## Files Modified

1. **[src/main-component/MyBookings/index.js](src/main-component/MyBookings/index.js)**
   - Lines 21-31: Added Stripe imports
   - Lines 64-67: Added payment modal state
   - Lines 222-303: Updated payment handling functions
   - Lines 481-491, 648-660: Updated Pay Now buttons
   - Lines 713-760: Added payment modal UI

---

## Testing Checklist

### ✅ AnmcUser - Inline Payment
1. Login as AnmcUser
2. Create booking without completing payment
3. Navigate to "My Bookings"
4. Find unpaid booking (orange border)
5. Click "Pay Now" button
6. **Expected:**
   - Modal opens (no page redirect) ✅
   - Shows booking details ✅
   - Shows Stripe payment form ✅
   - Payment button enabled ✅
7. Enter test card: `4242 4242 4242 4242`
8. Click "Pay $XX.XX"
9. **Expected:**
   - Payment succeeds ✅
   - Modal closes automatically ✅
   - Booking list refreshes ✅
   - Status changes to "PAID" ✅
   - Chip changes to green ✅
   - Success toast shown ✅

### ✅ AnmcMember - Inline Payment
Same flow as AnmcUser - should work identically

### ✅ Cancel Payment
1. Click "Pay Now"
2. Modal opens
3. Click "Cancel" button
4. **Expected:**
   - Modal closes ✅
   - Booking still shows "UNPAID" ✅
   - Can click "Pay Now" again ✅

### ✅ Multiple Bookings
1. Have multiple unpaid bookings
2. Click "Pay Now" on first booking
3. Complete payment
4. Click "Pay Now" on second booking
5. **Expected:**
   - Each payment handled separately ✅
   - Modal shows correct booking details ✅
   - No interference between payments ✅

---

## Removed Functionality

### /retry-payment Route

The separate `/retry-payment` page is now **obsolete** but can be kept for:
- Backwards compatibility (if users bookmarked it)
- Email links (if emails link to retry page)
- Future use cases

**Recommendation:** Keep the route but add a redirect to My Bookings or show a message:
```
"Payment links are now handled directly in My Bookings.
Redirecting you there..."
```

---

## Related Documentation

1. [MYBOOKINGS-PAYMENT-FIX.md](MYBOOKINGS-PAYMENT-FIX.md) - Authentication fix for payment
2. [PAYMENT-BUTTON-FIX.md](PAYMENT-BUTTON-FIX.md) - Stripe button fix
3. [ANMCUSER-BOOKING-PAYMENT-FIXES.md](ANMCUSER-BOOKING-PAYMENT-FIXES.md) - Overall AnmcUser fixes

---

## Conclusion

The "Pay Now" button in My Bookings now opens an inline payment modal instead of redirecting to a separate page. This provides a much better user experience:

- ✅ No page navigation
- ✅ Stay in context
- ✅ Automatic refresh after payment
- ✅ Faster, smoother flow
- ✅ Works for both AnmcUsers and AnmcMembers

**Status:** ✅ **COMPLETE**

Users can now complete payment without leaving the My Bookings page!
