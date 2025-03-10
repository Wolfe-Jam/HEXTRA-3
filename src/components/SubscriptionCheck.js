import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { loadStripe } from '@stripe/stripe-js';
import GlowButton from './GlowButton';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function SubscriptionCheck({ children }) {
  const { isAuthenticated, user, login } = useKindeAuth();
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Check subscription status
      fetch('/api/check-subscription', {
        headers: {
          'x-kinde-user-id': user.id
        }
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to check subscription');
        }
        return res.json();
      })
      .then(data => {
        setIsSubscribed(data.isSubscribed);
        setLoading(false);
      })
      .catch(err => {
        console.error('Subscription check error:', err);
        setError('Failed to verify subscription status');
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleSubscribe = async () => {
    try {
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
      setError('Failed to start subscription process');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="subscription-prompt" style={{
        padding: '20px',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3>Sign In to Access Premium Features</h3>
        <p style={{ margin: '15px 0' }}>
          This feature requires a subscription. Please sign in to continue.
        </p>
        <GlowButton onClick={login}>
          Sign In
        </GlowButton>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Verifying subscription status...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <GlowButton onClick={() => window.location.reload()}>
          Try Again
        </GlowButton>
      </div>
    );
  }

  if (!isSubscribed) {
    return (
      <div className="subscription-prompt" style={{
        padding: '20px',
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h3>Premium Feature</h3>
        <p style={{ margin: '15px 0' }}>
          This feature requires a subscription. Upgrade to the Early-Bird plan to access all premium features.
        </p>
        <GlowButton 
          onClick={handleSubscribe}
        >
          Upgrade to Early-Bird
        </GlowButton>
      </div>
    );
  }

  return children;
}
