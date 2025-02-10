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

  // Backup redirect - ensures we don't get stuck
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const timer = setTimeout(() => {
        window.location.href = '/batch';
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading]);

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
      <Typography sx={{ color: 'white' }}>
        {isLoading ? 'Processing login...' : 'Redirecting to dashboard...'}
      </Typography>
    </Box>
  );
}
