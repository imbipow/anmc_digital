# ANMC Digital - System Architecture

## Overview

The ANMC Digital application is a full-stack React application with a RESTful API backend connected to AWS DynamoDB.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           User Browser                               │
│                      http://localhost:3000                           │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                      React Application                               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Page Components (main-component/)               │  │
│  │  HomePage │ AboutPage │ BlogPage │ EventPage │ Projects...  │  │
│  └────────────────┬─────────────────────────────────────────────┘  │
│                   │                                                  │
│  ┌────────────────▼─────────────────────────────────────────────┐  │
│  │                  Service Layer (src/services/)               │  │
│  │                                                               │  │
│  │  ┌──────────────────┐  ┌──────────────────┐                │  │
│  │  │ contentService   │  │ homepageService  │                │  │
│  │  │ - getNews()      │  │ - getHomepage()  │                │  │
│  │  │ - getEvents()    │  │                  │                │  │
│  │  │ - getProjects()  │  └──────────────────┘                │  │
│  │  │ - getFacilities()│                                       │  │
│  │  │ - getContact()   │  ┌──────────────────┐                │  │
│  │  └──────────────────┘  │ aboutUsService   │                │  │
│  │                        │ - getAboutUs()   │                │  │
│  │                        └──────────────────┘                │  │
│  └────────────────┬───────────────────────────────────────────┘  │
│                   │                                                  │
│  ┌────────────────▼─────────────────────────────────────────────┐  │
│  │              API Config (src/config/api.js)                  │  │
│  │  - baseURL: process.env.REACT_APP_API_URL                   │  │
│  │  - endpoints: { news, events, projects, ... }               │  │
│  │  - getURL(): constructs full API URLs                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ fetch('http://localhost:3001/api/...')
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    Express API Server (api/)                         │
│                    http://localhost:3001                             │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Middleware Stack                          │  │
│  │  helmet() → cors() → rateLimit() → morgan() → compression() │  │
│  └────────────────┬─────────────────────────────────────────────┘  │
│                   │                                                  │
│  ┌────────────────▼─────────────────────────────────────────────┐  │
│  │                  Routes (api/routes/)                        │  │
│  │                                                               │  │
│  │  /api/news      →  news.js        →  newsService            │  │
│  │  /api/events    →  events.js      →  eventsService          │  │
│  │  /api/projects  →  projects.js    →  projectsService        │  │
│  │  /api/facilities→  facilities.js  →  facilitiesService      │  │
│  │  /api/homepage  →  homepage.js    →  homepageService        │  │
│  │  /api/counters  →  counters.js    →  countersService        │  │
│  │  /api/about-us  →  aboutUs.js     →  aboutUsService         │  │
│  │  /api/contact   →  contact.js     →  contactService         │  │
│  │  ... and more                                                │  │
│  └────────────────┬─────────────────────────────────────────────┘  │
│                   │                                                  │
│  ┌────────────────▼─────────────────────────────────────────────┐  │
│  │              Services (api/services/)                        │  │
│  │                                                               │  │
│  │  ┌──────────────────────────────────────────────────────┐   │  │
│  │  │           Base DynamoDB Service                      │   │  │
│  │  │  - getItem()    - createItem()                       │   │  │
│  │  │  - getAllItems()- updateItem()                       │   │  │
│  │  │  - queryByIndex() - deleteItem()                     │   │  │
│  │  └────────────┬─────────────────────────────────────────┘   │  │
│  │               │                                               │  │
│  │  ┌────────────▼──────────────────────────────────────────┐  │  │
│  │  │  Specialized Services (extend base service)          │  │  │
│  │  │  newsService     │ eventsService   │ projectsService │  │  │
│  │  │  - getBySlug()   │ - getByStatus() │ - getByCategory()│  │  │
│  │  │  - getFeatured() │ - getFeatured() │ - getFeatured() │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────┬─────────────────────────────────────────────┘  │
│                   │                                                  │
│  ┌────────────────▼─────────────────────────────────────────────┐  │
│  │            Validation Middleware (Joi)                       │  │
│  │  - Validates request payloads                                │  │
│  │  - Schema enforcement                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ AWS SDK - DynamoDB DocumentClient
                             │
