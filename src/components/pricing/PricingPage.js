import React from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import GlowText from '../GlowText';

const plans = [
  {
    name: 'Free',
    price: '$0',
    features: [
      'Basic color extraction',
      'Limited palettes',
      'Standard support'
    ],
    buttonText: 'Get Started',
    popular: false
  },
  {
    name: 'Pro',
    price: '$10',
    period: '/month',
    features: [
      'Advanced color analysis',
      'Unlimited palettes',
      'Priority support',
      'API access',
      'Custom exports'
    ],
    buttonText: 'Upgrade to Pro',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Everything in Pro',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Team management'
    ],
    buttonText: 'Contact Sales',
    popular: false
  }
];

const PricingPage = () => {
  const { isAuthenticated, login } = useKindeAuth();

  const handlePlanSelect = (plan) => {
    if (!isAuthenticated) {
      login();
      return;
    }
    // TODO: Implement Stripe checkout
    console.log('Selected plan:', plan.name);
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
      <Typography variant="h2" sx={{ mb: 4, textAlign: 'center' }}>
        Choose Your Plan
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
              border: plan.popular ? '2px solid #FED141' : '1px solid rgba(0,0,0,0.12)',
              boxShadow: plan.popular ? '0 0 20px rgba(254, 209, 65, 0.2)' : undefined
            }}
          >
            {plan.popular && (
              <Box sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                backgroundColor: '#FED141',
                color: '#000',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                Popular
              </Box>
            )}
            
            <CardContent sx={{ flexGrow: 1 }}>
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
              <GlowText
                onClick={() => handlePlanSelect(plan)}
                variant={plan.popular ? 'contained' : 'outlined'}
                sx={{ width: '100%' }}
              >
                {plan.buttonText}
              </GlowText>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default PricingPage;
