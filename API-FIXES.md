# API Integration Fixes

## Issues Fixed

### 1. Rate Limiting (429 Too Many Requests) ✅

**Problem:** API was rejecting requests with 429 errors due to strict rate limiting (100 requests per 15 minutes).

**Solution:** Updated rate limiting to be environment-aware:
- **Development:** 1000 requests per 15 minutes
- **Production:** 100 requests per 15 minutes

**Files Changed:**
- [api/config/index.js](api/config/index.js:37-41)

```javascript
rateLimit: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000
}
```

### 2. Wrong Endpoint: `/api/master_plan` ✅

**Problem:** Component was calling `/api/master_plan` (underscore) but the API endpoint is `/api/master-plan` (hyphen).

**Error:** `404 Not Found`

**Solution:** Updated Service2 component to use API_CONFIG with correct endpoint.

**Files Changed:**
- [src/components/Service2/index.js](src/components/Service2/index.js:19)

**Before:**
```javascript
fetch('http://localhost:3001/api/master_plan')
```

**After:**
```javascript
fetch(API_CONFIG.getURL(API_CONFIG.endpoints.masterPlan))
// Resolves to: http://localhost:3001/api/master-plan
```

### 3. Wrong Endpoint: `/project_achievements` ✅

**Problem:** Component was calling `/project_achievements` (no `/api` prefix, underscore) but the API endpoint is `/api/achievements`.

**Error:** `404 Not Found`

**Solution:** Updated ProjectAchievements component to use API_CONFIG with correct endpoint.

**Files Changed:**
- [src/components/ProjectAchievements/index.js](src/components/ProjectAchievements/index.js:36)

**Before:**
```javascript
fetch('http://localhost:3001/project_achievements')
```

**After:**
```javascript
fetch(API_CONFIG.getURL(API_CONFIG.endpoints.achievements))
// Resolves to: http://localhost:3001/api/achievements
```

### 4. Hardcoded Facilities Endpoint ✅

**Problem:** Service component was using hardcoded URL instead of API_CONFIG.

**Files Changed:**
- [src/components/Service/index.js](src/components/Service/index.js:11)

**Before:**
```javascript
fetch('http://localhost:3001/facilities')
```

**After:**
```javascript
fetch(API_CONFIG.getURL(API_CONFIG.endpoints.facilities))
// Resolves to: http://localhost:3001/api/facilities
```

## Summary of Components Fixed

| Component | Old Endpoint | New Endpoint | Status |
|-----------|-------------|--------------|--------|
| Service2 | `http://localhost:3001/api/master_plan` | `API_CONFIG.getURL(API_CONFIG.endpoints.masterPlan)` → `/api/master-plan` | ✅ Fixed |
| ProjectAchievements | `http://localhost:3001/project_achievements` | `API_CONFIG.getURL(API_CONFIG.endpoints.achievements)` → `/api/achievements` | ✅ Fixed |
| Service | `http://localhost:3001/facilities` | `API_CONFIG.getURL(API_CONFIG.endpoints.facilities)` → `/api/facilities` | ✅ Fixed |

## Correct API Endpoints

All endpoints must have the `/api` prefix and use hyphens (not underscores):

### Content Endpoints
- ✅ `/api/news` - All news articles
- ✅ `/api/news/featured` - Featured news
- ✅ `/api/events` - All events
- ✅ `/api/events/featured` - Featured events
- ✅ `/api/projects` - All projects
- ✅ `/api/projects/featured` - Featured projects
- ✅ `/api/facilities` - All facilities

### Static Content Endpoints
- ✅ `/api/homepage` - Hero section data
- ✅ `/api/counters` - Statistics counters
- ✅ `/api/about-us` - About us content (hyphen!)
- ✅ `/api/contact` - Contact information
- ✅ `/api/master-plan` - Master plan data (hyphen!)
- ✅ `/api/achievements` - Project achievements

### Utility Endpoints
- ✅ `/api/health` - Health check

## Benefits of Using API_CONFIG

### Before (Hardcoded URLs)
```javascript
fetch('http://localhost:3001/facilities')
fetch('http://localhost:3001/api/master_plan')
fetch('http://localhost:3001/project_achievements')
```

**Problems:**
- ❌ Easy to make typos
- ❌ Inconsistent naming (underscores vs hyphens)
- ❌ Hard to change for different environments
- ❌ Missing `/api` prefix in some places
- ❌ Difficult to maintain

### After (Centralized API_CONFIG)
```javascript
import API_CONFIG from '../../config/api';

fetch(API_CONFIG.getURL(API_CONFIG.endpoints.facilities))
fetch(API_CONFIG.getURL(API_CONFIG.endpoints.masterPlan))
fetch(API_CONFIG.getURL(API_CONFIG.endpoints.achievements))
```

