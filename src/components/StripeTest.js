import React, { useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import GlowText from './GlowText';

const StripeTest = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testStripeSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe-test');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        message: 'Error checking Stripe setup',
        error: error.message
      });
    }
    setLoading(false);
  };

  return (
    <Box sx={{ 
      maxWidth: 600, 
      margin: '40px auto',
      padding: '20px',
      textAlign: 'center'
    }}>
      <Typography variant="h4" gutterBottom>
        Stripe Setup Test
      </Typography>
      
      <Box sx={{ my: 4 }}>
        <GlowText
          onClick={testStripeSetup}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Test Stripe Setup'}
        </GlowText>
      </Box>

      {status && (
        <Box sx={{ 
          mt: 4, 
          p: 3, 
          border: '1px solid',
          borderColor: status.success ? '#4caf50' : '#f44336',
          borderRadius: 1,
          bgcolor: status.success ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)'
        }}>
          <Typography color={status.success ? 'success' : 'error'}>
            {status.message}
          </Typography>
          {status.hasPublishableKey !== undefined && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Publishable Key: {status.hasPublishableKey ? '✅' : '❌'}
            </Typography>
          )}
          {status.hasSecretKey !== undefined && (
            <Typography variant="body2">
              Secret Key: {status.hasSecretKey ? '✅' : '❌'}
            </Typography>
          )}
          {status.error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              Error: {status.error}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StripeTest;
