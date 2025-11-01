const express = require('express');
const router = express.Router();
const homepageService = require('../services/homepageService');

router.get('/', async (req, res, next) => {
  try {
    const homepage = await homepageService.getAll();
    res.json(homepage);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const content = await homepageService.getById(id);

    if (!content) {
      return res.status(404).json({ error: 'Homepage content not found' });
    }

    res.json(content);
  } catch (error) {
    next(error);
  }
});

router.get('/component/:component', async (req, res, next) => {
  try {
    const { component } = req.params;
    const content = await homepageService.getByComponent(component);

    if (!content) {
      return res.status(404).json({ error: 'Component not found' });
    }

    res.json(content);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await homepageService.update(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
