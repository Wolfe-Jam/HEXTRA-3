import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AboutDialog from './AboutDialog';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import GlowText from './GlowText';
import { useNavigate } from 'react-router-dom';

const Banner = ({ isDarkMode, onThemeToggle }) => {
  const navigate = useNavigate();
  const [aboutOpen, setAboutOpen] = useState(false);
  const { isAuthenticated, user, login, logout } = useKindeAuth();

  const handleLogout = () => {
    logout({
      post_logout_redirect_uri: process.env.REACT_APP_KINDE_DOMAIN
    });
  };

  const handleStripeTest = (e) => {
    e.preventDefault();
    navigate('/stripe-test');
  };

  const COLORS = {
    textDark: '#E8E8E8',
    textLight: '#F8F8F8'
  };

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
            component="span"
            sx={{
              marginTop: '8px',
              fontSize: '0.875rem',
              color: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              '&:hover': {
                color: '#FED141',
                textShadow: '0 0 8px rgba(254, 209, 65, 0.4)'
              }
            }}
            onClick={handleStripeTest}
          >
            Test Stripe
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
          <GlowText
            text="HEXTRA"
            sx={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: isDarkMode ? '#000' : '#fff',
              cursor: 'default'
            }}
          />
        </Box>

        {/* Right side - Theme Toggle and Auth */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            onClick={onThemeToggle}
            sx={{
              color: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                color: isDarkMode ? '#000' : '#fff'
              }
            }}
          >
            {isDarkMode ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          
          {isAuthenticated ? (
            <Typography
              component="span"
              sx={{
                color: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                '&:hover': {
                  color: isDarkMode ? '#000' : '#fff'
                }
              }}
              onClick={handleLogout}
            >
              Logout
            </Typography>
          ) : (
            <Typography
              component="span"
              sx={{
                color: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.875rem',
                cursor: 'pointer',
                '&:hover': {
                  color: isDarkMode ? '#000' : '#fff'
                }
              }}
              onClick={() => login()}
            >
              Login
            </Typography>
          )}
        </Box>
      </Box>
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </Box>
  );
};

export default Banner;
