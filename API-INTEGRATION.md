# API Integration Guide

This document describes how the ANMC Digital React application integrates with the DynamoDB-backed REST API.

## Overview

The application has been updated to fetch all content from a centralized REST API instead of local JSON files. The API connects to AWS DynamoDB tables in the Sydney (ap-southeast-2) region.

## Architecture

```
React App (Frontend)
    ↓
Service Layer (src/services/)
    ↓
API Config (src/config/api.js)
    ↓
REST API (api/server.js)
    ↓
DynamoDB Tables (AWS ap-southeast-2)
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory (copy from `.env.example`):

```env
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
```

**Important:** The variable must be prefixed with `REACT_APP_` to be accessible in React.

### API Config File

The centralized API configuration is in [src/config/api.js](src/config/api.js):

```javascript
const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  endpoints: {
    news: '/news',
    events: '/events',
    // ... more endpoints
  }
};
```

## Service Layer

All API calls are made through service classes in `src/services/`:

### 1. Homepage Service ([src/services/homepageService.js](src/services/homepageService.js))

Fetches homepage hero content and counter statistics:

```javascript
import homepageService from './services/homepageService';

const data = await homepageService.getHomepage();
// Returns: { hero: {...}, counters: [...] }
```

**API Endpoints Used:**
- `GET /api/homepage` - Hero section data
- `GET /api/counters` - Statistics counters

### 2. About Us Service ([src/services/aboutUsService.js](src/services/aboutUsService.js))

Fetches about us page content:

```javascript
import aboutUsService from './services/aboutUsService';

const data = await aboutUsService.getAboutUs();
// Returns: { mission: {...}, vision: {...}, executiveCommittee: {...} }
```

**API Endpoints Used:**
- `GET /api/about-us` - About us content

### 3. Content Service ([src/services/contentService.js](src/services/contentService.js))

Centralized service for news, events, projects, facilities, and contact info:

```javascript
import contentService from './services/contentService';

// News
const allNews = await contentService.getNews();
const featuredNews = await contentService.getNews(true);

// Events
const allEvents = await contentService.getEvents();
const featuredEvents = await contentService.getEvents(true);

// Projects
const allProjects = await contentService.getProjects();
const featuredProjects = await contentService.getProjects(true);

// Facilities
const facilities = await contentService.getFacilities();

// Contact
const contactInfo = await contentService.getContact();
```

**API Endpoints Used:**
- `GET /api/news` - All news articles
- `GET /api/news/featured` - Featured news
- `GET /api/events` - All events
- `GET /api/events/featured` - Featured events
- `GET /api/projects` - All projects
- `GET /api/projects/featured` - Featured projects
- `GET /api/facilities` - All facilities
- `GET /api/contact` - Contact information

## Page Integration

### Homepage ([src/main-component/HomePage/index.js](src/main-component/HomePage/index.js))

Displays:
- Hero section from `homepageService.getHomepage()`
- Counters from `homepageService.getHomepage()`
- Featured news/events/projects from `contentService.getFeaturedContent()`

### About Page ([src/main-component/AboutPage/index.js](src/main-component/AboutPage/index.js))

Displays:
- Mission, vision, history from `aboutUsService.getAboutUs()`
- Executive committee members from `aboutUsService.getAboutUs()`

### News/Blog Pages

- **BlogPage** - Lists all news from `contentService.getNews()`
- **BlogDetails** - Single news article by slug/id

### Events Page ([src/main-component/EventPage/index.js](src/main-component/EventPage/index.js))

Displays:
- All events from `contentService.getEvents()`
- Filter by status (upcoming, past) via API

### Projects Page

Displays:
- All projects from `contentService.getProjects()`
- Filter by status and category via API

### Facilities Page

Displays:
- All bookable facilities from `contentService.getFacilities()`

### Contact Page ([src/main-component/ContactPage/index.js](src/main-component/ContactPage/index.js))

Displays:
- Contact information from `contentService.getContact()`

## Running Locally

### 1. Start the API Server

```bash
cd api
npm install
npm run dev
```

The API will start on `http://localhost:3001`

