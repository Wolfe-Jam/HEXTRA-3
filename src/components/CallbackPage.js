/**
 * CallbackPage Component (v2.2.2)
 * 
 * Handles the OAuth callback after Kinde authentication.
 * Shows loading state and ensures redirect happens.
 * 
 * Features:
 * - Loading spinner during auth processing
 * - Clear status messages
 * - Proper Kinde callback handling
 * - Return URL restoration
 * 
 * @version 2.2.2
 * @lastUpdated 2025-02-10
 */

import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';

export default function CallbackPage() {
  const { handleCallback } = useKindeAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function processCallback() {
      try {
        // Get return URL from localStorage or default to home
        const returnTo = localStorage.getItem('returnTo') || '/';
        localStorage.removeItem('returnTo'); // Clean up

        // Handle Kinde callback
        await handleCallback();

        // Navigate back to original page
        navigate(returnTo, { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/', { replace: true });
      }
    }

    processCallback();
  }, [handleCallback, navigate]);

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
      <CircularProgress sx={{ color: 'white', mb: 2 }} />
      <Typography variant="body1" sx={{ color: 'white' }}>
        Completing sign in...
      </Typography>
    </Box>
  );
}
