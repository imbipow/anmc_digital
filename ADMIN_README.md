# ANMC Content Management System

This project includes a comprehensive React Admin interface for managing all website content.

## Features

### Homepage Management
- **Hero Section**: Edit welcome text, main title, subtitle, and button texts
- **Counter Statistics**: Edit counter values, prefixes, suffixes, and labels
- **Featured Content**: Homepage automatically displays featured news and events

### Content Types
- **News Articles**: Create, edit, and manage news articles with rich content, categories, and tags
- **Events**: Manage events with date/time, location, registration details, and capacity
- **Projects**: Track community projects with progress, budget, and timeline information

### Page Management
- **About Us**: Edit mission, vision, history, values, and achievements
- **Facilities**: Manage facility listings with amenities, capacity, and booking rates
- **Contact Information**: Update contact details, hours, and social media links

## How to Use

### 1. Start the Development Server

To run both the React app and the API server:

```bash
npm run dev
```

This will start:
- React app on http://localhost:3000
- JSON Server API on http://localhost:3001

### 2. Access the Admin Panel

Navigate to http://localhost:3000/admin to access the content management interface.

### 3. Edit Content

#### Homepage Components
- **Homepage Hero**: Edit the main hero section content
- **Homepage Counters**: Modify statistics displayed on the homepage
- **Homepage Section**: Edit the featured content section titles

#### Content Management
- **News Articles**: Create and manage news articles with featured status
- **Events**: Manage upcoming and past events with full details
- **Projects**: Track community projects with progress and budget

#### Page Content
- **About Us**: Edit organizational information and values
- **Facilities**: Manage facility listings and booking information
- **Contact Info**: Update contact details and social media links

### 4. View Changes

Changes made in the admin panel will be reflected immediately on the homepage at http://localhost:3000

## File Structure

```
src/
├── admin/
│   ├── Admin.js                 # Main admin app
│   ├── HomepageAdmin.js         # Homepage content admin
│   ├── CountersAdmin.js         # Counter statistics admin
│   ├── BlogPostsAdmin.js        # Blog posts admin
│   └── BlogSectionAdmin.js      # Blog section admin
├── data/
│   └── db.json                  # Static content (fallback)
├── services/
│   └── contentService.js       # API service for content
└── components/
    ├── hero/                    # Updated hero component
    ├── counter/                 # Updated counter component
    └── BlogSection/             # Updated blog section component

server/
└── db.json                      # JSON Server database
```

## API Endpoints

The JSON Server provides the following endpoints:

### Homepage Components
- `GET/PUT /homepage` - Homepage hero content
- `GET/PUT/POST/DELETE /counters` - Counter statistics
- `GET/PUT /blog_section` - Blog section content

### Content Types
- `GET/PUT/POST/DELETE /news` - News articles
- `GET/PUT/POST/DELETE /events` - Events
- `GET/PUT/POST/DELETE /projects` - Projects

### Page Content
- `GET/PUT /about_us` - About us page content
- `GET/PUT/POST/DELETE /facilities` - Facilities
- `GET/PUT /contact` - Contact information

### Legacy
- `GET/PUT/POST/DELETE /blog_posts` - Legacy blog posts (for compatibility)

## Scripts

- `npm start` - Start React app only
- `npm run json-server` - Start JSON server only
- `npm run dev` - Start both React app and JSON server
- `npm run build` - Build for production

## Notes

- The components include fallback content that displays if the API is not available
- All API calls include error handling to prevent crashes
- The admin interface uses React Admin for a professional CMS experience