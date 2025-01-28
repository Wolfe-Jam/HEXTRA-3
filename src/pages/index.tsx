import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  return (
    <Box 
      sx={{ 
        p: 4,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#1a1a1a',
        color: 'white'
      }}
    >
      <Typography variant="h1" sx={{ mb: 4, fontSize: '3rem' }}>
        HEXTRA
      </Typography>
      <Typography variant="h2" sx={{ mb: 4, fontSize: '1.5rem', color: '#888' }}>
        Professional-grade color manipulation suite
      </Typography>
      <Button 
        variant="contained" 
        color="primary"
        size="large"
        onClick={() => router.push('/demo')}
        sx={{ 
          mt: 2,
          px: 4,
          py: 2,
          fontSize: '1.2rem',
          backgroundColor: '#2196f3',
          '&:hover': {
            backgroundColor: '#1976d2'
          }
        }}
      >
        Launch HEXTRA
      </Button>
    </Box>
  );
}