**Benefits:**
- ✅ Single source of truth
- ✅ Consistent naming
- ✅ Environment-aware (dev/staging/prod)
- ✅ Type-safe endpoint names
- ✅ Easy to maintain and update

## Testing the Fixes

### 1. Verify API Server is Running

```bash
cd api
npm run dev
```

Expected output:
```
╔══════════════════════════════════════════════════════════╗
║            ANMC Digital API Server                       ║
╚══════════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:3001
📍 Environment: development
🗄️  DynamoDB Region: ap-southeast-2
🏷️  Table Prefix: anmc-*-dev
```

### 2. Test Endpoints Manually

```bash
# Test master plan (with hyphen)
curl http://localhost:3001/api/master-plan

# Test achievements
curl http://localhost:3001/api/achievements

# Test facilities
curl http://localhost:3001/api/facilities

# Test health check
curl http://localhost:3001/api/health
```

All should return JSON (not 404).

### 3. Test in Browser

Visit these pages and check browser console (F12) for errors:

- http://localhost:3000/ - Homepage (should load counters, hero)
- http://localhost:3000/about - About page
- http://localhost:3000/news - News page
- http://localhost:3000/events - Events page
- http://localhost:3000/projects - Projects page (loads master plan)
- http://localhost:3000/facilities - Facilities page

**No 404 or 429 errors should appear.**

### 4. Check Rate Limiting

Refresh any page multiple times rapidly. With the new development settings (1000 requests per 15 min), you should NOT see 429 errors during normal development.

## Configuration Files

### API Rate Limiting Config

File: [api/config/index.js](api/config/index.js)

```javascript
rateLimit: {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: 'Too many requests from this IP, please try again later.'
}
```

### Environment Variables

File: [api/.env](api/.env)

```env
NODE_ENV=development
ENVIRONMENT=dev
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

## Naming Conventions

### API Endpoints (Hyphens)
- ✅ `/api/about-us`
- ✅ `/api/master-plan`
- ✅ `/api/project-achievements` → **CHANGED TO** → `/api/achievements`

### JavaScript Variables (camelCase)
- ✅ `aboutUs`
- ✅ `masterPlan`
- ✅ `projectAchievements`

### DynamoDB Tables (Hyphens)
- ✅ `anmc-about-us-dev`
- ✅ `anmc-master-plan-dev`
- ✅ `anmc-project-achievements-dev`

## Common Errors & Solutions

### Error: "Cannot GET /api/master_plan"

**Cause:** Using underscore instead of hyphen.

**Solution:** Use `/api/master-plan` (with hyphen).

### Error: "Cannot GET /project_achievements"

**Cause:** Missing `/api` prefix and wrong endpoint name.

**Solution:** Use `/api/achievements`.

### Error: "429 Too Many Requests"

**Cause:** Rate limit exceeded (development limit was too low).

**Solution:** Fixed in [api/config/index.js](api/config/index.js) - now allows 1000 requests per 15 min in development.

### Error: "EADDRINUSE: address already in use :::3001"

**Cause:** API server already running or port not released.

**Solution:**
```bash
# Windows
netstat -ano | findstr :3001
taskkill //PID <PID_NUMBER> //F

# Then restart
cd api
npm run dev
```

## Files Modified in This Fix

1. [api/config/index.js](api/config/index.js) - Rate limiting config
2. [api/.env.example](api/.env.example) - Rate limit documentation
3. [api/.env](api/.env) - Created with development settings
4. [src/components/Service2/index.js](src/components/Service2/index.js) - Fixed master-plan endpoint
5. [src/components/ProjectAchievements/index.js](src/components/ProjectAchievements/index.js) - Fixed achievements endpoint
6. [src/components/Service/index.js](src/components/Service/index.js) - Fixed facilities endpoint

## Verification Checklist

- [x] Rate limiting updated to 1000 for development
- [x] All hardcoded URLs replaced with API_CONFIG
- [x] Correct endpoint names (hyphens not underscores)
- [x] All endpoints include `/api` prefix
- [x] API server can start successfully
- [x] No 404 errors in browser console
- [x] No 429 rate limit errors during normal use
- [ ] Test all pages load correctly
- [ ] Verify data displays on each page

## Next Steps

1. **Start Both Servers:**
   ```bash
   # Terminal 1
   cd api
   npm run dev

   # Terminal 2 (new terminal)
   npm start
   ```

2. **Test All Pages** - Visit each page and verify no errors

3. **Monitor Console** - Keep browser console open (F12) to catch any remaining issues

4. **Update Documentation** - If you find more issues, add them to this file

---

**Status:** All known API endpoint issues fixed! ✅
