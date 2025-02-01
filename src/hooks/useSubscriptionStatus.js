import { useState, useEffect } from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export const useSubscriptionStatus = () => {
  const { isAuthenticated, user } = useKindeAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!isAuthenticated || !user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/check-subscription', {
          headers: {
            'x-kinde-user-id': user.id
          }
        });
        const data = await response.json();
        
        // Format the status string
        if (data.isSubscribed) {
          setStatus(`${data.plan} B.I.G.`);
        } else {
          setStatus('Early Bird B.I.G.');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setStatus('Pro B.I.G.');
        setLoading(false);
      }
    };

    checkSubscription();
  }, [isAuthenticated, user]);

  return { status, loading };
};
