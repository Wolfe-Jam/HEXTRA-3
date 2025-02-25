import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Find customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      // No customer found with this email
      return res.status(200).json({
        isSubscribed: false,
        tier: 'free',
      });
    }

    const customer = customers.data[0];

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      expand: ['data.plan.product'],
    });

    if (subscriptions.data.length === 0) {
      // No active subscriptions
      return res.status(200).json({
        isSubscribed: false,
        tier: 'free',
      });
    }

    // Check which plan the customer is subscribed to
    let tier = 'free';
    
    for (const subscription of subscriptions.data) {
      const priceId = subscription.items.data[0].price.id;
      
      if (priceId === process.env.STRIPE_EARLY_BIRD_PRICE_ID) {
        tier = 'early-bird';
      } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
        tier = 'pro';
      } else if (priceId === process.env.STRIPE_TEAM_PRICE_ID) {
        tier = 'team';
      }
    }

    return res.status(200).json({
      isSubscribed: tier !== 'free',
      tier: tier,
      customerId: customer.id,
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return res.status(500).json({ error: 'Failed to check subscription status' });
  }
}
