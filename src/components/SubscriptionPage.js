import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  CardActions,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import GlowButton from './GlowButton';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const plans = [
  {
    id: 'early-bird',
    name: 'Early Bird',
    price: '$5',
    period: 'month',
    features: [
      'Unlimited Batch Processing',
      'Priority Support',
      'Early Access to New Features',
      'Exclusive Color Catalogs'
    ],
    recommended: true
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9',
    period: 'month',
    features: [
      'Everything in Early Bird',
      'Advanced Color Analytics',
      'Custom Color Catalogs',
      'API Access'
    ]
  }
];

export default function SubscriptionPage({ open, onClose }) {
  const { isAuthenticated, user, login } = useKindeAuth();
  const [subscriptionStatus, setSubscriptionStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  const checkSubscription = React.useCallback(async () => {
    try {
      const response = await fetch('/api/check-subscription', {
        headers: {
          'x-kinde-user-id': user?.id
        }
      });
      const data = await response.json();
      setSubscriptionStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    if (open && isAuthenticated && user?.id) {
      checkSubscription();
    } else if (open) {
      setLoading(false);
    }
  }, [open, isAuthenticated, user, checkSubscription]);

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      login();
      return;
    }

    try {
      const stripe = await stripePromise;
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-kinde-user-id': user.id
        },
        body: JSON.stringify({ planId })
      });
      
      const { sessionId } = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('Stripe error:', error);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: 'linear-gradient(145deg, #121212 0%, #1e1e1e 100%)',
          color: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
          Upgrade Your HEXTRA Experience
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ py: 4 }}>
        {!isAuthenticated ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              Sign in to access premium features
            </Typography>
            <GlowButton onClick={login} sx={{ mt: 2 }}>
              Sign In
            </GlowButton>
          </Box>
        ) : loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography>Loading subscription status...</Typography>
          </Box>
        ) : subscriptionStatus?.isSubscribed ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>
              You're already subscribed to the {subscriptionStatus.plan} plan!
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Thank you for supporting HEXTRA.
            </Typography>
            <GlowButton onClick={onClose}>
              Return to Editor
            </GlowButton>
          </Box>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
              Choose the plan that works best for you and unlock the full potential of HEXTRA.
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              {plans.map((plan) => (
                <Grid item xs={12} md={6} key={plan.id}>
                  <Card sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: plan.recommended 
                      ? 'linear-gradient(145deg, #2a2a2a 0%, #333333 100%)' 
                      : 'linear-gradient(145deg, #1a1a1a 0%, #222222 100%)',
                    border: plan.recommended ? '2px solid #00e5ff' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    boxShadow: plan.recommended ? '0 0 20px rgba(0, 229, 255, 0.2)' : 'none'
                  }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      {plan.recommended && (
                        <Box sx={{ 
                          background: '#00e5ff', 
                          color: 'black',
                          py: 0.5,
                          px: 2,
                          borderRadius: '4px',
                          display: 'inline-block',
                          mb: 2,
                          fontWeight: 'bold'
                        }}>
                          RECOMMENDED
                        </Box>
                      )}
                      
                      <Typography variant="h5" component="div" gutterBottom>
                        {plan.name}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                          {plan.price}
                        </Typography>
                        <Typography variant="body1" sx={{ ml: 1 }}>
                          /{plan.period}
                        </Typography>
                      </Box>
                      
                      <List sx={{ mb: 2 }}>
                        {plan.features.map((feature, index) => (
                          <ListItem key={index} disableGutters sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: '36px' }}>
                              <CheckIcon sx={{ color: '#00e5ff' }} />
                            </ListItemIcon>
                            <ListItemText primary={feature} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                    
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <GlowButton 
                        onClick={() => handleSubscribe(plan.id)}
                        fullWidth
                        variant={plan.recommended ? 'contained' : 'outlined'}
                      >
                        Select {plan.name}
                      </GlowButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
