# ANMC Digital API

REST API for the ANMC Digital Application with AWS DynamoDB backend.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd api
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your AWS credentials:

```env
AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
ENVIRONMENT=dev
PORT=3001
```

### 3. Start Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Server will start on `http://localhost:3001`

## 📚 API Endpoints

### Base URL
```
http://localhost:3001/api
```

### Available Endpoints

| Resource | Endpoint | Description |
|----------|----------|-------------|
| News | `/api/news` | News articles and blog posts |
| Events | `/api/events` | Community events |
| Projects | `/api/projects` | Community projects |
| Facilities | `/api/facilities` | Facility booking services |
| Homepage | `/api/homepage` | Homepage content |
| Counters | `/api/counters` | Statistics counters |
| About Us | `/api/about-us` | About us information |
| Contact | `/api/contact` | Contact information |
| Master Plan | `/api/master-plan` | Strategic master plan |
| Achievements | `/api/achievements` | Project achievements |

## 📖 Detailed API Reference

### News API

#### Get All News
```http
GET /api/news
GET /api/news?limit=10
```

#### Get Featured News
```http
GET /api/news/featured
```

#### Get News by Category
```http
GET /api/news/category/:category
```

#### Get News by Slug
```http
GET /api/news/slug/:slug
```

#### Get News by ID
```http
GET /api/news/:id
```

#### Create News
```http
POST /api/news
Content-Type: application/json

{
  "title": "New Article",
  "slug": "new-article",
  "content": "Full content here...",
  "excerpt": "Brief summary...",
  "authorName": "John Doe",
  "date": "2025-01-15",
  "featuredImage": "https://example.com/image.jpg",
  "featured": true,
  "status": "published",
  "category": "community-events",
  "tags": ["event", "community"]
}
```

#### Update News
```http
PUT /api/news/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "featured": false
}
```

#### Delete News
```http
DELETE /api/news/:id
```

---

### Events API

#### Get All Events
```http
GET /api/events
```

#### Get Upcoming Events
```http
GET /api/events/upcoming
```

#### Get Past Events
```http
GET /api/events/past
GET /api/events/past?limit=5
```

#### Get Events by Category
```http
GET /api/events/category/:category
```

#### Get Event by Slug
```http
GET /api/events/slug/:slug
```

#### Get Event by ID
```http
GET /api/events/:id
```

#### Create Event
```http
POST /api/events
Content-Type: application/json

{
  "title": "Community Picnic",
  "slug": "community-picnic-2025",
  "description": "Annual community gathering",
  "content": "Full description...",
  "startDate": "2025-03-15",
  "endDate": "2025-03-15",
  "startTime": "10:00",
  "endTime": "16:00",
  "location": "Riverside Park",
  "address": "123 Park Street",
  "featuredImage": "https://example.com/image.jpg",
  "featured": true,
  "status": "upcoming",
  "category": "community",
  "maxAttendees": 200,
  "registrationRequired": true,
  "contactEmail": "events@anmcinc.org.au",
  "tags": ["picnic", "family"]
}
```

#### Update Event
```http
PUT /api/events/:id
```

#### Delete Event
```http
DELETE /api/events/:id
```

---

### Projects API

#### Get All Projects
```http
GET /api/projects
```

#### Get Featured Projects
```http
GET /api/projects/featured
```

#### Get Projects by Status
```http
GET /api/projects/status/:status
```
Status values: `active`, `completed`, `planning`, `fundraising`

#### Get Projects by Category
```http
GET /api/projects/category/:category
```

#### Get Project by Slug
```http
GET /api/projects/slug/:slug
```

#### Get Project by ID
```http
GET /api/projects/:id
```

#### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "title": "Community Garden",
  "slug": "community-garden",
  "description": "Creating sustainable gardens",
  "content": "Full description...",
  "status": "active",
  "startDate": "2024-06-01",
  "endDate": "2025-12-31",
  "budget": 15000,
  "fundingSource": "Community Grants",
  "projectManager": "Jane Doe",
  "featuredImage": "https://example.com/image.jpg",
  "featured": true,
  "category": "sustainability",
  "progress": 75,
  "tags": ["garden", "sustainability"]
}
```

#### Update Project
```http
PUT /api/projects/:id
```

#### Delete Project
```http
DELETE /api/projects/:id
```

---

### Facilities API

#### Get All Facilities
```http
GET /api/facilities
```

#### Get Facility by ID
```http
GET /api/facilities/:id
```

#### Create Facility
```http
POST /api/facilities
```

#### Update Facility
```http
PUT /api/facilities/:id
```

#### Delete Facility
```http
DELETE /api/facilities/:id
```

---

### Homepage API

#### Get All Homepage Content
```http
GET /api/homepage
```

#### Get Content by ID
```http
GET /api/homepage/:id
```

#### Get Content by Component
```http
GET /api/homepage/component/:component
```

#### Update Homepage Content
```http
PUT /api/homepage/:id
```

---

### Counters API

#### Get All Counters
```http
GET /api/counters
```

#### Get Counter by ID
```http
GET /api/counters/:id
```

#### Update Counter
```http
PUT /api/counters/:id
Content-Type: application/json

