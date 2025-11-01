const express = require('express');
const router = express.Router();
const achievementsService = require('../services/achievementsService');

router.get('/', async (req, res, next) => {
  try {
    const achievements = await achievementsService.getAll();
    res.json(achievements);
  } catch (error) {
    next(error);
  }
});

router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const achievements = await achievementsService.getByCategory(category);
    res.json(achievements);
  } catch (error) {
    next(error);
  }
});

router.get('/:year', async (req, res, next) => {
  try {
    const { year } = req.params;
    const achievement = await achievementsService.getByYear(year);

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    res.json(achievement);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const achievement = await achievementsService.create(req.body);
    res.status(201).json(achievement);
  } catch (error) {
    next(error);
  }
});

router.put('/:year', async (req, res, next) => {
  try {
    const { year } = req.params;
    const updated = await achievementsService.update(year, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

router.delete('/:year', async (req, res, next) => {
  try {
    const { year } = req.params;
    const deleted = await achievementsService.delete(year);

    if (!deleted) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    res.json({ message: 'Achievement deleted successfully', data: deleted });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
