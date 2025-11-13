# Test Registration Flow

## Step-by-Step Testing Instructions

### 1. Start the Servers

**Terminal 1 - API Server:**
```bash
cd d:\my-projects\anmcDigital\api
npm start
```

**Terminal 2 - Frontend:**
```bash
cd d:\my-projects\anmcDigital
npm start
```

### 2. Open Browser Console

1. Open browser developer tools (F12)
2. Go to Console tab
3. Keep it open to see any client-side errors

### 3. Navigate to Registration

Go to: `http://localhost:3036/signup`

### 4. Fill Registration Form

Use these test values:

- **First Name:** John
- **Last Name:** Doe
- **Email:** `test-registration-$(date +%s)@anmc.org.au` (use unique email each time)
- **Mobile:** 0412345678
- **Gender:** Male
- **Age:** 30 (optional)
- **Membership Category:** General Membership
- **Membership Type:** Single
- **Residential Address:**
  - Street: 123 Test Street
  - Suburb: Sydney
  - State: NSW
  - Postcode: 2000
- **Password:** `TestPass@1234`
- **Confirm Password:** `TestPass@1234`
- **Accept Declaration:** ✓ Checked

### 5. Submit Form

Click "Proceed to Payment" or "Complete Registration"

### 6. Check API Terminal Logs

You should see these logs in sequence:

```
🔧 Cognito Service Initialization: {
  region: 'ap-southeast-2',
  userPoolId: 'ap-southeast-2_egMmx...',
  clientId: '2h0bk9340rlmevdnsof7...',
  hasAwsCredentials: true
}
✅ Cognito client initialized successfully

Checking Cognito creation: {
  hasPassword: true,
  isConfigured: true,
  email: 'test-registration-...@anmc.org.au'
}

Creating Cognito user for: test-registration-...@anmc.org.au

✅ Password set for user: test-registration-...@anmc.org.au
User test-registration-...@anmc.org.au added to AnmcMembers group
⚠️ User disabled (pending approval): test-registration-...@anmc.org.au

Cognito user created successfully: {
  username: 'test-registration-...@anmc.org.au',
  userSub: '...',
  cognitoEnabled: true,
  requiresApproval: true,
  status: 'pending_approval'
}
```

### 7. Expected Frontend Behavior

1. ✅ Form submits successfully
2. ✅ Redirects to `/registration-success`
3. ✅ Shows success page with:
   - Success icon
   - Reference number
   - Membership details
   - Next steps (3-step guide)
   - Warning about pending approval

### 8. Verify in DynamoDB

```bash
aws dynamodb scan \
  --table-name anmc-members-dev \
  --region ap-southeast-2 \
  --filter-expression "email = :email" \
  --expression-attribute-values '{":email":{"S":"YOUR_EMAIL_HERE"}}' \
  --output json
```

**Check:**
- ✅ Member exists
- ✅ `status: "pending_approval"`
- ❌ `password` field should NOT exist
- ❌ `confirmPassword` field should NOT exist
- ✅ `cognitoUserId` should be set

### 9. Verify in Cognito

```bash
aws cognito-idp admin-get-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username YOUR_EMAIL_HERE \
  --region ap-southeast-2
```

**Check:**
- ✅ User exists
- ✅ `UserStatus: "CONFIRMED"`
- ✅ `Enabled: false` (disabled until approval)
- ✅ Email attribute set
- ✅ Name attributes set
- ✅ Phone number in E.164 format (+61...)

### 10. Test Login (Should Fail - Expected)

1. Go to: `http://localhost:3036/login`
2. Enter:
   - Email: (your registered email)
   - Password: `TestPass@1234`
3. Click Login

**Expected Result:**
- ❌ Login FAILS
- Error: "User is disabled" or "Incorrect username or password"
- **This is CORRECT** - user must be approved first

### 11. Approve User (Admin)

1. Go to: `http://localhost:3036/admin`
2. Click "Members"
3. Find your test user
4. Click on the user
5. Click "Approve Member"

**If Cognito user exists:**
- ✅ Approval succeeds immediately
- Success message shown

**If Cognito user doesn't exist:**
- Dialog appears asking for password
- Enter: `TestPass@1234`
- Click "Create Account & Approve"
- ✅ Cognito user created and enabled

### 12. Verify Approval

