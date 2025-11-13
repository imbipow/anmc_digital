const express = require('express');
const router = express.Router();

// Lazy-load Stripe client to allow secrets to be loaded first
let stripe = null;

function getStripeClient() {
    if (!stripe) {
        const stripeKey = process.env.STRIPE_SECRET_KEY;

        if (!stripeKey || stripeKey === 'sk_test_your_secret_key_here') {
            throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in environment variables.');
        }

        const Stripe = require('stripe');
        stripe = Stripe(stripeKey);
        console.log('✅ Stripe client initialized in routes');
    }
    return stripe;
}

// Create payment intent
router.post('/create-payment-intent', async (req, res, next) => {
  try {
    const stripe = getStripeClient();

    const { amount, currency = 'aud', metadata = {} } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    next(error);
  }
});

// Verify payment
router.post('/verify-payment', async (req, res, next) => {
  try {
    const stripe = getStripeClient();

    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    next(error);
  }
});

module.exports = router;
