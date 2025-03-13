import React, { useState, useMemo, useEffect, useContext, useTransition } from 'react';
import { Box, Typography, IconButton, Button, Tooltip, Divider, Menu, MenuItem, ListItemIcon } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AboutDialog from './AboutDialog';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { VERSION } from '../version';
import GlowIconButton from './GlowIconButton';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const [emailUser, setEmailUser] = useState(null);

  // Load email user from localStorage if available
  useEffect(() => {
    const savedEmailUser = localStorage.getItem('hextra_email_user');
    if (savedEmailUser) {
      try {
        setEmailUser(JSON.parse(savedEmailUser));
      } catch (error) {
        console.error('Failed to parse saved email user data:', error);
      }
    }
  }, []);

  const userInitial = useMemo(() => {
    if (isAuthenticated && user?.given_name) {
      return user.given_name[0].toUpperCase();
    } else if (emailUser?.email) {
      return emailUser.email[0].toUpperCase();
    }
    return 'F'; // F for Free user
  }, [isAuthenticated, user?.given_name, emailUser?.email]);

  const userColor = useMemo(() => {
    if (isAuthenticated && user?.email) {
      const index = user.email.length % BRAND_COLORS.length;
      return BRAND_COLORS[1]; // Green for authenticated users
    } else if (emailUser?.email) {
      return BRAND_COLORS[0]; // Red for email-only users
    }
    return BRAND_COLORS[0]; // Red for anonymous users
  }, [isAuthenticated, user?.email, emailUser?.email]);

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
            marginTop: '-5px'
          }}
        >
          <Box
            component="img"
            src={isDarkMode ? '/images/HEXTRA-3-logo-Wht.svg' : '/images/HEXTRA-3-logo-Blk.svg'}
            alt="HEXTRA-3"
            onClick={() => startTransition(() => navigate('/app'))}
            sx={{
              height: '90px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              position: 'relative',
              cursor: 'pointer',
              transition: 'transform 0.2s ease-in-out',
              '&:hover': {
                transform: 'scale(1.03)'
              }
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
          {/* Theme Toggle - Simple black/white disc */}
          <Tooltip title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}>
            <IconButton 
              onClick={onThemeToggle}
              sx={{
                width: '32px',
                height: '32px',
                position: 'relative',
                padding: 0,
                overflow: 'hidden',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            >
              <Box
                sx={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid rgba(128, 128, 128, 0.5)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '200%',
                    height: '200%',
                    top: '-50%',
                    left: '-50%',
                    background: `linear-gradient(135deg, 
                      ${isDarkMode ? '#ffffff' : '#000000'} 0%, 
                      ${isDarkMode ? '#ffffff' : '#000000'} 49%, 
                      ${isDarkMode ? '#000000' : '#ffffff'} 51%, 
                      ${isDarkMode ? '#000000' : '#ffffff'} 100%)`,
                    transformOrigin: 'center',
                  }
                }}
              />
            </IconButton>
          </Tooltip>

          {/* Unified User Status / Subscription Button */}
          {isAuthenticated ? (
            <Tooltip title={`PRO User: ${user?.email || 'Authenticated'}`}>
              <GlowIconButton
                onClick={() => startTransition(() => navigate('/profile'))}
                sx={{
                  width: '32px',
                  height: '32px',
                  position: 'relative',
                  backgroundColor: BRAND_COLORS[2], // Blue #224D8F for PRO users
                  color: '#FFFFFF',
                  fontFamily: "'League Spartan', sans-serif",
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  '&:hover': {
                    backgroundColor: '#1A3B6D', // Darker blue on hover
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {/* Crown symbol for PRO users */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: '-1px', 
                  right: '-1px', 
                  width: '12px', 
                  height: '12px',
                  fontSize: '12px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFC700',
                }}>
                  ♔
                </Box>
                {userInitial}
              </GlowIconButton>
            </Tooltip>
          ) : emailUser ? (
            <Tooltip title={`Early Bird User: ${emailUser.email || 'Email User'}`}>
              <GlowIconButton
                onClick={() => startTransition(() => {
                  if (isSubscriptionPage) {
                    const availablePlansSection = document.getElementById('available-plans');
                    if (availablePlansSection) {
                      availablePlansSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    navigate('/subscription#available-plans');
                  }
                })}
                sx={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: BRAND_COLORS[1], // Green #00805E for Early Bird users
                  color: '#FFFFFF',
                  fontFamily: "'League Spartan', sans-serif",
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  '&:hover': {
                    backgroundColor: '#006F51', // Darker green on hover
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {/* Leaf symbol for Early Bird users */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: '-1px', 
                  right: '-1px', 
                  width: '12px', 
                  height: '12px',
                  fontSize: '12px',
                  lineHeight: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#CCFF90',
                }}>
                  ☘
                </Box>
                {userInitial}
              </GlowIconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Free Version - Sign Up for More Features">  
              <GlowIconButton
                onClick={() => startTransition(() => {
                  if (isSubscriptionPage) {
                    const availablePlansSection = document.getElementById('available-plans');
                    if (availablePlansSection) {
                      availablePlansSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  } else {
                    navigate('/subscription#available-plans');
                  }
                })}
                sx={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: BRAND_COLORS[0], // Red #D50032 for free users
                  color: '#FFFFFF',
                  fontFamily: "'League Spartan', sans-serif",
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  '&:hover': {
                    backgroundColor: '#B3002B', // Darker red on hover
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {/* No badge for free version */}
                F
              </GlowIconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <AboutDialog
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        version={version}
        buildId={'HEXTRA-2025-03-12-MC2250'}
        buildDate={'2025-03-12'}
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
