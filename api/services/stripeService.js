const Stripe = require('stripe');

// Lazy-load stripe client to allow secrets to be loaded first
let stripe = null;

function getStripeClient() {
    if (!stripe) {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        if (!stripeKey) {
            throw new Error('STRIPE_SECRET_KEY not found in environment variables. Ensure secrets are loaded.');
        }
        stripe = Stripe(stripeKey);
        console.log('✅ Stripe client initialized');
    }
    return stripe;
}

/**
 * Create a Payment Intent for embedded payment form
 */
const createPaymentIntent = async (amount, bookingId, metadata = {}) => {
    try {
        const stripe = getStripeClient();
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: 'aud',
            metadata: {
                bookingId: bookingId,
                ...metadata
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        };
    } catch (error) {
        console.error('Error creating payment intent:', error);
        throw error;
    }
};

/**
 * Create a Stripe Checkout Session for booking payment
 */
const createCheckoutSession = async (bookingData) => {
    const { id, serviceName, totalAmount, memberEmail, memberName, preferredDate, startTime } = bookingData;

    try {
        const stripe = getStripeClient();
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'aud',
                        product_data: {
                            name: serviceName,
                            description: `Booking for ${new Date(preferredDate).toLocaleDateString('en-AU')} at ${startTime}`,
                        },
                        unit_amount: Math.round(totalAmount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${id}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/booking-cancelled?booking_id=${id}`,
            customer_email: memberEmail,
            client_reference_id: id,
            metadata: {
                bookingId: id,
                memberName: memberName,
                serviceName: serviceName,
                preferredDate: preferredDate,
                startTime: startTime
            }
        });

        return {
            sessionId: session.id,
            url: session.url
        };
    } catch (error) {
        console.error('Error creating Stripe checkout session:', error);
        throw error;
    }
};

/**
 * Verify Stripe payment session
 */
const verifyPaymentSession = async (sessionId) => {
    try {
        const stripe = getStripeClient();
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return {
            paid: session.payment_status === 'paid',
            bookingId: session.client_reference_id,
            paymentIntent: session.payment_intent,
            amountTotal: session.amount_total / 100, // Convert from cents
            customerEmail: session.customer_email
        };
    } catch (error) {
        console.error('Error verifying payment session:', error);
        throw error;
    }
};

/**
 * Create a refund for a booking
 */
const createRefund = async (paymentIntentId, amount, reason = 'requested_by_customer') => {
    try {
        const stripe = getStripeClient();
        const refund = await stripe.refunds.create({
            payment_intent: paymentIntentId,
            amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
            reason: reason
        });

        return {
            refundId: refund.id,
            status: refund.status,
            amount: refund.amount / 100
        };
    } catch (error) {
        console.error('Error creating refund:', error);
        throw error;
    }
};

/**
 * Retrieve payment details
 */
const getPaymentDetails = async (paymentIntentId) => {
    try {
        const stripe = getStripeClient();
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        return {
            id: paymentIntent.id,
            amount: paymentIntent.amount / 100,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            created: new Date(paymentIntent.created * 1000)
        };
    } catch (error) {
        console.error('Error retrieving payment details:', error);
        throw error;
    }
};

module.exports = {
    createPaymentIntent,
    createCheckoutSession,
    verifyPaymentSession,
    createRefund,
    getPaymentDetails
};
