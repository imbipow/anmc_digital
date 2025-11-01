# Admin Panel Quick Start Guide

## Prerequisites

✅ API server running on port 3001
✅ React app running on port 3000
✅ DynamoDB tables created and seeded

## Access Admin Panel

Navigate to: **http://localhost:3000/admin**

## Available Resources

| Resource | What You Can Manage |
|----------|-------------------|
| **News** | News articles and blog posts |
| **Events** | Community events (upcoming/past) |
| **Projects** | Community projects |
| **Facilities** | Bookable facilities |
| **Homepage** | Hero section content |
| **Counters** | Statistics counters |
| **About Us** | About page content |
| **Contact** | Contact information |

## Common Tasks

### Create a News Article

1. **Navigate:** Admin Panel → News → Create
2. **Fill in:**
   - Title: "Community Gathering Success"
   - Slug: "community-gathering-success"
   - Content: "Our recent community gathering..."
   - Featured Image: `https://images.unsplash.com/photo-...`
   - Author: "Admin Team"
   - Publish Date: "2024-03-15"
   - Category: "Community"
   - Tags: `community, event, success` (comma-separated)
   - Excerpt: "Brief summary..."
   - Featured: ☑ (check if featured)
3. **Save:** Click "Save" button

**Result:** Article appears in news list and on website

### Create an Event

1. **Navigate:** Admin Panel → Events → Create
2. **Fill in:**
   - Title: "Annual Cultural Festival"
   - Slug: "annual-cultural-festival"
   - Description: "Join us for..."
   - Start Date: "2024-04-20T10:00:00Z"
   - End Date: "2024-04-20T18:00:00Z"
   - Location: "ANMC Centre"
   - Featured Image: `https://images.unsplash.com/photo-...`
   - Category: "Cultural"
   - Status: "upcoming"
   - Registration Required: ☑
   - Featured: ☑
3. **Save:** Click "Save"

**Result:** Event appears in events list and on website

### Edit Homepage Hero

1. **Navigate:** Admin Panel → Homepage → Edit (first record)
2. **Modify:**
   - welcomeText: "Welcome to ANMC"
   - title: "Your New Hero Title"
   - subtitle: "Updated description..."
   - learnMoreText: "Learn More"
   - memberButtonText: "Join Us"
3. **Save:** Click "Save"

**Result:** Homepage hero section updates immediately

### Update Counters

1. **Navigate:** Admin Panel → Counters
2. **Click** on a counter to edit
3. **Update:**
   - count: 1000
   - suffix: "+"
   - label: "Members"
4. **Save:** Click "Save"

**Result:** Counter on homepage updates

### Edit About Us

1. **Navigate:** Admin Panel → About Us → Edit
2. **Update sections:**
   - Mission
   - Vision
   - History
   - Executive Committee
   - Governance
3. **Save:** Click "Save"

**Result:** About page updates

## Field Reference

### Required Fields (Must Fill)

#### News/Blog
- ✅ Title
- ✅ Slug (URL-friendly, lowercase, hyphens)
- ✅ Content
- ✅ Featured Image (full URL)
- ✅ Author
- ✅ Publish Date
- ✅ Category

#### Events
- ✅ Title
- ✅ Slug
- ✅ Description
- ✅ Start Date (ISO format: YYYY-MM-DDTHH:mm:ssZ)
- ✅ End Date
- ✅ Location
- ✅ Featured Image
- ✅ Category
- ✅ Status (upcoming/past/cancelled)

#### Projects
- ✅ Title
- ✅ Slug
- ✅ Description
- ✅ Featured Image
- ✅ Category
- ✅ Status (active/completed/planned)

### Optional Fields

- Excerpt (auto-generated if empty)
- Tags (comma-separated)
- Featured (checkbox - defaults to false)
- Registration Required (events only)

## Tips & Best Practices

### 1. Slug Creation

**Good slugs:**
```
community-event-2024
annual-cultural-festival
volunteer-program-launch
```

**Bad slugs:**
```
Community Event 2024  ❌ (spaces)
Annual_Cultural_Festival  ❌ (underscores)
volunteerProgram  ❌ (camelCase)
```

