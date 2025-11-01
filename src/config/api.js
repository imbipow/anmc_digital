// API Configuration
// Centralized configuration for API endpoints

const API_CONFIG = {
  // Base URL for the API
  // Change this for different environments (dev, staging, production)
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',

  // API Endpoints
  endpoints: {
    // Homepage
    homepage: '/homepage',
    counters: '/counters',

    // Content
    news: '/news',
    newsFeatured: '/news/featured',
    newsByCategory: (category) => `/news/category/${category}`,
    newsBySlug: (slug) => `/news/slug/${slug}`,

    events: '/events',
    eventsFeatured: '/events/featured',
    eventsByStatus: (status) => `/events/status/${status}`,
    eventsBySlug: (slug) => `/events/slug/${slug}`,

    projects: '/projects',
    projectsFeatured: '/projects/featured',
    projectsByStatus: (status) => `/projects/status/${status}`,
    projectsBySlug: (slug) => `/projects/slug/${slug}`,

    facilities: '/facilities',

    // About & Contact
    aboutUs: '/about-us',
    contact: '/contact',

    // FAQs
    faqs: '/faqs',
    faqsByCategory: (category) => `/faqs/category/${category}`,

    // Donations
    donations: '/donations',
    donationStats: '/donations/stats',
    donationsByStatus: (status) => `/donations/status/${status}`,

    // Members
    members: '/members',
    memberRegister: '/members/register',
    memberStats: '/members/stats',
    memberSearch: (query) => `/members/search?q=${query}`,
    membersByCategory: (category) => `/members/category/${category}`,
    membersByType: (type) => `/members/type/${type}`,

    // Other
    masterPlan: '/master-plan',
    achievements: '/achievements',
    achievementsByCategory: (category) => `/achievements/category/${category}`,

    // Health check
    health: '/health'
  },

  // Helper method to get full URL
  getURL: (endpoint) => {
    return `${API_CONFIG.baseURL}${endpoint}`;
  }
};

export default API_CONFIG;
