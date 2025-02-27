# HEXTRA Stripe Integration

## Overview

This document serves as a comprehensive guide to the Stripe payment integration in HEXTRA. The payment system has been implemented following the core design principles of the application, ensuring that it integrates seamlessly with the existing Kinde authentication while preserving all core functionality.

## Integration Strategy

The Stripe payment integration follows a discrete approach:

1. **Separate Layer Implementation**:
   - Implemented as a separate layer from core features
   - No modification to core image processing functionality
   - Strategic placement of payment gates at appropriate user journey points

2. **Subscription Model**:
   - Three-tier subscription model:
     - Early-Bird Plan ($5/month)
     - Pro Plan ($10/month)
     - Enterprise Plan ($25/month)
   - Clear presentation of features and benefits for each tier

3. **User Experience**:
   - Dedicated subscription page accessible from the main navigation
   - Smooth transition between authentication and payment flows
   - Clear indication of subscription benefits

4. **Authentication Integration**:
   - Requires authentication before accessing subscription options
   - Passes user identity to Stripe for customer management
   - Maintains session consistency throughout the subscription process

## Configuration

### Environment Variables

The following environment variables are required for Stripe integration:

```
STRIPE_EARLY_BIRD_PRICE_ID=price_abc123
STRIPE_PRO_PRICE_ID=price_def456
STRIPE_ENTERPRISE_PRICE_ID=price_ghi789
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_SECRET_KEY=sk_test_your_key
```

### Stripe Setup

1. Configure your Stripe account with the appropriate products and prices
2. Set up webhook endpoints for handling subscription events
3. Configure success and cancel URLs for the checkout process

## Implementation Details

### Subscription Page Component

The `SubscriptionPage` component serves as the main interface for users to select and purchase subscriptions.

Key features:
- Displays available subscription tiers
- Handles subscription selection
- Initiates the checkout process
- Provides informative content about subscription benefits

### Checkout Process

The checkout process is handled by the `create-checkout-session.js` API endpoint.

Key steps:
1. Verifies user authentication
2. Creates or retrieves a Stripe customer based on the user's email
3. Creates a checkout session with the selected price
4. Redirects to the Stripe-hosted checkout page
5. Handles success and cancellation redirects

```javascript
// Example of checkout session creation
const session = await stripe.checkout.sessions.create({
  customer: customerId,
  payment_method_types: ['card'],
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  mode: 'subscription',
  success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${baseUrl}/subscription`,
});
```

### Success and Cancel Handling

After checkout, users are redirected to:
- Success page: Displays subscription confirmation and next steps
- Cancel page: Returns user to the subscription page with appropriate messaging

## Payment Flow

1. User navigates to the subscription page from the main navigation
2. User reviews available subscription options and selects a plan
3. User is directed to the Stripe-hosted checkout page
4. User completes payment and is redirected to the success page
5. Stripe webhook confirms the subscription status
6. User gains access to subscription-gated features

## Subscription Management

Users can manage their subscriptions through:
1. The customer portal provided by Stripe
2. The subscription management page in the application

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**: Ensure all required Stripe environment variables are properly set.

2. **Checkout Session Creation Fails**: Check for errors in the API logs and verify that the price IDs are correct.

3. **Redirection Issues**: Verify that the success and cancel URLs are properly configured and accessible.

4. **Authentication Integration**: Ensure that the user is properly authenticated before initiating the checkout process.

## Testing

For testing the payment integration:

1. Use Stripe's test mode and test cards
2. Verify the checkout process with different subscription tiers
3. Test the success and cancel flows
4. Verify that subscribed users can access gated features

## Notes

This implementation follows the v2.3.0 integration strategy, ensuring core features remain functional while adding payment capabilities. It maintains the separation of concerns between authentication, payment, and core functionality.

---

*Note: This is a replacement document for a potentially missing original document and was created based on existing code and documentation.*