```bash
# Check Cognito
aws cognito-idp admin-get-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username YOUR_EMAIL_HERE \
  --region ap-southeast-2

# Should show: "Enabled": true

# Check DynamoDB
aws dynamodb scan \
  --table-name anmc-members-dev \
  --region ap-southeast-2 \
  --filter-expression "email = :email" \
  --expression-attribute-values '{":email":{"S":"YOUR_EMAIL_HERE"}}'

# Should show: "status": "active"
```

### 13. Test Login (Should Work)

1. Go to: `http://localhost:3036/login`
2. Enter:
   - Email: (your registered email)
   - Password: `TestPass@1234`
3. Click Login

**Expected Result:**
- ✅ Login SUCCEEDS
- ✅ Redirects to member portal
- ✅ Success toast: "Successfully logged in!"

## Troubleshooting

### Issue: Cognito user not created

**Check API logs for:**
```
Skipping Cognito creation - Password: false Configured: true
```

**Solution:** Password is not being sent from frontend. Check:
1. Form has password field
2. Password validation passes
3. Password is included in request body

**Or check for:**
```
Skipping Cognito creation - Password: true Configured: false
```

**Solution:** Cognito is not configured. Check:
1. `COGNITO_USER_POOL_ID` in `api/.env`
2. `COGNITO_CLIENT_ID` in `api/.env`
3. `AWS_ACCESS_KEY_ID` in `api/.env`
4. `AWS_SECRET_ACCESS_KEY` in `api/.env`

### Issue: Password saved in DynamoDB

**Check:**
```bash
aws dynamodb scan --table-name anmc-members-dev --region ap-southeast-2
```

**Look for:** `password` or `confirmPassword` fields

**If found:** They should be `undefined` or not present at all

**Fixed in:** `api/routes/members.js` lines 130-131

### Issue: Error creating Cognito user

**Check API logs for error details:**
```
❌ Error creating Cognito user: [error message]
Error details: {
  name: '...',
  message: '...',
  code: '...',
  statusCode: ...
}
```

**Common errors:**

1. **InvalidPasswordException**
   - Password doesn't meet requirements
   - Needs: min 8 chars, uppercase, lowercase, number, special char

2. **InvalidParameterException**
   - Custom attributes don't exist (FIXED - removed custom attributes)
   - Phone number format wrong (FIXED - E.164 conversion)

3. **UsernameExistsException**
   - User already registered with this email
   - Delete old user or use different email

### Issue: Success page shows no data

**Check navigation state:**
```javascript
// In browser console
console.log(window.history.state);
```

**Should see:**
```javascript
{
  usr: {
    member: { ... member data ... }
  }
}
```

**If missing:** Registration might have failed, check API response

## Cleanup Test Users

After testing, delete test users:

```bash
# Delete from Cognito
aws cognito-idp admin-delete-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username test-registration-...@anmc.org.au \
  --region ap-southeast-2

# Delete from DynamoDB (get ID first from scan above)
aws dynamodb delete-item \
  --table-name anmc-members-dev \
  --key '{"id":{"S":"MEMBER_ID_HERE"}}' \
  --region ap-southeast-2
```

## Success Criteria

✅ All of these should be true:

1. Registration form submits successfully
2. API logs show Cognito user creation
3. Success page displays with all details
4. User exists in Cognito (disabled)
5. Member exists in DynamoDB
6. NO password stored in DynamoDB
7. Login fails before approval (expected)
8. Admin can approve member
9. Login works after approval
10. User can access member portal

## Quick Test Script

```bash
#!/bin/bash

# Generate unique email
EMAIL="test-$(date +%s)@anmc.org.au"
echo "Testing with email: $EMAIL"

# Wait for manual registration...
echo "Please register with email: $EMAIL"
echo "Press Enter after registration completes..."
read

# Check Cognito
echo "Checking Cognito..."
aws cognito-idp admin-get-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username "$EMAIL" \
  --region ap-southeast-2 \
  --query '{Status:UserStatus,Enabled:Enabled}' \
  --output table

# Check DynamoDB
echo "Checking DynamoDB..."
aws dynamodb scan \
  --table-name anmc-members-dev \
  --region ap-southeast-2 \
  --filter-expression "email = :email" \
  --expression-attribute-values "{\":email\":{\"S\":\"$EMAIL\"}}" \
  --query 'Items[0].{Email:email.S,Status:status.S,HasPassword:password}' \
  --output table

echo "Test complete!"
```

Save as `test-registration.sh` and run:
```bash
chmod +x test-registration.sh
./test-registration.sh
```
