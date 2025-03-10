import React, { useState, useMemo, useEffect, useContext, useTransition } from 'react';
import { Box, Typography, IconButton, Button, Tooltip, Divider, Menu, MenuItem, ListItemIcon } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AboutDialog from './AboutDialog';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { VERSION } from '../version';
import GlowIconButton from './GlowIconButton';
import { useNavigate, useLocation } from 'react-router-dom';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import HomeIcon from '@mui/icons-material/Home';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';

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
  const navigate = useNavigate();
  const location = useLocation();
  const isSubscriptionPage = location.pathname === '/subscription' || location.pathname === '/';
  const [isPending, startTransition] = useTransition();

  const userInitial = useMemo(() => {
    return user?.given_name ? user.given_name[0].toUpperCase() : '?';
  }, [user?.given_name]);

  const userColor = useMemo(() => {
    if (!user?.email) return BRAND_COLORS[0];
    const index = user.email.length % BRAND_COLORS.length;
    return BRAND_COLORS[index];
  }, [user?.email]);

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

  const handleLogout = () => {
    const batchSection = document.querySelector('.batch-processing-section');
    if (batchSection) {
      batchSection.scrollIntoView({ behavior: 'smooth' });
    }

    setTimeout(() => {
      logout({
        post_logout_redirect_uri: `${window.location.origin}/#batch-section`
      });
    }, 800); 
  };

  const scrollToBatch = () => {
    const batchSection = document.querySelector('.batch-processing-section');
    if (batchSection) {
      batchSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const COLORS = {
    textDark: 'rgba(255, 255, 255, 0.7)',
    textLight: 'rgba(0, 0, 0, 0.7)'
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
              color: isDarkMode ? COLORS.textLight : COLORS.textDark,
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
          {/* User Email or Subscription Prompt */}
          <Typography
            component="span"
            sx={{
              color: isDarkMode ? COLORS.textLight : COLORS.textDark,
              fontSize: '0.7rem',
              fontStyle: isAuthenticated ? 'normal' : 'italic',
              cursor: isAuthenticated ? 'default' : 'pointer',
              mt: 0.5,
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              '&:hover': {
                color: isAuthenticated ? (isDarkMode ? COLORS.textLight : COLORS.textDark) : '#FED141',
                textDecoration: isAuthenticated ? 'none' : 'underline'
              }
            }}
            onClick={() => {
              if (!isAuthenticated) {
                startTransition(() => {
                  navigate('/subscription#available-plans');
                });
              }
            }}
          >
            {isAuthenticated && user?.email ? user.email : 'Subscribe for premium features'}
          </Typography>
        </Box>

        {/* Center - Logo */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            zIndex: 1100,
            marginTop: '-5px',
            pointerEvents: 'none'
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
              position: 'relative',
              pointerEvents: 'none'
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
          <Tooltip title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
            <IconButton 
              onClick={onThemeToggle}
              sx={{
                width: '32px',
                height: '32px',
                color: isDarkMode ? COLORS.textLight : COLORS.textDark,
                '&:hover': {
                  color: '#FED141',
                }
              }}
            >
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>

          {/* T-shirt Status Badge / Sign Up CTA */}
          <Tooltip title={!isAuthenticated ? "View Subscription Options" : "Manage Subscription"}>
            <GlowIconButton
              onClick={() => {
                startTransition(() => {
                  if (isSubscriptionPage) {
                    // If already on subscription page, just scroll to available plans
                    const availablePlansSection = document.getElementById('available-plans');
                    if (availablePlansSection) {
                      availablePlansSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    // Navigate to subscription page with hash for available plans
                    navigate('/subscription#available-plans');
                  }
                });
              }}
              sx={{ 
                width: '32px',
                height: '32px',
                position: 'relative',
                color: isDarkMode ? COLORS.textLight : COLORS.textDark,
                '&:hover': {
                  color: '#FED141',
                }
              }}
            >
              <Box
                component="img"
                src={isAuthenticated ? "/images/tshirts-icon.svg" : "/images/tshirt-icon.svg"}
                alt={isAuthenticated ? "Manage Subscription" : "View Subscription Options"}
                sx={{
                  width: '20px',
                  height: '20px',
                  filter: !isDarkMode ? 'brightness(0) invert(1)' : 'none'
                }}
              />
            </GlowIconButton>
          </Tooltip>

          {/* Subscription Button - Always visible */}
          <Tooltip title={isSubscriptionPage ? "Return to App" : "View Subscription Plans"}>
            <IconButton
              onClick={() => startTransition(() => {
                isSubscriptionPage ? navigate('/app') : navigate('/subscription');
              })}
              sx={{
                width: '32px',
                height: '32px',
                position: 'relative',
                color: isDarkMode ? COLORS.textLight : COLORS.textDark,
                '&:hover': {
                  color: '#FED141',
                }
              }}
            >
              {isSubscriptionPage ? <HomeIcon fontSize="small" /> : <SubscriptionsIcon />}
            </IconButton>
          </Tooltip>

          {/* Account Button (always visible) */}
          <Tooltip title={isAuthenticated ? user?.email : "Free Version"}>
            {isAuthenticated ? (
              <IconButton
                onClick={() => startTransition(() => navigate('/profile'))}
                sx={{
                  width: '32px',
                  height: '32px',
                  color: isDarkMode ? COLORS.textLight : COLORS.textDark,
                  '&:hover': {
                    color: '#FED141',
                  }
                }}
              >
                <AccountCircleIcon />
              </IconButton>
            ) : (
              <GlowIconButton
                onClick={() => startTransition(() => login())}
                sx={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#D50032', // HEXTRA Red
                  color: '#FFFFFF',
                  fontFamily: "'League Spartan', sans-serif",
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: '#B3002B',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                F
              </GlowIconButton>
            )}
          </Tooltip>
        </Box>
      </Box>

      <AboutDialog
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        version={version}
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
        <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? COLORS.textLight : COLORS.textDark }}>
          Transform your images with vibrant, customizable colors
        </Typography>

        <Typography variant="h6" className="visualize-header" sx={{ mb: 1 }}>
          VISUALIZE
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? COLORS.textLight : COLORS.textDark }}>
          See your designs come to life in real-time
        </Typography>

        <Typography variant="h6" className="mesmerize-header" sx={{ mb: 1 }}>
          MESMERIZE
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: isDarkMode ? COLORS.textLight : COLORS.textDark }}>
          Create stunning effects that captivate and inspire
        </Typography>

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Version {version}
        </Typography>
        <Typography variant="body2" sx={{ color: isDarkMode ? COLORS.textLight : COLORS.textDark }}>
          2024 HEXTRA Color System. All rights reserved.
        </Typography>
      </AboutDialog>
    </Box>
  );
};

export default Banner;
