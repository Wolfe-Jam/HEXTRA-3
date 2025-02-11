/**
 * CallbackPage Component (v2.2.2)
 * 
 * Handles the OAuth callback after Kinde authentication.
 * Shows loading state and ensures redirect happens.
 * 
 * Features:
 * - Loading spinner during auth processing
 * - Clear status messages
 * - Backup redirect timer (2s)
 * - Graceful auth state handling
 * 
 * @version 2.2.2
 * @lastUpdated 2025-02-10
 */

import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function CallbackPage() {
  const { isAuthenticated, isLoading } = useKindeAuth();

  // Debug logging
  console.log('🔄 Callback State:', { isAuthenticated, isLoading });

  // Immediate redirect when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Redirect to the app's root URL
      const redirectUrl = process.env.REACT_APP_KINDE_POST_LOGIN_REDIRECT_URL || process.env.REACT_APP_PUBLIC_URL;
      console.log('🔄 Redirecting to:', redirectUrl);
      window.location.replace(redirectUrl);
    }
  }, [isAuthenticated, isLoading]);

  // Backup redirect - ensures we don't get stuck
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        const redirectUrl = process.env.REACT_APP_KINDE_POST_LOGIN_REDIRECT_URL || process.env.REACT_APP_PUBLIC_URL;
        console.log('⏰ Backup redirect to:', redirectUrl);
        window.location.replace(redirectUrl);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a1a1a'
      }}
    >
      <Box
        component="img"
        src="/images/HEXTRA-3-logo-Wht.svg"
        alt="Hextra"
        sx={{ width: 200, mb: 4 }}
      />
      <CircularProgress sx={{ color: 'white', mb: 2 }} />
      <Typography sx={{ color: 'white', opacity: 0.7 }}>
        Completing sign in...
      </Typography>
    </Box>
  );
}