### 2. Start the React App

```bash
# In the root directory
npm install
npm start
```

The React app will start on `http://localhost:3000`

## API Features

### Featured Content

The API has dedicated endpoints for featured content:
- `/api/news/featured` - News marked as featured
- `/api/events/featured` - Events marked as featured
- `/api/projects/featured` - Projects marked as featured

### Filtering

The API supports filtering:
- `/api/news/category/:category` - News by category
- `/api/events/status/:status` - Events by status (upcoming, past)
- `/api/projects/status/:status` - Projects by status
- `/api/achievements/category/:category` - Achievements by category

### Slug-based Queries

For SEO-friendly URLs:
- `/api/news/slug/:slug` - News article by slug
- `/api/events/slug/:slug` - Event by slug
- `/api/projects/slug/:slug` - Project by slug

## Error Handling

All services include error handling with fallback to default data:

```javascript
try {
  const response = await fetch(API_CONFIG.getURL(endpoint));
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Error fetching data:', error);
  return []; // or default data
}
```

## Data Structure

### Homepage Hero

```json
{
  "welcomeText": "Welcome to ANMC",
  "title": "Building Bridges, Strengthening Communities",
  "subtitle": "Description...",
  "learnMoreText": "Learn More",
  "memberButtonText": "Become a Member"
}
```

### Counters

```json
[
  {
    "id": "counter-1",
    "count": 500,
    "suffix": "+",
    "label": "Life Members"
  }
]
```

### News Article

```json
{
  "id": "news-1",
  "title": "Article Title",
  "slug": "article-title",
  "content": "Article content...",
  "excerpt": "Brief summary...",
  "featuredImage": "https://...",
  "author": "Author Name",
  "publishDate": "2024-01-15",
  "category": "Community",
  "tags": ["tag1", "tag2"],
  "featured": "true"
}
```

### Event

```json
{
  "id": "event-1",
  "title": "Event Name",
  "slug": "event-name",
  "description": "Event description...",
  "startDate": "2024-03-01T10:00:00Z",
  "endDate": "2024-03-01T16:00:00Z",
  "location": "ANMC Centre",
  "featuredImage": "https://...",
  "category": "Cultural",
  "status": "upcoming",
  "featured": "true"
}
```

## Migration from JSON Server

### Before (json-server)

```javascript
fetch('http://localhost:3001/news')
```

### After (DynamoDB API)

```javascript
import API_CONFIG from '../config/api';

fetch(API_CONFIG.getURL(API_CONFIG.endpoints.news))
// Equivalent to: http://localhost:3001/api/news
```

## Deployment

### Option 1: Keep API and React Separate

1. Deploy React app to Netlify/Vercel
2. Deploy API to AWS Lambda + API Gateway
3. Update `REACT_APP_API_URL` to point to deployed API

### Option 2: Deploy Together

1. Build React app: `npm run build`
2. Serve static files from Express API
3. Deploy entire application to AWS EC2/ECS

See [api/API-SUMMARY.md](api/API-SUMMARY.md) for detailed deployment options.

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Check that the API server is running on `http://localhost:3001`
2. Verify CORS is enabled in [api/config/index.js](api/config/index.js)

### Environment Variables Not Working

1. Ensure the variable name starts with `REACT_APP_`
2. Restart the React development server after changing `.env`
3. Check `process.env.REACT_APP_API_URL` in browser console

### API Connection Refused

1. Verify the API server is running: `cd api && npm run dev`
2. Check the port in `.env` matches the API server port
3. Ensure no firewall is blocking port 3001

## Best Practices

1. **Never hardcode API URLs** - Always use `API_CONFIG`
2. **Handle errors gracefully** - Provide fallback data
3. **Use environment variables** - Different URLs for dev/staging/prod
4. **Cache appropriately** - Some services cache data (e.g., homepage)
5. **Clear cache when needed** - Refresh data for frequently changing content

## Next Steps

1. Add authentication to API endpoints
2. Implement rate limiting per user
3. Add request/response logging
4. Set up API monitoring and alerts
5. Implement data caching with Redis
6. Add search functionality to API
