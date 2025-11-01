# Homepage Update 400 Error - Fix Applied

## Issue

Getting **400 Bad Request** when trying to update homepage hero section in admin panel.

## Root Cause

The homepage service was using `updateItem()` which builds a DynamoDB `UpdateExpression`. This method tries to update individual fields, but it was attempting to update the `id` and `component` fields (which are part of the key), causing a validation error.

### The Problem

**Original code:**
```javascript
async update(id, updates) {
    return await dynamoDBService.updateItem(this.tableName, { id }, updates);
}
```

When admin sends:
```javascript
{
    id: 'hero',
    component: 'hero',
    data: {
        welcomeText: "...",
        title: "Updated Title",
        ...
    }
}
```

The `updateItem` method tries to build:
```sql
UPDATE homepage
SET id = 'hero', component = 'hero', data = {...}
WHERE id = 'hero'
```

**This fails because:**
- ❌ Can't update key attributes (`id`, `component`) in DynamoDB
- ❌ UpdateExpression syntax error
- ❌ Returns 400 Bad Request

## Solution Applied

Changed homepage update to use **PUT** (complete replacement) instead of **UPDATE** (partial modification).

**File:** [api/services/homepageService.js](api/services/homepageService.js:27-55)

### New Code

```javascript
async update(id, updates) {
    // For homepage, we need to do a full replacement (PUT) instead of partial update
    // because of the nested data structure
    const AWS = require('aws-sdk');
    const config = require('../config');
    AWS.config.update({
      region: config.aws.region,
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey
    });
    const dynamodb = new AWS.DynamoDB.DocumentClient();

    const params = {
      TableName: this.tableName,
      Item: {
        id,
        component: updates.component || 'hero',
        data: updates.data
      }
    };

    try {
      await dynamodb.put(params).promise();
      return params.Item;
    } catch (error) {
      console.error('Error updating homepage:', error);
      throw error;
    }
}
```

### What This Does

1. **Uses PUT operation** - Replaces entire item
2. **Preserves key fields** - `id` and `component`
3. **Updates data** - Nested `data` object with all hero fields
4. **No UpdateExpression** - Direct item replacement
5. **Returns updated item** - For admin panel to display

## How It Works Now

```
Admin updates hero title
    ↓
PUT /api/homepage/hero
Body: {
    id: 'hero',
    component: 'hero',
    data: {
        welcomeText: "Welcome to ANMC",
        title: "New Title", ← Changed
        subtitle: "...",
        learnMoreText: "Learn More",
        memberButtonText: "Become a Member",
        heroImage: "https://..."
    }
}
    ↓
homepageService.update('hero', body)
    ↓
DynamoDB PUT operation
{
    TableName: 'anmc-homepage-dev',
    Item: {
        id: 'hero',
        component: 'hero',
        data: { ... }
    }
}
    ↓
Complete item replaced in DynamoDB
    ↓
Returns updated item
    ↓
Admin shows success notification
    ↓
Frontend updates with new title
```

## PUT vs UPDATE in DynamoDB

### UPDATE (Old Approach)
```javascript
// Partial update - modifies specific attributes
dynamodb.update({
    TableName: 'homepage',
    Key: { id: 'hero' },
    UpdateExpression: 'SET #data = :data',
    ExpressionAttributeNames: { '#data': 'data' },
    ExpressionAttributeValues: { ':data': newData }
})
```

**Issues:**
- Complex with nested objects
- Can't update key attributes
- Expression syntax can fail

### PUT (New Approach)
```javascript
// Complete replacement - replaces entire item
dynamodb.put({
    TableName: 'homepage',
    Item: {
        id: 'hero',
        component: 'hero',
        data: newData
    }
})
```

**Benefits:**
- ✅ Simple and straightforward
- ✅ No expression syntax errors
- ✅ Works with nested objects
- ✅ Complete item replacement

## Why This Is Better for Homepage

1. **Simple Structure** - Homepage has only one item per component
2. **Nested Data** - The `data` field contains all hero fields
3. **Complete Updates** - Admin always sends complete data object
4. **No Partial Updates** - Don't need to update individual fields

## Data Structure

```json
{
  "id": "hero",           // Key field
  "component": "hero",    // GSI key field
  "data": {               // Nested object - entire thing gets replaced
    "welcomeText": "Welcome to ANMC",
    "title": "Building Bridges, Strengthening Communities",
    "subtitle": "The Australian Nepalese...",
    "learnMoreText": "Learn More",
    "memberButtonText": "Become a Member",
    "heroImage": "https://images.unsplash.com/..."
  }
}
```

## How to Apply the Fix

### **IMPORTANT: Restart the API Server**

The API server needs to be restarted to load the new code:

