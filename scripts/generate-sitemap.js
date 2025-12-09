/**
 * Sitemap Generator for ANMC Website
 * Generates sitemap.xml with both static and dynamic routes
 * Run: node scripts/generate-sitemap.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'https://anmcinc.org.au';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'sitemap.xml');

// Static routes with their priorities and change frequencies
const STATIC_ROUTES = [
    { path: '/', priority: '1.0', changefreq: 'daily', title: 'Home' },
    { path: '/about', priority: '0.9', changefreq: 'monthly', title: 'About Us' },
    { path: '/projects', priority: '0.8', changefreq: 'weekly', title: 'Projects' },
    { path: '/event', priority: '0.8', changefreq: 'weekly', title: 'Events' },
    { path: '/news', priority: '0.8', changefreq: 'daily', title: 'News' },
    { path: '/donate', priority: '0.9', changefreq: 'monthly', title: 'Donate' },
    { path: '/contact', priority: '0.7', changefreq: 'monthly', title: 'Contact Us' },
    { path: '/faq', priority: '0.6', changefreq: 'monthly', title: 'FAQ' },
    { path: '/book-kalash', priority: '0.7', changefreq: 'monthly', title: 'Book Kalash' },
    { path: '/signup', priority: '0.8', changefreq: 'monthly', title: 'Member Signup' },
    { path: '/user-signup', priority: '0.7', changefreq: 'monthly', title: 'User Signup' },
    { path: '/login', priority: '0.7', changefreq: 'yearly', title: 'Login' },
    { path: '/facilities', priority: '0.7', changefreq: 'monthly', title: 'Facilities' }
];

// Fetch data from API
async function fetchAPI(endpoint) {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) {
            console.warn(`Failed to fetch ${endpoint}: ${response.status}`);
            return [];
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error.message);
        return [];
    }
}

// Generate URL entry for sitemap
function createURLEntry({ loc, lastmod, changefreq, priority }) {
    return `
  <url>
    <loc>${loc}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// Format date to YYYY-MM-DD
function formatDate(date) {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
}

// Generate sitemap
async function generateSitemap() {
    console.log('🗺️  Generating sitemap...\n');

    const urls = [];

    // Add static routes
    console.log('📋 Adding static routes...');
    STATIC_ROUTES.forEach(route => {
        urls.push(createURLEntry({
            loc: `${SITE_URL}${route.path}`,
            changefreq: route.changefreq,
            priority: route.priority
        }));
        console.log(`  ✓ ${route.title}: ${route.path}`);
    });

    // Fetch and add news articles
    console.log('\n📰 Fetching news articles...');
    const news = await fetchAPI('/news');
    if (Array.isArray(news) && news.length > 0) {
        news.forEach(article => {
            if (article.slug) {
                urls.push(createURLEntry({
                    loc: `${SITE_URL}/news/${article.slug}`,
                    lastmod: formatDate(article.publishDate || article.updatedAt || article.createdAt),
                    changefreq: 'weekly',
                    priority: '0.7'
                }));
            }
        });
        console.log(`  ✓ Added ${news.length} news articles`);
    } else {
        console.log('  ⚠️  No news articles found');
    }

    // Fetch and add events
    console.log('\n📅 Fetching events...');
    const events = await fetchAPI('/events');
    if (Array.isArray(events) && events.length > 0) {
        events.forEach(event => {
            if (event.slug) {
                urls.push(createURLEntry({
                    loc: `${SITE_URL}/event/${event.slug}`,
                    lastmod: formatDate(event.updatedAt || event.createdAt),
                    changefreq: 'weekly',
                    priority: '0.7'
                }));
            }
        });
        console.log(`  ✓ Added ${events.length} events`);
    } else {
        console.log('  ⚠️  No events found');
    }

    // Fetch and add projects
    console.log('\n🏗️  Fetching projects...');
    const projects = await fetchAPI('/projects');
    if (Array.isArray(projects) && projects.length > 0) {
        projects.forEach(project => {
            if (project.slug) {
                urls.push(createURLEntry({
                    loc: `${SITE_URL}/projects-single?slug=${project.slug}`,
                    lastmod: formatDate(project.updatedAt || project.createdAt),
                    changefreq: 'monthly',
                    priority: '0.6'
                }));
            }
        });
        console.log(`  ✓ Added ${projects.length} projects`);
    } else {
        console.log('  ⚠️  No projects found');
    }

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <!-- Generated on ${new Date().toISOString()} -->
  <!-- Total URLs: ${urls.length} -->
${urls.join('')}
</urlset>`;

    // Write to file
    try {
        fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');
        console.log(`\n✅ Sitemap generated successfully!`);
        console.log(`📁 Location: ${OUTPUT_PATH}`);
        console.log(`📊 Total URLs: ${urls.length}`);
        console.log(`🌐 Site URL: ${SITE_URL}`);
    } catch (error) {
        console.error('\n❌ Error writing sitemap:', error.message);
        process.exit(1);
    }
}

// Run
generateSitemap()
    .then(() => {
        console.log('\n✅ Done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
