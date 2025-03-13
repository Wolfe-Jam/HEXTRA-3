import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const kindeUserId = req.headers['x-kinde-user-id'];
    if (!kindeUserId) {
      return res.status(401).json({ message: 'No user ID provided' });
    }

    // Check if customer already exists
    const customers = await stripe.customers.list({
      limit: 1,
      metadata: {
        kindeUserId: kindeUserId
      }
    });

    let customerId;
    if (customers.data.length === 0) {
      // Create a new customer
      const customer = await stripe.customers.create({
        metadata: {
          kindeUserId: kindeUserId
        }
      });
      customerId = customer.id;
    } else {
      customerId = customers.data[0].id;
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: process.env.STRIPE_EARLY_BIRD_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.REACT_APP_BASE_URL}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.REACT_APP_BASE_URL}/subscription?canceled=true`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: 'Error creating checkout session' });
  }
}