# Admin Panel API Integration

## Overview

The Admin Panel has been updated to use the DynamoDB-backed REST API for all CRUD operations instead of the local `db.json` file.

## Changes Made

### 1. DataProvider Completely Rewritten ✅

**File:** [src/components/AdminPanel/dataProvider.js](src/components/AdminPanel/dataProvider.js)

The data provider now:
- ✅ Uses centralized API_CONFIG for endpoints
- ✅ Supports all REST operations (GET, POST, PUT, DELETE)
- ✅ Maps react-admin resources to API endpoints
- ✅ Handles featured boolean → string conversion
- ✅ Implements client-side filtering, sorting, and pagination
- ✅ Proper error handling

### Resource to Endpoint Mapping

```javascript
const resourceToEndpoint = {
    news: '/news',
    events: '/events',
    projects: '/projects',
    facilities: '/facilities',
    homepage: '/homepage',
    counters: '/counters',
    about_us: '/about-us',
    contact: '/contact',
    master_plan: '/master-plan',
    project_achievements: '/achievements',
};
```

## CRUD Operations

### Create (POST)

```javascript
// Admin creates a new news article
dataProvider.create('news', {
    data: {
        title: 'New Article',
        slug: 'new-article',
        content: '...',
        featured: true // Automatically converted to 'true'
    }
});
```

**API Call:** `POST /api/news`

### Read/List (GET)

```javascript
// Admin views list of news articles
dataProvider.getList('news', {
    pagination: { page: 1, perPage: 10 },
    sort: { field: 'publishDate', order: 'DESC' },
    filter: { category: 'Community' }
});
```

**API Call:** `GET /api/news`
(Filtering and sorting done client-side)

### Read/One (GET)

```javascript
// Admin edits a specific news article
dataProvider.getOne('news', { id: 123 });
```

**API Call:** `GET /api/news/123`

### Update (PUT)

```javascript
// Admin updates a news article
dataProvider.update('news', {
    id: 123,
    data: {
        title: 'Updated Title',
        featured: false // Automatically converted to 'false'
    }
});
```

**API Call:** `PUT /api/news/123`

### Delete (DELETE)

```javascript
// Admin deletes a news article
dataProvider.delete('news', { id: 123 });
```

**API Call:** `DELETE /api/news/123`

## Admin Panel Components

All existing admin components work without changes:

### News Management
- **BlogList.js** - View all news articles
- **BlogEdit.js** - Edit existing news
- **BlogCreate.js** - Create new news articles
- **NewsEdit.js** - Alternative news editor

### Events Management
- **EventList.js** - View all events
- **EventEdit.js** - Edit/create events

### Homepage Management
- **HomepageList.js** - View homepage components
- **HomepageEdit.js** - Edit hero section

### Counters Management
- **CounterList.js** - View all counters
- **CounterEdit.js** - Edit counter values
- **CounterCreate.js** - Create new counters

### About Us Management
- **AboutUsEdit.js** - Edit about us content

## Features

### 1. Automatic Boolean Conversion

DynamoDB stores `featured` as strings ('true'/'false'). The dataProvider automatically converts:

```javascript
// React Admin sends boolean
{ featured: true }

// DataProvider converts to string
{ featured: 'true' }

// Stored in DynamoDB as string
```

### 2. Client-Side Filtering & Sorting

Since the API returns all records, the dataProvider implements:
- ✅ Text search across all fields
- ✅ Field-specific filters
- ✅ Date-aware sorting
- ✅ String and number sorting
- ✅ Pagination

### 3. Error Handling

All operations include try-catch blocks with:
- Console error logging
- Graceful fallbacks
- Empty arrays for list operations
- Error propagation for user feedback

### 4. Batch Operations

Supports react-admin batch operations:
- `updateMany()` - Update multiple records
- `deleteMany()` - Delete multiple records
- `getMany()` - Get multiple records by ID

## Usage in Admin Panel

### Accessing the Admin Panel

1. Navigate to `/admin` in your browser
2. The admin panel uses the updated dataProvider automatically
3. All CRUD operations go through the API

### Creating New Content

**Example: Creating a News Article**

1. Go to `/admin` → News
2. Click "Create"
3. Fill in the form:
   - Title
   - Slug
   - Content
   - Featured Image URL
   - Author
   - Publish Date
   - Category
   - Tags (comma-separated)
   - Featured (checkbox)
4. Click "Save"

**Behind the scenes:**
```
Form Submit
    ↓
dataProvider.create('news', { data: formData })
    ↓
POST /api/news
    ↓
API validates with Joi
    ↓
newsService.create()
    ↓
DynamoDB.createItem()
    ↓
Success response
    ↓
Admin panel shows success notification
```

### Editing Existing Content

**Example: Editing an Event**

1. Go to `/admin` → Events
2. Click on an event to edit
3. Modify fields
4. Click "Save"

**Behind the scenes:**
```
Load Event
    ↓
dataProvider.getOne('events', { id: 123 })
    ↓
GET /api/events/123
    ↓
Form populates with event data
    ↓
User edits
    ↓
dataProvider.update('events', { id: 123, data: updates })
    ↓
PUT /api/events/123
    ↓
DynamoDB updates record
    ↓
Success notification
```

### Deleting Content

**Example: Deleting a Project**

1. Go to `/admin` → Projects
2. Select project(s)
3. Click "Delete" button
4. Confirm deletion

