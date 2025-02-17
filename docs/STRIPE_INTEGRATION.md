# Stripe Integration in HEXTRA

## Overview
HEXTRA uses Stripe for payment processing with two subscription tiers:
1. Early Bird Price (price_1Qmnv12KJ00ahaMqNsdpkluL)
2. Pro Price (price_1Qmo2h2KJ00ahaMqRaxaYjka)

## Configuration

### Environment Variables
```javascript
// Stripe API Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key

// Product Price IDs
STRIPE_EARLY_BIRD_PRICE_ID=price_1Qmnv12KJ00ahaMqNsdpkluL
STRIPE_PRO_PRICE_ID=price_1Qmo2h2KJ00ahaMqRaxaYjka

// Webhook Configuration
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Integration Flow

### 1. Subscription Check
```
User logs in with Kinde
↓
App checks subscription status
↓
Enable/disable batch processing based on status
```

### 2. Payment Flow
```
User clicks Subscribe
↓
Create Stripe checkout session
↓
Redirect to Stripe payment page
↓
Complete payment
↓
Webhook notification
↓
Update user's subscription status
```

## Implementation Details

### 1. Subscription Check Component
```javascript
// SubscriptionCheck.js
export default function SubscriptionCheck({ children }) {
  const { isAuthenticated, user } = useKindeAuth();
  
  // Check subscription status
  fetch('/api/check-subscription', {
    headers: {
      'x-kinde-user-id': user.id
    }
  })
}
```

### 2. Stripe API Endpoints
```javascript
// stripe-api.js
const BASE_URL = 'https://www.hextra.io';

// Create checkout session
export const createCheckoutSession = async (userId) => {
  const response = await fetch(`${BASE_URL}/api/create-checkout-session`...);
  return response.json();
};

// Check subscription status
export const checkSubscription = async (userId) => {
  const response = await fetch(`${BASE_URL}/api/check-subscription`...);
  return response.json();
};
```

### 3. Webhook Handler
```javascript
// stripe-webhook.js
export default async function handler(req, res) {
  // Verify webhook signature
  const event = stripe.webhooks.constructEvent(
    buf, 
    sig, 
    webhookSecret
  );

  // Handle subscription events
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      // Update subscription status
      break;
  }
}
```

## Testing

### Local Development
1. Use Stripe test keys
2. Test webhook using Stripe CLI
3. Verify subscription status updates

### Production
1. Use production keys
2. Configure webhook endpoint: https://www.hextra.io/api/stripe-webhook
3. Monitor webhook events in Stripe Dashboard

## Subscription Tiers

### Early Bird
- Price ID: price_1Qmnv12KJ00ahaMqNsdpkluL
- Features:
  - Batch processing
  - Priority support

### Pro
- Price ID: price_1Qmo2h2KJ00ahaMqRaxaYjka
- Features:
  - All Early Bird features
  - Advanced options
  - Premium support

## Troubleshooting

Common issues and solutions:

1. **Webhook Failures**
   - Check webhook signature
   - Verify webhook secret
   - Monitor Stripe dashboard for failed events

2. **Subscription Status Not Updating**
   - Check webhook delivery
   - Verify user ID mapping
   - Check database updates

3. **Payment Flow Issues**
   - Verify price IDs
   - Check redirect URLs
   - Test with Stripe test cards
