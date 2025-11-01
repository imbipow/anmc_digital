const express = require('express');
const router = express.Router();
const donationsService = require('../services/donationsService');

// Get all donations
router.get('/', async (req, res, next) => {
  try {
    const donations = await donationsService.getAll();
    res.json(donations);
  } catch (error) {
    next(error);
  }
});

// Get donation statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await donationsService.getStats();
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Get donations by status
router.get('/status/:status', async (req, res, next) => {
  try {
    const { status } = req.params;
    const donations = await donationsService.getByStatus(status);
    res.json(donations);
  } catch (error) {
    next(error);
  }
});

// Get single donation by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const donation = await donationsService.getById(id);

    if (!donation) {
      return res.status(404).json({ error: 'Donation not found' });
    }

    res.json(donation);
  } catch (error) {
    next(error);
  }
});

// Create new donation
router.post('/', async (req, res, next) => {
  try {
    const donationData = req.body;

    // Validate required fields
    if (!donationData.firstName || !donationData.lastName) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }
    if (!donationData.email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    if (!donationData.phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    if (!donationData.amount || donationData.amount <= 0) {
      return res.status(400).json({ error: 'Valid donation amount is required' });
    }

    const newDonation = await donationsService.create(donationData);
    res.status(201).json(newDonation);
  } catch (error) {
    next(error);
  }
});

// Update donation
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedDonation = await donationsService.update(id, updates);
    res.json(updatedDonation);
  } catch (error) {
    if (error.message === 'Donation not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

// Delete donation
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedDonation = await donationsService.delete(id);
    res.json({ message: 'Donation deleted successfully', donation: deletedDonation });
  } catch (error) {
    if (error.message === 'Donation not found') {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

module.exports = router;
