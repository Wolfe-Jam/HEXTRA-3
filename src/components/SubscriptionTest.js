import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { loadStripe } from '@stripe/stripe-js';
import GlowButton from './GlowButton';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function SubscriptionTest() {
  const { isAuthenticated, user, login } = useKindeAuth();
  const [subscriptionStatus, setSubscriptionStatus] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    console.log('Subscription test mounted');
    console.log('Auth state:', { isAuthenticated, user });
    
    if (isAuthenticated && user?.id) {
      checkSubscription();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const checkSubscription = async () => {
    try {
      console.log('Checking subscription for user:', user.id);
      const response = await fetch('/api/check-subscription', {
        headers: {
          'x-kinde-user-id': user.id
        }
      });
      const data = await response.json();
      console.log('Subscription data:', data);
      setSubscriptionStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      login();
      return;
    }

    try {
      console.log('Starting subscription process');
      const stripe = await stripePromise;
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-kinde-user-id': user.id
        }
      });
      
      const { sessionId } = await response.json();
      console.log('Got session ID:', sessionId);
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('Stripe error:', error);
      }
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  return (
    <div style={{ 
      padding: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <h1 style={{ marginBottom: '30px' }}>HEXTRA Subscription Test</h1>
      
      {!isAuthenticated ? (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <GlowButton onClick={login}>
            Sign In to Manage Subscription
          </GlowButton>
        </div>
      ) : loading ? (
        <div>Loading subscription status...</div>
      ) : (
        <>
          <div style={{ marginBottom: '30px' }}>
            <h2>User Info</h2>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '15px',
              borderRadius: '8px'
            }}>
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <h2>Subscription Status</h2>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '15px',
              borderRadius: '8px'
            }}>
              {JSON.stringify(subscriptionStatus, null, 2)}
            </pre>
          </div>

          {!subscriptionStatus?.isSubscribed && (
            <div style={{ textAlign: 'center', marginTop: '30px' }}>
              <GlowButton onClick={handleSubscribe}>
                Subscribe to Early-Bird Plan ($5/month)
              </GlowButton>
            </div>
          )}
        </>
      )}
    </div>
  );
}
