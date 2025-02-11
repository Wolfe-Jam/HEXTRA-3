import React from 'react';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { Box, CircularProgress, Typography } from '@mui/material';
import KindeAuthButtons from './KindeAuthButtons';

export default function KindeAuth({ children }) {
  const { isAuthenticated, isLoading } = useKindeAuth();

  // Debug logging
  console.log(' Auth State:', { isAuthenticated, isLoading });

  if (isLoading) {
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
          Loading...
        </Typography>
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
          background: '#1a1a1a'
        }}
      >
        <Box
          component="img"
          src="/images/HEXTRA-3-logo-Wht.svg"
          alt="Hextra"
          sx={{ width: 200, mb: 4 }}
        />
        <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
          Welcome to HEXTRA
        </Typography>
        <Typography sx={{ color: 'white', opacity: 0.7, mb: 3 }}>
          Please sign in to continue
        </Typography>
        <KindeAuthButtons />
      </Box>
    );
  }

  return children;
}
