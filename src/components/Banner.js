import React, { useState } from 'react';
import { Box, Typography, Tooltip, Link } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import GlowIconButton from './GlowIconButton';
import HextraClub from './HextraClub';
import AboutDialog from './AboutDialog';

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
  const [aboutOpen, setAboutOpen] = useState(false);

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
        bgcolor: 'var(--bg-banner)',
        borderBottom: '1px solid var(--border-color)',
        zIndex: 1000,
        transition: 'background-color 0.3s, border-color 0.3s',
        '& .MuiSvgIcon-root': {
          transition: 'color 0.3s'
        }
      }}>
        {/* Left side - Logo and Version */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Box 
            component="img" 
            src={isDarkMode ? '/images/HEXTRA-3-logo-Wht.svg' : '/images/HEXTRA-3-logo-Blk.svg'}
            alt="HEXTRA"
            sx={{ 
              height: 24,
              transition: 'filter 0.3s'
            }} 
          />
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Link
              component="button"
              variant="body2"
              onClick={() => setAboutOpen(true)}
              sx={{
                color: 'var(--text-secondary)',
                textAlign: 'left',
                textDecoration: 'none',
                transition: 'color 0.3s',
                '&:hover': {
                  color: '#D50032',
                  textDecoration: 'none'
                }
              }}
            >
              About
            </Link>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'var(--text-secondary)',
                opacity: 0.7,
                transition: 'color 0.3s'
              }}
            >
              v{version}
            </Typography>
          </Box>
        </Box>

        {/* Right side - Controls */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          '& > *': {
            width: 40,
            height: 40,
            borderRadius: '50%',
            transition: 'all 0.3s'
          }
        }}>
          {/* Theme Toggle */}
          <GlowIconButton 
            onClick={onThemeToggle}
            sx={{
              color: 'var(--text-primary)',
              bgcolor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              '&:hover': {
                bgcolor: 'var(--hover-bg)',
                borderColor: 'var(--primary-hover)'
              }
            }}
          >
            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </GlowIconButton>

          {/* T-shirt Status */}
          <Tooltip title={isAuthenticated ? "Full Access" : "Single Shirt Only"}>
            <GlowIconButton
              onClick={() => {
                if (!isAuthenticated) {
                  localStorage.setItem('returnTo', window.location.pathname + window.location.hash);
                  login();
                }
              }}
              sx={{
                color: 'var(--text-primary)',
                bgcolor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                position: 'relative',
                '&:hover': {
                  bgcolor: 'var(--hover-bg)',
                  borderColor: 'var(--primary-hover)'
                },
                ...(isAuthenticated && {
                  bgcolor: 'rgba(0, 128, 94, 0.1)',
                  borderColor: '#00805E',
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
                  filter: isDarkMode ? 'none' : 'invert(1)',
                  transition: 'filter 0.3s'
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
                  bgcolor: '#D50032',
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
              onClick={() => {
                localStorage.setItem('returnTo', window.location.pathname + window.location.hash);
                login();
              }}
              sx={{
                bgcolor: '#D50032',
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

      {/* About Dialog */}
      <AboutDialog
        open={aboutOpen}
        onClose={() => setAboutOpen(false)}
        version={version}
      />
    </>
  );
};

export default Banner;
