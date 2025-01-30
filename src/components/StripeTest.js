import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import styled from 'styled-components';

const Container = styled(Box)`
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
`;

const PlanCard = styled(Card)`
  margin: 20px 0;
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
  }
`;

const StripeTest = () => {
  const { isAuthenticated, login } = useKindeAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (priceId) => {
    if (!isAuthenticated) {
      login();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        HEXTRA Subscriptions
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4 }}>
        Choose a subscription plan to unlock premium features
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <PlanCard>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Basic Plan
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              $10/month
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Up to 100 color extractions per month<br />
              • Basic palette generation<br />
              • Email support
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => handleSubscribe('price_basic')}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Subscribe'}
            </Button>
          </CardContent>
        </PlanCard>

        <PlanCard>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Pro Plan
            </Typography>
            <Typography variant="h6" color="primary" gutterBottom>
              $25/month
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Unlimited color extractions<br />
              • Advanced palette generation<br />
              • Priority support<br />
              • API access
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              onClick={() => handleSubscribe('price_pro')}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Subscribe'}
            </Button>
          </CardContent>
        </PlanCard>
      </Box>
    </Container>
  );
};

export default StripeTest;
