import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Divider,
  Stack
} from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { useSubscriptionStatus } from '../hooks/useSubscriptionStatus';
import GlowTextButton from './GlowTextButton';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { createCheckoutSession } from '../api/stripe-api';

const PLANS = {
  EARLY_BIRD: {
    name: 'EARLY BIRD',
    title: 'EARLY BIRD BULK',
    price: '$5/month',
    color: '#D50032',
    features: [
      'BULK',
      'Brand Catalogs',
      'PNG Support',
      'Priority Support'
    ],
    priceId: 'price_1Qmnv12KJ00ahaMqNsdpkluL'
  },
  PRO: {
    name: 'PRO',
    title: 'PRO BULK',
    price: '$10/month',
    color: '#00805E',
    features: [
      'BULK',
      'Brand Catalogs',
      'Custom Shirts',
      'PNG Support',
      'Expert Export Settings'
    ],
    priceId: process.env.REACT_APP_STRIPE_PRO_PRICE_ID
  },
  TEAM: {
    name: 'TEAM',
    title: 'TEAM BULK',
    price: 'Contact Us',
    color: '#224D8F',
    features: [
      'BULK',
      'Brand Catalogs',
      'Custom Shirts',
      'PNG Support',
      'Expert Export Settings',
      'Multi-User Access',
      'API Integration'
    ]
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'FEB 01 2025';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'FEB 01 2025';
  
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month} ${day} ${year}`;
};

const SubscriptionTest = ({ onClose }) => {
  const { user, logout } = useKindeAuth();
  const { status, loading } = useSubscriptionStatus();

  const userInitial = user?.given_name?.[0] || user?.email?.[0] || 'H';

  const handleSubscribe = async (key) => {
    try {
      console.log('Starting subscription process for:', key);
      console.log('User:', user);
      console.log('Price ID:', PLANS[key].priceId);

      const { url } = await createCheckoutSession(
        user.id,
        PLANS[key].priceId,
        user.email
      );
      
      if (url) {
        console.log('Redirecting to:', url);
        window.location.href = url;
      } else {
        console.error('No checkout URL received');
      }
    } catch (error) {
      console.error('Subscription error:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  console.log('onClose function:', onClose);

  return (
    <Box sx={{ 
      width: '100%', 
      maxWidth: 1200, 
      mx: 'auto', 
      p: 4,
      position: 'relative',
      backgroundColor: 'background.paper',
      borderRadius: 2
    }}>
      {/* User Initial Badge */}
      {/* <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 24,
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: PLANS.EARLY_BIRD.color,
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          fontWeight: 700,
          fontFamily: "'League Spartan', sans-serif",
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          border: '2px solid #FFFFFF',
          zIndex: 2,
          transform: 'translateY(-50%)'
        }}
      >
        {userInitial}
      </Box> */}

      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontFamily: "'League Spartan', sans-serif",
          fontWeight: 600,
          mb: 1
        }}>
          The HEXTRA Club
        </Typography>
      </Box>

      {/* User Info Bar */}
      <Card variant="outlined" sx={{ mb: 4 }}>
        <CardContent sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          py: 2
        }}>
          {/* Left Side */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 3
          }}>
            <Typography sx={{ 
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              {user?.given_name} {user?.family_name}
            </Typography>
            <Typography 
              color="text.secondary"
              sx={{
                borderLeft: '2px solid',
                borderColor: 'divider',
                pl: 3
              }}
            >
              {user?.email}
            </Typography>
          </Box>

          {/* Right Side */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 3
          }}>
            <Typography 
              color="text.secondary"
              sx={{
                borderRight: '2px solid',
                borderColor: 'divider',
                pr: 3
              }}
            >
              {formatDate(user?.created_at)}
            </Typography>
            <Typography sx={{ fontWeight: 500 }}>
              {loading ? 'Loading...' : status || 'Pro B.I.G.'}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button onClick={onClose} startIcon={<ArrowBackIcon />}>
          Back to Image Generation
        </Button>
        <Button onClick={handleLogout} color="secondary">
          Logout
        </Button>
      </Box>

      {/* Subscription Plans */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={3} 
        sx={{ mb: 4 }}
      >
        {Object.entries(PLANS).map(([key, plan]) => (
          <Card 
            key={key} 
            variant="outlined" 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              border: '1px solid var(--border-color)',
              bgcolor: 'var(--bg-secondary)',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 16,
                right: 16,
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: plan.color,
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.125rem',
                fontWeight: 700,
                fontFamily: "'League Spartan', sans-serif",
                boxShadow: key === 'EARLY_BIRD' 
                  ? '0 0 10px #FFD700, 0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 8px rgba(255, 215, 0, 0.3)' 
                  : '0 2px 4px rgba(0,0,0,0.2)',
                border: '2px solid #FFFFFF',
                zIndex: 2,
                '& svg': {
                  fontSize: '1.25rem',
                  filter: key === 'EARLY_BIRD' ? 'drop-shadow(0 0 4px #FFD700)' : 'none',
                },
                transition: 'all 0.3s ease-in-out',
                '@keyframes pulseGlow': {
                  '0%': {
                    boxShadow: '0 0 10px #FFD700, 0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 8px rgba(255, 215, 0, 0.3)'
                  },
                  '50%': {
                    boxShadow: '0 0 15px #FFD700, 0 0 30px rgba(255, 215, 0, 0.6), inset 0 0 12px rgba(255, 215, 0, 0.4)'
                  },
                  '100%': {
                    boxShadow: '0 0 10px #FFD700, 0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 8px rgba(255, 215, 0, 0.3)'
                  }
                },
                animation: key === 'EARLY_BIRD' ? 'pulseGlow 2s infinite' : 'none'
              }}
            >
              {key === 'EARLY_BIRD' ? <ElectricBoltIcon /> : 
               key === 'PRO' ? <WorkspacePremiumIcon /> : 
               <GroupsIcon />}
            </Box>
            <CardContent>
              <Typography variant="h6" sx={{ 
                fontFamily: "'League Spartan', sans-serif",
                fontWeight: 600,
                mb: 3,
                letterSpacing: 1
              }}>
                {plan.name} B.I.G.
              </Typography>
              <Typography variant="h5" sx={{ mb: 2 }}>
                {plan.price}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={1}>
                {plan.features.map((feature, index) => (
                  <Typography 
                    key={index} 
                    variant={index === 0 ? "h6" : "body2"}
                    sx={{ 
                      fontWeight: index === 0 ? 700 : 400,
                      mb: index === 0 ? 3 : 0,
                      color: index === 0 ? plan.color : 'inherit',
                      fontFamily: index === 0 ? "'League Spartan', sans-serif" : 'inherit',
                      letterSpacing: index === 0 ? 1 : 'inherit',
                      textTransform: 'none',
                      textAlign: index === 0 ? 'left' : 'left',
                      pt: index === 0 ? 2 : 0,
                      whiteSpace: index === 0 ? 'nowrap' : 'normal'
                    }}
                  >
                    {index === 0 ? (
                      'BULK IMAGE GENERATION'
                    ) : (
                      `• ${feature}`
                    )}
                  </Typography>
                ))}
              </Stack>
              <Button
                fullWidth
                variant="contained"
                onClick={() => key === 'TEAM' ? window.location.href = 'mailto:support@hextra.com' : handleSubscribe(key)}
                disabled={loading || (status && status.includes(plan.name))}
                sx={{
                  mt: 3,
                  backgroundColor: plan.color,
                  color: '#FFFFFF',
                  textTransform: 'none',
                  borderRadius: 1,
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: plan.color,
                    opacity: 0.9,
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                  },
                  '&:disabled': {
                    backgroundColor: 'rgba(0, 0, 0, 0.12)',
                    color: 'rgba(0, 0, 0, 0.26)'
                  }
                }}
              >
                {key === 'TEAM' ? 'Contact Us' : 
                 status && status.includes(plan.name) ? 'Current Plan' : 'Subscribe'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Back Button */}
      <Box sx={{ textAlign: 'center' }}>
        <GlowTextButton 
          onClick={onClose}
          sx={{ 
            fontFamily: "'League Spartan', sans-serif",
            fontSize: '0.9rem'
          }}
        >
          Back to Image Generation
        </GlowTextButton>
      </Box>
    </Box>
  );
};

export default SubscriptionTest;
