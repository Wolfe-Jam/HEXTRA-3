import React, { useState } from 'react';
import { Box, Typography, IconButton, Button } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AboutDialog from './AboutDialog';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { VERSION } from '../version';
import GlowTextButton from './GlowTextButton'; // Assuming GlowTextButton is defined in this file

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

        {/* Right side - Theme Toggle and Login/Logout */}
        <Box sx={{ 
          minWidth: '200px', 
          display: 'flex', 
          justifyContent: 'flex-end',
          marginRight: '24px'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isAuthenticated && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GlowTextButton
                  onClick={() => setIsBatchMode(!isBatchMode)}
                  active={isBatchMode}
                >
                  {isBatchMode ? 'Single Mode' : 'Batch Mode'}
                </GlowTextButton>

                <GlowTextButton
                  onClick={() => setShowSubscriptionTest(true)}
                >
                  Subscription Test
                </GlowTextButton>
              </Box>
            )}
            {isAuthenticated ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography sx={{ color: COLORS.textDark }}>
                  {user?.email}
                </Typography>
                <Button 
                  variant="outlined" 
                  color="primary"
                  onClick={handleLogout}
                  sx={{ 
                    borderColor: '#333',
                    color: COLORS.textDark,
                    '&:hover': {
                      borderColor: '#444',
                      backgroundColor: 'rgba(255,255,255,0.05)'
                    }
                  }}
                >
                  Logout
                </Button>
              </Box>
            ) : (
              <Button 
                variant="text" 
                onClick={scrollToBatch}
                sx={{ 
                  color: 'rgba(128, 128, 128, 0.5)',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'rgba(128, 128, 128, 0.7)'
                  }
                }}
              >
                Login
              </Button>
            )}
          </Box>
          <IconButton
            onClick={onThemeToggle}
            sx={{
              width: '42px',
              height: '42px',
              color: COLORS.textDark,
              padding: '4px', // Adjusted padding
              marginLeft: '16px', // Added specific left margin
              border: '1px solid transparent',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'transparent',
                borderColor: '#FED141',
                color: '#FED141',
                boxShadow: `0 0 0 3px ${isDarkMode ? 'rgba(254, 209, 65, 0.2)' : 'rgba(254, 209, 65, 0.25)'}`,
                transform: 'scale(1.05)'
              }
            }}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
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
