import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { loadStripe } from '@stripe/stripe-js';
import GlowButton from './GlowButton';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function SubscriptionPage() {
  const { isAuthenticated, user, login } = useKindeAuth();
  const [subscriptionStatus, setSubscriptionStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

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

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    try {
      setLoading(true);
      const stripe = await stripePromise;
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-kinde-user-id': user.id
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const { sessionId } = await response.json();
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Failed to start subscription process. Please try again later.');
      setLoading(false);
    }
  };

  // Handle free preview button click
  const handleFreePreview = () => {
    navigate('/');
  };

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ 
        marginBottom: '30px', 
        textAlign: 'center',
        fontSize: window.innerWidth < 600 ? '1.8rem' : '2.5rem'
      }}>HEXTRA Subscription</h1>
      
      {/* Free Preview Button - Always visible at the top */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <GlowButton 
          onClick={handleFreePreview}
          style={{ 
            fontSize: '1.2rem', 
            padding: '12px 24px',
            background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)'
          }}
        >
          Try Free Preview
        </GlowButton>
      </div>
      
      {/* Subscription Info Section */}
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '15px' }}>Unlock HEXTRA's Full Potential</h2>
        <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Subscribe to HEXTRA and gain access to advanced features like batch processing, 
          premium color management, and priority support. Choose the plan that fits your needs.
        </p>
      </div>
      
      {!isAuthenticated ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ marginBottom: '20px' }}>
            Sign in to manage your subscription and access premium features.
          </p>
          <GlowButton onClick={login}>
            Sign In
          </GlowButton>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p>Loading subscription status...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <p style={{ color: 'red', marginBottom: '20px' }}>{error}</p>
          <GlowButton onClick={checkSubscription}>
            Try Again
          </GlowButton>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '30px' }}>
            <h2>Subscription Status</h2>
            <div style={{ 
              background: '#f5f5f5', 
              padding: '20px',
              borderRadius: '8px',
              marginTop: '15px'
            }}>
              {subscriptionStatus?.isSubscribed ? (
                <div>
                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#00805E' }}>
                    Active Subscription
                  </p>
                  <p>
                    Plan: {subscriptionStatus.tier === 'early-bird' ? 'Early-Bird' : 'Pro'} Plan
                  </p>
                  <p>
                    Subscription ID: {subscriptionStatus.subscriptionId}
                  </p>
                </div>
              ) : (
                <p>
                  You don't have an active subscription. Subscribe to access premium features.
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
                    onClick={handleSubscribe}
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
                    onClick={handleSubscribe}
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
        </>
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
  );
}
