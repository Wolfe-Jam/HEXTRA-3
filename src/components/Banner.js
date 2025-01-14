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
        height: '50px',
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
      <Typography
        sx={{
          fontSize: '1.25rem',
          fontWeight: 600,
          letterSpacing: '0.5px',
          color: 'var(--text-primary)',
          fontFamily: "'League Spartan', sans-serif"
        }}
      >
        HEXTRA-3
      </Typography>

      {/* Theme toggle */}
      <IconButton
        onClick={onThemeToggle}
        sx={{
          color: 'var(--text-primary)',
          padding: '8px',
          '&:hover': {
            backgroundColor: 'var(--button-hover)'
          }
        }}
      >
        <ThemeToggleIcon isDark={isDarkMode} />
      </IconButton>
    </Box>
  );
};

export default Banner;
