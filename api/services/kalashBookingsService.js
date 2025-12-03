const dynamoDBService = require('./dynamodb');
const config = require('../config');
const emailService = require('./emailService');
const stripeService = require('./stripeService');

class KalashBookingsService {
    constructor() {
        this.tableName = config.tables.bookings; // Using same bookings table with type field
    }

    // Kalash pricing
    static KALASH_PRICES = {
        1: 111,
        2: 151
    };

    // Maximum total Kalash inventory (across all bookings)
    static MAX_TOTAL_KALASH = 700;

    // Calculate price based on quantity
    static calculatePrice(numberOfKalash) {
        const qty = parseInt(numberOfKalash);
        return this.KALASH_PRICES[qty] || this.KALASH_PRICES[1];
    }

    // Get all Kalash bookings
    async getAll() {
        const bookings = await dynamoDBService.getAllItems(this.tableName);
        // Filter only Kalash bookings
        const kalashBookings = bookings.filter(b => b.bookingType === 'kalash');
        return kalashBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Get Kalash booking by ID
    async getById(id) {
        const booking = await dynamoDBService.getItem(this.tableName, { id });
        if (booking && booking.bookingType === 'kalash') {
            return booking;
        }
        return null;
    }

    // Calculate total amount based on number of Kalash
    calculateAmount(numberOfKalash) {
        const numKalash = parseInt(numberOfKalash);

        if (numKalash !== 1 && numKalash !== 2) {
            throw new Error('Invalid number of Kalash. Please select 1 or 2.');
        }

        return KalashBookingsService.calculatePrice(numKalash);
    }

    // Check remaining Kalash inventory
    async getRemainingInventory() {
        const stats = await this.getStats();
        const totalSold = stats.totalKalashSold || 0;
        const remaining = KalashBookingsService.MAX_TOTAL_KALASH - totalSold;
        return {
            total: KalashBookingsService.MAX_TOTAL_KALASH,
            sold: totalSold,
            remaining: Math.max(0, remaining),
            available: remaining > 0
        };
    }

    // Create new Kalash booking with payment intent
    async create(bookingData) {
        const { numberOfKalash, name, email, phone } = bookingData;

        // Validate required fields
        if (!numberOfKalash || !name || !email || !phone) {
            throw new Error('All fields are required: numberOfKalash, name, email, phone');
        }

        // Check inventory availability
        const inventory = await this.getRemainingInventory();
        if (!inventory.available || inventory.remaining < parseInt(numberOfKalash)) {
            throw new Error(`Sorry, only ${inventory.remaining} Kalash remaining. Maximum total inventory is ${KalashBookingsService.MAX_TOTAL_KALASH}.`);
        }

        // Calculate amount
        const amount = this.calculateAmount(numberOfKalash);

        // Generate booking ID
        const bookingId = `KALASH-${Date.now()}`;

        // Create payment intent
        const { clientSecret, paymentIntentId } = await stripeService.createPaymentIntent(
            amount,
            bookingId,
            {
                bookingType: 'kalash',
                numberOfKalash: numberOfKalash.toString(),
                customerName: name,
                customerEmail: email,
                customerPhone: phone
            }
        );

        // Create booking record
        const newBooking = {
            id: bookingId,
            bookingType: 'kalash',
            numberOfKalash: parseInt(numberOfKalash),
            name,
            email,
            phone,
            amount,
            paymentStatus: 'pending',
            paymentIntentId,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await dynamoDBService.putItem(this.tableName, newBooking);

        // Send admin notification email (non-blocking)
        try {
            await emailService.sendKalashBookingNotificationToAdmin(newBooking);
        } catch (emailError) {
            console.error('Error sending Kalash booking admin notification:', emailError);
            // Don't throw - booking should still be created even if email fails
        }

        return {
            booking: newBooking,
            clientSecret
        };
    }

    // Verify payment and update booking
    async verifyPayment(paymentIntentId) {
        try {
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

            if (paymentIntent.status === 'succeeded') {
                const bookingId = paymentIntent.metadata.bookingId;
                const booking = await this.getById(bookingId);

                if (!booking) {
                    throw new Error('Booking not found');
                }

                // Update booking status
                await dynamoDBService.updateItem(this.tableName, { id: bookingId }, {
                    paymentStatus: 'paid',
                    status: 'confirmed',
                    paidAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

                const updatedBooking = await this.getById(bookingId);

                // Send confirmation email
                try {
                    await emailService.sendKalashBookingConfirmation(updatedBooking);
                } catch (emailError) {
                    console.error('Error sending Kalash booking confirmation email:', emailError);
                }

                return {
                    success: true,
                    booking: updatedBooking
                };
            } else {
                return {
                    success: false,
                    message: 'Payment not completed',
                    status: paymentIntent.status
                };
            }
        } catch (error) {
            console.error('Error verifying Kalash payment:', error);
            throw error;
        }
    }

    // Update booking
    async update(id, bookingData) {
        const updateData = {
            ...bookingData,
            updatedAt: new Date().toISOString()
        };

        await dynamoDBService.updateItem(this.tableName, { id }, updateData);
        return await this.getById(id);
    }

    // Delete booking
    async delete(id) {
        await dynamoDBService.deleteItem(this.tableName, { id });
        return { success: true };
    }

    // Get booking statistics
    async getStats() {
        const bookings = await this.getAll();
        const paidBookings = bookings.filter(b => b.paymentStatus === 'paid');

        return {
            total: bookings.length,
            pending: bookings.filter(b => b.status === 'pending').length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            paid: paidBookings.length,
            unpaid: bookings.filter(b => b.paymentStatus === 'pending').length,
            totalKalash: bookings.reduce((sum, b) => sum + (b.numberOfKalash || 0), 0),
            totalKalashSold: paidBookings.reduce((sum, b) => sum + (b.numberOfKalash || 0), 0),
            totalRevenue: paidBookings.reduce((sum, b) => sum + (b.amount || 0), 0),
            maxInventory: KalashBookingsService.MAX_TOTAL_KALASH,
            remainingInventory: Math.max(0, KalashBookingsService.MAX_TOTAL_KALASH - paidBookings.reduce((sum, b) => sum + (b.numberOfKalash || 0), 0))
        };
    }
}

module.exports = new KalashBookingsService();
