/**
 * CallbackPage Component (v2.2.2)
 * 
 * Handles the OAuth callback after Kinde authentication.
 * Shows loading state while processing auth.
 * 
 * @version 2.2.2
 * @lastUpdated 2025-02-10
 */

import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function CallbackPage() {
  const { isAuthenticated, isLoading } = useKindeAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      window.location.href = 'https://www.hextra.io';
    }
  }, [isAuthenticated, isLoading]);

  // Simple loading screen
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000'
      }}
    >
      <Box
        component="img"
        src="/images/HEXTRA-3-logo-Blk.svg"
        alt="Hextra"
        sx={{ width: 200 }}
      />
    </Box>
  );
}
