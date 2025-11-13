# Setting Up AnmcMembers Group in AWS Cognito

## Overview

The member portal login now requires users to be in the **AnmcMembers** Cognito group. This ensures only authorized ANMC members can access the member portal.

---

## What Changed

### Login Authentication Now Checks:
1. ✅ Valid email and password
2. ✅ User exists in Cognito
3. ✅ **NEW:** User must be in "AnmcMembers" group

### Error Message if Not in Group:
```
Access denied. You must be an ANMC member to access the member portal.
```

---

## Step 1: Create AnmcMembers Group in Cognito

### Via AWS Console:

**1. Go to AWS Cognito Console:**
- https://console.aws.amazon.com/cognito
- Region: **ap-southeast-2 (Sydney)**

**2. Select Your User Pool:**
- Click: `anmc-member-pool` (or your user pool name)
- User Pool ID: `ap-southeast-2_egMmxcO1M`

**3. Go to Groups:**
- Left sidebar → Click **"Groups"**
- Click **"Create group"** button

**4. Create AnmcMembers Group:**
- **Group name:** `AnmcMembers` (exact name, case-sensitive!)
- **Description:** `ANMC verified members with portal access`
- **Precedence:** `1` (lower number = higher priority)
- **IAM role:** (leave blank for now)
- Click **"Create group"**

**5. Verify Group Created:**
- Should see "AnmcMembers" in groups list
- Status: Active

---

## Step 2: Add Users to AnmcMembers Group

### Method A: Via AWS Console (Easiest)

**1. Go to Users Tab:**
- In your user pool → Click **"Users"** tab
- Find your user (e.g., `member@anmc.org.au`)

**2. Click on User:**
- Opens user details page

**3. Go to Groups Section:**
- Scroll down to **"Group memberships"** section
- Click **"Add user to group"**

**4. Select Group:**
- Select: **AnmcMembers**
- Click **"Add to group"**

**5. Verify:**
- User should now show "AnmcMembers" in their groups
- Status: Member of 1 group

### Method B: Via AWS CLI

**Add Single User:**
```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmc.org.au \
  --group-name AnmcMembers \
  --region ap-southeast-2
```

**Verify User is in Group:**
```bash
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmc.org.au \
  --region ap-southeast-2
```

**Expected Output:**
```json
{
    "Groups": [
        {
            "GroupName": "AnmcMembers",
            "UserPoolId": "ap-southeast-2_egMmxcO1M",
            "Description": "ANMC verified members with portal access",
            "Precedence": 1,
            "CreationDate": "2024-01-15T10:30:00.000Z",
            "LastModifiedDate": "2024-01-15T10:30:00.000Z"
        }
    ]
}
```

---

## Step 3: Update Member Registration to Auto-Add to Group

When new members register, they should automatically be added to the AnmcMembers group.

### Update Backend Registration API:

The backend already has `cognitoService.js` that creates users. We need to add them to the group after creation.

**Location:** `api/services/cognitoService.js`

**Add this function:**
```javascript
async addUserToGroup(username, groupName = 'AnmcMembers') {
    if (!this.isConfigured()) {
        console.log('Cognito not configured, skipping group assignment');
        return;
    }

    const params = {
        UserPoolId: this.userPoolId,
        Username: username,
        GroupName: groupName
    };

    try {
        await this.cognito.adminAddUserToGroup(params).promise();
        console.log(`User ${username} added to group ${groupName}`);
        return true;
    } catch (error) {
        console.error('Error adding user to group:', error);
        throw error;
    }
}
```

**Update the createUser method to call this:**
```javascript
// After user creation
await this.addUserToGroup(email, 'AnmcMembers');
```

---

## Step 4: Test Login with Group Check

### Test Case 1: User IN AnmcMembers Group (Should Work)

**1. Add user to group** (via console or CLI above)

**2. Try to login:**
- Go to: http://localhost:3036/login
- Email: `member@anmc.org.au`
- Password: Your password
- Click "Login"

**Expected Result:**
- ✅ Login successful
- ✅ Redirected to `/member-portal`
- ✅ No error messages

### Test Case 2: User NOT in AnmcMembers Group (Should Fail)

**1. Remove user from group:**

**Via Console:**
- Cognito → Users → Select user
- Group memberships → Remove from "AnmcMembers"

**Via CLI:**
```bash
aws cognito-idp admin-remove-user-from-group \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmc.org.au \
  --group-name AnmcMembers \
  --region ap-southeast-2
```

**2. Try to login:**
- Go to: http://localhost:3036/login
- Enter credentials
- Click "Login"

**Expected Result:**
- ❌ Login fails
- ❌ Error message: "Access denied. You must be an ANMC member to access the member portal."
- ❌ Stays on login page

**3. Add user back to group** for testing

---

## Step 5: Verify Group Data is Available

### Check in Browser Console:

**1. Login successfully**

**2. Open browser console (F12)**

**3. Check localStorage:**
```javascript
// View stored auth data
JSON.parse(localStorage.getItem('memberAuth'))
```

**Should see:**
```javascript
{
  email: "member@anmc.org.au",
  attributes: {
    email: "member@anmc.org.au",
    given_name: "Test",
    family_name: "Member",
    ...
  },
  groups: ["AnmcMembers"],  // ← Groups array!
  ...
}
```

---

## Additional Groups (Optional)

You can create additional groups for different member types:

### Group Structure:

