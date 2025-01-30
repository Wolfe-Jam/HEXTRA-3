const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the customer ID from Kinde user metadata
    const customerId = req.user?.metadata?.stripeCustomerId;
    
    if (!customerId) {
      return res.status(400).json({ message: 'No Stripe customer ID found' });
    }

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.REACT_APP_BASE_URL}/dashboard`,
    });

    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ message: 'Error creating portal session' });
  }
}
