import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRICE_IDS = {
  'early-bird': process.env.STRIPE_EARLY_BIRD_PRICE_ID,
  'pro': process.env.STRIPE_PRO_PRICE_ID,
  'team': process.env.STRIPE_TEAM_PRICE_ID
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, planId, userId, userEmail } = req.body;

  if (!email || !planId) {
    return res.status(400).json({ error: 'Email and plan ID are required' });
  }

  const priceId = PRICE_IDS[planId];
  
  if (!priceId) {
    return res.status(400).json({ error: 'Invalid plan ID' });
  }

  try {
    // Find or create customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      // Update metadata if needed
      if (!customer.metadata.kindeUserId) {
        await stripe.customers.update(customer.id, {
          metadata: { kindeUserId: userId }
        });
      }
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { kindeUserId: userId }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/batch-success?session_id={CHECKOUT_SESSION_ID}#batch-section`,
      cancel_url: `${req.headers.origin}/#batch-section`,
      customer: customer.id,
      metadata: {
        kindeUserId: userId
      }
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
