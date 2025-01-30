import React, { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import GlowText from './GlowText';

const StripeTest = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const testStripeConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-stripe');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      setStatus({
        success: false,
        message: 'Error connecting to Stripe',
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
        Stripe Connection Test
      </Typography>
      
      <Box sx={{ my: 4 }}>
        <GlowText
          onClick={testStripeConnection}
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Test Stripe Connection'}
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
