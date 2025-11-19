const express = require('express');
const router = express.Router();

// Import all route modules
const newsRoutes = require('./news');
const eventsRoutes = require('./events');
const projectsRoutes = require('./projects');
const homepageRoutes = require('./homepage');
const heroSlidesRoutes = require('./heroSlides');
const countersRoutes = require('./counters');
const aboutUsRoutes = require('./aboutUs');
const contactRoutes = require('./contact');
const masterPlanRoutes = require('./masterPlan');
const achievementsRoutes = require('./achievements');
const faqsRoutes = require('./faqs');
const donationsRoutes = require('./donations');
const stripeRoutes = require('./stripe');
const membersRoutes = require('./members');
const usersRoutes = require('./users');
const servicesRoutes = require('./services');
const bookingsRoutes = require('./bookings');
const mediaRoutes = require('./media');
const documentsRoutes = require('./documents');
const subscribersRoutes = require('./subscribers');
const messagesRoutes = require('./messages');
const certificatesRoutes = require('./certificates');

// Mount routes
router.use('/subscribers', subscribersRoutes);
router.use('/messages', messagesRoutes);
router.use('/news', newsRoutes);
router.use('/events', eventsRoutes);
router.use('/projects', projectsRoutes);
router.use('/homepage', homepageRoutes);
router.use('/hero-slides', heroSlidesRoutes);
router.use('/counters', countersRoutes);
router.use('/about-us', aboutUsRoutes);
router.use('/contact', contactRoutes);
router.use('/master-plan', masterPlanRoutes);
router.use('/achievements', achievementsRoutes);
router.use('/faqs', faqsRoutes);
router.use('/donations', donationsRoutes);
router.use('/stripe', stripeRoutes);
router.use('/members', membersRoutes);
router.use('/users', usersRoutes);
router.use('/services', servicesRoutes);
router.use('/bookings', bookingsRoutes);
router.use('/media', mediaRoutes);
router.use('/documents', documentsRoutes);
router.use('/certificates', certificatesRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.ENVIRONMENT || 'dev'
  });
});

module.exports = router;
