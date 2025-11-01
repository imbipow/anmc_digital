# ANMC Digital - Complete Database Schema

## Overview

This document provides a complete reference of the DynamoDB database schema for the ANMC Digital application, converted from the original `db.json` structure.

## Database Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ANMC Digital Database                     │
│                      (Amazon DynamoDB)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  News/Blog   │  │    Events    │  │   Projects   │      │
│  │   (6 items)  │  │  (2 items)   │  │  (4 items)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Facilities  │  │   Homepage   │  │   Counters   │      │
│  │  (4 items)   │  │  (1 item)    │  │  (4 items)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   About Us   │  │   Contact    │  │ Master Plan  │      │
│  │  (1 item)    │  │  (1 item)    │  │  (1 item)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────┐                   │
│  │   Project Achievements (10 items)    │                   │
│  └──────────────────────────────────────┘                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Table Details

### 1. News Table (`anmc-news-{env}`)

**Total Items**: 6 news articles

**Primary Key**: `id` (Number)

**Global Secondary Indexes**:
- **SlugIndex**: `slug` → For URL-friendly lookups
- **CategoryDateIndex**: `category` + `publishedAt` → For category filtering with date sorting
- **FeaturedIndex**: `featured` + `publishedAt` → For featured articles

**Sample Data**:
```json
{
  "id": 1,
  "title": "ANMC Annual Dashain Celebration 2024",
  "slug": "dashain-celebration-2024",
  "content": "Full article content...",
  "excerpt": "Annual Dashain celebration...",
  "authorName": "Cultural Affairs Team",
  "date": "2024-10-15",
  "publishedAt": "2024-10-15T10:00:00Z",
  "featuredImage": "https://images.unsplash.com/...",
  "featured": "true",
  "status": "published",
  "category": "community-events",
  "tags": ["dashain", "festival", "community"]
}
```

**Categories**:
- `community-events`
- `programs`
- `youth`
- `sustainability`
- `education`
- `festival`

---

### 2. Events Table (`anmc-events-{env}`)

**Total Items**: 2 events

**Primary Key**: `id` (Number)

**Global Secondary Indexes**:
- **SlugIndex**: `slug` → For URL lookups
- **StatusDateIndex**: `status` + `startDate` → For upcoming/past events
- **CategoryDateIndex**: `category` + `startDate` → For category filtering

**Sample Data**:
```json
{
  "id": 1,
  "title": "Community Picnic 2025",
  "slug": "community-picnic-2025",
  "description": "Annual community picnic...",
  "content": "Join us for our annual...",
  "startDate": "2025-03-15",
  "endDate": "2025-03-15",
  "startTime": "10:00",
  "endTime": "16:00",
  "location": "Riverside Park, Melbourne",
  "address": "123 Riverside Drive, Melbourne VIC 3000",
  "featuredImage": "https://images.unsplash.com/...",
  "featured": true,
  "status": "upcoming",
  "category": "community",
  "maxAttendees": 200,
  "registrationRequired": true,
  "contactEmail": "events@anmc.org.au",
  "tags": ["picnic", "community", "family"]
}
```

**Event Statuses**:
- `upcoming` - Future events
- `past` - Completed events

**Categories**:
- `community`
- `culture`

---

### 3. Projects Table (`anmc-projects-{env}`)

**Total Items**: 4 projects

**Primary Key**: `id` (Number)

**Global Secondary Indexes**:
- **SlugIndex**: `slug`
- **StatusIndex**: `status`
- **CategoryIndex**: `category`
- **FeaturedIndex**: `featured`

**Sample Data**:
```json
{
  "id": 1,
  "title": "Community Garden Initiative",
  "slug": "community-garden-initiative",
  "description": "Creating sustainable community gardens...",
  "content": "Our community garden initiative aims...",
  "status": "active",
  "startDate": "2024-06-01",
  "endDate": "2025-12-31",
  "budget": 15000,
  "fundingSource": "Community Grants",
  "projectManager": "Sarah Johnson",
  "featuredImage": "https://images.unsplash.com/...",
  "featured": "true",
  "category": "sustainability",
  "progress": 75,
  "tags": ["garden", "sustainability", "community"]
}
```

**Project Statuses**:
- `active` - Currently running
- `completed` - Finished projects
- `planning` - In planning phase
- `fundraising` - Seeking funding

