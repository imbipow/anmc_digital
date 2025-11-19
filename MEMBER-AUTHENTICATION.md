# ANMC Member Portal - Authentication Guide

## Overview

The member portal now uses AWS Cognito for secure user authentication. All member portal pages are protected and require users to log in before accessing them.

## Test Credentials (Development Mode)

When AWS Cognito is not configured, the system automatically falls back to test credentials for development purposes.


## Protected Routes

The following routes require authentication:
- `/member-portal` - Member dashboard
- `/member/update-details` - Update contact information
- `/member/book-services` - Book services (Car Puja, Marriage, Bartabhanda)
- `/member/bookings` - View booking history
- `/member/documents` - Download member documents

## Authentication Features

### Login Flow
1. User visits any protected route
2. If not authenticated, redirects to `/login`
3. User enters email and password
4. System validates credentials (Cognito or fallback)
5. On success, redirects to originally requested page or `/member-portal`
6. User session is maintained across page refreshes

### Logout Flow
1. User clicks "Logout" button in member portal
2. Session is cleared from Cognito (or local storage in fallback mode)
3. User is redirected to login page
4. Success toast notification displayed

### Session Management
- User session persists across page refreshes
- Session checks on app initialization
- Loading state shown while checking authentication
- Automatic redirect to login if session expires

## AWS Cognito Configuration (Production)

### Prerequisites
- AWS Account
- AWS Cognito User Pool created
- User groups configured in Cognito

### Environment Variables

Add these to your `.env` file in the root directory:

```env
REACT_APP_COGNITO_USER_POOL_ID=ap-southeast-2_xxxxxxxxx
REACT_APP_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxx
REACT_APP_COGNITO_REGION=ap-southeast-2
```

### Creating a User Pool

1. **Go to AWS Cognito Console:**
   - Visit: https://console.aws.amazon.com/cognito
   - Click "Create user pool"

2. **Configure Sign-in Options:**
   - Sign-in options: Email
   - Username: Email address only

3. **Security Requirements:**
   - Password policy: Default (or customize as needed)
   - MFA: Optional (recommended: Required for production)
   - User account recovery: Email only

4. **Configure Message Delivery:**
   - Email provider: Amazon SES or Cognito email
   - FROM email address: `noreply@anmcinc.org.au`

5. **Integrate Your App:**
   - App type: Public client
   - App client name: `anmc-member-portal`
   - **IMPORTANT:** Don't generate a client secret (not supported for public clients)
   - Authentication flows: Enable `ALLOW_USER_PASSWORD_AUTH`

6. **Review and Create:**
   - Review all settings
   - Create user pool
   - Note the User Pool ID and Client ID

### Creating User Groups

In your Cognito User Pool, create these groups:

1. **GeneralMembers**
   - Description: General membership tier
   - Precedence: 2

2. **LifeMembers**
   - Description: Life membership tier
   - Precedence: 1

3. **FamilyMembers**
   - Description: Family membership type
   - Precedence: 3

### Creating Test Users in Cognito

#### Option 1: AWS Console
1. Go to Cognito User Pool
2. Click "Users" > "Create user"
3. Enter user details:
   - Email: `member@anmcinc.org.au`
   - Temporary password: `TempPass123!`
4. User attributes:
   - given_name: `Test`
   - family_name: `Member`
   - custom:membership_type: `general`
   - custom:member_id: `ANMC-2024-TEST001`
   - custom:join_date: `2024-01-01`
5. Add user to appropriate group
6. Send welcome email (user will need to change password on first login)

#### Option 2: AWS CLI
```bash
aws cognito-idp admin-create-user \
  --user-pool-id ap-southeast-2_xxxxxxxxx \
  --username member@anmcinc.org.au \
  --user-attributes \
    Name=email,Value=member@anmcinc.org.au \
    Name=given_name,Value=Test \
    Name=family_name,Value=Member \
    Name=custom:membership_type,Value=general \
    Name=custom:member_id,Value=ANMC-2024-TEST001 \
    Name=custom:join_date,Value=2024-01-01 \
  --temporary-password "TempPass123!" \
  --message-action SUPPRESS

# Add user to group
aws cognito-idp admin-add-user-to-group \
  --user-pool-id ap-southeast-2_xxxxxxxxx \
  --username member@anmcinc.org.au \
  --group-name GeneralMembers
```

#### Option 3: During Member Registration
When a user completes the membership registration and payment:
1. Member record is saved to database
2. Cognito user is automatically created via API
3. Password is set by user during registration
4. User is added to appropriate group based on membership type
5. Custom attributes are populated from registration form

## Custom User Attributes

The system uses these custom Cognito attributes:

| Attribute | Description | Example |
|-----------|-------------|---------|
| `custom:member_id` | Unique member reference number | `ANMC-2024-001` |
| `custom:membership_type` | Type of membership | `general`, `life` |
| `custom:membership_category` | Category of membership | `single`, `family` |
| `custom:join_date` | Date member joined | `2024-01-15` |
| `given_name` | First name | `John` |
| `family_name` | Last name | `Doe` |

To add custom attributes to your User Pool:
1. Go to User Pool > Attributes
2. Add custom attributes:
   - `member_id` (String, Mutable)
   - `membership_type` (String, Mutable)
   - `membership_category` (String, Mutable)
   - `join_date` (String, Mutable)

**Note:** Custom attributes can only be added when creating a new user pool. If your pool already exists, you'll need to create a new one.

## Fallback Authentication (Development)

