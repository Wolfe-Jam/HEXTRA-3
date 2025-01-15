import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const Banner = ({ version, isDarkMode, onThemeToggle }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start', 
        padding: '8px 16px 0', 
        backgroundColor: isDarkMode ? '#ffffff' : '#000000',
        borderBottom: `1px solid ${isDarkMode ? '#000000' : '#ffffff'}`,
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
          color: isDarkMode ? '#000000' : '#ffffff',
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
          color: isDarkMode ? '#000000' : '#ffffff',
          padding: '8px',
          marginTop: '8px', 
          '&:hover': {
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)'
          }
        }}
      >
        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Box>
  );
};

export default Banner;
