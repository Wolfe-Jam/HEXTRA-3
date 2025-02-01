import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import GlowTextButton from './GlowTextButton';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: '#000',
        color: '#fff',
        padding: 3,
      }}
    >
      <CheckCircleIcon sx={{ fontSize: 80, color: '#00D100', mb: 3 }} />
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 2 }}>
        CONGRATS! 🎉 EARLY BIRD! 🐥
      </Typography>
      <Stack spacing={1} alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h5" align="center" sx={{ 
          fontWeight: 'bold',
          letterSpacing: '0.1em'
        }}>
          B.I.G.
        </Typography>
        <Typography variant="h6" align="center">
          Lifetime Savings
        </Typography>
        <Typography variant="h6" align="center" sx={{ 
          fontSize: '1.1rem',
          opacity: 0.9 
        }}>
          on
        </Typography>
        <Typography variant="h6" align="center" sx={{ 
          fontWeight: 'bold',
          letterSpacing: '0.05em'
        }}>
          BULK IMAGE GENERATION
        </Typography>
      </Stack>
      <GlowTextButton
        variant="contained"
        onClick={() => navigate('/batch')}
        sx={{ 
          minWidth: 200,
          fontSize: '1.1rem',
          fontWeight: 'bold'
        }}
      >
        Let's Create ✨
      </GlowTextButton>
    </Box>
  );
};

export default SubscriptionSuccess;
