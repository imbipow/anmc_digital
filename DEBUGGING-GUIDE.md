# Debugging Guide - AnmcUser Issues

## Current Issues

1. **Payment Intent API returning 401** - "No token provided"
2. **AnmcUser details not populated** in Update Details form

---

## Changes Made for Debugging

### 1. Updated cognitoAuth.js Service

**File:** [src/services/cognitoAuth.js](src/services/cognitoAuth.js)

**Changes:**
- **Lines 94-105** (`signIn` method): Added direct property mapping for user attributes
- **Lines 173-182** (`getCurrentUser` method): Added direct property mapping for user attributes

**What was added:**
```javascript
// Before (only returned nested attributes):
resolve({
    email: userAttributes.email,
    attributes: userAttributes,
    groups: groups,
    session
});

// After (flattened common attributes to top level):
resolve({
    email: userAttributes.email,
    name: userAttributes.name,
    given_name: userAttributes.given_name,      // ← Added
    family_name: userAttributes.family_name,    // ← Added
    phone_number: userAttributes.phone_number,  // ← Added
    attributes: userAttributes,
    groups: groups,
    session
});
```

**Why this was needed:**
- UpdateDetails component accesses `currentUser.given_name` directly
- Previously, these were only available as `currentUser.attributes.given_name`
- This caused AnmcUser data to appear empty (firstName, lastName, mobile all undefined)

---

### 2. Added Debugging Logs

#### A) BookServices Component
**File:** [src/main-component/BookServices/index.js](src/main-component/BookServices/index.js)
**Lines:** 38-57

Added console logs to `authenticatedFetch`:
```javascript
console.log('🔐 Auth token:', token ? 'Token retrieved successfully' : 'No token');
console.log('✅ Authorization header added to request:', url);
console.warn('⚠️ No token available for request:', url);
console.error('❌ Auth fetch error:', error);
```

#### B) UpdateDetails Component
**File:** [src/main-component/UpdateDetails/index.js](src/main-component/UpdateDetails/index.js)

**Lines 23-42:** Added logs to `authenticatedFetch`
**Lines 63-76:** Added logs to show current user data and type detection

```javascript
console.log('👤 [UpdateDetails] Current user:', {
    email: currentUser.email,
    given_name: currentUser.given_name,
    family_name: currentUser.family_name,
    phone_number: currentUser.phone_number,
    groups: currentUser.groups,
    hasName: !!currentUser.name
});

console.log('🔍 [UpdateDetails] User type check:', { isAnmcUser, isAnmcMember });
console.log('✅ [UpdateDetails] Created AnmcUser data:', userData);
```

---

## How to Debug

### Step 1: Restart Frontend Server

The cognitoAuth.js changes won't take effect until you restart:

```bash
cd d:\my-projects\anmcDigital
npm start
```

### Step 2: Open Browser Console

Open Chrome DevTools (F12) and go to the Console tab.

---

### Step 3: Test AnmcUser Update Details

1. **Login as AnmcUser**
   - Email: `bookuser@gmail.com` (or your test user)
   - Password: (your test password)

2. **Navigate to Update Details**
   - Click "Update Details" from portal

3. **Check Console for Logs**

**Expected Logs:**
```
👤 [UpdateDetails] Current user: {
    email: "bookuser@gmail.com",
    given_name: "Book",          ← Should have value
    family_name: "User",         ← Should have value
    phone_number: "+61412345678", ← Should have value (if set)
    groups: ["AnmcUsers"],
    hasName: true
}

🔍 [UpdateDetails] User type check: {
    isAnmcUser: true,
    isAnmcMember: false
}

✅ [UpdateDetails] Created AnmcUser data: {
    firstName: "Book",           ← Should be populated
    lastName: "User",            ← Should be populated
    email: "bookuser@gmail.com",
    mobile: "+61412345678",      ← Should be populated
    ...
}
```

**If values are empty/undefined:**
- Problem: Cognito user doesn't have `given_name` and `family_name` attributes set
- Solution: See "Fix Missing Cognito Attributes" section below

---

### Step 4: Test Booking Payment Flow

1. **Navigate to Book Services**
   - Go to `/member/book-services`

2. **Select Service and Fill Form**
   - Choose a service
   - Fill all required fields
   - Click "Proceed to Payment"

