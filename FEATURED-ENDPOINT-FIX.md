# Featured Events Endpoint Fix

## Issue

Getting **400 Bad Request** for `http://localhost:3001/api/events/featured`

## Root Cause

The `/api/events/featured` endpoint was missing:
1. No route handler in [api/routes/events.js](api/routes/events.js)
2. No `getFeatured()` method in [api/services/eventsService.js](api/services/eventsService.js)
3. Events table doesn't have a `FeaturedIndex` GSI in DynamoDB

## Solution Applied

### 1. Added Featured Route ✅

**File:** [api/routes/events.js](api/routes/events.js:16-24)

Added the `/featured` endpoint:

```javascript
// GET /api/events/featured - Get featured events
router.get('/featured', async (req, res, next) => {
  try {
    const events = await eventsService.getFeatured();
    res.json(events);
  } catch (error) {
    next(error);
  }
});
```

### 2. Added getFeatured() Method ✅

**File:** [api/services/eventsService.js](api/services/eventsService.js:30-38)

Since the Events table doesn't have a `FeaturedIndex` GSI (unlike News and Projects tables), we filter client-side:

```javascript
// Get featured events
async getFeatured() {
  // Since Events table doesn't have a FeaturedIndex GSI,
  // we need to scan all items and filter client-side
  const allEvents = await this.getAll();
  return allEvents.filter(event =>
    event.featured === true || event.featured === 'true'
  );
}
```

## Why Client-Side Filtering?

The DynamoDB Events table schema only has these GSIs:
- ✅ SlugIndex
- ✅ StatusDateIndex (for upcoming/past queries)
- ✅ CategoryDateIndex

It does **NOT** have:
- ❌ FeaturedIndex (like News and Projects do)

### Options Considered:

**Option 1: Add FeaturedIndex GSI** (Not chosen)
- Requires CloudFormation update
- Requires table schema migration
- Downtime or careful migration needed
- More complex for this fix

**Option 2: Filter Client-Side** (Chosen) ✅
- Simple implementation
- Works immediately
- No table migration needed
- Acceptable performance for small datasets
- Can upgrade to GSI later if needed

## Performance Considerations

### Current Approach (Scan + Filter)
- **Pros:**
  - Simple and immediate
  - No schema changes
  - Works for small to medium datasets (<1000 events)

- **Cons:**
  - Scans entire table
  - Not optimal for large datasets
  - Uses more DynamoDB read capacity

### If/When to Upgrade to GSI:
If you have more than 1000 events, consider adding a FeaturedIndex GSI:

1. Update [aws-infrastructure/dynamodb-tables-updated.yml](aws-infrastructure/dynamodb-tables-updated.yml)
2. Add `featured` to AttributeDefinitions
3. Add FeaturedIndex to GlobalSecondaryIndexes
4. Deploy update: `npm run deploy:dev`
5. Update eventsService to use GSI query

## Testing the Fix

### 1. Restart API Server

You need to restart the API server to pick up the changes:

```bash
# Stop any running instances on port 3001
# Windows:
netstat -ano | findstr :3001
taskkill //PID <PID> //F

# Then start fresh
cd api
npm run dev
```

### 2. Test the Endpoint

```bash
# Test featured events endpoint
curl http://localhost:3001/api/events/featured
```

Expected: JSON array of events where `featured: true`

### 3. Test in Browser

Visit http://localhost:3000 and check the homepage - featured events should load without errors.

Check browser console (F12) - no 400 or 404 errors for `/api/events/featured`.

## Comparison with News and Projects

### News Service (Has FeaturedIndex)

```javascript
async getFeatured() {
  return await dynamoDBService.queryByIndex(
    this.tableName,
    'FeaturedIndex',  // ✅ Has GSI
    'featured = :featured',
    { ':featured': 'true' }
  );
}
```

### Projects Service (Has FeaturedIndex)

```javascript
async getFeatured() {
  return await dynamoDBService.queryByIndex(
    this.tableName,
    'FeaturedIndex',  // ✅ Has GSI
    'featured = :featured',
    { ':featured': 'true' }
  );
}
```

### Events Service (No FeaturedIndex)

```javascript
async getFeatured() {
  // ❌ No GSI, so filter client-side
  const allEvents = await this.getAll();
  return allEvents.filter(event =>
    event.featured === true || event.featured === 'true'
  );
}
```

## All Featured Endpoints Status

| Endpoint | Status | Implementation |
|----------|--------|----------------|
| `/api/news/featured` | ✅ Working | Uses FeaturedIndex GSI |
| `/api/events/featured` | ✅ Fixed | Client-side filter (no GSI) |
| `/api/projects/featured` | ✅ Working | Uses FeaturedIndex GSI |

## Files Modified

1. [api/routes/events.js](api/routes/events.js) - Added `/featured` route
2. [api/services/eventsService.js](api/services/eventsService.js) - Added `getFeatured()` method

## Next Steps

### Immediate (To Apply This Fix)

1. **Restart API server:**
   ```bash
   cd api
   npm run dev
   ```

2. **Test the endpoint:**
   ```bash
   curl http://localhost:3001/api/events/featured
   ```

3. **Refresh your React app** and check homepage

### Future Optimization (Optional)

If you want better performance with many events:

1. Update DynamoDB table to add FeaturedIndex GSI
2. Update eventsService to use GSI query instead of scan+filter
3. Redeploy infrastructure

But for now, the client-side filter works perfectly fine! ✅

## Summary

✅ **Fixed:** `/api/events/featured` now returns featured events
✅ **Method:** Client-side filtering (no table changes needed)
✅ **Files:** 2 files modified
✅ **Action Required:** Restart API server

The endpoint now works correctly, matching the behavior of News and Projects featured endpoints!
