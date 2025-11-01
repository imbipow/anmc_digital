const express = require('express');
const router = express.Router();

// Import all route modules
const newsRoutes = require('./news');
const eventsRoutes = require('./events');
const projectsRoutes = require('./projects');
const facilitiesRoutes = require('./facilities');
const homepageRoutes = require('./homepage');
const countersRoutes = require('./counters');
const aboutUsRoutes = require('./aboutUs');
const contactRoutes = require('./contact');
const masterPlanRoutes = require('./masterPlan');
const achievementsRoutes = require('./achievements');
const faqsRoutes = require('./faqs');
const donationsRoutes = require('./donations');
const stripeRoutes = require('./stripe');
const membersRoutes = require('./members');

// Mount routes
router.use('/news', newsRoutes);
router.use('/events', eventsRoutes);
router.use('/projects', projectsRoutes);
router.use('/facilities', facilitiesRoutes);
router.use('/homepage', homepageRoutes);
router.use('/counters', countersRoutes);
router.use('/about-us', aboutUsRoutes);
router.use('/contact', contactRoutes);
router.use('/master-plan', masterPlanRoutes);
router.use('/achievements', achievementsRoutes);
router.use('/faqs', faqsRoutes);
router.use('/donations', donationsRoutes);
router.use('/stripe', stripeRoutes);
router.use('/members', membersRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.ENVIRONMENT || 'dev'
  });
});

module.exports = router;
