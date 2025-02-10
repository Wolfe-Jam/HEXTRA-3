/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function CallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, handleRedirectCallback } = useKindeAuth();
  const [error, setError] = useState(null);

  // Log component mount and URL
  useEffect(() => {
    console.log('CallbackPage - URL Info:', {
      fullUrl: window.location.href,
      pathname: location.pathname,
      search: location.search,
      hasCode: location.search.includes('code='),
      hasState: location.search.includes('state=')
    });
  }, [location]);

  // Handle the redirect callback
  useEffect(() => {
    const processCallback = async () => {
      try {
        // Only process if we have a code and state
        if (!location.search.includes('code=') || !location.search.includes('state=')) {
          console.log('CallbackPage - Missing code or state parameters');
          return;
        }

        console.log('CallbackPage - Processing callback...');
        
        // Handle the redirect callback
        if (handleRedirectCallback && typeof handleRedirectCallback === 'function') {
          await handleRedirectCallback();
          console.log('CallbackPage - Callback processed successfully');
        } else {
          console.error('CallbackPage - handleRedirectCallback is not available');
          return;
        }

        // If we're authenticated after callback, redirect
        if (isAuthenticated) {
          console.log('CallbackPage - Authenticated, redirecting to /batch');
          navigate('/batch');
        }
      } catch (err) {
        console.error('CallbackPage - Error:', {
          name: err.name,
          message: err.message,
          stack: err.stack
        });
        setError(err);
      }
    };

    if (!isLoading) {
      processCallback();
    }
  }, [isLoading, handleRedirectCallback, isAuthenticated, navigate, location]);

  // Log state changes
  useEffect(() => {
    console.log('CallbackPage - State:', {
      isAuthenticated,
      isLoading,
      hasError: !!error,
      errorMessage: error?.message
    });
  }, [isAuthenticated, isLoading, error]);

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
