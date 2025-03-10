# HEXTRA Subscription System

This document provides instructions for setting up and using the HEXTRA subscription system.

## Overview

The subscription system integrates Kinde authentication with Stripe payments to provide a seamless subscription experience for HEXTRA users. The system includes:

- User authentication via Kinde
- Subscription management via Stripe
- Feature gating based on subscription status
- Subscription status checking

## Setup Instructions

### 1. Environment Variables

Copy the variables from `.env.example.subscription` to your `.env` file and update them with your actual values:

```
# Base URL
REACT_APP_BASE_URL=https://your-app-url.com

# Kinde Auth Configuration
REACT_APP_KINDE_CLIENT_ID=your_client_id
REACT_APP_KINDE_DOMAIN=https://your-domain.kinde.com
REACT_APP_KINDE_REDIRECT_URI=https://your-app-url.com/api/auth/kinde/callback
REACT_APP_KINDE_LOGOUT_URI=https://your-app-url.com

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_EARLY_BIRD_PRICE_ID=price_1Qmnv12KJ00ahaMqNsdpkluL
STRIPE_PRO_PRICE_ID=price_1Qmo2h2KJ00ahaMqRaxaYjka
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 2. Stripe Setup

1. Create a Stripe account if you don't have one: https://dashboard.stripe.com/register
2. Create subscription products and pricing plans in the Stripe dashboard
3. Update the `STRIPE_EARLY_BIRD_PRICE_ID` and `STRIPE_PRO_PRICE_ID` in your `.env` file with the actual price IDs from Stripe
4. Set up a webhook in the Stripe dashboard to point to your webhook endpoint: `https://your-app-url.com/api/stripe-webhook`
5. Get the webhook secret from Stripe and add it to your `.env` file

### 3. Kinde Setup

1. Make sure your Kinde application is configured correctly
2. Verify that the redirect URI is set to: `https://your-app-url.com/api/auth/kinde/callback`
3. Ensure the logout URI is set to your base URL

## Usage

### Accessing the Subscription Page

Users can access the subscription page by:
1. Clicking on their profile icon in the top right corner of the app
2. Navigating directly to `/subscription`

### Protecting Features with Subscription Check

To protect a feature behind a subscription paywall, wrap it with the `SubscriptionCheck` component:

```jsx
import SubscriptionCheck from './components/SubscriptionCheck';

// In your component:
<SubscriptionCheck>
  {/* Your premium feature here */}
  <PremiumFeature />
</SubscriptionCheck>
```

### Checking Subscription Status

To check if a user is subscribed in your code:

```jsx
import { useState, useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

function YourComponent() {
  const { isAuthenticated, user } = useKindeAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetch('/api/check-subscription', {
        headers: {
          'x-kinde-user-id': user.id
        }
      })
      .then(res => res.json())
      .then(data => {
        setIsSubscribed(data.isSubscribed);
      });
    }
  }, [isAuthenticated, user]);
  
  // Use isSubscribed in your component
}
```

## Troubleshooting

### Common Issues

1. **Webhook Errors**: Make sure your webhook secret is correctly set in your `.env` file and that your webhook endpoint is accessible from the internet.

2. **Authentication Issues**: Verify that your Kinde configuration is correct and that the redirect URI is properly set.

3. **Subscription Not Recognized**: Check that the Stripe customer is correctly linked to the Kinde user ID in the metadata.

### Testing

For testing purposes, you can use Stripe's test mode and test credit cards:
- Test card number: `4242 4242 4242 4242`
- Expiration date: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

## Support

If you encounter any issues with the subscription system, please contact support at support@hextra.io.