When Cognito is not configured, the system automatically uses fallback authentication:

**Features:**
- Uses localStorage for session persistence
- Validates against hardcoded test credentials
- Simulates Cognito user object structure
- Useful for local development and testing

**Fallback User Object:**
```javascript
{
  email: 'member@anmcinc.org.au',
  attributes: {
    email: 'member@anmcinc.org.au',
    given_name: 'Test',
    family_name: 'Member',
    'custom:membership_type': 'general'
  },
  fallbackAuth: true
}
```

## Security Best Practices

### For Development
✅ Use fallback authentication for testing
✅ Test credentials visible on login page
✅ Session stored in localStorage

### For Production
⚠️ **IMPORTANT:** Configure AWS Cognito before going live
⚠️ Remove test credentials from login page
⚠️ Enable MFA (Multi-Factor Authentication)
⚠️ Use strong password policy
⚠️ Enable account recovery via email
⚠️ Set up CloudWatch logging
⚠️ Configure rate limiting
⚠️ Use HTTPS only

## Troubleshooting

### Issue: "Invalid credentials" error

**Cause:** Incorrect email or password

**Solutions:**
1. Verify test credentials: `member@anmcinc.org.au` / `Member123!`
2. If using Cognito, check user exists in User Pool
3. Check if temporary password needs to be changed
4. Verify Cognito configuration in `.env`

### Issue: Redirects to login after successful authentication

**Cause:** Session not persisting

**Solutions:**
1. Check browser localStorage is enabled
2. Verify MemberAuthProvider is wrapping the app
3. Check for console errors during authentication
4. Verify Cognito credentials are correct

### Issue: "User pool does not exist" error

**Cause:** Incorrect Cognito configuration

**Solutions:**
1. Verify User Pool ID in `.env` is correct
2. Check AWS region matches User Pool region
3. Verify User Pool exists in AWS Console
4. Check environment variables are loaded (restart server)

### Issue: Protected routes accessible without login

**Cause:** ProtectedRoute not wrapping routes correctly

**Solutions:**
1. Check routes are wrapped with `<ProtectedRoute>` component
2. Verify MemberAuthProvider is at app root level
3. Check for errors in browser console
4. Verify isAuthenticated is working correctly

## Testing Authentication

### Manual Testing Checklist

1. **Login Flow:**
   - [ ] Visit `/member-portal` without being logged in
   - [ ] Verify redirect to `/login`
   - [ ] Enter test credentials
   - [ ] Verify successful login
   - [ ] Verify redirect to member portal
   - [ ] Check user name displayed correctly

2. **Session Persistence:**
   - [ ] Login successfully
   - [ ] Refresh the page
   - [ ] Verify still logged in
   - [ ] Check user data still displayed

3. **Logout Flow:**
   - [ ] Login successfully
   - [ ] Click "Logout" button
   - [ ] Verify redirect to login page
   - [ ] Try to access `/member-portal`
   - [ ] Verify redirect back to login

4. **Protected Routes:**
   - [ ] Try accessing each protected route without login
   - [ ] Verify all redirect to login
   - [ ] Login and verify can access all routes

5. **Invalid Credentials:**
   - [ ] Enter wrong email
   - [ ] Verify error message
   - [ ] Enter wrong password
   - [ ] Verify error message
   - [ ] Check loading states work correctly

## Integration with Member Registration

When a new member registers:

1. **Frontend (`SignUpPage`):**
   - Collects member details
   - Validates form data
   - Processes payment (if upfront)
   - Calls registration API

2. **Backend (`/api/members/register`):**
   - Validates member data
   - Creates member record in database
   - **Creates Cognito user:**
     - Email as username
     - Password from registration form
     - Custom attributes from member data
     - Adds to appropriate group
   - Returns success/error

3. **Post-Registration:**
   - User can immediately login with credentials
   - Access to member portal
   - All member features available

## API Endpoints Related to Authentication

### Member Registration (Creates Cognito User)
```http
POST /api/members/register
Content-Type: application/json

{
  "email": "newmember@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "membershipCategory": "general",
  "membershipType": "single",
  ...
}
```

Response:
```json
{
  "success": true,
  "member": {
    "id": "mem-123",
    "referenceNo": "ANMC-2024-001",
    ...
  },
  "message": "Registration successful"
}
```

## File Structure

```
src/
├── services/
│   └── cognitoAuth.js              # Cognito authentication service
├── components/
│   ├── MemberAuth/
│   │   └── index.js                # Auth context provider
│   └── ProtectedRoute/
│       └── index.js                # Protected route component
├── main-component/
│   ├── App/
│   │   └── App.js                  # Wrapped with MemberAuthProvider
│   ├── router/
│   │   └── index.js                # Routes with ProtectedRoute
│   ├── LoginPage/
│   │   └── index.js                # Login form with Cognito
│   └── MemberPortal/
│       └── index.js                # Member dashboard (protected)
```

## Support and Documentation

- **AWS Cognito Docs:** https://docs.aws.amazon.com/cognito
- **React Context API:** https://react.dev/reference/react/useContext
- **Membership System:** See `MEMBERSHIP-SYSTEM-SETUP.md`

## Next Steps

1. ✅ Authentication system implemented
2. ✅ Protected routes configured
3. ✅ Test credentials available
4. 🔜 Configure production Cognito User Pool
5. 🔜 Create custom attributes in Cognito
6. 🔜 Test with real users
7. 🔜 Enable MFA for production
8. 🔜 Set up email templates for password reset
