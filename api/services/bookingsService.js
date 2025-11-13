const dynamoDBService = require('./dynamodb');
const config = require('../config');
const emailService = require('./emailService');
const stripeService = require('./stripeService');

class BookingsService {
    constructor() {
        this.tableName = config.tables.bookings;
        this.servicesTable = config.tables.services;
    }

    // Get all bookings
    async getAll() {
        const bookings = await dynamoDBService.getAllItems(this.tableName);
        return bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Get booking by ID
    async getById(id) {
        return await dynamoDBService.getItem(this.tableName, { id });
    }

    // Get bookings by member email
    async getByMemberEmail(memberEmail) {
        return await dynamoDBService.queryByIndex(
            this.tableName,
            'MemberEmailIndex',
            'memberEmail = :email',
            {
                ':email': memberEmail
            },
            false // descending order
        );
    }

    // Get bookings for a specific date
    async getBookingsByDate(date) {
        const bookings = await this.getAll();
        const dateStr = new Date(date).toISOString().split('T')[0];

        return bookings.filter(booking => {
            if (booking.status === 'cancelled') return false;
            const bookingDateStr = new Date(booking.preferredDate).toISOString().split('T')[0];
            return bookingDateStr === dateStr;
        });
    }

    // Check if time slot is available
    async checkSlotAvailability(date, startTime, duration) {
        const bookings = await this.getBookingsByDate(date);

        // Parse the requested slot times
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const requestedStart = startHour * 60 + startMinute; // minutes from midnight
        const requestedEnd = requestedStart + (duration * 60); // duration is in hours

        // Check each existing booking for overlap
        for (const booking of bookings) {
            const [bookingHour, bookingMinute] = booking.startTime.split(':').map(Number);
            const bookingStart = bookingHour * 60 + bookingMinute;
            const bookingEnd = bookingStart + (booking.serviceDuration * 60);

            // Check for overlap
            if (
                (requestedStart >= bookingStart && requestedStart < bookingEnd) ||
                (requestedEnd > bookingStart && requestedEnd <= bookingEnd) ||
                (requestedStart <= bookingStart && requestedEnd >= bookingEnd)
            ) {
                return {
                    available: false,
                    conflictingBooking: booking
                };
            }
        }

        return { available: true };
    }

    // Get available slots for a date
    async getAvailableSlots(date, duration) {
        const bookings = await this.getBookingsByDate(date);
        const slots = this.generateTimeSlots(duration);

        // Mark slots as unavailable if they conflict with existing bookings
        const availableSlots = [];

        for (const slot of slots) {
            const availability = await this.checkSlotAvailability(date, slot.startTime, duration);
            if (availability.available) {
                availableSlots.push(slot);
            }
        }

        return availableSlots;
    }

    // Generate time slots for a day (8am-12pm and 5pm-9pm)
    generateTimeSlots(serviceDuration) {
        const slots = [];
        const durationHours = serviceDuration;

        // For services 6 hours or longer, offer special extended slots
        if (durationHours >= 6) {
            // Full day slots that can use both morning and evening
            // Option 1: Start at 8 AM (8 AM - 2 PM for 6 hours)
            slots.push({
                startTime: '08:00',
                endTime: '14:00',
                display: '8:00 AM - 2:00 PM (Full Day)'
            });

            // Option 2: Start at 9 AM (9 AM - 3 PM for 6 hours)
            slots.push({
                startTime: '09:00',
                endTime: '15:00',
                display: '9:00 AM - 3:00 PM (Full Day)'
            });

            // Option 3: Start at 10 AM (10 AM - 4 PM for 6 hours)
            slots.push({
                startTime: '10:00',
                endTime: '16:00',
                display: '10:00 AM - 4:00 PM (Full Day)'
            });

            // Option 4: Start at 11 AM (11 AM - 5 PM for 6 hours)
            slots.push({
                startTime: '11:00',
                endTime: '17:00',
                display: '11:00 AM - 5:00 PM (Full Day)'
            });
        } else if (durationHours > 4) {
            // For services between 4-6 hours, offer extended morning slots
            // Morning extended: 8:00 AM to 1:00 PM (5 hours available)
            this.addSlotsForRange(slots, 8, 13, serviceDuration);

            // Evening extended: 4:00 PM to 9:00 PM (5 hours available)
            this.addSlotsForRange(slots, 16, 21, serviceDuration);
        } else {
            // For services 4 hours or less, use standard windows
            // Morning slots: 8:00 AM to 12:00 PM
            this.addSlotsForRange(slots, 8, 12, serviceDuration);

            // Evening slots: 5:00 PM to 9:00 PM
            this.addSlotsForRange(slots, 17, 21, serviceDuration);
        }

        return slots;
    }

    // Helper to add slots for a time range
    addSlotsForRange(slots, startHour, endHour, serviceDuration) {
        const durationMinutes = serviceDuration * 60;
        const rangeStartMinutes = startHour * 60;
        const rangeEndMinutes = endHour * 60;

        // Generate non-overlapping slots by incrementing by the service duration
        for (let currentMinutes = rangeStartMinutes; currentMinutes < rangeEndMinutes; currentMinutes += durationMinutes) {
            const slotEndMinutes = currentMinutes + durationMinutes;

            // Check if this slot fits completely within the available time range
            if (slotEndMinutes <= rangeEndMinutes) {
                const startHourCalc = Math.floor(currentMinutes / 60);
                const startMinute = currentMinutes % 60;
                const endHourCalc = Math.floor(slotEndMinutes / 60);
                const endMinute = slotEndMinutes % 60;

                const startTime = `${startHourCalc.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
                const endTime = `${endHourCalc.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

                // Format display time
                const formatTime = (h, m) => {
                    const period = h >= 12 ? 'PM' : 'AM';
                    const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
                    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
                };

                slots.push({
                    startTime,
                    endTime,
                    display: `${formatTime(startHourCalc, startMinute)} - ${formatTime(endHourCalc, endMinute)}`
                });
            }
        }

        return slots;
    }

    // Get cleaning fee service
    async getCleaningFee() {
        const services = await dynamoDBService.getAllItems(this.servicesTable);
        return services.find(s =>
            s.category === 'service' &&
            s.anusthanName.toLowerCase().includes('cleaning')
        );
    }

    // Calculate total amount including cleaning fee if needed
    async calculateTotalAmount(serviceAmount, numberOfPeople) {
        let total = serviceAmount;
        let cleaningFeeApplied = false;
        let cleaningFeeAmount = 0;

        // Add cleaning fee if more than 21 attendees
        if (numberOfPeople > 21) {
            const cleaningFee = await this.getCleaningFee();
            if (cleaningFee) {
                cleaningFeeAmount = cleaningFee.amount;
                total += cleaningFeeAmount;
                cleaningFeeApplied = true;
            }
        }

        return {
            serviceAmount,
            cleaningFeeApplied,
            cleaningFeeAmount,
            totalAmount: total
        };
    }

    // Create new booking
    async create(bookingData) {
        // Check slot availability
        const availability = await this.checkSlotAvailability(
            bookingData.preferredDate,
            bookingData.startTime,
            bookingData.serviceDuration
        );

        if (!availability.available) {
            throw new Error('Selected time slot is not available. Please choose another time.');
        }

        // Calculate total with cleaning fee if applicable
        const pricing = await this.calculateTotalAmount(
            bookingData.serviceAmount,
            bookingData.numberOfPeople
        );

        const newBooking = {
            id: Date.now().toString(),
            ...bookingData,
            ...pricing,
            status: bookingData.status || 'pending',
            paymentStatus: 'unpaid',
            paymentIntentId: null,
            stripeSessionId: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        await dynamoDBService.putItem(this.tableName, newBooking);

        // Send email notifications (non-blocking)
        try {
            await Promise.all([
                emailService.sendBookingRequestEmail(newBooking),
                emailService.sendBookingNotificationToAdmin(newBooking)
            ]);
        } catch (emailError) {
            console.error('Error sending booking emails:', emailError);
            // Don't throw error - booking should still be created even if emails fail
        }

        return newBooking;
    }

    // Update booking
    async update(id, bookingData) {
        // If time slot is being changed, check availability
        if (bookingData.preferredDate && bookingData.startTime) {
            const availability = await this.checkSlotAvailability(
                bookingData.preferredDate,
                bookingData.startTime,
                bookingData.serviceDuration
            );

            if (!availability.available && availability.conflictingBooking?.id !== id) {
                throw new Error('Selected time slot is not available. Please choose another time.');
            }
        }

        // Recalculate pricing if number of people changed
        if (bookingData.numberOfPeople) {
            const currentBooking = await this.getById(id);
            const pricing = await this.calculateTotalAmount(
                currentBooking.serviceAmount,
                bookingData.numberOfPeople
            );
            Object.assign(bookingData, pricing);
        }

        const currentBooking = await this.getById(id);
        const previousStatus = currentBooking.status;

        const updateData = {
            ...bookingData,
            updatedAt: new Date().toISOString()
        };

        await dynamoDBService.updateItem(this.tableName, { id }, updateData);
        const updatedBooking = await this.getById(id);

        // If status changed from 'pending' to 'confirmed', create payment session and send confirmation email
        if (previousStatus === 'pending' && bookingData.status === 'confirmed') {
            try {
                // Create Stripe checkout session
                const { url: paymentUrl, sessionId } = await stripeService.createCheckoutSession(updatedBooking);

                // Update booking with stripe session ID
                await dynamoDBService.updateItem(this.tableName, { id }, {
                    stripeSessionId: sessionId,
                    paymentUrl: paymentUrl
                });

                // Send confirmation email with payment link
                await emailService.sendBookingConfirmationEmail(updatedBooking, paymentUrl);

                updatedBooking.stripeSessionId = sessionId;
                updatedBooking.paymentUrl = paymentUrl;
            } catch (error) {
                console.error('Error processing booking approval:', error);
                // Don't throw - booking approval should succeed even if payment/email fails
            }
        }

        return updatedBooking;
    }

    // Delete booking
    async delete(id) {
        await dynamoDBService.deleteItem(this.tableName, { id });
        return { success: true };
    }

    // Verify payment and update booking
    async verifyPayment(sessionId) {
        try {
            const paymentInfo = await stripeService.verifyPaymentSession(sessionId);

            if (paymentInfo.paid) {
                const booking = await this.getById(paymentInfo.bookingId);

                await dynamoDBService.updateItem(this.tableName, { id: paymentInfo.bookingId }, {
                    paymentStatus: 'paid',
                    paymentIntentId: paymentInfo.paymentIntent,
                    paidAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

                const updatedBooking = await this.getById(paymentInfo.bookingId);

                // Send payment success email
                try {
                    await emailService.sendPaymentSuccessEmail(updatedBooking);
                } catch (emailError) {
                    console.error('Error sending payment success email:', emailError);
                }

                return {
                    success: true,
                    booking: updatedBooking
                };
            } else {
                return {
                    success: false,
                    message: 'Payment not completed'
                };
            }
        } catch (error) {
            console.error('Error verifying payment:', error);
            throw error;
        }
    }

    // Get booking statistics
    async getStats() {
        const bookings = await this.getAll();

        return {
            total: bookings.length,
            pending: bookings.filter(b => b.status === 'pending').length,
            confirmed: bookings.filter(b => b.status === 'confirmed').length,
            completed: bookings.filter(b => b.status === 'completed').length,
            cancelled: bookings.filter(b => b.status === 'cancelled').length,
            paid: bookings.filter(b => b.paymentStatus === 'paid').length,
            unpaid: bookings.filter(b => b.paymentStatus === 'unpaid').length
        };
    }
}

module.exports = new BookingsService();
