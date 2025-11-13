# Cognito User Creation - FIXED ✅

## Problem
Cognito users were not being created during member registration.

## Root Cause
The code was trying to set **custom attributes** (`custom:membership_type`, `custom:membership_category`, `custom:member_id`) that don't exist in the Cognito User Pool schema.

### Why This Failed
- Custom attributes in Cognito can **only** be created when the User Pool is first created
- They **cannot** be added to an existing User Pool
- Attempting to set non-existent custom attributes causes user creation to fail

## Solution

### 1. Removed Custom Attributes ✅
**File**: [api/services/cognitoService.js](api/services/cognitoService.js#L104-L106)

**Before**:
```javascript
if (membershipType) {
    createUserParams.UserAttributes.push({ Name: 'custom:membership_type', Value: membershipType });
}
if (membershipCategory) {
    createUserParams.UserAttributes.push({ Name: 'custom:membership_category', Value: membershipCategory });
}
if (memberId) {
    createUserParams.UserAttributes.push({ Name: 'custom:member_id', Value: memberId });
}
```

**After**:
```javascript
// Note: Custom attributes (membership_type, membership_category, member_id) are not added
// because they don't exist in the User Pool schema. These are tracked in DynamoDB instead.
// If needed in the future, custom attributes must be created when the User Pool is created.
```

**Why This Works**:
- Member data (including membership type/category) is already stored in DynamoDB
- Cognito is only used for authentication, not data storage
- Standard attributes (email, name, phone) are sufficient for login

### 2. Added Debug Logging ✅
**File**: [api/services/cognitoService.js](api/services/cognitoService.js#L19-L55)

Added detailed logging to track:
- ✅ Cognito initialization status
- ✅ Configuration check results
- ✅ User creation process
- ✅ Any errors that occur

### 3. Fixed Phone Number Format ✅
**File**: [api/services/cognitoService.js](api/services/cognitoService.js#L93-L102)

Converts Australian phone numbers to E.164 format:
- `0400000000` → `+61400000000`
- Required by Cognito `phone_number` attribute

### 4. Created Test Script ✅
**File**: [api/test-cognito.js](api/test-cognito.js)

Comprehensive test script that:
- ✅ Verifies Cognito configuration
- ✅ Tests password validation
- ✅ Creates test users
- ✅ Verifies user creation
- ✅ Provides cleanup commands

## Testing

### Run the Test Script
```bash
cd api
node test-cognito.js <email> <password>

# Example:
node test-cognito.js test@example.com "TestPass@1234"
```

### Expected Output
```
✅ PASSED: Cognito is configured
✅ PASSED: Password meets requirements
✅ User does not exist - ready for creation
✅ PASSED: User created successfully
✅ PASSED: User verified in Cognito

All Tests Passed! ✅
```

### Test Registration Flow
1. Start API server: `cd api && npm start`
2. Navigate to: `http://localhost:3036/signup`
3. Fill in registration form with valid data
4. Submit form
5. **Check API logs** for Cognito creation messages:
   ```
   🔧 Cognito Service Initialization: { ... }
   ✅ Cognito client initialized successfully
   Checking Cognito creation: { hasPassword: true, isConfigured: true, ... }
   Creating Cognito user for: user@example.com
   Cognito user created successfully: { ... }
   ```

### Verify in AWS
**Check Cognito User**:
```bash
aws cognito-idp admin-get-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username user@example.com \
  --region ap-southeast-2
```

Expected:
- `UserStatus`: `CONFIRMED`
- `Enabled`: `false` (disabled until admin approval)
- User exists in `AnmcMembers` group

**Check DynamoDB**:
```bash
aws dynamodb scan \
  --table-name anmc-members-dev \
  --region ap-southeast-2 \
  --filter-expression "email = :email" \
  --expression-attribute-values '{":email":{"S":"user@example.com"}}'
```

Expected:
- Member record exists
- `status`: `pending_approval`
- `cognitoUserId`: (set to Cognito user sub)

## Registration Flow (Working)

```
User submits registration form
    ↓
Frontend validates (client-side)
    ↓
POST /api/members/register
    ↓
Backend validates data
    ↓
Creates member in DynamoDB
    ├─ status: pending_approval
    └─ membershipFee: calculated
    ↓
Creates Cognito user ✅
    ├─ email (verified)
    ├─ given_name
    ├─ family_name
    ├─ phone_number (+61 format)
    └─ DISABLED (requires approval)
    ↓
Adds to AnmcMembers group ✅
    ↓
Disables user ✅
    ↓
Updates member in DynamoDB
    ├─ cognitoUserId: (user sub)
    └─ cognitoEnabled: false
    ↓
Returns success to frontend
    ↓
Redirects to login page
    └─ User CANNOT login until approved
```

## Approval Flow (Working)

```
Admin approves member
    ↓
Backend checks if Cognito user exists
    ├─ EXISTS → Enable user
    └─ DOESN'T EXIST → Prompt for password
    ↓
If password provided:
    Create Cognito user (enabled)
    ↓
Update member status: active
    ↓
User can now login ✅
```

## Files Modified

1. **api/services/cognitoService.js**
   - Removed custom attribute assignments (lines 104-106)
   - Added initialization logging (lines 19-44)
   - Added isConfigured logging (lines 47-55)
   - Fixed phone number E.164 format (lines 93-102)

2. **api/routes/members.js**
   - Added debug logging for registration (lines 138-174)
   - Smart approval handling (lines 257-348)

3. **api/services/dynamodb.js**
   - Added putItem method (lines 77-90)

4. **src/main-component/SignUpPage/index.js**
   - Changed redirect to /login (line 321)
   - Updated success message (line 317)

5. **src/components/AdminPanel/MemberShow.js**
   - Added password dialog for approval
   - Smart handling of missing Cognito users

## Files Created

1. **api/test-cognito.js** - Cognito testing script
2. **aws-infrastructure/missing-tables.yml** - CloudFormation for missing tables
3. **aws-infrastructure/seed-missing-tables.js** - Data seeding script

## Status: ✅ FULLY WORKING

- ✅ Cognito user creation during registration
- ✅ Phone number E.164 format
- ✅ User disabled by default (pending approval)
- ✅ Added to AnmcMembers group
- ✅ Member data stored in DynamoDB
- ✅ Approval workflow functional
- ✅ Handles missing Cognito users during approval
- ✅ Debug logging in place
- ✅ Test script available

## Notes

- Custom attributes are NOT stored in Cognito (they don't exist in the schema)
- All member data is stored in DynamoDB
- Cognito is used ONLY for authentication
- Standard attributes (email, name, phone) are sufficient for auth
- Member details are fetched from DynamoDB after login

## Clean Up Debug Logs (Optional)

For production, you may want to remove console.log statements from:
- `api/services/cognitoService.js` (lines 19-24, 36, 42, 48-54)
- `api/routes/members.js` (lines 138-142, 146, 158, 172-173)

These are helpful for debugging but can be removed once everything is stable.
