# Booking API Access Fix for AnmcUsers

## Issue

AnmcUsers were getting **403 Forbidden** errors when trying to create bookings via the `/api/bookings` endpoint.

## Root Cause

The booking routes were using `requireManager` middleware which only allows:
- Admin
- ANMCMembers
- AnmcAdmins
- AnmcManagers

This excluded **AnmcUsers** from creating bookings.

---

## Solution

Changed booking-related endpoints from `requireManager` to `requireMember` middleware.

### What `requireMember` Does

The `requireMember` middleware (defined in [api/middleware/auth.js](api/middleware/auth.js:186-196)) simply checks if a user is **authenticated** - it does NOT check for specific groups.

```javascript
const requireMember = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required. Please log in to access this resource.'
    });
  }
  // User is authenticated - allow access
  next();
};
```

This means **any authenticated user** (AnmcMembers OR AnmcUsers) can access these endpoints.

---

## Changes Made

### File: [api/routes/bookings.js](api/routes/bookings.js)

#### 1. Create Booking (Line 67)
**Before:**
```javascript
router.post('/', verifyToken, requireManager, async (req, res, next) => {
```

**After:**
```javascript
router.post('/', verifyToken, requireMember, async (req, res, next) => {
```

#### 2. Create Payment Intent (Line 117)
**Before:**
```javascript
router.post('/create-payment-intent', verifyToken, requireManager, async (req, res, next) => {
```

**After:**
```javascript
router.post('/create-payment-intent', verifyToken, requireMember, async (req, res, next) => {
```

#### 3. Create Checkout Session (Line 154)
**Before:**
```javascript
router.post('/create-checkout', verifyToken, requireManager, async (req, res, next) => {
```

**After:**
```javascript
router.post('/create-checkout', verifyToken, requireMember, async (req, res, next) => {
```

#### 4. Verify Payment (Line 184)
**Before:**
```javascript
router.post('/verify-payment', verifyToken, requireManager, async (req, res, next) => {
```

**After:**
```javascript
router.post('/verify-payment', verifyToken, requireMember, async (req, res, next) => {
```

---

## Access Control Summary

### Endpoints Still Restricted to Managers/Admins:
- `GET /:id` - Get single booking (managers only)
- `PUT /:id` - Update booking (managers only)
- `DELETE /:id` - Delete booking (managers only)
- `GET /stats` - Get booking statistics (managers only)

### Endpoints Now Accessible to All Authenticated Users (Members + Users):
- ✅ `GET /` - Get all bookings (filtered by memberEmail query param)
- ✅ `GET /available-slots` - Get available slots for booking
- ✅ `POST /` - **Create new booking**
- ✅ `POST /create-payment-intent` - **Create Stripe payment intent**
- ✅ `POST /create-checkout` - **Create Stripe checkout session**
- ✅ `POST /verify-payment` - **Verify payment**

---

## Security Considerations

### User Data Isolation

Even though both AnmcMembers and AnmcUsers can create bookings, the system should ensure users can only:
- View their own bookings
- Modify their own bookings
- Pay for their own bookings

**Recommendation:** Add user ownership checks in the booking service layer:

```javascript
// Example: In bookingsService.js
async getByMemberEmail(email, requestingUserEmail) {
    // Ensure users can only fetch their own bookings
    if (email !== requestingUserEmail && !isManager(requestingUserEmail)) {
        throw new Error('Unauthorized: Can only view your own bookings');
    }
    // ... fetch bookings
}
```

---

## Testing

### Test AnmcUsers Can Create Bookings

1. **Register as a user** via `/user-signup`
2. **Login** to get auth token
3. **Create a booking**:
   ```bash
   POST /api/bookings
   Headers: Authorization: Bearer <token>
   Body: {
     "serviceId": "service123",
     "serviceName": "Car Puja",
     "memberEmail": "user@example.com",
     "memberName": "John Doe",
     "preferredDate": "2024-12-25"
   }
   ```
4. **Verify**: Should return `201 Created` (not `403 Forbidden`)

### Test AnmcMembers Still Work

1. **Login as member**
2. **Create a booking** with same payload
3. **Verify**: Should return `201 Created`

### Test Payment Flow

1. **Create booking** as AnmcUser
2. **Create checkout session**:
   ```bash
   POST /api/bookings/create-checkout
   Headers: Authorization: Bearer <token>
   Body: {
     "bookingId": "booking123"
   }
   ```
3. **Verify**: Should return checkout URL (not `403 Forbidden`)

---

## Expected Behavior

### Before Fix:
```
AnmcUser → POST /api/bookings
   ↓
requireManager middleware → Check groups
   ↓
AnmcUsers NOT in allowed groups
   ↓
❌ 403 Forbidden: "Manager or Admin access required"
```

### After Fix:
```
AnmcUser → POST /api/bookings
   ↓
requireMember middleware → Check if authenticated
   ↓
User IS authenticated
   ↓
✅ 200/201 Success: Booking created
```

---

## Impact

### Who Benefits:
- ✅ **AnmcUsers** can now create bookings
- ✅ **AnmcMembers** still have full booking access
- ✅ **Managers/Admins** retain management capabilities

### What Changed:
- Booking creation: `requireManager` → `requireMember`
- Payment endpoints: `requireManager` → `requireMember`
- View/List bookings: Already using `requireMember` (no change)

### What Stayed the Same:
- Update/Delete bookings: Still `requireManager` only
- Booking stats: Still `requireManager` only
- Authentication still required for all booking operations

---

## Related Files

1. [api/routes/bookings.js](api/routes/bookings.js) - Booking routes (UPDATED)
2. [api/middleware/auth.js](api/middleware/auth.js) - Authentication middleware
3. [api/services/bookingsService.js](api/services/bookingsService.js) - Booking service layer

---

## Conclusion

AnmcUsers can now successfully:
- ✅ Create bookings
- ✅ Create payment intents
- ✅ Create checkout sessions
- ✅ Verify payments
- ✅ View their own bookings

The 403 error when booking services has been resolved! 🎉
