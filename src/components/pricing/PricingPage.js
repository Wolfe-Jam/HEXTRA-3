import React from 'react';
import { Box, Typography, Card, CardContent, CardActions } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import GlowTextButton from '../GlowTextButton';

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
];

const PricingPage = () => {
  const { login } = useKindeAuth();

  const handlePlanSelect = (plan) => {
    login();
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
        color: 'rgba(255, 255, 255, 0.7)'
      }}>
        Choose your plan and start creating amazing designs
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
              boxShadow: plan.popular ? '0 0 20px rgba(254, 209, 65, 0.2)' : undefined,
              background: 'linear-gradient(145deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
              backdropFilter: 'blur(10px)'
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
              <GlowTextButton
                onClick={() => handlePlanSelect(plan)}
                variant={plan.popular ? 'contained' : 'outlined'}
                fullWidth
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
