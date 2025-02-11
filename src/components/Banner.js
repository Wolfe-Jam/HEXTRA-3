import React, { useState } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import GlowIconButton from './GlowIconButton';
import HextraClub from './HextraClub';

/**
 * Banner Component (v2.2.2)
 * 
 * Top banner with three perfectly positioned buttons:
 * 1. Theme toggle (light/dark)
 * 2. T-shirt status
 * 3. User initial/auth
 * 
 * @version 2.2.2
 */
const Banner = ({ isDarkMode, onThemeToggle, version, isBatchMode, setIsBatchMode, setShowSubscriptionTest }) => {
  const { isAuthenticated, user, login, logout } = useKindeAuth();
  const [showSubscription, setShowSubscription] = useState(false);

  const handleLogout = () => {
    // First scroll to batch section
    const batchSection = document.querySelector('.batch-processing-section');
    if (batchSection) {
      batchSection.scrollIntoView({ behavior: 'smooth' });
    }

    // After scroll animation, do the logout
    setTimeout(() => {
      logout({
        post_logout_redirect_uri: `${window.location.origin}/#batch-section`
      });
    }, 800); // Wait for scroll animation
  };

  const scrollToBatch = () => {
    const batchSection = document.querySelector('.batch-processing-section');
    if (batchSection) {
      batchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const COLORS = {
    textDark: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
    textLight: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'
  };

  return (
    <>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        height: '62px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bgcolor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 1000
      }}>
        {/* Left side - Logo */}
        <Box 
          component="img" 
          src="/images/HEXTRA-3-logo.svg" 
          alt="HEXTRA"
          sx={{ 
            height: 24,
            filter: 'var(--invert-logo)'
          }} 
        />

        {/* Right side - Controls */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          '& > *': { // Ensure consistent button sizes
            width: 40,
            height: 40,
            borderRadius: '50%'
          }
        }}>
          {/* Theme Toggle */}
          <GlowIconButton 
            onClick={onThemeToggle}
            sx={{
              color: 'var(--text-primary)',
              '&:hover': {
                bgcolor: 'var(--hover-light)'
              }
            }}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </GlowIconButton>

          {/* T-shirt Status */}
          <Tooltip title={isAuthenticated ? "Full Access" : "Single Shirt Only"}>
            <GlowIconButton
              onClick={() => !isAuthenticated && login()}
              sx={{
                color: 'var(--text-primary)',
                position: 'relative',
                '&:hover': {
                  bgcolor: 'var(--hover-light)'
                },
                ...(isAuthenticated && {
                  bgcolor: 'rgba(0, 128, 94, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(0, 128, 94, 0.1)',
                    cursor: 'default'
                  }
                })
              }}
            >
              <Box
                component="img"
                src={isAuthenticated ? "/images/tshirts-icon.svg" : "/images/tshirt-icon.svg"}
                alt={isAuthenticated ? "Full Access" : "Single Shirt Only"}
                sx={{
                  width: 20,
                  height: 20,
                  filter: isDarkMode ? 'none' : 'invert(1)'
                }}
              />
            </GlowIconButton>
          </Tooltip>

          {/* User Initial/Auth Button */}
          {isAuthenticated ? (
            <Tooltip title={`${user?.given_name} ${user?.family_name}`}>
              <GlowIconButton
                onClick={() => setShowSubscription(true)}
                sx={{
                  bgcolor: '#D50032', // Brand red
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#D50032',
                    opacity: 0.9
                  }
                }}
              >
                <Typography>
                  {user?.given_name?.[0]?.toUpperCase() || '?'}
                </Typography>
              </GlowIconButton>
            </Tooltip>
          ) : (
            <GlowIconButton
              onClick={login}
              sx={{
                bgcolor: '#D50032', // Brand red
                color: 'white',
                '&:hover': {
                  bgcolor: '#D50032',
                  opacity: 0.9
                }
              }}
            >
              <Typography>H</Typography>
            </GlowIconButton>
          )}
        </Box>
      </Box>

      {/* Subscription Dialog */}
      {showSubscription && (
        <HextraClub onClose={() => setShowSubscription(false)} />
      )}
    </>
  );
};

export default Banner;
