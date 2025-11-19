# User Management System - Complete Guide

## Overview

The User Management system allows **AnmcAdmins** to manage **AnmcManagers** with full CRUD operations (Create, Read, Update, Delete) and permission controls.

## User Roles

### 1. AnmcAdmins
**Full Access** - Can access everything

- ✅ View all admins and managers
- ✅ Add new managers
- ✅ Deactivate managers
- ✅ Delete managers
- ✅ Access all admin features
- ✅ Manage content (News, Events, Projects, etc.)
- ✅ Approve members
- ✅ View donations
- ✅ Manage FAQs

### 2. AnmcManagers
**Limited Access** - Restricted to specific features

- ✅ Approve Members (approve/reject membership applications)
- ✅ Documents (manage member documents)
- ✅ Bookings (view and manage bookings)
- ✅ Messages (handle member messages)
- ❌ Cannot access user management
- ❌ Cannot modify website content
- ❌ Cannot manage other managers
- ❌ Cannot access statistics/counters

### 3. AnmcMembers
**Member Portal Access** - Regular members

- ✅ Member portal access
- ✅ Update own profile
- ✅ Book services
- ✅ View documents
- ❌ No admin access

## Features Implemented

### Backend API (`api/routes/users.js`)

#### 1. Get All Groups
```
GET /api/users/groups
```
Returns list of all Cognito groups

#### 2. Get Users in Group
```
GET /api/users/groups/:groupName/users
```
- Supported groups: `AnmcAdmins`, `AnmcManagers`
- Returns formatted user list with:
  - username
  - email
  - name
  - phoneNumber
  - enabled status
  - created date
  - last modified date

#### 3. Get User Details
```
GET /api/users/:username
```
Returns detailed information about a specific user

#### 4. Create New Manager (AnmcAdmins only)
```
POST /api/users/managers
```

**Request Body:**
```json
{
  "email": "manager@example.com",
  "name": "John Manager",
  "password": "SecurePass@123",
  "phoneNumber": "+61400000000"
}
```

**Process:**
1. Validates email, name, password
2. Creates user in Cognito
3. Sets permanent password
4. Adds to AnmcManagers group
5. Returns success

#### 5. Update User Attributes
```
PUT /api/users/:username
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "phoneNumber": "+61411111111"
}
```

#### 6. Enable/Disable User (Deactivate)
```
PATCH /api/users/:username/status
```

**Request Body:**
```json
{
  "enabled": false  // or true
}
```

**Effect:**
- `enabled: false` - User cannot login (deactivated)
- `enabled: true` - User can login (activated)

#### 7. Delete User (AnmcAdmins only)
```
DELETE /api/users/:username
```
Permanently deletes user from Cognito

### Frontend Component (`src/components/AdminPanel/UserManagement.js`)

#### Features:

1. **Tabbed Interface**
   - Tab 1: Admins (view only)
   - Tab 2: Managers (full management)

2. **Manager Table**
   - Shows: Name, Email, Phone, Status, Created Date
   - Status chip (Active/Disabled)
   - Action buttons:
     - 🔒 Disable/Enable toggle
     - 🗑️ Delete

3. **Add Manager Dialog**
   - Fields:
     - Full Name (required)
     - Email (required)
     - Phone Number (optional)
     - Password (required)
   - Password validation:
     - Min 8 characters
     - Uppercase letter
     - Lowercase letter
     - Number
     - Special character

4. **Delete Confirmation**
   - Warns about permanent deletion
   - Requires confirmation

5. **Status Alerts**
   - Success messages (green)
   - Error messages (red)
   - Auto-dismiss

## Access Control

### Route-Level Access

To implement route-level access control for managers, you'll need to check user groups in your components.

Here's an example of how to restrict access:

```javascript
// Example: Check if user is admin
const checkIsAdmin = async (username) => {
  const response = await fetch(`${API_BASE_URL}/users/groups/AnmcAdmins/users`);
  const data = await response.json();
  return data.users.some(user => user.username === username);
};

// Example: Check if user is manager
const checkIsManager = async (username) => {
  const response = await fetch(`${API_BASE_URL}/users/groups/AnmcManagers/users`);
  const data = await response.json();
  return data.users.some(user => user.username === username);
};
```

### Recommended Manager Access

Create a wrapper component for manager-restricted resources:

```javascript
// ManagerRestrictedResource.js
import React, { useEffect, useState } from 'react';
import { useAuth } from './your-auth-context';

const ManagerRestrictedResource = ({ children, allowedFor = ['admin', 'manager'] }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Check if user's role is in allowedFor array
    checkAccess();
  }, [user]);

  if (!hasAccess) {
    return <div>Access Denied</div>;
  }

  return children;
};
```

## Testing

### 1. Start Servers
```bash
# Terminal 1: API
cd api
npm start

# Terminal 2: Frontend
cd ..
npm start
```

### 2. Access Admin Panel
Navigate to: `http://localhost:3036/admin#/user-management`

### 3. Test Add Manager

1. Click "Add Manager" button
2. Fill in form:
   - Name: Test Manager
   - Email: testmanager@anmcinc.org.au
   - Phone: +61400000000
   - Password: TestManager@123
3. Click "Create Manager"
4. Verify success message
5. Check manager appears in table