**Categories**:
- `sustainability`
- `youth`
- `culture`
- `health`

---

### 4. Facilities Table (`anmc-facilities-{env}`)

**Total Items**: 4 facilities

**Primary Key**: `id` (String)

**Sample Data**:
```json
{
  "id": "car-puja",
  "name": "Car Puja (Vehicle Blessing)",
  "capacity": "5-15 people",
  "description": "Traditional blessing ceremony...",
  "features": [
    "Traditional Puja rituals",
    "Experienced Hindu priests",
    "All Puja materials included"
  ],
  "pricing": "$50",
  "icon": "fa-car",
  "image": "https://images.unsplash.com/..."
}
```

**Available Facilities**:
- `car-puja` - Vehicle Blessing
- `marriage-ceremony` - Wedding Ceremonies
- `bartabhanda-ceremony` - Sacred Thread Ceremony
- `community-hall-rental` - Hall Rental

---

### 5. Homepage Table (`anmc-homepage-{env}`)

**Total Items**: 1 component

**Primary Key**: `id` (String)

**Global Secondary Indexes**:
- **ComponentIndex**: `component`

**Sample Data**:
```json
{
  "id": "hero",
  "component": "hero",
  "data": {
    "welcomeText": "Welcome to ANMC",
    "title": "Building Bridges, Strengthening Communities",
    "subtitle": "The Australian Nepalese Multicultural Centre...",
    "learnMoreText": "Learn More",
    "memberButtonText": "Become a Member",
    "heroImage": "https://images.unsplash.com/..."
  }
}
```

---

### 6. Counters Table (`anmc-counters-{env}`)

**Total Items**: 4 counters

**Primary Key**: `id` (Number)

**Sample Data**:
```json
{
  "id": 1,
  "count": 500,
  "suffix": "+",
  "label": "Life Members"
}
```

**All Counters**:
1. Life Members: 500+
2. Acres of Land: 25
3. Funds Raised: $2M+
4. Established: 1998

---

### 7. About Us Table (`anmc-about-us-{env}`)

**Total Items**: 1 record

**Primary Key**: `id` (String)

**Sample Data Structure**:
```json
{
  "id": "main",
  "title": "About ANMC",
  "subtitle": "Building Bridges, Strengthening Communities",
  "mission": { ... },
  "vision": { ... },
  "history": { ... },
  "executiveCommittee": {
    "title": "Executive Committee",
    "subtitle": "Meet our dedicated leadership team...",
    "members": [
      {
        "id": 1,
        "name": "Rajesh Sharma",
        "title": "President",
        "position": "Executive Leadership",
        "email": "president@anmc.org.au",
        "phone": "+61 400 123 456",
        "description": "Leading the organization's strategic direction...",
        "image": "https://images.unsplash.com/...",
        "tenure": "2022-2024",
        "responsibilities": [...]
      }
      // ... 5 more members
    ]
  },
  "governance": {
    "title": "Governance Structure",
    "subtitle": "Our organizational leadership framework...",
    "structure": [...]
  }
}
```

**Executive Committee Members**: 6
**Governance Structures**: 4

---

### 8. Contact Table (`anmc-contact-{env}`)

**Total Items**: 1 record

**Primary Key**: `id` (String)

**Sample Data**:
```json
{
  "id": "main",
  "address": "123 Community Street, Melbourne VIC 3001",
  "phone": "+61 3 9876 5432",
  "email": "info@anmc.org.au",
  "emergencyPhone": "+61 400 123 456",
  "officeHours": "Monday to Friday: 9:00 AM - 5:00 PM",
  "weekendHours": "Saturday: 10:00 AM - 2:00 PM",
  "socialMedia": {
    "facebook": "https://facebook.com/anmc.melbourne",
    "instagram": "https://instagram.com/anmc_melbourne",
    "twitter": "https://twitter.com/anmc_melbourne"
  },
  "mapCoordinates": {
    "lat": -37.8136,
    "lng": 144.9631
  }
}
```

---

### 9. Master Plan Table (`anmc-master-plan-{env}`)

**Total Items**: 1 plan

**Primary Key**: `id` (String)

