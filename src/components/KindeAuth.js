/**
 * KindeAuth Component (v2.2.2)
 * 
 * Provides authentication wrapper for the application using Kinde Auth.
 * Handles the OAuth2 PKCE flow and redirects.
 * 
 * Flow:
 * 1. User clicks sign in
 * 2. Kinde handles authentication
 * 3. Redirects back to callback URL
 * 4. Processes tokens and redirects to /batch
 * 
 * @version 2.2.2
 * @lastUpdated 2025-02-10
 */

import React from 'react';
import { KindeProvider } from '@kinde-oss/kinde-auth-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, Button } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import CallbackPage from './CallbackPage';

// Protected route wrapper
function RequireAuth({ children }) {
  const { isLoading, isAuthenticated, login } = useKindeAuth();

  if (isLoading) {
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
      </Box>
    );
  }

  if (!isAuthenticated) {
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
        <Button
          variant="contained"
          onClick={() => login()}
          sx={{
            backgroundColor: '#4CAF50',
            '&:hover': {
              backgroundColor: '#45a049'
            }
          }}
        >
          SIGN IN
        </Button>
      </Box>
    );
  }

  return children;
}

export default function KindeAuth({ children }) {
  // Debug logging for redirect URLs
  console.log('🔧 KindeAuth URLs:', {
    publicUrl: process.env.REACT_APP_PUBLIC_URL,
    currentUrl: window.location.href
  });

  const config = {
    // Required Kinde configuration
    clientId: process.env.REACT_APP_KINDE_CLIENT_ID,
    domain: process.env.REACT_APP_KINDE_DOMAIN,
    redirectUri: process.env.REACT_APP_KINDE_REDIRECT_URI,
    logoutUri: process.env.REACT_APP_KINDE_LOGOUT_URI,

    // Auth configuration
    responseType: 'code',  // Use authorization code flow
    scope: 'openid profile email',  // Required scopes

    // Redirect handler - keeps it simple and reliable
    onRedirectCallback: (user) => {
      // Go to root where App is mounted
      // App will handle showing subscription or BIG features based on auth state
      window.location.href = process.env.REACT_APP_PUBLIC_URL || window.location.origin;
    }
  };

  return (
    <KindeProvider {...config}>
      <Router>
        <Routes>
          <Route path="/api/auth/kinde/callback" element={<CallbackPage />} />
          <Route path="*" element={<RequireAuth>{children}</RequireAuth>} />
        </Routes>
      </Router>
    </KindeProvider>
  );
}
