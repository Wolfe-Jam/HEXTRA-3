import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useNavigate } from 'react-router-dom';
import GlowButton from './GlowButton';
import { useTheme } from '../context';

export default function ProfilePage() {
  const { user, logout } = useKindeAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Handle logout
  const handleLogout = () => {
    logout();
    // Navigate to the subscription page after logout
    navigate('/subscription');
  };

  // Handle return to app
  const handleReturnToApp = () => {
    navigate('/app');
  };

  return (
    <Box sx={{ 
      padding: '40px 20px',
      maxWidth: '600px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 200px)'
    }}>
      <Typography 
        variant="h3" 
        component="h1" 
        sx={{ 
          mb: 4, 
          textAlign: 'center',
          color: 'var(--text-primary)',
          fontWeight: 600
        }}
      >
        Your Profile
      </Typography>
      
      {/* User Information */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          mb: 4,
          bgcolor: 'var(--background-paper)',
          borderRadius: 2
        }}
      >
        {user ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  borderRadius: '50%', 
                  bgcolor: '#224D8F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  mr: 2,
                  boxShadow: 'var(--box-shadow)'
                }}
              >
                {user.given_name ? user.given_name[0].toUpperCase() : '?'}
              </Box>
              <Box>
                <Typography variant="h5" sx={{ color: 'var(--text-primary)' }}>
                  {user.given_name} {user.family_name}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.7, color: 'var(--text-primary)' }}>
                  {user.email}
                </Typography>
              </Box>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 3, color: 'var(--text-primary)' }}>
              Account ID: {user.id}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <GlowButton onClick={handleReturnToApp}>
                Return to App
              </GlowButton>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleLogout}
                sx={{ 
                  borderColor: '#D50032',
                  color: '#D50032',
                  '&:hover': {
                    borderColor: '#FF0F45',
                    backgroundColor: 'rgba(213, 0, 50, 0.04)'
                  }
                }}
              >
                Log Out
              </Button>
            </Box>
          </>
        ) : (
          <Typography sx={{ color: 'var(--text-primary)' }}>
            Please log in to view your profile information.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}