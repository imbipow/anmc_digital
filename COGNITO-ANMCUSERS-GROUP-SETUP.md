# Cognito AnmcUsers Group Setup Guide

This guide explains how to set up the `AnmcUsers` group in AWS Cognito for regular users who want to book services but are not ANMC members.

## Overview

The ANMC application now supports two types of users:

1. **AnmcMembers** - Full members who have paid membership fees and have access to all features including member documents
2. **AnmcUsers** - Regular users who can book services but don't have access to member-specific features like documents

## Prerequisites

- AWS account with access to Cognito
- Existing Cognito User Pool (already set up for ANMC)
- AWS CLI or Console access

## Setup Steps

### Step 1: Create the AnmcUsers Group

#### Using AWS Console:

1. Log in to AWS Console
2. Navigate to **Amazon Cognito**
3. Select your User Pool (the one used for ANMC)
4. Click on **Groups** in the left sidebar
5. Click **Create group**
6. Enter the following details:
   - **Group name**: `AnmcUsers`
   - **Description**: `Regular users who can book services but are not members`
   - **Precedence**: `3` (lower than AnmcMembers which should be 2)
   - **IAM role**: Leave blank (not needed for this use case)
7. Click **Create group**

#### Using AWS CLI:

```bash
aws cognito-idp create-group \
  --user-pool-id <YOUR_USER_POOL_ID> \
  --group-name AnmcUsers \
  --description "Regular users who can book services but are not members" \
  --precedence 3
```

### Step 2: Verify Group Creation

1. Go to the **Groups** section in your Cognito User Pool
2. You should now see:
   - `AnmcAdmins` (precedence 1)
   - `AnmcMembers` (precedence 2)
   - `AnmcUsers` (precedence 3)
   - `AnmcManagers` (if applicable)

## User Registration Flow

### For Members (AnmcMembers):
1. User registers via `/signup` page
2. User is added to `AnmcMembers` group
3. User account is **disabled by default**
4. Admin must approve the member
5. Once approved, member can login and access all features

### For Regular Users (AnmcUsers):
1. User registers via `/user-signup` page
2. User is added to `AnmcUsers` group
3. User account is **enabled immediately** (no approval needed)
4. User can login right away and book services
5. User does **NOT** have access to member documents
6. Users appear in Admin Panel under "Users" tab for monitoring

## Feature Access Comparison

| Feature | AnmcMembers | AnmcUsers |
|---------|-------------|-----------|
| Update Details | ✅ Yes | ✅ Yes |
| Book Services | ✅ Yes | ✅ Yes |
| View Bookings | ✅ Yes | ✅ Yes |
| Member Documents | ✅ Yes | ❌ No |
| Member Discount (10%) | ✅ Yes | ❌ No |

## Backend Implementation

The backend has been updated to support both user types:

### Cognito Service (`api/services/cognitoService.js`)

The `createUser` method now accepts a third parameter `userType`:

```javascript
async createUser(userData, enabledByDefault = false, userType = 'member')
```

- For members: `userType = 'member'` → adds to AnmcMembers group, disabled by default
- For users: `userType = 'user'` → adds to AnmcUsers group, **auto-enabled immediately**

**Auto-Enable Logic:**
When `userType = 'user'`, the service automatically sets `enabledByDefault = true` on line 155:
```javascript
if (userType === 'user') {
    await this.addToAnmcUsersGroup(email);
    enabledByDefault = true; // Regular users don't need approval
}
```

### User Registration Endpoint (`api/routes/users.js`)

New public endpoint for user registration:

```
POST /api/users/register
```

This endpoint:
- Does not require authentication
- Creates user in Cognito with `userType = 'user'`
- Automatically enables the user (no approval needed)
- Adds user to `AnmcUsers` group

### Admin User Management (`api/routes/users.js`)

Updated endpoint to list AnmcUsers:

```
GET /api/users/groups/AnmcUsers/users
```

This endpoint:
- Requires admin authentication
- Returns all users in the AnmcUsers group
- Displayed in Admin Panel under "Users" tab

## Frontend Implementation

### New User Signup Page

**Route**: `/user-signup`
**Component**: `src/main-component/UserSignUpPage/index.js`

A simplified registration form for regular users that:
- Collects basic information (name, email, mobile, password)
- Optional address fields
- No membership fee or payment required
- Immediately creates an active account

### Service Booking Flow

