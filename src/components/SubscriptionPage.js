import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions, List, ListItem, ListItemIcon, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const SubscriptionPage = ({ isOpen, onClose, user, isAuthenticated, login }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      login();
      return;
    }

    setIsLoading(true);
    setSelectedPlan(planId);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          planId: planId,
        }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });

      if (error) {
        console.error('Error redirecting to checkout:', error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleClose = () => {
    // Scroll to batch processing section when dialog is closed
    document.getElementById('batch-section').scrollIntoView({ behavior: 'smooth' });
    onClose();
  };

  const plans = [
    {
      id: 'early-bird',
      name: 'Early Bird',
      price: '$5',
      period: 'per month',
      color: '#D50032',
      lightColor: 'rgba(213, 0, 50, 0.1)',
      features: [
        'Batch Image Generation',
        'CSV Upload Support',
        'Gildan 64000 Catalog',
        'HEXTRA 21 Catalog',
        'Priority Support',
      ],
      buttonText: 'Subscribe',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$9',
      period: 'per month',
      color: '#00805E',
      lightColor: 'rgba(0, 128, 94, 0.1)',
      features: [
        'Everything in Early Bird',
        'Advanced Color Management',
        'Custom Catalog Support',
        'Unlimited Batch Processing',
        'Premium Support',
      ],
      buttonText: 'Subscribe',
      recommended: true,
    },
    {
      id: 'team',
      name: 'Team',
      price: '$19',
      period: 'per month',
      color: '#224D8F',
      lightColor: 'rgba(34, 77, 143, 0.1)',
      features: [
        'Everything in Pro',
        'Team Member Access',
        'Shared Catalogs',
        'Admin Controls',
        'Priority Development',
      ],
      buttonText: 'Coming Soon',
      disabled: true,
    },
  ];

  return (
    <Dialog 
      open={isOpen} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary)',
        }
      }}
    >
      <DialogTitle sx={{ 
        backgroundColor: 'var(--bg-primary)', 
        color: 'var(--text-primary)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 32px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Subscription Plans
        </Typography>
        <IconButton onClick={handleClose} sx={{ color: 'var(--text-secondary)' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ 
        backgroundColor: 'var(--bg-primary)', 
        padding: '32px',
      }}>
        <Typography variant="body1" sx={{ marginBottom: 4, color: 'var(--text-secondary)' }}>
          Choose the plan that best fits your needs. All plans include access to our core features.
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 3,
          justifyContent: 'center',
          alignItems: 'stretch'
        }}>
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '12px',
                overflow: 'hidden',
                border: plan.recommended ? `2px solid ${plan.color}` : '1px solid var(--border-color)',
                boxShadow: plan.recommended ? `0 8px 24px ${plan.lightColor}` : 'none',
                position: 'relative',
                backgroundColor: 'var(--bg-card)',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 32px ${plan.lightColor}`,
                }
              }}
            >
              {plan.recommended && (
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  right: 0, 
                  backgroundColor: plan.color,
                  color: 'white',
                  padding: '4px 12px',
                  borderBottomLeftRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                }}>
                  RECOMMENDED
                </Box>
              )}
              
              <CardContent sx={{ 
                padding: 3,
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <Typography variant="h5" sx={{ 
                  fontWeight: 600, 
                  color: plan.color,
                  mb: 1
                }}>
                  {plan.name}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                  <Typography variant="h3" sx={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {plan.price}
                  </Typography>
                  <Typography variant="body1" sx={{ ml: 1, color: 'var(--text-secondary)' }}>
                    {plan.period}
                  </Typography>
                </Box>
                
                <List sx={{ flexGrow: 1 }}>
                  {plan.features.map((feature, index) => (
                    <ListItem key={index} sx={{ padding: '4px 0' }}>
                      <ListItemIcon sx={{ minWidth: '32px' }}>
                        <CheckIcon sx={{ color: plan.color }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={feature} 
                        sx={{ 
                          '& .MuiListItemText-primary': { 
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem'
                          } 
                        }} 
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              
              <CardActions sx={{ padding: '16px 24px 24px' }}>
                <Button 
                  fullWidth
                  variant="contained"
                  disabled={plan.disabled || isLoading && selectedPlan === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                  sx={{ 
                    backgroundColor: plan.color,
                    color: 'white',
                    padding: '10px 0',
                    '&:hover': {
                      backgroundColor: plan.color,
                      opacity: 0.9,
                    },
                    '&.Mui-disabled': {
                      backgroundColor: plan.disabled ? 'rgba(0, 0, 0, 0.12)' : plan.lightColor,
                      color: plan.disabled ? 'rgba(0, 0, 0, 0.26)' : 'white',
                    }
                  }}
                >
                  {isLoading && selectedPlan === plan.id ? 'Processing...' : plan.buttonText}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
        
        <Box sx={{ 
          marginTop: 6, 
          padding: 3, 
          backgroundColor: 'var(--bg-card)', 
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <Typography variant="h6" sx={{ color: 'var(--text-primary)', mb: 2 }}>
            Free Features Available to All Users
          </Typography>
          <List>
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemIcon sx={{ minWidth: '32px' }}>
                <CheckIcon sx={{ color: 'var(--text-primary)' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Single Image Generation" 
                sx={{ '& .MuiListItemText-primary': { color: 'var(--text-primary)' } }} 
              />
            </ListItem>
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemIcon sx={{ minWidth: '32px' }}>
                <CheckIcon sx={{ color: 'var(--text-primary)' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Basic Color Management" 
                sx={{ '& .MuiListItemText-primary': { color: 'var(--text-primary)' } }} 
              />
            </ListItem>
            <ListItem sx={{ padding: '4px 0' }}>
              <ListItemIcon sx={{ minWidth: '32px' }}>
                <CheckIcon sx={{ color: 'var(--text-primary)' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Standard Support" 
                sx={{ '& .MuiListItemText-primary': { color: 'var(--text-primary)' } }} 
              />
            </ListItem>
          </List>
        </Box>
      </DialogContent>
      <DialogActions sx={{ 
        padding: '16px 32px 24px',
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-color)',
        justifyContent: 'flex-end'
      }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            color: 'var(--text-secondary)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionPage;
