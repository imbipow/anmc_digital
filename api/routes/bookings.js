const express = require('express');
const router = express.Router();
const bookingsService = require('../services/bookingsService');
const { verifyToken, requireManager, requireMember } = require('../middleware/auth');

// Get all bookings with optional pagination (members can see their own, managers see all)
router.get('/', verifyToken, requireMember, async (req, res, next) => {
    try {
        const { memberEmail, page, limit, status, paymentStatus } = req.query;

        // If querying by member email, return their bookings
        if (memberEmail) {
            const bookings = await bookingsService.getByMemberEmail(memberEmail);
            return res.json(bookings);
        }

        // Build filters
        const filters = {};
        if (status) filters.status = status;
        if (paymentStatus) filters.paymentStatus = paymentStatus;
        if (req.query.q) filters.q = req.query.q; // Add search query to filters

        // Check if pagination is requested
        const pageNum = parseInt(page) || null;
        const limitNum = parseInt(limit) || 20;

        if (pageNum) {
            // Return paginated results
            const result = await bookingsService.getPaginated(pageNum, limitNum, filters);
            res.json(result);
        } else {
            // Return all bookings (backward compatibility)
            const bookings = await bookingsService.getAll(filters);
            res.json(bookings);
        }
    } catch (error) {
        next(error);
    }
});

// Get booking counts (lightweight, optimized for dashboard)
router.get('/counts', verifyToken, requireManager, async (req, res, next) => {
    try {
        const filters = {
            status: req.query.status
        };
        const counts = await bookingsService.getCounts(filters);
        res.json(counts);
    } catch (error) {
        next(error);
    }
});

// Get booking statistics (full stats)
router.get('/stats', verifyToken, requireManager, async (req, res, next) => {
    try {
        const stats = await bookingsService.getStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Get available slots for a date and duration (members can view to book services)
router.get('/available-slots', verifyToken, requireMember, async (req, res, next) => {
    try {
        const { date, duration } = req.query;

        if (!date || !duration) {
            return res.status(400).json({ error: 'Date and duration are required' });
        }

        const slots = await bookingsService.getAvailableSlots(date, parseFloat(duration));
        res.json(slots);
    } catch (error) {
        next(error);
    }
});

// Get single booking
router.get('/:id', verifyToken, requireManager, async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await bookingsService.getById(id);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        next(error);
    }
});

// Create new booking (members and users can create bookings)
router.post('/', verifyToken, requireMember, async (req, res, next) => {
    try {
        const bookingData = req.body;

        // Validate required fields
        const requiredFields = ['serviceId', 'serviceName', 'memberEmail', 'memberName', 'preferredDate'];
        const missingFields = requiredFields.filter(field => !bookingData[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                error: 'Missing required fields',
                missingFields
            });
        }

        const newBooking = await bookingsService.create(bookingData);
        res.status(201).json(newBooking);
    } catch (error) {
        next(error);
    }
});

// Update booking
router.put('/:id', verifyToken, requireMember, async (req, res, next) => {
    try {
        const { id } = req.params;
        const bookingData = req.body;

        // Get the existing booking to check ownership
        const existingBooking = await bookingsService.getById(id);

        if (!existingBooking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Check if user is admin/manager or booking owner
        const isManager = req.user.groups.includes('Admin') ||
                         req.user.groups.includes('ANMCMembers') ||
                         req.user.groups.includes('AnmcAdmins') ||
                         req.user.groups.includes('AnmcManagers');

        const isOwner = existingBooking.memberEmail === req.user.email;

        if (!isManager && !isOwner) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only update your own bookings'
            });
        }

        // If not a manager, restrict which fields can be updated
        if (!isManager) {
            // Regular users can only update payment-related fields
            const allowedFields = ['paymentStatus', 'paymentIntentId', 'paidAt', 'status'];
            const requestedFields = Object.keys(bookingData);
            const unauthorizedFields = requestedFields.filter(field => !allowedFields.includes(field));

            if (unauthorizedFields.length > 0) {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: `You can only update payment-related fields. Unauthorized fields: ${unauthorizedFields.join(', ')}`
                });
            }

            // Additional validation: users can only mark as paid, not unpaid
            if (bookingData.paymentStatus && bookingData.paymentStatus !== 'paid') {
                return res.status(403).json({
                    error: 'Forbidden',
                    message: 'You can only update payment status to "paid"'
                });
            }
        }

        const updatedBooking = await bookingsService.update(id, bookingData);
        res.json(updatedBooking);
    } catch (error) {
        if (error.message === 'Booking not found') {
            return res.status(404).json({ error: error.message });
        }
        next(error);
    }
});

// Delete booking
router.delete('/:id', verifyToken, requireManager, async (req, res, next) => {
    try {
        const { id } = req.params;
        await bookingsService.delete(id);
        res.json({ success: true, message: 'Booking deleted successfully' });
    } catch (error) {
        next(error);
    }
});

// Create payment intent for embedded payment form (members and users can create payment intents)
router.post('/create-payment-intent', verifyToken, requireMember, async (req, res, next) => {
    try {
        const { bookingId, amount } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ error: 'Booking ID and amount are required' });
        }

        const booking = await bookingsService.getById(bookingId);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const stripeService = require('../services/stripeService');
        const { clientSecret, paymentIntentId } = await stripeService.createPaymentIntent(
            amount,
            bookingId,
            {
                serviceName: booking.serviceName,
                memberEmail: booking.memberEmail,
                preferredDate: booking.preferredDate
            }
        );

        // Update booking with payment intent ID
        await bookingsService.update(bookingId, {
            paymentIntentId: paymentIntentId
        });

        res.json({ clientSecret, paymentIntentId });
    } catch (error) {
        next(error);
    }
});

// Create checkout session for immediate payment (members and users can create checkout sessions)
router.post('/create-checkout', verifyToken, requireMember, async (req, res, next) => {
    try {
        const { bookingId } = req.body;

        if (!bookingId) {
            return res.status(400).json({ error: 'Booking ID is required' });
        }

        const booking = await bookingsService.getById(bookingId);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const stripeService = require('../services/stripeService');
        const { url, sessionId } = await stripeService.createCheckoutSession(booking);

        // Update booking with stripe session ID
        await bookingsService.update(bookingId, {
            stripeSessionId: sessionId,
            paymentUrl: url
        });

        res.json({ url, sessionId });
    } catch (error) {
        next(error);
    }
});

// Verify payment (members and users can verify their own payments)
router.post('/verify-payment', verifyToken, requireMember, async (req, res, next) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID is required' });
        }

        const result = await bookingsService.verifyPayment(sessionId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Webhook endpoint for Stripe payment events (to be called by Stripe)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const stripeService = require('../services/stripeService');

    try {
        // Verify webhook signature and process event
        // This would need to be implemented in stripeService
        console.log('Stripe webhook received');
        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

module.exports = router;
