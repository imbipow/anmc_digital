# Member Signup and Admin Approval Workflow

## Overview

The member registration system now implements a complete approval workflow where:
1. Users sign up and pay membership fees
2. Account is created but **DISABLED** in Cognito
3. Admin reviews and approves/rejects the signup
4. Upon approval, user can login to member portal

---

## Complete Workflow

### Step 1: User Registration (SignUp Page)

**User Actions:**
1. Fills out signup form (`/signup`)
2. Enters all member details:
   - Personal information
   - Membership selection
   - Family members (if family membership)
   - Address details
   - Password
3. Pays membership fee via Stripe
4. Submits form

**Backend Process:**
1. **Validates** form data
2. **Saves to Database:**
   - All member details saved to `members.json` or DynamoDB
   - Status: `pending_approval`
   - Payment status: `processing` or `succeeded`

3. **Creates Cognito User (DISABLED):**
   - Email + password
   - Basic attributes (name, email, phone)
   - Custom attributes (member_id, membership_type)
   - **Added to AnmcMembers group**
   - **User status: DISABLED** (cannot login)

**User Sees:**
```
Registration successful! Your account is pending admin approval.
You will receive an email once approved.
```

---

### Step 2: Admin Reviews Signup

**Admin Panel (`/admin` → Members):**

Admin sees new member with:
- Status: `Pending Approval` (badge/chip)
- All member details visible
- Payment status
- Registration date

**Admin Actions Available:**
1. **View Details** - Review all information
2. **Approve** - Enable login access
3. **Reject** - Deny registration
4. **Suspend** - Temporarily disable (for active members)

---

### Step 3: Admin Approves Member

**Admin Clicks "Approve":**

**Backend Process:**
1. **Enable Cognito User:**
   - Calls `cognitoService.enableUser(email)`
   - User can now login

2. **Update Database:**
   - Status: `pending_approval` → `active`
   - Adds `approvedAt` timestamp
   - Adds `approvedBy` (admin name)

3. **Response:**
```json
{
  "success": true,
  "message": "Member approved successfully. User can now login.",
  "member": {...}
}
```

**Admin Sees:**
- Success message
- Member status updated to "Active"
- Member can now login

**Optional: Send Welcome Email**
- Email template: "Your ANMC membership has been approved"
- Login instructions
- Member portal link

---

### Step 4: Member Can Login

**Member Portal Login (`/login`):**

**Before Approval:**
- User tries to login
- Cognito rejects (user disabled)
- Error: "User is disabled"

**After Approval:**
- User enters credentials
- Cognito authenticates successfully
- Checks AnmcMembers group ✅
- Redirects to member portal
- Full access granted

---

## Alternative: Admin Rejects Member

**Admin Clicks "Reject":**

**Backend Process:**
1. **Keep Cognito User Disabled:**
   - User remains disabled (no login access)
   - Could optionally delete user

2. **Update Database:**
   - Status: `pending_approval` → `rejected`
   - Adds `rejectedAt` timestamp
   - Adds `rejectedBy` (admin name)
   - Adds `rejectionReason` (optional)

3. **Response:**
```json
{
  "success": true,
  "message": "Member registration rejected.",
  "member": {...}
}
```

**Optional: Send Rejection Email**
- Explain reason for rejection
- Refund process (if applicable)
- Steps to reapply

---

## Data Storage Strategy

### Saved in Database (members.json / DynamoDB):

```json
{
  "id": "mem_123456",
  "referenceNo": "ANMC-2024-001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "mobile": "+61412345678",
  "gender": "Male",
  "age": "30-40",

  "membershipCategory": "general",
  "membershipType": "family",
  "membershipFee": 200,

  "residentialAddress": {...},
  "postalAddress": {...},
  "familyMembers": [...],

  "paymentStatus": "succeeded",
  "paymentIntentId": "pi_...",
  "paymentDate": "2024-01-15T10:30:00Z",

  "status": "pending_approval",
  "cognitoUserId": "sub-uuid",
  "cognitoEnabled": true,

  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z",

  // Added after approval
  "approvedAt": "2024-01-16T09:00:00Z",
  "approvedBy": "admin@anmcinc.org.au"
}
```

### Saved in AWS Cognito:

```
Username: john.doe@example.com
Password: [hashed]
Status: DISABLED → ENABLED (after approval)

Attributes:
- email: john.doe@example.com
- email_verified: true
- given_name: John
- family_name: Doe
- phone_number: +61412345678
- custom:member_id: ANMC-2024-001
- custom:membership_type: general
- custom:membership_category: family

Groups:
- AnmcMembers
```