**Rule:** lowercase, hyphens only, no special characters

### 2. Image URLs

Use full URLs from image hosting services:
```
✅ https://images.unsplash.com/photo-1234567890?w=800
✅ https://your-cdn.com/images/event.jpg
❌ /images/event.jpg (relative path won't work)
❌ C:\Users\Desktop\image.jpg (local path won't work)
```

### 3. Date Formats

**Publish Date (News):**
```
✅ 2024-03-15
✅ 2024-01-01
```

**Event Dates:**
```
✅ 2024-04-20T10:00:00Z (ISO format with time)
✅ 2024-04-20T14:30:00Z
```

### 4. Categories

**News Categories:**
- Community
- Events
- Announcements
- Updates

**Event Categories:**
- Cultural
- Social
- Educational
- Fundraising

**Project Categories:**
- Infrastructure
- Community Development
- Cultural Programs

### 5. Featured Content

Mark items as "Featured" to display them on the homepage:
- ✅ Check "Featured" checkbox
- Featured items appear in homepage sections
- Limit to 3-5 featured items per type

## Validation Errors

### Common Errors & Solutions

#### "Title is required"
**Fix:** Enter a title (minimum 3 characters)

#### "Invalid URL format"
**Fix:** Ensure image URL starts with `http://` or `https://`

#### "Slug already exists"
**Fix:** Use a unique slug (add year or number)

#### "Invalid date format"
**Fix:** Use YYYY-MM-DD format for dates

#### "Content too long"
**Fix:** Reduce content length (max varies by field)

## Keyboard Shortcuts (React Admin)

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save (in edit forms) |
| `Esc` | Close dialog/modal |
| `Tab` | Navigate between fields |

## Bulk Operations

### Delete Multiple Items

1. **Select:** Check boxes next to items
2. **Click:** Bulk Actions → Delete
3. **Confirm:** Click "Yes, delete them"

### Update Multiple Items

Currently not supported - update items individually

## Data Export

React Admin supports exporting:
1. **Navigate:** to list view (e.g., News list)
2. **Click:** Export button (top right)
3. **Format:** CSV or JSON

## Troubleshooting

### "Cannot save" or "Network Error"

**Check:**
1. ✅ API server running on port 3001
2. ✅ No console errors (press F12)
3. ✅ All required fields filled
4. ✅ Valid data formats

**Fix:**
```bash
# Restart API server
cd api
npm run dev
```

### Changes not appearing on website

**Refresh the page:**
1. Press `Ctrl+F5` (hard refresh)
2. Clear browser cache
3. Check if correct environment

### "Record not found" on edit

**Cause:** Record may have been deleted

**Fix:** Return to list and select a valid record

## Production Deployment Notes

### Before Going Live

- [ ] Add authentication (login required)
- [ ] Add user roles (admin, editor, viewer)
- [ ] Enable HTTPS
- [ ] Set up backups
- [ ] Add audit logging
- [ ] Test all CRUD operations
- [ ] Configure production API URL

### Update API URL for Production

Edit `.env` file:
```env
REACT_APP_API_URL=https://api.yoursite.com/api
```

## Support

**Documentation:**
- [ADMIN-PANEL-API-INTEGRATION.md](ADMIN-PANEL-API-INTEGRATION.md) - Detailed technical docs
- [API-INTEGRATION.md](API-INTEGRATION.md) - API reference
- [QUICK-START.md](QUICK-START.md) - General setup

**Check Logs:**
```bash
# API server logs
cd api
npm run dev

# Browser console
Press F12 → Console tab
```

**Common Issues:**
- Ensure both servers are running
- Check browser console for errors
- Verify DynamoDB tables exist and have data
- Confirm AWS credentials are correct

---

## Quick Checklist

Before using admin panel:
- [ ] API server running (`cd api && npm run dev`)
- [ ] React app running (`npm start`)
- [ ] DynamoDB tables created
- [ ] DynamoDB tables seeded with data
- [ ] Navigate to http://localhost:3000/admin
- [ ] Test create, edit, delete operations

**You're ready to manage your website content!** 🚀
