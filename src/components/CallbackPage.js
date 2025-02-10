/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function CallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, login } = useKindeAuth();
  const [authAttempts, setAuthAttempts] = useState(0);

  // Log component mount
  useEffect(() => {
    console.log('CallbackPage - Mounted', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash
    });
  }, []);

  // Log state changes
  useEffect(() => {
    console.log('CallbackPage - State Update:', {
      isAuthenticated,
      isLoading,
      authAttempts,
      currentUrl: window.location.href,
      hasLoginFunction: !!login
    });
  }, [isAuthenticated, isLoading, authAttempts]);

  // Handle initial auth
  useEffect(() => {
    const handleAuth = async () => {
      try {
        console.log('CallbackPage - Starting auth flow:', {
          isAuthenticated,
          isLoading,
          attempt: authAttempts + 1
        });

        // If not authenticated and not loading, try to log in
        if (!isAuthenticated && !isLoading) {
          console.log('CallbackPage - Attempting login...');
          await login({
            appState: { returnTo: '/batch' }
          });
          setAuthAttempts(prev => prev + 1);
        }
        
        // If authenticated, redirect
        if (isAuthenticated) {
          console.log('CallbackPage - Authentication successful, redirecting...');
          navigate('/batch');
        }
      } catch (error) {
        console.error('CallbackPage - Auth error:', {
          name: error.name,
          message: error.message,
          stack: error.stack,
          url: window.location.href,
          search: location.search,
          attempt: authAttempts
        });
      }
    };

    // Only attempt auth if we haven't tried too many times
    if (authAttempts < 3) {
      handleAuth();
    } else {
      console.error('CallbackPage - Too many auth attempts');
    }
  }, [isAuthenticated, isLoading, login, navigate, location, authAttempts]);

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