{
  "count": 550,
  "label": "Life Members"
}
```

---

### About Us API

#### Get About Us Information
```http
GET /api/about-us
```

#### Update About Us
```http
PUT /api/about-us
```

---

### Contact API

#### Get Contact Information
```http
GET /api/contact
```

#### Update Contact Information
```http
PUT /api/contact
```

---

### Master Plan API

#### Get Master Plan
```http
GET /api/master-plan
```

#### Update Master Plan
```http
PUT /api/master-plan
```

---

### Achievements API

#### Get All Achievements
```http
GET /api/achievements
```

#### Get Achievements by Category
```http
GET /api/achievements/category/:category
```

#### Get Achievement by Year
```http
GET /api/achievements/:year
```

#### Create Achievement
```http
POST /api/achievements
Content-Type: application/json

{
  "year": "2025",
  "title": "New Milestone",
  "description": "Achievement description",
  "category": "Growth"
}
```

#### Update Achievement
```http
PUT /api/achievements/:year
```

#### Delete Achievement
```http
DELETE /api/achievements/:year
```

---

## 🔒 Error Handling

### Error Response Format

```json
{
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

### Common HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_REGION` | AWS region | `ap-southeast-2` |
| `AWS_ACCESS_KEY_ID` | AWS access key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - |
| `ENVIRONMENT` | Environment (dev/staging/prod) | `dev` |
| `NODE_ENV` | Node environment | `development` |
| `PORT` | Server port | `3001` |
| `HOST` | Server host | `localhost` |
| `CORS_ORIGIN` | CORS origin | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

---

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevents abuse
- **Input Validation** - Joi schema validation
- **Error Handling** - Secure error responses

---

## 📊 Performance

- **Compression** - Response compression
- **Connection Pooling** - Reused DynamoDB connections
- **Caching Ready** - Structure supports caching layer

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test
```

---

## 📝 Example Usage

### JavaScript/Node.js

```javascript
const response = await fetch('http://localhost:3001/api/news');
const news = await response.json();
console.log(news);
```

### cURL

```bash
# Get all news
curl http://localhost:3001/api/news

# Create news article
curl -X POST http://localhost:3001/api/news \
  -H "Content-Type: application/json" \
  -d '{"title":"New Article","slug":"new-article",...}'

# Update news
curl -X PUT http://localhost:3001/api/news/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# Delete news
curl -X DELETE http://localhost:3001/api/news/1
```

---

## 🏗️ Project Structure

```
api/
├── config/
│   └── index.js              # Configuration
├── middleware/
│   ├── errorHandler.js       # Error handling
│   ├── notFound.js           # 404 handler
│   └── validation.js         # Input validation
├── routes/
│   ├── index.js              # Route aggregator
│   ├── news.js               # News routes
│   ├── events.js             # Events routes
│   ├── projects.js           # Projects routes
│   └── ...                   # Other routes
├── services/
│   ├── dynamodb.js           # DynamoDB service layer
│   ├── newsService.js        # News service
│   ├── eventsService.js      # Events service
│   └── ...                   # Other services
├── .env.example              # Environment template
├── package.json              # Dependencies
├── server.js                 # Main server file
└── README.md                 # This file
```

---

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

---

## 🔗 Related Documentation

- [DynamoDB Schema](../aws-infrastructure/DATABASE-SCHEMA.md)
- [Deployment Guide](../aws-infrastructure/DEPLOYMENT-GUIDE.md)
- [Quick Reference](../aws-infrastructure/QUICK-REFERENCE.md)

---

## 📞 Support

For issues or questions, contact the development team or create an issue in the project repository.

---

**API Version**: 1.0.0
**Last Updated**: 2025
**Author**: ANMC Digital Team
