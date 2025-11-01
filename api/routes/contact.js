const express = require('express');
const router = express.Router();
const contactService = require('../services/contactService');

router.get('/', async (req, res, next) => {
  try {
    const contact = await contactService.get();

    if (!contact) {
      return res.status(404).json({ error: 'Contact information not found' });
    }

    res.json(contact);
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const updated = await contactService.update(req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