3. **Check Console for Auth Logs**

**Expected Logs:**
```
🔐 Auth token: Token retrieved successfully
✅ Authorization header added to request: http://localhost:3001/api/bookings
```

Then when creating payment intent:
```
🔐 Auth token: Token retrieved successfully
✅ Authorization header added to request: http://localhost:3001/api/bookings/create-payment-intent
```

**If you see 401 error:**
- Check if token log shows "No token"
- Check if user session is still valid
- Try logging out and logging back in

---

## Common Issues and Solutions

### Issue 1: given_name, family_name are undefined

**Symptom:**
```
👤 [UpdateDetails] Current user: {
    email: "bookuser@gmail.com",
    given_name: undefined,  ← Problem
    family_name: undefined, ← Problem
    phone_number: undefined,
    groups: ["AnmcUsers"]
}
```

**Root Cause:**
The Cognito user was created without `given_name` and `family_name` attributes.

**Solution: Fix Missing Cognito Attributes**

You need to manually add these attributes to the Cognito user.

#### Option A: Via AWS Console

1. Go to AWS Cognito Console
2. Navigate to your User Pool
3. Click "Users" tab
4. Find the user `bookuser@gmail.com`
5. Click on the user
6. In the "Attributes" section, click "Edit"
7. Add/Update:
   - `given_name`: `Book` (or desired first name)
   - `family_name`: `User` (or desired last name)
   - `phone_number`: `+61412345678` (optional)
8. Save changes

#### Option B: Via AWS CLI

```bash
aws cognito-idp admin-update-user-attributes \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username bookuser@gmail.com \
  --user-attributes \
    Name=given_name,Value=Book \
    Name=family_name,Value=User \
    Name=phone_number,Value=+61412345678
```

#### Option C: Fix User Registration Code

Update [src/main-component/UserSignUpPage/index.js](src/main-component/UserSignUpPage/index.js) to send proper attributes:

Check the registration payload includes:
```javascript
const userData = {
    firstName: formData.firstName,  // Maps to given_name
    lastName: formData.lastName,    // Maps to family_name
    email: formData.email,
    mobile: formData.mobile,        // Maps to phone_number
    password: formData.password
};
```

Then verify [api/services/cognitoService.js](api/services/cognitoService.js) properly sets these:
```javascript
UserAttributes: [
    { Name: 'email', Value: userData.email },
    { Name: 'given_name', Value: userData.firstName },
    { Name: 'family_name', Value: userData.lastName },
    { Name: 'phone_number', Value: formattedPhone }
]
```

---

### Issue 2: Token Not Available (401 Error)

**Symptom:**
```
⚠️ No token available for request: http://localhost:3001/api/bookings/create-payment-intent
```

**Possible Causes:**
1. User session expired
2. User not logged in
3. Cognito pool configuration issue

**Solutions:**

**A) Check if logged in:**
```javascript
// In browser console
const authService = require('./services/cognitoAuth').default;
authService.getCurrentUser()
  .then(user => console.log('User:', user))
  .catch(err => console.error('Not logged in:', err));
```

**B) Log out and log back in:**
- Clear browser storage
- Navigate to `/login`
- Login again
- Try booking again

**C) Check Cognito configuration:**
```javascript
// In browser console
console.log('Cognito Config:', {
    UserPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
    ClientId: process.env.REACT_APP_COGNITO_CLIENT_ID,
    Region: process.env.REACT_APP_COGNITO_REGION
});
```

Should output:
```
{
    UserPoolId: "ap-southeast-2_egMmxcO1M",
    ClientId: "2h0bk9340rlmevdnsof7ml31ai",
    Region: "ap-southeast-2"
}
```

---

### Issue 3: Form Fields Empty Despite Logs Showing Data

**Symptom:**
- Console shows: `given_name: "Book", family_name: "User"`
- But form fields are empty

**Root Cause:**
React state not updating properly or loading state issue.

**Check:**
Look for this in UpdateDetails:
```javascript
if (loading) {
    return <CircularProgress />; // Still loading
}

if (!memberData) {
    return <Typography>Member profile not found</Typography>; // Data not set
}

// Form should render with memberData
```

**Solution:**
Add more debugging:
```javascript
console.log('🎨 Rendering form with memberData:', memberData);
console.log('🔍 First name value:', memberData?.firstName);
```

