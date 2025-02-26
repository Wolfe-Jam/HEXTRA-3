import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { loadStripe } from '@stripe/stripe-js';
import GlowButton from './GlowButton';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function SubscriptionPage() {
  const { isAuthenticated, user, login } = useKindeAuth();
  const [subscriptionStatus, setSubscriptionStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

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

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ marginBottom: '30px' }}>HEXTRA Subscription</h1>
      
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
                <div style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  width: '300px',
                  textAlign: 'left'
                }}>
                  <h4>Early-Bird Plan</h4>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '15px 0' }}>$5/month</p>
                  <ul style={{ marginBottom: '20px', paddingLeft: '20px' }}>
                    <li>Unlimited batch processing</li>
                    <li>Priority support</li>
                    <li>Early access to new features</li>
                  </ul>
                  <GlowButton 
                    onClick={handleSubscribe}
                    style={{ width: '100%' }}
                  >
                    Subscribe Now
                  </GlowButton>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