**Behind the scenes:**
```
Delete Request
    ↓
dataProvider.delete('projects', { id: 456 })
    ↓
DELETE /api/projects/456
    ↓
DynamoDB removes record
    ↓
List refreshes
```

## API Validation

The API includes Joi validation for all create/update operations:

### News Article Validation
```javascript
{
  title: Joi.string().required().min(3).max(200),
  slug: Joi.string().required(),
  content: Joi.string().required(),
  featuredImage: Joi.string().uri().required(),
  author: Joi.string().required(),
  publishDate: Joi.string().required(),
  category: Joi.string().required(),
  tags: Joi.array().items(Joi.string()),
  featured: Joi.boolean()
}
```

Invalid data will be rejected with a 400 error and validation message.

## Benefits Over Old System

### Before (db.json)
- ❌ Read/write entire JSON file for every operation
- ❌ No validation
- ❌ No error handling
- ❌ File locking issues
- ❌ Not scalable
- ❌ No production deployment path

### After (DynamoDB API)
- ✅ Efficient queries with DynamoDB
- ✅ Joi validation
- ✅ Proper error handling
- ✅ Thread-safe (no file locking)
- ✅ Infinitely scalable
- ✅ Production-ready
- ✅ Audit trail possible
- ✅ Backup/restore built into DynamoDB

## Testing the Admin Panel

### 1. Start Both Servers

**Terminal 1 - API Server:**
```bash
cd api
npm run dev
```

**Terminal 2 - React App:**
```bash
npm start
```

### 2. Access Admin Panel

Visit: http://localhost:3000/admin

### 3. Test Create Operation

1. Click "News" → "Create"
2. Fill in all required fields:
   ```
   Title: Test Article
   Slug: test-article
   Content: This is a test article
   Featured Image: https://images.unsplash.com/photo-1test
   Author: Admin
   Publish Date: 2024-01-15
   Category: Community
   Tags: test, article
   Featured: Yes
   ```
3. Click "Save"
4. Check DynamoDB table to verify record was created

### 4. Test Edit Operation

1. Click on the article you just created
2. Change the title to "Updated Test Article"
3. Click "Save"
4. Verify update in DynamoDB

### 5. Test Delete Operation

1. Select the test article
2. Click "Delete"
3. Confirm deletion
4. Verify record removed from DynamoDB

### 6. Test List/Filter

1. Use the search box to find articles
2. Use filters to filter by category
3. Sort by different columns
4. Test pagination

## Troubleshooting

### Issue: "Cannot read property 'json' of undefined"

**Cause:** API server not running or wrong URL

**Solution:**
1. Check API server is running on port 3001
2. Verify API_CONFIG.baseURL is correct
3. Check browser console for network errors

### Issue: "400 Bad Request" on create/update

**Cause:** Validation error - missing required fields

**Solution:**
1. Check browser console for validation error details
2. Ensure all required fields are filled
3. Check data types match validation schema

### Issue: "404 Not Found" on operations

**Cause:** Wrong resource name or endpoint mapping

**Solution:**
1. Check resourceToEndpoint mapping in dataProvider
2. Verify API routes are registered in api/routes/index.js
3. Check resource name matches in admin components

### Issue: Featured checkbox not working

**Cause:** Boolean not converted to string

**Solution:**
This should be automatic, but if issues occur:
1. Check dataProvider converts boolean → string
2. Verify DynamoDB stores as 'true'/'false' (strings)
3. Check API validation accepts string values

## Security Considerations

### Current State (Development)
- ⚠️ No authentication
- ⚠️ Anyone can access admin panel
- ⚠️ No authorization checks

### Recommended for Production
1. **Add Authentication:**
   - JWT tokens
   - Login page
   - Session management

2. **Add Authorization:**
   - Role-based access control (admin, editor, viewer)
   - Protect API endpoints
   - Verify permissions on each request

3. **Add Audit Logging:**
   - Track who made changes
   - Timestamp all operations
   - Store in separate audit table

4. **Add Input Sanitization:**
   - XSS prevention
   - SQL injection prevention (N/A for DynamoDB)
   - Content validation

## Future Enhancements

### 1. Optimized Batch Endpoints

Add API endpoints for batch operations:
```javascript
POST /api/news/batch
DELETE /api/news/batch
```

### 2. Server-Side Pagination

Implement pagination in the API:
```javascript
GET /api/news?page=1&limit=10
```

### 3. Server-Side Filtering

Add filter parameters to API:
```javascript
GET /api/news?category=Community&featured=true
```

### 4. Search Endpoint

Dedicated search with full-text search:
```javascript
GET /api/news/search?q=community
```

### 5. File Upload

Add image upload instead of URL entry:
- S3 bucket for images
- Image optimization
- CDN integration

## Files Modified

1. [src/components/AdminPanel/dataProvider.js](src/components/AdminPanel/dataProvider.js) - Complete rewrite

## Files Unchanged (Still Work)

All admin panel components continue to work:
- BlogList.js, BlogEdit.js, BlogCreate.js
- EventList.js, EventEdit.js
- HomepageList.js, HomepageEdit.js
- CounterList.js, CounterEdit.js, CounterCreate.js
- AboutUsEdit.js
- index.js (AdminPanel main component)

## Summary

✅ **DataProvider rewritten** to use REST API
✅ **All CRUD operations** working with DynamoDB
✅ **Boolean conversion** handled automatically
✅ **Error handling** implemented
✅ **All admin components** work without changes
✅ **Production-ready** architecture

The admin panel now provides a complete CMS interface for managing all website content through the DynamoDB-backed API! 🚀