**Sample Data**:
```json
{
  "id": "master-plan-2025-2030",
  "title": "ANMC Master Plan 2025-2030",
  "description": "Building the future of our community...",
  "period": "2025-2030",
  "total_budget": "$2.5M",
  "key_areas": [
    {
      "title": "Cultural Heritage Center",
      "description": "Preserve and showcase Nepalese traditions",
      "budget": "$600K",
      "timeline": "2025-2027"
    }
    // ... 4 more areas
  ],
  "goals": [
    "Expand membership to 1,200+ families",
    "Serve 8,000+ annual program participants",
    "Organize 36+ cultural events yearly",
    "Achieve 85% financial sustainability"
  ]
}
```

**Key Areas**: 5
- Cultural Heritage Center
- Community Wellness Complex
- Youth Leadership Programs
- Infrastructure Upgrades
- Sustainability Fund

---

### 10. Project Achievements Table (`anmc-project-achievements-{env}`)

**Total Items**: 10 achievements

**Primary Key**: `year` (String)

**Global Secondary Indexes**:
- **CategoryIndex**: `category` + `year`

**Sample Data**:
```json
{
  "year": "1998",
  "title": "Organization Founded",
  "description": "Established ANMC with 25 founding families",
  "category": "Foundation"
}
```

**Timeline**:
- 1998: Organization Founded
- 2003: First Community Center
- 2005: Cultural Dance Academy
- 2010: 25 Acres Land Acquired
- 2012: Multicultural Excellence Award
- 2015: Cultural Center Completed
- 2018: 300+ Member Families
- 2020: Digital Infrastructure
- 2022: Life Membership Program
- 2024: 500+ Families & $2M+ Raised

**Categories**:
- Foundation
- Infrastructure
- Culture
- Recognition
- Growth
- Technology
- Sustainability

---

## Data Statistics

| Table | Items | Categories | Featured Items |
|-------|-------|------------|----------------|
| News | 6 | 6 | 2 |
| Events | 2 | 2 | 1 |
| Projects | 4 | 4 | 4 |
| Facilities | 4 | - | - |
| Homepage | 1 | - | - |
| Counters | 4 | - | - |
| About Us | 1 | - | - |
| Contact | 1 | - | - |
| Master Plan | 1 | - | - |
| Achievements | 10 | 7 | - |
| **Total** | **34** | - | - |

## Access Patterns

### 1. Get all featured news articles
```javascript
Query: FeaturedIndex where featured = 'true', sorted by publishedAt DESC
```

### 2. Get news by category
```javascript
Query: CategoryDateIndex where category = 'community-events', sorted by publishedAt DESC
```

### 3. Get upcoming events
```javascript
Query: StatusDateIndex where status = 'upcoming' AND startDate >= today
```

### 4. Get event by slug
```javascript
Query: SlugIndex where slug = 'community-picnic-2025'
```

### 5. Get active projects
```javascript
Query: StatusIndex where status = 'active'
```

### 6. Get homepage hero content
```javascript
Get: id = 'hero'
```

### 7. Get all counters
```javascript
Scan: anmc-counters-{env}
```

### 8. Get about us information
```javascript
Get: id = 'main'
```

### 9. Get achievements by category
```javascript
Query: CategoryIndex where category = 'Infrastructure', sorted by year ASC
```

## Performance Considerations

- **Read Capacity**: ~10-50 RCUs per second
- **Write Capacity**: ~1-5 WCUs per second
- **Storage**: < 1 MB total
- **Latency**: < 10ms for Gets, < 20ms for Queries

## Migration Notes

When migrating from json-server to DynamoDB:

1. ✅ All data structures preserved
2. ✅ Boolean values converted to strings for GSI compatibility
3. ✅ Arrays and objects stored as-is (DynamoDB supports nested structures)
4. ✅ Images migrated to Unsplash URLs
5. ✅ All relationships maintained through IDs

## Future Enhancements

Potential additions to consider:

- [ ] User authentication table
- [ ] Event registration/RSVP table
- [ ] Donation tracking table
- [ ] Member management table
- [ ] Booking/reservation table
- [ ] Comments/feedback table
- [ ] Newsletter subscription table
- [ ] Audit log table

---

**Last Updated**: 2025
**Schema Version**: 1.0
**Database Type**: Amazon DynamoDB
**Billing Mode**: Pay-per-request
