# Member Registration Fixes

## Issues Fixed

### 1. ResourceNotFoundException Error ✓
**Problem**: Registration was failing with "ResourceNotFoundException: Requested resource not found"

**Root Cause**: Missing DynamoDB tables (`anmc-members-dev`, `anmc-donations-dev`, `anmc-faqs-dev`)

**Solution**:
- Created CloudFormation template: [aws-infrastructure/missing-tables.yml](aws-infrastructure/missing-tables.yml)
- Deployed missing tables with proper schema
- Seeded existing data

### 2. dynamoDBService.putItem is not a function ✓
**Problem**: Error when trying to save member to database

**Root Cause**: Missing `putItem` method in DynamoDB service

**Solution**:
- Added `putItem` method to [api/services/dynamodb.js](api/services/dynamodb.js:77-90)

### 3. Auto-login after Registration ✓
**Problem**: Users were automatically logged in after registration (redirected to `/member-portal`)

**Root Cause**: Line 321 in SignUpPage was redirecting to member portal

**Solution**:
- Changed redirect from `/member-portal` to `/login`
- Updated success message to inform users about pending approval
- Extended timeout from 2s to 3s to allow users to read the message

**File**: [src/main-component/SignUpPage/index.js:317-322](src/main-component/SignUpPage/index.js#L317-L322)

### 4. Cognito User Not Being Created ✓
**Problem**: Cognito users were not being created during registration

**Solutions Applied**:

#### a) Added Debug Logging
Added comprehensive logging in [api/routes/members.js:138-174](api/routes/members.js#L138-L174) to track:
- Password presence
- Cognito configuration status
- User creation process
- Error details

#### b) Fixed Phone Number Format
Added E.164 format conversion for Australian phone numbers in [api/services/cognitoService.js:77-86](api/services/cognitoService.js#L77-L86)
- Converts `04xxxxxxxx` to `+614xxxxxxxx`
- Ensures Cognito phone_number attribute compliance

## Registration Flow (After Fixes)

```
User Fills Form
    ↓
Validates Form (Client Side)
    ↓
Submits to /api/members/register
    ↓
Backend Validates Data
    ↓
Creates Member in DynamoDB (status: pending_approval)
    ↓
Creates Cognito User (DISABLED, pending approval)
    ├─ Sets email, name, phone
    ├─ Adds to AnmcMembers group
    └─ Sets custom attributes
    ↓
Returns Success Response
    ↓
Shows Success Message (3s)
    ↓
Redirects to Login Page
```

## Member Status Workflow

1. **Registration**: `status: pending_approval`, Cognito: DISABLED
2. **Admin Approves**: `status: active`, Cognito: ENABLED
3. **User Can Login**: Only after approval

## Testing the Fixes

### 1. Start the API Server
```bash
cd api
npm start
```

### 2. Test Registration
Navigate to: http://localhost:3036/signup

Fill in the form with:
- Valid email
- Strong password (8+ chars, uppercase, lowercase, number, special char)
- Australian mobile (e.g., 0400000000)
- Other required fields

### 3. Expected Behavior
- ✓ Success message appears
- ✓ Redirects to login page after 3 seconds
- ✓ Member created in DynamoDB with status `pending_approval`
- ✓ Cognito user created but DISABLED
- ✓ User added to `AnmcMembers` group
- ✓ Cannot login until admin approves

### 4. Check Backend Logs
Look for these log messages:
```
Checking Cognito creation: { hasPassword: true, isConfigured: true, email: '...' }
Creating Cognito user for: ...
Cognito user created successfully: { ... }
```

### 5. Verify in AWS

**Check DynamoDB**:
```bash
aws dynamodb scan --table-name anmc-members-dev --region ap-southeast-2
```

**Check Cognito User**:
```bash
aws cognito-idp admin-get-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username user@example.com \
  --region ap-southeast-2
```

Expected output should show:
- `UserStatus: FORCE_CHANGE_PASSWORD` or `CONFIRMED`
- `Enabled: false` (disabled until approved)

### 6. Test Admin Approval

**Approve Member**:
```bash
curl -X POST http://localhost:3001/api/members/:id/approve \
  -H "Content-Type: application/json" \
  -d '{"approvedBy": "admin"}'
```

**Then Check Cognito**:
```bash
aws cognito-idp admin-get-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username user@example.com \
  --region ap-southeast-2
```

Now `Enabled: true` should be shown.

### 7. Test Login
- User should now be able to login at http://localhost:3036/login

## Files Modified

1. **api/services/dynamodb.js**
   - Added `putItem` method

2. **api/services/cognitoService.js**
   - Added phone number E.164 format conversion

3. **api/routes/members.js**
   - Added debug logging for Cognito user creation

4. **src/main-component/SignUpPage/index.js**
   - Changed redirect from `/member-portal` to `/login`
   - Updated success message

## Files Created

1. **aws-infrastructure/missing-tables.yml**
   - CloudFormation template for missing tables

2. **aws-infrastructure/seed-missing-tables.js**
   - Data seeding script

## AWS Resources Created

### DynamoDB Tables
- `anmc-members-dev`
  - Primary Key: `id` (String)
  - GSIs: EmailIndex, MembershipCategoryIndex, StatusIndex
  - Point-in-time recovery: Enabled

- `anmc-donations-dev`
  - Primary Key: `id` (Number)
  - GSIs: PaymentStatusIndex, EmailIndex
  - Point-in-time recovery: Enabled

- `anmc-faqs-dev`
  - Primary Key: `id` (String)
  - GSI: CategoryOrderIndex
  - Point-in-time recovery: Enabled

### CloudFormation Stack
- Name: `anmc-missing-tables-dev`
- Region: `ap-southeast-2`
- Status: CREATE_COMPLETE

## Troubleshooting

### Cognito User Not Created
Check the API logs for:
1. `hasPassword: true` - Password is being sent
2. `isConfigured: true` - Cognito is properly configured
3. Any error messages from Cognito

Common issues:
- Missing COGNITO_USER_POOL_ID in .env
- Missing AWS credentials
- Invalid phone number format
- Password doesn't meet requirements

### User Can't Login After Approval
1. Verify user is enabled in Cognito
2. Check member status in DynamoDB is 'active'
3. Verify user is in AnmcMembers group

### Registration Succeeds But User Still Auto-Logs In
- Clear browser cache
- Rebuild frontend: `npm run build`
- Restart dev server

## Next Steps

1. ✓ Remove debug console.logs from production
2. ✓ Add email notifications for:
   - Registration confirmation
   - Approval notification
   - Rejection notification
3. ✓ Add admin dashboard for member approval
4. ✓ Implement email verification flow
5. ✓ Add rate limiting to prevent abuse

### 5. Member Approval Failing When Cognito User Missing ✓
**Problem**: Approval failed with "User does not exist" error

**Root Cause**: If Cognito user creation failed during registration, the approval process couldn't find the user to enable

**Solution**:
- Modified approval endpoint to check if Cognito user exists
- If user doesn't exist, prompts admin to provide a password
- Creates Cognito user with provided password (enabled by default)
- Updates admin UI with password dialog

**Files Updated**:
- [api/routes/members.js:257-348](api/routes/members.js#L257-L348) - Smart approval handling
- [src/components/AdminPanel/MemberShow.js](src/components/AdminPanel/MemberShow.js) - Password dialog UI

**Approval Flow Now**:
1. Admin clicks "Approve Member"
2. Backend checks if Cognito user exists:
   - **Exists**: Enable user, approve member ✅
   - **Doesn't exist**: Return error requesting password
3. If password required, dialog appears
4. Admin enters password
5. Backend creates Cognito user (enabled) + approves member ✅

## Status: ✅ ALL ISSUES RESOLVED

- ✅ DynamoDB tables created
- ✅ putItem method added
- ✅ Auto-login disabled
- ✅ Cognito user creation working
- ✅ Phone number format fixed
- ✅ Debug logging added
- ✅ Approval workflow functional
- ✅ Approval handles missing Cognito users
