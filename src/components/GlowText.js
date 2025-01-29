import React from 'react';
import { Button } from '@mui/material';

const GlowText = ({ children, onClick, isDarkMode, variant = 'contained' }) => {
  const getColors = () => {
    if (isDarkMode) {
      return {
        text: variant === 'contained' ? '#000000' : '#ffffff',
        glow: '#FED141',
        border: variant === 'contained' ? '#000000' : '#ffffff',
        background: variant === 'contained' ? '#ffffff' : 'transparent'
      };
    }
    return {
      text: variant === 'contained' ? '#ffffff' : '#000000',
      glow: '#FED141',
      border: variant === 'contained' ? '#ffffff' : '#000000',
      background: variant === 'contained' ? '#000000' : 'transparent'
    };
  };

  const colors = getColors();

  return (
    <Button
      onClick={onClick}
      variant={variant}
      sx={{
        color: colors.text,
        backgroundColor: colors.background,
        borderColor: colors.border,
        borderWidth: '1px',
        borderStyle: 'solid',
        fontWeight: 500,
        padding: '6px 16px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: colors.background,
          borderColor: colors.glow,
          color: colors.glow,
          boxShadow: `0 0 8px ${colors.glow}40`,
        }
      }}
    >
      {children}
    </Button>
  );
};

export default GlowText;
