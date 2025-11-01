const express = require('express');
const router = express.Router();
const countersService = require('../services/countersService');

router.get('/', async (req, res, next) => {
  try {
    const counters = await countersService.getAll();
    res.json(counters);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const counter = await countersService.getById(id);

    if (!counter) {
      return res.status(404).json({ error: 'Counter not found' });
    }

    res.json(counter);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await countersService.update(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
