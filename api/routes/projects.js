const express = require('express');
const router = express.Router();
const projectsService = require('../services/projectsService');

// GET /api/projects
router.get('/', async (req, res, next) => {
  try {
    const { limit } = req.query;
    const projects = await projectsService.getAll(limit ? parseInt(limit) : null);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/featured
router.get('/featured', async (req, res, next) => {
  try {
    const projects = await projectsService.getFeatured();
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/status/:status
router.get('/status/:status', async (req, res, next) => {
  try {
    const { status } = req.params;
    const projects = await projectsService.getByStatus(status);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/category/:category
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const projects = await projectsService.getByCategory(category);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/slug/:slug
router.get('/slug/:slug', async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await projectsService.getBySlug(slug);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// GET /api/projects/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await projectsService.getById(id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
});

// POST /api/projects
router.post('/', async (req, res, next) => {
  try {
    const project = await projectsService.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await projectsService.update(id, req.body);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await projectsService.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully', data: deleted });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
