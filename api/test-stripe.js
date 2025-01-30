const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  try {
    // Simple test to check if we can connect to Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      limit: 1,
    });

    res.status(200).json({ 
      success: true, 
      message: 'Successfully connected to Stripe',
      stripeConnected: true
    });
  } catch (error) {
    console.error('Stripe connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect to Stripe',
      error: error.message
    });
  }
}
