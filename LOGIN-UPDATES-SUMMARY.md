# Login System Updates - Support for AnmcUsers

## Overview

Updated the login system to support both **AnmcMembers** and **AnmcUsers** groups, allowing both member and regular users to authenticate and access the portal.

---

## Changes Made

### 1. ✅ MemberAuth Component - [MemberAuth/index.js](src/components/MemberAuth/index.js)

**Purpose:** Accept both AnmcMembers and AnmcUsers for authentication

#### Updated `checkAuth()` function (Lines 23-39)

**Before:**
```javascript
// Only accepted AnmcMembers
if (groups.includes('AnmcMembers')) {
    setCurrentUser(user);
} else {
    setCurrentUser(null);
}
```

**After:**
```javascript
// Now accepts both groups
if (groups.includes('AnmcMembers') || groups.includes('AnmcUsers')) {
    setCurrentUser(user);
} else {
    setCurrentUser(null);
}
```

#### Updated `login()` function (Lines 41-60)

**Before:**
```javascript
// Rejected non-members
if (!groups.includes('AnmcMembers')) {
    return {
        success: false,
        error: 'Access denied. You must be an ANMC member to access the member portal.'
    };
}
```

**After:**
```javascript
// Now accepts both groups
if (!groups.includes('AnmcMembers') && !groups.includes('AnmcUsers')) {
    return {
        success: false,
        error: 'Access denied. Only ANMC members and registered users can access the portal.'
    };
}
```

---

### 2. ✅ Login Page - [LoginPage/index.js](src/main-component/LoginPage/index.js)

**Purpose:** Generic title and clear indication that both user types can login

#### Updated Title (Line 93)

**Before:**
```javascript
<h2>{from === 'booking' ? 'Sign In to Book Services' : 'Member Sign In'}</h2>
```

**After:**
```javascript
<h2>Sign In</h2>
// Generic title for all users
```

#### Updated Description (Line 94)

**Before:**
```javascript
<p>{from === 'booking' ? 'Login or create an account to book services' : 'Sign in to access your member portal'}</p>
```

**After:**
```javascript
<p>{from === 'booking' ? 'Login or create an account to book services' : 'Sign in to access your portal'}</p>
// Changed "member portal" to "portal"
```

#### Added Footer Text (Lines 221-223)

**New:**
```javascript
<p className="noteHelp" style={{ marginTop: '10px', fontSize: '0.85em', color: '#666' }}>
    Both members and users can login here
</p>
```

---

## Login Flow Comparison

### Before (Members Only)

```
User attempts login
    ↓
Check if in AnmcMembers group
    ↓
If YES → Login success
If NO  → Error: "You must be an ANMC member to access the member portal"
```

### After (Members + Users)

```
User attempts login
    ↓
Check if in AnmcMembers OR AnmcUsers group
    ↓
If YES → Login success
If NO  → Error: "Only ANMC members and registered users can access the portal"
```

---

## User Experience Changes

### Login Page Appearance

**Previous State:**
- Title: "Member Sign In" or "Sign In to Book Services"
- Implied members-only access
- Confusing for regular users

**Current State:**
- Title: "**Sign In**" (universal)
- Description: "Sign in to access your portal"
- Footer: "Both members and users can login here"
- Clear that all registered users can login

### After Login

**AnmcMembers:**
- Redirected to Member Portal
- See title: "Member Portal"
- Access all 4 features (including Documents)

**AnmcUsers:**
- Redirected to User Portal
- See title: "User Portal"
- Access 3 features (no Documents)

---

## Error Messages

### Old Error (Members Only)
```
"Access denied. You must be an ANMC member to access the member portal."
```

### New Error (Members + Users)
```
"Access denied. Only ANMC members and registered users can access the portal."
```

**Who gets this error:**
- Users in other groups (AnmcAdmins, AnmcManagers without member/user group)
- Users not in any recognized group
- Invalid credentials

---

## Testing Checklist

### ✅ Test AnmcMembers Login
- [ ] Member can login successfully
- [ ] Redirected to Member Portal
- [ ] Sees "Member Portal" title
- [ ] Has access to all 4 features
- [ ] Can access Member Documents

### ✅ Test AnmcUsers Login
- [ ] User can login successfully
- [ ] Redirected to User Portal
- [ ] Sees "User Portal" title
- [ ] Has access to 3 features (no Documents)
- [ ] Cannot access Member Documents

### ✅ Test Login Page
- [ ] Title shows "Sign In" (not "Member Sign In")
- [ ] Description is generic (not member-specific)
- [ ] Footer shows "Both members and users can login here"
- [ ] Booking context shows two signup options
- [ ] Normal context shows member signup link

### ✅ Test Error Handling
- [ ] Invalid credentials show appropriate error
- [ ] Non-member/user group shows access denied error
- [ ] Error message mentions "members and registered users"

---

## Security Notes

1. **Group Validation:** Both groups are validated on login
2. **Session Management:** Same session handling for both user types
3. **Feature Access:** Controlled by group membership (portal level)
4. **Document Access:** Restricted to AnmcMembers only (portal level)

---

## Impact Summary

### Before
- ❌ Only AnmcMembers could login
- ❌ AnmcUsers got "Access denied" error
- ❌ Login page implied members-only
- ❌ Confusing for regular users

### After
- ✅ Both AnmcMembers and AnmcUsers can login
- ✅ Clear, generic login page
- ✅ Appropriate error messages
- ✅ Different portal experience based on group
- ✅ Document access still restricted to members

---

## Related Files

1. [src/components/MemberAuth/index.js](src/components/MemberAuth/index.js) - Auth provider
2. [src/main-component/LoginPage/index.js](src/main-component/LoginPage/index.js) - Login UI
3. [src/main-component/MemberPortal/index.js](src/main-component/MemberPortal/index.js) - Portal with dynamic access
4. [COGNITO-ANMCUSERS-GROUP-SETUP.md](COGNITO-ANMCUSERS-GROUP-SETUP.md) - Setup guide

---

## Conclusion

The login system now properly supports both member and user types with:
- Generic, inclusive login page
- Proper group validation
- Clear error messages
- Differentiated portal experiences
- Maintained security and access control

Both AnmcMembers and AnmcUsers can now successfully login and access their respective portal features.
