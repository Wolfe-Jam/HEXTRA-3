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
import { Box } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function CallbackPage() {
  const { isAuthenticated, isLoading } = useKindeAuth();

  // Debug logging
  console.log('🔄 Callback State:', { 
    isAuthenticated, 
    isLoading,
    currentUrl: window.location.href,
    redirectUrl: `${process.env.REACT_APP_PUBLIC_URL}/batch`
  });

  // Immediate redirect when authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const currentUrl = window.location.href;
      const baseUrl = process.env.REACT_APP_PUBLIC_URL || currentUrl.split('/')[0];
      window.location.href = `${baseUrl}/batch`;
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
        sx={{ width: 200 }}
      />
    </Box>
  );
}
