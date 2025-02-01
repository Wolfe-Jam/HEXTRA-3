import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    const { priceId, email } = req.body;
    const kindeUserId = req.headers['x-kinde-user-id'];

    console.log('Price ID:', priceId);
    console.log('Email:', email);
    console.log('Kinde User ID:', kindeUserId);

    if (!kindeUserId) {
      return res.status(401).json({ message: 'No user ID provided' });
    }

    if (!priceId) {
      return res.status(400).json({ message: 'No price ID provided' });
    }

    console.log('Creating Stripe session...');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/batch-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/batch`,
      customer_email: email,
      metadata: {
        kindeUserId
      }
    });

    console.log('Stripe session created:', session);
    res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ message: 'Error creating checkout session', error: error.message });
  }
}
