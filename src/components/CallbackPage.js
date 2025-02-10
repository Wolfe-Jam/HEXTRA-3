import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';

export default function CallbackPage() {
  const { isLoading } = useKindeAuth();

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
        {isLoading ? 'Processing login...' : 'Redirecting...'}
      </Typography>
    </Box>
  );
}
