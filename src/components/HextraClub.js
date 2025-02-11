import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import GroupsIcon from '@mui/icons-material/Groups';
import GlowTextButton from './GlowTextButton';

// Pricing plans configuration
const PLANS = {
  EARLY_BIRD: {
    name: 'EARLY BIRD',
    title: 'EARLY BIRD BULK',
    price: '$5/month',
    color: '#D50032',
    icon: ElectricBoltIcon,
    features: [
      'BULK',
      'Brand Catalogs',
      'PNG Support',
      'Priority Support'
    ],
    priceId: process.env.REACT_APP_STRIPE_EARLY_BIRD_PRICE_ID
  },
  PRO: {
    name: 'PRO',
    title: 'PRO BULK',
    price: '$10/month',
    color: '#00805E',
    icon: WorkspacePremiumIcon,
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
    icon: GroupsIcon,
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

/**
 * HextraClub Component (v2.2.2)
 * 
 * Displays the HEXTRA Club subscription options with three tiers:
 * - Early Bird ($5/month)
 * - Pro ($10/month)
 * - Team (Contact Us)
 * 
 * @param {Object} props
 * @param {Function} props.onClose - Function to close the modal
 * @version 2.2.2
 */
const HextraClub = ({ onClose }) => {
  const { isAuthenticated, login } = useKindeAuth();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (priceId) => {
    if (!isAuthenticated) {
      login();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPlanCard = (plan) => (
    <Card
      key={plan.name}
      sx={{
        bgcolor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 2,
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)'
        }
      }}
    >
      <CardContent>
        {/* Plan Icon */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 2 
        }}>
          <plan.icon sx={{ 
            fontSize: 48, 
            color: plan.color 
          }} />
        </Box>

        {/* Plan Title */}
        <Typography variant="h5" align="center" gutterBottom>
          {plan.title}
        </Typography>

        {/* Price */}
        <Typography 
          variant="h4" 
          align="center" 
          sx={{ 
            color: plan.color,
            fontWeight: 600,
            mb: 3
          }}
        >
          {plan.price}
        </Typography>

        {/* Features */}
        <Stack spacing={1} sx={{ mb: 3 }}>
          {plan.features.map((feature, index) => (
            <Typography 
              key={index}
              variant="body1"
              align="center"
              sx={{ opacity: 0.8 }}
            >
              {feature}
            </Typography>
          ))}
        </Stack>

        {/* Subscribe Button */}
        {plan.name === 'TEAM' ? (
          <GlowTextButton
            fullWidth
            color={plan.color}
            onClick={() => window.location.href = 'mailto:support@hextra.com'}
          >
            Contact Us
          </GlowTextButton>
        ) : (
          <GlowTextButton
            fullWidth
            color={plan.color}
            onClick={() => handleSubscribe(plan.priceId)}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Subscribe'}
          </GlowTextButton>
        )}
      </CardContent>
    </Card>
  );

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
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ 
          fontFamily: "'League Spartan', sans-serif",
          fontWeight: 600,
          mb: 1
        }}>
          The HEXTRA Club
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Choose your plan to unlock BULK Image Generation
        </Typography>
      </Box>

      {/* User Info */}
      {isAuthenticated && (
        <Card variant="outlined" sx={{ mb: 4 }}>
          <CardContent sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 3
            }}>
              <Typography sx={{ fontWeight: 500 }}>
                {isAuthenticated.given_name} {isAuthenticated.family_name}
              </Typography>
              <Typography 
                color="text.secondary"
                sx={{
                  borderLeft: '2px solid',
                  borderColor: 'divider',
                  pl: 3
                }}
              >
                {isAuthenticated.email}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Pricing Plans */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        justifyContent="center"
        alignItems="stretch"
      >
        {Object.entries(PLANS).map(([key, plan]) => renderPlanCard(plan))}
      </Stack>

      {/* Close Button */}
      {onClose && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button onClick={onClose} color="inherit">
            Close
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default HextraClub;
