import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { loadStripe } from '@stripe/stripe-js';
import React from 'react';
import SubscriptionPage from './SubscriptionPage';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

export default function SubscriptionCheck({ children, setShowSubscriptionPage }) {
  const { isAuthenticated, user } = useKindeAuth();
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [showDialog, setShowDialog] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Check subscription status
      fetch('/api/check-subscription', {
        headers: {
          'x-kinde-user-id': user.id
        }
      })
      .then(res => res.json())
      .then(data => {
        setIsSubscribed(data.isSubscribed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleOpenSubscription = () => {
    if (setShowSubscriptionPage) {
      setShowSubscriptionPage(true);
    } else {
      setShowDialog(true);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isSubscribed) {
    return (
      <>
        <div className="subscription-prompt">
          <button 
            onClick={handleOpenSubscription}
            className="glow-button"
          >
            Upgrade to Early-Bird
          </button>
        </div>
        {!setShowSubscriptionPage && (
          <SubscriptionPage 
            open={showDialog} 
            onClose={() => setShowDialog(false)} 
          />
        )}
      </>
    );
  }

  return children;
}