**1. AnmcMembers (Required - Base Access)**
- All members must be in this group
- Precedence: 1
- Purpose: Basic member portal access

**2. LifeMembers (Optional - Premium Features)**
- Life members get additional benefits
- Precedence: 2
- Purpose: Access to life member exclusive features

**3. BoardMembers (Optional - Admin Access)**
- Board members and admins
- Precedence: 0 (highest priority)
- Purpose: Administrative functions

### Create Multiple Groups:

```bash
# Create LifeMembers group
aws cognito-idp create-group \
  --group-name LifeMembers \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --description "ANMC Life Members" \
  --precedence 2 \
  --region ap-southeast-2

# Create BoardMembers group
aws cognito-idp create-group \
  --group-name BoardMembers \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --description "ANMC Board Members and Admins" \
  --precedence 0 \
  --region ap-southeast-2
```

### Add User to Multiple Groups:

```bash
# User can be in multiple groups
aws cognito-idp admin-add-user-to-group \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmc.org.au \
  --group-name AnmcMembers \
  --region ap-southeast-2

aws cognito-idp admin-add-user-to-group \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmc.org.au \
  --group-name LifeMembers \
  --region ap-southeast-2
```

---

## Troubleshooting

### Issue 1: "Access denied" error even though user is in group

**Possible Causes:**
1. Group name mismatch (case-sensitive!)
2. Old token cached
3. User added to group after getting token

**Fix:**
1. Verify group name is exactly: `AnmcMembers`
2. Logout and login again (gets fresh token)
3. Clear browser localStorage and login again
4. Verify user is in group:
   ```bash
   aws cognito-idp admin-list-groups-for-user \
     --user-pool-id ap-southeast-2_egMmxcO1M \
     --username member@anmc.org.au \
     --region ap-southeast-2
   ```

### Issue 2: Group not showing in token

**Cause:** Token was issued before user was added to group

**Fix:**
1. Logout completely
2. Login again
3. New token will include groups

### Issue 3: Cannot create group

**Error:** `An error occurred (GroupExistsException)`

**Cause:** Group already exists

**Fix:** Use existing group or choose different name

### Issue 4: New members not auto-added to group

**Cause:** Registration API not updated

**Fix:**
1. Update `cognitoService.js` with `addUserToGroup` method
2. Call it after creating user
3. Or manually add users to group after registration

---

## Quick Commands Reference

### Create Group:
```bash
aws cognito-idp create-group \
  --group-name AnmcMembers \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --description "ANMC verified members with portal access" \
  --precedence 1 \
  --region ap-southeast-2
```

### Add User to Group:
```bash
aws cognito-idp admin-add-user-to-group \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmc.org.au \
  --group-name AnmcMembers \
  --region ap-southeast-2
```

### Remove User from Group:
```bash
aws cognito-idp admin-remove-user-from-group \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmc.org.au \
  --group-name AnmcMembers \
  --region ap-southeast-2
```

### List User's Groups:
```bash
aws cognito-idp admin-list-groups-for-user \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --username member@anmc.org.au \
  --region ap-southeast-2
```

### List All Groups:
```bash
aws cognito-idp list-groups \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --region ap-southeast-2
```

### List Users in Group:
```bash
aws cognito-idp list-users-in-group \
  --user-pool-id ap-southeast-2_egMmxcO1M \
  --group-name AnmcMembers \
  --region ap-southeast-2
```

---

## Implementation Summary

### What Was Changed:

**1. Authentication Service (`src/services/cognitoAuth.js`):**
- ✅ Extracts `cognito:groups` from ID token
- ✅ Checks if user is in "AnmcMembers" group
- ✅ Rejects login if not in group
- ✅ Includes groups in user object

**2. Login Flow:**
- ✅ User enters credentials
- ✅ Cognito authenticates
- ✅ System checks for "AnmcMembers" group
- ✅ If not in group → Access denied
- ✅ If in group → Login successful

**3. Session Management:**
- ✅ Groups stored in session
- ✅ Groups available in `currentUser.groups`
- ✅ Can check group membership in components

---

## Next Steps

### Immediate (Required):
1. ✅ Create "AnmcMembers" group in Cognito
2. ✅ Add existing test users to group
3. ✅ Test login flow
4. ✅ Verify error message for non-members

### Short-term (This Week):
1. Update member registration API to auto-add to group
2. Test new member registration flow
3. Verify groups work in production

### Long-term (Optional):
1. Create additional groups (LifeMembers, BoardMembers)
2. Implement role-based features
3. Add admin panel for group management

---

## Testing Checklist

**Before Testing:**
- [ ] AnmcMembers group created in Cognito
- [ ] Test user exists in Cognito
- [ ] Test user added to AnmcMembers group
- [ ] Frontend/backend servers running

**Test Scenarios:**
- [ ] Login with user IN AnmcMembers group → Success
- [ ] Login with user NOT in AnmcMembers group → Access denied
- [ ] Logout and login → Groups persist
- [ ] Check browser console → Groups visible in user object
- [ ] New user registration → Auto-added to group (after implementation)

---

## Support

**If you need help:**
- Create group: See "Step 1" above
- Add user to group: See "Step 2" above
- Test login: See "Step 4" above
- Troubleshooting: See "Troubleshooting" section

**All commands use:**
- User Pool ID: `ap-southeast-2_egMmxcO1M`
- Region: `ap-southeast-2`
- Group Name: `AnmcMembers` (case-sensitive!)
