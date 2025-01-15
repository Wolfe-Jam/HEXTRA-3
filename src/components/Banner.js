import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ThemeToggleIcon from './ThemeToggleIcon';

const Banner = ({ version, isDarkMode, onThemeToggle }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 1100,
        transition: 'background-color 0.3s, border-color 0.3s'
      }}
    >
      {/* Version number */}
      <Typography
        sx={{
          fontSize: '0.875rem',
          color: 'var(--text-primary)'
        }}
      >
        v{version}
      </Typography>

      {/* Logo */}
      <Box
        component="img"
        src={isDarkMode ? '/images/HEXTRA-3-logo-Blk.svg' : '/images/HEXTRA-3-logo-Wht.svg'}
        alt="HEXTRA-3"
        sx={{
          height: '90px',
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
          paddingTop: '9px',
          zIndex: 1200
        }}
      />

      {/* Theme toggle */}
      <IconButton
        onClick={onThemeToggle}
        sx={{
          color: 'var(--text-primary)',
          '&:hover': {
            backgroundColor: 'var(--button-hover)'
          }
        }}
      >
        <ThemeToggleIcon isDarkMode={isDarkMode} />
      </IconButton>
    </Box>
  );
};

export default Banner;