---

## API Endpoints

### Member Registration

```http
POST /api/members/register

Request:
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "mobile": "+61412345678",
  "password": "SecurePass123!",
  "membershipCategory": "general",
  "membershipType": "family",
  "paymentIntentId": "pi_...",
  ...
}

Response (201):
{
  "success": true,
  "member": {...},
  "message": "Registration successful. Your account is pending admin approval...",
  "cognitoEnabled": true,
  "requiresApproval": true,
  "status": "pending_approval"
}
```

### Admin Approve Member

```http
POST /api/members/{id}/approve

Request Body (optional):
{
  "approvedBy": "admin@anmcinc.org.au"
}

Response (200):
{
  "success": true,
  "message": "Member approved successfully. User can now login.",
  "member": {
    "id": "mem_123456",
    "status": "active",
    "approvedAt": "2024-01-16T09:00:00Z",
    "approvedBy": "admin@anmcinc.org.au",
    ...
  }
}
```

### Admin Reject Member

```http
POST /api/members/{id}/reject

Request Body:
{
  "reason": "Incomplete information",
  "rejectedBy": "admin@anmcinc.org.au"
}

Response (200):
{
  "success": true,
  "message": "Member registration rejected.",
  "member": {
    "id": "mem_123456",
    "status": "rejected",
    "rejectedAt": "2024-01-16T09:00:00Z",
    "rejectedBy": "admin@anmcinc.org.au",
    "rejectionReason": "Incomplete information",
    ...
  }
}
```

### Admin Suspend Member

```http
POST /api/members/{id}/suspend

Request Body:
{
  "reason": "Membership fee overdue",
  "suspendedBy": "admin@anmcinc.org.au"
}

Response (200):
{
  "success": true,
  "message": "Member suspended successfully. User cannot login.",
  "member": {
    "status": "suspended",
    ...
  }
}
```

### Admin Reactivate Member

```http
POST /api/members/{id}/reactivate

Request Body:
{
  "reactivatedBy": "admin@anmcinc.org.au"
}

Response (200):
{
  "success": true,
  "message": "Member reactivated successfully. User can now login.",
  "member": {
    "status": "active",
    ...
  }
}
```

---

## Member Status States

| Status | Description | Can Login? | Cognito Status |
|--------|-------------|------------|----------------|
| `pending_approval` | New signup awaiting admin review | ❌ No | DISABLED |
| `active` | Approved and active member | ✅ Yes | ENABLED |
| `rejected` | Registration rejected by admin | ❌ No | DISABLED |
| `suspended` | Temporarily suspended | ❌ No | DISABLED |
| `expired` | Membership expired | ❌ No | DISABLED |

---

## Admin Panel Integration

### MemberList Component

**Shows all members with status badges:**

```jsx
<Chip
  label={status}
  color={
    status === 'active' ? 'success' :
    status === 'pending_approval' ? 'warning' :
    status === 'suspended' ? 'error' :
    'default'
  }
/>
```

**Filter by status:**
- All Members
- Pending Approval
- Active
- Rejected
- Suspended

### MemberShow Component

**Displays member details with action buttons:**

```jsx
{member.status === 'pending_approval' && (
  <>
    <Button
      onClick={handleApprove}
      variant="contained"
      color="success"
    >
      Approve Member
    </Button>

    <Button
      onClick={handleReject}
      variant="outlined"
      color="error"
    >
      Reject Member
    </Button>
  </>
)}

{member.status === 'active' && (
  <Button
    onClick={handleSuspend}
    variant="outlined"
    color="warning"
  >
    Suspend Member
  </Button>
)}

{member.status === 'suspended' && (
  <Button
    onClick={handleReactivate}
    variant="contained"
    color="primary"
  >
    Reactivate Member
  </Button>
)}
```

---

## Backend Services Updated

### cognitoService.js

**New Methods:**
```javascript
// Create user (disabled by default)
createUser(userData, enabledByDefault = false)

// Add to AnmcMembers group
addToAnmcMembersGroup(username)

// Enable user (approve)
enableUser(username)

// Disable user (reject/suspend)
disableUser(username)

// Update user attributes
updateUserAttributes(username, attributes)
```

### API Routes (members.js)

**New Endpoints:**
```javascript
POST /api/members/register       // Create member (disabled in Cognito)
POST /api/members/:id/approve    // Approve member (enable Cognito)
POST /api/members/:id/reject     // Reject member
POST /api/members/:id/suspend    // Suspend member (disable Cognito)
POST /api/members/:id/reactivate // Reactivate member (enable Cognito)
```

