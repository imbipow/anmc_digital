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
    memberCheckEmail: (email) => `/members/check-email?email=${encodeURIComponent(email)}`,
    memberStats: '/members/stats',
    memberSearch: (query) => `/members/search?q=${query}`,
    membersByCategory: (category) => `/members/category/${category}`,
    membersByType: (type) => `/members/type/${type}`,

    // Users (regular users, not members)
    userRegister: '/users/register',

    // Services / Anusthan
    services: '/services',
    servicesByCategory: (category) => `/services?category=${category}`,
    servicesActive: '/services?status=active',

    // Bookings
    bookings: '/bookings',
    bookingsByMember: (email) => `/bookings?memberEmail=${email}`,
    bookingStats: '/bookings/stats',
    availableSlots: (date, duration) => `/bookings/available-slots?date=${date}&duration=${duration}`,

    // Kalash Bookings
    kalashBookings: '/kalash-bookings',
    kalashBookingById: (id) => `/kalash-bookings/${id}`,
    kalashBookingStats: '/kalash-bookings/stats',
    kalashVerifyPayment: '/kalash-bookings/verify-payment',

    // Media & Documents
    media: '/media',
    mediaUpload: '/media/upload',
    mediaByFolder: (folder) => `/media?folder=${folder}`,
    documents: '/documents',
    documentsUpload: '/documents/upload',
    documentsByCategory: (category) => `/documents?category=${category}`,
    documentsByVisibility: (visibility) => `/documents?visibility=${visibility}`,

    // Subscribers & Messages
    subscribers: '/subscribers',
    subscriberUnsubscribe: '/subscribers/unsubscribe',
    subscriberStats: '/subscribers/stats',
    messages: '/messages',
    messagesContact: '/messages/contact',
    messagesBroadcast: '/messages/broadcast',
    messagesStats: '/messages/stats',
    messageMarkRead: (id) => `/messages/${id}/read`,

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
