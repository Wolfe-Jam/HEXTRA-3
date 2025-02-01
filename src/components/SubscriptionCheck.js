import { useKindeAuth } from '@kinde-oss/kinde-auth-nextjs';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function SubscriptionCheck({ children }) {
  const { isAuthenticated, user } = useKindeAuth();
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

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
    }
  }, [isAuthenticated, user]);

  const handleSubscribe = async () => {
    const stripe = await stripePromise;
    
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-kinde-user-id': user.id
      }
    });
    
    const { sessionId } = await response.json();
    stripe.redirectToCheckout({ sessionId });
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isSubscribed) {
    return (
      <div className="subscription-prompt">
        <button 
          onClick={handleSubscribe}
          className="glow-button" // Using your existing button style
        >
          Upgrade to Early-Bird
        </button>
      </div>
    );
  }

  return children;
}