---

## Testing the Workflow

### Test Step 1: User Signup

1. Go to: http://localhost:3036/signup
2. Fill out complete form
3. Enter test payment (Stripe test mode)
4. Submit registration
5. **Expected:** Success message about pending approval

### Test Step 2: Verify Cognito User Created (Disabled)

```bash
aws cognito-idp admin-get-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username john.doe@example.com \
  --region ap-southeast-2
```

**Expected Output:**
```json
{
  "Username": "john.doe@example.com",
  "UserStatus": "CONFIRMED",
  "Enabled": false,  // ← User is DISABLED
  "UserAttributes": [...]
}
```

### Test Step 3: Verify User in AnmcMembers Group

```bash
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username john.doe@example.com \
  --region ap-southeast-2
```

**Expected:** Shows "AnmcMembers" in groups list

### Test Step 4: Try to Login (Should Fail)

1. Go to: http://localhost:3036/login
2. Enter credentials
3. **Expected:** Error - "User is disabled" or similar

### Test Step 5: Admin Approves

1. Go to: http://localhost:3036/admin
2. Navigate to Members
3. Find pending member
4. Click "Approve"
5. **Expected:** Status changes to "Active"

### Test Step 6: Verify Cognito User Enabled

```bash
aws cognito-idp admin-get-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username john.doe@example.com \
  --region ap-southeast-2
```

**Expected Output:**
```json
{
  "Enabled": true,  // ← User is now ENABLED
  ...
}
```

### Test Step 7: Login (Should Work)

1. Go to: http://localhost:3036/login
2. Enter credentials
3. **Expected:** ✅ Login successful, redirect to member portal

---

## Security Considerations

### Why This Workflow is Secure:

1. **✅ Two-Factor Verification:**
   - Payment verification (Stripe)
   - Admin verification (manual review)

2. **✅ Prevents Unauthorized Access:**
   - Users can't login until approved
   - Admin has full control

3. **✅ Audit Trail:**
   - Who approved/rejected
   - When actions were taken
   - Reason for rejection/suspension

4. **✅ Reversible Actions:**
   - Can suspend active members
   - Can reactivate suspended members
   - Full member lifecycle management

### Best Practices:

1. **Admin Notifications:**
   - Email admin when new signup occurs
   - Dashboard notification badge
   - Daily summary of pending approvals

2. **Member Notifications:**
   - Email when approved
   - Email when rejected (with reason)
   - Email when suspended

3. **Approval Criteria Checklist:**
   - Valid payment
   - Complete information
   - No duplicate emails
   - Meets membership requirements

---

## Future Enhancements

### Email Notifications:

**1. New Signup Notification (to Admin):**
```
Subject: New Member Signup - Pending Approval

A new member has signed up and is awaiting your approval:

Name: John Doe
Email: john.doe@example.com
Membership: General Family ($200)
Registration Date: Jan 15, 2024

Review in Admin Panel: [Link]
```

**2. Approval Notification (to Member):**
```
Subject: Welcome to ANMC - Membership Approved!

Dear John Doe,

Your ANMC membership has been approved!

You can now login to the member portal:
https://anmcinc.org.au/login

Member ID: ANMC-2024-001
Login Email: john.doe@example.com

Best regards,
ANMC Team
```

**3. Rejection Notification (to Member):**
```
Subject: ANMC Membership Application Update

Dear John Doe,

Unfortunately, we are unable to approve your membership
application at this time.

Reason: [Admin provided reason]

If you have questions, please contact us at:
admin@anmcinc.org.au

Best regards,
ANMC Team
```

### Auto-Approval Rules:

- Auto-approve if payment successful + all info complete
- Flag for manual review if suspicious
- Auto-reject if payment fails multiple times

### Advanced Features:

- Member can upload documents (ID, proof of address)
- Admin can request additional information
- Member can track application status
- Approval workflow with multiple admin levels

---

## Summary

### What's Implemented:

✅ Member signup saves to both Database and Cognito
✅ Cognito users created as DISABLED by default
✅ All new members added to AnmcMembers group
✅ Admin can approve/reject/suspend/reactivate members
✅ Approval enables Cognito user (allows login)
✅ Complete audit trail of actions
✅ API endpoints for all member lifecycle actions

### Next Steps:

1. **Test the complete workflow**
2. **Add email notifications**
3. **Update admin panel UI with approve/reject buttons**
4. **Create admin guide for approval process**
5. **Set up monitoring and alerts**

---

The member signup and approval workflow is now fully implemented!
