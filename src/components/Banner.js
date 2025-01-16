import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const Banner = ({ version, isDarkMode, onThemeToggle }) => {
  const COLORS = {
    dark: '#141414',    // RGB(20,20,20)
    light: '#F8F8F8',   // Soft white
    textDark: '#141414',
    textLight: '#F8F8F8'
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start', 
        padding: '8px 16px 0', 
        backgroundColor: isDarkMode ? COLORS.light : COLORS.dark,
        borderBottom: `1px solid ${isDarkMode ? COLORS.dark : COLORS.light}`,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px', 
        zIndex: 1100,
        transition: 'background-color 0.3s, border-color 0.3s',
        overflow: 'visible' 
      }}
    >
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: isDarkMode ? COLORS.textDark : COLORS.textLight,
          fontFamily: "'Inter', sans-serif",
          marginTop: '8px' 
        }}
      >
        v{version}
      </Typography>

      {/* Logo with overflow */}
      <Box
        component="img"
        src={isDarkMode ? '/images/HEXTRA-3-logo-Wht.svg' : '/images/HEXTRA-3-logo-Blk.svg'}
        alt="HEXTRA-3"
        sx={{
          height: '90px',
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          marginTop: '-8px', 
          position: 'relative', 
          zIndex: 1200
        }}
      />
      
      <IconButton
        onClick={onThemeToggle}
        sx={{
          width: '42px',
          height: '42px',
          color: isDarkMode ? COLORS.textDark : COLORS.textLight,
          padding: '8px',
          marginTop: '8px',
          border: '1px solid transparent',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'transparent',
            borderColor: '#FED141',
            color: '#FED141',
            boxShadow: `0 0 0 3px ${isDarkMode ? 'rgba(254, 209, 65, 0.25)' : 'rgba(254, 209, 65, 0.2)'}`,
            transform: 'scale(1.05)'
          }
        }}
      >
        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Box>
  );
};

export default Banner;
