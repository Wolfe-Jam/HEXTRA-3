/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function CallbackPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, handleRedirectCallback } = useKindeAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback handling...');
        // Handle the redirect and token exchange
        await handleRedirectCallback();
        console.log('Callback handled, isAuthenticated:', isAuthenticated);
        
        // If authenticated, redirect to /batch
        if (isAuthenticated) {
          console.log('Redirecting to /batch...');
          navigate('/batch');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
      }
    };

    if (!isLoading) {
      handleCallback();
    }
  }, [isLoading, handleRedirectCallback, isAuthenticated, navigate]);

  // Show loading while authenticating
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000'
      }}
    >
      <Box
        component="img"
        src="/images/HEXTRA-3-logo-Blk.svg"
        alt="Hextra"
        sx={{ width: 200, mb: 4 }}
      />
      <CircularProgress sx={{ color: 'white' }} />
    </Box>
  );
}
