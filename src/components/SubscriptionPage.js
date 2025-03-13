import React, { useState, useEffect, useTransition } from 'react';
import { Box, Typography, Paper, Button, Divider } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';
import GlowButton from './GlowButton';
import GlowTextButton from './GlowTextButton';
import { VERSION } from '../version';
import Banner from './Banner';
import { useTheme } from '../context';

// Define keyframe animations for the badges
const keyframes = `
  @keyframes crownPulse { 
    0% { transform: scale(1) rotate(10deg); opacity: 0.9; } 
    100% { transform: scale(1.15) rotate(10deg); opacity: 1; } 
  }
  @keyframes starPulse { 
    0% { transform: scale(1) rotate(10deg); opacity: 0.9; } 
    100% { transform: scale(1.15) rotate(15deg); opacity: 1; } 
  }
`;

export default function SubscriptionPage() {
  const { isAuthenticated: kindeAuthenticated, user, login } = useKindeAuth();
  const isAuthenticated = true; // Force authenticated for local development
  const [subscriptionStatus, setSubscriptionStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

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

  // Handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      // Force a re-render when window size changes
      setLoading(loading);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [loading]);

  // Handle hash navigation for direct scrolling to sections
  React.useEffect(() => {
    // Check if there's a hash in the URL
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      console.log(`Attempting to navigate to section: #${id}`);
      const element = document.getElementById(id);
      if (element) {
        // Wait a bit for the page to render, then scroll
        startTransition(() => {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
            console.log(`Successfully scrolled to #${id}`);
          }, 300);
        });
      } else {
        console.warn(`Element with id "${id}" not found in the document`);
      }
    }
  }, [startTransition]);

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/check-subscription', {
        headers: {
          'x-kinde-user-id': user.id
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to check subscription status');
      }
      
      const data = await response.json();
      setSubscriptionStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setError('Failed to load subscription status. Please try again later.');
      setLoading(false);
    }
  };

  // Handle subscription button click
  const handleSubscribe = (planName) => {
    if (!isAuthenticated) {
      startTransition(() => {
        login();
      });
      return;
    }
    
    console.log(`Subscribing to ${planName}`);
    // In production, this would redirect to Stripe checkout
    alert(`This would redirect to Stripe checkout for ${planName}`);
  };

  // Handle free preview button click
  const handleFreePreview = () => {
    startTransition(() => {
      navigate('/app');
    });
  };

  // Add keyframes to the document
  React.useEffect(() => {
    // Check if the style element already exists
    const existingStyle = document.getElementById('subscription-keyframes');
    if (!existingStyle) {
      const styleElement = document.createElement('style');
      styleElement.id = 'subscription-keyframes';
      styleElement.innerHTML = keyframes;
      document.head.appendChild(styleElement);
    }
    
    // Cleanup on unmount
    return () => {
      const styleElement = document.getElementById('subscription-keyframes');
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-primary)',
      color: 'var(--text-primary)'
    }}>
      {/* Banner */}
      <Banner 
        version={VERSION}
        isDarkMode={theme === 'dark'}
        onThemeToggle={toggleTheme}
        isBatchMode={false}
        setIsBatchMode={() => {}}
        setShowSubscriptionTest={() => {}}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GlowButton 
            disabled={true} 
            sx={{ 
              opacity: 0.5,
              cursor: 'not-allowed',
              '&:hover': {
                opacity: 0.5
              }
            }}
          >
            Login (Coming in v2.2.0)
          </GlowButton>
        </Box>
      </Banner>
      
      {/* Subscription content */}
      <div style={{ 
        padding: '60px 20px 20px 20px',
        maxWidth: '800px',
        margin: '0 auto',
        flex: 1,
        fontFamily: "'Inter', sans-serif",
        color: 'var(--text-primary)',
        backgroundColor: 'var(--bg-primary)'
      }}>
        <h1 style={{ 
          marginBottom: '30px', 
          textAlign: 'center',
          fontSize: window.innerWidth < 600 ? '1.8rem' : '2.5rem',
          fontFamily: "'League Spartan', sans-serif",
          color: 'var(--text-primary)'
        }}>HEXTRA Subscription</h1>
      
      {/* Free Preview Button - Always visible at the top */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <GlowTextButton 
          onClick={() => startTransition(() => handleFreePreview())}
          variant="contained"
          sx={{ 
            fontSize: '1.2rem', 
            padding: '12px 24px',
            minWidth: '200px',
            boxShadow: 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: 'var(--text-primary)',
              borderColor: 'var(--glow-color)',
              color: 'var(--glow-color)',
              boxShadow: '0 0 0 3px var(--glow-subtle)',
              transform: 'scale(1.05)'
            }
          }}
        >
          Try Free Preview
        </GlowTextButton>
      </div>
      
      {/* Subscription Info Section */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>Unlock HEXTRA's Full Potential</h2>
        <p style={{ 
          fontSize: '1.1rem', 
          maxWidth: '600px', 
          margin: '0 auto', 
          lineHeight: '1.6',
          color: 'var(--text-secondary)'
        }}>
          Subscribe to HEXTRA and gain access to advanced features like batch processing, 
          premium color management, and priority support. Choose the plan that fits your needs.
        </p>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          textAlign: 'center',
          fontFamily: "'League Spartan', sans-serif",
          color: 'var(--text-primary)'
        }}>Subscription Status</h2>
        <div style={{ 
          background: 'var(--bg-secondary)', 
          padding: '25px',
          borderRadius: '8px',
          marginTop: '15px',
          color: 'var(--text-primary)',
          textAlign: 'center',
          border: '1px solid var(--border-color)'
        }}>
          {subscriptionStatus?.isSubscribed ? (
            <div>
              <p style={{ 
                fontSize: '20px', 
                fontWeight: 'bold', 
                color: '#00805E',
                fontFamily: "'League Spartan', sans-serif",
                marginBottom: '10px'
              }}>
                Your Premium Access is Active!
              </p>
              <p style={{ fontSize: '16px', marginBottom: '10px', color: 'var(--text-primary)' }}>
                Plan: {subscriptionStatus.tier === 'early-bird' ? 'Early-Bird' : 'Pro'} Plan
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                Subscription ID: {subscriptionStatus.subscriptionId}
              </p>
            </div>
          ) : (
            <p style={{ 
              fontSize: '18px',
              marginBottom: '15px',
              lineHeight: '1.5',
              color: 'var(--text-primary)'
            }}>
              Upgrade now to unlock all premium features and supercharge your color workflow!
            </p>
          )}
        </div>
      </div>

      {/* Always show Available Plans section */}
      <div id="available-plans" style={{ textAlign: 'center', marginTop: '30px' }}>
        <h3 style={{ 
          marginBottom: '20px', 
          color: 'var(--text-primary)', 
          fontFamily: "'League Spartan', sans-serif",
          fontSize: '1.5rem'
        }}>Available Plans</h3>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          flexWrap: 'wrap'
        }}>
          {plans.map((plan, index) => (
            <Paper
              key={index}
              elevation={3}
              sx={{
                bgcolor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                width: { xs: '100%', sm: '45%', md: '300px' },
                minHeight: '280px',
                padding: '20px',
                marginBottom: '20px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <div style={{ position: 'relative' }}>
                {/* Badge for plan type */}
                <div style={{ 
                  position: 'absolute',
                  top: '-15px',
                  right: '-15px',
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: plan.name.includes('Pro') ? '#224D8F' : '#00805E', // Exact brand colors from Banner
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'League Spartan', sans-serif",
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  boxShadow: `0 3px 10px rgba(0,0,0,0.3), 0 0 15px ${plan.name.includes('Pro') ? 'rgba(34, 77, 143, 0.5)' : 'rgba(0, 128, 94, 0.5)'}`,
                  border: '3px solid #FFFFFF',
                  outline: `1px solid ${plan.name.includes('Pro') ? '#224D8F' : '#00805E'}`,
                  zIndex: 2,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: `0 5px 15px rgba(0,0,0,0.4), 0 0 20px ${plan.name.includes('Pro') ? 'rgba(34, 77, 143, 0.7)' : 'rgba(0, 128, 94, 0.7)'}`
                  }
                }}>
                  {/* Plan initial with badge */}
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {plan.name.includes('Pro') ? 'P' : 'E'}
                    <span style={{ 
                      position: 'absolute',
                      top: plan.name.includes('Pro') ? '-18px' : '-16px',
                      right: '-14px',
                      fontSize: plan.name.includes('Pro') ? '22px' : '18px', // Reduced star size
                      lineHeight: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFC700', // Gold color for both crown and star
                      // Add outline using text-shadow with page background color
                      textShadow: `
                        0 0 4px rgba(255, 199, 0, 0.8),
                        -1px -1px 0 var(--bg-primary),  
                        1px -1px 0 var(--bg-primary),
                        -1px 1px 0 var(--bg-primary),
                        1px 1px 0 var(--bg-primary)
                      `,
                      transform: 'rotate(15deg)',
                      fontWeight: 'bold',
                      animation: `${plan.name.includes('Pro') ? 'crownPulse' : 'starPulse'} 2s infinite alternate`,
                      zIndex: 3
                    }}>
                      {plan.name.includes('Pro') ? '♛' : '★'}
                    </span>
                  </div>
                </div>
                <h3 style={{ 
                  marginBottom: '10px', 
                  color: plan.name.includes('Pro') ? 
                    (theme === 'dark' ? '#4A7CC7' : '#224D8F') : 
                    '#00805E',
                  fontFamily: "'League Spartan', sans-serif",
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  textShadow: theme === 'dark' && plan.name.includes('Pro') ? '0px 0px 1px rgba(255,255,255,0.5)' : 'none'
                }}>{plan.name}</h3>
                <Typography variant="h5" sx={{ 
                  marginBottom: '15px',
                  fontWeight: 600
                }}>
                  {plan.price}
                </Typography>
                <Divider sx={{ marginBottom: '15px', borderColor: 'var(--border-color)' }} />
                <div>
                  {plan.features.map((feature, i) => (
                    <Typography key={i} variant="body2" sx={{ 
                      marginBottom: '8px',
                      textAlign: 'left',
                      paddingLeft: '20px',
                      position: 'relative',
                      '&::before': {
                        content: '"✓"',
                        position: 'absolute',
                        left: '0',
                        color: plan.name.includes('Pro') ? '#224D8F' : '#00805E',
                      }
                    }}>
                      {feature}
                    </Typography>
                  ))}
                </div>
              </div>
              <Button
                variant="contained"
                onClick={() => startTransition(() => handleSubscribe(plan.name))}
                sx={{
                  marginTop: '15px',
                  backgroundColor: plan.name.includes('Pro') ? '#224D8F' : '#00805E',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: plan.name.includes('Pro') ? '#1a3a6c' : '#00664b',
                  }
                }}
              >
                {subscriptionStatus?.isSubscribed && 
                 ((plan.name.includes('Early-Bird') && subscriptionStatus.tier === 'early-bird') || 
                  (plan.name.includes('Pro') && subscriptionStatus.tier === 'pro')) 
                  ? 'Current Plan' 
                  : 'Subscribe Now'
                }
              </Button>
            </Paper>
          ))}
        </div>
      </div>
      
      {/* FAQ Section */}
      <div style={{ 
        marginTop: '60px', 
        borderTop: '1px solid var(--border-color)', 
        paddingTop: '40px',
        color: 'var(--text-primary)'
      }}>
        <h2 style={{ marginBottom: '30px', textAlign: 'center', color: 'var(--text-primary)' }}>Frequently Asked Questions</h2>
        
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {/* FAQ Item 1 */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--accent-color)' }}>
              What features are included in the free preview?
            </h3>
            <p style={{ lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              The free preview includes basic image processing for single images, standard color selection, 
              and basic export options. Subscription plans unlock batch processing, advanced color management, 
              and premium support.
            </p>
          </div>
          
          {/* FAQ Item 2 */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--accent-color)' }}>
              How do I cancel my subscription?
            </h3>
            <p style={{ lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              You can cancel your subscription at any time from your account settings. Your subscription 
              benefits will continue until the end of your current billing period.
            </p>
          </div>
          
          {/* FAQ Item 3 */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--accent-color)' }}>
              Can I switch between subscription plans?
            </h3>
            <p style={{ lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              Yes, you can upgrade or downgrade your subscription at any time. When upgrading, you'll 
              have immediate access to the new features. When downgrading, the change will take effect 
              at the start of your next billing cycle.
            </p>
          </div>
          
          {/* FAQ Item 4 */}
          <div style={{ marginBottom: '0' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: 'var(--accent-color)' }}>
              Is there a discount for annual subscriptions?
            </h3>
            <p style={{ lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              We're currently working on annual subscription options with special discounts. 
              Stay tuned for announcements about these new plans coming soon!
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Box 
        component="footer" 
        sx={{
          width: '100%',
          borderTop: '1px solid var(--border-color)',
          bgcolor: 'var(--background-paper)',
          p: 2,
          mt: 4
        }}
      >
        <Typography 
          variant="body2" 
          sx={{ color: 'var(--text-secondary)' }} 
          align="center"
        >
          &copy; 2025 HEXTRA Color System - All rights reserved.
        </Typography>
      </Box>
    </div>
  </div>
  );
}
