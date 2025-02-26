import React, { useState, useMemo, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { Box, Typography, IconButton, Button, Tooltip } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
// eslint-disable-next-line no-unused-vars
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AboutDialog from './AboutDialog';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
// eslint-disable-next-line no-unused-vars
import { VERSION } from '../version';
import GlowIconButton from './GlowIconButton';
import { useNavigate } from 'react-router-dom';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';

const BRAND_COLORS = ['#D50032', '#00805E', '#224D8F'];  // Red, Green, Blue

const Banner = ({
  version,
  isDarkMode = false,
  onThemeToggle,
  isBatchMode,
  setIsBatchMode,
  setShowSubscriptionTest
}) => {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, login, logout } = useKindeAuth();
  // eslint-disable-next-line no-unused-vars
  const navigate = useNavigate();

  // Calculate user initials and color once
  const userInitial = useMemo(() => {
    return user?.given_name ? user.given_name[0].toUpperCase() : '?';
  }, [user?.given_name]);

  const userColor = useMemo(() => {
    if (!user?.email) return BRAND_COLORS[0];
    const index = user.email.length % BRAND_COLORS.length;
    return BRAND_COLORS[index];
  }, [user?.email]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 0;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // eslint-disable-next-line no-unused-vars
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

  // eslint-disable-next-line no-unused-vars
  const scrollToBatch = () => {
    const batchSection = document.querySelector('.batch-processing-section');
    if (batchSection) {
      batchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // eslint-disable-next-line no-unused-vars
  const COLORS = {
    textDark: 'rgba(255, 255, 255, 0.7)',
    textLight: 'rgba(255, 255, 255, 0.7)'
  };

  return (
    <Box
      className="app-banner"
      sx={{
        width: '100%',
        margin: 0,
        padding: 0,
        overflow: 'visible',
        height: '40px',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}
    >
      <Box
        className="banner-content"
        sx={{
          background: isDarkMode 
            ? 'linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)'
            : 'linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 100%)',
          borderBottom: isDarkMode
            ? '1px solid rgba(0, 0, 0, 0.12)'
            : '1px solid rgba(255, 255, 255, 0.12)',
          width: '100%',
          display: 'flex',
          height: '62px',
          margin: 0,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          position: 'relative',
          padding: 0,
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '22px',
            background: 'inherit',
            borderBottom: 'inherit',
            zIndex: 1050
          }
        }}
      >
        {/* Left side - About and Version */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-start',
          minWidth: '140px',
          position: 'relative',
          zIndex: 1200,
          mt: 1,
          ml: 3
        }}>
          <Typography
            component="span"
            sx={{
              color: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              '&:hover': {
                color: '#FED141',
                textShadow: '0 0 8px rgba(254, 209, 65, 0.4)'
              }
            }}
            onClick={() => setAboutOpen(true)}
          >
            About • v{version}
          </Typography>
        </Box>

        {/* Center - Logo */}
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
            marginTop: '-5px'
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
              display: 'block'
            }}
          />
        </Box>

        {/* Right side - Controls */}
        <Box sx={{ 
          minWidth: '140px', 
          display: 'flex', 
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: 1.5,
          position: 'relative',
          zIndex: 1200,
          mr: 2,
          transform: 'translateX(-8px)',
          mt: 1.5
        }}>
          {/* Theme Toggle */}
          <Tooltip title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
            <GlowIconButton
              onClick={onThemeToggle}
              sx={{ 
                width: '32px',
                height: '32px',
                color: isDarkMode ? '#FED141' : '#FFFFFF',
                backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(26, 26, 26, 0.2)' : 'rgba(255, 255, 255, 0.2)',
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
                width: '32px',
                height: '32px',
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
                  width: '20px',
                  height: '20px'
                }}
              />
            </GlowIconButton>
          </Tooltip>

          {/* Subscription Button - Always visible */}
          <Tooltip title="View Subscription Plans">
            <GlowIconButton
              onClick={() => navigate('/subscription')}
              sx={{ 
                width: '32px',
                height: '32px',
                color: isDarkMode ? '#1a1a1a' : '#FFFFFF',
                backgroundColor: isDarkMode ? 'rgba(213, 0, 50, 0.1)' : 'rgba(213, 0, 50, 0.3)',
                '&:hover': {
                  backgroundColor: isDarkMode ? 'rgba(213, 0, 50, 0.2)' : 'rgba(213, 0, 50, 0.4)',
                }
              }}
            >
              <SubscriptionsIcon fontSize="small" />
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
                onClick={() => navigate('/subscription')}
                sx={{ 
                  width: '32px',
                  height: '32px',
                  backgroundColor: userColor,
                  color: isDarkMode ? '#1a1a1a' : '#FFFFFF',
                  fontFamily: "'League Spartan', sans-serif",
                  fontSize: '1rem',
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
        </Box>
      </Box>

      <AboutDialog
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        version={`v${version}`}
        PaperProps={{
          sx: {
            bgcolor: isDarkMode ? '#1a1a1a' : '#FFFFFF',
            color: isDarkMode ? '#FFFFFF' : '#1a1a1a',
            '& .MuiIconButton-root': {
              color: isDarkMode ? '#1a1a1a' : '#FFFFFF',
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(26, 26, 26, 0.1)',
              '&:hover': {
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.9)' : 'rgba(26, 26, 26, 0.2)'
              }
            },
            '& .colorize-header': {
              color: isDarkMode ? '#FF3B30' : '#FF3B30' // Red
            },
            '& .visualize-header': {
              color: isDarkMode ? '#34C759' : '#34C759' // Green
            },
            '& .mesmerize-header': {
              color: isDarkMode ? '#007AFF' : '#007AFF' // Blue
            }
          }
        }}
      >
        <Typography variant="h6" className="colorize-header" sx={{ mb: 1 }}>
          COLORIZE
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}>
          Transform your images with vibrant, customizable colors
        </Typography>

        <Typography variant="h6" className="visualize-header" sx={{ mb: 1 }}>
          VISUALIZE
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}>
          See your designs come to life in real-time
        </Typography>

        <Typography variant="h6" className="mesmerize-header" sx={{ mb: 1 }}>
          MESMERIZE
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}>
          Create stunning effects that captivate and inspire
        </Typography>

        <Typography variant="body2" sx={{ mb: 1, color: isDarkMode ? '#FFFFFF' : '#1a1a1a' }}>
          Version {version}
        </Typography>
        <Typography variant="body2" sx={{ color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.7)' }}>
          2024 HEXTRA Color System. All rights reserved.
        </Typography>
      </AboutDialog>
    </Box>
  );
};

export default Banner;
