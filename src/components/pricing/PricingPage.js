import React from 'react';
import { Box, Typography, Card, CardContent, CardActions } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import GlowTextButton from '../GlowTextButton';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const plans = [
  {
    name: 'Free',
    price: '$0',
    features: [
      'Single image processing',
      'Basic color extraction',
      'Standard support'
    ],
    buttonText: 'Get Started',
    popular: false,
    color: '#3F51B5', // Blue
    priceId: null
  },
  {
    name: 'Early Bird',
    price: '$5',
    period: '/month',
    features: [
      'Batch processing (BIG)',
      'GILDAN 6400 catalog',
      'HEXTRA 21 catalog',
      'CSV upload support',
      'Priority support'
    ],
    buttonText: 'Subscribe Now',
    popular: true,
    color: '#4CAF50', // Green
    priceId: process.env.NEXT_PUBLIC_STRIPE_EARLY_BIRD_PRICE_ID
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    features: [
      'Everything in Early Bird',
      'Advanced color analysis',
      'Custom catalogs',
      'API access',
      'Premium support'
    ],
    buttonText: 'Coming Soon',
    popular: false,
    color: '#F44336', // Red
    priceId: null,
    disabled: true
  },
];

const PricingPage = () => {
  const { isAuthenticated, login, user } = useKindeAuth();

  const handlePlanSelect = async (plan) => {
    if (!isAuthenticated) {
      login();
      return;
    }

    if (plan.disabled) {
      return; // Disabled plan (Coming Soon)
    }

    if (!plan.priceId) {
      // Free plan
      window.location.href = '/#batch-section';
      return;
    }

    // Create checkout session for paid plans
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.priceId,
          userId: user.id,
          userEmail: user.email
        }),
      });

      const session = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (error) {
        console.error('Error redirecting to checkout:', error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <Box sx={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '40px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <Typography variant="h2" sx={{ 
        mb: 2, 
        textAlign: 'center',
        color: 'inherit'
      }}>
        Welcome to HEXTRA
      </Typography>
      <Typography variant="h5" sx={{ 
        mb: 4, 
        textAlign: 'center', 
        color: 'text.secondary'
      }}>
        Choose your plan and unlock powerful batch processing
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap',
        gap: 4,
        justifyContent: 'center'
      }}>
        {plans.map((plan) => (
          <Card 
            key={plan.name}
            sx={{ 
              width: 300,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              border: plan.popular ? `2px solid ${plan.color}` : '1px solid rgba(255,255,255,0.12)',
              boxShadow: plan.popular ? `0 0 20px ${plan.color}40` : undefined,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(10px)',
              opacity: plan.disabled ? 0.7 : 1
            }}
          >
            {plan.popular && (
              <Box sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: plan.color,
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                Best Value
              </Box>
            )}
            
            <CardContent sx={{ 
              flexGrow: 1,
              borderTop: `4px solid ${plan.color}`
            }}>
              <Typography variant="h5" component="div" gutterBottom>
                {plan.name}
              </Typography>
              <Typography variant="h3" component="div" sx={{ mb: 2 }}>
                {plan.price}
                {plan.period && (
                  <Typography variant="subtitle1" component="span" sx={{ color: 'text.secondary' }}>
                    {plan.period}
                  </Typography>
                )}
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                {plan.features.map((feature) => (
                  <Typography key={feature} component="li" sx={{ mb: 1 }}>
                    {feature}
                  </Typography>
                ))}
              </Box>
            </CardContent>
            
            <CardActions sx={{ p: 2, pt: 0 }}>
              <GlowTextButton
                onClick={() => handlePlanSelect(plan)}
                variant={plan.popular ? 'contained' : 'outlined'}
                fullWidth
                disabled={plan.disabled}
                color={plan.color}
              >
                {plan.buttonText}
              </GlowTextButton>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default PricingPage;
