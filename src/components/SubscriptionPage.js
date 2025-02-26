import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import GlowButton from './GlowButton';

export default function SubscriptionPage() {
  const { isAuthenticated, user, login } = useKindeAuth();

  // Simple subscription plans data
  const plans = [
    {
      name: 'Early-Bird Plan',
      price: '$5/month',
      features: [
        'Unlimited batch processing',
        'Priority support',
        'Early access to new features'
      ]
    },
    {
      name: 'Pro Plan',
      price: '$10/month',
      features: [
        'Everything in Early-Bird',
        'Advanced color management',
        'Custom export options',
        'Dedicated support'
      ]
    }
  ];

  // Mock subscription status - in production this would come from your API
  const mockSubscriptionStatus = {
    isSubscribed: false,
    tier: 'free'
  };

  // Handle subscription button click
  const handleSubscribe = (planName) => {
    if (!isAuthenticated) {
      login();
      return;
    }
    
    console.log(`Subscribing to ${planName}`);
    // In production, this would redirect to Stripe checkout
    alert(`This would redirect to Stripe checkout for ${planName}`);
  };

  return (
    <Box sx={{ 
      padding: '40px 20px',
      maxWidth: '1000px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 200px)'
    }}>
      <Typography 
        variant="h3" 
        component="h1" 
        sx={{ 
          mb: 4, 
          textAlign: 'center',
          color: 'var(--text-primary)',
          fontWeight: 600
        }}
      >
        HEXTRA Subscription
      </Typography>
      
      {!isAuthenticated ? (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            bgcolor: 'var(--background-paper)',
            borderRadius: 2
          }}
        >
          <Typography variant="h5" sx={{ mb: 3 }}>
            Sign in to manage your subscription
          </Typography>
          <Typography sx={{ mb: 4 }}>
            Access premium features like batch processing with a HEXTRA subscription.
          </Typography>
          <GlowButton onClick={login}>
            Sign In
          </GlowButton>
        </Paper>
      ) : (
        <>
          {/* Subscription Status */}
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              mb: 4,
              bgcolor: 'var(--background-paper)',
              borderRadius: 2
            }}
          >
            <Typography variant="h5" sx={{ mb: 3 }}>
              Subscription Status
            </Typography>
            
            {mockSubscriptionStatus.isSubscribed ? (
              <Box sx={{ p: 2, bgcolor: 'rgba(0, 128, 94, 0.1)', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ color: '#00805E', fontWeight: 600 }}>
                  Active Subscription
                </Typography>
                <Typography>
                  Plan: {mockSubscriptionStatus.tier === 'early-bird' ? 'Early-Bird' : 'Pro'} Plan
                </Typography>
                <Typography sx={{ mt: 2 }}>
                  Thank you for supporting HEXTRA!
                </Typography>
              </Box>
            ) : (
              <Box sx={{ p: 2, bgcolor: 'rgba(0, 0, 0, 0.05)', borderRadius: 1 }}>
                <Typography>
                  You don't have an active subscription. Subscribe to access premium features.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Subscription Plans */}
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 3, 
              textAlign: 'center',
              color: 'var(--text-primary)'
            }}
          >
            Available Plans
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap',
            gap: 4,
            justifyContent: 'center'
          }}>
            {plans.map((plan) => (
              <Paper
                key={plan.name}
                elevation={3}
                sx={{
                  p: 3,
                  width: { xs: '100%', sm: '45%', md: '350px' },
                  bgcolor: 'var(--background-paper)',
                  borderRadius: 2,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-5px)'
                  }
                }}
              >
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                  {plan.name}
                </Typography>
                <Typography variant="h4" sx={{ mb: 3, color: '#FED141', fontWeight: 700 }}>
                  {plan.price}
                </Typography>
                
                <Box component="ul" sx={{ mb: 4, pl: 2 }}>
                  {plan.features.map((feature, index) => (
                    <Typography component="li" key={index} sx={{ mb: 1 }}>
                      {feature}
                    </Typography>
                  ))}
                </Box>
                
                <GlowButton 
                  onClick={() => handleSubscribe(plan.name)}
                  fullWidth
                >
                  Subscribe Now
                </GlowButton>
              </Paper>
            ))}
          </Box>
        </>
      )}
      
      {/* Information Section */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mt: 6,
          bgcolor: 'var(--background-paper)',
          borderRadius: 2
        }}
      >
        <Typography variant="h5" sx={{ mb: 3 }}>
          Why Subscribe?
        </Typography>
        <Typography paragraph>
          HEXTRA Premium unlocks powerful batch processing capabilities, allowing you to process multiple images at once with the same color settings.
        </Typography>
        <Typography paragraph>
          Perfect for e-commerce stores, design agencies, and anyone who needs to process multiple product images quickly and consistently.
        </Typography>
      </Paper>
    </Box>
  );
}
