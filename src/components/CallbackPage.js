/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function CallbackPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, getToken } = useKindeAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback handling...', { isLoading, isAuthenticated });
        
        // Get the token to ensure we're authenticated
        const token = await getToken();
        console.log('Token received:', token ? 'Yes' : 'No');
        
        // If we have a token and are authenticated, redirect
        if (token && isAuthenticated) {
          console.log('Authentication successful, redirecting to /batch...');
          navigate('/batch');
        } else {
          console.log('Not authenticated yet:', { isAuthenticated, hasToken: !!token });
        }
      } catch (error) {
        console.error('Auth callback error:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
    };

    // Only try to handle callback if we're not loading
    if (!isLoading) {
      handleCallback();
    }
  }, [isLoading, isAuthenticated, navigate, getToken]);

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
