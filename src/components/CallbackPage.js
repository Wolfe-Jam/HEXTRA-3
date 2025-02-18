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

const CallbackPage = () => {
  const { isAuthenticated, isLoading } = useKindeAuth();

  useEffect(() => {
    // Always redirect to production URL after authentication
    window.location.href = 'https://www.hextra.io';
  }, []);

  // Simple loading screen
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100vw'
      }}
    >
      <img 
        src="/images/loading.gif" 
        alt="Loading..."
        style={{
          width: '50px',
          height: '50px'
        }}
      />
    </Box>
  );
};

export default CallbackPage;
