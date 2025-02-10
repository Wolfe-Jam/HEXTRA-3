/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function CallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, getToken } = useKindeAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Starting auth callback handling...', { 
          isLoading, 
          isAuthenticated,
          search: location.search
        });
        
        // Get the token to ensure we're authenticated
        const token = await getToken();
        console.log('Token received:', token ? 'Yes' : 'No', {
          hasState: location.search.includes('state='),
          hasCode: location.search.includes('code=')
        });
        
        // If we have a token and are authenticated, redirect
        if (token && isAuthenticated) {
          console.log('Authentication successful, redirecting to /batch...');
          // Small delay to ensure state is saved
          setTimeout(() => navigate('/batch'), 500);
        } else {
          console.log('Not authenticated yet:', { 
            isAuthenticated, 
            hasToken: !!token,
            searchParams: new URLSearchParams(location.search).toString()
          });
        }
      } catch (error) {
        console.error('Auth callback error:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          search: location.search
        });
      }
    };

    // Only try to handle callback if we're not loading
    if (!isLoading) {
      handleCallback();
    }
  }, [isLoading, isAuthenticated, navigate, getToken, location]);

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