1. User clicks "Book Now" on any service in `/facilities`
2. System checks if user is logged in
3. If **logged in**: Redirects to booking page (`/member/book-services`)
4. If **not logged in**: Redirects to **login page** (`/login`) with booking context
5. Login page shows two signup options:
   - **Quick User Signup** (book services only, instant access)
   - **Full Membership** (all features + 10% discount)
6. After login or signup → redirected to booking page

### Member Portal Access

The Member Portal now dynamically adjusts based on user group:

- **AnmcMembers**: See all 4 features including "Member Documents"
- **AnmcUsers**: See only 3 features (no "Member Documents")
- Portal title changes from "Member Portal" to "User Portal" for AnmcUsers

### Admin Panel - User Management

The Admin Panel now includes a "Users" tab showing all AnmcUsers:

- **Location**: Admin Panel → User Management
- **Tabs**: Admins | Managers | Users
- **Features**:
  - View all registered users (AnmcUsers group)
  - See user status (all should be "Active" as auto-enabled)
  - Enable/disable users if needed
  - Delete users
  - Monitor user registrations in real-time

## Testing the Setup

### Test User Registration:

1. Visit `http://localhost:3000/user-signup`
2. Fill in the registration form
3. Submit the form
4. You should be redirected to login page
5. Login with the credentials
6. Verify you're in the "User Portal" (not "Member Portal")
7. Verify you can see Update Details, Book Services, and My Bookings
8. Verify you **cannot** see Member Documents

### Test Service Booking:

1. Logout if logged in
2. Visit `/facilities` page
3. Click "Book Now" on any service
4. Verify you're redirected to **login page** (not directly to signup)
5. Verify login page shows:
   - Title: "Sign In" (generic, not member-specific)
   - Alert message: "Please login or sign up to continue booking"
   - Two signup buttons: "Sign up as User" and "Register for Full Membership"
   - Footer text: "Both members and users can login here"
6. Click "Sign up as User" button
7. Complete user registration
8. Verify redirect to login page after registration
9. Login with new credentials as AnmcUser
10. Verify login succeeds (no "Access denied" error)
11. Verify redirect to booking page (`/member/book-services`)

### Test Admin Panel - User Listing:

1. Login as an admin user
2. Navigate to Admin Panel
3. Go to User Management section
4. Click on the "Users" tab (third tab)
5. Verify you see all registered AnmcUsers
6. Verify all users show status as "Active" (green chip)
7. Test enable/disable functionality
8. Verify user count is displayed correctly in tab label

## Troubleshooting

### Issue: Group not found error

**Error**: `Could not add user to AnmcUsers group: Group not found`

**Solution**: Make sure you've created the `AnmcUsers` group in Cognito as described in Step 1.

### Issue: User not enabled after registration

**Problem**: User registered but cannot login

**Solution**: Check the backend logs. For regular users (`userType = 'user'`), the account should be enabled automatically. Verify the `createUser` method is being called with `userType = 'user'`.

### Issue: User sees "Member Documents" when they shouldn't

**Problem**: AnmcUsers group member can see the documents feature

**Solution**:
1. Check the user's Cognito groups
2. Ensure they're in `AnmcUsers` and not `AnmcMembers`
3. Verify the frontend is correctly reading the groups from the Cognito token

## Security Considerations

1. **Public Registration**: The `/api/users/register` endpoint is public and does not require authentication
2. **Email Verification**: Email is automatically verified for new users
3. **Password Requirements**: Same strict requirements as members (8+ chars, uppercase, lowercase, number, special char)
4. **No Approval Needed**: Regular users are enabled immediately without admin approval
5. **Limited Access**: Users in AnmcUsers group have restricted access compared to members

## Future Enhancements

Potential improvements:

1. Add email verification flow for regular users
2. Implement rate limiting on user registration endpoint
3. Add CAPTCHA to prevent bot registrations
4. Allow users to upgrade to member status
5. Add different pricing for members vs. non-members

## Related Documentation

- [COGNITO-ANMCMEMBERS-GROUP-SETUP.md](./COGNITO-ANMCMEMBERS-GROUP-SETUP.md) - Member group setup
- [MEMBER-SIGNUP-APPROVAL-WORKFLOW.md](./MEMBER-SIGNUP-APPROVAL-WORKFLOW.md) - Member approval process
- [USER-MANAGEMENT-GUIDE.md](./USER-MANAGEMENT-GUIDE.md) - General user management

## Support

If you encounter any issues with the AnmcUsers group setup, please:

1. Check the backend logs for error messages
2. Verify the group exists in Cognito console
3. Ensure environment variables are correctly set
4. Contact the development team for assistance
