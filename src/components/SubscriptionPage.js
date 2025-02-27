import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';
import GlowButton from './GlowButton';
import GlowTextButton from './GlowTextButton';
import themeManager from '../theme';
import { VERSION } from '../version';
import Banner from './Banner';

export default function SubscriptionPage() {
  const { isAuthenticated: kindeAuthenticated, user, login } = useKindeAuth();
  const isAuthenticated = true; // Force authenticated for local development
  const [subscriptionStatus, setSubscriptionStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('hextraTheme');
    return savedTheme || 'dark';
  });

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

  // Apply theme when it changes
  React.useEffect(() => {
    themeManager.applyTheme(theme);
  }, [theme]);

  // Handle window resize for responsive design
  React.useEffect(() => {
    const handleResize = () => {
      // Force a re-render when window size changes
      setLoading(loading);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [loading]);

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
      login();
      return;
    }
    
    console.log(`Subscribing to ${planName}`);
    // In production, this would redirect to Stripe checkout
    alert(`This would redirect to Stripe checkout for ${planName}`);
  };

  // Handle free preview button click
  const handleFreePreview = () => {
    navigate('/app');
  };

  return (
    <div style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Banner */}
      <Banner 
        version={VERSION}
        isDarkMode={theme === 'dark'}
        onThemeToggle={() => {
          const newTheme = theme === 'dark' ? 'light' : 'dark';
          localStorage.setItem('hextraTheme', newTheme);
          setTheme(newTheme);
          themeManager.applyTheme(newTheme);
        }}
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
        fontFamily: "'Inter', sans-serif"
      }}>
        <h1 style={{ 
          marginBottom: '30px', 
          textAlign: 'center',
          fontSize: window.innerWidth < 600 ? '1.8rem' : '2.5rem',
          fontFamily: "'League Spartan', sans-serif"
        }}>HEXTRA Subscription</h1>
      
      {/* Free Preview Button - Always visible at the top */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <GlowTextButton 
          onClick={handleFreePreview}
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
        <h2 style={{ marginBottom: '15px' }}>Unlock HEXTRA's Full Potential</h2>
        <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Subscribe to HEXTRA and gain access to advanced features like batch processing, 
          premium color management, and priority support. Choose the plan that fits your needs.
        </p>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ 
          textAlign: 'center',
          fontFamily: "'League Spartan', sans-serif"
        }}>Subscription Status</h2>
        <div style={{ 
          background: theme === 'dark' ? '#333333' : '#f5f5f5', 
          padding: '25px',
          borderRadius: '8px',
          marginTop: '15px',
          color: theme === 'dark' ? '#ffffff' : '#333333',
          textAlign: 'center'
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
              <p style={{ fontSize: '16px', marginBottom: '10px' }}>
                Plan: {subscriptionStatus.tier === 'early-bird' ? 'Early-Bird' : 'Pro'} Plan
              </p>
              <p style={{ fontSize: '14px', color: theme === 'dark' ? '#cccccc' : '#666666' }}>
                Subscription ID: {subscriptionStatus.subscriptionId}
              </p>
            </div>
          ) : (
            <p style={{ 
              fontSize: '18px',
              marginBottom: '15px',
              lineHeight: '1.5'
            }}>
              Upgrade now to unlock all premium features and supercharge your color workflow!
            </p>
          )}
        </div>
      </div>

      {!subscriptionStatus?.isSubscribed && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Available Plans</h3>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            {/* Early Bird Plan */}
            <div style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              width: '300px',
              textAlign: 'left',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '-30px',
                transform: 'rotate(45deg)',
                backgroundColor: '#224D8F',
                color: 'white',
                padding: '5px 40px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                POPULAR
              </div>
              <h4 style={{ color: '#224D8F' }}>Early-Bird Plan</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '15px 0' }}>$5/month</p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li>Unlimited batch processing</li>
                <li>Priority support</li>
                <li>Early access to new features</li>
                <li>Basic color management</li>
              </ul>
              <GlowButton 
                onClick={() => handleSubscribe('Early-Bird Plan')}
                style={{ 
                  width: '100%',
                  background: 'linear-gradient(45deg, #1565C0 30%, #42A5F5 90%)'
                }}
              >
                Subscribe Now
              </GlowButton>
            </div>
            
            {/* Pro Plan */}
            <div style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              width: '300px',
              textAlign: 'left',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '-30px',
                transform: 'rotate(45deg)',
                backgroundColor: '#D50032',
                color: 'white',
                padding: '5px 40px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                PREMIUM
              </div>
              <h4 style={{ color: '#D50032' }}>Pro Plan</h4>
              <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '15px 0' }}>$10/month</p>
              <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                <li>Everything in Early-Bird</li>
                <li>Advanced color management</li>
                <li>Custom export options</li>
                <li>Dedicated support</li>
                <li>Unlimited color catalogs</li>
              </ul>
              <GlowButton 
                onClick={() => handleSubscribe('Pro Plan')}
                style={{ 
                  width: '100%',
                  background: 'linear-gradient(45deg, #C62828 30%, #EF5350 90%)'
                }}
              >
                Subscribe Now
              </GlowButton>
            </div>
          </div>
        </div>
      )}
      
      {/* FAQ Section */}
      <div style={{ marginTop: '60px', borderTop: '1px solid #e0e0e0', paddingTop: '40px' }}>
        <h2 style={{ marginBottom: '30px', textAlign: 'center' }}>Frequently Asked Questions</h2>
        
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          {/* FAQ Item 1 */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#224D8F' }}>
              What features are included in the free preview?
            </h3>
            <p style={{ lineHeight: '1.5' }}>
              The free preview includes basic image processing for single images, standard color selection, 
              and basic export options. Subscription plans unlock batch processing, advanced color management, 
              and premium support.
            </p>
          </div>
          
          {/* FAQ Item 2 */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#224D8F' }}>
              How do I cancel my subscription?
            </h3>
            <p style={{ lineHeight: '1.5' }}>
              You can cancel your subscription at any time from your account settings. Your subscription 
              benefits will continue until the end of your current billing period.
            </p>
          </div>
          
          {/* FAQ Item 3 */}
          <div style={{ marginBottom: '25px' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#224D8F' }}>
              Can I switch between subscription plans?
            </h3>
            <p style={{ lineHeight: '1.5' }}>
              Yes, you can upgrade or downgrade your subscription at any time. When upgrading, you'll 
              have immediate access to the new features. When downgrading, the change will take effect 
              at the start of your next billing cycle.
            </p>
          </div>
          
          {/* FAQ Item 4 */}
          <div style={{ marginBottom: '0' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#224D8F' }}>
              Is there a discount for annual subscriptions?
            </h3>
            <p style={{ lineHeight: '1.5' }}>
              We're currently working on annual subscription options with special discounts. 
              Stay tuned for announcements about these new plans coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