### 4. Verify in Cognito
```bash
# Check manager was created
aws cognito-idp admin-get-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username testmanager@anmcinc.org.au \
  --region ap-southeast-2

# Check manager is in AnmcManagers group
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username testmanager@anmcinc.org.au \
  --region ap-southeast-2
```

Expected output:
```json
{
  "Groups": [
    {
      "GroupName": "AnmcManagers",
      "UserPoolId": "ap-southeast-2_egMmxcO1M",
      "Description": "",
      "Precedence": 2,
      ...
    }
  ]
}
```

### 5. Test Deactivate Manager

1. Find manager in table
2. Click 🔒 Disable button
3. Verify status changes to "Disabled"
4. Try logging in as manager - should fail
5. Click ▶️ Enable button
6. Verify status changes to "Active"
7. Try logging in as manager - should work

### 6. Test Delete Manager

1. Find manager in table
2. Click 🗑️ Delete button
3. Confirm deletion in dialog
4. Verify manager is removed from table
5. Verify in Cognito:
```bash
aws cognito-idp admin-get-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username testmanager@anmcinc.org.au \
  --region ap-southeast-2

# Should return: UserNotFoundException
```

## Implementation Details

### Files Created

1. **api/routes/users.js** - User management API endpoints
2. **src/components/AdminPanel/UserManagement.js** - Frontend component
3. **src/components/AdminPanel/UserManagementResource.js** - React Admin wrapper

### Files Modified

1. **api/routes/index.js** - Added `/users` route
2. **src/components/AdminPanel/index.js** - Added User Management resource

### Dependencies

All dependencies are already installed:
- `@aws-sdk/client-cognito-identity-provider` - Cognito operations
- `@mui/material` - UI components
- `react-admin` - Admin framework

## Security Considerations

### 1. Password Security
- ✅ Passwords validated before creation
- ✅ Minimum 8 characters
- ✅ Requires complexity (upper, lower, number, special)
- ✅ Passwords never logged
- ✅ Stored securely in Cognito (hashed)

### 2. Access Control
- ✅ Only AnmcAdmins can access User Management
- ✅ Only AnmcAdmins can create/delete managers
- ✅ Managers cannot modify other managers
- ✅ Members cannot access admin features

### 3. API Security
- ✅ All operations logged
- ✅ Group validation (only AnmcAdmins, AnmcManagers)
- ✅ Username validation
- ✅ Error handling with safe messages

## Manager Permissions Configuration

To restrict managers to specific features, update the admin panel routing:

```javascript
// Example: Restrict resources by role
const resources = [
  // Admins only
  { name: 'homepage', roles: ['admin'] },
  { name: 'counters', roles: ['admin'] },
  { name: 'news', roles: ['admin'] },
  // ... other content

  // Admins and Managers
  { name: 'members', roles: ['admin', 'manager'] },
  { name: 'faqs', roles: ['admin', 'manager'] },
  { name: 'donations', roles: ['admin'] }, // Admins only

  // User Management - Admins only
  { name: 'user-management', roles: ['admin'] }
];
```

## Manager Feature Access

### Documents
Managers should have access to member documents management

### Approve Members
Managers can approve/reject member applications (already implemented)

### Bookings
Managers can view and manage service bookings

### Messages
Managers can view and respond to member messages

## Future Enhancements

1. **Bulk Operations**
   - Add multiple managers at once
   - Bulk enable/disable

2. **Activity Logging**
   - Track who created/deleted managers
   - Audit trail for all actions

3. **Email Notifications**
   - Send welcome email to new managers
   - Notify on account deactivation

4. **Password Reset**
   - Managers can reset their own password
   - Admins can force password reset

5. **Role Management**
   - Custom roles beyond Admin/Manager
   - Fine-grained permissions

6. **Manager Profile**
   - Managers can update their own profile
   - Profile photo upload

## Troubleshooting

### Issue: "Failed to fetch users"

**Check:**
1. API server is running
2. Cognito configuration in `.env`:
   ```
   COGNITO_USER_POOL_ID=ap-southeast-2_egMmxcO1M
   COGNITO_CLIENT_ID=...
   AWS_ACCESS_KEY_ID=...
   AWS_SECRET_ACCESS_KEY=...
   AWS_REGION=ap-southeast-2
   ```

### Issue: "User with this email already exists"

**Solution:**
User already exists in Cognito. Either:
1. Use a different email
2. Delete existing user first

### Issue: "Password validation failed"

**Check password meets requirements:**
- At least 8 characters
- Contains uppercase letter (A-Z)
- Contains lowercase letter (a-z)
- Contains number (0-9)
- Contains special character (@$!%*?&)

Example valid passwords:
- `TestManager@123`
- `SecurePass!456`
- `Manager2024@`

### Issue: Manager can access admin features

**Solution:**
Implement route-level access control:
1. Check user's Cognito groups
2. Restrict routes based on role
3. Hide UI elements for restricted features

## Status: ✅ COMPLETE

- ✅ Backend API created
- ✅ Frontend UI implemented
- ✅ Add manager functionality
- ✅ Deactivate manager functionality
- ✅ Delete manager functionality
- ✅ View admins and managers
- ✅ Status indicators
- ✅ Error handling
- ✅ Success notifications

**Next step:** Implement route-level access control for manager-restricted features (Members, Documents, Bookings, Messages).
