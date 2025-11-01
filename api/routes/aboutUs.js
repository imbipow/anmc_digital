const express = require('express');
const router = express.Router();
const aboutUsService = require('../services/aboutUsService');

router.get('/', async (req, res, next) => {
  try {
    const aboutUs = await aboutUsService.get();

    if (!aboutUs) {
      return res.status(404).json({ error: 'About Us content not found' });
    }

    res.json(aboutUs);
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const updated = await aboutUsService.update(req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
