/**
 * Update Fallback Content Script
 * Fetches latest data from API and generates fallback content for components
 * Run: node scripts/update-fallback-content.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'fallbackContent.js');

// Fetch data from API
async function fetchAPI(endpoint) {
    try {
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`${API_URL}${endpoint}`);
        if (!response.ok) {
            console.warn(`❌ Failed to fetch ${endpoint}: ${response.status}`);
            return null;
        }
        return await response.json();
    } catch (error) {
        console.error(`❌ Error fetching ${endpoint}:`, error.message);
        return null;
    }
}

// Generate fallback content
async function generateFallbackContent() {
    console.log('📥 Fetching latest data from API...\n');

    const fallbackData = {
        lastUpdated: new Date().toISOString(),
        aboutUs: null,
        homepage: null,
        counters: null,
        news: [],
        events: [],
        projects: [],
        services: [],
        faqs: []
    };

    // Fetch About Us
    console.log('📖 Fetching About Us...');
    const aboutUs = await fetchAPI('/about-us');
    if (aboutUs) {
        fallbackData.aboutUs = aboutUs;
        console.log('  ✓ About Us fetched');
    }

    // Fetch Homepage
    console.log('🏠 Fetching Homepage...');
    const homepage = await fetchAPI('/homepage');
    if (homepage) {
        fallbackData.homepage = Array.isArray(homepage) ? homepage : [homepage];
        console.log(`  ✓ Homepage fetched (${fallbackData.homepage.length} components)`);
    }

    // Fetch Counters
    console.log('📊 Fetching Counters...');
    const counters = await fetchAPI('/counters');
    if (counters) {
        fallbackData.counters = counters;
        console.log('  ✓ Counters fetched');
    }

    // Fetch News (limited to 10 recent)
    console.log('📰 Fetching News...');
    const news = await fetchAPI('/news');
    if (news && Array.isArray(news)) {
        fallbackData.news = news.slice(0, 10);
        console.log(`  ✓ News fetched (${fallbackData.news.length} articles)`);
    }

    // Fetch Events (limited to 10 recent)
    console.log('📅 Fetching Events...');
    const events = await fetchAPI('/events');
    if (events && Array.isArray(events)) {
        fallbackData.events = events.slice(0, 10);
        console.log(`  ✓ Events fetched (${fallbackData.events.length} events)`);
    }

    // Fetch Projects (limited to 10 recent)
    console.log('🏗️  Fetching Projects...');
    const projects = await fetchAPI('/projects');
    if (projects && Array.isArray(projects)) {
        fallbackData.projects = projects.slice(0, 10);
        console.log(`  ✓ Projects fetched (${fallbackData.projects.length} projects)`);
    }

    // Fetch Services
    console.log('🕉️  Fetching Services...');
    const services = await fetchAPI('/services');
    if (services && Array.isArray(services)) {
        fallbackData.services = services;
        console.log(`  ✓ Services fetched (${fallbackData.services.length} services)`);
    }

    // Fetch FAQs
    console.log('❓ Fetching FAQs...');
    const faqs = await fetchAPI('/faqs');
    if (faqs && Array.isArray(faqs)) {
        fallbackData.faqs = faqs;
        console.log(`  ✓ FAQs fetched (${fallbackData.faqs.length} FAQs)`);
    }

    // Generate JavaScript file
    const jsContent = `/**
 * Fallback Content
 * Auto-generated from API on ${new Date().toLocaleString()}
 * DO NOT EDIT MANUALLY - Run 'npm run update-fallback' to regenerate
 */

const fallbackContent = ${JSON.stringify(fallbackData, null, 2)};

export default fallbackContent;
`;

    // Ensure data directory exists
    const dataDir = path.join(__dirname, '..', 'src', 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('\n📁 Created data directory');
    }

    // Write file
    try {
        fs.writeFileSync(OUTPUT_FILE, jsContent, 'utf8');
        console.log(`\n✅ Fallback content generated successfully!`);
        console.log(`📁 Location: ${OUTPUT_FILE}`);

        // Calculate file size
        const stats = fs.statSync(OUTPUT_FILE);
        const fileSizeKB = (stats.size / 1024).toFixed(2);
        console.log(`📏 File size: ${fileSizeKB} KB`);
    } catch (error) {
        console.error('\n❌ Error writing fallback content:', error.message);
        process.exit(1);
    }
}

// Run
generateFallbackContent()
    .then(() => {
        console.log('\n✅ Done!');
        console.log('\n💡 Next steps:');
        console.log('   1. Import fallbackContent in your components');
        console.log('   2. Use it as default data when API fails');
        console.log('   3. Re-run this script periodically to keep content fresh\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    });
