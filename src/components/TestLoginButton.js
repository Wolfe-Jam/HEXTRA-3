import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

/**
 * TestLoginButton - Adds a large, obvious login button to the page for testing
 */
export default function TestLoginButton() {
  const { login, logout, isAuthenticated, isLoading, user } = useKindeAuth();
  const [showDebug, setShowDebug] = useState(false);

  // Get config values from either naming pattern
  const clientId = process.env.KINDE_CLIENT_ID || process.env.REACT_APP_KINDE_CLIENT_ID;
  const domain = process.env.KINDE_ISSUER_URL || process.env.REACT_APP_KINDE_DOMAIN;
  const redirectUri = process.env.KINDE_POST_LOGIN_REDIRECT_URL || process.env.REACT_APP_KINDE_REDIRECT_URI;
  
  // Generate a direct login URL as a backup method
  const generateLoginUrl = () => {
    if (!clientId || !domain || !redirectUri) {
      return null;
    }
    
    // Create random state and verifier for PKCE
    const state = Math.random().toString(36).substring(2);
    
    // Build the authorization URL - use the exact redirect URI from environment
    return `${domain}/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email&state=${state}`;
  };
  
  // Get the direct login URL
  const directLoginUrl = generateLoginUrl();

  return (
    <Box sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }}>
      {showDebug && (
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 2, 
            width: '300px', 
            backgroundColor: 'rgba(255, 255, 255, 0.9)'
          }}
        >
          <Typography variant="subtitle2" gutterBottom>Auth Status</Typography>
          <Typography variant="body2">
            Loading: {isLoading ? 'Yes' : 'No'}<br />
            Authenticated: {isAuthenticated ? 'Yes' : 'No'}<br />
            {isAuthenticated && user && (
              <>User: {user.given_name || user.email}<br /></>
            )}
          </Typography>
          
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>Environment</Typography>
          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
            Client ID: {clientId ? '✅' : '❌'}<br />
            Domain: {domain ? '✅' : '❌'}<br />
            Redirect URI: {redirectUri ? '✅' : '❌'}<br />
          </Typography>

          <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
            <Button 
              size="small" 
              variant="outlined" 
              onClick={() => {
                console.log("Auth State:", { isAuthenticated, isLoading, user });
                console.log("Environment Variables:");
                // Log both variable patterns
                console.log("KINDE_CLIENT_ID:", process.env.KINDE_CLIENT_ID ? "Set" : "Not set");
                console.log("KINDE_ISSUER_URL:", process.env.KINDE_ISSUER_URL ? "Set" : "Not set");
                console.log("KINDE_POST_LOGIN_REDIRECT_URL:", process.env.KINDE_POST_LOGIN_REDIRECT_URL ? "Set" : "Not set");
                console.log("KINDE_POST_LOGOUT_REDIRECT_URL:", process.env.KINDE_POST_LOGOUT_REDIRECT_URL ? "Set" : "Not set");
                console.log("REACT_APP_KINDE_CLIENT_ID:", process.env.REACT_APP_KINDE_CLIENT_ID ? "Set" : "Not set");
                console.log("REACT_APP_KINDE_DOMAIN:", process.env.REACT_APP_KINDE_DOMAIN ? "Set" : "Not set");
                console.log("REACT_APP_KINDE_REDIRECT_URI:", process.env.REACT_APP_KINDE_REDIRECT_URI ? "Set" : "Not set");
                console.log("REACT_APP_KINDE_LOGOUT_URI:", process.env.REACT_APP_KINDE_LOGOUT_URI ? "Set" : "Not set");
              }}
            >
              Log to Console
            </Button>
            {isAuthenticated ? (
              <Button 
                size="small" 
                variant="contained" 
                color="primary" 
                onClick={logout}
              >
                Sign Out
              </Button>
            ) : (
              <Button 
                size="small" 
                variant="contained" 
                color="primary" 
                onClick={login}
              >
                Sign In
              </Button>
            )}
          </Box>
        </Paper>
      )}
      
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button 
          variant="contained" 
          color="secondary" 
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? 'Hide Debug' : 'Debug Auth'}
        </Button>
        
        {!isAuthenticated && directLoginUrl && (
          <Button 
            variant="contained" 
            color="primary" 
            component="a"
            href={directLoginUrl}
          >
            DIRECT LOGIN LINK
          </Button>
        )}
      </Box>
    </Box>
  );
}
