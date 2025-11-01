# Quick Start Guide - ANMC Digital

## Prerequisites

- Node.js (v14 or higher)
- AWS Account with credentials
- DynamoDB tables created and seeded

## 1. Environment Setup

Copy the environment example file:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
REACT_APP_API_URL=http://localhost:3001/api
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
ENVIRONMENT=dev
```

## 2. Start the API Server

Open a terminal and run:

```bash
cd api
npm install
npm run dev
```

You should see:
```
╔══════════════════════════════════════════════════════════╗
║            ANMC Digital API Server                       ║
╚══════════════════════════════════════════════════════════╝

🚀 Server running on http://localhost:3001
📍 Environment: development
🗄️  DynamoDB Region: ap-southeast-2
🏷️  Table Prefix: anmc-*-dev

📚 API Documentation: http://localhost:3001/
🏥 Health Check: http://localhost:3001/api/health
```

## 3. Verify API is Working

Open a browser and visit:
- **http://localhost:3001/** - API info page
- **http://localhost:3001/api/health** - Health check
- **http://localhost:3001/api/news** - Test news endpoint

You should see JSON responses.

## 4. Start the React App

Open a **NEW terminal** (keep the API server running) and run:

```bash
npm install
npm start
```

The React app will start on **http://localhost:3000**

## 5. Test All Pages

Visit these pages to verify data is loading:

- ✅ **Homepage** - http://localhost:3000/
  - Hero section
  - Counter statistics
  - Featured content

- ✅ **About Page** - http://localhost:3000/about
  - Mission and vision
  - Executive committee

- ✅ **News/Blog** - http://localhost:3000/news
  - All news articles

- ✅ **Events** - http://localhost:3000/events
  - All events

- ✅ **Projects** - http://localhost:3000/projects
  - All projects

- ✅ **Facilities** - http://localhost:3000/facilities
  - Bookable facilities

- ✅ **Contact** - http://localhost:3000/contact
  - Contact information

## Troubleshooting

### API Server Won't Start

**Error:** `Cannot find module 'express'`

**Solution:**
```bash
cd api
npm install
```

### React App Shows Empty Content

**Check 1:** Is the API server running?
```bash
# Visit http://localhost:3001/api/health
# Should return: {"status": "ok", ...}
```

**Check 2:** Check browser console (F12) for errors
- Look for CORS errors
- Look for fetch errors

**Check 3:** Verify environment variable
```javascript
// In browser console:
console.log(process.env.REACT_APP_API_URL)
// Should output: http://localhost:3001/api
```

### CORS Errors

If you see: `Access to fetch at 'http://localhost:3001/api/news' from origin 'http://localhost:3000' has been blocked by CORS`

**Solution:** Restart the API server
```bash
cd api
npm run dev
```

### DynamoDB Connection Errors

**Error:** `UnrecognizedClientException` or `InvalidSignatureException`

**Solution:** Check AWS credentials in `.env`:
```bash
AWS_ACCESS_KEY_ID=your-actual-key
AWS_SECRET_ACCESS_KEY=your-actual-secret
AWS_REGION=ap-southeast-2
```

### Tables Not Found

**Error:** `Cannot do operations on a non-existent table`

**Solution:** Create and seed DynamoDB tables:
```bash
cd aws-infrastructure
npm install
npm run deploy:dev
npm run seed:dev
```

## Development Workflow

### Both servers running simultaneously:

**Terminal 1 - API Server:**
```bash
cd api
npm run dev
```

**Terminal 2 - React App:**
```bash
npm start
```

### Making Changes

**API Changes:**
- Edit files in `api/`
- Server auto-restarts with nodemon
- No need to refresh browser

**React Changes:**
- Edit files in `src/`
- Hot reload updates browser automatically

**Service Layer Changes:**
- Edit files in `src/services/`
- Browser auto-refreshes

## Useful Commands

### API Server
```bash
cd api
npm run dev          # Start with auto-reload
npm start            # Start in production mode
npm run lint         # Check code style
```

### React App
```bash
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests
```

### DynamoDB
```bash
cd aws-infrastructure
npm run deploy:dev       # Deploy tables
npm run seed:dev         # Seed data
npm run seed:reset:dev   # Clear and re-seed
```

## API Endpoints Reference

### Quick Test Endpoints

```bash
# Health check
curl http://localhost:3001/api/health

# Get all news
curl http://localhost:3001/api/news

# Get featured news
curl http://localhost:3001/api/news/featured

# Get all events
curl http://localhost:3001/api/events

# Get homepage hero
curl http://localhost:3001/api/homepage

# Get counters
curl http://localhost:3001/api/counters
```

## File Structure

```
anmcDigital/
├── api/                          # API Server
│   ├── server.js                 # Main server file
│   ├── config/                   # Configuration
│   ├── routes/                   # API routes
│   ├── services/                 # DynamoDB services
│   ├── middleware/               # Express middleware
│   └── package.json
│
├── src/
│   ├── services/                 # Data fetching services
│   │   ├── contentService.js     # News, events, projects
│   │   ├── homepageService.js    # Homepage content
│   │   └── aboutUsService.js     # About us content
│   │
│   ├── config/
│   │   └── api.js                # API configuration
│   │
│   └── main-component/           # Page components
│       ├── HomePage/
│       ├── AboutPage/
│       ├── BlogPage/
│       └── ...
│
├── aws-infrastructure/           # DynamoDB setup
│   ├── dynamodb-tables-updated.yml
│   └── seed-data-updated.js
│
└── .env                          # Environment variables
```

## Next Steps

1. ✅ API server running
2. ✅ React app running
3. ✅ Test all pages
4. ⏭️ Add authentication
5. ⏭️ Deploy to production

## Documentation

- [MIGRATION-SUMMARY.md](MIGRATION-SUMMARY.md) - Complete migration overview
- [API-INTEGRATION.md](API-INTEGRATION.md) - Detailed integration guide
- [api/README.md](api/README.md) - API documentation
- [aws-infrastructure/README-DYNAMODB.md](aws-infrastructure/README-DYNAMODB.md) - DynamoDB guide

## Support

For issues or questions, check:
1. Browser console (F12) for errors
2. API server terminal for errors
3. Documentation files above
4. AWS CloudWatch logs for DynamoDB errors

---

**Ready to go!** 🚀

Start the API server, then the React app, and visit http://localhost:3000
