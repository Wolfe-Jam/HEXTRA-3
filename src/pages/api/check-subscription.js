import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const kindeUserId = req.headers['x-kinde-user-id'];
    if (!kindeUserId) {
      return res.status(401).json({ message: 'No user ID provided' });
    }

    // Find customer by Kinde user ID in metadata
    const customers = await stripe.customers.list({
      limit: 1,
      metadata: {
        kindeUserId: kindeUserId
      }
    });

    if (customers.data.length === 0) {
      return res.json({ 
        isSubscribed: false,
        tier: 'free'
      });
    }

    // Check for active subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customers.data[0].id,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      return res.json({ 
        isSubscribed: false,
        tier: 'free'
      });
    }

    // Determine subscription tier
    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    
    let tier = 'free';
    if (priceId === process.env.STRIPE_EARLY_BIRD_PRICE_ID) {
      tier = 'early-bird';
    } else if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      tier = 'pro';
    }

    res.json({ 
      isSubscribed: true,
      tier: tier,
      subscriptionId: subscription.id
    });

  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Error checking subscription' });
  }
}
