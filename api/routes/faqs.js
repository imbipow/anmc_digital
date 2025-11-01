const express = require('express');
const router = express.Router();
const faqsService = require('../services/faqsService');

// Get all FAQs (published only)
router.get('/', async (req, res, next) => {
  try {
    const faqs = await faqsService.getAll();
    res.json(faqs);
  } catch (error) {
    next(error);
  }
});

// Get FAQ categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await faqsService.getCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Get FAQs by category
router.get('/category/:category', async (req, res, next) => {
  try {
    const { category } = req.params;
    const faqs = await faqsService.getByCategory(category);
    res.json(faqs);
  } catch (error) {
    next(error);
  }
});

// Get FAQ by ID
router.get('/:id', async (req, res, next) => {
  try {
    const faq = await faqsService.getById(req.params.id);

    if (!faq) {
      return res.status(404).json({ error: 'FAQ not found' });
    }

    res.json(faq);
  } catch (error) {
    next(error);
  }
});

// Create FAQ
router.post('/', async (req, res, next) => {
  try {
    const newFaq = await faqsService.create(req.body);
    res.status(201).json(newFaq);
  } catch (error) {
    next(error);
  }
});

// Update FAQ
router.put('/:id', async (req, res, next) => {
  try {
    const updated = await faqsService.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    if (error.message === 'FAQ not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// Delete FAQ
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await faqsService.delete(req.params.id);
    res.json(deleted);
  } catch (error) {
    if (error.message === 'FAQ not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