┌────────────────────────────▼────────────────────────────────────────┐
│                    AWS DynamoDB (ap-southeast-2)                     │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │                         10 Tables                             │ │
│  │                                                                │ │
│  │  anmc-news-dev          (3 GSIs: Slug, Category, Featured)   │ │
│  │  anmc-events-dev        (3 GSIs: Slug, Status, Category)     │ │
│  │  anmc-projects-dev      (4 GSIs: Slug, Status, Category, F.) │ │
│  │  anmc-facilities-dev                                          │ │
│  │  anmc-homepage-dev      (1 GSI: Component)                    │ │
│  │  anmc-counters-dev                                            │ │
│  │  anmc-about-us-dev                                            │ │
│  │  anmc-contact-dev                                             │ │
│  │  anmc-master-plan-dev                                         │ │
│  │  anmc-achievements-dev  (1 GSI: Category)                     │ │
│  │                                                                │ │
│  │  Total: 13 Global Secondary Indexes                           │ │
│  │  Billing: Pay-per-request                                     │ │
│  └───────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

## Request Flow Example

### Example: User visits News Page

```
1. User navigates to http://localhost:3000/news
   │
2. BlogPage component loads
   │
3. useEffect() calls contentService.getNews()
   │
4. contentService.getNews() constructs URL using API_CONFIG
   │  URL: http://localhost:3001/api/news
   │
5. fetch() sends GET request to API server
   │
6. Express middleware chain processes request:
   │  - helmet: adds security headers
   │  - cors: validates origin
   │  - rateLimit: checks rate limits (100/15min)
   │  - morgan: logs request
   │
7. Router matches '/api/news' → routes/news.js
   │
8. Route handler calls newsService.getAll()
   │
9. newsService extends DynamoDBService
   │  calls base.getAllItems('anmc-news-dev')
   │
10. AWS SDK DynamoDB.DocumentClient.scan()
    │  scans anmc-news-dev table
    │
11. DynamoDB returns items
    │
12. Service formats response
    │
13. Express sends JSON response
    │
14. contentService receives data
    │
15. BlogPage component updates state
    │
16. React renders news articles
    │
17. User sees news list on page
```

## Data Flow Patterns

### Featured Content (Optimized)

**Before (Client-side filtering):**
```
API: GET /api/news (returns ALL news)
  ↓
Client: Filter items where featured === true
```

**After (Server-side filtering with GSI):**
```
API: GET /api/news/featured (queries FeaturedIndex GSI)
  ↓
Client: Receives only featured items
```

**Benefits:**
- Faster query (GSI optimized)
- Less data transferred
- Lower DynamoDB costs

### Slug-based Queries (SEO URLs)

```
URL: /news/community-event-2024
  ↓
API: GET /api/news/slug/community-event-2024
  ↓
DynamoDB: Query SlugIndex GSI
  ↓
Returns single item efficiently
```

## Security Layers

```
┌──────────────────────────────────────┐
│ 1. Rate Limiting                     │
│    100 requests per 15 minutes       │
└──────────────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ 2. CORS Protection                   │
│    Allow: http://localhost:3000      │
└──────────────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ 3. Helmet.js Security Headers        │
│    XSS, Clickjacking, MIME protection│
└──────────────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ 4. Request Body Size Limit           │
│    Max: 10MB                         │
└──────────────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ 5. Input Validation (Joi)            │
│    Schema-based validation           │
└──────────────────────────────────────┘
         ↓
┌──────────────────────────────────────┐
│ 6. Error Handling Middleware         │
│    Sanitize error messages           │
└──────────────────────────────────────┘
```

## Environment Configuration

### Development
```
React App: http://localhost:3000
API Server: http://localhost:3001
DynamoDB: ap-southeast-2 (dev tables)
```

### Production (Future)
```
React App: https://anmcdigital.org (S3 + CloudFront)
API Server: https://api.anmcdigital.org (Lambda + API Gateway)
DynamoDB: ap-southeast-2 (prod tables)
```

## Technology Stack

### Frontend
- **React 18** - UI library
- **React Router 6** - Client-side routing
- **Fetch API** - HTTP requests