---

## Testing Checklist

### ✅ Before Testing
- [ ] Backend server running (`cd api && npm start`)
- [ ] Frontend server restarted after cognitoAuth.js changes
- [ ] Browser console open (F12)
- [ ] User has Cognito attributes set (given_name, family_name)

### ✅ Test AnmcUser Update Details
- [ ] Login as AnmcUser succeeds
- [ ] Navigate to Update Details page
- [ ] Check console logs show user data correctly
- [ ] Form fields populated with firstName, lastName, email, mobile
- [ ] Can edit fields
- [ ] Save changes succeeds
- [ ] Check console logs show auth token for API call

### ✅ Test AnmcUser Booking with Payment
- [ ] Login as AnmcUser succeeds
- [ ] Navigate to Book Services
- [ ] Select service and fill form
- [ ] Click "Proceed to Payment"
- [ ] Check console: booking creation has auth token
- [ ] Check console: payment intent creation has auth token
- [ ] Payment form displays
- [ ] Payment button is enabled (not grayed out)
- [ ] Can enter card details
- [ ] Payment submission works

### ✅ Test AnmcMember (Ensure Not Broken)
- [ ] Login as AnmcMember succeeds
- [ ] Update Details still works
- [ ] Booking flow still works
- [ ] Member-specific features accessible

---

## Expected Console Output Summary

### Successful AnmcUser Update Details Flow

```
👤 [UpdateDetails] Current user: {email: "bookuser@gmail.com", given_name: "Book", ...}
🔍 [UpdateDetails] User type check: {isAnmcUser: true, isAnmcMember: false}
✅ [UpdateDetails] Created AnmcUser data: {firstName: "Book", lastName: "User", ...}
🔐 [UpdateDetails] Auth token: Token retrieved
✅ [UpdateDetails] Auth header added: http://localhost:3001/api/users/bookuser@gmail.com/attributes
```

### Successful Booking Flow

```
🔐 Auth token: Token retrieved successfully
✅ Authorization header added to request: http://localhost:3001/api/bookings
🔐 Auth token: Token retrieved successfully
✅ Authorization header added to request: http://localhost:3001/api/bookings/create-payment-intent
```

### Failed Flow (No Token)

```
❌ Auth fetch error: Error: No current user
⚠️ No token available for request: http://localhost:3001/api/bookings/create-payment-intent
```

---

## Remove Debugging Logs Later

Once issues are resolved, you can remove the console.log statements from:
1. [src/services/cognitoAuth.js](src/services/cognitoAuth.js) - Keep the attribute mapping, remove logs if added
2. [src/main-component/BookServices/index.js](src/main-component/BookServices/index.js#L41-L54)
3. [src/main-component/UpdateDetails/index.js](src/main-component/UpdateDetails/index.js#L63-L97)

Or keep them for future debugging (they're harmless in production).

---

## Related Documentation

1. [ANMCUSER-BOOKING-PAYMENT-FIXES.md](ANMCUSER-BOOKING-PAYMENT-FIXES.md) - Complete fix documentation
2. [PAYMENT-BUTTON-FIX.md](PAYMENT-BUTTON-FIX.md) - Stripe payment button issue
3. [STRIPE-PAYMENT-SETUP.md](STRIPE-PAYMENT-SETUP.md) - Stripe configuration guide

---

## Quick Fix Commands

```bash
# Restart frontend (required after cognitoAuth.js changes)
cd d:\my-projects\anmcDigital
npm start

# Restart backend (if you modified API routes)
cd d:\my-projects\anmcDigital\api
npm start

# Check if backend is running
curl http://localhost:3001/api/services

# Update Cognito user attributes (AWS CLI)
aws cognito-idp admin-update-user-attributes \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username bookuser@gmail.com \
  --user-attributes \
    Name=given_name,Value=Book \
    Name=family_name,Value=User
```

---

## Next Steps

1. **Restart frontend server** to apply cognitoAuth.js changes
2. **Test AnmcUser login** and check browser console
3. **Navigate to Update Details** and verify logs show correct data
4. **Check if form is populated** - if not, review console logs
5. **Fix Cognito attributes** if they're missing (see Option A/B/C above)
6. **Test booking flow** and verify auth tokens are present
7. **Report results** with console log screenshots if issues persist
