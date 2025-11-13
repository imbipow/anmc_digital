const express = require('express');
const router = express.Router();
const eventsService = require('../services/eventsService');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/events - Get all events
router.get('/', async (req, res, next) => {
  try {
    const { limit } = req.query;
    const events = await eventsService.getAll(limit ? parseInt(limit) : null);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// GET /api/events/featured - Get featured events
router.get('/featured', async (req, res, next) => {
  try {
    const events = await eventsService.getFeatured();
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// GET /api/events/upcoming - Get upcoming events
router.get('/upcoming', async (req, res, next) => {
  try {
    const events = await eventsService.getUpcoming();
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// GET /api/events/past - Get past events
router.get('/past', async (req, res, next) => {
  try {
    const { limit } = req.query;
    const events = await eventsService.getPast(limit ? parseInt(limit) : 10);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// GET /api/events/category/:category - Get events by category
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const events = await eventsService.getByCategory(category);
    res.json(events);
  } catch (error) {
    next(error);
  }
});

// GET /api/events/slug/:slug - Get event by slug
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const event = await eventsService.getBySlug(slug);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id - Get event by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventsService.getById(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    next(error);
  }
});

// POST /api/events - Create new event (PROTECTED)
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const event = await eventsService.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
});

// PUT /api/events/:id - Update event (PROTECTED)
router.put('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await eventsService.update(id, req.body);
    res.json(event);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/events/:id - Delete event (PROTECTED)
router.delete('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await eventsService.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully', data: deleted });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
