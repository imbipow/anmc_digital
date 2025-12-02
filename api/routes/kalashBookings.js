const express = require('express');
const router = express.Router();
const kalashBookingsService = require('../services/kalashBookingsService');

// Get all Kalash bookings
router.get('/', async (req, res, next) => {
    try {
        const bookings = await kalashBookingsService.getAll();
        res.json(bookings);
    } catch (error) {
        next(error);
    }
});

// Get Kalash booking statistics
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await kalashBookingsService.getStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Get single Kalash booking
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await kalashBookingsService.getById(id);

        if (!booking) {
            return res.status(404).json({ error: 'Kalash booking not found' });
        }

        res.json(booking);
    } catch (error) {
        next(error);
    }
});

// Create new Kalash booking and get payment intent
router.post('/', async (req, res, next) => {
    try {
        const bookingData = req.body;
        const result = await kalashBookingsService.create(bookingData);
        res.status(201).json(result);
    } catch (error) {
        if (error.message.includes('Invalid number of Kalash') ||
            error.message.includes('All fields are required')) {
            return res.status(400).json({ error: error.message });
        }
        next(error);
    }
});

// Verify payment for Kalash booking
router.post('/verify-payment', async (req, res, next) => {
    try {
        const { paymentIntentId } = req.body;

        if (!paymentIntentId) {
            return res.status(400).json({ error: 'Payment intent ID is required' });
        }

        const result = await kalashBookingsService.verifyPayment(paymentIntentId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Update Kalash booking
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const bookingData = req.body;

        const updatedBooking = await kalashBookingsService.update(id, bookingData);

        if (!updatedBooking) {
            return res.status(404).json({ error: 'Kalash booking not found' });
        }

        res.json(updatedBooking);
    } catch (error) {
        next(error);
    }
});

// Delete Kalash booking
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        await kalashBookingsService.delete(id);
        res.json({ success: true, message: 'Kalash booking deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
