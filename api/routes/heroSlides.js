const express = require('express');
const router = express.Router();
const heroSlidesService = require('../services/heroSlidesService');
const { verifyToken, requireAdmin, optionalAuth } = require('../middleware/auth');

// Get all hero slides (public - for display, returns only active slides)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    // If user is admin, return all slides, otherwise only active ones
    const isAdmin = req.user && (
      req.user.groups.includes('Admin') ||
      req.user.groups.includes('ANMCMembers') ||
      req.user.groups.includes('AnmcAdmins') ||
      req.user.groups.includes('AnmcManagers')
    );

    const slides = isAdmin ? await heroSlidesService.getAll() : await heroSlidesService.getActive();
    res.json(slides);
  } catch (error) {
    next(error);
  }
});

// Get single hero slide by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const slide = await heroSlidesService.getById(id);

    if (!slide) {
      return res.status(404).json({ error: 'Hero slide not found' });
    }

    res.json(slide);
  } catch (error) {
    next(error);
  }
});

// Create new hero slide (admin only)
router.post('/', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const slideData = req.body;
    const newSlide = await heroSlidesService.create(slideData);
    res.status(201).json(newSlide);
  } catch (error) {
    next(error);
  }
});

// Update hero slide (admin only)
router.put('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedSlide = await heroSlidesService.update(id, updates);
    res.json(updatedSlide);
  } catch (error) {
    if (error.message === 'Hero slide not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// Delete hero slide (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    await heroSlidesService.delete(id);
    res.json({ success: true, message: 'Hero slide deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Reorder slides (admin only)
router.post('/reorder', verifyToken, requireAdmin, async (req, res, next) => {
  try {
    const { slideOrders } = req.body; // Array of { id, order }
    await heroSlidesService.reorder(slideOrders);
    res.json({ success: true, message: 'Slides reordered successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
