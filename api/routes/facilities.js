const express = require('express');
const router = express.Router();
const facilitiesService = require('../services/facilitiesService');

router.get('/', async (req, res, next) => {
  try {
    const facilities = await facilitiesService.getAll();
    res.json(facilities);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const facility = await facilitiesService.getById(id);

    if (!facility) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    res.json(facility);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const facility = await facilitiesService.create(req.body);
    res.status(201).json(facility);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const facility = await facilitiesService.update(id, req.body);
    res.json(facility);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await facilitiesService.delete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    res.json({ message: 'Facility deleted successfully', data: deleted });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
