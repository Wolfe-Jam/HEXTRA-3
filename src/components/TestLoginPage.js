import React, { useEffect } from 'react';
import { Box, Button, Typography, Paper, Divider, Alert, Grid, Chip } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';

export default function TestLoginPage() {
  const { login, logout, isAuthenticated, isLoading, user } = useKindeAuth();
  const navigate = useNavigate();

  // Get environment variables
  const envVars = {
    // React App (CRA) format
    REACT_APP_KINDE_CLIENT_ID: process.env.REACT_APP_KINDE_CLIENT_ID || 'Not set',
    REACT_APP_KINDE_DOMAIN: process.env.REACT_APP_KINDE_DOMAIN || 'Not set',
    REACT_APP_KINDE_REDIRECT_URI: process.env.REACT_APP_KINDE_REDIRECT_URI || 'Not set',
    REACT_APP_KINDE_LOGOUT_URI: process.env.REACT_APP_KINDE_LOGOUT_URI || 'Not set',
    // Standard format
    KINDE_CLIENT_ID: process.env.KINDE_CLIENT_ID || 'Not set',
    KINDE_ISSUER_URL: process.env.KINDE_ISSUER_URL || 'Not set',
    KINDE_POST_LOGIN_REDIRECT_URL: process.env.KINDE_POST_LOGIN_REDIRECT_URL || 'Not set',
    KINDE_POST_LOGOUT_REDIRECT_URL: process.env.KINDE_POST_LOGOUT_REDIRECT_URL || 'Not set'
  };

  // Generate a direct login URL as a backup method
  const generateLoginUrl = () => {
    const clientId = process.env.KINDE_CLIENT_ID || process.env.REACT_APP_KINDE_CLIENT_ID;
    const domain = process.env.KINDE_ISSUER_URL || process.env.REACT_APP_KINDE_DOMAIN;
    const redirectUri = process.env.KINDE_POST_LOGIN_REDIRECT_URL || process.env.REACT_APP_KINDE_REDIRECT_URI;
    
    if (!clientId || !domain || !redirectUri) {
      return null;
    }
    
    // Create random state for security
    const state = Math.random().toString(36).substring(2);
    
    // Build the authorization URL
    return `${domain}/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email&state=${state}`;
  };

  // Log diagnostic info
  useEffect(() => {
    if (!process.env.KINDE_CLIENT_ID && !process.env.REACT_APP_KINDE_CLIENT_ID) {
      console.error("❌ No Client ID found in environment variables");
    }
    
    console.log("Auth status:", isAuthenticated ? "✅ Authenticated" : "❌ Not authenticated");
    console.log("Loading state:", isLoading ? "⏳ Loading" : "✅ Done");
    if (user) {
      console.log("User info:", user);
    }
    
    // Log environment variables to console for debugging
    console.log("Environment Variables:", envVars);
  }, [isAuthenticated, isLoading, user]);

  const directLoginUrl = generateLoginUrl();

  return (
    <Box sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Authentication Test Page
      </Typography>
      
      <Alert severity={isAuthenticated ? "success" : "info"} sx={{ mb: 3 }}>
        You are currently <strong>{isAuthenticated ? "signed in" : "not signed in"}</strong>
        {isLoading && " (loading...)"}
      </Alert>
      
      {/* Authentication controls */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Authentication Controls</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          {isAuthenticated ? (
            <Button variant="contained" color="error" onClick={logout}>
              Sign Out
            </Button>
          ) : (
            <>
              <Button variant="contained" color="primary" onClick={login}>
                Sign In with Kinde SDK
              </Button>
              
              {directLoginUrl && (
                <Button 
                  variant="outlined" 
                  color="primary"
                  component="a"
                  href={directLoginUrl}
                >
                  Direct Sign In Link
                </Button>
              )}
            </>
          )}
          
          <Button 
            variant="outlined" 
            onClick={() => navigate('/batch')}
          >
            Back to App
          </Button>
        </Box>
        
        {isAuthenticated && user && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Authenticated User:</Typography>
            <Box sx={{ p: 2, bgcolor: 'rgba(0, 128, 0, 0.1)', borderRadius: 1 }}>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>ID:</strong> {user.id}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Email:</strong> {user.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Name:</strong> {user.given_name || ''} {user.family_name || ''}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Permissions:</strong>
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {user.permissions?.length > 0 ? (
                      user.permissions.map((perm, i) => (
                        <Chip key={i} label={perm} size="small" color="primary" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No permissions found</Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        )}
      </Paper>
      
      {/* Environment Variables Section */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Environment Variables</Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          React only exposes environment variables prefixed with REACT_APP_ to the client.
          The Kinde SDK in this version expects non-prefixed variables but we're supporting both.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>Standard Variables (Kinde SDK v4+)</Typography>
        <Grid container spacing={1}>
          {Object.entries(envVars)
            .filter(([key]) => !key.startsWith('REACT_APP_'))
            .map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Chip 
                    size="small" 
                    color={value !== 'Not set' ? 'success' : 'error'} 
                    label={value !== 'Not set' ? '✓' : '✗'} 
                    sx={{ mr: 1 }} 
                  />
                  <Typography variant="body2">
                    <strong>{key}:</strong> {value === 'Not set' ? value : '•••••••••••••••••'}
                  </Typography>
                </Box>
              </Grid>
          ))}
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>CRA Variables (React App Prefix)</Typography>
        <Grid container spacing={1}>
          {Object.entries(envVars)
            .filter(([key]) => key.startsWith('REACT_APP_'))
            .map(([key, value]) => (
              <Grid item xs={12} sm={6} key={key}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 1
                }}>
                  <Chip 
                    size="small" 
                    color={value !== 'Not set' ? 'success' : 'error'} 
                    label={value !== 'Not set' ? '✓' : '✗'} 
                    sx={{ mr: 1 }} 
                  />
                  <Typography variant="body2">
                    <strong>{key}:</strong> {value === 'Not set' ? value : '•••••••••••••••••'}
                  </Typography>
                </Box>
              </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