### Backend
- **Express.js 4** - Web framework
- **AWS SDK 2** - DynamoDB integration
- **Joi** - Validation
- **Helmet** - Security headers
- **CORS** - Cross-origin handling
- **Morgan** - Request logging
- **Compression** - Response compression

### Database
- **AWS DynamoDB** - NoSQL database
- **Global Secondary Indexes** - Query optimization
- **Pay-per-request billing** - Cost optimization

### Infrastructure
- **CloudFormation** - Infrastructure as code
- **AWS Region** - ap-southeast-2 (Sydney)

## Performance Optimizations

### 1. Database Level
- ✅ GSIs for efficient queries
- ✅ Pay-per-request billing (no over-provisioning)
- ✅ Appropriate partition keys

### 2. API Level
- ✅ Compression middleware (gzip)
- ✅ Efficient DynamoDB queries (scan only when needed)
- ✅ Response caching headers (future)

### 3. Frontend Level
- ✅ Service layer caching (homepage)
- ✅ Error boundaries for graceful failures
- ✅ Lazy loading (future)

## Scalability

### Current Capacity
- **API Server:** Single Node.js instance
- **DynamoDB:** Auto-scales with pay-per-request
- **Concurrent Users:** 100s (rate limited)

### Scale to 1000s of Users
1. Deploy API to AWS Lambda (serverless)
2. Add CloudFront CDN for React app
3. Implement Redis caching
4. Add read replicas for DynamoDB

### Scale to 10,000s of Users
1. Multi-region deployment
2. DynamoDB Global Tables
3. ElastiCache for sessions
4. Application Load Balancer

## Monitoring Points

```
┌─────────────────┐
│ Client Browser  │ → Performance.timing API
└─────────────────┘

┌─────────────────┐
│ API Server      │ → Morgan logs, CloudWatch Logs
└─────────────────┘

┌─────────────────┐
│ DynamoDB        │ → CloudWatch Metrics, X-Ray
└─────────────────┘
```

## Error Handling Strategy

### Client-Side
```javascript
try {
  const data = await service.getData();
  // Use data
} catch (error) {
  console.error('Error:', error);
  // Show fallback/default data
  return defaultData;
}
```

### API-Side
```javascript
try {
  const items = await dynamoDBService.getAll();
  res.json(items);
} catch (error) {
  console.error('DynamoDB error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development'
      ? error.message
      : 'An error occurred'
  });
}
```

## File Organization

```
anmcDigital/
├── api/                    # Backend API
│   ├── server.js          # Entry point
│   ├── config/            # Configuration
│   ├── routes/            # Route handlers (10 files)
│   ├── services/          # Business logic (11 files)
│   ├── middleware/        # Custom middleware (3 files)
│   └── package.json       # API dependencies
│
├── src/                   # Frontend React
│   ├── services/          # Data fetching (3 files)
│   ├── config/            # API config (1 file)
│   ├── components/        # Reusable components
│   └── main-component/    # Page components
│
├── aws-infrastructure/    # DynamoDB setup
│   ├── dynamodb-tables-updated.yml  # CloudFormation
│   └── seed-data-updated.js         # Data seeding
│
└── Documentation/
    ├── QUICK-START.md           # Quick setup guide
    ├── MIGRATION-SUMMARY.md     # Migration details
    ├── API-INTEGRATION.md       # Integration guide
    └── ARCHITECTURE.md          # This file
```

## Design Patterns Used

1. **Service Layer Pattern** - Separation of concerns
2. **Repository Pattern** - DynamoDB abstraction
3. **Middleware Pattern** - Request processing pipeline
4. **Factory Pattern** - Service initialization
5. **Singleton Pattern** - Service instances

## Next Architecture Improvements

1. **Authentication Layer**
   - JWT tokens
   - User roles (admin, member, public)

2. **Caching Layer**
   - Redis for session data
   - API response caching

3. **Message Queue**
   - SQS for async operations
   - Email notifications

4. **CDN Integration**
   - CloudFront for static assets
   - Edge caching

5. **Microservices (if needed)**
   - Separate auth service
   - Separate booking service
   - Separate payment service

---

**Current Status:** ✅ Production-ready monolithic architecture with scalable database
