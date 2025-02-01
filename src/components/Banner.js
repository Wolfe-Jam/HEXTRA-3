import React, { useState, useMemo } from 'react';
import { Box, Typography, IconButton, Button, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AboutDialog from './AboutDialog';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { VERSION } from '../version';
import GlowIconButton from './GlowIconButton';

const BRAND_COLORS = ['#D50032', '#00805E', '#224D8F'];  // Red, Green, Blue

const Banner = ({
  version,
  isDarkMode,
  onThemeToggle,
  isBatchMode,
  setIsBatchMode,
  setShowSubscriptionTest
}) => {
  const [aboutOpen, setAboutOpen] = useState(false);
  const { isAuthenticated, user, login, logout } = useKindeAuth();

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

  // Generate a consistent color based on user's email
  const userColor = useMemo(() => {
    if (!user?.email) return BRAND_COLORS[0];
    const index = user.email.length % BRAND_COLORS.length;
    return BRAND_COLORS[index];
  }, [user?.email]);

  // Get user's initial
  const userInitial = useMemo(() => {
    if (!user?.given_name) return '?';
    return user.given_name.charAt(0).toUpperCase();
  }, [user?.given_name]);

  return (
    <Box 
      className="app-banner"
      onMouseLeave={() => document.activeElement.blur()}
      sx={{
        width: '100%',
        margin: 0,
        padding: 0,
        overflow: 'visible'
      }}
    >
      <Box
        className="banner-content"
        sx={{
          background: isDarkMode 
            ? 'linear-gradient(45deg, #f5f5f5 30%, #ffffff 90%)'
            : 'linear-gradient(45deg, #1a1a1a 30%, #2d2d2d 90%)',
          borderBottom: isDarkMode
            ? '1px solid rgba(0, 0, 0, 0.12)'
            : '1px solid rgba(255, 255, 255, 0.12)',
          width: '100%',
          margin: 0
        }}
      >
        {/* Left side - About and Version */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-start',
          minWidth: '100px'
        }}>
          <Typography
            component="span"
            sx={{
              color: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.875rem',
              cursor: 'pointer',
              '&:hover': {
                color: '#D50032',
                textShadow: '0 0 8px rgba(213, 0, 50, 0.4)'
              }
            }}
            onClick={() => setAboutOpen(true)}
          >
            About
          </Typography>
          <Typography
            sx={{
              fontSize: '0.875rem',
              color: COLORS.textDark,
              opacity: 0.7
            }}
          >
            v{version}
          </Typography>
        </Box>

        {/* Center - Logo */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1200
          }}
        >
          <Box
            component="img"
            src={isDarkMode ? '/images/HEXTRA-3-logo-Wht.svg' : '/images/HEXTRA-3-logo-Blk.svg'}
            alt="HEXTRA-3"
            sx={{
              height: '90px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              marginTop: '-8px'
            }}
          />
        </Box>

        {/* Right side - Controls */}
        <Box sx={{ 
          minWidth: '120px', 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 2,
          marginRight: '24px'
        }}>
          {/* Theme Toggle */}
          <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <GlowIconButton
              onClick={onThemeToggle}
              sx={{ 
                width: '40px',
                height: '40px',
                color: isDarkMode ? '#1a1a1a' : '#FED141',
                backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.1)' : 'rgba(254, 209, 65, 0.1)',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.2)' : 'rgba(254, 209, 65, 0.2)',
                }
              }}
            >
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </GlowIconButton>
          </Tooltip>

          {/* T-shirt Status Badge / Sign Up CTA */}
          <Tooltip title={!isAuthenticated ? "Single Shirt Only" : "Full Access"}>
            <GlowIconButton
              onClick={() => {
                if (!isAuthenticated) {
                  login();
                }
              }}
              sx={{ 
                width: '40px',
                height: '40px',
                position: 'relative',
                color: isDarkMode ? '#1a1a1a' : '#FFFFFF',
                '& img': {
                  filter: isDarkMode ? 'none' : 'invert(1)'
                },
                ...(isAuthenticated && {
                  backgroundColor: 'rgba(0, 128, 94, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 128, 94, 0.1)',
                    cursor: 'default'
                  }
                })
              }}
            >
              {/* Show single t-shirt for non-members, multi-shirt for members */}
              <Box
                component="img"
                src={isAuthenticated ? "/images/tshirts-icon.svg" : "/images/tshirt-icon.svg"}
                alt={isAuthenticated ? "Full Access" : "Single Shirt Only"}
                sx={{
                  width: '24px',
                  height: '24px'
                }}
              />
            </GlowIconButton>
          </Tooltip>

          {/* Account Button (only shown when authenticated) */}
          {isAuthenticated && (
            <Tooltip 
              title={
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.given_name} {user?.family_name}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    {user?.email}
                  </Typography>
                </Box>
              }
            >
              <GlowIconButton
                onClick={() => setShowSubscriptionTest(true)}
                sx={{ 
                  width: '40px',
                  height: '40px',
                  backgroundColor: userColor,
                  color: '#FFFFFF',
                  fontFamily: "'League Spartan', sans-serif",
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: userColor,
                    opacity: 0.9,
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {userInitial}
              </GlowIconButton>
            </Tooltip>
          )}

          {/* Login/Logout Button */}
          {!isAuthenticated && (
            <Tooltip title="Sign in">
              <GlowIconButton
                onClick={() => login()}
                sx={{ 
                  width: '40px',
                  height: '40px'
                }}
              >
                <AccountCircleIcon />
              </GlowIconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <AboutDialog
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        version={`v${version}`}
      >
        <Typography variant="body2" sx={{ mb: 1, color: 'var(--text-secondary)' }}>
          Version {version}
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
          2024 HEXTRA Color System. All rights reserved.
        </Typography>
      </AboutDialog>
    </Box>
  );
};

export default Banner;
