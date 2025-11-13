const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');
const { verifyToken, requireAdmin } = require('../middleware/auth');

// GET /api/news - Get all news articles
router.get('/', async (req, res, next) => {
  try {
    const { limit } = req.query;
    const news = await newsService.getAll(limit ? parseInt(limit) : null);
    res.json(news);
  } catch (error) {
    next(error);
  }
});

// GET /api/news/featured - Get featured news
router.get('/featured', async (req, res, next) => {
  try {
    const news = await newsService.getFeatured();
    res.json(news);
  } catch (error) {
    next(error);
  }
});

// GET /api/news/category/:category - Get news by category
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const { limit } = req.query;
    const news = await newsService.getByCategory(category, limit ? parseInt(limit) : 10);
    res.json(news);
  } catch (error) {
    next(error);
  }
});

// GET /api/news/slug/:slug - Get news by slug
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const news = await newsService.getBySlug(slug);

    if (!news) {
      return res.status(404).json({ error: 'News article not found' });
    }

    res.json(news);
  } catch (error) {
    next(error);
  }
});

// GET /api/news/:id - Get news by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const news = await newsService.getById(id);

    if (!news) {
      return res.status(404).json({ error: 'News article not found' });
    }

    res.json(news);
  } catch (error) {
    next(error);
  }
});

// POST /api/news - Create new news article
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const news = await newsService.create(req.body);
    res.status(201).json(news);
  } catch (error) {
    next(error);
  }
});

// PUT /api/news/:id - Update news article
router.put('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const news = await newsService.update(id, req.body);
    res.json(news);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/news/:id - Delete news article
router.delete('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await newsService.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'News article not found' });
    }

    res.json({ message: 'News article deleted successfully', data: deleted });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
