import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Disable body parsing, need raw body for webhook signature verification
const config = {
  api: {
    bodyParser: false,
  },
};

async export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle subscription events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        const customerId = subscription.customer;
        
        // Get customer to find Kinde user ID from metadata
        const customer = await stripe.customers.retrieve(customerId);
        const kindeUserId = customer.metadata.kindeUserId;

        console.log(`Subscription ${subscription.status} for user ${kindeUserId}`);
        break;

      case 'customer.subscription.deleted':
        const canceledSubscription = event.data.object;
        const canceledCustomerId = canceledSubscription.customer;
        
        const canceledCustomer = await stripe.customers.retrieve(canceledCustomerId);
        const canceledKindeUserId = canceledCustomer.metadata.kindeUserId;

        console.log(`Subscription canceled for user ${canceledKindeUserId}`);
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`Error processing webhook: ${err.message}`);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}