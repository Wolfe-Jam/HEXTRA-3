/**
 * CallbackPage Component (v2.2.3)
 * 
 * Handles the OAuth callback after Kinde authentication.
 * Shows loading state and ensures redirect happens.
 * Includes error handling and diagnostics.
 */

import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function CallbackPage() {
  const { isAuthenticated, isLoading, user } = useKindeAuth();
  const [error, setError] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Track elapsed time for debugging
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Log auth status for debugging
  useEffect(() => {
    console.log("CallbackPage: Auth status", { isAuthenticated, isLoading });
    if (user) {
      console.log("CallbackPage: User", user);
    }
  }, [isAuthenticated, isLoading, user]);

  // Main redirect handler
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log("CallbackPage: Authentication successful, redirecting...");
      try {
        // Redirect to the batch page
        const timer = setTimeout(() => {
          window.location.href = '/batch';
        }, 1000);
        return () => clearTimeout(timer);
      } catch (err) {
        console.error("CallbackPage: Redirect error", err);
        setError("Error during redirect: " + err.message);
      }
    } else if (!isLoading && timeElapsed > 10) {
      // If we've been loading for more than 10 seconds, something is wrong
      console.error("CallbackPage: Authentication timed out");
      setError("Authentication timed out. Please try again.");
    }
  }, [isAuthenticated, isLoading, timeElapsed]);

  // Backup redirect for safety
  useEffect(() => {
    const backupTimer = setTimeout(() => {
      if (!isAuthenticated && !isLoading && !error) {
        console.log("CallbackPage: Backup redirect triggered");
        window.location.href = '/';
      }
    }, 15000);
    return () => clearTimeout(backupTimer);
  }, [isAuthenticated, isLoading, error]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: 2
      }}
    >
      <Typography variant="h4" component="h1" textAlign="center">
        {isAuthenticated 
          ? "Sign in successful!" 
          : "Completing sign in..."}
      </Typography>
      
      {error ? (
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
      ) : (
        <>
          <CircularProgress size={60} />
          <Typography variant="body1" color="text.secondary" textAlign="center">
            {isAuthenticated 
              ? "Redirecting you to the application..." 
              : "Verifying your credentials..."}
          </Typography>
        </>
      )}
      
      {timeElapsed > 5 && !isAuthenticated && !error && (
        <Alert severity="info" sx={{ maxWidth: 500 }}>
          This is taking longer than expected. 
          {timeElapsed > 10 ? " You will be redirected to the home page shortly." : ""}
        </Alert>
      )}
    </Box>
  );
}