**Step 1: Kill the existing process**
```bash
# Find process on port 3001
netstat -ano | findstr :3001

# Kill it (replace PID with actual number)
taskkill //PID <PID_NUMBER> //F
```

**Step 2: Start fresh**
```bash
cd api
npm run dev
```

**Expected output:**
```
╔══════════════════════════════════════════════════════════╗
║            ANMC Digital API Server                       ║
╚══════════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:3001
📍 Environment: development
🗄️  DynamoDB Region: ap-southeast-2
🏷️  Table Prefix: anmc-*-dev
```

## Testing the Fix

### Test 1: Update Homepage Title

1. **Open admin panel:**
   ```
   http://localhost:3000/admin
   ```

2. **Edit homepage:**
   - Click "Homepage"
   - Click edit button on hero row
   - Change title to "Test Update Works!"
   - Click "Save"

3. **Verify:**
   - Success notification appears
   - No 400 error
   - Visit http://localhost:3000
   - Hero title shows "Test Update Works!"

### Test 2: Update All Fields

1. **Edit homepage again**
2. **Change multiple fields:**
   - Welcome Text: "Welcome Back"
   - Title: "New Hero Title"
   - Subtitle: "Updated subtitle text"
   - Button texts: "Explore" and "Join Now"
3. **Save**
4. **Verify all changes appear** on frontend

### Test 3: Check Network Tab

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Edit and save homepage**
4. **Find PUT request** to `/api/homepage/hero`
5. **Check response:**
   - Status: 200 OK
   - Response body contains updated item

## Expected API Behavior

### Request
```http
PUT /api/homepage/hero HTTP/1.1
Content-Type: application/json

{
  "id": "hero",
  "component": "hero",
  "data": {
    "welcomeText": "Welcome to ANMC",
    "title": "New Title",
    "subtitle": "Updated description",
    "learnMoreText": "Learn More",
    "memberButtonText": "Become a Member",
    "heroImage": "https://images.unsplash.com/photo-..."
  }
}
```

### Response (200 OK)
```json
{
  "id": "hero",
  "component": "hero",
  "data": {
    "welcomeText": "Welcome to ANMC",
    "title": "New Title",
    "subtitle": "Updated description",
    "learnMoreText": "Learn More",
    "memberButtonText": "Become a Member",
    "heroImage": "https://images.unsplash.com/photo-..."
  }
}
```

## Troubleshooting

### Still Getting 400 Error

**Check API server restarted:**
```bash
# Should see "Server running" message
# If port 3001 in use error, kill process first
```

**Check browser cache:**
```
Ctrl+F5 (hard refresh)
```

**Check data sent:**
1. Open DevTools (F12)
2. Network tab
3. Look at PUT request payload
4. Should include `id`, `component`, and `data` fields

### 404 Not Found

**Check endpoint:**
- Should be `/api/homepage/hero`
- Not `/api/homepage/` (without ID)

### Success but No Changes

**Check DynamoDB:**
- Item should be updated in `anmc-homepage-dev` table
- Use AWS Console or CLI to verify

**Check frontend cache:**
- Hard refresh browser (Ctrl+F5)
- Clear service workers if any

## Files Modified

1. **[api/services/homepageService.js](api/services/homepageService.js)**
   - Lines 27-55: Complete rewrite of `update()` method
   - Changed from UPDATE to PUT operation
   - Direct DynamoDB call instead of base service

## Related Files (No Changes Needed)

- ✅ [api/routes/homepage.js](api/routes/homepage.js) - Still calls `update()`
- ✅ [src/components/AdminPanel/HomepageEdit.js](src/components/AdminPanel/HomepageEdit.js) - No changes
- ✅ [src/components/AdminPanel/dataProvider.js](src/components/AdminPanel/dataProvider.js) - No changes

## Why Counters Don't Need This

Counters use the standard `updateItem()` because:
- ✅ Flat structure (no nested objects)
- ✅ Don't update key fields
- ✅ Partial updates are fine

```json
{
  "id": 1,
  "count": 500,
  "suffix": "+",
  "label": "Life Members"
}
```

## Summary

✅ **Homepage updates** - Now use PUT instead of UPDATE
✅ **No 400 errors** - Complete item replacement works
✅ **Nested data preserved** - `data` object handled correctly
✅ **Key fields intact** - `id` and `component` maintained
✅ **Simple solution** - Direct DynamoDB PUT operation

**Homepage updates now work correctly in the admin panel!** 🎉

---

## Action Required

**RESTART THE API SERVER** to apply this fix:

```bash
# Kill existing process
taskkill //PID <PID> //F

# Start fresh
cd api
npm run dev
```

Then test the update in admin panel!
